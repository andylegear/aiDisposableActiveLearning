#!/usr/bin/env python3
"""
generate_coordinator_report.py — Summarise coordinator review data.

Reads Layer 3 coordinator review JSON files and produces a report with
pedagogical alignment, ICAP classifications, adoption intention, and
qualitative feedback.

Output:
    analysis/output/coordinator_report.json

Usage:
    python analysis/generate_coordinator_report.py
"""

import json
import statistics
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
COORD_DIR = ROOT / "data" / "evaluations" / "layer3-coordinator-review"
OUTPUT_DIR = ROOT / "analysis" / "output"

ICAP_ORDER = ["passive", "active", "constructive", "interactive"]


def load_json(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def save_json(path: Path, data):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, indent=2) + "\n", encoding="utf-8")


def main():
    print("╔══════════════════════════════════════════════════════════╗")
    print("║  Coordinator Review Report Generator                     ║")
    print("╚══════════════════════════════════════════════════════════╝\n")

    reviews = []

    for path in sorted(COORD_DIR.glob("dsqi-coordinator-*.json")):
        data = load_json(path)
        reviews.append(data)

    print(f"  Loaded {len(reviews)} coordinator reviews\n")

    # Per-artifact summaries
    artifact_summaries = []
    all_q1, all_q2, all_q3, all_p1 = [], [], [], []
    all_q5, all_q6 = [], []
    all_icap = []

    for review in sorted(reviews, key=lambda r: r["artifact_id"]):
        slug = review["artifact_id"]
        name = review.get("artifact_name", slug)
        coordinator = review["coordinator"]["name"]
        department = review["coordinator"]["department"]

        pa = review["pedagogical_alignment"]
        q1 = pa["Q1_curriculum_relevance"]
        q2 = pa["Q2_concept_challenge"]
        q3 = pa["Q3_objective_coverage"]
        p1 = pa["P1_average"]

        icap_mode = review["icap"]["Q4_engagement_mode"]
        q5 = review["adoption_intention"]["Q5_ease_of_integration"]
        q6 = review["adoption_intention"]["Q6_likelihood_of_use"]
        adoption_mean = round((q5 + q6) / 2, 2)

        q7 = review["open_ended"]["Q7_most_significant_benefit"]
        q8 = review["open_ended"]["Q8_most_significant_drawback"]

        all_q1.append(q1)
        all_q2.append(q2)
        all_q3.append(q3)
        all_p1.append(p1)
        all_q5.append(q5)
        all_q6.append(q6)
        all_icap.append(icap_mode)

        summary = {
            "artifact_id": slug,
            "artifact_name": name,
            "coordinator": coordinator,
            "department": department,
            "module": review.get("module", ""),
            "module_name": review.get("module_name", ""),
            "pedagogical_alignment": {
                "Q1_curriculum_relevance": q1,
                "Q2_concept_challenge": q2,
                "Q3_objective_coverage": q3,
                "P1_average": p1,
            },
            "icap": {
                "engagement_mode": icap_mode,
            },
            "adoption_intention": {
                "Q5_ease_of_integration": q5,
                "Q6_likelihood_of_use": q6,
                "adoption_mean": adoption_mean,
            },
            "open_ended": {
                "most_significant_benefit": q7,
                "most_significant_drawback": q8,
            },
        }
        artifact_summaries.append(summary)

        print(f"  ✓ {name:<30} P1={p1:.2f}  ICAP={icap_mode:<14}  Q5={q5}  Q6={q6}  ({coordinator})")

    # Aggregates
    n = len(reviews)
    aggregate = {
        "n": n,
        "pedagogical_alignment": {
            "Q1_mean": round(statistics.mean(all_q1), 2),
            "Q1_stdev": round(statistics.stdev(all_q1), 2) if n > 1 else 0,
            "Q2_mean": round(statistics.mean(all_q2), 2),
            "Q2_stdev": round(statistics.stdev(all_q2), 2) if n > 1 else 0,
            "Q3_mean": round(statistics.mean(all_q3), 2),
            "Q3_stdev": round(statistics.stdev(all_q3), 2) if n > 1 else 0,
            "P1_mean": round(statistics.mean(all_p1), 2),
            "P1_stdev": round(statistics.stdev(all_p1), 2) if n > 1 else 0,
        },
        "icap_distribution": {level: all_icap.count(level) for level in ICAP_ORDER},
        "adoption_intention": {
            "Q5_mean": round(statistics.mean(all_q5), 2),
            "Q5_stdev": round(statistics.stdev(all_q5), 2) if n > 1 else 0,
            "Q6_mean": round(statistics.mean(all_q6), 2),
            "Q6_stdev": round(statistics.stdev(all_q6), 2) if n > 1 else 0,
            "adoption_mean": round(statistics.mean([(q5 + q6) / 2 for q5, q6 in zip(all_q5, all_q6)]), 2),
        },
    }

    report = {
        "report": "Coordinator Review Report",
        "artifacts": artifact_summaries,
        "aggregate": aggregate,
    }

    out_path = OUTPUT_DIR / "coordinator_report.json"
    save_json(out_path, report)
    print(f"\n  → Report saved to {out_path.relative_to(ROOT)}")

    print(f"\n  Aggregate:")
    print(f"    P1 mean: {aggregate['pedagogical_alignment']['P1_mean']} (SD={aggregate['pedagogical_alignment']['P1_stdev']})")
    print(f"    ICAP distribution: {aggregate['icap_distribution']}")
    print(f"    Adoption mean: {aggregate['adoption_intention']['adoption_mean']}")
    print(f"    Q5 (Ease) mean: {aggregate['adoption_intention']['Q5_mean']}")
    print(f"    Q6 (Likelihood) mean: {aggregate['adoption_intention']['Q6_mean']}")


if __name__ == "__main__":
    main()
