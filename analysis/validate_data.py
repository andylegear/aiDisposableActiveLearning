"""
validate_data.py — Schema Validation for Study Data

Validates JSON data files against their corresponding JSON schemas.

Usage:
    python analysis/validate_data.py --target all
    python analysis/validate_data.py --target registry
    python analysis/validate_data.py --target dsqi
    python analysis/validate_data.py --target expert
    python analysis/validate_data.py --target coordinator
"""

import argparse
import json
import sys
from pathlib import Path

try:
    from jsonschema import validate, ValidationError
except ImportError:
    print("ERROR: jsonschema not installed. Run: pip install jsonschema")
    sys.exit(1)

ROOT = Path(__file__).resolve().parent.parent
SCHEMA_DIR = ROOT / "data" / "schemas"


def load_json(path: Path):
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def validate_file(data_path: Path, schema_path: Path) -> bool:
    """Validate a single JSON file against a schema. Returns True if valid."""
    try:
        data = load_json(data_path)
        schema = load_json(schema_path)
        validate(instance=data, schema=schema)
        print(f"  ✓ {data_path.relative_to(ROOT)}")
        return True
    except ValidationError as e:
        print(f"  ✗ {data_path.relative_to(ROOT)}")
        print(f"    → {e.message}")
        return False
    except FileNotFoundError:
        print(f"  ⚠ {data_path.relative_to(ROOT)} — file not found")
        return False


def validate_registry():
    print("\n— Validating Artifact Registry —")
    return validate_file(
        ROOT / "data" / "artifact-registry.json",
        SCHEMA_DIR / "artifact-registry.schema.json",
    )


def validate_dsqi():
    print("\n— Validating DSQI Evaluations (Layer 1) —")
    dsqi_dir = ROOT / "data" / "evaluations" / "layer1-dsqi"
    files = list(dsqi_dir.glob("dsqi-*.json"))
    if not files:
        print("  (no DSQI files found yet)")
        return True
    return all(validate_file(f, SCHEMA_DIR / "dsqi-result.schema.json") for f in files)


def validate_expert():
    print("\n— Validating Expert Reviews (Layer 2) —")
    expert_dir = ROOT / "data" / "evaluations" / "layer2-expert-review"
    files = list(expert_dir.glob("expert-review-*.json"))
    if not files:
        print("  (no expert review files found yet)")
        return True
    return all(validate_file(f, SCHEMA_DIR / "expert-review.schema.json") for f in files)


def validate_coordinator():
    print("\n— Validating Coordinator Reviews (Layer 3) —")
    coord_dir = ROOT / "data" / "evaluations" / "layer3-coordinator-review"
    files = list(coord_dir.glob("coordinator-review-*.json"))
    if not files:
        print("  (no coordinator review files found yet)")
        return True
    return all(validate_file(f, SCHEMA_DIR / "coordinator-review.schema.json") for f in files)


TARGETS = {
    "registry": [validate_registry],
    "dsqi": [validate_dsqi],
    "expert": [validate_expert],
    "coordinator": [validate_coordinator],
    "all": [validate_registry, validate_dsqi, validate_expert, validate_coordinator],
}


def main():
    parser = argparse.ArgumentParser(description="Validate study data against schemas")
    parser.add_argument("--target", choices=TARGETS.keys(), default="all")
    args = parser.parse_args()

    print(f"Validating: {args.target}")
    results = [fn() for fn in TARGETS[args.target]]

    if all(results):
        print("\n✓ All validations passed.")
    else:
        print("\n✗ Some validations failed.")
        sys.exit(1)


if __name__ == "__main__":
    main()
