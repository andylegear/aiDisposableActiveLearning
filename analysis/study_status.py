"""
study_status.py — Study Progress Dashboard

Reads the artifact registry and evaluation data directories to display
the current status of every artifact across all three evaluation layers.

Usage:
    python analysis/study_status.py
    npm run status
"""

import json
import os
import sys
from pathlib import Path

# Resolve paths relative to this script
ROOT = Path(__file__).resolve().parent.parent
REGISTRY_PATH = ROOT / "data" / "artifact-registry.json"
DSQI_DIR = ROOT / "data" / "evaluations" / "layer1-dsqi"
EXPERT_DIR = ROOT / "data" / "evaluations" / "layer2-expert-review"
COORD_DIR = ROOT / "data" / "evaluations" / "layer3-coordinator-review"
DEV_LOG_DIR = ROOT / "data" / "development-logs"


def load_registry():
    with open(REGISTRY_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


def count_files(directory: Path, pattern: str) -> int:
    if not directory.exists():
        return 0
    return len(list(directory.glob(pattern)))


def get_dsqi_score(slug: str):
    path = DSQI_DIR / f"dsqi-{slug}.json"
    if path.exists():
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)
            return data.get("dsqi_score")
    return None


def count_expert_reviews(slug: str) -> int:
    if not EXPERT_DIR.exists():
        return 0
    return len(list(EXPERT_DIR.glob(f"expert-review-{slug}-*.json")))


def has_coordinator_review(slug: str) -> bool:
    return (COORD_DIR / f"coordinator-review-{slug}.json").exists()


def count_dev_sessions(slug: str) -> int:
    path = DEV_LOG_DIR / f"sessions-{slug}.json"
    if path.exists():
        with open(path, "r", encoding="utf-8") as f:
            sessions = json.load(f)
            return len(sessions) if isinstance(sessions, list) else 0
    return 0


def main():
    registry = load_registry()
    study = registry["study"]

    print("=" * 72)
    print(f"  STUDY: {study['title']}")
    print(f"  Phase: {study['current_phase'].upper()}")
    print(f"  Journal Target: {study['target_journal']}")
    print("=" * 72)
    print()

    header = f"{'#':<4} {'Artifact':<30} {'Status':<16} {'Sessions':<10} {'DSQI':<8} {'Expert':<8} {'Coord':<6}"
    print(header)
    print("-" * len(header))

    for a in registry["artifacts"]:
        slug = a["slug"]
        dsqi = get_dsqi_score(slug)
        dsqi_str = f"{dsqi:.3f}" if dsqi is not None else "—"
        expert_count = count_expert_reviews(slug)
        coord = "✓" if has_coordinator_review(slug) else "—"
        sessions = count_dev_sessions(slug)

        print(
            f"{a['id']:<4} "
            f"{a['name']:<30} "
            f"{a['status']:<16} "
            f"{sessions:<10} "
            f"{dsqi_str:<8} "
            f"{expert_count:<8} "
            f"{coord:<6}"
        )

    print()
    print("Legend: DSQI = Layer 1 score | Expert = # Layer 2 reviews | Coord = Layer 3 received")
    print()


if __name__ == "__main__":
    main()
