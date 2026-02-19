#!/usr/bin/env python3
"""
timestamp.py — Reliable ISO 8601 timestamp utility.

Usage:
    python analysis/timestamp.py              # prints UTC timestamp
    python analysis/timestamp.py --local      # prints local timestamp with offset
    python analysis/timestamp.py --file       # writes to .timestamp.tmp and prints

Designed to be called by AI assistants that struggle with terminal output
truncation when running PowerShell's Get-Date.
"""

import argparse
import json
from datetime import datetime, timezone


def get_timestamp(local: bool = False) -> str:
    """Return an ISO 8601 timestamp string."""
    if local:
        now = datetime.now().astimezone()
    else:
        now = datetime.now(timezone.utc)
    return now.isoformat()


def main():
    parser = argparse.ArgumentParser(description="Print an ISO 8601 timestamp")
    parser.add_argument("--local", action="store_true", help="Use local time with UTC offset (default: UTC)")
    parser.add_argument("--file", action="store_true", help="Also write to .timestamp.tmp")
    parser.add_argument("--json", action="store_true", dest="as_json", help="Output as JSON object")
    args = parser.parse_args()

    ts = get_timestamp(local=args.local)

    if args.as_json:
        print(json.dumps({"timestamp": ts}))
    else:
        print(ts)

    if args.file:
        from pathlib import Path
        root = Path(__file__).resolve().parent.parent
        tmp = root / ".timestamp.tmp"
        tmp.write_text(ts, encoding="utf-8")


if __name__ == "__main__":
    main()
