# AI-Generated Disposable Software as Active Learning Instruments in CS Education

## Reproducibility Data Pack

This repository is the **complete data pack** for reproducing and verifying the study *"AI-Generated Disposable Software as Active Learning Instruments in CS Education"*. It contains every artifact, dataset, evaluation instrument, analysis script, and development log produced during the research — from initial prompt engineering through to final DSQI scoring.

**Author:** Andrew Le Gear  
**Affiliation:** ABCD Research Group, Lero, Department of Computer Science and Information Systems, University of Limerick  
**Context:** Postgraduate Diploma in Learning, Teaching and Assessment in Higher Education — *Leadership in Learning, Teaching and Assessment* module project  
**Date:** February 2026  
**License:** MIT (code), CC BY 4.0 (data and documentation)

---

## Study Summary

Educational software rots. Tools built for one semester break the next, and even when they survive, teachers often reject them anyway (Levy & Ben-Ari, 2007). The conventional response is to build *more durable* software. This study asks the opposite question: **what if the software is designed to be thrown away?**

We invert Wiley's (2013) disposable-versus-renewable dichotomy — normally applied to student assignments — and apply it to the *tools educators use*. The instrument is ephemeral; the learning it produces is not. Using large language models as a pedagogical forge, an educator can generate a bespoke, single-concept, browser-based active learning tool through prompt engineering alone — no code written by hand — and discard it when the class ends. Software rot becomes irrelevant when ephemerality is the design intent.

Five such artifacts were produced across five CS modules in 199 minutes of wall-clock time (6,993 lines, zero human-authored). Each is evaluated using a novel composite metric, the **Disposable Software Quality Index (DSQI)**, which combines automated static analysis (maintenance cost, creation cost) with structured human judgement (pedagogical utility via the ICAP framework, expert purity review). The goal: determine whether AI-generated throwaway code can reliably reach the *Constructive* or *Interactive* engagement modes that the active learning literature shows produce the deepest learning (Chi & Wylie, 2014).

### Key Figures

| Metric | Value |
|:--|:--|
| Artifacts produced | 5 |
| Total lines of code | 6,241 (cloc, code only) |
| Total development time | 199 minutes (~3.3 hours) |
| Lines written by human | 0 |
| AI generation ratio | 1.0 |
| Mean DSQI | **0.864** (range 0.790–0.911) |

---

## Repository Structure

```
aiDisposableActiveLearning/
│
├── README.md                          ← You are here (data pack overview)
├── index.html                         ← Study portal (GitHub Pages landing page)
├── favicon.svg                        ← Shared favicon
│
├── artifacts/                         ← The 5 educational software artifacts
│   ├── 01-unit-testing-gauntlet/      ← CS5703: Software Quality
│   │   ├── src/                       ← Deployable source (index.html, style.css, game.js)
│   │   └── README.md                  ← Design rationale, mechanics, DSQI metrics
│   ├── 02-big-o-visualiser/           ← CS4115: Data Structures and Algorithms
│   │   ├── src/
│   │   └── README.md
│   ├── 03-sql-injection-simulator/    ← CS4416: Database Systems
│   │   ├── src/
│   │   └── README.md
│   ├── 04-css-flexbox-trainer/        ← CS4141/CS4222: Intro to Programming / Software Dev
│   │   ├── src/
│   │   └── README.md
│   └── 05-lexical-analyser-trainer/   ← CS4158: Programming Language Technology
│       ├── src/
│       └── README.md
│
├── data/                              ← All collected and computed data
│   ├── artifact-registry.json         ← Master registry: metadata, URLs, DSQI scores
│   ├── development-logs/              ← Per-artifact session logs (YAML) + WakaTime exports
│   ├── evaluations/
│   │   ├── layer1-dsqi/               ← DSQI evaluation JSON per artifact (M, C, P, E, final)
│   │   ├── layer2-expert-review/      ← Expert reviewer responses (3 reviewers × 5 artifacts)
│   │   └── layer3-coordinator-review/ ← Module coordinator responses (1 per artifact)
│   └── static-analysis/               ← Per-artifact cloc + complexity output
│       ├── 01-unit-testing-gauntlet/
│       ├── 02-big-o-visualiser/
│       ├── 03-sql-injection-simulator/
│       ├── 04-css-flexbox-trainer/
│       └── 05-lexical-analyser-trainer/
│
├── surveys/                           ← Evaluation instruments (deployable web tools)
│   ├── expert-review-tool/            ← Expert reviewer survey (all 5 artifacts, ~25 min)
│   │   ├── index.html
│   │   ├── style.css
│   │   ├── survey.js
│   │   └── survey-data.js
│   ├── coordinator-review-tool/       ← Module coordinator survey (single artifact, ~10 min)
│   │   ├── index.html
│   │   ├── style.css
│   │   ├── survey.js
│   │   └── survey-data.js
│   └── README.md
│
├── analysis/                          ← Reproducible analysis scripts
│   ├── dsqi_collect.py                ← Computes DSQI M and C sub-scores from static analysis
│   ├── dsqi_score.py                  ← Computes P, E and final DSQI from all evaluation layers
│   ├── validate_data.py               ← JSON schema validation for all data files
│   ├── study_status.py                ← Study progress dashboard
│   └── wakatime_export.py             ← Exports WakaTime session data
│
├── paper/                             ← Manuscript drafts and submission materials
├── presentation/                      ← Dissemination materials (slides, demos, handouts)
├── checklists/                        ← Study checklists and tracking
│
├── requirements.txt                   ← Python dependencies
└── .gitignore
```

---

## Artifacts

| # | Name | Module | Domain | Lines | Time | DSQI |
|:-:|:-----|:-------|:-------|------:|-----:|:----:|
| 1 | [The Unit Testing Gauntlet](artifacts/01-unit-testing-gauntlet/) | CS5703 | TDD / Red-Green-Refactor | 1,397 | 19 min | **0.897** |
| 2 | [The Big-O Dojo](artifacts/02-big-o-visualiser/) | CS4115 | Algorithm Complexity | 1,604 | 36 min | **0.911** |
| 3 | [SQL Injection Lab](artifacts/03-sql-injection-simulator/) | CS4416 | SQL Injection / Defence | 1,455 | 53 min | **0.896** |
| 4 | [Flexbox Forge](artifacts/04-css-flexbox-trainer/) | CS4141/CS4222 | CSS Flexbox Layout | 872 | 37 min | **0.790** |
| 5 | [Lex Arena](artifacts/05-lexical-analyser-trainer/) | CS4158 | Lexical Analysis / Regex | 913 | 54 min | **0.827** |

### Live Demos

All artifacts are deployed on GitHub Pages:

- [01 — The Unit Testing Gauntlet](https://andylegear.github.io/aiDisposableActiveLearning/artifacts/01-unit-testing-gauntlet/src/index.html)
- [02 — The Big-O Dojo](https://andylegear.github.io/aiDisposableActiveLearning/artifacts/02-big-o-visualiser/src/index.html)
- [03 — SQL Injection Lab](https://andylegear.github.io/aiDisposableActiveLearning/artifacts/03-sql-injection-simulator/src/index.html)
- [04 — Flexbox Forge](https://andylegear.github.io/aiDisposableActiveLearning/artifacts/04-css-flexbox-trainer/src/index.html)
- [05 — Lex Arena](https://andylegear.github.io/aiDisposableActiveLearning/artifacts/05-lexical-analyser-trainer/src/index.html)

---

## DSQI — Disposable Software Quality Index

The DSQI is a composite metric defined as:

```
DSQI = 0.3(1 − M) + 0.2(1 − C) + 0.3P + 0.2E
```

| Component | Weight | Source | Status |
|:----------|:------:|:-------|:-------|
| **M** — Maintenance Cost | 0.3 | Automated (cyclomatic complexity, lines of code) | ✅ Collected |
| **C** — Creation Cost | 0.2 | Automated (dev time, prompt count, WakaTime) | ✅ Collected |
| **P** — Pedagogical Utility | 0.3 | Module coordinator survey (P₁ alignment + P₂ ICAP) | ✅ Collected |
| **E** — Expert Purity | 0.2 | Expert reviewer survey (heuristics, fidelity, replicability) | ✅ Collected |

### Final DSQI Results

| Artifact | M | C | P | E | **DSQI** |
|:---------|:---:|:---:|:---:|:---:|:--------:|
| 01 — Unit Testing Gauntlet | 0.190 | 0.106 | 1.000 | 0.875 | **0.897** |
| 02 — Big-O Dojo | 0.126 | 0.132 | 1.000 | 0.875 | **0.911** |
| 03 — SQL Injection Lab | 0.202 | 0.134 | 1.000 | 0.917 | **0.896** |
| 04 — Flexbox Forge | 0.143 | 0.084 | 0.583 | 0.875 | **0.790** |
| 05 — Lex Arena | 0.198 | 0.098 | 0.742 | 0.917 | **0.827** |
| | | | | **Mean** | **0.864** |

Three of five artifacts (01, 02, 03) achieved P = 1.0 — rated *Interactive* on the ICAP scale by their module coordinators with maximum curriculum alignment scores. Artifact 04 is the outlier at P = 0.583 (rated *Active*). Expert purity (E) is consistently high across the board (0.875–0.917), indicating strong conceptual fidelity and process replicability as assessed by three independent industry reviewers.

---

## Evaluation Instruments

| Instrument | Target | Duration | URL |
|:-----------|:-------|:---------|:----|
| [Expert Review Survey](surveys/expert-review-tool/) | Software engineers, CS educators | ~25 min | [Launch](https://andylegear.github.io/aiDisposableActiveLearning/surveys/expert-review-tool/index.html) |
| [Coordinator Review Survey](surveys/coordinator-review-tool/) | Module coordinators (1 artifact each) | ~10 min | [Launch](https://andylegear.github.io/aiDisposableActiveLearning/surveys/coordinator-review-tool/index.html) |

Both surveys are pure client-side web applications. Responses are downloaded as structured JSON files — no data is transmitted to any server.

---

## Reproducing the Analysis

### Prerequisites

- Python 3.10+
- `pip install -r requirements.txt`

### Step 1 — Collect M and C Sub-Scores

```bash
python analysis/dsqi_collect.py --artifact 01-unit-testing-gauntlet
python analysis/dsqi_collect.py --artifact 02-big-o-visualiser
python analysis/dsqi_collect.py --artifact 03-sql-injection-simulator
python analysis/dsqi_collect.py --artifact 04-css-flexbox-trainer
python analysis/dsqi_collect.py --artifact 05-lexical-analyser-trainer
```

### Step 2 — Compute Final DSQI (P, E, and composite)

```bash
python analysis/dsqi_score.py --verbose
```

This reads coordinator reviews (Layer 3) and expert reviews (Layer 2) to compute P and E, then patches the Layer 1 DSQI JSON files and `artifact-registry.json` with final scores.

### Step 3 — Validate and Review

```bash
python analysis/validate_data.py --target all
python analysis/study_status.py
```

---

## Development Timeline

| Date | Session | Duration | Artifacts |
|:-----|:--------|:---------|:----------|
| 2026-02-17 | Session 1 | 19 min | 01 — Unit Testing Gauntlet |
| 2026-02-17 | Session 2 | 36 min | 02 — Big-O Dojo |
| 2026-02-18 | Session 3 | 53 min | 03 — SQL Injection Lab |
| 2026-02-18 | Session 4 | 37 min | 04 — Flexbox Forge |
| 2026-02-18 | Session 5 | 54 min | 05 — Lex Arena |
| | **Total** | **199 min** | **5 artifacts** |

---

## Citation

```bibtex
@misc{legear2026disposable,
  author       = {Le Gear, Andrew},
  title        = {AI-Generated Disposable Software as Active Learning
                  Instruments in CS Education: Reproducibility Data Pack},
  year         = {2026},
  publisher    = {GitHub},
  url          = {https://github.com/andylegear/aiDisposableActiveLearning}
}
```

---

## Contact

**Andrew Le Gear**  
ABCD Research Group, Lero  
Department of Computer Science and Information Systems  
University of Limerick  
andrew.p.legear@ul.ie
