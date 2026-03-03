#!/usr/bin/env python3
"""
extended_constructionism.py — Analysis F: Constructionism Alignment

Aggregates and analyses constructionism scores (meaningful artifact creation,
learning through building) from expert reviews, examining how artifacts align
with Papert's constructionist theory.

Usage:
    python analysis/extended_constructionism.py
    python analysis/extended_constructionism.py --verbose
"""

import argparse
import sys
from pathlib import Path

import numpy as np
from tabulate import tabulate

sys.path.insert(0, str(Path(__file__).resolve().parent))
from data_loader import (
    ARTIFACT_SLUGS, ARTIFACT_NAMES,
    load_expert_flat, save_json, ensure_output_dirs, OUTPUT_DIR, FIGURES_DIR,
)


def run(verbose=False, figures=True):
    ensure_output_dirs()
    expert_flat = load_expert_flat()

    results = {"artifacts": {}, "aggregate": {}, "tension_analysis": {}}

    print("╔══════════════════════════════════════════════════════════╗")
    print("║  Analysis F — Constructionism Alignment                  ║")
    print("╚══════════════════════════════════════════════════════════╝")
    print()

    all_meaningful = []
    all_building = []

    # ── Per-artifact constructionism scores ──
    for slug in ARTIFACT_SLUGS:
        art_obs = [r for r in expert_flat if r["artifact_id"] == slug]
        if not art_obs:
            continue

        meaningful_scores = [r["constructionism_meaningful_score"] for r in art_obs]
        building_scores = [r["constructionism_building_score"] for r in art_obs]
        combined = [(m + b) / 2 for m, b in zip(meaningful_scores, building_scores)]

        all_meaningful.extend(meaningful_scores)
        all_building.extend(building_scores)

        # Collect justifications
        meaningful_justifications = [r["constructionism_meaningful_justification"] for r in art_obs]
        building_justifications = [r["constructionism_building_justification"] for r in art_obs]

        results["artifacts"][slug] = {
            "name": ARTIFACT_NAMES[slug],
            "meaningful_artifact": {
                "scores": meaningful_scores,
                "mean": round(float(np.mean(meaningful_scores)), 2),
                "sd": round(float(np.std(meaningful_scores, ddof=1)), 2) if len(meaningful_scores) > 1 else 0,
                "justifications": meaningful_justifications,
            },
            "learning_through_building": {
                "scores": building_scores,
                "mean": round(float(np.mean(building_scores)), 2),
                "sd": round(float(np.std(building_scores, ddof=1)), 2) if len(building_scores) > 1 else 0,
                "justifications": building_justifications,
            },
            "combined_mean": round(float(np.mean(combined)), 2),
            "n_reviewers": len(art_obs),
        }

    # ── Aggregate ──
    results["aggregate"] = {
        "meaningful_grand_mean": round(float(np.mean(all_meaningful)), 2),
        "meaningful_sd": round(float(np.std(all_meaningful, ddof=1)), 2),
        "building_grand_mean": round(float(np.mean(all_building)), 2),
        "building_sd": round(float(np.std(all_building, ddof=1)), 2),
        "overall_mean": round(float(np.mean(all_meaningful + all_building)), 2),
        "n_observations": len(all_meaningful),
    }

    # ── Tension analysis: disposable tools vs meaningful artifacts ──
    # Core research question: can AI-generated throwaway software still support
    # constructionist learning where "meaningful artifacts" are central?
    high_meaningful = sum(1 for s in all_meaningful if s >= 4)
    low_meaningful = sum(1 for s in all_meaningful if s <= 2)
    high_building = sum(1 for s in all_building if s >= 4)
    low_building = sum(1 for s in all_building if s <= 2)

    results["tension_analysis"] = {
        "description": "Examines whether disposable (AI-generated, single-use) tools "
                       "can support constructionist learning that values 'meaningful artifacts'.",
        "meaningful_high_count": high_meaningful,
        "meaningful_low_count": low_meaningful,
        "building_high_count": high_building,
        "building_low_count": low_building,
        "interpretation": (
            "High meaningful + high building → disposable tools CAN support constructionism. "
            "Low meaningful + high building → tools support activity but not meaning-making. "
            "The gap between the two dimensions reveals the 'disposability tension'."
        ),
    }

    # ── Save ──
    save_json(OUTPUT_DIR / "F_constructionism_analysis.json", results)

    # ── Console output ──
    print("▸ Per-Artifact Constructionism Scores (mean across 3 reviewers)")
    rows = []
    for slug in ARTIFACT_SLUGS:
        a = results["artifacts"].get(slug, {})
        rows.append([
            ARTIFACT_NAMES[slug],
            a.get("meaningful_artifact", {}).get("mean", "—"),
            a.get("learning_through_building", {}).get("mean", "—"),
            a.get("combined_mean", "—"),
        ])
    print(tabulate(rows,
                    headers=["Artifact", "Meaningful", "Building", "Combined"],
                    tablefmt="simple_outline"))
    print()

    agg = results["aggregate"]
    print(f"▸ Grand Means (n={agg['n_observations']} observations per dimension)")
    print(f"  Meaningful Artifact:       {agg['meaningful_grand_mean']} (SD={agg['meaningful_sd']})")
    print(f"  Learning through Building: {agg['building_grand_mean']} (SD={agg['building_sd']})")
    print()

    ta = results["tension_analysis"]
    print(f"▸ Disposability Tension")
    print(f"  Meaningful score ≥4: {ta['meaningful_high_count']}/{agg['n_observations']}  |  ≤2: {ta['meaningful_low_count']}/{agg['n_observations']}")
    print(f"  Building score   ≥4: {ta['building_high_count']}/{agg['n_observations']}  |  ≤2: {ta['building_low_count']}/{agg['n_observations']}")
    print()

    # ── Scatter plot ──
    if figures:
        try:
            import matplotlib
            matplotlib.use("Agg")
            import matplotlib.pyplot as plt

            fig, ax = plt.subplots(figsize=(8, 6))

            colors = plt.cm.Set2(np.linspace(0, 1, len(ARTIFACT_SLUGS)))
            for idx, slug in enumerate(ARTIFACT_SLUGS):
                art = results["artifacts"].get(slug, {})
                m_scores = art.get("meaningful_artifact", {}).get("scores", [])
                b_scores = art.get("learning_through_building", {}).get("scores", [])
                if m_scores and b_scores:
                    # Add jitter for overlapping points
                    jitter = np.random.normal(0, 0.05, len(m_scores))
                    ax.scatter(
                        np.array(m_scores) + jitter,
                        np.array(b_scores) + jitter,
                        label=ARTIFACT_NAMES[slug],
                        color=colors[idx], s=80, alpha=0.8, edgecolors="black", linewidth=0.5
                    )

            ax.set_xlabel("Meaningful Artifact (1–5)", fontsize=12)
            ax.set_ylabel("Learning through Building (1–5)", fontsize=12)
            ax.set_title("Constructionism Alignment: Expert Ratings", fontsize=13)
            ax.set_xlim(0.5, 5.5)
            ax.set_ylim(0.5, 5.5)
            ax.set_xticks([1, 2, 3, 4, 5])
            ax.set_yticks([1, 2, 3, 4, 5])
            ax.legend(fontsize=8, loc="lower right")
            ax.axhline(y=3, color="gray", linestyle="--", alpha=0.3)
            ax.axvline(x=3, color="gray", linestyle="--", alpha=0.3)
            ax.set_aspect("equal")

            fig_path = FIGURES_DIR / "F_constructionism_scatter.png"
            plt.tight_layout()
            plt.savefig(fig_path, dpi=150, bbox_inches="tight")
            plt.close()
            print(f"  ✓ Figure saved to {fig_path.relative_to(OUTPUT_DIR.parent.parent)}")
        except ImportError:
            print("  ⚠ matplotlib not available — skipping figures")

    print(f"  ✓ Results saved to data/extended-analysis/F_constructionism_analysis.json")
    return results


def main():
    parser = argparse.ArgumentParser(description="Analysis F: Constructionism Alignment")
    parser.add_argument("--verbose", "-v", action="store_true")
    parser.add_argument("--no-figures", action="store_true")
    args = parser.parse_args()
    run(verbose=args.verbose, figures=not args.no_figures)


if __name__ == "__main__":
    main()
