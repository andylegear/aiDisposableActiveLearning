#!/usr/bin/env python3
"""
extended_correlations.py — Analysis I: Cross-Layer Correlations

Computes Spearman rank correlations between key variables from all three
evaluation layers, producing an annotated correlation matrix.

Key pairs:
    - DSQI score ↔ mean heuristic score
    - DSQI score ↔ adoption mean
    - E_score ↔ mean constructionism
    - Dev time ↔ DSQI score
    - LoC ↔ cyclomatic complexity
    - P_score ↔ P1_average (self vs coordinator pedagogical alignment)

With n=5 artifacts, statistical significance is limited. We focus on
effect sizes (ρ magnitude) and rank-order consistency rather than p-values.

Usage:
    python analysis/extended_correlations.py
    python analysis/extended_correlations.py --verbose
"""

import argparse
import sys
from pathlib import Path

import numpy as np
from tabulate import tabulate

sys.path.insert(0, str(Path(__file__).resolve().parent))
from data_loader import (
    ARTIFACT_SLUGS, ARTIFACT_NAMES,
    load_registry_artifacts, load_dsqi_files, load_expert_flat,
    load_coordinator_flat, save_json, ensure_output_dirs, OUTPUT_DIR, FIGURES_DIR,
)


def spearman_rho(x, y):
    """Compute Spearman's rank correlation."""
    try:
        from scipy.stats import spearmanr
        if len(x) < 3:
            return None, None
        rho, p = spearmanr(x, y)
        return round(float(rho), 4), round(float(p), 4)
    except ImportError:
        return None, None


def interpret_rho(rho):
    """Interpret Spearman's rho magnitude (Cohen's conventions)."""
    if rho is None:
        return "—"
    abs_rho = abs(rho)
    if abs_rho >= 0.7:
        return "strong"
    elif abs_rho >= 0.4:
        return "moderate"
    elif abs_rho >= 0.2:
        return "weak"
    else:
        return "negligible"


def run(verbose=False, figures=True):
    ensure_output_dirs()

    registry = load_registry_artifacts()
    dsqi_files = load_dsqi_files()
    expert_flat = load_expert_flat()
    coord_flat = load_coordinator_flat()

    print("╔══════════════════════════════════════════════════════════╗")
    print("║  Analysis I — Cross-Layer Correlations                   ║")
    print("╚══════════════════════════════════════════════════════════╝")
    print()

    # ── Build per-artifact variable vectors (n=5) ──
    vectors = {slug: {} for slug in ARTIFACT_SLUGS}

    for slug in ARTIFACT_SLUGS:
        reg = next((a for a in registry if a["slug"] == slug), None)
        dsqi = dsqi_files.get(slug, {})

        # Layer 1: DSQI components
        if reg:
            vectors[slug]["dsqi_score"] = reg["evaluation"]["dsqi_score"]
            vectors[slug]["dev_time_min"] = reg["development"]["total_duration_minutes"]
            vectors[slug]["loc"] = reg["development"]["lines_of_code"]
            vectors[slug]["ai_ratio"] = reg["development"]["ai_generation_ratio"]
            vectors[slug]["dep_count"] = reg["development"]["dependency_count"]

        if dsqi:
            vectors[slug]["M_score"] = dsqi.get("maintenance_cost", {}).get("M_score", 0)
            vectors[slug]["C_score"] = dsqi.get("creation_cost", {}).get("C_score", 0)
            vectors[slug]["P_score"] = dsqi.get("pedagogical_alignment", {}).get("P_score", 0)
            vectors[slug]["E_score"] = dsqi.get("pedagogical_purity", {}).get("E_score", 0)
            raw = dsqi.get("raw_metrics", {})
            cc = raw.get("complexity", {}).get("overall_average", None)
            if cc is not None:
                vectors[slug]["complexity"] = cc

        # Layer 2: Expert means per artifact
        art_expert = [r for r in expert_flat if r["artifact_id"] == slug]
        if art_expert:
            from data_loader import HEURISTIC_KEYS
            heur_means = []
            for r in art_expert:
                scores = [r[f"heuristic_{k}"] for k in HEURISTIC_KEYS]
                heur_means.append(np.mean(scores))
            vectors[slug]["mean_heuristic"] = round(float(np.mean(heur_means)), 4)

            e1_scores = [r["E1_score"] for r in art_expert]
            e2_scores = [r["E2_score"] for r in art_expert]
            vectors[slug]["expert_E1_mean"] = round(float(np.mean(e1_scores)), 4)
            vectors[slug]["expert_E2_mean"] = round(float(np.mean(e2_scores)), 4)

            m_scores = [r["constructionism_meaningful_score"] for r in art_expert]
            b_scores = [r["constructionism_building_score"] for r in art_expert]
            vectors[slug]["expert_constructionism_mean"] = round(
                float(np.mean(m_scores + b_scores)), 4
            )

        # Layer 3: Coordinator data
        coord = next((c for c in coord_flat if c["artifact_id"] == slug), None)
        if coord:
            vectors[slug]["P1_average"] = coord["P1_average"]
            vectors[slug]["Q5_ease"] = coord["Q5_ease_of_integration"]
            vectors[slug]["Q6_likelihood"] = coord["Q6_likelihood_of_use"]
            vectors[slug]["adoption_mean"] = (coord["Q5_ease_of_integration"] +
                                               coord["Q6_likelihood_of_use"]) / 2

    # ── Define correlation pairs ──
    correlation_pairs = [
        ("dsqi_score", "mean_heuristic", "DSQI ↔ Heuristic Mean"),
        ("dsqi_score", "adoption_mean", "DSQI ↔ Adoption Mean"),
        ("dsqi_score", "P1_average", "DSQI ↔ Coordinator P1"),
        ("E_score", "expert_constructionism_mean", "E score ↔ Constructionism"),
        ("P_score", "P1_average", "Self P score ↔ Coordinator P1"),
        ("dev_time_min", "dsqi_score", "Dev Time ↔ DSQI"),
        ("dev_time_min", "loc", "Dev Time ↔ LoC"),
        ("loc", "complexity", "LoC ↔ Complexity"),
        ("loc", "dsqi_score", "LoC ↔ DSQI"),
        ("ai_ratio", "dsqi_score", "AI Ratio ↔ DSQI"),
        ("mean_heuristic", "adoption_mean", "Heuristic Mean ↔ Adoption"),
        ("expert_E1_mean", "expert_E2_mean", "Expert E1 ↔ E2"),
        ("Q5_ease", "Q6_likelihood", "Q5 Ease ↔ Q6 Likelihood"),
    ]

    results = {"n": len(ARTIFACT_SLUGS), "correlations": [], "variable_vectors": {}}

    # Store vectors for reproducibility
    for slug in ARTIFACT_SLUGS:
        results["variable_vectors"][slug] = vectors[slug]

    for var_a, var_b, label in correlation_pairs:
        x_vals = []
        y_vals = []
        for slug in ARTIFACT_SLUGS:
            v = vectors[slug]
            if var_a in v and var_b in v:
                x_vals.append(v[var_a])
                y_vals.append(v[var_b])

        if len(x_vals) < 3:
            results["correlations"].append({
                "pair": label, "var_a": var_a, "var_b": var_b,
                "rho": None, "p_value": None, "n": len(x_vals),
                "interpretation": "insufficient data"
            })
            continue

        rho, p = spearman_rho(x_vals, y_vals)
        results["correlations"].append({
            "pair": label,
            "var_a": var_a,
            "var_b": var_b,
            "rho": rho,
            "p_value": p,
            "n": len(x_vals),
            "effect_size": interpret_rho(rho),
        })

    # ── Save ──
    save_json(OUTPUT_DIR / "I_cross_layer_correlations.json", results)

    # ── Console output ──
    print(f"▸ Cross-Layer Spearman Correlations (n={results['n']})")
    print("  Note: With n=5, focus on effect sizes (|ρ|) not p-values")
    print()

    rows = []
    for c in results["correlations"]:
        rows.append([
            c["pair"],
            c["rho"] if c["rho"] is not None else "—",
            c["p_value"] if c["p_value"] is not None else "—",
            c.get("effect_size", "—"),
        ])
    print(tabulate(rows, headers=["Pair", "ρ", "p", "Effect"], tablefmt="simple_outline"))
    print()

    # Flag notable correlations
    notable = [c for c in results["correlations"]
               if c["rho"] is not None and abs(c["rho"]) >= 0.7]
    if notable:
        print("▸ Notable Strong Correlations (|ρ| ≥ 0.7)")
        for c in notable:
            direction = "positive" if c["rho"] > 0 else "negative"
            print(f"  • {c['pair']}: ρ={c['rho']} ({direction})")
        print()

    weak = [c for c in results["correlations"]
            if c["rho"] is not None and abs(c["rho"]) < 0.2]
    if weak:
        print(f"▸ Negligible Correlations (|ρ| < 0.2): {len(weak)} pairs")
        for c in weak:
            print(f"  • {c['pair']}: ρ={c['rho']}")
        print()

    # ── Correlation matrix heatmap ──
    if figures:
        try:
            import matplotlib
            matplotlib.use("Agg")
            import matplotlib.pyplot as plt
            import seaborn as sns

            # Build correlation matrix from all variable vectors
            all_vars = set()
            for slug in ARTIFACT_SLUGS:
                all_vars.update(vectors[slug].keys())
            # Filter to numeric variables with data for all 5 artifacts
            complete_vars = sorted([v for v in all_vars
                                     if all(v in vectors[s] for s in ARTIFACT_SLUGS)])

            if len(complete_vars) >= 3:
                matrix = np.zeros((len(complete_vars), len(complete_vars)))
                for i, va in enumerate(complete_vars):
                    for j, vb in enumerate(complete_vars):
                        x = [vectors[s][va] for s in ARTIFACT_SLUGS]
                        y = [vectors[s][vb] for s in ARTIFACT_SLUGS]
                        rho, _ = spearman_rho(x, y)
                        matrix[i, j] = rho if rho is not None else 0

                # Shorten labels
                short_labels = [v.replace("_", "\n")[:18] for v in complete_vars]

                fig, ax = plt.subplots(figsize=(12, 10))
                mask = np.triu(np.ones_like(matrix, dtype=bool), k=1)
                sns.heatmap(matrix, mask=mask, annot=True, fmt=".2f",
                           xticklabels=short_labels, yticklabels=short_labels,
                           cmap="RdBu_r", center=0, vmin=-1, vmax=1,
                           square=True, linewidths=0.5, ax=ax,
                           cbar_kws={"label": "Spearman's ρ"})
                ax.set_title("Cross-Layer Correlation Matrix (Spearman, n=5)", fontsize=13)
                plt.xticks(fontsize=7, rotation=45, ha="right")
                plt.yticks(fontsize=7)

                fig_path = FIGURES_DIR / "I_correlation_matrix.png"
                plt.tight_layout()
                plt.savefig(fig_path, dpi=150, bbox_inches="tight")
                plt.close()
                print(f"  ✓ Figure saved to {fig_path.relative_to(OUTPUT_DIR.parent.parent)}")
        except ImportError:
            print("  ⚠ matplotlib/seaborn not available — skipping figures")

    print(f"  ✓ Results saved to data/extended-analysis/I_cross_layer_correlations.json")
    return results


def main():
    parser = argparse.ArgumentParser(description="Analysis I: Cross-Layer Correlations")
    parser.add_argument("--verbose", "-v", action="store_true")
    parser.add_argument("--no-figures", action="store_true")
    args = parser.parse_args()
    run(verbose=args.verbose, figures=not args.no_figures)


if __name__ == "__main__":
    main()
