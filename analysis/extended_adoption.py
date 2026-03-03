#!/usr/bin/env python3
"""
extended_adoption.py — Analysis E: Adoption Intention

Analyses coordinator adoption intention scores (ease of integration Q5,
likelihood of use Q6) and correlates with DSQI scores and pedagogical
alignment ratings.

Usage:
    python analysis/extended_adoption.py
    python analysis/extended_adoption.py --verbose
"""

import argparse
import sys
from pathlib import Path

import numpy as np
from tabulate import tabulate

sys.path.insert(0, str(Path(__file__).resolve().parent))
from data_loader import (
    ARTIFACT_SLUGS, ARTIFACT_NAMES,
    load_registry_artifacts, load_coordinator_flat,
    save_json, ensure_output_dirs, OUTPUT_DIR,
)


def spearman_rho(x, y):
    """Compute Spearman's rank correlation for two arrays."""
    from scipy.stats import spearmanr
    if len(x) < 3:
        return None, None
    rho, p = spearmanr(x, y)
    return round(float(rho), 4), round(float(p), 4)


def run(verbose=False):
    ensure_output_dirs()

    registry = load_registry_artifacts()
    coord_flat = load_coordinator_flat()

    results = {"artifacts": [], "aggregate": {}, "correlations": []}

    print("╔══════════════════════════════════════════════════════════╗")
    print("║  Analysis E — Adoption Intention                         ║")
    print("╚══════════════════════════════════════════════════════════╝")
    print()

    # ── Per-artifact adoption data ──
    dsqi_scores = []
    p1_averages = []
    adoption_means = []
    q5_scores = []
    q6_scores = []

    for slug in ARTIFACT_SLUGS:
        reg = next((a for a in registry if a["slug"] == slug), None)
        coord = next((c for c in coord_flat if c["artifact_id"] == slug), None)

        if not coord:
            continue

        q5 = coord["Q5_ease_of_integration"]
        q6 = coord["Q6_likelihood_of_use"]
        adoption_mean = (q5 + q6) / 2
        dsqi = reg["evaluation"]["dsqi_score"] if reg else None
        p1 = coord["P1_average"]

        entry = {
            "artifact_id": slug,
            "name": ARTIFACT_NAMES[slug],
            "coordinator": coord["coordinator_name"],
            "Q5_ease_of_integration": q5,
            "Q6_likelihood_of_use": q6,
            "adoption_mean": round(adoption_mean, 2),
            "P1_average": p1,
            "dsqi_score": dsqi,
        }
        results["artifacts"].append(entry)

        dsqi_scores.append(dsqi)
        p1_averages.append(p1)
        adoption_means.append(adoption_mean)
        q5_scores.append(q5)
        q6_scores.append(q6)

    # ── Aggregate stats ──
    results["aggregate"] = {
        "Q5_mean": round(float(np.mean(q5_scores)), 2),
        "Q5_sd": round(float(np.std(q5_scores, ddof=1)), 2) if len(q5_scores) > 1 else 0,
        "Q6_mean": round(float(np.mean(q6_scores)), 2),
        "Q6_sd": round(float(np.std(q6_scores, ddof=1)), 2) if len(q6_scores) > 1 else 0,
        "adoption_mean": round(float(np.mean(adoption_means)), 2),
        "adoption_sd": round(float(np.std(adoption_means, ddof=1)), 2) if len(adoption_means) > 1 else 0,
        "adoption_min": round(float(np.min(adoption_means)), 2),
        "adoption_max": round(float(np.max(adoption_means)), 2),
    }

    # ── Correlations ──
    try:
        # Adoption mean ↔ DSQI score
        rho, p = spearman_rho(adoption_means, dsqi_scores)
        results["correlations"].append({
            "pair": "Adoption Mean ↔ DSQI Score",
            "rho": rho, "p_value": p,
            "note": "n=5, interpret with caution"
        })

        # P1_average ↔ Adoption mean
        rho, p = spearman_rho(p1_averages, adoption_means)
        results["correlations"].append({
            "pair": "P1 Average ↔ Adoption Mean",
            "rho": rho, "p_value": p,
        })

        # Q5 ↔ Q6
        rho, p = spearman_rho(q5_scores, q6_scores)
        results["correlations"].append({
            "pair": "Q5 (Ease) ↔ Q6 (Likelihood)",
            "rho": rho, "p_value": p,
        })

    except ImportError:
        print("  ⚠ scipy not available — skipping correlations")

    # ── Save ──
    save_json(OUTPUT_DIR / "E_adoption_intention.json", results)

    # ── Console output ──
    print("▸ Per-Artifact Adoption Scores")
    rows = []
    for a in results["artifacts"]:
        rows.append([
            a["name"], a["coordinator"],
            a["Q5_ease_of_integration"], a["Q6_likelihood_of_use"],
            a["adoption_mean"], a["P1_average"],
            f"{a['dsqi_score']:.4f}" if a["dsqi_score"] else "—",
        ])
    print(tabulate(rows,
                    headers=["Artifact", "Coordinator", "Q5", "Q6", "Adoption μ", "P1", "DSQI"],
                    tablefmt="simple_outline"))
    print()

    agg = results["aggregate"]
    print(f"▸ Aggregate: Adoption Mean = {agg['adoption_mean']} (SD={agg['adoption_sd']}, "
          f"range [{agg['adoption_min']}, {agg['adoption_max']}])")
    print(f"  Q5 (Ease): μ={agg['Q5_mean']} SD={agg['Q5_sd']}")
    print(f"  Q6 (Likelihood): μ={agg['Q6_mean']} SD={agg['Q6_sd']}")
    print()

    if results["correlations"]:
        print("▸ Correlations (Spearman's ρ, n=5)")
        rows = []
        for c in results["correlations"]:
            rows.append([c["pair"], c["rho"] or "—", c["p_value"] or "—"])
        print(tabulate(rows, headers=["Pair", "ρ", "p"], tablefmt="simple_outline"))
        print()

    print(f"  ✓ Results saved to data/extended-analysis/E_adoption_intention.json")
    return results


def main():
    parser = argparse.ArgumentParser(description="Analysis E: Adoption Intention")
    parser.add_argument("--verbose", "-v", action="store_true")
    args = parser.parse_args()
    run(verbose=args.verbose)


if __name__ == "__main__":
    main()
