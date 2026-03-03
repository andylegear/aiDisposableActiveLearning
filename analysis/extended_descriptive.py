#!/usr/bin/env python3
"""
extended_descriptive.py — Analysis A: Descriptive Statistics

Produces summary statistics (mean, SD, min, max, median) for all numeric
variables across the three evaluation layers.

Usage:
    python analysis/extended_descriptive.py
    python analysis/extended_descriptive.py --verbose
"""

import argparse
import sys
from pathlib import Path

import numpy as np
import pandas as pd
from tabulate import tabulate

# Ensure analysis/ is importable
sys.path.insert(0, str(Path(__file__).resolve().parent))
from data_loader import (
    ARTIFACT_SLUGS, ARTIFACT_NAMES, HEURISTIC_KEYS, HEURISTIC_LABELS,
    load_registry_artifacts, load_dsqi_files, load_expert_flat,
    load_coordinator_flat, save_json, ensure_output_dirs, OUTPUT_DIR,
)


def describe_series(values, label):
    """Compute descriptive stats for a list of numeric values."""
    arr = np.array([v for v in values if v is not None], dtype=float)
    if len(arr) == 0:
        return {"variable": label, "n": 0, "mean": None, "sd": None,
                "min": None, "max": None, "median": None}
    return {
        "variable": label,
        "n": int(len(arr)),
        "mean": round(float(np.mean(arr)), 4),
        "sd": round(float(np.std(arr, ddof=1)), 4) if len(arr) > 1 else 0.0,
        "min": round(float(np.min(arr)), 4),
        "max": round(float(np.max(arr)), 4),
        "median": round(float(np.median(arr)), 4),
    }


def run(verbose=False):
    ensure_output_dirs()

    registry = load_registry_artifacts()
    dsqi_files = load_dsqi_files()
    expert_flat = load_expert_flat()
    coord_flat = load_coordinator_flat()

    results = {"layer1_dsqi": [], "layer1_development": [], "layer2_expert": [], "layer3_coordinator": []}

    # ── Layer 1: DSQI sub-scores ──
    dsqi_vars = {
        "DSQI Score": [a["evaluation"]["dsqi_score"] for a in registry],
        "M Score": [a["evaluation"]["dsqi_partial"]["M_score"] for a in registry],
        "C Score": [a["evaluation"]["dsqi_partial"]["C_score"] for a in registry],
        "P Score": [a["evaluation"]["dsqi_partial"]["P_score"] for a in registry],
        "E Score": [a["evaluation"]["dsqi_partial"]["E_score"] for a in registry],
    }

    for label, values in dsqi_vars.items():
        results["layer1_dsqi"].append(describe_series(values, label))

    # ── Layer 1: Development metrics ──
    dev_vars = {
        "Development Time (min)": [a["development"]["total_duration_minutes"] for a in registry],
        "Lines of Code": [a["development"]["lines_of_code"] for a in registry],
        "AI Generation Ratio": [a["development"]["ai_generation_ratio"] for a in registry],
        "Dependency Count": [a["development"]["dependency_count"] for a in registry],
        "WakaTime Active (sec)": [a["development"].get("wakatime_active_seconds", 0) for a in registry],
    }

    # Add complexity if available
    complexities = []
    for slug in ARTIFACT_SLUGS:
        d = dsqi_files.get(slug, {})
        raw = d.get("raw_metrics", {}).get("complexity", {})
        complexities.append(raw.get("overall_average"))
    dev_vars["Cyclomatic Complexity (avg)"] = complexities

    for label, values in dev_vars.items():
        results["layer1_development"].append(describe_series(values, label))

    # ── Layer 2: Expert review scores ──

    # Heuristic scores (pooled across all 15 observations)
    for key, label in zip(HEURISTIC_KEYS, HEURISTIC_LABELS):
        values = [r[f"heuristic_{key}"] for r in expert_flat]
        results["layer2_expert"].append(describe_series(values, f"H: {label}"))

    # Mean heuristic per observation
    mean_h = []
    for r in expert_flat:
        scores = [r[f"heuristic_{key}"] for key in HEURISTIC_KEYS]
        mean_h.append(np.mean(scores))
    results["layer2_expert"].append(describe_series(mean_h, "Mean Heuristic Score"))

    # E1, E2
    results["layer2_expert"].append(describe_series(
        [r["E1_score"] for r in expert_flat], "E1 Conceptual Fidelity"))
    results["layer2_expert"].append(describe_series(
        [r["E2_score"] for r in expert_flat], "E2 Process Replicability"))

    # Constructionism
    results["layer2_expert"].append(describe_series(
        [r["constructionism_meaningful_score"] for r in expert_flat], "Constructionism: Meaningful Artifact"))
    results["layer2_expert"].append(describe_series(
        [r["constructionism_building_score"] for r in expert_flat], "Constructionism: Learning through Building"))

    # ── Layer 3: Coordinator scores ──
    coord_vars = {
        "Q1 Curriculum Relevance": [r["Q1_curriculum_relevance"] for r in coord_flat],
        "Q2 Concept Challenge": [r["Q2_concept_challenge"] for r in coord_flat],
        "Q3 Objective Coverage": [r["Q3_objective_coverage"] for r in coord_flat],
        "P1 Average": [r["P1_average"] for r in coord_flat],
        "Q5 Ease of Integration": [r["Q5_ease_of_integration"] for r in coord_flat],
        "Q6 Likelihood of Use": [r["Q6_likelihood_of_use"] for r in coord_flat],
    }

    for label, values in coord_vars.items():
        results["layer3_coordinator"].append(describe_series(values, label))

    # ── Per-artifact summary table ──
    artifact_summary = []
    for slug in ARTIFACT_SLUGS:
        reg = next(a for a in registry if a["slug"] == slug)
        dsqi = dsqi_files.get(slug, {})

        # Expert means for this artifact
        art_experts = [r for r in expert_flat if r["artifact_id"] == slug]
        mean_heuristic = np.mean([
            np.mean([r[f"heuristic_{k}"] for k in HEURISTIC_KEYS])
            for r in art_experts
        ]) if art_experts else None

        mean_e1 = np.mean([r["E1_score"] for r in art_experts]) if art_experts else None
        mean_e2 = np.mean([r["E2_score"] for r in art_experts]) if art_experts else None

        # Coordinator data
        coord = next((c for c in coord_flat if c["artifact_id"] == slug), None)

        artifact_summary.append({
            "slug": slug,
            "name": ARTIFACT_NAMES[slug],
            "dsqi_score": reg["evaluation"]["dsqi_score"],
            "M": reg["evaluation"]["dsqi_partial"]["M_score"],
            "C": reg["evaluation"]["dsqi_partial"]["C_score"],
            "P": reg["evaluation"]["dsqi_partial"]["P_score"],
            "E": reg["evaluation"]["dsqi_partial"]["E_score"],
            "dev_time_min": reg["development"]["total_duration_minutes"],
            "loc": reg["development"]["lines_of_code"],
            "mean_heuristic": round(float(mean_heuristic), 2) if mean_heuristic else None,
            "mean_E1": round(float(mean_e1), 2) if mean_e1 else None,
            "mean_E2": round(float(mean_e2), 2) if mean_e2 else None,
            "coord_P1": coord["P1_average"] if coord else None,
            "coord_adoption_mean": round((coord["Q5_ease_of_integration"] + coord["Q6_likelihood_of_use"]) / 2, 2) if coord else None,
        })

    results["artifact_summary"] = artifact_summary

    # ── Save ──
    save_json(OUTPUT_DIR / "A_descriptive_statistics.json", results)

    # ── Console output ──
    print("╔══════════════════════════════════════════════════════════╗")
    print("║  Analysis A — Descriptive Statistics                     ║")
    print("╚══════════════════════════════════════════════════════════╝")
    print()

    for section, label in [
        ("layer1_dsqi", "Layer 1: DSQI Sub-Scores"),
        ("layer1_development", "Layer 1: Development Metrics"),
        ("layer2_expert", "Layer 2: Expert Review Scores (n=15 observations)"),
        ("layer3_coordinator", "Layer 3: Coordinator Scores (n=5)"),
    ]:
        print(f"▸ {label}")
        rows = []
        for s in results[section]:
            rows.append([
                s["variable"], s["n"],
                f"{s['mean']:.4f}" if s["mean"] is not None else "—",
                f"{s['sd']:.4f}" if s["sd"] is not None else "—",
                f"{s['min']:.4f}" if s["min"] is not None else "—",
                f"{s['max']:.4f}" if s["max"] is not None else "—",
                f"{s['median']:.4f}" if s["median"] is not None else "—",
            ])
        print(tabulate(rows, headers=["Variable", "n", "Mean", "SD", "Min", "Max", "Median"],
                        tablefmt="simple_outline"))
        print()

    # Per-artifact summary
    print("▸ Per-Artifact Summary")
    rows = []
    for a in artifact_summary:
        rows.append([
            a["name"],
            f"{a['dsqi_score']:.4f}",
            f"{a['dev_time_min']}m",
            a["loc"],
            a["mean_heuristic"],
            a["mean_E1"],
            a["coord_P1"],
            a["coord_adoption_mean"],
        ])
    print(tabulate(rows,
                    headers=["Artifact", "DSQI", "Dev Time", "LoC", "μ Heuristic", "μ E1", "P1", "Adoption"],
                    tablefmt="simple_outline"))
    print()

    print(f"  ✓ Results saved to data/extended-analysis/A_descriptive_statistics.json")
    return results


def main():
    parser = argparse.ArgumentParser(description="Analysis A: Descriptive Statistics")
    parser.add_argument("--verbose", "-v", action="store_true")
    args = parser.parse_args()
    run(verbose=args.verbose)


if __name__ == "__main__":
    main()
