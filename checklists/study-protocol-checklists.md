# Protocol Checklists

Actionable checklists for each phase of the study. Use these to track progress through the protocol.

## How to Use

- Copy the relevant checklist into an issue tracker or check items off in your editor.
- Each checklist corresponds to a phase from the [Multi-Artifact Study Protocol](../sources/protocols/Multi-Artifact%20Study%20Protocol%20for%20Disposable%20Software%20(Revised).md).
- When a phase is complete for all artifacts, update the `current_phase` in `data/artifact-registry.json`.

---

## Phase 1: Artifact Development (per artifact)

Repeat this checklist for each of the five artifacts.

- [ ] Confirm module coordinator identity and contact details → update `artifact-registry.json`
- [ ] Set artifact status to `in-development` in registry
- [ ] Create development session log file: `data/development-logs/sessions-{slug}.json` (start as `[]`)
- [ ] Begin AI-assisted development using the defined protocol
- [ ] Log each development session as a JSON object appended to the sessions file
- [ ] Record all AI prompts and strategies in the artifact's `README.md` development log
- [ ] Complete the artifact's Technical Summary section in its `README.md`
- [ ] Deploy the artifact and record the deployment URL in the registry
- [ ] Push source code and record the repository URL in the registry
- [ ] Set artifact status to `developed` in registry

---

## Phase 2: Self-Evaluation / DSQI (per artifact)

- [ ] Run `cloc --json` on the artifact source → save to `data/static-analysis/{slug}/cloc-output.json`
- [ ] Run cyclomatic complexity analysis → save to `data/static-analysis/{slug}/complexity-report.json`
- [ ] Export dependency list → save to `data/static-analysis/{slug}/dependency-list.json`
- [ ] Calculate all DSQI sub-metrics using the DSQI Evaluation Protocol
- [ ] Rate Conceptual Fidelity (E₁) and Process Replicability (E₂)
- [ ] Compute final DSQI score using the formula and chosen weights
- [ ] Save results to `data/evaluations/layer1-dsqi/dsqi-{slug}.json`
- [ ] Run `npm run validate:dsqi` to verify schema compliance
- [ ] Update `dsqi_score` and `dsqi_completed` in `artifact-registry.json`
- [ ] Set artifact status to `self-evaluated` in registry

---

## Phase 3: Expert Review (across all artifacts)

- [ ] Recruit 3–5 expert reviewers with SE or CS-education experience
- [ ] Add each reviewer to `expert_reviewers` array in `artifact-registry.json`
- [ ] Assign at least 2 reviewers per artifact → record in `assigned_artifacts`
- [ ] Distribute the Expert Review Protocol document to each reviewer
- [ ] Provide each reviewer with deployment URL and source code link
- [ ] Collect completed reviews
- [ ] Transcribe each review into JSON → save to `data/evaluations/layer2-expert-review/expert-review-{slug}-{reviewer_id}.json`
- [ ] Run `npm run validate:expert` to verify schema compliance
- [ ] Update `expert_reviews_received` count in `artifact-registry.json`
- [ ] Set artifact status to `expert-reviewed` once all reviews received

---

## Phase 4: Module Coordinator Review (per artifact)

- [ ] Contact the module coordinator for the target module
- [ ] Distribute the Pedagogical Utility Evaluation Protocol
- [ ] Provide coordinator with deployed artifact URL
- [ ] Collect completed review
- [ ] Transcribe review into JSON → save to `data/evaluations/layer3-coordinator-review/coordinator-review-{slug}.json`
- [ ] Run `npm run validate:coordinator` to verify schema compliance
- [ ] Set `coordinator_review_received` to `true` in registry
- [ ] Set artifact status to `coordinator-reviewed`

---

## Phase 5: Data Analysis

- [ ] Run `npm run status` to confirm all data collected
- [ ] Run `npm run validate:all` to ensure data integrity
- [ ] Generate DSQI comparison report: `npm run report:dsqi`
- [ ] Aggregate expert review scores — calculate means per item per artifact
- [ ] Perform thematic analysis on expert qualitative feedback
- [ ] Aggregate coordinator review scores
- [ ] Identify themes in coordinator qualitative feedback
- [ ] Generate summary report: `npm run report:summary`
- [ ] Export figures/tables for paper

---

## Phase 6: Paper Writing

- [ ] Draft Introduction (~1,500 words)
- [ ] Draft Literature Review (~2,500 words)
- [ ] Draft Theoretical Framework (~1,500 words)
- [ ] Draft Methodology (~1,500 words) — include DSQI model, three-layer protocol
- [ ] Draft Artifact Descriptions (~2,000 words) — 5 artifacts with design rationale
- [ ] Draft Evaluation Results (~2,500 words) — Layer 1, 2, 3 results with tables/figures
- [ ] Draft Discussion (~1,500 words)
- [ ] Draft Conclusion & Future Work (~500 words)
- [ ] Compile references
- [ ] Proofread and format for Computer Science Education journal guidelines
- [ ] Submit
