#!/usr/bin/env python3
"""
extended_heuristic_profiles.py — Analysis C: Heuristic Usability Profiles

Constructs per-artifact radar charts and cross-artifact comparison of
Nielsen's 10 usability heuristics (adapted with instructional scaffolding).

Usage:
    python analysis/extended_heuristic_profiles.py
    python analysis/extended_heuristic_profiles.py --verbose
    python analysis/extended_heuristic_profiles.py --no-figures
"""

import argparse
import sys
from pathlib import Path

import numpy as np
from tabulate import tabulate

sys.path.insert(0, str(Path(__file__).resolve().parent))
from data_loader import (
    ARTIFACT_SLUGS, ARTIFACT_NAMES, HEURISTIC_KEYS, HEURISTIC_LABELS,
    load_expert_flat, save_json, ensure_output_dirs, OUTPUT_DIR, FIGURES_DIR,
)


def run(verbose=False, figures=True):
    ensure_output_dirs()
    expert_flat = load_expert_flat()

    results = {"artifacts": {}, "cross_artifact": {}, "flagged_items": []}

    # ── Per-artifact heuristic profiles ──
    for slug in ARTIFACT_SLUGS:
        art_obs = [r for r in expert_flat if r["artifact_id"] == slug]
        if not art_obs:
            continue

        profile = {}
        for key, label in zip(HEURISTIC_KEYS, HEURISTIC_LABELS):
            scores = [r[f"heuristic_{key}"] for r in art_obs]
            mean_score = float(np.mean(scores))
            profile[label] = {
                "mean": round(mean_score, 2),
                "scores": scores,
                "sd": round(float(np.std(scores, ddof=1)), 2) if len(scores) > 1 else 0.0,
            }
            # Flag items below 3.0
            if mean_score < 3.0:
                results["flagged_items"].append({
                    "artifact": slug,
                    "heuristic": label,
                    "mean": round(mean_score, 2),
                    "scores": scores,
                })

        # Overall mean heuristic for this artifact
        all_scores = [r[f"heuristic_{k}"] for r in art_obs for k in HEURISTIC_KEYS]
        profile["_overall_mean"] = round(float(np.mean(all_scores)), 2)
        profile["_n_reviewers"] = len(art_obs)

        results["artifacts"][slug] = profile

    # ── Cross-artifact comparison (mean per heuristic across all artifacts) ──
    for key, label in zip(HEURISTIC_KEYS, HEURISTIC_LABELS):
        all_scores = [r[f"heuristic_{key}"] for r in expert_flat]
        results["cross_artifact"][label] = {
            "grand_mean": round(float(np.mean(all_scores)), 2),
            "sd": round(float(np.std(all_scores, ddof=1)), 2) if len(all_scores) > 1 else 0.0,
            "min": int(np.min(all_scores)),
            "max": int(np.max(all_scores)),
        }

    # ── Save JSON ──
    save_json(OUTPUT_DIR / "C_heuristic_profiles.json", results)

    # ── Console output ──
    print("╔══════════════════════════════════════════════════════════╗")
    print("║  Analysis C — Heuristic Usability Profiles               ║")
    print("╚══════════════════════════════════════════════════════════╝")
    print()

    # Cross-artifact means
    print("▸ Cross-Artifact Heuristic Means (all 15 observations)")
    rows = []
    for label in HEURISTIC_LABELS:
        d = results["cross_artifact"][label]
        rows.append([label, d["grand_mean"], d["sd"], d["min"], d["max"]])
    print(tabulate(rows, headers=["Heuristic", "Mean", "SD", "Min", "Max"],
                    tablefmt="simple_outline"))
    print()

    # Per-artifact overview
    print("▸ Per-Artifact Overall Heuristic Means")
    rows = []
    for slug in ARTIFACT_SLUGS:
        p = results["artifacts"].get(slug, {})
        rows.append([ARTIFACT_NAMES[slug], p.get("_overall_mean", "—"), p.get("_n_reviewers", 0)])
    print(tabulate(rows, headers=["Artifact", "Mean", "n Reviewers"],
                    tablefmt="simple_outline"))
    print()

    # Flagged items
    if results["flagged_items"]:
        print("▸ Flagged Items (mean < 3.0)")
        for item in results["flagged_items"]:
            print(f"  ⚠ {ARTIFACT_NAMES[item['artifact']]}: {item['heuristic']} = {item['mean']} {item['scores']}")
        print()

    # ── Generate radar charts ──
    if figures:
        try:
            import matplotlib
            matplotlib.use("Agg")
            import matplotlib.pyplot as plt

            fig, axes = plt.subplots(2, 3, figsize=(18, 12),
                                      subplot_kw=dict(polar=True))
            axes_flat = axes.flatten()

            angles = np.linspace(0, 2 * np.pi, len(HEURISTIC_LABELS), endpoint=False).tolist()
            angles += angles[:1]  # close the polygon

            for idx, slug in enumerate(ARTIFACT_SLUGS):
                ax = axes_flat[idx]
                profile = results["artifacts"].get(slug, {})
                means = [profile.get(label, {}).get("mean", 0) for label in HEURISTIC_LABELS]
                means += means[:1]

                ax.fill(angles, means, alpha=0.25)
                ax.plot(angles, means, "o-", linewidth=2)
                ax.set_xticks(angles[:-1])
                ax.set_xticklabels([l[:12] for l in HEURISTIC_LABELS], size=7)
                ax.set_ylim(0, 5)
                ax.set_yticks([1, 2, 3, 4, 5])
                ax.set_title(ARTIFACT_NAMES[slug], size=11, fontweight="bold", pad=20)

            # Grand mean in 6th subplot
            ax = axes_flat[5]
            grand_means = [results["cross_artifact"][label]["grand_mean"] for label in HEURISTIC_LABELS]
            grand_means += grand_means[:1]
            ax.fill(angles, grand_means, alpha=0.25, color="gray")
            ax.plot(angles, grand_means, "o-", linewidth=2, color="gray")
            ax.set_xticks(angles[:-1])
            ax.set_xticklabels([l[:12] for l in HEURISTIC_LABELS], size=7)
            ax.set_ylim(0, 5)
            ax.set_yticks([1, 2, 3, 4, 5])
            ax.set_title("Grand Mean (all artifacts)", size=11, fontweight="bold", pad=20)

            plt.suptitle("Heuristic Usability Profiles", size=14, fontweight="bold")
            plt.tight_layout(rect=[0, 0, 1, 0.96])
            fig_path = FIGURES_DIR / "C_heuristic_radar.png"
            plt.savefig(fig_path, dpi=150, bbox_inches="tight")
            plt.close()
            print(f"  ✓ Radar chart saved to {fig_path.relative_to(OUTPUT_DIR.parent.parent)}")
        except ImportError:
            print("  ⚠ matplotlib not available — skipping figures")

    print(f"  ✓ Results saved to data/extended-analysis/C_heuristic_profiles.json")
    return results


def main():
    parser = argparse.ArgumentParser(description="Analysis C: Heuristic Usability Profiles")
    parser.add_argument("--verbose", "-v", action="store_true")
    parser.add_argument("--no-figures", action="store_true", help="Skip figure generation")
    args = parser.parse_args()
    run(verbose=args.verbose, figures=not args.no_figures)


if __name__ == "__main__":
    main()
