#!/usr/bin/env python3
"""
dsqi_score.py — Compute final DSQI scores from all three evaluation layers.

Reads:
    - Layer 1: data/evaluations/layer1-dsqi/dsqi-{slug}.json         (M and C from dsqi_collect.py)
    - Layer 2: data/evaluations/layer2-expert-review/dsqi-review-*.json   (E₁, E₂ per artifact per reviewer)
    - Layer 3: data/evaluations/layer3-coordinator-review/dsqi-coordinator-*.json  (P₁, P₂ per artifact)

Computes:
    P  = (P₁ + P₂) / 2    where P₁ = coordinator_P1_average / 5, P₂ = ICAP score
    E  = mean across reviewers of (E₁_norm + E₂_norm) / 2
    DSQI = 0.3(1-M) + 0.2(1-C) + 0.3P + 0.2E

Updates:
    - data/evaluations/layer1-dsqi/dsqi-{slug}.json   (fills in P, E, and dsqi_score)
    - data/artifact-registry.json                      (updates evaluation block)

Usage:
    python analysis/dsqi_score.py
    python analysis/dsqi_score.py --verbose
"""

import argparse
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DSQI_DIR = ROOT / "data" / "evaluations" / "layer1-dsqi"
EXPERT_DIR = ROOT / "data" / "evaluations" / "layer2-expert-review"
COORD_DIR = ROOT / "data" / "evaluations" / "layer3-coordinator-review"
REGISTRY_PATH = ROOT / "data" / "artifact-registry.json"

ICAP_SCORES = {
    "passive": 0.25,
    "active": 0.50,
    "constructive": 0.75,
    "interactive": 1.00,
}

WEIGHTS = {
    "w1_maintenance": 0.3,
    "w2_creation": 0.2,
    "w3_pedagogical": 0.3,
    "w4_purity": 0.2,
}

ARTIFACT_SLUGS = [
    "01-unit-testing-gauntlet",
    "02-big-o-visualiser",
    "03-sql-injection-simulator",
    "04-css-flexbox-trainer",
    "05-lexical-analyser-trainer",
]


def load_json(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def save_json(path: Path, data):
    path.write_text(json.dumps(data, indent=2) + "\n", encoding="utf-8")


def norm_1_5(score):
    """Normalize a 1-5 score to [0, 1] using (score - 1) / 4."""
    return (score - 1) / 4


# ── P Score (Pedagogical Alignment) from Coordinator Reviews ──

def compute_p_scores():
    """Compute P scores for each artifact from coordinator reviews."""
    p_scores = {}



    for path in sorted(COORD_DIR.glob("dsqi-coordinator-*.json")):
        data = load_json(path)
        slug = data["artifact_id"]  # e.g. "01-unit-testing-gauntlet"

        # P₁: concept coverage = P1_average / 5 (normalized to [0, 1])
        p1_avg = data["pedagogical_alignment"]["P1_average"]
        p1 = p1_avg / 5.0

        # P₂: ICAP level → score
        icap_level = data["icap"]["Q4_engagement_mode"]
        p2 = ICAP_SCORES[icap_level]

        # P = average(P₁, P₂)
        P = round((p1 + p2) / 2, 4)

        p_scores[slug] = {
            "coordinator": data["coordinator"]["name"],
            "P1_average_raw": p1_avg,
            "P1_normalized": round(p1, 4),
            "icap_level": icap_level,
            "icap_score": p2,
            "P_score": P,
        }

    return p_scores


# ── E Score (Pedagogical Purity) from Expert Reviews ──

def compute_e_scores():
    """Compute E scores for each artifact, averaged across expert reviewers."""
    # Collect per-artifact, per-reviewer E scores
    artifact_e_data = {slug: [] for slug in ARTIFACT_SLUGS}

    for path in sorted(EXPERT_DIR.glob("dsqi-review-*.json")):
        data = load_json(path)
        reviewer_name = data["reviewer"]["name"]

        for artifact in data["artifacts"]:
            slug = artifact["artifact_id"]
            e1_raw = artifact["dsqi"]["E1_conceptual_fidelity"]["score"]
            e2_raw = artifact["dsqi"]["E2_process_replicability"]["score"]
            e1_norm = norm_1_5(e1_raw)
            e2_norm = norm_1_5(e2_raw)
            e_avg = (e1_norm + e2_norm) / 2

            artifact_e_data[slug].append({
                "reviewer": reviewer_name,
                "E1_raw": e1_raw,
                "E1_normalized": round(e1_norm, 4),
                "E2_raw": e2_raw,
                "E2_normalized": round(e2_norm, 4),
                "E_per_reviewer": round(e_avg, 4),
            })

    # Average across reviewers
    e_scores = {}
    for slug, reviews in artifact_e_data.items():
        if not reviews:
            e_scores[slug] = None
            continue

        avg_e1 = sum(r["E1_normalized"] for r in reviews) / len(reviews)
        avg_e2 = sum(r["E2_normalized"] for r in reviews) / len(reviews)
        avg_e = sum(r["E_per_reviewer"] for r in reviews) / len(reviews)

        e_scores[slug] = {
            "reviewers": len(reviews),
            "reviews": reviews,
            "E1_mean": round(avg_e1, 4),
            "E2_mean": round(avg_e2, 4),
            "E_score": round(avg_e, 4),
        }

    return e_scores


# ── Update DSQI JSON files ──

def update_dsqi_files(p_scores, e_scores, verbose=False):
    """Patch each DSQI JSON file with P, E, and final DSQI score."""
    results = []

    for slug in ARTIFACT_SLUGS:
        dsqi_path = DSQI_DIR / f"dsqi-{slug}.json"
        if not dsqi_path.exists():
            print(f"  ⚠ DSQI file not found: {dsqi_path.name}")
            continue

        dsqi = load_json(dsqi_path)

        M = dsqi["maintenance_cost"]["M_score"]
        C = dsqi["creation_cost"]["C_score"]

        # Fill in P
        p_data = p_scores.get(slug)
        if p_data:
            dsqi["pedagogical_alignment"] = {
                "concept_coverage": p_data["P1_normalized"],
                "icap_level": p_data["icap_level"],
                "icap_score": p_data["icap_score"],
                "P_score": p_data["P_score"],
            }
            P = p_data["P_score"]
        else:
            P = None
            print(f"  ⚠ No coordinator review found for {slug}")

        # Fill in E
        e_data = e_scores.get(slug)
        if e_data:
            dsqi["pedagogical_purity"] = {
                "conceptual_fidelity_raw": None,  # averaged across reviewers
                "conceptual_fidelity_normalized": e_data["E1_mean"],
                "process_replicability_raw": None,  # averaged across reviewers
                "process_replicability_normalized": e_data["E2_mean"],
                "E_score": e_data["E_score"],
            }
            E = e_data["E_score"]
        else:
            E = None
            print(f"  ⚠ No expert reviews found for {slug}")

        # Compute final DSQI
        if P is not None and E is not None:
            dsqi_score = round(
                WEIGHTS["w1_maintenance"] * (1 - M) +
                WEIGHTS["w2_creation"] * (1 - C) +
                WEIGHTS["w3_pedagogical"] * P +
                WEIGHTS["w4_purity"] * E,
                4
            )
            dsqi["dsqi_score"] = dsqi_score
            dsqi["notes"] = "Full DSQI computed. M and C from dsqi_collect.py; P from coordinator review; E averaged across 3 expert reviews."
        else:
            dsqi_score = None

        save_json(dsqi_path, dsqi)

        results.append({
            "slug": slug,
            "M": M,
            "C": C,
            "P": P,
            "E": E,
            "DSQI": dsqi_score,
        })

        if verbose and p_data:
            print(f"\n  {slug}")
            print(f"    Coordinator: {p_data['coordinator']}")
            print(f"    P₁ (coverage): {p_data['P1_average_raw']}/5 → {p_data['P1_normalized']}")
            print(f"    P₂ (ICAP):     {p_data['icap_level']} → {p_data['icap_score']}")
            print(f"    P:             {P}")
        if verbose and e_data:
            for r in e_data["reviews"]:
                print(f"    E [{r['reviewer']}]: E1={r['E1_raw']}→{r['E1_normalized']}, E2={r['E2_raw']}→{r['E2_normalized']}, avg={r['E_per_reviewer']}")
            print(f"    E (mean):      {E}")
        if verbose and dsqi_score:
            print(f"    DSQI:          {dsqi_score}")

    return results


# ── Update artifact-registry.json ──

def update_registry(results):
    """Update the artifact registry with final DSQI scores and review counts."""
    registry = load_json(REGISTRY_PATH)

    # Count expert reviews per artifact
    expert_counts = {slug: 0 for slug in ARTIFACT_SLUGS}
    for path in EXPERT_DIR.glob("dsqi-review-*.json"):
        data = load_json(path)
        for artifact in data["artifacts"]:
            slug = artifact["artifact_id"]
            if slug in expert_counts:
                expert_counts[slug] += 1

    for artifact in registry["artifacts"]:
        slug = artifact["slug"]
        match = next((r for r in results if r["slug"] == slug), None)
        if not match:
            continue

        # Update evaluation block
        if "evaluation" not in artifact:
            artifact["evaluation"] = {}

        eval_block = artifact["evaluation"]
        eval_block["dsqi_score"] = match["DSQI"]
        eval_block["dsqi_completed"] = match["DSQI"] is not None

        # Update dsqi_partial if it exists, otherwise create it
        if "dsqi_partial" not in eval_block:
            eval_block["dsqi_partial"] = {}

        eval_block["dsqi_partial"]["M_score"] = match["M"]
        eval_block["dsqi_partial"]["C_score"] = match["C"]
        eval_block["dsqi_partial"]["P_score"] = match["P"]
        eval_block["dsqi_partial"]["E_score"] = match["E"]

        eval_block["expert_reviews_received"] = expert_counts.get(slug, 0)
        eval_block["coordinator_review_received"] = match["P"] is not None

    # Update study phase
    all_complete = all(r["DSQI"] is not None for r in results)
    if all_complete:
        registry["study"]["current_phase"] = "analysis"

    save_json(REGISTRY_PATH, registry)


# ── Main ──

def main():
    parser = argparse.ArgumentParser(description="Compute final DSQI scores from all evaluation layers")
    parser.add_argument("--verbose", "-v", action="store_true", help="Show detailed computation")
    args = parser.parse_args()

    print("╔══════════════════════════════════════════════════════════╗")
    print("║  DSQI Final Scoring                                     ║")
    print("╚══════════════════════════════════════════════════════════╝")
    print()

    # Compute P and E
    print("▸ Computing P scores from coordinator reviews...")
    p_scores = compute_p_scores()
    for slug, data in p_scores.items():
        if data:
            print(f"  {slug}: P = {data['P_score']} (P₁={data['P1_normalized']}, P₂={data['icap_score']} [{data['icap_level']}])")

    print()
    print("▸ Computing E scores from expert reviews...")
    e_scores = compute_e_scores()
    for slug in ARTIFACT_SLUGS:
        data = e_scores.get(slug)
        if data:
            print(f"  {slug}: E = {data['E_score']} (E₁={data['E1_mean']}, E₂={data['E2_mean']}, n={data['reviewers']})")

    print()
    print("▸ Updating DSQI files with P, E, and final scores...")
    results = update_dsqi_files(p_scores, e_scores, verbose=args.verbose)

    print()
    print("▸ Updating artifact registry...")
    update_registry(results)

    # Summary table
    print()
    print("=" * 80)
    print(f"  {'Artifact':<35} {'M':>6} {'C':>6} {'P':>6} {'E':>6} {'DSQI':>7}")
    print("-" * 80)
    for r in results:
        name = r["slug"]
        m = f"{r['M']:.4f}" if r["M"] else "  —"
        c = f"{r['C']:.4f}" if r["C"] else "  —"
        p = f"{r['P']:.4f}" if r["P"] else "  —"
        e = f"{r['E']:.4f}" if r["E"] else "  —"
        d = f"{r['DSQI']:.4f}" if r["DSQI"] else "   —"
        print(f"  {name:<35} {m:>6} {c:>6} {p:>6} {e:>6} {d:>7}")
    print("=" * 80)

    # DSQI formula reminder
    print()
    print("  DSQI = 0.3(1−M) + 0.2(1−C) + 0.3P + 0.2E")
    print()

    mean_dsqi = [r["DSQI"] for r in results if r["DSQI"] is not None]
    if mean_dsqi:
        avg = sum(mean_dsqi) / len(mean_dsqi)
        print(f"  Mean DSQI across {len(mean_dsqi)} artifacts: {avg:.4f}")
        print(f"  Range: [{min(mean_dsqi):.4f}, {max(mean_dsqi):.4f}]")
    print()


if __name__ == "__main__":
    main()
