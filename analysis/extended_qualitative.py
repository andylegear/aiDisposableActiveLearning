#!/usr/bin/env python3
"""
extended_qualitative.py — Analysis J: AI-Assisted Thematic Analysis

Performs deductive thematic analysis on open-ended text segments from expert
and coordinator reviews using the Anthropic Claude API.

Categories come from data/extended-analysis/qualitative/codebook.json.

Segments extracted:
    - Expert: most_positive, most_negative, other_comments (per artifact × 3 raters)
    - Coordinator: Q7_most_significant_benefit, Q8_most_significant_drawback

Workflow:
    1. Extract all text segments from review JSONs
    2. Send segments + codebook to Claude for deductive coding
    3. Aggregate coded segments by category
    4. Output frequency table, coded segments, and category summary

Cost estimate: ~145 segments × ~200 tokens/segment ≈ $3–5 total.

Usage:
    python analysis/extended_qualitative.py
    python analysis/extended_qualitative.py --dry-run     # Extract segments only
    python analysis/extended_qualitative.py --verbose
"""

import argparse
import json
import os
import sys
from pathlib import Path

from tabulate import tabulate

sys.path.insert(0, str(Path(__file__).resolve().parent))
from data_loader import (
    ARTIFACT_SLUGS, ARTIFACT_NAMES,
    load_expert_reviews, load_coordinator_flat, load_json,
    save_json, ensure_output_dirs, OUTPUT_DIR,
)


CODEBOOK_PATH = Path(__file__).resolve().parent.parent / "data" / "extended-analysis" / "qualitative" / "codebook.json"


def extract_segments():
    """Extract all open-ended text segments from reviews."""
    segments = []

    # Expert segments
    expert_reviews = load_expert_reviews()
    for review in expert_reviews:
        reviewer_name = review.get("reviewer", {}).get("name", "Unknown")
        for artifact in review.get("artifacts", []):
            artifact_id = artifact.get("artifact_id", "")
            open_ended = artifact.get("open_ended", {})

            for field, label in [
                ("most_positive", "Expert — Most Positive"),
                ("most_negative", "Expert — Most Negative"),
                ("other_comments", "Expert — Other Comments"),
            ]:
                text = open_ended.get(field, "").strip()
                if text and text.lower() not in ("n/a", "none", "—", "-", ""):
                    segments.append({
                        "id": f"expert-{reviewer_name.lower().replace(' ', '-')}-{artifact_id}-{field}",
                        "source": "expert_review",
                        "reviewer": reviewer_name,
                        "artifact_id": artifact_id,
                        "artifact_name": ARTIFACT_NAMES.get(artifact_id, artifact_id),
                        "field": field,
                        "label": label,
                        "text": text,
                    })

    # Coordinator segments
    coord_flat = load_coordinator_flat()
    for coord in coord_flat:
        artifact_id = coord["artifact_id"]
        coordinator_name = coord["coordinator_name"]

        for field, original_key, label in [
            ("Q7_benefit", "Q7_benefit", "Coordinator — Most Significant Benefit"),
            ("Q8_drawback", "Q8_drawback", "Coordinator — Most Significant Drawback"),
        ]:
            text = coord.get(original_key, "").strip()
            if text and text.lower() not in ("n/a", "none", "—", "-", ""):
                segments.append({
                    "id": f"coord-{coordinator_name.lower().replace(' ', '-')}-{artifact_id}-{field}",
                    "source": "coordinator_review",
                    "reviewer": coordinator_name,
                    "artifact_id": artifact_id,
                    "artifact_name": ARTIFACT_NAMES.get(artifact_id, artifact_id),
                    "field": field,
                    "label": label,
                    "text": text,
                })

    return segments


def build_coding_prompt(segments, codebook):
    """Build the prompt for Claude to code segments."""
    categories = codebook["categories"]
    instructions = codebook.get("coding_instructions", {})

    cat_descriptions = []
    for cat in categories:
        cat_descriptions.append(
            f"- **{cat['code']}** ({cat['label']}): {cat['description']}\n"
            f"  Keywords: {', '.join(cat.get('example_keywords', []))}"
        )

    segment_block = []
    for i, seg in enumerate(segments):
        segment_block.append(
            f"[{i+1}] Source: {seg['label']} | Artifact: {seg['artifact_name']} | "
            f"Reviewer: {seg['reviewer']}\n"
            f'"{seg["text"]}"'
        )

    prompt = f"""You are a qualitative research assistant performing deductive thematic coding.

## Codebook

{chr(10).join(cat_descriptions)}

## Coding Instructions

- Each segment may be assigned 1–3 categories (most relevant codes).
- Rate your confidence for each code: HIGH (clear match), MEDIUM (reasonable inference), LOW (borderline).
- Minimum confidence to assign a code: {instructions.get('minimum_confidence', 'MEDIUM')}
- If no category fits, use code "UNCLASSIFIED".
- Provide a brief rationale (1 sentence) for each coding decision.

## Segments to Code

{chr(10).join(segment_block)}

## Output Format

Return a JSON array with one object per segment:
```json
[
  {{
    "segment_index": 1,
    "codes": [
      {{
        "code": "CATEGORY_CODE",
        "confidence": "HIGH|MEDIUM|LOW",
        "rationale": "Brief explanation"
      }}
    ]
  }}
]
```

IMPORTANT: Return ONLY the JSON array, no other text."""

    return prompt


def code_with_claude(segments, codebook, api_key, model="claude-sonnet-4-20250514"):
    """Send segments to Claude API for coding."""
    try:
        import anthropic
    except ImportError:
        print("  ✗ anthropic package not installed. Run: pip install anthropic")
        return None

    client = anthropic.Anthropic(api_key=api_key)

    # Process in batches of 30 to stay within token limits
    batch_size = 30
    all_coded = []

    for batch_start in range(0, len(segments), batch_size):
        batch = segments[batch_start:batch_start + batch_size]
        prompt = build_coding_prompt(batch, codebook)

        print(f"  → Sending batch {batch_start // batch_size + 1} "
              f"({len(batch)} segments) to {model}...")

        message = client.messages.create(
            model=model,
            max_tokens=4096,
            messages=[{"role": "user", "content": prompt}],
        )

        response_text = message.content[0].text.strip()

        # Parse JSON from response
        try:
            # Handle possible markdown code block wrapping
            if response_text.startswith("```"):
                lines = response_text.split("\n")
                json_lines = []
                in_block = False
                for line in lines:
                    if line.startswith("```") and not in_block:
                        in_block = True
                        continue
                    elif line.startswith("```") and in_block:
                        break
                    elif in_block:
                        json_lines.append(line)
                response_text = "\n".join(json_lines)

            coded_batch = json.loads(response_text)

            # Merge segment metadata with coding results
            for item in coded_batch:
                seg_idx = item["segment_index"] - 1
                if 0 <= seg_idx < len(batch):
                    seg = batch[seg_idx]
                    item["segment_id"] = seg["id"]
                    item["source"] = seg["source"]
                    item["artifact_id"] = seg["artifact_id"]
                    item["text"] = seg["text"]
                    item["field"] = seg["field"]
                    all_coded.append(item)

        except json.JSONDecodeError as e:
            print(f"  ⚠ Failed to parse response for batch: {e}")
            # Save raw response for debugging
            save_json(
                OUTPUT_DIR / "qualitative" / f"raw_response_batch_{batch_start}.txt",
                {"raw": response_text, "error": str(e)}
            )

        # Report usage
        if hasattr(message, "usage"):
            usage = message.usage
            print(f"    Tokens: input={usage.input_tokens}, output={usage.output_tokens}")

    return all_coded


def aggregate_results(coded_segments, codebook):
    """Aggregate coded segments by category."""
    categories = {cat["code"]: cat for cat in codebook["categories"]}
    category_counts = {cat["code"]: 0 for cat in codebook["categories"]}
    category_counts["UNCLASSIFIED"] = 0
    category_segments = {cat["code"]: [] for cat in codebook["categories"]}
    category_segments["UNCLASSIFIED"] = []

    for item in coded_segments:
        for code_entry in item.get("codes", []):
            code = code_entry["code"]
            if code in category_counts:
                category_counts[code] += 1
                category_segments[code].append({
                    "segment_id": item.get("segment_id"),
                    "artifact_id": item.get("artifact_id"),
                    "text_preview": item.get("text", "")[:100],
                    "confidence": code_entry.get("confidence", "—"),
                    "rationale": code_entry.get("rationale", ""),
                })

    # Sort by frequency
    sorted_categories = sorted(category_counts.items(), key=lambda x: -x[1])

    return {
        "category_frequencies": dict(sorted_categories),
        "total_codings": sum(category_counts.values()),
        "total_segments": len(coded_segments),
        "category_details": {
            code: {
                "label": categories.get(code, {}).get("label", code),
                "count": count,
                "segments": category_segments.get(code, []),
            }
            for code, count in sorted_categories
        },
    }


def run(verbose=False, dry_run=False):
    ensure_output_dirs()

    print("╔══════════════════════════════════════════════════════════╗")
    print("║  Analysis J — AI-Assisted Thematic Analysis              ║")
    print("╚══════════════════════════════════════════════════════════╝")
    print()

    # ── Load codebook ──
    if not CODEBOOK_PATH.exists():
        print(f"  ✗ Codebook not found: {CODEBOOK_PATH}")
        return None
    codebook = load_json(CODEBOOK_PATH)
    print(f"  Codebook: {len(codebook['categories'])} categories loaded")

    # ── Extract segments ──
    segments = extract_segments()
    print(f"  Segments extracted: {len(segments)}")

    # Breakdown by source
    expert_count = sum(1 for s in segments if s["source"] == "expert_review")
    coord_count = sum(1 for s in segments if s["source"] == "coordinator_review")
    print(f"    Expert reviews: {expert_count}")
    print(f"    Coordinator reviews: {coord_count}")
    print()

    # Save extracted segments
    qual_dir = OUTPUT_DIR / "qualitative"
    qual_dir.mkdir(parents=True, exist_ok=True)
    save_json(qual_dir / "extracted_segments.json", {
        "total": len(segments),
        "by_source": {"expert": expert_count, "coordinator": coord_count},
        "segments": segments,
    })
    print(f"  ✓ Segments saved to data/extended-analysis/qualitative/extracted_segments.json")

    if dry_run:
        print()
        print("  [DRY RUN] Skipping API call. Use without --dry-run to proceed.")
        print(f"  Estimated cost: ~${len(segments) * 0.03:.2f}")

        # Show segment preview
        print()
        print("▸ Segment Preview (first 5)")
        rows = []
        for s in segments[:5]:
            rows.append([s["label"], s["artifact_name"], s["text"][:60] + "..."])
        print(tabulate(rows, headers=["Source", "Artifact", "Text"], tablefmt="simple_outline"))
        return {"segments": segments, "dry_run": True}

    # ── Get API key ──
    api_key = os.environ.get("ANTHROPIC_API_KEY", "")
    if not api_key:
        print("  Enter your Anthropic API key (or set ANTHROPIC_API_KEY env var):")
        api_key = input("  > ").strip()
    if not api_key:
        print("  ✗ No API key provided. Aborting.")
        return None

    # ── Code segments ──
    print()
    coded_segments = code_with_claude(segments, codebook, api_key)

    if not coded_segments:
        print("  ✗ No coded segments returned.")
        return None

    # Save raw coded segments
    save_json(qual_dir / "coded_segments.json", coded_segments)
    print(f"  ✓ Coded segments saved ({len(coded_segments)} items)")

    # ── Aggregate ──
    aggregated = aggregate_results(coded_segments, codebook)
    save_json(qual_dir / "thematic_summary.json", aggregated)
    print()

    # ── Console output ──
    print("▸ Category Frequencies")
    rows = []
    for code, count in aggregated["category_frequencies"].items():
        detail = aggregated["category_details"][code]
        pct = round(100 * count / aggregated["total_codings"], 1) if aggregated["total_codings"] > 0 else 0
        rows.append([code, detail["label"], count, f"{pct}%"])
    print(tabulate(rows, headers=["Code", "Label", "Count", "%"], tablefmt="simple_outline"))
    print()

    print(f"  Total codings: {aggregated['total_codings']} (across {aggregated['total_segments']} segments)")
    print(f"  Mean codes/segment: {aggregated['total_codings']/aggregated['total_segments']:.1f}")
    print()

    # ── Per-artifact distribution ──
    print("▸ Per-Artifact Category Distribution")
    artifact_cats = {slug: {} for slug in ARTIFACT_SLUGS}
    for item in coded_segments:
        slug = item.get("artifact_id", "")
        for code_entry in item.get("codes", []):
            code = code_entry["code"]
            artifact_cats.setdefault(slug, {})
            artifact_cats[slug][code] = artifact_cats[slug].get(code, 0) + 1

    cat_codes = [c["code"] for c in codebook["categories"]]
    rows = []
    for slug in ARTIFACT_SLUGS:
        row = [ARTIFACT_NAMES.get(slug, slug)]
        for cc in cat_codes:
            row.append(artifact_cats.get(slug, {}).get(cc, 0))
        rows.append(row)
    print(tabulate(rows, headers=["Artifact"] + cat_codes, tablefmt="simple_outline"))
    print()

    save_json(OUTPUT_DIR / "J_qualitative_analysis.json", {
        "segment_count": len(segments),
        "coded_count": len(coded_segments),
        "aggregated": aggregated,
        "per_artifact": artifact_cats,
    })

    print(f"  ✓ Results saved to data/extended-analysis/J_qualitative_analysis.json")
    return {"segments": segments, "coded": coded_segments, "aggregated": aggregated}


def main():
    parser = argparse.ArgumentParser(description="Analysis J: AI-Assisted Thematic Analysis")
    parser.add_argument("--verbose", "-v", action="store_true")
    parser.add_argument("--dry-run", action="store_true",
                        help="Extract segments only, skip API call")
    args = parser.parse_args()
    run(verbose=args.verbose, dry_run=args.dry_run)


if __name__ == "__main__":
    main()
