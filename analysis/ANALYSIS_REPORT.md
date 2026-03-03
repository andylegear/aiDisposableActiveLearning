# Core Analysis Report: Disposable Software Quality Index (DSQI) & ICAP Framework Evaluation

> **Study:** AI-Generated Disposable Software as Active Learning Instruments in CS Education  
> **Methodology:** Design-Based Research (DBR)  
> **Generated from:** `generate_dsqi_report.py`, `generate_expert_report.py`, `generate_coordinator_report.py`, `generate_summary_report.py`  
> **Date:** 2026-02-27  

---

## Table of Contents

1. [Study Overview](#1-study-overview)
2. [The DSQI Framework](#2-the-dsqi-framework)
3. [Layer 1 — DSQI Self-Assessment Results](#3-layer-1--dsqi-self-assessment-results)
4. [Layer 2 — Expert Review Results](#4-layer-2--expert-review-results)
5. [Layer 3 — Coordinator Review Results](#5-layer-3--coordinator-review-results)
6. [Cross-Layer Synthesis](#6-cross-layer-synthesis)
7. [Key Findings](#7-key-findings)
8. [Limitations](#8-limitations)
9. [Next Steps](#9-next-steps)

---

## 1. Study Overview

### 1.1 Research Questions

| ID | Research Question |
|----|------------------|
| **RQ1** | Can AI-generated disposable software artefacts meet minimum quality thresholds for educational use? |
| **RQ2** | How do educators perceive the pedagogical value of disposable software? |
| **RQ3** | Does disposable software promote active learning as characterised by the ICAP framework? |

### 1.2 Artifacts Under Evaluation

Five single-page web applications were generated entirely by AI (100% AI-generation ratio) targeting five distinct Computer Science modules at the Department of Computer Science and Information Systems (CSIS), University of Limerick.

| # | Artifact | Short | Target Module | Learning Objective |
|---|----------|-------|---------------|-------------------|
| 1 | The Unit Testing Gauntlet | UTG | CS5703 Software Quality | Red-Green-Refactor TDD cycle |
| 2 | The Big-O Dojo | BOV | CS4115 Data Structures & Algorithms | Algorithm complexity analysis |
| 3 | The SQL Injection Lab | SQL | CS4416 Database Systems | SQL injection attacks & defences |
| 4 | Flexbox Forge | CSS | CS4141/CS4222 Intro to Programming | CSS Flexbox layout system |
| 5 | Lex Arena | LAT | CS4158 Programming Language Technology | Lexical analysis & regular expressions |

### 1.3 Three-Layer Evaluation Design

The study employs triangulated evaluation across three complementary layers:

- **Layer 1 — DSQI Self-Assessment:** Automated and researcher-computed metrics for maintenance cost, creation cost, pedagogical alignment, and educational purity (n = 5 artifacts).
- **Layer 2 — Expert Review:** Three industry practitioners independently evaluated all five artifacts against usability heuristics, ICAP engagement levels, constructionism criteria, and educational value (n = 3 reviewers × 5 artifacts = 15 observations).
- **Layer 3 — Coordinator Review:** Five module coordinators each reviewed the artifact targeting their specific module, assessing pedagogical alignment, ICAP level, and adoption intention (n = 5 coordinators × 1 artifact = 5 observations).

### 1.4 Participants

**Expert Reviewers (Layer 2):**

| Name | Role | Experience | Institution |
|------|------|-----------|-------------|
| Liam McNamara | Software Engineer | 30 years | Horizon Globex Ireland DAC |
| Peter Hall | Infrastructure Engineer | 30 years | Horizon Fintex |
| Tawny Whatmore | Software Engineer | 10 years | Horizon Globex |

**Module Coordinators (Layer 3):**

| Name | Module | Artifact Reviewed |
|------|--------|------------------|
| Andrew Le Gear | CS5703 Software Quality | UTG |
| Paddy Healy | CS4115 Data Structures & Algorithms | BOV |
| Dr. Nikola S. Nikolov | CS4416 Database Systems | SQL |
| Dr. Alan Ryan | CS4141/CS4222 Intro to Programming | CSS |
| Jim Buckley | CS4158 Programming Language Technology | LAT |

---

## 2. The DSQI Framework

### 2.1 Formula

$$
\text{DSQI} = 0.3(1 - M) + 0.2(1 - C) + 0.3P + 0.2E
$$

Where:
- **M (Maintenance Cost):** Normalised composite of dependency count, cyclomatic complexity, and deployment steps. Lower is better; $(1 - M)$ inverts the score.
- **C (Creation Cost):** Normalised composite of lines of code, AI generation ratio, and development time. Lower is better; $(1 - C)$ inverts the score.
- **P (Pedagogical Alignment):** $P = \frac{P_1 + P_2}{2}$ where $P_1$ = coordinator pedagogical alignment score (mean of Q1–Q3, normalised to 0–1) and $P_2$ = ICAP engagement score (passive = 0.25, active = 0.50, constructive = 0.75, interactive = 1.00).
- **E (Educational Purity):** Mean across expert reviewers of $\frac{E_1 + E_2}{2}$, where $E_1$ = conceptual fidelity and $E_2$ = process replicability, each normalised via $(score - 1) / 4$.

### 2.2 Weight Selection and Justification

The DSQI weights were set *a priori* based on the theoretical commitments of the disposable software paradigm, then validated post-hoc through sensitivity analysis (see Extended Analysis H).

| Component | Weight | Rationale |
|-----------|--------|-----------|
| $(1 - M)$ Maintenance Cost | 0.30 | Disposability requires near-zero maintenance burden |
| $(1 - C)$ Creation Cost | 0.20 | AI generation should minimise educator effort |
| $P$ Pedagogical Alignment | 0.30 | Core purpose: must serve learning objectives |
| $E$ Educational Purity | 0.20 | Must faithfully represent concepts without distortion |

**Design rationale.** The four components divide into two functional pairs:

1. **Disposability pair (M + C, combined weight 0.50):** The central premise of disposable software is that artifacts are cheap to create and carry negligible maintenance burden. Maintenance cost receives the larger share (0.30 vs. 0.20) because ongoing maintenance is the liability that disposability is specifically designed to eliminate — an artifact that is trivial to create but expensive to maintain would defeat the purpose of the paradigm. Creation cost takes the smaller share because AI-assisted generation already drives C towards zero; the weight acknowledges creation effort without over-rewarding it.

2. **Pedagogical pair (P + E, combined weight 0.50):** However cheap an artifact is, it has no value if it fails to teach. This pair ensures the index cannot be maximised by cost metrics alone. Pedagogical alignment receives the larger share (0.30 vs. 0.20) because an artifact's ability to serve its target learning objective — measured through coordinator evaluation and ICAP classification — is the primary educational concern. Educational purity takes the smaller share because, while conceptual fidelity and process replicability are important, they are secondary to whether the artifact actually addresses curriculum needs.

**Equal pair balance (0.50 / 0.50).** The disposability and pedagogical pairs are weighted equally to prevent either dimension from dominating the index. An artifact that is perfectly disposable but pedagogically poor should not pass, and vice versa.

**Robustness validation.** Extended Analysis H tested 633 weight combinations by perturbing each weight ±0.15 in 0.05 steps (all weights constrained to [0.05, 0.50], sum = 1.0). Key results:
- Mean Kendall's τ = 0.725 (SD = 0.267): rankings are moderately robust across weight choices.
- The pedagogical weight (w_P) had zero impact on rank ordering (τ = 1.0 for all perturbations), because P is already the most discriminating component.
- All five artifacts remained above the 0.70 threshold under the vast majority of perturbations, including the lowest-scoring artifact (CSS Flexbox Trainer, minimum 0.724).

These results confirm that the substantive conclusions of the study are not artefacts of the specific weight selection.

### 2.3 Threshold Justification

A DSQI score ≥ **0.70** is defined as the minimum quality threshold for educational viability. Artifacts scoring below this threshold would require revision or replacement.

**Rationale for the 0.70 cut-off.** The threshold is grounded in three complementary arguments:

1. **Distributional interpretation.** The DSQI is a weighted sum of four normalised [0, 1] components. A score of 0.70 requires that the artifact performs well across *multiple* dimensions — it is not achievable by excelling on one component while failing on others. For example, an artifact with perfect disposability scores (M = 0, C = 0) but zero pedagogical value (P = 0, E = 0) would score only 0.50. Conversely, perfect pedagogy (P = 1, E = 1) with maximum cost (M = 1, C = 1) would also score only 0.50. Reaching 0.70 demands balanced performance.

2. **Conventional precedent.** The 70% threshold aligns with widely-used pass marks in educational assessment and quality benchmarks. In software engineering, similar composite indices (e.g., the Maintainability Index) commonly use 65–75% as acceptable thresholds. In educational rubrics, 70% is a standard "satisfactory" boundary in many grading systems (e.g., the University of Limerick awards a B-grade at 60–69% and an A-grade at ≥70%, making 0.70 roughly equivalent to the boundary of strong performance).

3. **Practical discriminating power.** Post-hoc analysis confirms the threshold meaningfully separates artifacts. All five artifacts exceed 0.70 (range: 0.790–0.911), but the sensitivity analysis (Extended Analysis H) shows that the lowest-scoring artifact (CSS Flexbox Trainer) drops to 0.724 under adverse weight perturbations — still above 0.70 but only narrowly. A threshold of 0.60 would be too permissive (no artifact would fail even under extreme conditions), while 0.80 would exclude two artifacts (CSS at 0.790, LAT at 0.827 under some perturbations) that received positive coordinator evaluations and adoption intentions ≥ 4.0/5.

The 0.70 threshold thus represents a principled balance: high enough to demand genuine quality across all dimensions, low enough not to reject artifacts that domain experts endorse for classroom use.

---

## 3. Layer 1 — DSQI Self-Assessment Results

### 3.1 DSQI Scores

| Rank | Artifact | DSQI | M | C | P | E | Above 0.70? |
|------|----------|------|------|------|------|------|-------------|
| 1 | Big-O Visualiser | **0.9108** | 0.1262 | 0.1319 | 1.0000 | 0.8750 | ✓ |
| 2 | Unit Testing Gauntlet | **0.8966** | 0.1904 | 0.1063 | 1.0000 | 0.8750 | ✓ |
| 3 | SQL Injection Simulator | **0.8959** | 0.2022 | 0.1338 | 1.0000 | 0.9167 | ✓ |
| 4 | Lexical Analyser Trainer | **0.8269** | 0.1978 | 0.0984 | 0.7420 | 0.9167 | ✓ |
| 5 | CSS Flexbox Trainer | **0.7903** | 0.1429 | 0.0838 | 0.5830 | 0.8750 | ✓ |

**All five artifacts exceed the 0.70 threshold.**

### 3.2 Aggregate Statistics

| Statistic | Value |
|-----------|-------|
| **Mean** | 0.8641 |
| **Median** | 0.8959 |
| **Std Dev** | 0.0526 |
| **Min** | 0.7903 |
| **Max** | 0.9108 |
| **Range** | 0.1205 |

### 3.3 Component-Level Statistics

| Component | Mean | SD | Min | Max |
|-----------|------|------|------|------|
| M (Maintenance Cost) | 0.1719 | 0.0349 | 0.1262 | 0.2022 |
| C (Creation Cost) | 0.1108 | 0.0217 | 0.0838 | 0.1338 |
| P (Pedagogical Alignment) | 0.8650 | 0.1932 | 0.5830 | 1.0000 |
| E (Educational Purity) | 0.8917 | 0.0228 | 0.8750 | 0.9167 |

**Key observations:**
- **M and C are uniformly low** (M̄ = 0.17, C̄ = 0.11), confirming minimal maintenance and creation overhead — consistent with the disposability thesis.
- **E is uniformly high** (M̄ = 0.89, SD = 0.02), indicating experts agreed the artifacts faithfully represent their target concepts.
- **P shows the greatest variance** (SD = 0.19), driven by CSS Flexbox Trainer's lower coordinator alignment and active (rather than interactive) ICAP level.

### 3.4 Component Contributions to DSQI

| Artifact | 0.3(1−M) | 0.2(1−C) | 0.3P | 0.2E |
|----------|----------|----------|------|------|
| UTG | 0.2429 | 0.1787 | 0.3000 | 0.1750 |
| BOV | 0.2621 | 0.1736 | 0.3000 | 0.1750 |
| SQL | 0.2393 | 0.1732 | 0.3000 | 0.1833 |
| CSS | 0.2571 | 0.1832 | 0.1749 | 0.1750 |
| LAT | 0.2407 | 0.1803 | 0.2226 | 0.1833 |

The **pedagogical alignment** component (0.3P) is the primary differentiator between high-scoring and lower-scoring artifacts. UTG, BOV, and SQL achieve the maximum 0.3000 contribution; CSS contributes only 0.1749.

### 3.5 Development Metrics

| Artifact | LoC | Dev Time (min) | AI Ratio | Dependencies | Cyclomatic Complexity |
|----------|-----|---------------|----------|-------------|----------------------|
| UTG | 1,397 | 19 | 100% | 0 | 4.07 |
| BOV | 1,604 | 36 | 100% | 0 | 1.18 |
| SQL | 1,455 | 53 | 100% | 0 | 4.60 |
| CSS | 872 | 37 | 100% | 0 | 1.93 |
| LAT | 913 | 54 | 100% | 0 | 4.40 |

All five artifacts were produced with:
- **100% AI generation** — no manual coding
- **Zero external dependencies** — fully self-contained HTML/CSS/JS
- **Mean development time: 39.8 minutes** — supporting rapid, repeatable generation
- **3 deployment steps each** — open, deploy, verify

---

## 4. Layer 2 — Expert Review Results

Three industry experts each independently reviewed all five artifacts. Each review covered: 10 usability heuristics (1–5 Likert), ICAP engagement classification, constructionism evaluation, educational purity scores (E1/E2), and open-ended feedback.

### 4.1 Usability Heuristics (Cross-Artifact Grand Means)

| Heuristic | Grand Mean | SD | Min | Max |
|-----------|-----------|------|-----|-----|
| H1 Visibility of Status | 4.33 | 1.05 | 2 | 5 |
| H2 Match with Real World | 4.47 | 0.64 | 3 | 5 |
| H3 User Control & Freedom | **3.47** | **1.46** | **1** | **5** |
| H4 Consistency & Standards | **4.73** | 0.46 | 4 | 5 |
| H5 Error Prevention | 4.27 | 1.03 | 1 | 5 |
| H6 Recognition over Recall | 4.33 | 0.90 | 2 | 5 |
| H7 Flexibility & Efficiency | 4.13 | 1.06 | 2 | 5 |
| H8 Aesthetic & Minimalist | **4.67** | 0.62 | 3 | 5 |
| H9 Help with Errors | 3.93 | 1.16 | 2 | 5 |
| H10 Instructional Scaffolding | 4.13 | 1.19 | 1 | 5 |

**Key observations:**
- **H4 Consistency & Standards** received the highest mean (4.73, SD = 0.46) — strong consensus on consistent design.
- **H3 User Control & Freedom** was the weakest heuristic (3.47, SD = 1.46), with several reviewers scoring 1 or 2 — a known limitation of guided pedagogical tools that intentionally constrain interaction paths.
- **H8 Aesthetic & Minimalist Design** scored highly (4.67), suggesting the AI-generated interfaces were clean and uncluttered.

### 4.2 Per-Artifact Heuristic Grand Means

| Artifact | Heuristic Grand Mean |
|----------|---------------------|
| BOV | 4.33 |
| CSS | 4.30 |
| UTG | 4.23 |
| SQL | 4.20 |
| LAT | 4.17 |

All artifacts achieved heuristic grand means above 4.0/5.0, indicating good overall usability.

### 4.3 ICAP Classifications by Experts

| Artifact | Liam McNamara | Peter Hall | Tawny Whatmore | Modal Level |
|----------|--------------|------------|----------------|-------------|
| UTG | Interactive | Constructive | Constructive | Constructive |
| BOV | Constructive | Active | Active | Active |
| SQL | Interactive | Constructive | Constructive | Constructive |
| CSS | Interactive | Interactive | Constructive | Interactive |
| LAT | Interactive | Interactive | Constructive | Interactive |

**Cross-artifact distribution (15 observations):**

| Level | Count | Percentage |
|-------|-------|-----------|
| Interactive | 6 | 40.0% |
| Constructive | 7 | 46.7% |
| Active | 2 | 13.3% |
| Passive | 0 | 0.0% |

No expert classified any artifact as "Passive." The dominant expert ICAP classifications are Constructive (47%) and Interactive (40%), indicating the artifacts predominantly promote higher-order engagement.

### 4.4 Educational Purity Scores (E1 / E2)

| Artifact | E1 Mean (raw) | E2 Mean (raw) | E1 Normalised | E2 Normalised |
|----------|--------------|--------------|---------------|---------------|
| UTG | 5.00 | 4.00 | 1.0000 | 0.7500 |
| BOV | 4.33 | 4.67 | 0.8333 | 0.9167 |
| SQL | 5.00 | 4.33 | 1.0000 | 0.8333 |
| CSS | 4.67 | 4.33 | 0.9167 | 0.8333 |
| LAT | 4.67 | 4.67 | 0.9167 | 0.9167 |

**Grand means:**
- E1 (Conceptual Fidelity): 4.73/5 (normalised: 0.9333)
- E2 (Process Replicability): 4.40/5 (normalised: 0.8500)

Experts consistently rated conceptual fidelity higher than process replicability. UTG and SQL achieved perfect E1 scores (5.00), confirming they accurately represent their target concepts. The slightly lower E2 reflects occasional concerns about whether real-world workflows are fully replicated.

### 4.5 Constructionism Scores

| Artifact | Meaningful Artifact (mean) | Learning Through Building (mean) |
|----------|--------------------------|--------------------------------|
| UTG | 4.00 | 4.67 |
| BOV | 3.33 | 2.67 |
| SQL | 4.33 | 4.67 |
| CSS | 4.33 | 4.33 |
| LAT | 4.33 | 4.00 |

**Grand means:** Meaningful Artifact = 4.06/5, Learning Through Building = 4.07/5.

BOV's lower constructionism scores (particularly "Learning Through Building" at 2.67) likely reflect its visualisation-oriented design, where students observe and predict rather than construct artefacts — still valuable but less aligned with constructionist principles.

---

## 5. Layer 3 — Coordinator Review Results

Five module coordinators from CSIS, University of Limerick, each reviewed the artifact designed for their specific module. They assessed pedagogical alignment (Q1–Q3), ICAP engagement (Q4), adoption intention (Q5–Q6), and provided open-ended feedback (Q7–Q8).

### 5.1 Pedagogical Alignment (Q1–Q3 / P1)

| Artifact | Coordinator | Q1 Relevance | Q2 Challenge | Q3 Coverage | P1 Average |
|----------|------------|-------------|-------------|-------------|-----------|
| UTG | Andrew Le Gear | 5 | 5 | 5 | **5.00** |
| BOV | Paddy Healy | 5 | 5 | 5 | **5.00** |
| SQL | Dr. Nikola S. Nikolov | 5 | 5 | 5 | **5.00** |
| CSS | Dr. Alan Ryan | 3 | 2 | 5 | **3.33** |
| LAT | Jim Buckley | 4 | 3 | 4 | **3.67** |

**Aggregate:** P1 Mean = 4.40 (SD = 0.83), Q3 Mean = 4.80 (SD = 0.45)

Three of five coordinators gave perfect scores (5/5 on all three questions). The lower-scoring artifacts (CSS at 3.33, LAT at 3.67) reflect:
- **CSS:** Lower curriculum relevance (Q1 = 3) and challenge (Q2 = 2) — Flexbox is considered straightforward and less central to the Introduction to Programming syllabus.
- **LAT:** Moderate challenge (Q2 = 3) and coverage (Q3 = 4) — suggestions for refinement included initial example videos and persistent prompts.

### 5.2 ICAP Classifications by Coordinators

| Artifact | Coordinator ICAP | Self ICAP | Match? |
|----------|-----------------|-----------|--------|
| UTG | Interactive | Interactive | ✓ |
| BOV | Interactive | Interactive | ✓ |
| SQL | Interactive | Interactive | ✓ |
| CSS | Active | Active | ✓ |
| LAT | Constructive | Constructive | ✓ |

**Self ↔ Coordinator ICAP agreement: 5/5 (100%)**

This perfect alignment provides strong validation that the ICAP classifications embedded in the DSQI formula are accurate reflections of the engagement each artifact promotes.

### 5.3 Adoption Intention (Q5–Q6)

| Artifact | Coordinator | Q5 Ease | Q6 Likelihood | Mean |
|----------|------------|---------|--------------|------|
| UTG | Andrew Le Gear | 5 | 5 | **5.00** |
| BOV | Paddy Healy | 5 | 5 | **5.00** |
| SQL | Dr. Nikola S. Nikolov | 5 | 5 | **5.00** |
| CSS | Dr. Alan Ryan | 5 | 3 | **4.00** |
| LAT | Jim Buckley | 4 | 4 | **4.00** |

**Aggregate:** Q5 Mean = 4.80 (SD = 0.45), Q6 Mean = 4.40 (SD = 0.89), Overall Mean = **4.60**/5

All five coordinators rated ease of integration highly (Q5 ≥ 4). Three rated maximum likelihood of use (Q6 = 5). Even the lower-rated artifacts (CSS, LAT) received adoption means of 4.00/5, indicating strong intent to use.

### 5.4 Coordinator Qualitative Feedback

**Q7 — Most Significant Benefit:**

| Artifact | Coordinator | Benefit |
|----------|------------|---------|
| UTG | Andrew Le Gear | "This can replace a large chunk of passive theoretical learning in one of the lectures during the semester. It provides a novel in-class way to teach a difficult programming concept." |
| BOV | Paddy Healy | "Gives students practical opportunities to come to understand one of the fundamental aspects of algorithms." |
| SQL | Dr. Nikola S. Nikolov | "Clear and accessible explanation of the SQL injection concept through a practical example combined with hands-on experience, enabling students to understand both the theory and its real-world implications." |
| CSS | Dr. Alan Ryan | "As the framework is provided, the student can focus on the specific task at hand." |
| LAT | Jim Buckley | "Provides engaging, relevant material while relieving the ML of the effort of constructing it." |

**Q8 — Most Significant Drawback:**

| Artifact | Coordinator | Drawback |
|----------|------------|----------|
| UTG | Andrew Le Gear | "Some mobile responsive issues. Best done on a laptop screen." |
| BOV | Paddy Healy | "Timeout was a little too fast; plotting was confusing; assumed constant C=1 for complexity." |
| SQL | Dr. Nikola S. Nikolov | "None." |
| CSS | Dr. Alan Ryan | "When more complex (multi-stage) tasks are the objective, this would need to provide less support so that the student has to construct the flow of logic without hints." |
| LAT | Jim Buckley | "Needs a few small refinements: initial exercise should be a video example, descriptive prompt should stay on screen, regex matches more than intended." |

The drawbacks are predominantly **minor usability refinements** rather than fundamental pedagogical concerns — consistent with the disposable software philosophy where issues can be addressed by regenerating the artifact.

---

## 6. Cross-Layer Synthesis

### 6.1 ICAP Triangulation

The ICAP framework forms a central axis of evaluation across all three layers:

| Artifact | Self (Layer 1) | Expert Modal (Layer 2) | Coordinator (Layer 3) | Self↔Coord | Self↔Expert Modal |
|----------|---------------|----------------------|---------------------|------------|-------------------|
| UTG | Interactive | Constructive | Interactive | ✓ | ✗ |
| BOV | Interactive | Active | Interactive | ✓ | ✗ |
| SQL | Interactive | Constructive | Interactive | ✓ | ✗ |
| CSS | Active | Interactive | Active | ✓ | ✗ |
| LAT | Constructive | Interactive | Constructive | ✓ | ✗ |

**Finding:** Self-assessment and coordinator ICAP classifications agree perfectly (100%), while expert assessments diverge from self-assessments in most cases (expert–self exact match rate: 20%, 3/15). This pattern is expected: coordinators evaluated artifacts in the context of their specific module and student population, while experts evaluated from a general usability perspective without module-specific pedagogical context.

Importantly, **no layer classified any artifact as "Passive"**, confirming that all five artifacts promote at least Active-level engagement.

### 6.2 Quality Convergence

| Dimension | Layer 1 Finding | Layer 2 Finding | Layer 3 Finding |
|-----------|----------------|-----------------|-----------------|
| Overall quality | All DSQI ≥ 0.70 | All heuristic means ≥ 4.0/5 | All P1 ≥ 3.33/5 |
| Engagement level | 3 interactive, 1 constructive, 1 active | 40% interactive, 47% constructive | 3 interactive, 1 constructive, 1 active |
| Educational fidelity | E mean = 0.89 | E1 = 4.73/5, E2 = 4.40/5 | Q3 mean = 4.80/5 |
| Adoption readiness | — | — | Mean = 4.60/5 |

All three layers converge on a consistent finding: the artifacts are **educationally viable, promote active-or-higher engagement, and faithfully represent their target concepts**.

### 6.3 Artifact Grouping

The data reveals a natural two-tier grouping:

**Tier 1 — High DSQI (≥ 0.89), Interactive ICAP, P1 = 5.00:**
- Unit Testing Gauntlet (DSQI = 0.8966)
- Big-O Visualiser (DSQI = 0.9108)
- SQL Injection Simulator (DSQI = 0.8959)

**Tier 2 — Moderate DSQI (< 0.85), Sub-Interactive ICAP, P1 < 5.00:**
- CSS Flexbox Trainer (DSQI = 0.7903, ICAP = Active, P1 = 3.33)
- Lexical Analyser Trainer (DSQI = 0.8269, ICAP = Constructive, P1 = 3.67)

The tier separation is primarily driven by the **Pedagogical Alignment (P) component**, where lower coordinator P1 scores and sub-interactive ICAP levels reduce the P contribution. Both Tier 2 artifacts nevertheless exceed the 0.70 threshold and received positive adoption intention scores.

---

## 7. Key Findings

### RQ1: Can AI-generated disposable software artefacts meet minimum quality thresholds for educational use?

**Yes.** All five artifacts achieved DSQI scores above the 0.70 threshold (range: 0.790–0.911, M̄ = 0.864, SD = 0.053). Maintenance and creation costs were uniformly low (M̄ = 0.17, C̄ = 0.11), confirming the disposability premise. Expert heuristic evaluations corroborate quality, with all artifacts scoring ≥ 4.0/5.0 on average across 10 usability heuristics.

### RQ2: How do educators perceive the pedagogical value of disposable software?

**Very positively.** Module coordinators rated pedagogical alignment highly (P1 M̄ = 4.40/5, Q3 coverage M̄ = 4.80/5) and expressed strong adoption intention (M̄ = 4.60/5). Qualitative feedback emphasised benefits such as replacing passive lectures, providing hands-on experience, and reducing educator effort. Identified drawbacks were minor usability issues addressable through artifact regeneration.

### RQ3: Does disposable software promote active learning as characterised by the ICAP framework?

**Yes.** No evaluator in any layer classified any artifact as "Passive." Self-assessment and coordinator ICAP classifications achieved 100% agreement, with the distribution: 3 Interactive, 1 Constructive, 1 Active. Expert ICAP classifications confirm engagement at Constructive-or-above for 87% (13/15) of observations. The artifacts demonstrably promote higher-order engagement consistent with the ICAP framework's Active, Constructive, and Interactive modes.

---

## 8. Limitations

1. **Small sample size:** 5 artifacts, 3 experts, 5 coordinators — sufficient for design-based research but limits statistical generalisation.
2. **No student evaluation:** The current study evaluates educator perceptions; student learning outcomes remain unmeasured.
3. **Single institution:** All coordinators are from CSIS, University of Limerick — cross-institutional validity is unestablished.
4. **Self-assessment bias:** Layer 1 DSQI scores include researcher-computed P and E components that, while validated by Layer 2/3, originate from the study designer.
5. **Expert homogeneity:** All three experts come from industry (Horizon Globex/Fintex) rather than academia, potentially biasing heuristic evaluations toward industry standards.
6. **ICAP classification subjectivity:** ICAP levels were assigned categorically rather than through validated instruments; the perfect self–coordinator agreement may partly reflect shared cultural context.

---

## 9. Next Steps

This core analysis report provides the foundational results of the DSQI evaluation. For deeper statistical and qualitative analysis, see:

- **[EXTENDED_ANALYSIS_REPORT.md](EXTENDED_ANALYSIS_REPORT.md)** — Extended analyses A–J including inter-rater reliability, sensitivity analysis, Q-Q normality tests, qualitative coding, and more.

Additional planned work:
- Pilot deployment with students in Semester 2
- Student learning outcome measurement (pre/post tests)
- Iteration on Tier 2 artifacts (CSS, LAT) based on coordinator feedback
- Cross-institutional replication

---

*Report generated by the core analysis pipeline. Source data: `data/evaluations/layer1-dsqi/`, `data/evaluations/layer2-expert-review/`, `data/evaluations/layer3-coordinator-review/`. Scripts: `analysis/generate_*.py`.*
