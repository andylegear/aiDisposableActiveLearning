#!/usr/bin/env python3
"""
extended_efficiency.py — Analysis G: Development Efficiency

Analyses development time, lines of code, AI generation ratios, and WakaTime
telemetry to characterise the effort required to produce disposable educational
software with AI assistance.

Usage:
    python analysis/extended_efficiency.py
    python analysis/extended_efficiency.py --verbose
"""

import argparse
import sys
from pathlib import Path

import numpy as np
from tabulate import tabulate

sys.path.insert(0, str(Path(__file__).resolve().parent))
from data_loader import (
    ARTIFACT_SLUGS, ARTIFACT_NAMES,
    load_registry_artifacts, load_dsqi_files, load_session_logs,
    load_wakatime_logs, save_json, ensure_output_dirs, OUTPUT_DIR, FIGURES_DIR,
)


def run(verbose=False, figures=True):
    ensure_output_dirs()

    registry = load_registry_artifacts()
    dsqi_files = load_dsqi_files()
    session_logs = load_session_logs()
    wakatime_logs = load_wakatime_logs()

    results = {"artifacts": [], "aggregate": {}, "efficiency_ratios": []}

    print("╔══════════════════════════════════════════════════════════╗")
    print("║  Analysis G — Development Efficiency                     ║")
    print("╚══════════════════════════════════════════════════════════╝")
    print()

    dev_times = []
    loc_values = []
    complexities = []
    dsqi_scores = []

    for slug in ARTIFACT_SLUGS:
        reg = next((a for a in registry if a["slug"] == slug), None)
        dsqi = dsqi_files.get(slug, {})

        if not reg:
            continue

        dev = reg["development"]
        wall_clock_min = dev["total_duration_minutes"]
        loc = dev["lines_of_code"]
        ai_ratio = dev["ai_generation_ratio"]
        dep_count = dev["dependency_count"]
        wakatime_sec = dev.get("wakatime_active_seconds", 0)

        # Complexity from DSQI raw metrics
        raw_metrics = dsqi.get("raw_metrics", {})
        complexity = raw_metrics.get("complexity", {}).get("overall_average", None)

        # CLOC breakdown
        cloc = raw_metrics.get("cloc", {})
        cloc_summary = {}
        for lang in ["JavaScript", "CSS", "HTML", "Python"]:
            if lang in cloc:
                cloc_summary[lang] = cloc[lang].get("code", 0)

        # Idle ratio: proportion of wall-clock time not spent actively coding
        wall_clock_sec = wall_clock_min * 60
        idle_ratio = 1 - (wakatime_sec / wall_clock_sec) if wall_clock_sec > 0 else None

        # Lines per minute
        loc_per_min = loc / wall_clock_min if wall_clock_min > 0 else None

        dsqi_score = reg["evaluation"]["dsqi_score"]

        entry = {
            "artifact_id": slug,
            "name": ARTIFACT_NAMES[slug],
            "wall_clock_minutes": wall_clock_min,
            "wakatime_active_seconds": round(wakatime_sec, 1),
            "idle_ratio": round(idle_ratio, 4) if idle_ratio is not None else None,
            "lines_of_code": loc,
            "loc_per_minute": round(loc_per_min, 1) if loc_per_min else None,
            "ai_generation_ratio": ai_ratio,
            "dependency_count": dep_count,
            "cyclomatic_complexity_avg": complexity,
            "cloc_breakdown": cloc_summary,
            "dsqi_score": dsqi_score,
        }
        results["artifacts"].append(entry)

        dev_times.append(wall_clock_min)
        loc_values.append(loc)
        if complexity:
            complexities.append(complexity)
        dsqi_scores.append(dsqi_score)

    # ── Aggregate ──
    results["aggregate"] = {
        "total_development_minutes": sum(dev_times),
        "total_lines_of_code": sum(loc_values),
        "mean_dev_time_min": round(float(np.mean(dev_times)), 1),
        "sd_dev_time_min": round(float(np.std(dev_times, ddof=1)), 1) if len(dev_times) > 1 else 0,
        "mean_loc": round(float(np.mean(loc_values)), 0),
        "sd_loc": round(float(np.std(loc_values, ddof=1)), 0) if len(loc_values) > 1 else 0,
        "mean_complexity": round(float(np.mean(complexities)), 2) if complexities else None,
        "mean_dsqi": round(float(np.mean(dsqi_scores)), 4),
    }

    # ── Efficiency ratios ──
    try:
        from scipy.stats import spearmanr

        # Dev time vs DSQI score
        rho, p = spearmanr(dev_times, dsqi_scores)
        results["efficiency_ratios"].append({
            "pair": "Dev Time ↔ DSQI Score",
            "rho": round(float(rho), 4),
            "p_value": round(float(p), 4),
            "interpretation": "Negative = more time doesn't improve quality"
        })

        # LoC vs DSQI score
        rho, p = spearmanr(loc_values, dsqi_scores)
        results["efficiency_ratios"].append({
            "pair": "LoC ↔ DSQI Score",
            "rho": round(float(rho), 4),
            "p_value": round(float(p), 4),
        })

        # LoC vs complexity
        if len(complexities) == len(loc_values):
            rho, p = spearmanr(loc_values, complexities)
            results["efficiency_ratios"].append({
                "pair": "LoC ↔ Complexity",
                "rho": round(float(rho), 4),
                "p_value": round(float(p), 4),
            })

    except ImportError:
        print("  ⚠ scipy not available — skipping correlations")

    # ── Save ──
    save_json(OUTPUT_DIR / "G_efficiency_analysis.json", results)

    # ── Console output ──
    print("▸ Per-Artifact Development Metrics")
    rows = []
    for a in results["artifacts"]:
        rows.append([
            a["name"],
            f"{a['wall_clock_minutes']}m",
            f"{a['wakatime_active_seconds']}s",
            f"{a['idle_ratio']:.0%}" if a["idle_ratio"] is not None else "—",
            a["lines_of_code"],
            f"{a['loc_per_minute']:.0f}" if a["loc_per_minute"] else "—",
            a["dependency_count"],
            f"{a['cyclomatic_complexity_avg']:.1f}" if a["cyclomatic_complexity_avg"] else "—",
            f"{a['dsqi_score']:.4f}",
        ])
    print(tabulate(rows,
                    headers=["Artifact", "Time", "WakaTime", "Idle%", "LoC", "LoC/min", "Deps", "CC", "DSQI"],
                    tablefmt="simple_outline"))
    print()

    agg = results["aggregate"]
    print(f"▸ Aggregate")
    print(f"  Total dev time: {agg['total_development_minutes']} min ({agg['total_development_minutes']/60:.1f} hrs)")
    print(f"  Total LoC: {agg['total_lines_of_code']:,}")
    print(f"  Mean dev time: {agg['mean_dev_time_min']} min (SD={agg['sd_dev_time_min']})")
    print(f"  Mean LoC: {agg['mean_loc']:.0f} (SD={agg['sd_loc']:.0f})")
    print(f"  Mean DSQI: {agg['mean_dsqi']:.4f}")
    print()

    if results["efficiency_ratios"]:
        print("▸ Efficiency Correlations (Spearman, n=5)")
        rows = []
        for c in results["efficiency_ratios"]:
            rows.append([c["pair"], c["rho"], c["p_value"]])
        print(tabulate(rows, headers=["Pair", "ρ", "p"], tablefmt="simple_outline"))
        print()

    # ── Bar chart ──
    if figures:
        try:
            import matplotlib
            matplotlib.use("Agg")
            import matplotlib.pyplot as plt

            fig, axes = plt.subplots(1, 3, figsize=(15, 5))

            names = [ARTIFACT_NAMES[a["artifact_id"]][:15] for a in results["artifacts"]]
            x = np.arange(len(names))

            # Dev time
            axes[0].bar(x, [a["wall_clock_minutes"] for a in results["artifacts"]],
                        color="#2196F3", alpha=0.8)
            axes[0].set_ylabel("Minutes")
            axes[0].set_title("Development Time")
            axes[0].set_xticks(x)
            axes[0].set_xticklabels(names, rotation=45, ha="right", fontsize=8)

            # Lines of code
            axes[1].bar(x, [a["lines_of_code"] for a in results["artifacts"]],
                        color="#FF9800", alpha=0.8)
            axes[1].set_ylabel("Lines of Code")
            axes[1].set_title("Lines of Code")
            axes[1].set_xticks(x)
            axes[1].set_xticklabels(names, rotation=45, ha="right", fontsize=8)

            # DSQI score
            axes[2].bar(x, [a["dsqi_score"] for a in results["artifacts"]],
                        color="#4CAF50", alpha=0.8)
            axes[2].set_ylabel("DSQI Score")
            axes[2].set_title("DSQI Score")
            axes[2].set_ylim(0, 1)
            axes[2].set_xticks(x)
            axes[2].set_xticklabels(names, rotation=45, ha="right", fontsize=8)

            plt.suptitle("Development Efficiency Overview", fontsize=14, fontweight="bold")
            plt.tight_layout(rect=[0, 0, 1, 0.95])
            fig_path = FIGURES_DIR / "G_efficiency_bars.png"
            plt.savefig(fig_path, dpi=150, bbox_inches="tight")
            plt.close()
            print(f"  ✓ Figure saved to {fig_path.relative_to(OUTPUT_DIR.parent.parent)}")
        except ImportError:
            print("  ⚠ matplotlib not available — skipping figures")

    print(f"  ✓ Results saved to data/extended-analysis/G_efficiency_analysis.json")
    return results


def main():
    parser = argparse.ArgumentParser(description="Analysis G: Development Efficiency")
    parser.add_argument("--verbose", "-v", action="store_true")
    parser.add_argument("--no-figures", action="store_true")
    args = parser.parse_args()
    run(verbose=args.verbose, figures=not args.no_figures)


if __name__ == "__main__":
    main()
