# Methodology: AI-Generated Disposable Software as Active Learning Instruments in CS Education

> **Status:** Exhaustive technical reference — not the paper itself. Intended to be distilled into the paper's Methodology section (~1,500 words).  
> **Study type:** Empirical Study (Design-Based Research)  
> **Target journal:** *Computer Science Education* (Taylor & Francis), max 12,000 words  

---

## Table of Contents

1. [Motivation and Problem Statement](#1-motivation-and-problem-statement)
2. [Research Questions](#2-research-questions)
3. [Contributions](#3-contributions)
4. [Theoretical Framework](#4-theoretical-framework)
   - 4.1 [ICAP Framework](#41-icap-framework)
   - 4.2 [Constructionism](#42-constructionism)
   - 4.3 [TPACK](#43-tpack)
   - 4.4 [Activity Theory](#44-activity-theory)
   - 4.5 [Synthesised Lens: Constructionist TPACK in an AI-Mediated Activity System](#45-synthesised-lens)
5. [Research Design: Design-Based Research](#5-research-design-design-based-research)
6. [The Disposable Software Quality Index (DSQI)](#6-the-disposable-software-quality-index-dsqi)
   - 6.1 [Philosophy](#61-philosophy)
   - 6.2 [Formula](#62-formula)
   - 6.3 [Component Definitions and Normalisation Formulae](#63-component-definitions-and-normalisation-formulae)
   - 6.4 [Weight Selection and Justification](#64-weight-selection-and-justification)
   - 6.5 [Quality Threshold](#65-quality-threshold)
7. [Artifact Development Protocol](#7-artifact-development-protocol)
   - 7.1 [Artifacts and Module Alignment](#71-artifacts-and-module-alignment)
   - 7.2 [AI-Assisted Development Process](#72-ai-assisted-development-process)
   - 7.3 [Technical Constraints](#73-technical-constraints)
8. [Three-Layer Evaluation Protocol](#8-three-layer-evaluation-protocol)
   - 8.1 [Layer 1: DSQI Self-Assessment](#81-layer-1-dsqi-self-assessment)
   - 8.2 [Layer 2: Independent Expert Review](#82-layer-2-independent-expert-review)
   - 8.3 [Layer 3: Module Coordinator Review](#83-layer-3-module-coordinator-review)
   - 8.4 [Triangulation Rationale](#84-triangulation-rationale)
9. [Participants](#9-participants)
10. [Data Collection and Management](#10-data-collection-and-management)
11. [Core Analysis Methods](#11-core-analysis-methods)
12. [Extended Analysis Methods (A–J)](#12-extended-analysis-methods-aj)
    - 12.1 [Analysis A: Descriptive Statistics](#121-analysis-a-descriptive-statistics)
    - 12.2 [Analysis B: Inter-Rater Reliability](#122-analysis-b-inter-rater-reliability)
    - 12.3 [Analysis C: Heuristic Usability Profiles](#123-analysis-c-heuristic-usability-profiles)
    - 12.4 [Analysis D: ICAP Concordance](#124-analysis-d-icap-concordance)
    - 12.5 [Analysis E: Adoption Intention](#125-analysis-e-adoption-intention)
    - 12.6 [Analysis F: Constructionism Alignment](#126-analysis-f-constructionism-alignment)
    - 12.7 [Analysis G: Development Efficiency](#127-analysis-g-development-efficiency)
    - 12.8 [Analysis H: DSQI Sensitivity Analysis](#128-analysis-h-dsqi-sensitivity-analysis)
    - 12.9 [Analysis I: Cross-Layer Correlations](#129-analysis-i-cross-layer-correlations)
    - 12.10 [Analysis J: Qualitative Thematic Analysis (AI-Assisted)](#1210-analysis-j-qualitative-thematic-analysis-ai-assisted)
13. [Validity and Reliability](#13-validity-and-reliability)
14. [Ethical Considerations](#14-ethical-considerations)
15. [Limitations](#15-limitations)
16. [Study Phases and Timeline](#16-study-phases-and-timeline)
17. [Computational Reproducibility](#17-computational-reproducibility)
18. [References](#18-references)

---

## 1. Motivation and Problem Statement

Educational software in computer science faces a well-documented **maintenance burden**. Tools built for classroom use must be updated across changing curricula, evolving technology stacks, shifting browser standards, and growing dependency graphs. The result is that many bespoke educational tools become obsolete before they recoup their development investment, discouraging educators from creating purpose-built learning instruments.

The emergence of generative AI — in particular, large language models integrated into development environments (e.g., GitHub Copilot, Claude) — opens a qualitatively new possibility: **disposable software**. Rather than building durable, general-purpose educational tools, an educator could generate a *bespoke, ephemeral, single-use* tool on demand, tailored to a specific pedagogical need, and discard it when the need passes. The concept extends David Wiley's (2013) disposable/renewable assignment dichotomy from the *work produced by students* to the *tools used by educators*.

The central argument is that **intentional ephemerality can be a strategic advantage**: disposable software trades longevity for immediacy, eliminates the maintenance liability, and restores educator agency in educational technology creation. However, this claim requires empirical validation: can such tools actually be produced efficiently? Do they meet quality standards? Do educators value them?

This study investigates these questions through the systematic creation and multi-perspective evaluation of five AI-generated disposable software artifacts for computer science education.

---

## 2. Research Questions

| ID | Research Question | Scope |
|----|-------------------|-------|
| **RQ1** | Can AI-generated disposable software artifacts meet minimum quality thresholds for educational use? | Quality (DSQI scores, usability, educational fidelity) |
| **RQ2** | How do educators perceive the pedagogical value of disposable software? | Perception (expert review, coordinator alignment, adoption intention) |
| **RQ3** | Does disposable software promote active learning as characterised by the ICAP framework? | Engagement (ICAP classification across three evaluation layers) |

**RQ1** addresses feasibility and quality via the novel DSQI metric. **RQ2** addresses practical value from multiple educator perspectives. **RQ3** addresses alignment with established active learning theory.

---

## 3. Contributions

The study makes three distinct contributions:

### 3.1 Conceptual Innovation
Introduction of **AI-generated disposable software** as a new paradigm for educational technology in CS education. This reframes ephemerality as a design feature rather than a deficiency.

### 3.2 Methodological Innovation
Presentation of the **Disposable Software Quality Index (DSQI)**, a formal composite index for evaluating disposable software artifacts. The DSQI provides a structured, repeatable methodology that other researchers can adopt and refine.

### 3.3 Empirical Demonstration
A proof-of-concept through the multi-artifact, multi-perspective evaluation of five AI-generated tools, demonstrating that:
- Disposable software can be created rapidly (mean 39.8 minutes per artifact, 100% AI generation).
- Such software can achieve high levels of cognitive engagement (ICAP: Constructive/Interactive).
- Domain-expert coordinators express strong adoption intention (mean 4.60/5).

---

## 4. Theoretical Framework

The study is grounded in a synthesised multi-lens theoretical framework: **Constructionist TPACK in an AI-Mediated Activity System**. Each component provides a distinct analytical lens.

### 4.1 ICAP Framework

The **ICAP framework** (Chi & Wylie, 2014) classifies student cognitive engagement into four hierarchical modes:

| Level | Description | Behavioural Indicators | Numeric Score |
|-------|-------------|----------------------|---------------|
| **Passive** | Receiving information without overt processing | Watching, listening, reading without annotation | 0.25 |
| **Active** | Physically manipulating given information | Highlighting, clicking through, selecting from options | 0.50 |
| **Constructive** | Producing new outputs that go beyond given information | Writing code, explaining reasoning, creating solutions | 0.75 |
| **Interactive** | Engaging in sustained dialogue where contributions build on each other | Collaborative problem-solving, turn-based feedback dialogue with system | 1.00 |

**ICAP predicts**: Interactive > Constructive > Active > Passive for learning outcomes (Chi & Wylie, 2014). The framework is central to this study in two ways:

1. **As a design goal:** Artifacts are designed to promote Constructive or Interactive engagement, not merely Active manipulation.
2. **As an evaluation instrument:** ICAP classifications are collected from all three evaluation layers (self, expert, coordinator) and triangulated.

**Operationalisation.** ICAP level is assessed categorically. Each evaluator selects exactly one of the four levels based on the *primary* mode of engagement the tool is designed to elicit. The numeric scores (0.25–1.00) are used in the DSQI formula's P₂ component.

### 4.2 Constructionism

**Constructionism** (Papert, 1980; Papert & Harel, 1991) posits that people learn most effectively when they are actively constructing a meaningful, public artifact. The theory extends Piaget's constructivism by emphasising the role of *making* — building, designing, programming — in learning.

**Relevance to this study:**
- The artifacts are evaluated for **constructionist alignment** through two expert-rated dimensions: (a) the extent to which the user creates a *meaningful artifact* within the tool, and (b) how well the tool supports *learning through building/making/fixing*.
- There is a theoretical tension between "disposable" (AI-generated, ephemeral) tools and "meaningful artifact creation" (a core constructionist principle). This tension is itself a contribution of the study — investigating whether short-lived tools can support constructionist learning.

**Operationalisation.** Two 5-point Likert items in the Expert Review Protocol:
1. *"To what extent does the user create a meaningful artifact within the context of the tool?"* (1–5)
2. *"How well does the tool support the idea of learning through building/making/fixing?"* (1–5)

### 4.3 TPACK

**Technological Pedagogical Content Knowledge** (Koehler & Mishra, 2009) describes the integrated knowledge educators need to effectively use technology in teaching. TPACK sits at the intersection of:
- **Content Knowledge (CK):** Knowledge of the subject matter (e.g., SQL injection, lexical analysis).
- **Pedagogical Knowledge (PK):** Knowledge of teaching methods and learning theories.
- **Technological Knowledge (TK):** Knowledge of technologies and how to use them.

**Relevance:** The disposable software paradigm shifts the TK requirement. Rather than needing deep software engineering skills to build and maintain educational tools, educators leverage AI to generate tools on demand. This redistribution of TPACK components is a central argument of the paper.

### 4.4 Activity Theory

**Activity Theory** (Engeström, 1987) provides a socio-technical systems lens for understanding the context in which disposable software operates. The activity system comprises:
- **Subject:** The educator
- **Object:** The learning objective
- **Tool:** The AI-generated disposable software (mediating artifact)
- **Community:** The department, students, institution
- **Division of labour:** Educator designs prompt; AI generates code; students use tool
- **Rules:** Curriculum requirements, assessment criteria, institutional norms

**Relevance:** Activity Theory contextualises the disposable software paradigm within institutional and social structures, explaining why educator agency matters and how the paradigm interacts with existing educational workflows.

### 4.5 Synthesised Lens

The four frameworks are not applied independently but as a **synthesised theoretical lens**:

- **Constructionism** provides the *philosophy of learning* — learning through making.
- **TPACK** provides the *educator competency model* — the knowledge required to create effective educational technology.
- **ICAP** provides the *evaluation lens* — a measurable hierarchy of cognitive engagement.
- **Activity Theory** provides the *systemic context* — understanding the disposable software paradigm within its socio-technical environment.

Together, they form an analytical framework capable of addressing the conceptual, practical, and systemic dimensions of AI-generated disposable educational software.

---

## 5. Research Design: Design-Based Research

The study follows a **Design-Based Research (DBR)** methodology (Barab & Squire, 2004; Anderson & Shattuck, 2012). DBR is an established approach in educational technology research that iterates between design, implementation, and evaluation in authentic educational contexts.

**Why DBR is appropriate:**
1. **Novel design artifact:** The DSQI and the disposable software concept are both new — DBR accommodates the simultaneous development and evaluation of novel interventions.
2. **Authentic evaluation context:** The artifacts are evaluated by real module coordinators for real courses, not in a laboratory setting.
3. **Iterative refinement:** The protocol was revised iteratively (e.g., replacing reusability metrics with process replicability) based on conceptual critique — this is characteristic of DBR's iterative cycles.

**Current phase:** This study represents **Phase 1** of a DBR programme — design and artifact-centric evaluation. Future phases would involve classroom deployment, student data collection (requiring ethics approval), and further iteration.

**Artifact-centric evaluation:** A key methodological decision is that this study evaluates the *artifacts themselves* rather than student learning outcomes. This is a legitimate and established approach in DBR (Reeves, 1994) and educational technology research, particularly when the design artifact or framework is itself the primary contribution.

---

## 6. The Disposable Software Quality Index (DSQI)

### 6.1 Philosophy

The DSQI is a composite index designed to measure the quality of a disposable software artifact. Its philosophy is built on the premise that the value of disposable software lies in three properties:

1. **Speed of creation** — the artifact should be producible rapidly and with minimal educator effort.
2. **Low maintenance overhead** — the artifact should carry negligible ongoing maintenance cost.
3. **Hyper-focused pedagogical precision** — the artifact should faithfully represent a single learning concept without feature bloat.

The original framework included metrics for reusability and extensibility, but these were removed during protocol revision because they contradict the disposability thesis. A disposable tool is not meant to be customised or extended; it is meant to be *replaced*. The revised E component measures **pedagogical purity** — conceptual fidelity and process replicability — shifting the focus from reusing the *artifact* to reusing the *AI-assisted workflow*.

### 6.2 Formula

$$
\text{DSQI} = w_1(1 - M) + w_2(1 - C) + w_3 P + w_4 E
$$

Where:
- $M$ — Maintenance Cost Score (normalised, higher = more costly)
- $C$ — Creation Cost Score (normalised, higher = more costly)
- $P$ — Pedagogical Alignment Score (normalised, higher = better aligned)
- $E$ — Educational Purity Score (normalised, higher = purer)
- $w_1 = 0.30$, $w_2 = 0.20$, $w_3 = 0.30$, $w_4 = 0.20$

The $(1 - M)$ and $(1 - C)$ inversions ensure that all four components are positively oriented: higher values always indicate better quality. The DSQI score ranges from 0 to 1.

### 6.3 Component Definitions and Normalisation Formulae

#### M — Maintenance Cost

$M$ is a normalised composite of three sub-metrics measuring the ongoing burden of keeping the artifact operational:

| Sub-Metric | Measurement Method | Normalisation | Rationale |
|-----------|-------------------|---------------|-----------|
| **Dependency count** | Count of external runtime dependencies (from `package.json`, manual audit, or dependency-list output) | $\frac{\text{deps}}{N_{\max}}$ where $N_{\max}$ is a contextual maximum (in this study, $N_{\max} = 10$ based on the maximum plausible for single-page apps) | More dependencies = more maintenance (version updates, security patches, breaking changes) |
| **Cyclomatic complexity** | Mean function-level cyclomatic complexity from static analysis tool | $\frac{\overline{CC}}{CC_{\max}}$ where $CC_{\max} = 20$ (above 20 is universally flagged as high complexity) | Higher complexity = harder to understand and fix |
| **Deployment steps** | Manual count of steps required to deploy from source | $\frac{\text{steps}}{S_{\max}}$ where $S_{\max} = 10$ | More steps = higher deployment friction |

$$
M = \frac{1}{3}\left(\frac{\text{deps}}{N_{\max}} + \frac{\overline{CC}}{CC_{\max}} + \frac{\text{steps}}{S_{\max}}\right)
$$

#### C — Creation Cost

$C$ is a normalised composite of three sub-metrics measuring the effort required to produce the artifact:

| Sub-Metric | Measurement Method | Normalisation | Rationale |
|-----------|-------------------|---------------|-----------|
| **Lines of code (LoC)** | `cloc` tool output (total code lines, excluding blanks and comments) | $\frac{\text{LoC}}{L_{\max}}$ where $L_{\max} = 5000$ (contextual maximum for single-page educational apps) | More code = more creation effort (even when AI-generated, larger artifacts require more prompting and review) |
| **AI generation ratio** | Self-reported proportion of code generated by AI (0.0–1.0) | $1 - \text{ratio}$ (inverted: higher AI ratio = lower human effort = lower cost) | AI generation reduces human creation effort |
| **Development time** | Wall-clock minutes from session logs (WakaTime + manual) | $\frac{\text{minutes}}{T_{\max}}$ where $T_{\max} = 480$ (8 hours, a full working day) | More time = more creation cost |

$$
C = \frac{1}{3}\left(\frac{\text{LoC}}{L_{\max}} + (1 - \text{AI ratio}) + \frac{\text{minutes}}{T_{\max}}\right)
$$

#### P — Pedagogical Alignment

$P$ combines two independent assessments of how well the artifact serves its target learning objective:

$$
P = \frac{P_1 + P_2}{2}
$$

| Sub-Component | Source | Computation | Rationale |
|--------------|--------|-------------|-----------|
| **P₁ (Concept Coverage)** | Layer 3 — Module Coordinator review, Q1–Q3 | $P_1 = \frac{\overline{Q_{1..3}}}{5}$ where Q1 = Curriculum Relevance, Q2 = Concept Challenge, Q3 = Objective Coverage (all 1–5 Likert) | Domain-expert assessment of curricular fit |
| **P₂ (ICAP Score)** | Layer 3 — Module Coordinator review, Q4 | $P_2 = \text{ICAP}(Q_4)$ mapped as: passive = 0.25, active = 0.50, constructive = 0.75, interactive = 1.00 | Engagement level contributes to pedagogical quality |

**Note:** P₁ is derived from the coordinator's assessment (Layer 3), not self-assessment, providing independent validation. P₂ uses the coordinator's ICAP classification for consistency with P₁'s source.

#### E — Educational Purity (formerly Epistemic Value)

$E$ captures how faithfully and replicably the artifact embodies its pedagogical purpose. It is computed from Layer 2 (expert reviews), averaged across all reviewers:

| Sub-Metric | Source | Scale | Normalisation |
|-----------|--------|-------|---------------|
| **E₁ (Conceptual Fidelity)** | Expert review: "How well does the tool isolate and represent the target concept without extraneous features?" | 1–5 Likert (1 = Poor, 5 = Excellent) | $E_{1,\text{norm}} = \frac{\text{score} - 1}{4}$ |
| **E₂ (Process Replicability)** | Expert review: "How easy would it be for another educator to follow the same process to create a different tool?" | 1–5 Likert (1 = Very Difficult, 5 = Very Easy) | $E_{2,\text{norm}} = \frac{\text{score} - 1}{4}$ |

For each expert reviewer $r$:

$$
E_r = \frac{E_{1,r,\text{norm}} + E_{2,r,\text{norm}}}{2}
$$

Averaged across $R$ reviewers:

$$
E = \frac{1}{R} \sum_{r=1}^{R} E_r
$$

**Design rationale for E₁ and E₂:**
- **E₁ (Conceptual Fidelity)** captures a unique strength of disposable software: because the tool is not general-purpose, it can represent a single concept with surgical precision, free from feature bloat.
- **E₂ (Process Replicability)** shifts the locus of reuse from the *artifact* (which is disposable) to the *creation process* (which should be transferable). This is the core scalability argument: the value is in the workflow, not the code.

### 6.4 Weight Selection and Justification

The DSQI weights were set **a priori** based on the theoretical commitments of the disposable software paradigm, then validated post-hoc through sensitivity analysis.

| Component | Weight | Rationale |
|-----------|--------|-----------|
| $(1 - M)$ Maintenance Cost | 0.30 | Disposability requires near-zero maintenance burden |
| $(1 - C)$ Creation Cost | 0.20 | AI generation should minimise educator effort |
| $P$ Pedagogical Alignment | 0.30 | Core purpose: must serve learning objectives |
| $E$ Educational Purity | 0.20 | Must faithfully represent concepts without distortion |

**Design rationale — functional pairs:**

1. **Disposability pair (M + C, combined weight 0.50):** The central premise of disposable software is that artifacts are cheap to create and carry negligible maintenance burden. Maintenance cost receives the larger share (0.30 vs. 0.20) because ongoing maintenance is the liability that disposability is specifically designed to eliminate — an artifact that is trivial to create but expensive to maintain would defeat the paradigm's purpose. Creation cost takes the smaller share because AI-assisted generation already drives C towards zero; the weight acknowledges creation effort without over-rewarding it.

2. **Pedagogical pair (P + E, combined weight 0.50):** However cheap an artifact is, it has no value if it fails to teach. This pair ensures the index cannot be maximised by cost metrics alone. Pedagogical alignment receives the larger share (0.30 vs. 0.20) because an artifact's ability to serve its target learning objective — measured through coordinator evaluation and ICAP classification — is the primary educational concern. Educational purity takes the smaller share because, while conceptual fidelity and process replicability are important, they are secondary to whether the artifact actually addresses curriculum needs.

3. **Equal pair balance (0.50 / 0.50):** The disposability and pedagogical pairs are weighted equally to prevent either dimension from dominating the index. An artifact that is perfectly disposable but pedagogically poor should not pass, and vice versa.

**Post-hoc validation (Extended Analysis H):** 633 weight combinations were tested by perturbing each weight ±0.15 in 0.05 steps (all weights constrained to [0.05, 0.50], sum = 1.0). Mean Kendall's τ = 0.725 (SD = 0.267), confirming that artifact rankings are moderately robust to weight choice. The pedagogical weight ($w_P$) had zero impact on rank ordering (τ = 1.0 for all perturbations), because P is already the most discriminating component.

### 6.5 Quality Threshold

A DSQI score $\geq$ **0.70** is defined as the minimum quality threshold for educational viability. The threshold is grounded in three complementary arguments:

1. **Distributional interpretation.** The DSQI is a weighted sum of four normalised $[0, 1]$ components. A score of 0.70 requires balanced performance across multiple dimensions — it cannot be achieved by excelling on one component while failing on others. For example: perfect disposability (M = 0, C = 0) but zero pedagogy (P = 0, E = 0) yields only 0.50; perfect pedagogy (P = 1, E = 1) with maximum cost (M = 1, C = 1) also yields only 0.50.

2. **Conventional precedent.** The 70% threshold aligns with widely-used pass marks in educational assessment and quality benchmarks. Similar composite indices in software engineering (e.g., the Maintainability Index) commonly use 65–75% as acceptable thresholds. At the University of Limerick, 70% marks the boundary of strong performance (A-grade begins at ≥70%).

3. **Practical discriminating power.** Post-hoc analysis confirms the threshold meaningfully separates artifacts. A threshold of 0.60 would be too permissive (no artifact would fail even under extreme sensitivity perturbations). A threshold of 0.80 would exclude artifacts that received positive coordinator evaluations and strong adoption intentions (≥ 4.0/5). The 0.70 threshold represents a principled balance.

---

## 7. Artifact Development Protocol

### 7.1 Artifacts and Module Alignment

Five disposable software artifacts were created, each targeting a distinct Computer Science module at the Department of Computer Science and Information Systems (CSIS), University of Limerick. This alignment provides a concrete pedagogical context and enables authentic coordinator evaluation.

| # | Artifact | Short ID | Target Module | Learning Objective |
|---|----------|----------|---------------|-------------------|
| 1 | The Unit Testing Gauntlet | UTG | CS5703 Software Quality | Red-Green-Refactor TDD cycle |
| 2 | The Big-O Dojo | BOV | CS4115 Data Structures & Algorithms | Algorithm complexity analysis |
| 3 | The SQL Injection Lab | SQL | CS4416 Database Systems | SQL injection attacks & defences |
| 4 | Flexbox Forge | CSS | CS4141/CS4222 Intro to Programming | CSS Flexbox layout system |
| 5 | Lex Arena | LAT | CS4158 Programming Language Technology | Lexical analysis & regular expressions |

### 7.2 AI-Assisted Development Process

Each artifact was developed using a systematic, documented AI-assisted protocol:

1. **Prompt engineering:** The researcher designed a structured prompt specifying the learning objective, interaction model, visual design constraints, and technical requirements.
2. **AI generation:** Claude (Anthropic) was used within Visual Studio Code to generate the complete application in a single session. GitHub Copilot was available but Claude served as the primary generative engine.
3. **Iterative refinement:** The researcher reviewed the generated output, tested functionality, and issued follow-up prompts to address issues — without writing any code manually.
4. **Session logging:** All development sessions were logged with timestamps, prompts used, and strategies employed. WakaTime tracked active vs. idle time.
5. **Deployment:** Each artifact was deployed as a static web application. Deployment steps were recorded.

**Key constraint:** All five artifacts achieved a **100% AI generation ratio** — no manual coding. The developer's role was exclusively prompt design, quality assurance, and deployment.

### 7.3 Technical Constraints

All artifacts share a common technical profile by design:

| Constraint | Value | Rationale |
|-----------|-------|-----------|
| **Architecture** | Single HTML page with embedded CSS and JavaScript | Maximises disposability — no build tools, no bundlers, no frameworks |
| **External dependencies** | 0 (target), 2 maximum | Minimises maintenance surface |
| **Deployment** | Static file hosting (3 steps: open → deploy → verify) | Near-zero deployment friction |
| **AI generation ratio** | 100% | Tests the full AI-generation hypothesis |
| **Target development time** | < 60 minutes per artifact | Validates "rapid generation" claim |

These constraints operationalise the disposability philosophy: the artifacts are intentionally simple, self-contained, and infrastructure-free.

---

## 8. Three-Layer Evaluation Protocol

Each artifact is evaluated using a three-layer triangulated protocol. The layers are independent — each uses a different evaluator population, a different instrument, and a different focus.

### 8.1 Layer 1: DSQI Self-Assessment

**Evaluator:** The researcher (artifact creator).  
**Focus:** Quantitative measurement of maintenance cost, creation cost, pedagogical alignment, and educational purity.  
**Instrument:** The DSQI Evaluation Protocol.  
**Data sources:**
- Automated tools: `cloc` (lines of code), cyclomatic complexity analyser, dependency audit
- Manual measurement: deployment step count, development time logs
- Coordinator review data: P₁ (Q1–Q3 mean) and P₂ (ICAP classification) from Layer 3
- Expert review data: E₁ and E₂ from Layer 2

**Process:**
1. Run static analysis tools on the artifact source code.
2. Record development effort metrics from session logs.
3. Incorporate P and E scores once Layers 2 and 3 are complete.
4. Compute final DSQI using the formula and weights.
5. Save results to structured JSON (`data/evaluations/layer1-dsqi/dsqi-{slug}.json`).
6. Validate against JSON schema.

**Computation pipeline:** The `analysis/dsqi_score.py` script automates the full DSQI computation:
- Reads M and C from Layer 1 JSON files (pre-computed by `dsqi_collect.py`)
- Computes P from coordinator reviews: $P = (P_1 + P_2) / 2$ where $P_1 = \overline{Q_{1..3}} / 5$ and $P_2 = \text{ICAP}(Q_4)$
- Computes E from expert reviews: $E = \frac{1}{R}\sum_r \frac{E_{1,r,\text{norm}} + E_{2,r,\text{norm}}}{2}$
- Applies weights and computes final DSQI
- Updates JSON files and the artifact registry

**Self-assessment bias acknowledgement:** The M and C components are objectively measurable (automated tools, clocked time). The P and E components draw from independent evaluators (coordinators and experts, respectively), mitigating self-assessment bias for the most subjective dimensions.

### 8.2 Layer 2: Independent Expert Review

**Evaluators:** Three external expert reviewers with experience in software engineering and/or computer science education.  
**Focus:** Technical quality, usability, cognitive engagement design, constructionist alignment, and educational purity.  
**Instrument:** The Expert Review Protocol for Disposable Educational Software (Revised).

**Instrument structure:**

| Section | Content | Response Format |
|---------|---------|----------------|
| **Part A — Qualitative Assessment** | | |
| Lens 1: ICAP Framework | Classify the primary engagement mode | Categorical: Passive / Active / Constructive / Interactive + written justification |
| Lens 2: Constructionism | (a) Meaningful artifact creation; (b) Learning through building | Two 5-point Likert items + written justification each |
| Lens 3: Heuristic Evaluation | 10 adapted Nielsen heuristics for educational software | 10 × 5-point Likert items + written justification for extreme ratings |
| **Part B — DSQI Metrics** | | |
| E₁: Conceptual Fidelity | How well the tool isolates the target concept | 5-point Likert (1 = Poor, 5 = Excellent) + justification |
| E₂: Process Replicability | How replicable the AI-assisted development process is | 5-point Likert (1 = Very Difficult, 5 = Very Easy) + justification |
| **Open-Ended** | Greatest strengths; most significant weaknesses; other comments | Free text |

**The 10 heuristics (adapted from Nielsen, 1994, for educational software):**

| # | Heuristic | Educational Adaptation |
|---|-----------|----------------------|
| H1 | Visibility of System Status | Communicates learner's current state and progress |
| H2 | Match with Real World | Uses concepts/language familiar to target learner |
| H3 | User Control & Freedom | Allows navigation, undo, and exit |
| H4 | Consistency & Standards | Consistent interface and interactions throughout |
| H5 | Error Prevention | Helps prevent common learner errors |
| H6 | Recognition over Recall | Minimises memory load between sections |
| H7 | Flexibility & Efficiency | Efficient to use, may offer shortcuts |
| H8 | Aesthetic & Minimalist Design | Clean, focused on the learning task |
| H9 | Help with Errors | Clear, diagnostic error messages with suggestions |
| H10 | Instructional Scaffolding | Appropriate support that fades as learner progresses |

**Assignment:** All three experts reviewed all five artifacts (3 × 5 = 15 observations), enabling cross-artifact and cross-reviewer comparisons.

**Data aggregation:** For quantitative ratings, per-item means are computed (acknowledging low IRR — see §12.2). Qualitative feedback undergoes thematic analysis (see §12.10).

### 8.3 Layer 3: Module Coordinator Review

**Evaluators:** Five module coordinators from CSIS, University of Limerick — each reviewing the one artifact designed for their specific module.  
**Focus:** Authentic pedagogical utility, curricular alignment, and adoption intention.  
**Instrument:** The Pedagogical Utility Evaluation Protocol for Module Coordinators.

**Instrument structure:**

| Section | Content | Response Format |
|---------|---------|----------------|
| **Part A — Pedagogical Alignment** | | |
| Q1: Curricular Relevance | Alignment with learning outcomes of their module | 5-point Likert (1 = Not at all relevant, 5 = Perfectly aligned) + justification |
| Q2: Problem-Solving Value | Addresses known student difficulty or misconception | 5-point Likert + justification |
| Q3: Potential for Active Learning | Effectiveness at promoting active learning | 5-point Likert + justification |
| Q4: ICAP Classification | Primary engagement mode | Categorical: Passive / Active / Constructive / Interactive + justification |
| Q5: Ease of Integration | How easily the tool could be incorporated into teaching | 5-point Likert + justification |
| Q6: Likelihood of Use | Probability of incorporating into next academic year | 5-point Likert + justification |
| **Part B — Open-Ended** | | |
| Q7: Most Significant Benefit | Greatest pedagogical strength | Free text |
| Q8: Most Significant Drawback | Greatest pedagogical weakness or improvement area | Free text |

**Design rationale:** The coordinator instrument focuses on *pedagogical utility in context* rather than technical quality. Coordinators are domain experts for their specific module — they can assess curricular fit, student misconceptions, and practical integration in ways that external experts cannot.

**Key difference from Layer 2:** Layer 2 experts evaluate all five artifacts from a general technical/pedagogical perspective. Layer 3 coordinators evaluate only one artifact, but with deep domain expertise for that specific module. This provides both breadth (Layer 2) and depth (Layer 3).

### 8.4 Triangulation Rationale

The three-layer design provides **methodological triangulation** (Denzin, 1978):

| Dimension | Layer 1 | Layer 2 | Layer 3 |
|-----------|---------|---------|---------|
| **Evaluator** | Researcher (self) | External experts | Domain-expert coordinators |
| **Perspective** | Technical/automated | General pedagogical & technical | Module-specific pedagogical |
| **Instrument** | DSQI protocol | Expert Review Protocol | Coordinator Utility Protocol |
| **Coverage** | 5 artifacts | 3 reviewers × 5 artifacts = 15 | 5 coordinators × 1 artifact = 5 |
| **Primary output** | DSQI score (0–1) | Heuristic scores, ICAP, E₁/E₂ | P₁, ICAP, adoption intention |

**Convergence criterion:** The study looks for convergence across layers — do all three sources agree that the artifacts are educationally viable, promote active engagement, and faithfully represent their concepts? Disagreements are treated as informative rather than problematic, revealing where evaluator perspective matters.

---

## 9. Participants

### 9.1 Expert Reviewers (Layer 2)

Three industry practitioners were recruited based on experience in software engineering and/or familiarity with educational technology:

| Name | Role | Experience | Organisation |
|------|------|-----------|--------------|
| Liam McNamara | Software Engineer | 30 years | Horizon Globex Ireland DAC |
| Peter Hall | Infrastructure Engineer | 30 years | Horizon Fintex |
| Tawny Whatmore | Software Engineer | 10 years | Horizon Globex |

**Recruitment rationale:** Industry practitioners bring a usability and technical quality perspective that complements the pedagogical focus of coordinator evaluations. Their software engineering experience enables credible assessment of code quality, interface design, and process replicability.

**Limitation:** All three experts come from industry rather than academia, potentially biasing heuristic evaluations toward industry usability standards rather than educational design standards. This is acknowledged as a study limitation.

### 9.2 Module Coordinators (Layer 3)

Five module coordinators from the Department of CSIS, University of Limerick, each reviewing the artifact designed for their module:

| Name | Module | Artifact Reviewed |
|------|--------|------------------|
| Andrew Le Gear | CS5703 Software Quality | Unit Testing Gauntlet |
| Paddy Healy | CS4115 Data Structures & Algorithms | Big-O Dojo |
| Dr. Nikola S. Nikolov | CS4416 Database Systems | SQL Injection Lab |
| Dr. Alan Ryan | CS4141/CS4222 Intro to Programming | Flexbox Forge |
| Jim Buckley | CS4158 Programming Language Technology | Lex Arena |

**Recruitment rationale:** Each coordinator is the domain authority for their module — they define the learning outcomes, know the common student misconceptions, and make adoption decisions. Their assessment provides the most authentic evaluation of pedagogical utility.

### 9.3 Researcher

The primary researcher (a member of CSIS, University of Limerick) served as: artifact developer (AI-assisted), Layer 1 self-evaluator, study designer, and analyst. This dual role is characteristic of DBR and is mitigated by the independence of Layers 2 and 3.

---

## 10. Data Collection and Management

### 10.1 Data Structure

All evaluation data is stored in structured JSON files with defined schemas, enabling automated validation and reproducible analysis:

```
data/
├── artifact-registry.json              # Central registry of all artifacts and their status
├── evaluations/
│   ├── layer1-dsqi/
│   │   └── dsqi-{slug}.json            # DSQI scores per artifact (5 files)
│   ├── layer2-expert-review/
│   │   └── dsqi-review-{reviewer}.json  # Expert reviews (3 files, each covering 5 artifacts)
│   └── layer3-coordinator-review/
│       └── dsqi-coordinator-{slug}.json  # Coordinator reviews (5 files)
├── development-logs/
│   └── sessions-{slug}.json            # Development session logs per artifact
├── static-analysis/
│   └── {slug}/
│       ├── cloc-output.json            # Lines of code
│       ├── complexity-report.json      # Cyclomatic complexity
│       └── dependency-list.json        # Dependencies
└── extended-analysis/
    ├── A–J output JSONs               # Extended analysis results
    ├── figures/                         # Generated visualisations
    └── qualitative/                     # Qualitative coding data
```

### 10.2 Schema Validation

JSON schema validation (`npm run validate:all`) ensures structural integrity of all data files before analysis. Schemas define required fields, data types, value ranges, and enumerated values for categorical data (e.g., ICAP levels must be one of: "passive", "active", "constructive", "interactive").

### 10.3 Artifact Registry

The `artifact-registry.json` file serves as the canonical source of truth for study progress. It tracks:
- Artifact metadata (name, slug, module alignment, deployment URL, repository URL)
- Development status (in-development → developed → self-evaluated → expert-reviewed → coordinator-reviewed)
- Evaluation metrics (DSQI sub-scores, review counts, completion flags)
- Study phase (development → evaluation → analysis)

---

## 11. Core Analysis Methods

Four report-generation scripts produce the study's primary analysis output:

### 11.1 DSQI Report (`generate_dsqi_report.py`)

**Input:** Layer 1 DSQI JSON files.  
**Output:** `analysis/output/dsqi_report.json`  
**Content:**
- Per-artifact DSQI breakdowns (M, C, P, E, final score)
- Aggregate statistics (mean, median, SD, min, max, range)
- Component-level statistics
- Component contributions to each artifact's DSQI
- Development metrics (LoC, dev time, AI ratio, dependencies, complexity)
- Ranked artifact list with threshold assessment

### 11.2 Expert Report (`generate_expert_report.py`)

**Input:** Layer 2 expert review JSON files.  
**Output:** `analysis/output/expert_report.json`  
**Content:**
- Per-heuristic grand means across all reviewers and artifacts
- Per-artifact heuristic profiles
- ICAP classifications by each expert per artifact
- Per-reviewer analysis (agreement patterns, systematic biases)
- Constructionism scores (meaningful artifact, learning through building)
- Educational purity scores (E₁ conceptual fidelity, E₂ process replicability)
- Qualitative feedback aggregation

### 11.3 Coordinator Report (`generate_coordinator_report.py`)

**Input:** Layer 3 coordinator review JSON files.  
**Output:** `analysis/output/coordinator_report.json`  
**Content:**
- Pedagogical alignment scores (Q1–Q3 per artifact)
- P₁ averages
- ICAP classifications by coordinators
- Adoption intention (Q5 ease, Q6 likelihood)
- Qualitative feedback (Q7 benefits, Q8 drawbacks)

### 11.4 Summary Report (`generate_summary_report.py`)

**Input:** All three layer outputs.  
**Output:** `analysis/output/summary_report.json`  
**Content:**
- Cross-layer synthesis: DSQI ↔ expert ratings ↔ coordinator ratings
- ICAP triangulation matrix (self ↔ expert ↔ coordinator)
- Artifact grouping (tier analysis)
- Research question answer summaries

---

## 12. Extended Analysis Methods (A–J)

Ten extended analyses probe deeper into the data. All share a common `data_loader.py` module and can be run individually or as a batch via `run_extended.py`.

### 12.1 Analysis A: Descriptive Statistics

**Script:** `extended_descriptive.py`  
**RQ:** RQ1  
**Purpose:** Comprehensive summary statistics (mean, SD, min, max, median) for all numeric variables across all three evaluation layers, plus development metrics.  
**Method:** Standard descriptive statistics computed on the full dataset. Presented as per-artifact and aggregate tables.  
**Statistical tools:** Python `statistics` module (mean, stdev, median).

### 12.2 Analysis B: Inter-Rater Reliability

**Script:** `extended_irr.py`  
**RQ:** RQ2  
**Purpose:** Assess the agreement among the three expert reviewers across all rated variables.  
**Method:** Krippendorff's alpha ($\alpha$) computed for ordinal data across 17 variables (10 heuristics, E₁, E₂, ICAP, 2 constructionism items, and 2 composite scores).  
**Threshold:** $\alpha \geq 0.667$ for acceptable reliability (Krippendorff, 2011). Variables falling below this threshold are flagged, and their interpretation is adjusted (individual perspectives reported rather than aggregated consensus).  
**Statistical tools:** `krippendorff` Python package.  
**Expected outcome:** With $n = 5$ (artifacts) and $k = 3$ (raters), alpha is known to be unstable — the analysis serves to characterise the *nature* of disagreement rather than to achieve conventional reliability thresholds.

### 12.3 Analysis C: Heuristic Usability Profiles

**Script:** `extended_heuristic_profiles.py`  
**RQ:** RQ2, RQ3  
**Purpose:** Per-artifact radar profiles and cross-artifact comparison of the 10 adapted Nielsen heuristics.  
**Method:** Compute per-heuristic grand means across 15 observations (3 reviewers × 5 artifacts). Identify systematically strong/weak heuristics and flag any per-artifact items with mean < 3.0.  
**Visualisation:** Radar chart overlay (one trace per artifact).

### 12.4 Analysis D: ICAP Concordance

**Script:** `extended_icap.py`  
**RQ:** RQ2, RQ3  
**Purpose:** Cross-tabulate ICAP classifications from all three evaluation sources (self, expert, coordinator) and compute agreement.  
**Method:**
- 5-source concordance table per artifact (self + 3 experts + coordinator)
- Fleiss' kappa ($\kappa$) for multi-rater categorical agreement
- Cross-tabulation by source (aggregate distribution of ICAP levels per evaluator type)  
**Statistical tools:** `pingouin` Python package (Fleiss' kappa).  
**Visualisation:** Alluvial/Sankey diagram showing ICAP flow across sources.

### 12.5 Analysis E: Adoption Intention

**Script:** `extended_adoption.py`  
**RQ:** RQ2  
**Purpose:** Analyse coordinator adoption intention scores and their relationship to DSQI and pedagogical alignment.  
**Method:**
- Spearman rank correlations ($\rho_s$) between adoption mean (Q5 + Q6 / 2) and: (a) P₁ average, (b) DSQI score, (c) Q5 ↔ Q6 internal correlation
- Significance tested at $p < 0.05$ (two-tailed), with effect size emphasis given small $n$  
**Statistical tools:** `scipy.stats.spearmanr`.

### 12.6 Analysis F: Constructionism Alignment

**Script:** `extended_constructionism.py`  
**RQ:** RQ3  
**Purpose:** Analyse expert ratings on constructionist learning dimensions.  
**Method:**
- Per-artifact means and SDs for both constructionism items
- Identification of outlier artifacts (e.g., observation-focused tools scoring low on "learning through building")
- Analysis of the disposability–constructionism tension: can short-lived, AI-generated tools support constructionist learning?  
**Visualisation:** Scatter plot (meaningful artifact vs. learning through building).

### 12.7 Analysis G: Development Efficiency

**Script:** `extended_efficiency.py`  
**RQ:** RQ1  
**Purpose:** Characterise the development effort for producing disposable educational software with AI.  
**Method:**
- Per-artifact metrics: wall-clock time, active time, idle ratio, LoC, LoC/min, cyclomatic complexity, dependency count
- Language breakdown (JavaScript / CSS / HTML) from CLOC output
- Spearman correlations: LoC ↔ DSQI, dev time ↔ DSQI, LoC ↔ complexity
- Aggregate totals (total time, total LoC across all artifacts)  
**Data sources:** WakaTime session logs, CLOC output, complexity reports.  
**Visualisation:** Grouped bar chart (time, LoC, complexity per artifact).

### 12.8 Analysis H: DSQI Sensitivity Analysis

**Script:** `extended_sensitivity.py`  
**RQ:** RQ1  
**Purpose:** Test the robustness of the DSQI composite index under systematic weight perturbation.  
**Method:**
- Baseline weights: $w_M = 0.30$, $w_C = 0.20$, $w_P = 0.30$, $w_E = 0.20$
- Perturbation: each weight varied ±0.15 in 0.05 steps; remaining weights renormalised to maintain $\sum w = 1.0$; all weights constrained to $[0.05, 0.50]$
- Total combinations: 633
- For each combination: recompute all five DSQI scores, record rankings
- Compute Kendall's $\tau$ between perturbed and baseline rankings
- Record DSQI score ranges under perturbation per artifact
- Analyse per-component sensitivity (mean $\tau$ when each weight is varied)  
**Reference:** OECD (2008) Handbook on Constructing Composite Indicators (weight robustness testing).  
**Visualisation:** Heatmap (weight configuration vs. DSQI scores) and τ distribution histogram.

### 12.9 Analysis I: Cross-Layer Correlations

**Script:** `extended_correlations.py`  
**RQ:** RQ1, RQ2  
**Purpose:** Assess construct validity by correlating metrics across evaluation layers.  
**Method:**
- Spearman rank correlations ($\rho_s$) for all meaningful cross-layer pairs ($n = 5$)
- Key pairs: Self P ↔ Coordinator P₁; DSQI ↔ Coordinator P₁; DSQI ↔ Adoption; Expert E₁ ↔ E₂; LoC ↔ DSQI; Dev time ↔ DSQI; DSQI ↔ Heuristic mean
- Effect size interpretation prioritised over $p$-values given small $n$  
**Visualisation:** Correlation matrix heatmap.

### 12.10 Analysis J: Qualitative Thematic Analysis (AI-Assisted)

**Script:** `extended_qualitative.py`  
**RQ:** RQ2, RQ3  
**Purpose:** Deductive thematic analysis of open-ended review text from all evaluators.  
**Method:**
1. **Segment extraction:** All open-ended comment fields extracted from expert and coordinator reviews (most positive aspect, most negative aspect, other comments, Q7 benefit, Q8 drawback).
2. **Deductive codebook:** A 7-category codebook applied deductively, derived from the study's theoretical framework:
   - ICAP Engagement
   - Constructionism
   - Usability
   - Pedagogical Value
   - Disposability
   - Technical Quality
   - Adoption Barriers
3. **AI-assisted coding:** Each segment processed through Claude (Anthropic API) with the codebook. Multi-coding permitted — a segment may receive a primary code and optional secondary code.
4. **Aggregation:** Code frequencies tallied overall and per artifact. Illustrative quotes selected for each theme.

**Theoretical grounding:** The codebook categories map directly to the study's theoretical framework (ICAP, constructionism) and research questions (usability, pedagogical value, adoption). The use of AI-assisted coding follows emerging methodological practices for handling moderate-volume qualitative data (cf. Braun & Clarke, 2006, reflexive thematic analysis adapted for AI assistance).

**Transparency:** The codebook (`codebook.json`), extracted segments, coded segments, and thematic summary are all saved as structured JSON for reproducibility and audit.

**Dependencies:** `anthropic` (API client), `scikit-learn` (for potential clustering — unused in current version).

---

## 13. Validity and Reliability

### 13.1 Construct Validity

- **DSQI construct validity:** The P component of the DSQI (pedagogical alignment) achieved perfect Spearman correlation ($\rho = 1.0$) with the independently-assessed coordinator P₁ rating, providing strong evidence that the DSQI's P component measures what coordinators independently assess as pedagogical quality.
- **DSQI ↔ coordinator assessment:** The composite DSQI score correlates significantly with coordinator pedagogical ratings ($\rho = 0.894, p = 0.041$), suggesting the self-evaluation metric aligns with expert pedagogical judgment.
- **ICAP triangulation:** Self-assessment and coordinator ICAP classifications achieved 100% agreement (5/5 artifacts), while expert ICAP classifications showed expected divergence — consistent with the known difficulty of categorising engagement modes at ordinal boundaries.

### 13.2 Reliability

- **Inter-rater reliability (Layer 2):** Krippendorff's $\alpha$ across the three expert reviewers was low (mean $\alpha = -0.110$). This is addressed as a known limitation of small-sample, limited-variance expert evaluation and is consistent with literature on heuristic evaluation (Ssemugabi & de Villiers, 2010). Expert ratings are reported as individual perspectives rather than consensus.
- **Internal consistency of instruments:** The coordinator instrument's Q1–Q3 (pedagogical alignment) and Q5–Q6 (adoption intention) represent coherent sub-scales. Q5 (ease) and Q6 (likelihood) were not strongly correlated ($\rho = 0.395$), suggesting they capture different constructs.

### 13.3 External Validity

- **Single institution:** All coordinators are from one department (CSIS, University of Limerick). Cross-institutional generalisability is not claimed.
- **Five artifacts:** Sufficient for design-based research and comparative analysis, but limits statistical generalisation. Effect sizes are prioritised over $p$-values throughout.
- **Industry-only experts:** All three expert reviewers come from industry, potentially biasing toward industry usability standards.

### 13.4 Ecological Validity

- **Authentic module alignment:** Each artifact targets a real module with a real coordinator, grounding the evaluation in authentic curricula.
- **Coordinator adoption intention:** Measures likelihood of *actual* classroom use, not hypothetical interest — the most ecologically valid indicator in the study.

---

## 14. Ethical Considerations

### 14.1 No Human Subjects Research

This study is **artifact-centric** — it evaluates software artifacts, not students. No data is collected from students, and no artifacts are deployed in live classroom settings.

The evaluation involves:
- **Self-evaluation** by the researcher (not a human subjects concern)
- **Expert review** by three industry practitioners acting as professional consultants (not human subjects)
- **Coordinator evaluation** by five colleagues providing professional pedagogical judgment (not human subjects)

All participants contributed voluntarily in their professional capacity. No informed consent protocols were required because the study does not involve human subjects research as defined by standard research ethics frameworks.

### 14.2 Positioning as Phase 1

The study explicitly positions itself as **Phase 1** of a Design-Based Research programme. Future work involving classroom deployment, student data collection, and learning outcome measurement would require full ethics committee approval. This is stated transparently in the paper.

### 14.3 Transparency of Self-Evaluation

The researcher's dual role as artifact creator and Layer 1 evaluator is acknowledged explicitly. This potential bias is mitigated by:
1. Automated and objective measurement tools (cloc, complexity analyser) for M and C components.
2. Independent evaluators providing P (coordinators) and E (experts) data.
3. Full data and code publication for reproducibility.

---

## 15. Limitations

| Limitation | Type | Area | Mitigation |
|-----------|------|------|-----------|
| 5 artifacts, 3 experts, 5 coordinators | Sample size | Statistical | Effect sizes prioritised; exploratory framing |
| No student evaluation | Scope | Ecological | Positioned as Phase 1; future work planned |
| Single institution (UL CSIS) | Generalisability | External | Stated explicitly; cross-institutional replication planned |
| Self-assessment in Layer 1 | Bias | Internal | Layer 1 M/C are objective; P/E come from Layers 2/3 |
| Industry-only experts | Perspective | Construct | Acknowledged; future work to include academic reviewers |
| ICAP classification subjectivity | Measurement | Reliability | Categorical, not continuous; perfect self–coordinator agreement partially validates |
| A priori weights not empirically derived | Model | DSQI | Justified theoretically; validated via sensitivity analysis |
| 100% AI ratio constant across artifacts | Variability | Statistical | Cannot assess human–AI effort trade-offs; acknowledged |
| Low IRR among experts | Agreement | Reliability | Interpreted as perspective diversity; individual ratings reported |

---

## 16. Study Phases and Timeline

| Phase | Duration | Activities | Artifacts Produced |
|-------|----------|-----------|-------------------|
| **Phase 1: Artifact Development** | 6–8 weeks | Create five disposable software artifacts using AI-assisted protocol | 5 deployed applications, 5 session logs, static analysis outputs |
| **Phase 2: Self-Evaluation (DSQI)** | 1 week | Calculate M and C for each artifact; run static analysis | Layer 1 DSQI JSON files (partial — M, C only) |
| **Phase 3: Expert Review** | 2–3 weeks | Distribute expert review protocol; collect completed reviews | 3 expert review JSON files (15 artifact observations) |
| **Phase 4: Coordinator Review** | 2–3 weeks | Distribute coordinator protocol; collect completed reviews | 5 coordinator review JSON files |
| **Phase 5: DSQI Finalisation** | < 1 day | Run `dsqi_score.py` to integrate P (from Phase 4) and E (from Phase 3); compute final DSQI | Completed DSQI files with all four components |
| **Phase 6: Core Analysis** | 1 week | Run four report-generation scripts; compile core analysis report | `ANALYSIS_REPORT.md`, 4 output JSONs |
| **Phase 7: Extended Analysis** | 1 week | Run ten extended analysis scripts (A–J); compile extended report | `EXTENDED_ANALYSIS_REPORT.md`, 10 output JSONs, 6 figures |
| **Phase 8: Paper Writing** | 3–4 weeks | Distill methodology and results into journal submission | Manuscript (≤ 12,000 words) |

**Estimated total:** 15–20 weeks (approximately 4–5 months).

---

## 17. Computational Reproducibility

### 17.1 Software Stack

| Component | Version / Tool |
|-----------|---------------|
| **Language** | Python 3.12 |
| **Core libraries** | `json`, `statistics`, `pathlib` (stdlib) |
| **Extended analysis** | `krippendorff ≥ 0.7.0`, `pingouin ≥ 0.5.4`, `scikit-learn ≥ 1.4.0` |
| **Qualitative coding** | `anthropic ≥ 0.40.0` (Claude API) |
| **Static analysis** | `cloc`, custom complexity analyser |
| **Session tracking** | WakaTime |
| **AI generation** | Claude (Anthropic), GitHub Copilot |

### 17.2 Script Architecture

All analysis scripts share a common `data_loader.py` module providing standardised data access:

| Function | Returns |
|----------|---------|
| `load_registry()` | Full artifact registry dict |
| `load_dsqi_files()` | Dict of slug → DSQI data |
| `load_expert_reviews()` | List of expert review dicts |
| `load_expert_flat()` | Per-artifact-per-reviewer observations |
| `load_coordinator_reviews()` | List of coordinator review dicts |

### 17.3 Execution

```bash
# Core analysis
python analysis/generate_dsqi_report.py
python analysis/generate_expert_report.py
python analysis/generate_coordinator_report.py
python analysis/generate_summary_report.py

# Extended analyses (A–I, skip J which requires API key)
python analysis/run_extended.py --skip J

# Qualitative analysis only (requires Anthropic API key)
ANTHROPIC_API_KEY=sk-... python analysis/run_extended.py --only J

# Single analysis
python analysis/run_extended.py --only A

# Data validation
npm run validate:all
```

### 17.4 Data Availability

All data files, schemas, analysis scripts, and generated outputs are maintained in the study repository. The `data/extended-analysis/` directory is regenerable from source data — it is gitignored but can be fully reproduced by running the analysis pipeline.

---

## 18. References

- Anderson, T., & Shattuck, J. (2012). Design-based research: A decade of progress in education research? *Educational Researcher*, 41(1), 16–25.
- Barab, S., & Squire, K. (2004). Design-based research: Putting a stake in the ground. *Journal of the Learning Sciences*, 13(1), 1–14.
- Braun, V., & Clarke, V. (2006). Using thematic analysis in psychology. *Qualitative Research in Psychology*, 3(2), 77–101.
- Chi, M. T. H., & Wylie, R. (2014). The ICAP framework: Linking cognitive engagement to active learning outcomes. *Educational Psychologist*, 49(4), 219–243.
- Davis, F. D. (1989). Perceived usefulness, perceived ease of use, and user acceptance of information technology. *MIS Quarterly*, 13(3), 319–340.
- Denzin, N. K. (1978). *The Research Act: A Theoretical Introduction to Sociological Methods* (2nd ed.). McGraw-Hill.
- Engeström, Y. (1987). *Learning by Expanding: An Activity-Theoretical Approach to Developmental Research*. Orienta-Konsultit.
- Hayes, A. F., & Krippendorff, K. (2007). Answering the call for a standard reliability measure for coding data. *Communication Methods and Measures*, 1(1), 77–89.
- Koehler, M. J., & Mishra, P. (2009). What is technological pedagogical content knowledge? *Contemporary Issues in Technology and Teacher Education*, 9(1), 60–70.
- Krippendorff, K. (2011). Computing Krippendorff's alpha-reliability. *Annenberg School for Communication Departmental Papers*.
- Nielsen, J. (1994). *Usability Engineering*. Morgan Kaufmann.
- OECD (2008). *Handbook on Constructing Composite Indicators: Methodology and User Guide*. OECD Publishing.
- Papert, S. (1980). *Mindstorms: Children, Computers, and Powerful Ideas*. Basic Books.
- Papert, S., & Harel, I. (1991). Situating constructionism. In *Constructionism* (pp. 1–11). Ablex Publishing.
- Reeves, T. C. (1994). Evaluating what really matters in computer-based education. In M. Wild & D. Kirkpatrick (Eds.), *Computer Education: New Perspectives* (pp. 219–246).
- Ssemugabi, S., & de Villiers, R. (2010). Usability and learning: A framework for evaluation of web-based e-learning applications. *Education and Information Technologies*, 15(2), 137–157.
- Wiley, D. (2013). What is open pedagogy? *Iterating Toward Openness* [blog]. Retrieved from https://opencontent.org/blog/
- Wohlin, C., Runeson, P., Höst, M., Ohlsson, M. C., Regnell, B., & Wesslén, A. (2012). *Experimentation in Software Engineering*. Springer.

---

*This document is an exhaustive technical reference for the study's methodology. It is intended to be distilled into the paper's Methodology section (~1,500 words) and to serve as a comprehensive appendix for reviewers or future replication attempts.*
