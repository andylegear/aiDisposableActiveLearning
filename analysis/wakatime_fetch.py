#!/usr/bin/env python3
"""
wakatime_fetch.py — Fetch WakaTime stats for a project on a given date.

Usage:
    python analysis/wakatime_fetch.py --project 01-unit-testing-gauntlet
    python analysis/wakatime_fetch.py --project 01-unit-testing-gauntlet --date 2026-02-18
    python analysis/wakatime_fetch.py --project 01-unit-testing-gauntlet --save
    python analysis/wakatime_fetch.py --project 01-unit-testing-gauntlet --summary

Reads the API key from ~/.wakatime.cfg (standard WakaTime config).
Queries the WakaTime Summaries API for per-project stats.
"""

import argparse
import base64
import json
import sys
import urllib.request
import urllib.error
from datetime import date, datetime, timezone
from pathlib import Path

STUDY_ROOT = Path(__file__).resolve().parent.parent
WAKATIME_CFG = Path.home() / ".wakatime.cfg"
WAKATIME_API_BASE = "https://wakatime.com/api/v1"
DEV_LOGS_DIR = STUDY_ROOT / "data" / "development-logs"


def get_api_key() -> str:
    """Read API key from ~/.wakatime.cfg."""
    if not WAKATIME_CFG.exists():
        print(f"ERROR: WakaTime config not found at {WAKATIME_CFG}", file=sys.stderr)
        sys.exit(1)

    for line in WAKATIME_CFG.read_text(encoding="utf-8").splitlines():
        if line.strip().startswith("api_key"):
            return line.split("=", 1)[1].strip()

    print("ERROR: No api_key found in ~/.wakatime.cfg", file=sys.stderr)
    sys.exit(1)


def fetch_summaries(api_key: str, project: str, query_date: str) -> dict:
    """Query WakaTime Summaries API for a project on a given date."""
    url = (
        f"{WAKATIME_API_BASE}/users/current/summaries"
        f"?start={query_date}&end={query_date}&project={project}"
    )
    auth = base64.b64encode(api_key.encode("ascii")).decode("ascii")
    req = urllib.request.Request(url, headers={"Authorization": f"Basic {auth}"})

    try:
        with urllib.request.urlopen(req) as resp:
            return json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        print(f"ERROR: WakaTime API returned {e.code}: {e.reason}", file=sys.stderr)
        sys.exit(1)


def extract_summary(raw: dict) -> dict:
    """Extract a compact summary from the full API response."""
    if not raw.get("data"):
        return {"error": "No data returned from WakaTime API", "raw": raw}

    day = raw["data"][0]
    grand = day.get("grand_total", {})

    summary = {
        "project": None,
        "date": day.get("range", {}).get("date"),
        "total_seconds": grand.get("total_seconds", 0),
        "total_text": grand.get("text", "0 secs"),
        "categories": {},
        "languages": {},
        "files": [],
        "machine": None,
        "editor": None,
    }

    # Categories (Coding, Writing Docs, AI Coding, etc.)
    for cat in day.get("categories", []):
        key = cat["name"].lower().replace(" ", "_") + "_seconds"
        summary["categories"][key] = cat["total_seconds"]

    # Languages
    for lang in day.get("languages", []):
        summary["languages"][lang["name"]] = {
            "seconds": lang["total_seconds"],
            "percent": lang.get("percent", 0),
        }

    # Files
    for entity in day.get("entities", []):
        name = entity["name"].rsplit("/", 1)[-1].rsplit("\\", 1)[-1]  # basename
        summary["files"].append({
            "name": name,
            "seconds": entity["total_seconds"],
        })

    # Machine + Editor (first entry)
    machines = day.get("machines", [])
    if machines:
        summary["machine"] = machines[0].get("name")
    editors = day.get("editors", [])
    if editors:
        summary["editor"] = editors[0].get("name")

    return summary


def save_raw(raw: dict, project: str, query_date: str) -> Path:
    """Save the full API response to the development-logs directory."""
    DEV_LOGS_DIR.mkdir(parents=True, exist_ok=True)
    filename = f"wakatime-{project}-{query_date}.json"
    out_path = DEV_LOGS_DIR / filename
    out_path.write_text(json.dumps(raw, indent=2) + "\n", encoding="utf-8")
    return out_path


def main():
    parser = argparse.ArgumentParser(description="Fetch WakaTime stats for a study artifact")
    parser.add_argument("--project", required=True, help="WakaTime project name (= artifact slug, e.g. 01-unit-testing-gauntlet)")
    parser.add_argument("--date", default=date.today().isoformat(), help="Date to query (YYYY-MM-DD, default: today)")
    parser.add_argument("--save", action="store_true", help="Save full API response to data/development-logs/")
    parser.add_argument("--summary", action="store_true", help="Print compact summary instead of full response")
    parser.add_argument("--json", action="store_true", dest="as_json", help="Output raw JSON (for piping)")
    args = parser.parse_args()

    api_key = get_api_key()
    raw = fetch_summaries(api_key, args.project, args.date)

    if args.save:
        path = save_raw(raw, args.project, args.date)
        print(f"Saved: {path}", file=sys.stderr)

    if args.summary:
        summary = extract_summary(raw)
        summary["project"] = args.project
        print(json.dumps(summary, indent=2))
    elif args.as_json:
        print(json.dumps(raw, indent=2))
    else:
        # Human-readable output
        summary = extract_summary(raw)
        grand_secs = summary["total_seconds"]
        mins = int(grand_secs // 60)
        secs = int(grand_secs % 60)
        print(f"WakaTime — {args.project} ({args.date})")
        print(f"  Total active time: {mins}m {secs}s ({grand_secs:.1f}s)")
        print(f"  Categories:")
        for k, v in summary["categories"].items():
            print(f"    {k}: {v:.1f}s")
        print(f"  Languages:")
        for lang, info in summary["languages"].items():
            print(f"    {lang}: {info['seconds']:.1f}s ({info['percent']:.1f}%)")
        print(f"  Files:")
        for f in summary["files"]:
            print(f"    {f['name']}: {f['seconds']:.1f}s")
        print(f"  Machine: {summary['machine']}")
        print(f"  Editor:  {summary['editor']}")


if __name__ == "__main__":
    main()
