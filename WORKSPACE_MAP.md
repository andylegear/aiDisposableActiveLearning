# WORKSPACE MAP

> **Purpose:** This document is the single source of truth for understanding the structure, conventions, and data formats used in this research project. It is designed to be read by both humans and AI assistants/tools that need to navigate, parse, or generate content within this workspace.

---

## 1. Project Identity

| Field | Value |
| :--- | :--- |
| **Title** | AI-Generated Disposable Software as Active Learning Instruments in CS Education |
| **Methodology** | Design-Based Research (DBR) |
| **Target Journal** | Computer Science Education (Taylor & Francis) |
| **Article Type** | Empirical Study (max 12,000 words excl. references) |
| **Evaluation Model** | Three-layer: DSQI (self) → Expert Review → Module Coordinator Review |

---

## 2. The Five Artifacts

These are the five disposable software artifacts that form the empirical core of the study. **The artifacts themselves have not been created yet** — only the scaffolding exists.

| ID | Slug | Name | Module | Learning Objective |
| :- | :--- | :--- | :----- | :--- |
| 1 | `01-unit-testing-gauntlet` | The Unit Testing Gauntlet | CS5703: Software Quality | Red-Green-Refactor TDD cycle |
| 2 | `02-big-o-visualizer` | The Big-O Visualizer | CE4003: Algorithms & Data Structures | Time complexity visualization |
| 3 | `03-sql-injection-simulator` | The SQL Injection Simulator | CE4018: Database Systems | SQL injection vulnerabilities |
| 4 | `04-css-flexbox-trainer` | The CSS Flexbox Trainer | CE4026: Web Development | CSS Flexbox layout properties |
| 5 | `05-git-branching-sandbox` | The Git Branching Sandbox | CE4071: SD Tools & Techniques | Git branching and merging |

### Artifact Lifecycle States

```
not-started → in-development → developed → self-evaluated → expert-reviewed → coordinator-reviewed → complete
```

---

## 3. Directory Structure

```
aiActiveLearningStudy/
│
├── WORKSPACE_MAP.md                  ★ THIS FILE — read this first
├── .gitignore
├── package.json                      npm scripts for running analysis tools
├── requirements.txt                  Python dependencies for analysis
│
├── artifacts/                        Scaffolding for the 5 artifacts (source code lives here or is linked)
│   ├── 01-unit-testing-gauntlet/
│   │   └── README.md                 Metadata, dev log, technical summary
│   ├── 02-big-o-visualizer/
│   │   └── README.md
│   ├── 03-sql-injection-simulator/
│   │   └── README.md
│   ├── 04-css-flexbox-trainer/
│   │   └── README.md
│   └── 05-git-branching-sandbox/
│       └── README.md
│
├── data/                             All structured research data
│   ├── artifact-registry.json        ★ CENTRAL REGISTRY — single source of truth for artifact state
│   │
│   ├── schemas/                      JSON Schemas for validation
│   │   ├── artifact-registry.schema.json
│   │   ├── dsqi-result.schema.json
│   │   ├── expert-review.schema.json
│   │   ├── coordinator-review.schema.json
│   │   └── dev-session.schema.json
│   │
│   ├── development-logs/             Phase 1: AI-assisted development session logs
│   │   └── sessions-{slug}.json      Array of session objects per artifact
│   │
│   ├── evaluations/
│   │   ├── layer1-dsqi/              Phase 2: Self-evaluation DSQI scores
│   │   │   └── dsqi-{slug}.json
│   │   ├── layer2-expert-review/     Phase 3: External expert reviews
│   │   │   └── expert-review-{slug}-{reviewer_id}.json
│   │   └── layer3-coordinator-review/ Phase 4: Module coordinator reviews
│   │       └── coordinator-review-{slug}.json
│   │
│   └── static-analysis/              Raw tool output from code analysis
│       └── {slug}/
│           ├── cloc-output.json
│           ├── complexity-report.json
│           └── dependency-list.json
│
├── analysis/                         Python scripts for data processing and reporting
│   ├── README.md
│   ├── study_status.py               Dashboard: overall study progress
│   ├── validate_data.py              Validates JSON files against schemas
│   ├── timestamp.py                  Reliable ISO 8601 timestamps
│   ├── wakatime_fetch.py             WakaTime API query per-project
│   ├── session_start.py              Open new development session
│   ├── session_close.py              Close session with LOC, WakaTime, registry update
│   ├── dsqi_collect.py               Automated DSQI metric collection (M₁–M₃, C₁–C₃)
│   ├── generate_dsqi_report.py       (to be created) DSQI comparison tables/charts
│   ├── generate_expert_report.py     (to be created) Expert review aggregation
│   ├── generate_coordinator_report.py (to be created) Coordinator review summary
│   ├── generate_summary_report.py    (to be created) Combined results for paper
│   └── output/                       (git-ignored) Generated reports and figures
│
├── sources/                          Research source materials
│   ├── concept/
│   │   └── Research Strategy Summary_ Disposable Software in CS Education.md
│   └── protocols/                    The evaluation protocol definitions
│       ├── DSQI Evaluation Protocol (Revised).md
│       ├── Expert Review Protocol for Disposable Educational Software (Revised).md
│       ├── Multi-Artifact Study Protocol for Disposable Software (Revised).md
│       ├── Pedagogical Utility Evaluation Protocol for Module Coordinators.md
│       └── Summary_ Revised Evaluation Protocols for Disposable Software Study.md
│
├── surveys/                          Distribution materials for reviewers
│   ├── README.md
│   ├── expert-reviewer-invitation.md
│   └── coordinator-invitation.md
│
├── checklists/                       Actionable checklists for running the protocol
│   └── study-protocol-checklists.md
│
├── paper/                            Paper drafts and submission materials
│   ├── README.md
│   ├── drafts/
│   ├── figures/
│   ├── references/
│   └── submission/
│
└── presentation/                     Slides, demos, handouts
    └── README.md
```

---

## 4. Key Files and Their Roles

| File | Role | Format | When to Update |
| :--- | :--- | :--- | :--- |
| `data/artifact-registry.json` | **Central registry** — tracks status, metadata, scores for all 5 artifacts and all reviewers | JSON (see schema) | After every milestone (development, evaluation, review) |
| `data/schemas/*.schema.json` | Validation schemas for all data files | JSON Schema draft-07 | Only if evaluation protocol changes |
| `data/development-logs/sessions-{slug}.json` | Raw session-by-session development observations | JSON array | During each development session |
| `data/evaluations/layer1-dsqi/dsqi-{slug}.json` | DSQI self-evaluation results | JSON | After completing DSQI calculation |
| `data/evaluations/layer2-expert-review/expert-review-{slug}-{reviewer_id}.json` | Individual expert review data | JSON | After transcribing each expert review |
| `data/evaluations/layer3-coordinator-review/coordinator-review-{slug}.json` | Module coordinator review data | JSON | After transcribing coordinator review |
| `artifacts/{slug}/README.md` | Human-readable artifact metadata and development log | Markdown | During and after development |
| `checklists/study-protocol-checklists.md` | Step-by-step checklists for all 6 phases | Markdown | Check off as you progress |

---

## 5. Naming Conventions

### Artifact Slugs

All artifact references use a zero-padded two-digit ID followed by a kebab-case name:

```
{NN}-{kebab-case-name}
```

Examples: `01-unit-testing-gauntlet`, `02-big-o-visualizer`

### Data Files

| Pattern | Location | Example |
| :--- | :--- | :--- |
| `sessions-{slug}.json` | `data/development-logs/` | `sessions-03-sql-injection-simulator.json` |
| `dsqi-{slug}.json` | `data/evaluations/layer1-dsqi/` | `dsqi-01-unit-testing-gauntlet.json` |
| `expert-review-{slug}-{reviewer_id}.json` | `data/evaluations/layer2-expert-review/` | `expert-review-02-big-o-visualizer-reviewer-a.json` |
| `coordinator-review-{slug}.json` | `data/evaluations/layer3-coordinator-review/` | `coordinator-review-04-css-flexbox-trainer.json` |

### Reviewer IDs

Expert reviewers are identified by a lowercase string ID: `reviewer-a`, `reviewer-b`, etc. These map to real names in `artifact-registry.json` only.

---

## 6. Data Formats — Quick Reference

### DSQI Formula

```
DSQI = w₁ × (1 − M) + w₂ × (1 − C) + w₃ × P + w₄ × E
```

Default weights: `w₁=0.3, w₂=0.2, w₃=0.3, w₄=0.2` (sum = 1.0)

| Component | Meaning | Direction |
| :--- | :--- | :--- |
| M | Maintenance Cost | Lower is better (inverted: `1 - M`) |
| C | Creation Cost | Lower is better (inverted: `1 - C`) |
| P | Pedagogical Alignment | Higher is better |
| E | Pedagogical Purity | Higher is better |

### ICAP Score Mapping

```json
{ "passive": 0.25, "active": 0.50, "constructive": 0.75, "interactive": 1.0 }
```

### Likert Normalization (1–5 → 0–1)

```
normalized = (raw_score - 1) / 4
```

---

## 7. Three-Layer Evaluation Summary

```
┌─────────────────────────────────────────────────────────────┐
│  LAYER 1: DSQI Self-Evaluation                              │
│  Evaluator: Researcher (you)                                │
│  Protocol:  sources/protocols/DSQI Evaluation Protocol...md │
│  Output:    data/evaluations/layer1-dsqi/dsqi-{slug}.json   │
│  Focus:     Quantitative metrics of disposability quality    │
├─────────────────────────────────────────────────────────────┤
│  LAYER 2: Expert Review                                     │
│  Evaluator: 3–5 external SE/CS-education experts            │
│  Protocol:  sources/protocols/Expert Review Protocol...md   │
│  Output:    data/evaluations/layer2-expert-review/           │
│  Focus:     Technical quality, usability, pedagogical design │
├─────────────────────────────────────────────────────────────┤
│  LAYER 3: Module Coordinator Review                         │
│  Evaluator: UL CSIS module coordinators (1 per artifact)    │
│  Protocol:  sources/protocols/Pedagogical Utility...md      │
│  Output:    data/evaluations/layer3-coordinator-review/       │
│  Focus:     Authentic classroom value, curricular fit        │
└─────────────────────────────────────────────────────────────┘
```

---

## 8. Study Phases & Timeline

| Phase | Activity | Data Produced | Estimated Duration |
| :--- | :--- | :--- | :--- |
| **0. Setup** | ← YOU ARE HERE — workspace structure created | — | Done |
| **1. Development** | Create 5 artifacts using AI-assisted protocol | `development-logs/`, artifact source code | 6–8 weeks |
| **2. Self-Eval** | Calculate DSQI for each artifact | `layer1-dsqi/`, `static-analysis/` | 1 week |
| **3. Expert Review** | Distribute & collect expert reviews | `layer2-expert-review/` | 2–3 weeks |
| **4. Coord. Review** | Distribute & collect coordinator reviews | `layer3-coordinator-review/` | 2–3 weeks |
| **5. Analysis** | Aggregate, analyse, generate reports & figures | `analysis/output/` | 1 week |
| **6. Writing** | Draft and submit paper | `paper/` | 3–4 weeks |

---

## 9. Tools & Commands

### Session Management

```bash
# Start a new development session for an artifact
npm run session:start -- --artifact 2

# Close out a session (counts LOC, fetches WakaTime, updates log)
npm run session:close -- --artifact 2

# Close AND finalize an artifact as fully developed
npm run session:close -- --artifact 2 --final --tech "HTML,CSS,JavaScript"
```

### Timestamps & WakaTime

```bash
# Get a reliable ISO 8601 timestamp (local or UTC)
npm run ts                                     # local time with UTC offset
npm run ts:utc                                 # UTC

# Fetch WakaTime stats for an artifact
npm run wakatime -- --project 01-unit-testing-gauntlet
npm run wakatime -- --project 01-unit-testing-gauntlet --save --summary
```

### Analysis Scripts

```bash
npm run status              # Print study progress dashboard
npm run validate:all        # Validate all JSON data against schemas
npm run validate:dsqi       # Validate DSQI files only
npm run report:dsqi         # Generate DSQI comparison report
npm run report:summary      # Generate combined results summary
```

### Static Analysis & DSQI Metrics

```bash
# Collect all automated DSQI metrics for an artifact (M₁–M₃, C₁–C₃)
# Runs cloc, complexity analysis, dependency scan, reads session logs
# Outputs: layer1-dsqi/dsqi-{slug}.json + static-analysis/{slug}/*.json
npm run dsqi:collect -- --artifact 1

# Override deployment steps if the heuristic is wrong
npm run dsqi:collect -- --artifact 2 --deployment-steps 5

# Specify deployment method + step descriptions explicitly
npm run dsqi:collect -- --artifact 3 --deploy-method "Vercel" --deploy-steps-desc "npm run build,vercel deploy"
```

### Python Environment

```bash
pip install -r requirements.txt
```

---

## 10. Notes for AI Assistants / Future Tools

If you are an AI assistant or a script reading this file to understand the workspace:

1. **Start with `data/artifact-registry.json`** — it contains the current state of every artifact and the study as a whole.
2. **All evaluation data is JSON** and conforms to schemas in `data/schemas/`. Always validate before processing.
3. **Artifact slugs are the universal join key** — they link `artifacts/{slug}/`, `data/development-logs/sessions-{slug}.json`, `data/evaluations/*/...{slug}...json`, and `data/static-analysis/{slug}/`.
4. **The `status` field in the registry** tells you how far along each artifact is. Use the lifecycle states in Section 2 to determine what operations are valid.
5. **Evaluation layers are independent** — Layer 1 data exists in `layer1-dsqi/`, Layer 2 in `layer2-expert-review/`, Layer 3 in `layer3-coordinator-review/`. They can be processed separately or joined by `artifact_id`.
6. **All Likert-scale data uses 1–5** and is normalised to 0–1 using `(score - 1) / 4`.
7. **DSQI is a composite score between 0 and 1.** Higher is better. See formula in Section 6.
8. **When generating reports**, read all JSON files in a layer directory, group by `artifact_id`, and compute means for numeric fields. Qualitative fields (justifications, comments) should be collected for thematic analysis.
9. **File creation during development**: When an artifact is being developed, its source code should live under `artifacts/{slug}/src/` or be linked via its `repository_url` in the registry.
10. **This document should be updated** if the structure changes. It is the contract between the workspace and any tool that reads it.
