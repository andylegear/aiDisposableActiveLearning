#!/usr/bin/env python3
"""
session_close.py — Close out a development session for an artifact.

Usage:
    python analysis/session_close.py --artifact 2
    python analysis/session_close.py --artifact 2 --final
    python analysis/session_close.py --artifact 2 --final --tech "HTML,CSS,JavaScript"

What it does:
    1. Records an exact ISO 8601 closing timestamp.
    2. Counts lines of code in the artifact's src/ directory.
    3. Fetches WakaTime stats for the project (today) and saves the raw response.
    4. Updates the open session entry in the development log with:
       - closed_timestamp, duration_minutes, files_produced, total_lines, wakatime block
    5. If --final: updates artifact-registry.json status to "developed", records
       end_date, total LOC, dependency count, WakaTime seconds, tech stack.
"""

import argparse
import json
import sys
from datetime import datetime, timezone
from pathlib import Path

STUDY_ROOT = Path(__file__).resolve().parent.parent
REGISTRY_PATH = STUDY_ROOT / "data" / "artifact-registry.json"
DEV_LOGS_DIR = STUDY_ROOT / "data" / "development-logs"
ARTIFACTS_DIR = STUDY_ROOT / "artifacts"

# Language detection by extension
EXT_LANG = {
    ".html": "HTML",
    ".htm": "HTML",
    ".css": "CSS",
    ".js": "JavaScript",
    ".ts": "TypeScript",
    ".jsx": "JSX",
    ".tsx": "TSX",
    ".py": "Python",
    ".json": "JSON",
    ".md": "Markdown",
    ".svg": "SVG",
    ".xml": "XML",
}


def load_json(path: Path) -> dict | list:
    return json.loads(path.read_text(encoding="utf-8"))


def save_json(path: Path, data):
    path.write_text(json.dumps(data, indent=2) + "\n", encoding="utf-8")


def get_artifact(registry: dict, artifact_id: int) -> dict | None:
    for a in registry["artifacts"]:
        if a["id"] == artifact_id:
            return a
    return None


def count_source_lines(src_dir: Path) -> list[dict]:
    """Count lines per file in a src/ directory. Returns list of {file, lines, language}."""
    if not src_dir.exists():
        return []
    results = []
    for f in sorted(src_dir.iterdir()):
        if f.is_file() and not f.name.startswith("."):
            lines = len(f.read_text(encoding="utf-8", errors="replace").splitlines())
            lang = EXT_LANG.get(f.suffix.lower(), f.suffix.lstrip(".").upper() or "Unknown")
            results.append({"file": f.name, "lines": lines, "language": lang})
    return results


def fetch_wakatime(project: str, query_date: str) -> dict | None:
    """Fetch WakaTime summary. Returns None if unavailable."""
    try:
        # Reuse wakatime_fetch module
        sys.path.insert(0, str(Path(__file__).resolve().parent))
        from wakatime_fetch import get_api_key, fetch_summaries, extract_summary, save_raw

        api_key = get_api_key()
        raw = fetch_summaries(api_key, project, query_date)
        save_raw(raw, project, query_date)

        summary = extract_summary(raw)
        summary["project"] = project
        return summary
    except SystemExit:
        print("WARNING: Could not fetch WakaTime data (API key issue). Skipping.", file=sys.stderr)
        return None
    except Exception as e:
        print(f"WARNING: WakaTime fetch failed: {e}. Skipping.", file=sys.stderr)
        return None


def main():
    parser = argparse.ArgumentParser(description="Close out a development session")
    parser.add_argument("--artifact", type=int, required=True, help="Artifact ID (1-5)")
    parser.add_argument("--final", action="store_true", help="Mark artifact as fully developed (updates registry)")
    parser.add_argument("--tech", help="Comma-separated tech stack, e.g. 'HTML,CSS,JavaScript'")
    parser.add_argument("--deps", type=int, default=0, help="Number of external dependencies (default: 0)")
    parser.add_argument("--ai-ratio", type=float, default=1.0, help="AI generation ratio 0.0-1.0 (default: 1.0)")
    parser.add_argument("--skip-wakatime", action="store_true", help="Skip WakaTime fetch")
    args = parser.parse_args()

    now_local = datetime.now().astimezone()
    now_utc = datetime.now(timezone.utc)
    ts_local = now_local.isoformat()
    ts_utc = now_utc.isoformat()
    date_str = now_utc.strftime("%Y-%m-%d")

    # --- Load registry ---
    registry = load_json(REGISTRY_PATH)
    artifact = get_artifact(registry, args.artifact)
    if not artifact:
        print(f"ERROR: Artifact {args.artifact} not found in registry.", file=sys.stderr)
        sys.exit(1)

    slug = artifact["slug"]
    name = artifact["name"]

    # --- Count source lines ---
    src_dir = ARTIFACTS_DIR / slug / "src"
    file_stats = count_source_lines(src_dir)
    total_lines = sum(f["lines"] for f in file_stats)

    print(f"Source files in {src_dir.relative_to(STUDY_ROOT)}:")
    for f in file_stats:
        print(f"  {f['file']:30s} {f['lines']:>5d} lines  ({f['language']})")
    print(f"  {'TOTAL':30s} {total_lines:>5d} lines")
    print()

    # --- Fetch WakaTime ---
    waka_summary = None
    if not args.skip_wakatime:
        print("Fetching WakaTime stats...", file=sys.stderr)
        waka_summary = fetch_wakatime(slug, date_str)
        if waka_summary:
            print(f"  WakaTime active time: {waka_summary['total_text']} ({waka_summary['total_seconds']:.1f}s)")
        else:
            print("  WakaTime: no data (skipped or failed)")
        print()

    # --- Update session log ---
    log_path = DEV_LOGS_DIR / f"sessions-{slug}.json"
    if not log_path.exists():
        print(f"ERROR: Session log not found at {log_path}", file=sys.stderr)
        sys.exit(1)

    sessions = load_json(log_path)
    # Find the last open session
    open_session = None
    for s in reversed(sessions):
        if not s.get("session_closed"):
            open_session = s
            break

    if not open_session:
        print("WARNING: No open session found. Creating a close-out entry on the last session.", file=sys.stderr)
        open_session = sessions[-1] if sessions else None

    if open_session:
        # Calculate duration from session start to now
        try:
            start_ts = datetime.fromisoformat(open_session["timestamp"])
            duration = (now_local - start_ts).total_seconds() / 60
            open_session["duration_minutes"] = round(duration)
        except (ValueError, KeyError):
            pass

        open_session["session_closed"] = True
        open_session["closed_timestamp"] = ts_local
        open_session["code_ai_generated_lines"] = round(total_lines * args.ai_ratio)
        open_session["code_written_lines"] = total_lines - round(total_lines * args.ai_ratio)
        open_session["files_produced"] = file_stats
        open_session["total_lines"] = total_lines

        if waka_summary:
            open_session["wakatime"] = waka_summary

        # Auto-compute duration note
        waka_text = waka_summary["total_text"] if waka_summary else "N/A"
        dur = open_session.get("duration_minutes", "?")
        open_session["duration_estimate_note"] = (
            f"Session wall-clock time approx {dur} mins. "
            f"WakaTime active editor time: {waka_text}."
        )

        save_json(log_path, sessions)
        print(f"✓ Session closed in {log_path.relative_to(STUDY_ROOT)}")
        print(f"  Closed at: {ts_local}")
        print(f"  Duration:  ~{open_session.get('duration_minutes', '?')} minutes")
    else:
        print("ERROR: No sessions found in log.", file=sys.stderr)
        sys.exit(1)

    # --- Update registry (if --final) ---
    if args.final:
        artifact["status"] = "developed"
        artifact["development"]["end_date"] = ts_utc
        artifact["development"]["lines_of_code"] = total_lines
        artifact["development"]["ai_generation_ratio"] = args.ai_ratio
        artifact["development"]["dependency_count"] = args.deps

        # Count total sessions and duration
        artifact["development"]["total_sessions"] = len(sessions)
        total_dur = sum(s.get("duration_minutes", 0) or 0 for s in sessions)
        artifact["development"]["total_duration_minutes"] = total_dur

        if waka_summary:
            # Accumulate WakaTime seconds across all sessions that have wakatime data
            total_waka = sum(
                s.get("wakatime", {}).get("total_seconds", 0) for s in sessions
            )
            artifact["development"]["wakatime_active_seconds"] = total_waka

        if args.tech:
            artifact["tech_stack"] = [t.strip() for t in args.tech.split(",")]

        save_json(REGISTRY_PATH, registry)
        print()
        print(f"✓ Registry updated: Artifact {args.artifact} ({name}) → status = 'developed'")
        print(f"  End date:    {ts_utc}")
        print(f"  Lines:       {total_lines}")
        print(f"  Sessions:    {len(sessions)}")
        print(f"  Total time:  {total_dur} mins")
        if args.tech:
            print(f"  Tech stack:  {artifact['tech_stack']}")
    else:
        print()
        print(f"Session closed but artifact NOT finalized.")
        print(f"To finalize, run:")
        print(f"  python analysis/session_close.py --artifact {args.artifact} --final --tech \"HTML,CSS,JavaScript\"")

    print()
    print(f"Timestamp (local): {ts_local}")
    print(f"Timestamp (UTC):   {ts_utc}")


if __name__ == "__main__":
    main()
