# Analysis Tools

This directory contains Python scripts for validating, processing, and reporting on the study's data.

## Scripts

| Script | Purpose | Command |
| :--- | :--- | :--- |
| `validate_data.py` | Validates JSON data files against their schemas | `npm run validate:all` |
| `study_status.py` | Prints a dashboard showing overall study progress | `npm run status` |
| `generate_dsqi_report.py` | Generates DSQI comparison tables and charts | `npm run report:dsqi` |
| `generate_expert_report.py` | Aggregates expert review data, calculates averages | `npm run report:expert` |
| `generate_coordinator_report.py` | Summarises coordinator reviews | `npm run report:coordinator` |
| `generate_summary_report.py` | Produces the combined results summary for the paper | `npm run report:summary` |

## Setup

```bash
pip install -r ../requirements.txt
```

## Output

Generated reports and figures are written to `output/` (git-ignored, regenerable).
