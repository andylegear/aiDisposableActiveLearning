#!/usr/bin/env python3
"""
run_extended.py — Runner for All Extended Analyses

Convenience script to run all extended analysis scripts (A–J) in sequence.
Supports selective execution via --only and --skip flags.

Usage:
    python analysis/run_extended.py              # Run all (except J)
    python analysis/run_extended.py --all        # Run all including J (qualitative)
    python analysis/run_extended.py --only A B C # Run specific analyses
    python analysis/run_extended.py --skip H I   # Skip specific analyses
    python analysis/run_extended.py --no-figures  # Suppress figure generation
    python analysis/run_extended.py --dry-run    # Dry-run for J (extract only)
"""

import argparse
import sys
import time
import traceback
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

ANALYSES = {
    "A": ("extended_descriptive",       "Descriptive Statistics"),
    "B": ("extended_irr",               "Inter-Rater Reliability"),
    "C": ("extended_heuristic_profiles", "Heuristic Usability Profiles"),
    "D": ("extended_icap",              "ICAP Concordance"),
    "E": ("extended_adoption",          "Adoption Intention"),
    "F": ("extended_constructionism",   "Constructionism Alignment"),
    "G": ("extended_efficiency",        "Development Efficiency"),
    "H": ("extended_sensitivity",       "DSQI Sensitivity Analysis"),
    "I": ("extended_correlations",      "Cross-Layer Correlations"),
    "J": ("extended_qualitative",       "AI-Assisted Thematic Analysis"),
}


def run_analysis(key, module_name, label, verbose=False, no_figures=False, dry_run=False):
    """Import and run a single analysis module."""
    print()
    print(f"{'─' * 60}")
    print(f"  Running Analysis {key}: {label}")
    print(f"{'─' * 60}")
    print()

    try:
        module = __import__(module_name)
        run_fn = module.run

        kwargs = {"verbose": verbose}

        # Pass figures flag to scripts that support it
        if key in ("C", "D", "F", "G", "H", "I"):
            kwargs["figures"] = not no_figures

        # Pass dry_run to qualitative analysis
        if key == "J":
            kwargs["dry_run"] = dry_run

        start = time.time()
        result = run_fn(**kwargs)
        elapsed = time.time() - start

        print(f"\n  ✓ Analysis {key} completed in {elapsed:.1f}s")
        return True

    except Exception as e:
        print(f"\n  ✗ Analysis {key} failed: {e}")
        if verbose:
            traceback.print_exc()
        return False


def main():
    parser = argparse.ArgumentParser(
        description="Run extended analyses for the Disposable Software study",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Analyses:
  A  Descriptive Statistics         E  Adoption Intention
  B  Inter-Rater Reliability        F  Constructionism Alignment
  C  Heuristic Usability Profiles   G  Development Efficiency
  D  ICAP Concordance               H  DSQI Sensitivity Analysis
                                    I  Cross-Layer Correlations
                                    J  AI-Assisted Thematic Analysis
"""
    )
    parser.add_argument("--verbose", "-v", action="store_true",
                        help="Verbose output for all analyses")
    parser.add_argument("--only", nargs="+", metavar="X",
                        help="Run only these analyses (e.g., --only A B C)")
    parser.add_argument("--skip", nargs="+", metavar="X",
                        help="Skip these analyses (e.g., --skip J)")
    parser.add_argument("--all", action="store_true",
                        help="Include Analysis J (qualitative, requires API key)")
    parser.add_argument("--no-figures", action="store_true",
                        help="Suppress figure generation")
    parser.add_argument("--dry-run", action="store_true",
                        help="Dry-run mode for Analysis J (extract segments only)")
    args = parser.parse_args()

    # Determine which analyses to run
    if args.only:
        keys = [k.upper() for k in args.only]
        invalid = [k for k in keys if k not in ANALYSES]
        if invalid:
            print(f"  ✗ Unknown analysis keys: {', '.join(invalid)}")
            print(f"  Valid keys: {', '.join(ANALYSES.keys())}")
            sys.exit(1)
    else:
        keys = list(ANALYSES.keys())
        # By default, exclude J unless --all is specified
        if not args.all and "J" not in (args.only or []):
            keys = [k for k in keys if k != "J"]

    if args.skip:
        skip = [k.upper() for k in args.skip]
        keys = [k for k in keys if k not in skip]

    if not keys:
        print("  No analyses selected.")
        sys.exit(0)

    # ── Run selected analyses ──
    print("╔══════════════════════════════════════════════════════════╗")
    print("║  Extended Analysis Pipeline — Disposable Software Study  ║")
    print("╚══════════════════════════════════════════════════════════╝")
    print()
    print(f"  Analyses to run: {', '.join(keys)}")
    print(f"  Figures: {'disabled' if args.no_figures else 'enabled'}")
    if "J" in keys:
        print(f"  Qualitative: {'dry-run' if args.dry_run else 'LIVE (requires API key)'}")
    print()

    total_start = time.time()
    results = {}

    for key in keys:
        module_name, label = ANALYSES[key]
        success = run_analysis(
            key, module_name, label,
            verbose=args.verbose,
            no_figures=args.no_figures,
            dry_run=args.dry_run,
        )
        results[key] = success

    total_elapsed = time.time() - total_start

    # ── Summary ──
    print()
    print("═" * 60)
    print("  Pipeline Summary")
    print("═" * 60)
    passed = sum(1 for v in results.values() if v)
    failed = sum(1 for v in results.values() if not v)

    for key, success in results.items():
        _, label = ANALYSES[key]
        status = "✓" if success else "✗"
        print(f"  {status} {key}: {label}")

    print()
    print(f"  Passed: {passed}/{len(results)}  |  Failed: {failed}/{len(results)}")
    print(f"  Total time: {total_elapsed:.1f}s")
    print()

    if failed:
        sys.exit(1)


if __name__ == "__main__":
    main()
