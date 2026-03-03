#!/usr/bin/env python3
"""
extended_icap.py — Analysis D: ICAP Concordance

Cross-tabulates ICAP classifications from three sources (self-evaluation,
expert reviewers, coordinators) and computes Fleiss' kappa for nominal
agreement on engagement level.

Usage:
    python analysis/extended_icap.py
    python analysis/extended_icap.py --verbose
"""

import argparse
import sys
from pathlib import Path

import numpy as np
from tabulate import tabulate

sys.path.insert(0, str(Path(__file__).resolve().parent))
from data_loader import (
    ARTIFACT_SLUGS, ARTIFACT_NAMES, ICAP_SCORES,
    load_dsqi_files, load_expert_reviews, load_coordinator_flat,
    save_json, ensure_output_dirs, OUTPUT_DIR, FIGURES_DIR,
)

ICAP_LEVELS = ["passive", "active", "constructive", "interactive"]
ICAP_TO_NUM = {level: i for i, level in enumerate(ICAP_LEVELS)}


def run(verbose=False, figures=True):
    ensure_output_dirs()

    dsqi_files = load_dsqi_files()
    expert_reviews = load_expert_reviews()
    coord_flat = load_coordinator_flat()

    results = {"artifacts": [], "cross_tabulation": {}, "agreement_metrics": {}}

    # ── Build per-artifact ICAP classifications ──
    for slug in ARTIFACT_SLUGS:
        entry = {"artifact_id": slug, "name": ARTIFACT_NAMES[slug], "classifications": {}}

        # Self-evaluation (Layer 1)
        dsqi = dsqi_files.get(slug, {})
        self_icap = dsqi.get("pedagogical_alignment", {}).get("icap_level", None)
        entry["classifications"]["self"] = self_icap

        # Expert reviewers (Layer 2)
        expert_icaps = []
        for review in expert_reviews:
            art = next((a for a in review["artifacts"] if a["artifact_id"] == slug), None)
            if art:
                expert_icaps.append({
                    "reviewer": review["reviewer"]["name"],
                    "level": art["icap"]["level"],
                })
        entry["classifications"]["experts"] = expert_icaps

        # Coordinator (Layer 3)
        coord = next((c for c in coord_flat if c["artifact_id"] == slug), None)
        entry["classifications"]["coordinator"] = coord["Q4_engagement_mode"] if coord else None

        # All raters for this artifact
        all_levels = []
        if self_icap:
            all_levels.append(("Self", self_icap))
        for e in expert_icaps:
            all_levels.append((e["reviewer"], e["level"]))
        if coord:
            all_levels.append(("Coordinator", coord["Q4_engagement_mode"]))

        entry["all_raters"] = [{"rater": r, "level": l} for r, l in all_levels]

        # Modal level
        level_counts = {}
        for _, level in all_levels:
            level_counts[level] = level_counts.get(level, 0) + 1
        entry["modal_level"] = max(level_counts, key=level_counts.get) if level_counts else None
        entry["agreement_ratio"] = max(level_counts.values()) / len(all_levels) if all_levels else 0

        results["artifacts"].append(entry)

    # ── Cross-tabulation: Source × ICAP level counts ──
    sources = {"self": {}, "experts": {}, "coordinator": {}}
    for level in ICAP_LEVELS:
        sources["self"][level] = 0
        sources["experts"][level] = 0
        sources["coordinator"][level] = 0

    for entry in results["artifacts"]:
        cls = entry["classifications"]
        if cls["self"]:
            sources["self"][cls["self"]] += 1
        for e in cls["experts"]:
            sources["experts"][e["level"]] += 1
        if cls["coordinator"]:
            sources["coordinator"][cls["coordinator"]] += 1

    results["cross_tabulation"] = sources

    # ── Fleiss' kappa (all raters × all artifacts) ──
    # Build rating matrix: artifacts × categories
    # Each artifact has 5 raters (1 self + 3 experts + 1 coordinator)
    try:
        from pingouin import compute_effsize
    except ImportError:
        pass

    # Manual Fleiss' kappa computation
    n_items = len(ARTIFACT_SLUGS)
    n_categories = len(ICAP_LEVELS)

    # Count matrix: (n_items × n_categories) — how many raters placed item i in category j
    count_matrix = np.zeros((n_items, n_categories), dtype=int)

    raters_per_item = []
    for i, entry in enumerate(results["artifacts"]):
        for rater_info in entry["all_raters"]:
            level = rater_info["level"]
            if level in ICAP_TO_NUM:
                count_matrix[i, ICAP_TO_NUM[level]] += 1
        raters_per_item.append(sum(count_matrix[i]))

    # Fleiss' kappa
    n = n_items
    N_arr = np.array(raters_per_item, dtype=float)

    if np.all(N_arr > 0):
        # p_j: proportion of all assignments in category j
        p_j = count_matrix.sum(axis=0) / count_matrix.sum()

        # P_i: extent of agreement for item i
        P_i = np.zeros(n)
        for i in range(n):
            Ni = N_arr[i]
            if Ni > 1:
                P_i[i] = (np.sum(count_matrix[i] ** 2) - Ni) / (Ni * (Ni - 1))

        P_bar = np.mean(P_i)
        P_e = np.sum(p_j ** 2)

        if P_e < 1.0:
            kappa = (P_bar - P_e) / (1 - P_e)
        else:
            kappa = 1.0

        results["agreement_metrics"]["fleiss_kappa"] = round(float(kappa), 4)
        if kappa >= 0.81:
            interp = "almost perfect"
        elif kappa >= 0.61:
            interp = "substantial"
        elif kappa >= 0.41:
            interp = "moderate"
        elif kappa >= 0.21:
            interp = "fair"
        else:
            interp = "slight"
        results["agreement_metrics"]["interpretation"] = interp
        results["agreement_metrics"]["P_observed"] = round(float(P_bar), 4)
        results["agreement_metrics"]["P_expected"] = round(float(P_e), 4)
    else:
        results["agreement_metrics"]["fleiss_kappa"] = None
        results["agreement_metrics"]["interpretation"] = "insufficient data"

    # ── Save ──
    save_json(OUTPUT_DIR / "D_icap_concordance.json", results)

    # ── Console output ──
    print("╔══════════════════════════════════════════════════════════╗")
    print("║  Analysis D — ICAP Concordance                           ║")
    print("╚══════════════════════════════════════════════════════════╝")
    print()

    # Per-artifact table
    print("▸ ICAP Classifications by Artifact")
    rows = []
    for entry in results["artifacts"]:
        cls = entry["classifications"]
        expert_levels = [e["level"] for e in cls["experts"]]
        rows.append([
            entry["name"],
            cls["self"] or "—",
            ", ".join(expert_levels) if expert_levels else "—",
            cls["coordinator"] or "—",
            entry["modal_level"] or "—",
            f"{entry['agreement_ratio']:.0%}",
        ])
    print(tabulate(rows, headers=["Artifact", "Self", "Experts", "Coordinator", "Mode", "Agreement"],
                    tablefmt="simple_outline"))
    print()

    # Cross-tabulation
    print("▸ Cross-Tabulation: Source × ICAP Level")
    ct_rows = []
    for source in ["self", "experts", "coordinator"]:
        ct_rows.append([source.title()] + [sources[source][level] for level in ICAP_LEVELS])
    print(tabulate(ct_rows, headers=["Source"] + [l.title() for l in ICAP_LEVELS],
                    tablefmt="simple_outline"))
    print()

    # Agreement metrics
    metrics = results["agreement_metrics"]
    print(f"▸ Fleiss' Kappa: {metrics.get('fleiss_kappa', '—')} ({metrics.get('interpretation', '—')})")
    if metrics.get("P_observed") is not None:
        print(f"  P(observed) = {metrics['P_observed']}, P(expected) = {metrics['P_expected']}")
    print()

    # ── Alluvial / flow diagram ──
    if figures:
        try:
            import matplotlib
            matplotlib.use("Agg")
            import matplotlib.pyplot as plt

            fig, ax = plt.subplots(figsize=(12, 6))

            # Simplified: grouped bar chart of ICAP classifications by source
            x = np.arange(len(ICAP_LEVELS))
            width = 0.25
            source_labels = ["Self", "Experts", "Coordinator"]
            colors = ["#2196F3", "#FF9800", "#4CAF50"]

            for i, (source, color) in enumerate(zip(["self", "experts", "coordinator"], colors)):
                counts = [sources[source][level] for level in ICAP_LEVELS]
                ax.bar(x + i * width, counts, width, label=source_labels[i], color=color, alpha=0.8)

            ax.set_xticks(x + width)
            ax.set_xticklabels([l.title() for l in ICAP_LEVELS])
            ax.set_ylabel("Count")
            ax.set_title("ICAP Classifications by Source")
            ax.legend()
            ax.set_ylim(bottom=0)

            fig_path = FIGURES_DIR / "D_icap_alluvial.png"
            plt.tight_layout()
            plt.savefig(fig_path, dpi=150, bbox_inches="tight")
            plt.close()
            print(f"  ✓ Figure saved to {fig_path.relative_to(OUTPUT_DIR.parent.parent)}")
        except ImportError:
            print("  ⚠ matplotlib not available — skipping figures")

    print(f"  ✓ Results saved to data/extended-analysis/D_icap_concordance.json")
    return results


def main():
    parser = argparse.ArgumentParser(description="Analysis D: ICAP Concordance")
    parser.add_argument("--verbose", "-v", action="store_true")
    parser.add_argument("--no-figures", action="store_true")
    args = parser.parse_args()
    run(verbose=args.verbose, figures=not args.no_figures)


if __name__ == "__main__":
    main()
