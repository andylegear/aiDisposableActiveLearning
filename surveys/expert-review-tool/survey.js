/**
 * survey.js — DSQI Expert Review Portal
 *
 * Alpine.js component powering the multi-step survey wizard.
 * Depends on globals from survey-data.js (loaded first).
 */

function surveyApp() {
  return {
    // ── Step Management ──────────────────────────────────────
    // Steps: 0=Welcome, 1=ReviewerInfo, 2-11=Artifacts(5×2), 12=Summary, 13=ThankYou
    step: 0,
    totalSteps: 14,
    errors: [],

    // ── Static Data Refs (from survey-data.js) ───────────────
    artifacts: ARTIFACTS,
    heuristics: HEURISTICS,
    icapLevels: ICAP_LEVELS,
    likertLabels: LIKERT_LABELS,
    e1Scale: E1_SCALE,
    e2Scale: E2_SCALE,
    conQ1: CONSTRUCTIONISM_Q1,
    conQ2: CONSTRUCTIONISM_Q2,

    // ── Reviewer Info ────────────────────────────────────────
    reviewer: {
      name: "",
      email: "",
      role: "",
      experience_years: "",
      institution: "",
    },

    // ── Artifact Responses ───────────────────────────────────
    responses: ARTIFACTS.map((a) => ({
      artifact_id: a.id,
      icap: { level: "", justification: "" },
      constructionism: {
        meaningful_artifact: { score: 0, justification: "" },
        learning_through_building: { score: 0, justification: "" },
      },
      heuristics: {
        visibility_of_status: 0,
        match_with_real_world: 0,
        user_control_and_freedom: 0,
        consistency_and_standards: 0,
        error_prevention: 0,
        recognition_over_recall: 0,
        flexibility_and_efficiency: 0,
        aesthetic_and_minimalist_design: 0,
        help_with_errors: 0,
        instructional_scaffolding: 0,
        comments: "",
      },
      dsqi: {
        E1_conceptual_fidelity: { score: 0, justification: "" },
        E2_process_replicability: { score: 0, justification: "" },
      },
      open_ended: {
        most_positive: "",
        most_negative: "",
        other_comments: "",
      },
    })),

    submitted: false,

    // ── Computed Properties ───────────────────────────────────

    get progressPercent() {
      // Steps 0-12 are visible progress (13 = thank you, after submit)
      return Math.min(100, Math.round((this.step / 12) * 100));
    },

    get progressText() {
      if (this.step === 0) return "Welcome";
      if (this.step === 1) return "Reviewer Information";
      if (this.step >= 2 && this.step <= 11) {
        const ai = this.currentArtifactIndex;
        const sub = this.isExploreStep ? "Explore" : "Evaluate";
        return `Artifact ${ai + 1} of 5 — ${sub}`;
      }
      if (this.step === 12) return "Review Summary";
      return "Complete";
    },

    get currentArtifactIndex() {
      if (this.step < 2 || this.step > 11) return -1;
      return Math.floor((this.step - 2) / 2);
    },

    get currentArtifact() {
      const i = this.currentArtifactIndex;
      return i >= 0 ? ARTIFACTS[i] : null;
    },

    get currentResponse() {
      const i = this.currentArtifactIndex;
      return i >= 0 ? this.responses[i] : null;
    },

    get isExploreStep() {
      return this.step >= 2 && this.step <= 11 && this.step % 2 === 0;
    },

    get isQuestionsStep() {
      return this.step >= 2 && this.step <= 11 && this.step % 2 === 1;
    },

    // ── Navigation ───────────────────────────────────────────

    next() {
      this.errors = [];

      // Validate current step before advancing
      if (this.step === 1 && !this.validateReviewer()) return;
      if (this.isQuestionsStep && !this.validateQuestions()) return;

      if (this.step < this.totalSteps - 1) {
        this.step++;
        this.scrollToTop();
      }
    },

    prev() {
      if (this.step > 0) {
        this.errors = [];
        this.step--;
        this.scrollToTop();
      }
    },

    goToStep(s) {
      this.errors = [];
      this.step = s;
      this.scrollToTop();
    },

    goToArtifactQuestions(index) {
      this.goToStep(2 + index * 2 + 1);
    },

    scrollToTop() {
      window.scrollTo({ top: 0, behavior: "smooth" });
    },

    // ── Validation ───────────────────────────────────────────

    validateReviewer() {
      const errs = [];
      if (!this.reviewer.name.trim()) errs.push("Name is required.");
      if (!this.reviewer.email.trim()) errs.push("Email is required.");
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.reviewer.email))
        errs.push("Please enter a valid email address.");
      if (!this.reviewer.role) errs.push("Please select your role.");
      if (
        this.reviewer.experience_years === "" ||
        this.reviewer.experience_years < 0
      )
        errs.push("Years of experience is required (0 or more).");

      this.errors = errs;
      if (errs.length) this.scrollToFirstError();
      return errs.length === 0;
    },

    validateQuestions() {
      const errs = [];
      const r = this.currentResponse;
      const ai = this.currentArtifactIndex;
      const aName = ARTIFACTS[ai].name;

      // ICAP
      if (!r.icap.level) errs.push("Please select an ICAP engagement level.");
      if (r.icap.justification.trim().length < 20)
        errs.push("ICAP justification must be at least 20 characters.");

      // Constructionism
      if (!r.constructionism.meaningful_artifact.score)
        errs.push("Please rate Constructionism Q1 (meaningful artifact).");
      if (!r.constructionism.meaningful_artifact.justification.trim())
        errs.push("Constructionism Q1 justification is required.");
      if (!r.constructionism.learning_through_building.score)
        errs.push(
          "Please rate Constructionism Q2 (learning through building)."
        );
      if (!r.constructionism.learning_through_building.justification.trim())
        errs.push("Constructionism Q2 justification is required.");

      // Heuristics
      for (const h of HEURISTICS) {
        if (!r.heuristics[h.key])
          errs.push(`Please rate heuristic: ${h.name}.`);
      }

      // DSQI
      if (!r.dsqi.E1_conceptual_fidelity.score)
        errs.push("Please rate E₁ Conceptual Fidelity.");
      if (!r.dsqi.E1_conceptual_fidelity.justification.trim())
        errs.push("E₁ Conceptual Fidelity justification is required.");
      if (!r.dsqi.E2_process_replicability.score)
        errs.push("Please rate E₂ Process Replicability.");
      if (!r.dsqi.E2_process_replicability.justification.trim())
        errs.push("E₂ Process Replicability justification is required.");

      // Open-ended
      if (!r.open_ended.most_positive.trim())
        errs.push("Please describe the most positive aspect.");
      if (!r.open_ended.most_negative.trim())
        errs.push("Please describe the most negative aspect.");

      this.errors = errs;
      if (errs.length) this.scrollToFirstError();
      return errs.length === 0;
    },

    scrollToFirstError() {
      this.$nextTick(() => {
        const el = document.querySelector(".field-error, .error-banner");
        if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
      });
    },

    // ── Summary Helpers ──────────────────────────────────────

    heuristicAvg(index) {
      const r = this.responses[index].heuristics;
      const vals = HEURISTICS.map((h) => r[h.key]).filter((v) => v > 0);
      if (!vals.length) return "—";
      return (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1);
    },

    truncate(text, len) {
      if (!text) return "—";
      return text.length > len ? text.substring(0, len) + "…" : text;
    },

    icapLabel(level) {
      const found = ICAP_LEVELS.find((l) => l.value === level);
      return found ? found.label : "—";
    },

    // ── JSON Build & Submit ──────────────────────────────────

    buildJSON() {
      return {
        schema: "dsqi-expert-review-v1",
        timestamp: new Date().toISOString(),
        reviewer: {
          name: this.reviewer.name.trim(),
          email: this.reviewer.email.trim(),
          role: this.reviewer.role,
          experience_years: parseInt(this.reviewer.experience_years) || 0,
          institution: this.reviewer.institution.trim(),
        },
        artifacts: this.responses.map((r) => JSON.parse(JSON.stringify(r))),
      };
    },

    downloadJSON() {
      const data = this.buildJSON();
      const slug = this.reviewer.name.trim().toLowerCase().replace(/\s+/g, "-");
      const date = new Date().toISOString().split("T")[0];
      const filename = `dsqi-review-${slug}-${date}.json`;

      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      return { filename, slug, date };
    },

    submit() {
      // Download the JSON file
      const { filename, slug, date } = this.downloadJSON();

      // Open mailto with pre-filled fields
      const reviewerName = this.reviewer.name.trim();
      const subject = encodeURIComponent(
        `DSQI Expert Review — ${reviewerName}`
      );
      const body = encodeURIComponent(
        `Dear Andrew,\n\nPlease find my expert review submission attached.\n\n` +
          `Reviewer: ${reviewerName}\n` +
          `Date: ${date}\n` +
          `File: ${filename}\n\n` +
          `Kind regards,\n${reviewerName}`
      );
      const mailto = `mailto:andrew.p.legear@ul.ie?subject=${subject}&body=${body}`;

      // Small delay to let the download trigger before mailto
      setTimeout(() => {
        window.location.href = mailto;
      }, 500);

      this.submitted = true;
      this.step = 13;
      this.scrollToTop();
    },
  };
}
