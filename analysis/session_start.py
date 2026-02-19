#!/usr/bin/env python3
"""
session_start.py — Start a new development session for an artifact.

Usage:
    python analysis/session_start.py --artifact 2

What it does:
    1. Records an exact ISO 8601 timestamp.
    2. Looks up the artifact in artifact-registry.json.
    3. Sets its status to "in-development" and records start_date if not already set.
    4. Creates or appends to the session log file in data/development-logs/.
    5. Prints a confirmation with session number and timestamp.
"""

import argparse
import json
import sys
from datetime import datetime, timezone
from pathlib import Path

STUDY_ROOT = Path(__file__).resolve().parent.parent
REGISTRY_PATH = STUDY_ROOT / "data" / "artifact-registry.json"
DEV_LOGS_DIR = STUDY_ROOT / "data" / "development-logs"


def load_registry() -> dict:
    return json.loads(REGISTRY_PATH.read_text(encoding="utf-8"))


def save_registry(data: dict):
    REGISTRY_PATH.write_text(json.dumps(data, indent=2) + "\n", encoding="utf-8")


def get_artifact(registry: dict, artifact_id: int) -> dict | None:
    for a in registry["artifacts"]:
        if a["id"] == artifact_id:
            return a
    return None


def get_session_log_path(slug: str) -> Path:
    return DEV_LOGS_DIR / f"sessions-{slug}.json"


def load_sessions(path: Path) -> list:
    if path.exists():
        return json.loads(path.read_text(encoding="utf-8"))
    return []


def save_sessions(path: Path, sessions: list):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(sessions, indent=2) + "\n", encoding="utf-8")


def main():
    parser = argparse.ArgumentParser(description="Start a new development session")
    parser.add_argument("--artifact", type=int, required=True, help="Artifact ID (1-5)")
    parser.add_argument("--ai-tool", default="GitHub Copilot with Claude Opus 4.6", help="AI tool being used")
    args = parser.parse_args()

    now = datetime.now(timezone.utc)
    now_local = datetime.now().astimezone()
    ts_utc = now.isoformat()
    ts_local = now_local.isoformat()
    date_str = now.strftime("%Y-%m-%d")

    # --- Registry ---
    registry = load_registry()
    artifact = get_artifact(registry, args.artifact)
    if not artifact:
        print(f"ERROR: Artifact {args.artifact} not found in registry.", file=sys.stderr)
        sys.exit(1)

    slug = artifact["slug"]
    name = artifact["name"]

    if artifact["status"] == "developed":
        print(f"WARNING: Artifact {args.artifact} ({name}) is already marked as 'developed'.", file=sys.stderr)
        print("Proceeding anyway — this may be an additional development session.", file=sys.stderr)

    if artifact["status"] in ("not-started", None):
        artifact["status"] = "in-development"
    if not artifact["development"].get("start_date"):
        artifact["development"]["start_date"] = ts_utc
    registry["current_phase"] = "development"
    save_registry(registry)

    # --- Session Log ---
    log_path = get_session_log_path(slug)
    sessions = load_sessions(log_path)
    session_number = len(sessions) + 1

    new_session = {
        "artifact_id": args.artifact,
        "artifact_slug": slug,
        "session_number": session_number,
        "timestamp": ts_local,
        "date": date_str,
        "duration_minutes": None,
        "ai_tools_used": [args.ai_tool],
        "prompts": [],
        "prompt_strategy": None,
        "outcome": None,
        "observations": None,
        "code_written_lines": None,
        "code_ai_generated_lines": None,
        "prompts_count": 0,
        "challenges": [],
    }

    sessions.append(new_session)
    save_sessions(log_path, sessions)

    # --- Output ---
    print(f"✓ Session {session_number} started for Artifact {args.artifact}: {name}")
    print(f"  Slug:      {slug}")
    print(f"  Timestamp: {ts_local}")
    print(f"  UTC:       {ts_utc}")
    print(f"  Log file:  {log_path.relative_to(STUDY_ROOT)}")
    print(f"  Registry:  status = {artifact['status']}")
    print()
    print(f"  When you're done, run:")
    print(f"    python analysis/session_close.py --artifact {args.artifact}")


if __name__ == "__main__":
    main()
