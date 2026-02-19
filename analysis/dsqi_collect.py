#!/usr/bin/env python3
"""
dsqi_collect.py — Automatically collect DSQI raw metrics for an artifact.

Gathers the measurable DSQI sub-metrics:
    M₁  Dependency count       (package.json / requirements.txt scan)
    M₂  Code complexity        (regex-based cyclomatic complexity for JS/HTML/CSS/Python)
    M₃  Deployment steps       (heuristic from project structure)
    C₁  Lines of Code          (cloc)
    C₂  Development time       (session logs + WakaTime)
    C₃  AI generation ratio    (session logs)

Produces:
    - data/evaluations/layer1-dsqi/dsqi-{slug}.json   (partial — P and E left null for human input)
    - data/static-analysis/{slug}/cloc-output.json     (full cloc results)
    - data/static-analysis/{slug}/complexity.json      (per-file complexity)

Usage:
    python analysis/dsqi_collect.py --artifact 1
    python analysis/dsqi_collect.py --artifact 1 --deployment-steps 3
    python analysis/dsqi_collect.py --artifact 1 --deploy-method "GitHub Pages" --deploy-steps-desc "git add,git commit,git push,enable Pages"
"""

import argparse
import json
import math
import os
import re
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path

STUDY_ROOT = Path(__file__).resolve().parent.parent
REGISTRY_PATH = STUDY_ROOT / "data" / "artifact-registry.json"
DEV_LOGS_DIR = STUDY_ROOT / "data" / "development-logs"
DSQI_DIR = STUDY_ROOT / "data" / "evaluations" / "layer1-dsqi"
STATIC_DIR = STUDY_ROOT / "data" / "static-analysis"
ARTIFACTS_DIR = STUDY_ROOT / "artifacts"

COLLECTOR_VERSION = "1.0.0"

# ── Normalisation thresholds ─────────────────────────────────
# These define the "worst case" anchors for normalisation to [0, 1].
# Anything at or above the threshold scores 1.0 (worst).
# Derived from the protocol: disposable software should be near zero.

NORM = {
    "dependency_count": 20,       # 0 deps = 0.0, 20+ deps = 1.0
    "complexity_avg": 15,         # avg CC 1 ≈ 0.07, 15+ = 1.0
    "deployment_steps": 10,       # 0 steps = 0.0, 10+ = 1.0
    "lines_of_code": 5000,        # 0 = 0.0, 5000+ = 1.0
    "dev_time_minutes": 480,      # 0 = 0.0, 8 hours+ = 1.0
}


def load_json(path: Path) -> dict | list:
    return json.loads(path.read_text(encoding="utf-8"))


def save_json(path: Path, data):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, indent=2) + "\n", encoding="utf-8")


def normalize(value: float, threshold: float) -> float:
    """Normalize a value to [0, 1] by dividing by threshold, capped at 1."""
    if threshold == 0:
        return 0.0
    return min(value / threshold, 1.0)


def get_artifact(registry: dict, artifact_id: int) -> dict | None:
    for a in registry["artifacts"]:
        if a["id"] == artifact_id:
            return a
    return None


# ── M₁: Dependency Count ────────────────────────────────────

def count_dependencies(src_dir: Path) -> dict:
    """Count production dependencies from package.json or requirements.txt."""
    result = {
        "has_package_json": False,
        "has_requirements_txt": False,
        "production_dependencies": [],
        "dependency_count": 0,
    }

    # Check in src/ and one level up (artifact root)
    for search_dir in [src_dir, src_dir.parent]:
        pkg = search_dir / "package.json"
        if pkg.exists():
            result["has_package_json"] = True
            try:
                pkg_data = json.loads(pkg.read_text(encoding="utf-8"))
                deps = list(pkg_data.get("dependencies", {}).keys())
                result["production_dependencies"] = deps
                result["dependency_count"] = len(deps)
            except (json.JSONDecodeError, KeyError):
                pass
            break

        req = search_dir / "requirements.txt"
        if req.exists():
            result["has_requirements_txt"] = True
            lines = [
                l.strip().split("==")[0].split(">=")[0].split("[")[0]
                for l in req.read_text(encoding="utf-8").splitlines()
                if l.strip() and not l.strip().startswith("#")
            ]
            result["production_dependencies"] = lines
            result["dependency_count"] = len(lines)
            break

    return result


# ── M₂: Code Complexity ─────────────────────────────────────

def compute_js_complexity(filepath: Path) -> dict:
    """
    Estimate cyclomatic complexity for a JavaScript file using regex-based
    counting of decision points. This is a lightweight alternative to
    external tools like escomplex (which requires Node.js).

    Decision points counted: if, else if, for, while, do, switch, case,
    catch, &&, ||, ?:
    """
    code = filepath.read_text(encoding="utf-8", errors="replace")

    # Remove comments
    code = re.sub(r"//.*$", "", code, flags=re.MULTILINE)
    code = re.sub(r"/\*[\s\S]*?\*/", "", code)

    # Remove string literals to avoid false positives
    code = re.sub(r'"(?:[^"\\]|\\.)*"', '""', code)
    code = re.sub(r"'(?:[^'\\]|\\.)*'", "''", code)
    code = re.sub(r"`(?:[^`\\]|\\.)*`", "``", code)

    # Find functions
    func_pattern = re.compile(
        r"(?:function\s+(\w+)\s*\()|"            # function foo(
        r"(?:(\w+)\s*[:=]\s*function\s*\()|"      # foo = function( or foo: function(
        r"(?:(\w+)\s*[:=]\s*\([^)]*\)\s*=>)|"     # foo = () =>
        r"(?:(\w+)\s*[:=]\s*\w+\s*=>)"            # foo = x =>
    )

    # Decision keywords
    decision_pattern = re.compile(
        r"\b(?:if|else\s+if|for|while|do|switch|case|catch)\b|"
        r"&&|\|\||\?"
    )

    functions = list(func_pattern.finditer(code))
    if not functions:
        # Treat entire file as one unit
        decisions = len(decision_pattern.findall(code))
        complexity = decisions + 1
        return {
            "file": filepath.name,
            "functions": 1,
            "average_complexity": complexity,
            "max_complexity": complexity,
            "total_complexity": complexity,
        }

    complexities = []
    for i, match in enumerate(functions):
        start = match.start()
        end = functions[i + 1].start() if i + 1 < len(functions) else len(code)
        chunk = code[start:end]
        decisions = len(decision_pattern.findall(chunk))
        complexities.append(decisions + 1)  # +1 for the default path

    return {
        "file": filepath.name,
        "functions": len(complexities),
        "average_complexity": round(sum(complexities) / len(complexities), 2) if complexities else 1,
        "max_complexity": max(complexities) if complexities else 1,
        "total_complexity": sum(complexities),
    }


def compute_complexity(src_dir: Path) -> dict:
    """Compute complexity for all JS files in src/."""
    files_data = []
    for f in sorted(src_dir.iterdir()):
        if f.is_file() and f.suffix in (".js", ".ts", ".jsx", ".tsx"):
            files_data.append(compute_js_complexity(f))

    if not files_data:
        return {
            "tool": "regex-based cyclomatic complexity (dsqi_collect.py)",
            "files": [],
            "overall_average": 1.0,
            "overall_max": 1,
        }

    total_funcs = sum(f["functions"] for f in files_data)
    weighted_sum = sum(f["average_complexity"] * f["functions"] for f in files_data)
    overall_avg = round(weighted_sum / total_funcs, 2) if total_funcs > 0 else 1.0
    overall_max = max(f["max_complexity"] for f in files_data)

    return {
        "tool": "regex-based cyclomatic complexity (dsqi_collect.py)",
        "files": files_data,
        "overall_average": overall_avg,
        "overall_max": overall_max,
    }


# ── M₃: Deployment Steps ────────────────────────────────────

def estimate_deployment(src_dir: Path, method: str | None = None, steps_desc: list | None = None) -> dict:
    """Estimate deployment complexity."""
    if steps_desc:
        return {
            "method": method or "custom",
            "steps_description": steps_desc,
            "steps_count": len(steps_desc),
        }

    # Heuristic based on project structure
    has_package_json = (src_dir / "package.json").exists() or (src_dir.parent / "package.json").exists()
    has_build_script = False
    if has_package_json:
        for p in [src_dir / "package.json", src_dir.parent / "package.json"]:
            if p.exists():
                pkg = json.loads(p.read_text(encoding="utf-8"))
                has_build_script = "build" in pkg.get("scripts", {})
                break

    # Pure static site (HTML/CSS/JS, no build)
    has_html = any(f.suffix == ".html" for f in src_dir.iterdir() if f.is_file())

    if has_html and not has_build_script and not has_package_json:
        return {
            "method": method or "GitHub Pages (static)",
            "steps_description": [
                "git add .",
                "git commit -m 'deploy'",
                "git push origin main",
            ],
            "steps_count": 3,
        }
    elif has_build_script:
        return {
            "method": method or "Build + Deploy",
            "steps_description": [
                "npm install",
                "npm run build",
                "git add dist/",
                "git commit -m 'deploy'",
                "git push origin main",
            ],
            "steps_count": 5,
        }
    else:
        return {
            "method": method or "Unknown",
            "steps_description": ["Manual deployment — steps unknown"],
            "steps_count": 1,
        }


# ── C₁: Lines of Code (cloc) ────────────────────────────────

def run_cloc(src_dir: Path, output_path: Path) -> dict:
    """Run cloc and return results. Save full output to static-analysis dir."""
    output_path.parent.mkdir(parents=True, exist_ok=True)

    try:
        # Try bare cloc first, fall back to npx cloc
        for cmd in [["cloc"], ["npx", "cloc"]]:
            try:
                result = subprocess.run(
                    cmd + [str(src_dir), "--json", "--quiet"],
                    capture_output=True, text=True, timeout=60,
                    shell=(os.name == "nt"),  # shell=True on Windows for npx
                )
                if result.returncode == 0 and result.stdout.strip():
                    break
            except FileNotFoundError:
                continue
        else:
            print("  ERROR: cloc not found. Install with: npm install -g cloc", file=sys.stderr)
            return {}

        if result.returncode != 0:
            print(f"  WARNING: cloc returned exit code {result.returncode}", file=sys.stderr)
            print(f"  stderr: {result.stderr}", file=sys.stderr)

        cloc_data = json.loads(result.stdout)
        save_json(output_path, cloc_data)
        return cloc_data

    except FileNotFoundError:
        print("  ERROR: cloc not found. Install with: npm install -g cloc", file=sys.stderr)
        return {}
    except json.JSONDecodeError:
        print(f"  ERROR: cloc output was not valid JSON", file=sys.stderr)
        return {}
    except subprocess.TimeoutExpired:
        print("  ERROR: cloc timed out", file=sys.stderr)
        return {}


# ── C₂ & C₃: Dev Time & AI Ratio (from session logs) ───────

def get_dev_metrics_from_logs(slug: str) -> dict:
    """Extract development time and AI ratio from session logs."""
    log_path = DEV_LOGS_DIR / f"sessions-{slug}.json"
    result = {
        "wall_clock_minutes": 0,
        "wakatime_seconds": 0,
        "sessions": 0,
        "ai_generated_lines": 0,
        "human_written_lines": 0,
        "total_lines": 0,
        "ai_ratio": 1.0,
        "source": str(log_path.relative_to(STUDY_ROOT)),
    }

    if not log_path.exists():
        print(f"  WARNING: No session log found at {log_path}", file=sys.stderr)
        return result

    sessions = load_json(log_path)
    result["sessions"] = len(sessions)

    for s in sessions:
        result["wall_clock_minutes"] += s.get("duration_minutes", 0) or 0
        waka = s.get("wakatime", {})
        result["wakatime_seconds"] += waka.get("total_seconds", 0) or 0
        result["ai_generated_lines"] += s.get("code_ai_generated_lines", 0) or 0
        result["human_written_lines"] += s.get("code_written_lines", 0) or 0
        result["total_lines"] += s.get("total_lines", 0) or 0

    if result["total_lines"] > 0:
        result["ai_ratio"] = round(result["ai_generated_lines"] / result["total_lines"], 4)
    else:
        result["ai_ratio"] = 1.0

    return result


# ── Assemble DSQI JSON ───────────────────────────────────────

def build_dsqi_result(artifact: dict, dep_info: dict, complexity: dict,
                      deployment: dict, cloc_data: dict, dev_metrics: dict,
                      args) -> dict:
    """Assemble the partial DSQI result JSON (P and E left null for human input)."""

    now = datetime.now(timezone.utc).isoformat()

    # Extract total code lines from cloc
    cloc_total = 0
    if "SUM" in cloc_data:
        cloc_total = cloc_data["SUM"].get("code", 0)
    elif cloc_data:
        for lang, vals in cloc_data.items():
            if isinstance(vals, dict) and "code" in vals and lang != "header":
                cloc_total += vals["code"]

    # ── Raw values ──
    m1_deps = dep_info["dependency_count"]
    m2_complexity = complexity["overall_average"]
    m3_steps = deployment["steps_count"]
    c1_loc = cloc_total
    c2_time = dev_metrics["wall_clock_minutes"]
    c3_ai = dev_metrics["ai_ratio"]

    # ── Normalise ──
    m1_norm = normalize(m1_deps, NORM["dependency_count"])
    m2_norm = normalize(m2_complexity, NORM["complexity_avg"])
    m3_norm = normalize(m3_steps, NORM["deployment_steps"])
    c1_norm = normalize(c1_loc, NORM["lines_of_code"])
    c2_norm = normalize(c2_time, NORM["dev_time_minutes"])

    # Composite scores (average of sub-metrics)
    M = round((m1_norm + m2_norm + m3_norm) / 3, 4)
    C = round((c1_norm + c2_norm + (1 - c3_ai)) / 3, 4)
    # Note: for C, AI ratio is inverted: high AI ratio = low human effort = lower C score
    # (1 - ai_ratio) represents the human effort fraction

    return {
        "artifact_id": artifact["id"],
        "artifact_slug": artifact["slug"],
        "evaluator": "self (automated collection + manual scoring)",
        "date": datetime.now(timezone.utc).strftime("%Y-%m-%d"),
        "notes": "M and C metrics collected automatically by dsqi_collect.py. P and E metrics require human evaluators — fill in after reviews are complete.",

        "maintenance_cost": {
            "dependency_count": m1_deps,
            "dependency_count_normalized": round(m1_norm, 4),
            "cyclomatic_complexity_avg": m2_complexity,
            "cyclomatic_complexity_normalized": round(m2_norm, 4),
            "deployment_steps": m3_steps,
            "deployment_steps_normalized": round(m3_norm, 4),
            "M_score": M,
        },

        "creation_cost": {
            "lines_of_code": c1_loc,
            "lines_of_code_normalized": round(c1_norm, 4),
            "ai_generation_ratio": c3_ai,
            "development_time_minutes": c2_time,
            "development_time_normalized": round(c2_norm, 4),
            "C_score": C,
        },

        "pedagogical_alignment": {
            "concept_coverage": None,
            "icap_level": None,
            "icap_score": None,
            "P_score": None,
        },

        "pedagogical_purity": {
            "conceptual_fidelity_raw": None,
            "conceptual_fidelity_normalized": None,
            "process_replicability_raw": None,
            "process_replicability_normalized": None,
            "E_score": None,
        },

        "weights": {
            "w1_maintenance": 0.3,
            "w2_creation": 0.2,
            "w3_pedagogical": 0.3,
            "w4_purity": 0.2,
        },

        "dsqi_score": None,  # Cannot compute until P and E are filled in

        "raw_metrics": {
            "collected_at": now,
            "collector_version": COLLECTOR_VERSION,
            "cloc": cloc_data,
            "complexity": complexity,
            "dependency_analysis": dep_info,
            "deployment": deployment,
            "dev_time": {
                "wall_clock_minutes": dev_metrics["wall_clock_minutes"],
                "wakatime_seconds": dev_metrics["wakatime_seconds"],
                "sessions": dev_metrics["sessions"],
                "source": dev_metrics["source"],
            },
            "ai_ratio": {
                "ratio": dev_metrics["ai_ratio"],
                "ai_generated_lines": dev_metrics["ai_generated_lines"],
                "human_written_lines": dev_metrics["human_written_lines"],
                "total_lines": dev_metrics["total_lines"],
                "source": dev_metrics["source"],
            },
        },
    }


# ── Main ─────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="Collect DSQI raw metrics for an artifact")
    parser.add_argument("--artifact", type=int, required=True, help="Artifact ID (1-5)")
    parser.add_argument("--deployment-steps", type=int, help="Override: number of deployment steps")
    parser.add_argument("--deploy-method", help="Deployment method name (e.g. 'GitHub Pages')")
    parser.add_argument("--deploy-steps-desc", help="Comma-separated deployment step descriptions")
    args = parser.parse_args()

    # Load registry
    registry = load_json(REGISTRY_PATH)
    artifact = get_artifact(registry, args.artifact)
    if not artifact:
        print(f"ERROR: Artifact {args.artifact} not found.", file=sys.stderr)
        sys.exit(1)

    slug = artifact["slug"]
    name = artifact["name"]
    src_dir = ARTIFACTS_DIR / slug / "src"

    if not src_dir.exists():
        print(f"ERROR: Source directory not found: {src_dir}", file=sys.stderr)
        sys.exit(1)

    print(f"╔══════════════════════════════════════════════════════════╗")
    print(f"║  DSQI Metric Collection — Artifact {args.artifact}: {name}")
    print(f"╚══════════════════════════════════════════════════════════╝")
    print()

    # ── M₁: Dependencies ──
    print("▸ M₁: Counting dependencies...")
    dep_info = count_dependencies(src_dir)
    print(f"  Dependencies: {dep_info['dependency_count']} {dep_info['production_dependencies']}")

    # ── M₂: Complexity ──
    print("▸ M₂: Computing cyclomatic complexity...")
    complexity = compute_complexity(src_dir)
    print(f"  Average complexity: {complexity['overall_average']}")
    print(f"  Max complexity: {complexity['overall_max']}")
    for f in complexity.get("files", []):
        print(f"    {f['file']:30s} avg={f['average_complexity']:.1f}  max={f['max_complexity']}  functions={f['functions']}")

    # ── M₃: Deployment ──
    print("▸ M₃: Estimating deployment steps...")
    steps_desc = None
    if args.deploy_steps_desc:
        steps_desc = [s.strip() for s in args.deploy_steps_desc.split(",")]
    deployment = estimate_deployment(src_dir, method=args.deploy_method, steps_desc=steps_desc)
    if args.deployment_steps is not None:
        deployment["steps_count"] = args.deployment_steps
    print(f"  Method: {deployment['method']}")
    print(f"  Steps: {deployment['steps_count']}")
    for s in deployment["steps_description"]:
        print(f"    - {s}")

    # ── C₁: Lines of Code ──
    print("▸ C₁: Running cloc...")
    cloc_output_path = STATIC_DIR / slug / "cloc-output.json"
    cloc_data = run_cloc(src_dir, cloc_output_path)
    if "SUM" in cloc_data:
        s = cloc_data["SUM"]
        print(f"  Code: {s.get('code', 0)}  Comments: {s.get('comment', 0)}  Blank: {s.get('blank', 0)}  Total: {s.get('code', 0) + s.get('comment', 0) + s.get('blank', 0)}")
    for lang, vals in cloc_data.items():
        if isinstance(vals, dict) and "code" in vals and lang not in ("header", "SUM"):
            print(f"    {lang:20s} code={vals['code']}  comment={vals['comment']}  blank={vals['blank']}")

    # ── C₂ & C₃: Dev Time & AI Ratio ──
    print("▸ C₂/C₃: Reading session logs...")
    dev_metrics = get_dev_metrics_from_logs(slug)
    print(f"  Wall clock: {dev_metrics['wall_clock_minutes']} min")
    print(f"  WakaTime:   {dev_metrics['wakatime_seconds']:.1f}s")
    print(f"  Sessions:   {dev_metrics['sessions']}")
    print(f"  AI ratio:   {dev_metrics['ai_ratio']} ({dev_metrics['ai_generated_lines']} AI / {dev_metrics['total_lines']} total)")

    # ── Save complexity data ──
    complexity_path = STATIC_DIR / slug / "complexity.json"
    save_json(complexity_path, complexity)
    print(f"\n  Saved: {complexity_path.relative_to(STUDY_ROOT)}")

    # ── Assemble & save DSQI result ──
    print("\n▸ Assembling DSQI result...")
    dsqi = build_dsqi_result(artifact, dep_info, complexity, deployment, cloc_data, dev_metrics, args)

    dsqi_path = DSQI_DIR / f"dsqi-{slug}.json"
    save_json(dsqi_path, dsqi)
    print(f"  Saved: {dsqi_path.relative_to(STUDY_ROOT)}")

    # ── Summary ──
    M = dsqi["maintenance_cost"]["M_score"]
    C = dsqi["creation_cost"]["C_score"]
    print(f"\n{'='*60}")
    print(f"  DSQI Sub-Scores (automated — M and C only)")
    print(f"{'='*60}")
    print(f"  M (Maintenance Cost):   {M:.4f}  →  (1-M) = {1-M:.4f}")
    print(f"  C (Creation Cost):      {C:.4f}  →  (1-C) = {1-C:.4f}")
    print(f"  P (Pedagogical):        [awaiting module coordinator review]")
    print(f"  E (Purity):             [awaiting expert review]")
    print(f"  DSQI:                   [cannot compute until P and E are scored]")
    print(f"{'='*60}")
    print(f"\n  Partial DSQI formula:")
    print(f"  DSQI = 0.3×(1-{M:.4f}) + 0.2×(1-{C:.4f}) + 0.3×P + 0.2×E")
    print(f"       = {0.3*(1-M):.4f} + {0.2*(1-C):.4f} + 0.3×P + 0.2×E")
    print(f"       = {0.3*(1-M) + 0.2*(1-C):.4f} + 0.3×P + 0.2×E")
    print()


if __name__ == "__main__":
    main()
