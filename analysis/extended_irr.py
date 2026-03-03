#!/usr/bin/env python3
"""
extended_irr.py — Analysis B: Inter-Rater Reliability (IRR)

Computes Krippendorff's alpha for expert reviewer ratings across all five
artifacts, assessing agreement on heuristic scores, E1/E2, ICAP, and
constructionism dimensions.

Interpretation (Krippendorff, 2011):
    α ≥ 0.800  → good reliability
    0.667 ≤ α  → acceptable for tentative conclusions
    α < 0.667  → data should not be relied upon

Usage:
    python analysis/extended_irr.py
    python analysis/extended_irr.py --verbose
"""

import argparse
import sys
from pathlib import Path

import numpy as np
from tabulate import tabulate

try:
    import krippendorff
except ImportError:
    print("ERROR: 'krippendorff' package required. Install with: pip install krippendorff")
    sys.exit(1)

sys.path.insert(0, str(Path(__file__).resolve().parent))
from data_loader import (
    ARTIFACT_SLUGS, HEURISTIC_KEYS, HEURISTIC_LABELS, ICAP_SCORES,
    load_expert_reviews, save_json, ensure_output_dirs, OUTPUT_DIR,
)


def build_rating_matrix(reviews, artifact_slugs, extract_fn):
    """Build a raters × items matrix for Krippendorff's alpha.

    Args:
        reviews: list of expert review dicts (one per reviewer)
        artifact_slugs: ordered list of artifact slugs
        extract_fn: function(artifact_dict) → numeric value or None

    Returns:
        numpy array of shape (n_raters, n_artifacts), NaN for missing
    """
    n_raters = len(reviews)
    n_items = len(artifact_slugs)
    matrix = np.full((n_raters, n_items), np.nan)

    for r_idx, review in enumerate(reviews):
        artifact_map = {a["artifact_id"]: a for a in review["artifacts"]}
        for a_idx, slug in enumerate(artifact_slugs):
            if slug in artifact_map:
                val = extract_fn(artifact_map[slug])
                if val is not None:
                    matrix[r_idx, a_idx] = val

    return matrix


def compute_alpha(matrix, level_of_measurement="ordinal"):
    """Compute Krippendorff's alpha, returning value and interpretation."""
    try:
        alpha = krippendorff.alpha(reliability_data=matrix,
                                    level_of_measurement=level_of_measurement)
    except Exception:
        alpha = float("nan")

    if np.isnan(alpha):
        interp = "undefined"
    elif alpha >= 0.800:
        interp = "good"
    elif alpha >= 0.667:
        interp = "acceptable"
    else:
        interp = "low"

    return round(alpha, 4) if not np.isnan(alpha) else None, interp


def run(verbose=False):
    ensure_output_dirs()
    reviews = load_expert_reviews()

    if len(reviews) < 2:
        print("  ⚠ Need at least 2 expert reviewers for IRR. Found:", len(reviews))
        return

    reviewer_names = [r["reviewer"]["name"] for r in reviews]
    results = {"reviewers": reviewer_names, "n_artifacts": len(ARTIFACT_SLUGS), "variables": []}

    print("╔══════════════════════════════════════════════════════════╗")
    print("║  Analysis B — Inter-Rater Reliability (IRR)              ║")
    print("╚══════════════════════════════════════════════════════════╝")
    print()
    print(f"  Reviewers: {', '.join(reviewer_names)}")
    print(f"  Artifacts: {len(ARTIFACT_SLUGS)}")
    print()

    table_rows = []

    # ── Heuristic scores (ordinal, 1–5) ──
    for key, label in zip(HEURISTIC_KEYS, HEURISTIC_LABELS):
        matrix = build_rating_matrix(
            reviews, ARTIFACT_SLUGS,
            lambda a, k=key: a["heuristics"].get(k)
        )
        alpha, interp = compute_alpha(matrix, "ordinal")
        entry = {"variable": f"H: {label}", "alpha": alpha, "interpretation": interp,
                 "level": "ordinal", "scale": "1-5"}
        results["variables"].append(entry)
        table_rows.append([f"H: {label}", alpha if alpha is not None else "—", interp])

        if verbose:
            print(f"  {label}:")
            for i, name in enumerate(reviewer_names):
                print(f"    {name}: {matrix[i].tolist()}")

    # ── Mean heuristic score per artifact ──
    matrix = build_rating_matrix(
        reviews, ARTIFACT_SLUGS,
        lambda a: np.mean([a["heuristics"].get(k, np.nan) for k in HEURISTIC_KEYS])
    )
    alpha, interp = compute_alpha(matrix, "interval")
    results["variables"].append({"variable": "Mean Heuristic", "alpha": alpha,
                                  "interpretation": interp, "level": "interval"})
    table_rows.append(["Mean Heuristic", alpha if alpha is not None else "—", interp])

    # ── E1 Conceptual Fidelity ──
    matrix = build_rating_matrix(
        reviews, ARTIFACT_SLUGS,
        lambda a: a["dsqi"]["E1_conceptual_fidelity"]["score"]
    )
    alpha, interp = compute_alpha(matrix, "ordinal")
    results["variables"].append({"variable": "E1 Conceptual Fidelity", "alpha": alpha,
                                  "interpretation": interp, "level": "ordinal", "scale": "1-5"})
    table_rows.append(["E1 Conceptual Fidelity", alpha if alpha is not None else "—", interp])

    # ── E2 Process Replicability ──
    matrix = build_rating_matrix(
        reviews, ARTIFACT_SLUGS,
        lambda a: a["dsqi"]["E2_process_replicability"]["score"]
    )
    alpha, interp = compute_alpha(matrix, "ordinal")
    results["variables"].append({"variable": "E2 Process Replicability", "alpha": alpha,
                                  "interpretation": interp, "level": "ordinal", "scale": "1-5"})
    table_rows.append(["E2 Process Replicability", alpha if alpha is not None else "—", interp])

    # ── ICAP level (nominal) ──
    icap_to_num = {"passive": 1, "active": 2, "constructive": 3, "interactive": 4}
    matrix = build_rating_matrix(
        reviews, ARTIFACT_SLUGS,
        lambda a: icap_to_num.get(a["icap"]["level"])
    )
    alpha, interp = compute_alpha(matrix, "nominal")
    results["variables"].append({"variable": "ICAP Level", "alpha": alpha,
                                  "interpretation": interp, "level": "nominal"})
    table_rows.append(["ICAP Level (nominal)", alpha if alpha is not None else "—", interp])

    # Also compute ICAP as ordinal
    alpha_ord, interp_ord = compute_alpha(matrix, "ordinal")
    results["variables"].append({"variable": "ICAP Level (ordinal)", "alpha": alpha_ord,
                                  "interpretation": interp_ord, "level": "ordinal"})
    table_rows.append(["ICAP Level (ordinal)", alpha_ord if alpha_ord is not None else "—", interp_ord])

    # ── Constructionism: Meaningful Artifact ──
    matrix = build_rating_matrix(
        reviews, ARTIFACT_SLUGS,
        lambda a: a["constructionism"]["meaningful_artifact"]["score"]
    )
    alpha, interp = compute_alpha(matrix, "ordinal")
    results["variables"].append({"variable": "Constructionism: Meaningful", "alpha": alpha,
                                  "interpretation": interp, "level": "ordinal", "scale": "1-5"})
    table_rows.append(["Constructionism: Meaningful", alpha if alpha is not None else "—", interp])

    # ── Constructionism: Learning through Building ──
    matrix = build_rating_matrix(
        reviews, ARTIFACT_SLUGS,
        lambda a: a["constructionism"]["learning_through_building"]["score"]
    )
    alpha, interp = compute_alpha(matrix, "ordinal")
    results["variables"].append({"variable": "Constructionism: Building", "alpha": alpha,
                                  "interpretation": interp, "level": "ordinal", "scale": "1-5"})
    table_rows.append(["Constructionism: Building", alpha if alpha is not None else "—", interp])

    # ── Save ──
    save_json(OUTPUT_DIR / "B_irr_results.json", results)

    # ── Console output ──
    print("▸ Krippendorff's Alpha by Variable")
    print(tabulate(table_rows, headers=["Variable", "α", "Interpretation"],
                    tablefmt="simple_outline"))
    print()

    # Summary
    alphas = [v["alpha"] for v in results["variables"] if v["alpha"] is not None]
    if alphas:
        print(f"  Mean α: {np.mean(alphas):.4f}")
        print(f"  Range:  [{min(alphas):.4f}, {max(alphas):.4f}]")
        n_good = sum(1 for a in alphas if a >= 0.800)
        n_acceptable = sum(1 for a in alphas if 0.667 <= a < 0.800)
        n_low = sum(1 for a in alphas if a < 0.667)
        print(f"  Good (≥0.800): {n_good} | Acceptable (≥0.667): {n_acceptable} | Low (<0.667): {n_low}")
    print()
    print(f"  ✓ Results saved to data/extended-analysis/B_irr_results.json")
    return results


def main():
    parser = argparse.ArgumentParser(description="Analysis B: Inter-Rater Reliability")
    parser.add_argument("--verbose", "-v", action="store_true")
    args = parser.parse_args()
    run(verbose=args.verbose)


if __name__ == "__main__":
    main()
