#!/usr/bin/env python3
"""
generate_dsqi_report.py — Generate DSQI comparison tables and charts.

Reads Layer 1 DSQI JSON files, computes summary statistics, and produces
a JSON report with per-artifact DSQI breakdowns plus aggregate statistics.

Output:
    analysis/output/dsqi_report.json

Usage:
    python analysis/generate_dsqi_report.py
"""

import json
import statistics
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DSQI_DIR = ROOT / "data" / "evaluations" / "layer1-dsqi"
OUTPUT_DIR = ROOT / "analysis" / "output"

ARTIFACT_SLUGS = [
    "01-unit-testing-gauntlet",
    "02-big-o-visualiser",
    "03-sql-injection-simulator",
    "04-css-flexbox-trainer",
    "05-lexical-analyser-trainer",
]

ARTIFACT_NAMES = {
    "01-unit-testing-gauntlet": "Unit Testing Gauntlet",
    "02-big-o-visualiser": "Big-O Visualiser",
    "03-sql-injection-simulator": "SQL Injection Simulator",
    "04-css-flexbox-trainer": "CSS Flexbox Trainer",
    "05-lexical-analyser-trainer": "Lexical Analyser Trainer",
}

WEIGHT_LABELS = {
    "w1_maintenance": "Maintenance Cost (M)",
    "w2_creation": "Creation Cost (C)",
    "w3_pedagogical": "Pedagogical Alignment (P)",
    "w4_purity": "Educational Purity (E)",
}


def load_json(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def save_json(path: Path, data):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, indent=2) + "\n", encoding="utf-8")


def main():
    print("╔══════════════════════════════════════════════════════════╗")
    print("║  DSQI Report Generator                                   ║")
    print("╚══════════════════════════════════════════════════════════╝\n")

    artifacts = []
    dsqi_scores = []

    for slug in ARTIFACT_SLUGS:
        path = DSQI_DIR / f"dsqi-{slug}.json"
        if not path.exists():
            print(f"  ⚠ Missing: {path.name}")
            continue

        data = load_json(path)
        name = ARTIFACT_NAMES.get(slug, slug)

        M = data["maintenance_cost"]["M_score"]
        C = data["creation_cost"]["C_score"]
        P = data["pedagogical_alignment"]["P_score"]
        E = data["pedagogical_purity"]["E_score"]
        dsqi = data["dsqi_score"]

        # Sub-metric details
        maintenance = {
            "M_score": M,
            "dependency_count": data["maintenance_cost"]["dependency_count"],
            "cyclomatic_complexity": data["maintenance_cost"]["cyclomatic_complexity_avg"],
            "deployment_steps": data["maintenance_cost"]["deployment_steps"],
        }

        creation = {
            "C_score": C,
            "lines_of_code": data["creation_cost"]["lines_of_code"],
            "ai_generation_ratio": data["creation_cost"]["ai_generation_ratio"],
            "development_time_minutes": data["creation_cost"]["development_time_minutes"],
        }

        pedagogical = {
            "P_score": P,
            "concept_coverage": data["pedagogical_alignment"].get("concept_coverage"),
            "icap_level": data["pedagogical_alignment"]["icap_level"],
            "icap_score": data["pedagogical_alignment"]["icap_score"],
        }

        purity = {
            "E_score": E,
            "E1_conceptual_fidelity": data["pedagogical_purity"]["conceptual_fidelity_normalized"],
            "E2_process_replicability": data["pedagogical_purity"]["process_replicability_normalized"],
        }

        # Formula verification
        dsqi_check = round(
            0.3 * (1 - M) + 0.2 * (1 - C) + 0.3 * P + 0.2 * E, 4
        )

        artifact_entry = {
            "id": slug,
            "name": name,
            "dsqi_score": dsqi,
            "dsqi_verified": dsqi_check,
            "above_threshold": dsqi >= 0.70,
            "maintenance": maintenance,
            "creation": creation,
            "pedagogical": pedagogical,
            "purity": purity,
            "component_contributions": {
                "0.3(1-M)": round(0.3 * (1 - M), 4),
                "0.2(1-C)": round(0.2 * (1 - C), 4),
                "0.3P": round(0.3 * P, 4),
                "0.2E": round(0.2 * E, 4),
            },
        }

        artifacts.append(artifact_entry)
        dsqi_scores.append(dsqi)

        print(f"  ✓ {name:<30} DSQI = {dsqi:.4f}  (M={M:.4f}, C={C:.4f}, P={P:.4f}, E={E:.4f})")

    # Aggregate statistics
    if dsqi_scores:
        aggregate = {
            "n": len(dsqi_scores),
            "mean": round(statistics.mean(dsqi_scores), 4),
            "median": round(statistics.median(dsqi_scores), 4),
            "stdev": round(statistics.stdev(dsqi_scores), 4) if len(dsqi_scores) > 1 else 0,
            "min": round(min(dsqi_scores), 4),
            "max": round(max(dsqi_scores), 4),
            "range": round(max(dsqi_scores) - min(dsqi_scores), 4),
            "all_above_threshold": all(d >= 0.70 for d in dsqi_scores),
            "threshold": 0.70,
        }

        # Component-level aggregates
        components = {
            "M": [a["maintenance"]["M_score"] for a in artifacts],
            "C": [a["creation"]["C_score"] for a in artifacts],
            "P": [a["pedagogical"]["P_score"] for a in artifacts],
            "E": [a["purity"]["E_score"] for a in artifacts],
        }
        component_stats = {}
        for comp_name, values in components.items():
            component_stats[comp_name] = {
                "mean": round(statistics.mean(values), 4),
                "stdev": round(statistics.stdev(values), 4) if len(values) > 1 else 0,
                "min": round(min(values), 4),
                "max": round(max(values), 4),
            }

        # Ranking
        ranked = sorted(artifacts, key=lambda a: a["dsqi_score"], reverse=True)
        rankings = [
            {"rank": i + 1, "name": a["name"], "dsqi": a["dsqi_score"]}
            for i, a in enumerate(ranked)
        ]
    else:
        aggregate = {}
        component_stats = {}
        rankings = []

    report = {
        "report": "DSQI Analysis Report",
        "formula": "DSQI = 0.3(1-M) + 0.2(1-C) + 0.3P + 0.2E",
        "weights": {"w_M": 0.3, "w_C": 0.2, "w_P": 0.3, "w_E": 0.2},
        "threshold": 0.70,
        "artifacts": artifacts,
        "aggregate": aggregate,
        "component_statistics": component_stats,
        "rankings": rankings,
    }

    out_path = OUTPUT_DIR / "dsqi_report.json"
    save_json(out_path, report)
    print(f"\n  → Report saved to {out_path.relative_to(ROOT)}")
    print(f"\n  Mean DSQI: {aggregate.get('mean', 'N/A')}")
    print(f"  Range: [{aggregate.get('min', 'N/A')}, {aggregate.get('max', 'N/A')}]")
    print(f"  All above 0.70: {aggregate.get('all_above_threshold', 'N/A')}")


if __name__ == "__main__":
    main()
