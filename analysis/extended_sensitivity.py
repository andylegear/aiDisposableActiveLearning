#!/usr/bin/env python3
"""
extended_sensitivity.py — Analysis H: DSQI Sensitivity Analysis

Varies DSQI component weights systematically and observes the impact on
artifact rankings, testing the robustness of the composite index.

Method:
    - Baseline weights: w_M=0.3, w_C=0.2, w_P=0.3, w_E=0.2
    - Generate all weight combinations where each w ∈ [0.05, 0.50] in 0.05 steps,
      and all weights sum to 1.0
    - Compute DSQI for each combination; track rank-order stability via Kendall's tau

Usage:
    python analysis/extended_sensitivity.py
    python analysis/extended_sensitivity.py --verbose
"""

import argparse
import itertools
import sys
from pathlib import Path

import numpy as np
from tabulate import tabulate

sys.path.insert(0, str(Path(__file__).resolve().parent))
from data_loader import (
    ARTIFACT_SLUGS, ARTIFACT_NAMES,
    load_dsqi_files, save_json, ensure_output_dirs, OUTPUT_DIR, FIGURES_DIR,
)


def kendall_tau(rank_a, rank_b):
    """Compute Kendall's tau-b between two rankings."""
    try:
        from scipy.stats import kendalltau
        tau, p = kendalltau(rank_a, rank_b)
        return round(float(tau), 4), round(float(p), 4)
    except ImportError:
        # Manual concordant/discordant pairs
        n = len(rank_a)
        concordant = discordant = 0
        for i in range(n):
            for j in range(i + 1, n):
                a_diff = rank_a[i] - rank_a[j]
                b_diff = rank_b[i] - rank_b[j]
                product = a_diff * b_diff
                if product > 0:
                    concordant += 1
                elif product < 0:
                    discordant += 1
        denom = n * (n - 1) / 2
        tau = (concordant - discordant) / denom if denom > 0 else 0
        return round(tau, 4), None


def compute_dsqi(M, C, P, E, w_M, w_C, w_P, w_E):
    """Compute DSQI given sub-scores and weights."""
    return w_M * (1 - M) + w_C * (1 - C) + w_P * P + w_E * E


def get_rankings(scores):
    """Convert scores to rankings (1 = highest)."""
    sorted_indices = np.argsort(-np.array(scores))
    ranks = np.empty_like(sorted_indices)
    ranks[sorted_indices] = np.arange(1, len(scores) + 1)
    return ranks.tolist()


def run(verbose=False, figures=True):
    ensure_output_dirs()
    dsqi_files = load_dsqi_files()

    # Extract sub-scores
    sub_scores = {}
    for slug in ARTIFACT_SLUGS:
        d = dsqi_files.get(slug, {})
        sub_scores[slug] = {
            "M": d.get("maintenance_cost", {}).get("M_score", 0),
            "C": d.get("creation_cost", {}).get("C_score", 0),
            "P": d.get("pedagogical_alignment", {}).get("P_score", 0),
            "E": d.get("pedagogical_purity", {}).get("E_score", 0),
        }

    # ── Baseline ──
    baseline_weights = {"w_M": 0.3, "w_C": 0.2, "w_P": 0.3, "w_E": 0.2}
    baseline_scores = []
    for slug in ARTIFACT_SLUGS:
        s = sub_scores[slug]
        score = compute_dsqi(s["M"], s["C"], s["P"], s["E"], **baseline_weights)
        baseline_scores.append(round(score, 4))
    baseline_ranking = get_rankings(baseline_scores)

    results = {
        "baseline": {
            "weights": baseline_weights,
            "scores": dict(zip(ARTIFACT_SLUGS, baseline_scores)),
            "ranking": dict(zip(ARTIFACT_SLUGS, baseline_ranking)),
        },
        "perturbations": [],
        "summary": {},
    }

    print("╔══════════════════════════════════════════════════════════╗")
    print("║  Analysis H — DSQI Sensitivity Analysis                  ║")
    print("╚══════════════════════════════════════════════════════════╝")
    print()

    # ── Generate weight combinations ──
    step = 0.05
    weight_values = np.arange(0.05, 0.55, step)
    weight_values = np.round(weight_values, 2)

    valid_combos = []
    for w_M in weight_values:
        for w_C in weight_values:
            for w_P in weight_values:
                w_E = round(1.0 - w_M - w_C - w_P, 2)
                if 0.05 <= w_E <= 0.50:
                    valid_combos.append((w_M, w_C, w_P, w_E))

    print(f"  Weight combinations tested: {len(valid_combos)}")
    print(f"  Step size: {step}")
    print(f"  Range per weight: [0.05, 0.50]")
    print()

    # ── Compute DSQI for all combinations ──
    all_taus = []
    rank_changes = {slug: [] for slug in ARTIFACT_SLUGS}
    dsqi_ranges = {slug: [] for slug in ARTIFACT_SLUGS}

    for combo in valid_combos:
        w_M, w_C, w_P, w_E = combo
        scores = []
        for slug in ARTIFACT_SLUGS:
            s = sub_scores[slug]
            score = compute_dsqi(s["M"], s["C"], s["P"], s["E"], w_M, w_C, w_P, w_E)
            scores.append(round(score, 4))
            dsqi_ranges[slug].append(score)

        ranking = get_rankings(scores)
        tau, _ = kendall_tau(baseline_ranking, ranking)
        all_taus.append(tau)

        for i, slug in enumerate(ARTIFACT_SLUGS):
            rank_changes[slug].append(ranking[i])

    # ── Summary statistics ──
    results["summary"] = {
        "n_combinations": len(valid_combos),
        "kendall_tau_mean": round(float(np.mean(all_taus)), 4),
        "kendall_tau_sd": round(float(np.std(all_taus, ddof=1)), 4),
        "kendall_tau_min": round(float(np.min(all_taus)), 4),
        "kendall_tau_max": round(float(np.max(all_taus)), 4),
        "rank_stable_pct": round(100 * sum(1 for t in all_taus if t == 1.0) / len(all_taus), 1),
        "dsqi_ranges": {},
    }

    for slug in ARTIFACT_SLUGS:
        vals = dsqi_ranges[slug]
        results["summary"]["dsqi_ranges"][slug] = {
            "min": round(float(np.min(vals)), 4),
            "max": round(float(np.max(vals)), 4),
            "range": round(float(np.max(vals) - np.min(vals)), 4),
            "baseline": baseline_scores[ARTIFACT_SLUGS.index(slug)],
        }

    # ── Component-specific sensitivity (vary one weight at a time) ──
    component_sensitivity = []
    for component, baseline_w in baseline_weights.items():
        taus_for_component = []
        for delta in np.arange(-0.15, 0.20, 0.05):
            new_w = round(baseline_w + delta, 2)
            if new_w < 0.05 or new_w > 0.50:
                continue

            # Scale remaining weights proportionally
            remaining = {k: v for k, v in baseline_weights.items() if k != component}
            remaining_sum = sum(remaining.values())
            scale = (1.0 - new_w) / remaining_sum if remaining_sum > 0 else 0

            weights = {component: new_w}
            for k, v in remaining.items():
                weights[k] = round(v * scale, 4)

            scores = []
            for slug in ARTIFACT_SLUGS:
                s = sub_scores[slug]
                score = compute_dsqi(s["M"], s["C"], s["P"], s["E"],
                                     weights["w_M"], weights["w_C"], weights["w_P"], weights["w_E"])
                scores.append(round(score, 4))

            ranking = get_rankings(scores)
            tau, _ = kendall_tau(baseline_ranking, ranking)
            taus_for_component.append({
                "weight_value": new_w,
                "delta": round(delta, 2),
                "tau": tau,
                "scores": dict(zip(ARTIFACT_SLUGS, scores)),
            })

        component_sensitivity.append({
            "component": component,
            "perturbations": taus_for_component,
            "mean_tau": round(float(np.mean([t["tau"] for t in taus_for_component])), 4) if taus_for_component else None,
        })

    results["component_sensitivity"] = component_sensitivity

    # ── Save ──
    save_json(OUTPUT_DIR / "H_sensitivity_analysis.json", results)

    # ── Console output ──
    print("▸ Baseline Ranking")
    rows = []
    for slug in ARTIFACT_SLUGS:
        idx = ARTIFACT_SLUGS.index(slug)
        rows.append([
            ARTIFACT_NAMES[slug],
            baseline_scores[idx],
            baseline_ranking[idx],
        ])
    rows.sort(key=lambda r: r[2])
    print(tabulate(rows, headers=["Artifact", "DSQI", "Rank"], tablefmt="simple_outline"))
    print()

    s = results["summary"]
    print(f"▸ Rank Stability ({s['n_combinations']} weight combinations)")
    print(f"  Kendall's τ: μ={s['kendall_tau_mean']}, SD={s['kendall_tau_sd']}")
    print(f"  Range: [{s['kendall_tau_min']}, {s['kendall_tau_max']}]")
    print(f"  Rank-stable combinations: {s['rank_stable_pct']}%")
    print()

    print("▸ DSQI Score Ranges under All Weight Combinations")
    rows = []
    for slug in ARTIFACT_SLUGS:
        d = s["dsqi_ranges"][slug]
        rows.append([ARTIFACT_NAMES[slug], d["baseline"], d["min"], d["max"], d["range"]])
    print(tabulate(rows, headers=["Artifact", "Baseline", "Min", "Max", "Range"],
                    tablefmt="simple_outline"))
    print()

    print("▸ Component Sensitivity (one-at-a-time)")
    for cs in component_sensitivity:
        taus = [t["tau"] for t in cs["perturbations"]]
        print(f"  {cs['component']}: mean τ = {cs['mean_tau']} "
              f"(range [{min(taus):.4f}, {max(taus):.4f}])")
    print()

    # ── Heatmap ──
    if figures:
        try:
            import matplotlib
            matplotlib.use("Agg")
            import matplotlib.pyplot as plt

            fig, axes = plt.subplots(1, 2, figsize=(14, 5))

            # Panel 1: DSQI ranges per artifact
            ax = axes[0]
            for i, slug in enumerate(ARTIFACT_SLUGS):
                d = results["summary"]["dsqi_ranges"][slug]
                ax.barh(i, d["range"], left=d["min"], height=0.6, alpha=0.7)
                ax.plot(d["baseline"], i, "k|", markersize=20, markeredgewidth=2)
            ax.set_yticks(range(len(ARTIFACT_SLUGS)))
            ax.set_yticklabels([ARTIFACT_NAMES[s] for s in ARTIFACT_SLUGS], fontsize=9)
            ax.set_xlabel("DSQI Score")
            ax.set_title("DSQI Range under Weight Perturbation")
            ax.axvline(x=np.mean(baseline_scores), color="gray", linestyle="--", alpha=0.5)

            # Panel 2: Kendall's tau distribution
            ax = axes[1]
            ax.hist(all_taus, bins=20, color="#2196F3", alpha=0.7, edgecolor="black")
            ax.axvline(x=1.0, color="red", linestyle="--", label="Perfect agreement")
            ax.set_xlabel("Kendall's τ (vs baseline)")
            ax.set_ylabel("Count")
            ax.set_title("Rank Stability Distribution")
            ax.legend()

            plt.suptitle("DSQI Sensitivity Analysis", fontsize=14, fontweight="bold")
            plt.tight_layout(rect=[0, 0, 1, 0.95])
            fig_path = FIGURES_DIR / "H_sensitivity_heatmap.png"
            plt.savefig(fig_path, dpi=150, bbox_inches="tight")
            plt.close()
            print(f"  ✓ Figure saved to {fig_path.relative_to(OUTPUT_DIR.parent.parent)}")
        except ImportError:
            print("  ⚠ matplotlib not available — skipping figures")

    print(f"  ✓ Results saved to data/extended-analysis/H_sensitivity_analysis.json")
    return results


def main():
    parser = argparse.ArgumentParser(description="Analysis H: DSQI Sensitivity Analysis")
    parser.add_argument("--verbose", "-v", action="store_true")
    parser.add_argument("--no-figures", action="store_true")
    args = parser.parse_args()
    run(verbose=args.verbose, figures=not args.no_figures)


if __name__ == "__main__":
    main()
