#!/usr/bin/env python3
"""
generate_summary_report.py — Synthesise all three evaluation layers.

Reads the JSON outputs of generate_dsqi_report, generate_expert_report,
and generate_coordinator_report, then produces a unified cross-layer
summary with triangulated findings.

Output:
    analysis/output/summary_report.json

Usage:
    python analysis/generate_summary_report.py
    (Run the three individual generators first.)
"""

import json
import statistics
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUTPUT_DIR = ROOT / "analysis" / "output"

ARTIFACT_SLUGS = [
    "01-unit-testing-gauntlet",
    "02-big-o-visualiser",
    "03-sql-injection-simulator",
    "04-css-flexbox-trainer",
    "05-lexical-analyser-trainer",
]

ARTIFACT_SHORT = {
    "01-unit-testing-gauntlet": "UTG",
    "02-big-o-visualiser": "BOV",
    "03-sql-injection-simulator": "SQL",
    "04-css-flexbox-trainer": "CSS",
    "05-lexical-analyser-trainer": "LAT",
}

ARTIFACT_NAMES = {
    "01-unit-testing-gauntlet": "Unit Testing Gauntlet",
    "02-big-o-visualiser": "Big-O Visualiser",
    "03-sql-injection-simulator": "SQL Injection Simulator",
    "04-css-flexbox-trainer": "CSS Flexbox Trainer",
    "05-lexical-analyser-trainer": "Lexical Analyser Trainer",
}

ICAP_NUMERIC = {"passive": 0.25, "active": 0.50, "constructive": 0.75, "interactive": 1.00}


def load_json(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def save_json(path: Path, data):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, indent=2) + "\n", encoding="utf-8")


def main():
    print("╔══════════════════════════════════════════════════════════╗")
    print("║  Summary Report Generator                                ║")
    print("╚══════════════════════════════════════════════════════════╝\n")

    # Load component reports
    dsqi_path = OUTPUT_DIR / "dsqi_report.json"
    expert_path = OUTPUT_DIR / "expert_report.json"
    coord_path = OUTPUT_DIR / "coordinator_report.json"

    for p in [dsqi_path, expert_path, coord_path]:
        if not p.exists():
            print(f"  ✗ Missing prerequisite: {p.name}")
            print("    Run the individual report generators first.")
            return
    
    dsqi_report = load_json(dsqi_path)
    expert_report = load_json(expert_path)
    coord_report = load_json(coord_path)

    print("  ✓ Loaded dsqi_report.json")
    print("  ✓ Loaded expert_report.json")
    print("  ✓ Loaded coordinator_report.json\n")

    # Build per-artifact cross-layer view
    cross_layer_artifacts = []

    for slug in ARTIFACT_SLUGS:
        short = ARTIFACT_SHORT[slug]
        name = ARTIFACT_NAMES[slug]

        # Layer 1: DSQI
        dsqi_entry = next((a for a in dsqi_report["artifacts"] if a["id"] == slug), None)
        # Layer 2: Expert
        expert_entry = next((a for a in expert_report["artifacts"] if a["id"] == slug), None)
        # Layer 3: Coordinator
        coord_entry = next((a for a in coord_report["artifacts"] if a["artifact_id"] == slug), None)

        artifact_summary = {
            "id": slug,
            "short": short,
            "name": name,
        }

        # DSQI scores
        if dsqi_entry:
            artifact_summary["dsqi"] = {
                "score": dsqi_entry["dsqi_score"],
                "M": dsqi_entry["maintenance"]["M_score"],
                "C": dsqi_entry["creation"]["C_score"],
                "P": dsqi_entry["pedagogical"]["P_score"],
                "E": dsqi_entry["purity"]["E_score"],
                "above_threshold": dsqi_entry["above_threshold"],
            }

        # ICAP triangulation
        icap_self = dsqi_entry["pedagogical"]["icap_level"] if dsqi_entry else None
        icap_expert = expert_entry["icap"]["levels"] if expert_entry else []
        icap_coordinator = coord_entry["icap"]["engagement_mode"] if coord_entry else None

        artifact_summary["icap_triangulation"] = {
            "self_assessment": icap_self,
            "expert_assessments": icap_expert,
            "coordinator_assessment": icap_coordinator,
            "self_coordinator_agreement": icap_self == icap_coordinator if icap_self and icap_coordinator else None,
        }

        # Expert heuristics
        if expert_entry:
            artifact_summary["expert_heuristic_grand_mean"] = expert_entry["heuristic_grand_mean"]
            artifact_summary["expert_e_scores"] = {
                "E1_mean_raw": expert_entry["e_scores"]["E1_conceptual_fidelity"]["mean_raw"],
                "E2_mean_raw": expert_entry["e_scores"]["E2_process_replicability"]["mean_raw"],
            }
            artifact_summary["expert_constructionism"] = {
                "meaningful_mean": expert_entry["constructionism"]["meaningful_artifact"]["mean"],
                "building_mean": expert_entry["constructionism"]["learning_through_building"]["mean"],
            }

        # Coordinator P1 and adoption
        if coord_entry:
            artifact_summary["coordinator"] = {
                "P1_average": coord_entry["pedagogical_alignment"]["P1_average"],
                "Q5_ease": coord_entry["adoption_intention"]["Q5_ease_of_integration"],
                "Q6_likelihood": coord_entry["adoption_intention"]["Q6_likelihood_of_use"],
                "adoption_mean": coord_entry["adoption_intention"]["adoption_mean"],
            }

        cross_layer_artifacts.append(artifact_summary)

        # Print summary line
        dsqi_val = artifact_summary.get("dsqi", {}).get("score", "?")
        heur_val = artifact_summary.get("expert_heuristic_grand_mean", "?")
        coord_p1 = artifact_summary.get("coordinator", {}).get("P1_average", "?")
        print(f"  {short}  DSQI={dsqi_val}  Heuristic M̄={heur_val}  P1={coord_p1}  ICAP[self={icap_self}, coord={icap_coordinator}]")

    # Global aggregates
    dsqi_agg = dsqi_report.get("aggregate", {})
    coord_agg = coord_report.get("aggregate", {})

    # ICAP agreement analysis
    agreements = []
    for a in cross_layer_artifacts:
        tri = a.get("icap_triangulation", {})
        if tri.get("self_coordinator_agreement") is not None:
            agreements.append(tri["self_coordinator_agreement"])
    
    icap_self_coord_agreement_rate = round(
        sum(1 for x in agreements if x) / len(agreements), 2
    ) if agreements else None

    # Expert ICAP vs Self ICAP
    expert_self_matches = 0
    expert_self_total = 0
    for a in cross_layer_artifacts:
        tri = a["icap_triangulation"]
        selfv = tri["self_assessment"]
        for ev in tri["expert_assessments"]:
            expert_self_total += 1
            if ev == selfv:
                expert_self_matches += 1

    # Compute P2 (coordinator ICAP numeric) for alignment with self P2
    p2_comparisons = []
    for a in cross_layer_artifacts:
        tri = a["icap_triangulation"]
        if tri["self_assessment"] and tri["coordinator_assessment"]:
            self_p2 = ICAP_NUMERIC.get(tri["self_assessment"], 0)
            coord_p2 = ICAP_NUMERIC.get(tri["coordinator_assessment"], 0)
            p2_comparisons.append({
                "artifact": a["short"],
                "self_icap": tri["self_assessment"],
                "coordinator_icap": tri["coordinator_assessment"],
                "self_p2": self_p2,
                "coordinator_p2": coord_p2,
                "difference": round(abs(self_p2 - coord_p2), 4),
            })

    # Adoption intention summary
    adoption_scores = []
    for a in cross_layer_artifacts:
        coord = a.get("coordinator", {})
        if "adoption_mean" in coord:
            adoption_scores.append(coord["adoption_mean"])

    summary_report = {
        "report": "Cross-Layer Summary Report",
        "study_overview": {
            "n_artifacts": len(ARTIFACT_SLUGS),
            "n_expert_reviewers": expert_report.get("n_reviewers", 0),
            "n_coordinator_reviewers": coord_agg.get("n", 0),
            "total_observations": expert_report.get("n_observations", 0),
        },
        "artifacts": cross_layer_artifacts,
        "dsqi_aggregate": dsqi_agg,
        "dsqi_component_statistics": dsqi_report.get("component_statistics", {}),
        "dsqi_rankings": dsqi_report.get("rankings", []),
        "expert_cross_artifact": expert_report.get("cross_artifact", {}),
        "coordinator_aggregate": coord_agg,
        "icap_analysis": {
            "self_coordinator_agreement_rate": icap_self_coord_agreement_rate,
            "self_coordinator_agreements": sum(1 for x in agreements if x),
            "self_coordinator_total": len(agreements),
            "expert_self_matches": expert_self_matches,
            "expert_self_total": expert_self_total,
            "expert_self_match_rate": round(expert_self_matches / expert_self_total, 2) if expert_self_total > 0 else None,
            "p2_comparisons": p2_comparisons,
        },
        "adoption_summary": {
            "mean": round(statistics.mean(adoption_scores), 2) if adoption_scores else None,
            "min": min(adoption_scores) if adoption_scores else None,
            "max": max(adoption_scores) if adoption_scores else None,
        },
        "key_findings": {
            "all_above_threshold": dsqi_agg.get("all_above_threshold", False),
            "mean_dsqi": dsqi_agg.get("mean", None),
            "dsqi_range": f"[{dsqi_agg.get('min', '?')}, {dsqi_agg.get('max', '?')}]",
            "self_coordinator_icap_alignment": f"{icap_self_coord_agreement_rate * 100:.0f}%" if icap_self_coord_agreement_rate else "N/A",
            "mean_adoption_intention": round(statistics.mean(adoption_scores), 2) if adoption_scores else None,
        },
    }

    out_path = OUTPUT_DIR / "summary_report.json"
    save_json(out_path, summary_report)
    print(f"\n  → Report saved to {out_path.relative_to(ROOT)}")

    print(f"\n  ═══ Key Findings ═══")
    kf = summary_report["key_findings"]
    print(f"  • All DSQI ≥ 0.70: {kf['all_above_threshold']}")
    print(f"  • Mean DSQI: {kf['mean_dsqi']}")
    print(f"  • DSQI range: {kf['dsqi_range']}")
    print(f"  • Self↔Coordinator ICAP alignment: {kf['self_coordinator_icap_alignment']}")
    print(f"  • Mean adoption intention: {kf['mean_adoption_intention']}/5")


if __name__ == "__main__":
    main()
