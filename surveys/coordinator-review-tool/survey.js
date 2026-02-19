/**
 * survey.js — DSQI Module Coordinator Review Portal
 *
 * Alpine.js component powering the 9-step survey wizard.
 * Depends on globals from survey-data.js (loaded first).
 *
 * Steps:
 *   0 = Welcome
 *   1 = Coordinator Info + Artifact Selection
 *   2 = Explore Artifact
 *   3 = Part 1: Pedagogical Alignment (Q1-Q3)
 *   4 = Part 2: ICAP (Q4)
 *   5 = Part 3: Adoption Intention (Q5-Q6)
 *   6 = Part 4: Open-Ended (Q7-Q8)
 *   7 = Summary
 *   8 = Thank You
 */

function surveyApp() {
  return {
    // ── Step Management ──────────────────────────────────────
    step: 0,
    totalSteps: 9,
    errors: [],

    // ── Static Data Refs (from survey-data.js) ───────────────
    artifacts: ARTIFACTS,
    icapLevels: ICAP_LEVELS,
    p1Scales: P1_SCALES,
    adoptionScales: ADOPTION_SCALES,

    // ── Coordinator Info ─────────────────────────────────────
    coordinator: {
      name: "",
      email: "",
      department: "CSIS, University of Limerick",
    },

    // ── Artifact Selection ───────────────────────────────────
    selectedArtifactId: "",
    artifactLocked: false, // true if pre-selected via URL param

    // ── Responses ────────────────────────────────────────────
    p1: { Q1: 0, Q2: 0, Q3: 0 },
    icap: { Q4: "" },
    adoption: { Q5: 0, Q6: 0 },
    openEnded: { Q7: "", Q8: "" },

    submitted: false,

    // ── Initialisation ───────────────────────────────────────

    init() {
      // Check for ?artifact=<id> URL parameter
      const params = new URLSearchParams(window.location.search);
      const artifactParam = params.get("artifact");
      if (artifactParam) {
        const match = ARTIFACTS.find((a) => a.id === artifactParam);
        if (match) {
          this.selectedArtifactId = match.id;
          this.artifactLocked = true;
        }
      }
    },

    // ── Computed Properties ───────────────────────────────────

    get progressPercent() {
      // Steps 0-7 are visible progress (8 = thank you, after submit)
      if (this.step === 0) return 0;
      return Math.min(100, Math.round((this.step / 7) * 100));
    },

    get progressText() {
      const labels = [
        "Welcome",
        "Coordinator Information",
        "Explore Artifact",
        "Part 1: Pedagogical Alignment",
        "Part 2: ICAP Framework",
        "Part 3: Adoption Intention",
        "Part 4: Open-Ended Feedback",
        "Review Summary",
        "Complete",
      ];
      return labels[this.step] || "";
    },

    get selectedArtifact() {
      return ARTIFACTS.find((a) => a.id === this.selectedArtifactId) || null;
    },

    get p1Average() {
      const vals = [this.p1.Q1, this.p1.Q2, this.p1.Q3].filter((v) => v > 0);
      if (!vals.length) return 0;
      return vals.reduce((a, b) => a + b, 0) / vals.length;
    },

    // ── Navigation ───────────────────────────────────────────

    next() {
      this.errors = [];

      if (this.step === 1 && !this.validateCoordinator()) return;
      if (this.step === 3 && !this.validateP1()) return;
      if (this.step === 4 && !this.validateICAP()) return;
      if (this.step === 5 && !this.validateAdoption()) return;
      if (this.step === 6 && !this.validateOpenEnded()) return;

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

    scrollToTop() {
      window.scrollTo({ top: 0, behavior: "smooth" });
    },

    // ── Validation ───────────────────────────────────────────

    validateCoordinator() {
      const errs = [];
      if (!this.coordinator.name.trim()) errs.push("Name is required.");
      if (!this.coordinator.email.trim()) errs.push("Email is required.");
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.coordinator.email))
        errs.push("Please enter a valid email address.");
      if (!this.coordinator.department.trim())
        errs.push("Department is required.");
      if (!this.selectedArtifactId) errs.push("Please select an artifact.");

      this.errors = errs;
      if (errs.length) this.scrollToFirstError();
      return errs.length === 0;
    },

    validateP1() {
      const errs = [];
      if (!this.p1.Q1) errs.push("Please answer Q1 (Curriculum Relevance).");
      if (!this.p1.Q2) errs.push("Please answer Q2 (Concept Challenge).");
      if (!this.p1.Q3) errs.push("Please answer Q3 (Objective Coverage).");

      this.errors = errs;
      if (errs.length) this.scrollToFirstError();
      return errs.length === 0;
    },

    validateICAP() {
      const errs = [];
      if (!this.icap.Q4) errs.push("Please select an ICAP engagement mode.");

      this.errors = errs;
      if (errs.length) this.scrollToFirstError();
      return errs.length === 0;
    },

    validateAdoption() {
      const errs = [];
      if (!this.adoption.Q5)
        errs.push("Please answer Q5 (Ease of Integration).");
      if (!this.adoption.Q6)
        errs.push("Please answer Q6 (Likelihood of Use).");

      this.errors = errs;
      if (errs.length) this.scrollToFirstError();
      return errs.length === 0;
    },

    validateOpenEnded() {
      const errs = [];
      if (!this.openEnded.Q7.trim())
        errs.push("Please describe the most significant benefit (Q7).");
      if (!this.openEnded.Q8.trim())
        errs.push("Please describe the most significant drawback (Q8).");

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

    icapLabel(level) {
      const found = ICAP_LEVELS.find((l) => l.value === level);
      return found ? found.label : "—";
    },

    truncate(text, len) {
      if (!text) return "—";
      return text.length > len ? text.substring(0, len) + "…" : text;
    },

    // ── JSON Build & Submit ──────────────────────────────────

    buildJSON() {
      const a = this.selectedArtifact;
      return {
        schema: "dsqi-coordinator-review-v1",
        timestamp: new Date().toISOString(),
        coordinator: {
          name: this.coordinator.name.trim(),
          email: this.coordinator.email.trim(),
          department: this.coordinator.department.trim(),
        },
        artifact_id: a ? a.id : "",
        artifact_name: a ? a.name : "",
        module: a ? a.module : "",
        module_name: a ? a.moduleName : "",
        pedagogical_alignment: {
          Q1_curriculum_relevance: this.p1.Q1,
          Q2_concept_challenge: this.p1.Q2,
          Q3_objective_coverage: this.p1.Q3,
          P1_average: parseFloat(this.p1Average.toFixed(2)),
        },
        icap: {
          Q4_engagement_mode: this.icap.Q4,
        },
        adoption_intention: {
          Q5_ease_of_integration: this.adoption.Q5,
          Q6_likelihood_of_use: this.adoption.Q6,
        },
        open_ended: {
          Q7_most_significant_benefit: this.openEnded.Q7.trim(),
          Q8_most_significant_drawback: this.openEnded.Q8.trim(),
        },
      };
    },

    downloadJSON() {
      const data = this.buildJSON();
      const slug = this.coordinator.name
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "-");
      const date = new Date().toISOString().split("T")[0];
      const artifactId = this.selectedArtifactId;
      const filename = `dsqi-coordinator-${slug}-${artifactId}-${date}.json`;

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
      const coordName = this.coordinator.name.trim();
      const artifactName = this.selectedArtifact
        ? this.selectedArtifact.name
        : "";
      const subject = encodeURIComponent(
        `DSQI Coordinator Review — ${coordName} — ${artifactName}`
      );
      const body = encodeURIComponent(
        `Dear Andrew,\n\nPlease find my coordinator review submission attached.\n\n` +
          `Coordinator: ${coordName}\n` +
          `Artifact: ${artifactName}\n` +
          `Date: ${date}\n` +
          `File: ${filename}\n\n` +
          `Kind regards,\n${coordName}`
      );
      const mailto = `mailto:andrew.p.legear@ul.ie?subject=${subject}&body=${body}`;

      // Small delay to let the download trigger before mailto
      setTimeout(() => {
        window.location.href = mailto;
      }, 500);

      this.submitted = true;
      this.step = 8;
      this.scrollToTop();
    },
  };
}
