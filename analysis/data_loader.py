#!/usr/bin/env python3
"""
data_loader.py — Shared data loading module for all extended analysis scripts.

Provides standardised functions to load and flatten the three-layer evaluation
data, development logs, and artifact registry.

Usage:
    from data_loader import (
        ROOT, ARTIFACT_SLUGS, ARTIFACT_NAMES,
        load_registry, load_dsqi_files, load_expert_reviews,
        load_expert_flat, load_coordinator_reviews,
    )
"""

import json
from pathlib import Path

# ── Paths ──

ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = ROOT / "data"
DSQI_DIR = DATA_DIR / "evaluations" / "layer1-dsqi"
EXPERT_DIR = DATA_DIR / "evaluations" / "layer2-expert-review"
COORD_DIR = DATA_DIR / "evaluations" / "layer3-coordinator-review"
DEV_LOG_DIR = DATA_DIR / "development-logs"
REGISTRY_PATH = DATA_DIR / "artifact-registry.json"
OUTPUT_DIR = DATA_DIR / "extended-analysis"
FIGURES_DIR = OUTPUT_DIR / "figures"

# ── Constants ──

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

ICAP_SCORES = {
    "passive": 0.25,
    "active": 0.50,
    "constructive": 0.75,
    "interactive": 1.00,
}

HEURISTIC_KEYS = [
    "visibility_of_status",
    "match_with_real_world",
    "user_control_and_freedom",
    "consistency_and_standards",
    "error_prevention",
    "recognition_over_recall",
    "flexibility_and_efficiency",
    "aesthetic_and_minimalist_design",
    "help_with_errors",
    "instructional_scaffolding",
]

HEURISTIC_LABELS = [
    "Visibility of Status",
    "Match with Real World",
    "User Control & Freedom",
    "Consistency & Standards",
    "Error Prevention",
    "Recognition over Recall",
    "Flexibility & Efficiency",
    "Aesthetic & Minimalist",
    "Help with Errors",
    "Instructional Scaffolding",
]


# ── Generic helpers ──

def load_json(path: Path) -> dict:
    """Load a JSON file and return as dict."""
    return json.loads(path.read_text(encoding="utf-8"))


def save_json(path: Path, data, indent: int = 2):
    """Save data as pretty-printed JSON."""
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, indent=indent, ensure_ascii=False) + "\n",
                    encoding="utf-8")


def ensure_output_dirs():
    """Create output directories if they don't exist."""
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    FIGURES_DIR.mkdir(parents=True, exist_ok=True)
    (OUTPUT_DIR / "qualitative").mkdir(parents=True, exist_ok=True)


# ── Registry ──

def load_registry() -> dict:
    """Load the full artifact-registry.json."""
    return load_json(REGISTRY_PATH)


def load_registry_artifacts() -> list[dict]:
    """Return just the artifacts list from the registry."""
    return load_registry()["artifacts"]


# ── Layer 1: DSQI self-evaluation ──

def load_dsqi_files() -> dict[str, dict]:
    """Load all Layer 1 DSQI result files.

    Returns:
        dict mapping slug → DSQI data dict
    """
    results = {}
    for slug in ARTIFACT_SLUGS:
        path = DSQI_DIR / f"dsqi-{slug}.json"
        if path.exists():
            results[slug] = load_json(path)
    return results


# ── Layer 2: Expert reviews ──

def load_expert_reviews() -> list[dict]:
    """Load all expert review files (one per reviewer, each containing all 5 artifacts).

    Returns:
        list of expert review dicts (top-level, with .reviewer and .artifacts[])
    """
    reviews = []
    for path in sorted(EXPERT_DIR.glob("dsqi-review-*.json")):
        reviews.append(load_json(path))
    return reviews


def load_expert_flat() -> list[dict]:
    """Flatten expert reviews into one row per artifact-per-reviewer observation.

    Returns:
        list of dicts, each with keys:
            reviewer_name, reviewer_role, reviewer_experience,
            artifact_id, icap_level, icap_justification,
            constructionism_meaningful (score + justification),
            constructionism_building (score + justification),
            heuristics (dict of 10 scores + comments),
            E1_score, E1_justification, E2_score, E2_justification,
            open_ended (most_positive, most_negative, other_comments)
    """
    flat = []
    for review in load_expert_reviews():
        reviewer = review["reviewer"]
        for artifact in review["artifacts"]:
            row = {
                "reviewer_name": reviewer["name"],
                "reviewer_role": reviewer.get("role", ""),
                "reviewer_experience_years": reviewer.get("experience_years"),
                "reviewer_institution": reviewer.get("institution", ""),
                "artifact_id": artifact["artifact_id"],
                # ICAP
                "icap_level": artifact["icap"]["level"],
                "icap_justification": artifact["icap"]["justification"],
                # Constructionism
                "constructionism_meaningful_score": artifact["constructionism"]["meaningful_artifact"]["score"],
                "constructionism_meaningful_justification": artifact["constructionism"]["meaningful_artifact"]["justification"],
                "constructionism_building_score": artifact["constructionism"]["learning_through_building"]["score"],
                "constructionism_building_justification": artifact["constructionism"]["learning_through_building"]["justification"],
                # Heuristics (all 10 + comments)
                **{f"heuristic_{k}": artifact["heuristics"][k] for k in HEURISTIC_KEYS},
                "heuristic_comments": artifact["heuristics"].get("comments", ""),
                # DSQI E1/E2
                "E1_score": artifact["dsqi"]["E1_conceptual_fidelity"]["score"],
                "E1_justification": artifact["dsqi"]["E1_conceptual_fidelity"]["justification"],
                "E2_score": artifact["dsqi"]["E2_process_replicability"]["score"],
                "E2_justification": artifact["dsqi"]["E2_process_replicability"]["justification"],
                # Open-ended
                "open_most_positive": artifact["open_ended"]["most_positive"],
                "open_most_negative": artifact["open_ended"]["most_negative"],
                "open_other_comments": artifact["open_ended"].get("other_comments", ""),
            }
            flat.append(row)
    return flat


# ── Layer 3: Coordinator reviews ──

def load_coordinator_reviews() -> list[dict]:
    """Load all coordinator review files (one per artifact).

    Returns:
        list of coordinator review dicts
    """
    reviews = []
    for path in sorted(COORD_DIR.glob("dsqi-coordinator-*.json")):
        reviews.append(load_json(path))
    return reviews


def load_coordinator_flat() -> list[dict]:
    """Flatten coordinator reviews into one row per artifact.

    Returns:
        list of dicts with keys:
            artifact_id, coordinator_name, department, module, module_name,
            Q1-Q3 scores, P1_average,
            Q4_engagement_mode (ICAP),
            Q5_ease_of_integration, Q6_likelihood_of_use,
            Q7_benefit, Q8_drawback
    """
    flat = []
    for review in load_coordinator_reviews():
        row = {
            "artifact_id": review["artifact_id"],
            "coordinator_name": review["coordinator"]["name"],
            "department": review["coordinator"].get("department", ""),
            "module": review.get("module", ""),
            "module_name": review.get("module_name", ""),
            # Pedagogical alignment
            "Q1_curriculum_relevance": review["pedagogical_alignment"]["Q1_curriculum_relevance"],
            "Q2_concept_challenge": review["pedagogical_alignment"]["Q2_concept_challenge"],
            "Q3_objective_coverage": review["pedagogical_alignment"]["Q3_objective_coverage"],
            "P1_average": review["pedagogical_alignment"]["P1_average"],
            # ICAP
            "Q4_engagement_mode": review["icap"]["Q4_engagement_mode"],
            # Adoption
            "Q5_ease_of_integration": review["adoption_intention"]["Q5_ease_of_integration"],
            "Q6_likelihood_of_use": review["adoption_intention"]["Q6_likelihood_of_use"],
            # Open-ended
            "Q7_benefit": review["open_ended"]["Q7_most_significant_benefit"],
            "Q8_drawback": review["open_ended"]["Q8_most_significant_drawback"],
        }
        flat.append(row)
    return flat


# ── Development logs ──

def load_session_logs() -> dict[str, dict]:
    """Load development session logs.

    Returns:
        dict mapping slug → session data
    """
    results = {}
    for slug in ARTIFACT_SLUGS:
        path = DEV_LOG_DIR / f"sessions-{slug}.json"
        if path.exists():
            results[slug] = load_json(path)
    return results


def load_wakatime_logs() -> dict[str, dict]:
    """Load WakaTime log files.

    Returns:
        dict mapping slug → wakatime data
    """
    results = {}
    for path in sorted(DEV_LOG_DIR.glob("wakatime-*.json")):
        # Extract slug from filename: wakatime-{slug}-{date}.json
        name = path.stem  # e.g. "wakatime-01-unit-testing-gauntlet-2026-02-18"
        # Find slug by matching against known slugs
        for slug in ARTIFACT_SLUGS:
            if slug in name:
                results[slug] = load_json(path)
                break
    return results
