#!/usr/bin/env python3
"""
generate_expert_report.py — Aggregate expert review data and calculate averages.

Reads Layer 2 expert review JSON files and produces a comprehensive report
with per-artifact and per-reviewer breakdowns for heuristics, ICAP, 
constructionism, and DSQI E-scores.

Output:
    analysis/output/expert_report.json

Usage:
    python analysis/generate_expert_report.py
"""

import json
import statistics
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
EXPERT_DIR = ROOT / "data" / "evaluations" / "layer2-expert-review"
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

HEURISTIC_LABELS = [
    ("visibility_of_status", "H1 Visibility of Status"),
    ("match_with_real_world", "H2 Match with Real World"),
    ("user_control_and_freedom", "H3 User Control & Freedom"),
    ("consistency_and_standards", "H4 Consistency & Standards"),
    ("error_prevention", "H5 Error Prevention"),
    ("recognition_over_recall", "H6 Recognition over Recall"),
    ("flexibility_and_efficiency", "H7 Flexibility & Efficiency"),
    ("aesthetic_and_minimalist_design", "H8 Aesthetic & Minimalist"),
    ("help_with_errors", "H9 Help with Errors"),
    ("instructional_scaffolding", "H10 Instructional Scaffolding"),
]

ICAP_ORDER = ["passive", "active", "constructive", "interactive"]


def load_json(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def save_json(path: Path, data):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, indent=2) + "\n", encoding="utf-8")


def norm_1_5(score):
    return (score - 1) / 4


def main():
    print("╔══════════════════════════════════════════════════════════╗")
    print("║  Expert Review Report Generator                          ║")
    print("╚══════════════════════════════════════════════════════════╝\n")

    # Load all expert reviews
    reviewers = []
    all_reviews = []  # list of (reviewer_name, artifact_slug, artifact_data)

    for path in sorted(EXPERT_DIR.glob("dsqi-review-*.json")):
        data = load_json(path)
        reviewer = data["reviewer"]
        reviewers.append({
            "name": reviewer["name"],
            "role": reviewer["role"],
            "experience_years": reviewer["experience_years"],
            "institution": reviewer["institution"],
        })
        for artifact in data["artifacts"]:
            all_reviews.append((reviewer["name"], artifact["artifact_id"], artifact))

    print(f"  Loaded {len(reviewers)} expert reviews with {len(all_reviews)} artifact observations\n")

    # Per-artifact aggregation
    artifact_reports = []

    for slug in ARTIFACT_SLUGS:
        name = ARTIFACT_NAMES.get(slug, slug)
        observations = [(r, a) for (r, s, a) in all_reviews if s == slug]
        n = len(observations)

        if n == 0:
            continue

        # Heuristics
        heuristic_data = {}
        for key, label in HEURISTIC_LABELS:
            scores = [a["heuristics"][key] for (_, a) in observations]
            heuristic_data[label] = {
                "scores": scores,
                "mean": round(statistics.mean(scores), 2),
                "min": min(scores),
                "max": max(scores),
            }

        all_heuristic_scores = []
        for key, _ in HEURISTIC_LABELS:
            for _, a in observations:
                all_heuristic_scores.append(a["heuristics"][key])
        heuristic_grand_mean = round(statistics.mean(all_heuristic_scores), 2)

        # ICAP classifications
        icap_levels = [a["icap"]["level"] for (_, a) in observations]
        icap_justifications = [
            {"reviewer": r, "level": a["icap"]["level"], "justification": a["icap"]["justification"]}
            for (r, a) in observations
        ]

        # Constructionism
        meaningful_scores = [a["constructionism"]["meaningful_artifact"]["score"] for (_, a) in observations]
        building_scores = [a["constructionism"]["learning_through_building"]["score"] for (_, a) in observations]
        constructionism = {
            "meaningful_artifact": {
                "scores": meaningful_scores,
                "mean": round(statistics.mean(meaningful_scores), 2),
            },
            "learning_through_building": {
                "scores": building_scores,
                "mean": round(statistics.mean(building_scores), 2),
            },
            "combined_mean": round(statistics.mean(meaningful_scores + building_scores), 2),
            "justifications": [
                {
                    "reviewer": r,
                    "meaningful_justification": a["constructionism"]["meaningful_artifact"]["justification"],
                    "building_justification": a["constructionism"]["learning_through_building"]["justification"],
                }
                for (r, a) in observations
            ],
        }

        # E scores (conceptual fidelity + process replicability)
        e1_scores = [a["dsqi"]["E1_conceptual_fidelity"]["score"] for (_, a) in observations]
        e2_scores = [a["dsqi"]["E2_process_replicability"]["score"] for (_, a) in observations]
        e_data = {
            "E1_conceptual_fidelity": {
                "raw_scores": e1_scores,
                "mean_raw": round(statistics.mean(e1_scores), 2),
                "mean_normalized": round(statistics.mean([norm_1_5(s) for s in e1_scores]), 4),
            },
            "E2_process_replicability": {
                "raw_scores": e2_scores,
                "mean_raw": round(statistics.mean(e2_scores), 2),
                "mean_normalized": round(statistics.mean([norm_1_5(s) for s in e2_scores]), 4),
            },
        }

        # Open-ended comments
        open_ended = [
            {
                "reviewer": r,
                "most_positive": a["open_ended"]["most_positive"],
                "most_negative": a["open_ended"]["most_negative"],
                "other_comments": a["open_ended"].get("other_comments", ""),
            }
            for (r, a) in observations
        ]

        artifact_reports.append({
            "id": slug,
            "name": name,
            "n_reviewers": n,
            "heuristic_grand_mean": heuristic_grand_mean,
            "heuristics": heuristic_data,
            "icap": {
                "levels": icap_levels,
                "modal_level": max(set(icap_levels), key=icap_levels.count),
                "details": icap_justifications,
            },
            "constructionism": constructionism,
            "e_scores": e_data,
            "open_ended": open_ended,
        })

        print(f"  ✓ {name:<30} Heuristic M̄={heuristic_grand_mean}  ICAP={icap_levels}  E1 M̄={e_data['E1_conceptual_fidelity']['mean_raw']}  E2 M̄={e_data['E2_process_replicability']['mean_raw']}")

    # Cross-artifact heuristic aggregates
    cross_heuristic = {}
    for key, label in HEURISTIC_LABELS:
        all_scores = []
        for (_, _, a) in all_reviews:
            all_scores.append(a["heuristics"][key])
        cross_heuristic[label] = {
            "grand_mean": round(statistics.mean(all_scores), 2),
            "stdev": round(statistics.stdev(all_scores), 2) if len(all_scores) > 1 else 0,
            "min": min(all_scores),
            "max": max(all_scores),
        }

    # Cross-artifact ICAP summary
    all_icap = [a["icap"]["level"] for (_, _, a) in all_reviews]
    icap_distribution = {level: all_icap.count(level) for level in ICAP_ORDER}

    # Cross-artifact E score aggregates
    all_e1_raw = [a["dsqi"]["E1_conceptual_fidelity"]["score"] for (_, _, a) in all_reviews]
    all_e2_raw = [a["dsqi"]["E2_process_replicability"]["score"] for (_, _, a) in all_reviews]

    report = {
        "report": "Expert Review Report",
        "reviewers": reviewers,
        "n_reviewers": len(reviewers),
        "n_observations": len(all_reviews),
        "artifacts": artifact_reports,
        "cross_artifact": {
            "heuristics": cross_heuristic,
            "icap_distribution": icap_distribution,
            "e_scores": {
                "E1_grand_mean_raw": round(statistics.mean(all_e1_raw), 2),
                "E1_grand_mean_normalized": round(statistics.mean([norm_1_5(s) for s in all_e1_raw]), 4),
                "E2_grand_mean_raw": round(statistics.mean(all_e2_raw), 2),
                "E2_grand_mean_normalized": round(statistics.mean([norm_1_5(s) for s in all_e2_raw]), 4),
            },
            "constructionism": {
                "meaningful_grand_mean": round(statistics.mean(
                    [a["constructionism"]["meaningful_artifact"]["mean"] for a in artifact_reports]
                ), 2),
                "building_grand_mean": round(statistics.mean(
                    [a["constructionism"]["learning_through_building"]["mean"] for a in artifact_reports]
                ), 2),
            },
        },
    }

    out_path = OUTPUT_DIR / "expert_report.json"
    save_json(out_path, report)
    print(f"\n  → Report saved to {out_path.relative_to(ROOT)}")

    # Summary
    print(f"\n  Cross-artifact heuristic grand means:")
    for label, data in cross_heuristic.items():
        print(f"    {label}: {data['grand_mean']}")
    print(f"\n  ICAP distribution: {icap_distribution}")
    print(f"  E1 (Conceptual Fidelity) grand mean: {report['cross_artifact']['e_scores']['E1_grand_mean_raw']}/5")
    print(f"  E2 (Process Replicability) grand mean: {report['cross_artifact']['e_scores']['E2_grand_mean_raw']}/5")


if __name__ == "__main__":
    main()
