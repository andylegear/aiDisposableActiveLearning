/* ============================================================
   THE UNIT TESTING GAUNTLET — Game Engine
   Handles: test execution sandbox, game state, UI, scoring.
   ============================================================ */

// ─── Mini Test Framework (injected into sandbox) ────────────
// This string is prepended to all user code before execution.
// It provides expect(), test(), and assertion tracking.

const TEST_FRAMEWORK_SOURCE = `
var __results = [];

function expect(actual) {
  return {
    toBe: function(expected) {
      if (actual !== expected) {
        throw { __assertion: true,
          message: 'Expected ' + JSON.stringify(expected) + ' but got ' + JSON.stringify(actual) };
      }
    },
    toEqual: function(expected) {
      if (JSON.stringify(actual) !== JSON.stringify(expected)) {
        throw { __assertion: true,
          message: 'Expected ' + JSON.stringify(expected) + ' but got ' + JSON.stringify(actual) };
      }
    },
    toBeTruthy: function() {
      if (!actual) {
        throw { __assertion: true,
          message: 'Expected truthy but got ' + JSON.stringify(actual) };
      }
    },
    toBeFalsy: function() {
      if (actual) {
        throw { __assertion: true,
          message: 'Expected falsy but got ' + JSON.stringify(actual) };
      }
    },
    toContain: function(item) {
      if ((Array.isArray(actual) && actual.indexOf(item) === -1) ||
          (typeof actual === 'string' && actual.indexOf(item) === -1)) {
        throw { __assertion: true,
          message: 'Expected ' + JSON.stringify(actual) + ' to contain ' + JSON.stringify(item) };
      }
    },
    toHaveLength: function(len) {
      if (actual.length !== len) {
        throw { __assertion: true,
          message: 'Expected length ' + len + ' but got ' + actual.length };
      }
    }
  };
}

function test(name, fn) {
  try {
    fn();
    __results.push({ name: name, passed: true, error: null });
  } catch(e) {
    if (e && e.__assertion) {
      __results.push({ name: name, passed: false, error: e.message });
    } else {
      __results.push({ name: name, passed: false, error: 'Runtime error: ' + (e.message || String(e)) });
    }
  }
}
`;

// ─── Code Execution Sandbox ─────────────────────────────────

function executeCode(functionCode, testCode) {
  const fullCode = TEST_FRAMEWORK_SOURCE + "\n" + functionCode + "\n" + testCode + "\nreturn __results;";
  try {
    const executor = new Function(fullCode);
    const results = executor();
    return { success: true, results: results, error: null };
  } catch (e) {
    return { success: false, results: [], error: e.message || String(e) };
  }
}

// ─── Game State ─────────────────────────────────────────────

const PHASES = ["red", "green", "refactor"];
const PHASE_LABELS = {
  red:      "🔴 RED — Write a Failing Test",
  green:    "🟢 GREEN — Make It Pass",
  refactor: "🔵 REFACTOR — Clean It Up"
};
const PHASE_CSS = {
  red:      "phase-red",
  green:    "phase-green",
  refactor: "phase-blue"
};

let state = {
  currentLevel: 0,     // index into LEVELS
  currentPhase: 0,     // index into PHASES
  score: 0,
  streak: 0,
  bestStreak: 0,
  phaseComplete: false  // has current phase been passed?
};

// ─── DOM References ─────────────────────────────────────────

const $ = (sel) => document.querySelector(sel);
const dom = {
  titleScreen:      $("#title-screen"),
  gameScreen:       $("#game-screen"),
  completeScreen:   $("#complete-screen"),
  overlay:          $("#level-complete-overlay"),

  startBtn:         $("#start-btn"),
  runBtn:           $("#run-btn"),
  hintBtn:          $("#hint-btn"),
  nextBtn:          $("#next-btn"),
  nextLevelBtn:     $("#next-level-btn"),
  restartBtn:       $("#restart-btn"),

  levelInfo:        $("#level-info"),
  phaseBadge:       $("#phase-badge"),
  scoreValue:       $("#score-value"),
  streakDisplay:    $("#streak-display"),
  streakValue:      $("#streak-value"),

  specText:         $("#spec-text"),
  phaseInstructions:$("#phase-instructions"),

  functionEditor:   $("#function-editor"),
  testEditor:       $("#test-editor"),

  fnReadonlyBadge:  $("#function-readonly-badge"),
  fnEditableBadge:  $("#function-editable-badge"),
  testReadonlyBadge:$("#test-readonly-badge"),
  testEditableBadge:$("#test-editable-badge"),

  consoleOutput:    $("#console-output"),

  // Overlay
  levelCompleteTitle:  $("#level-complete-title"),
  levelCompleteMsg:    $("#level-complete-message"),
  levelScoreSummary:   $("#level-score-summary"),

  // Final
  finalScore:       $("#final-score"),
  finalLevels:      $("#final-levels"),
  finalStreak:      $("#final-streak")
};

// ─── Screen Management ──────────────────────────────────────

function showScreen(screen) {
  [dom.titleScreen, dom.gameScreen, dom.completeScreen].forEach(s => s.classList.remove("active"));
  screen.classList.add("active");
}

// ─── UI Rendering ───────────────────────────────────────────

function renderPhase() {
  const level = LEVELS[state.currentLevel];
  const phaseName = PHASES[state.currentPhase];
  const phase = level[phaseName];

  // Header
  dom.levelInfo.textContent = `Level ${level.id} / ${LEVELS.length} — ${level.title}`;
  dom.phaseBadge.textContent = PHASE_LABELS[phaseName];
  dom.phaseBadge.className = PHASE_CSS[phaseName];
  dom.scoreValue.textContent = state.score;

  // Streak
  if (state.streak > 1) {
    dom.streakDisplay.classList.remove("hidden");
    dom.streakValue.textContent = state.streak;
  } else {
    dom.streakDisplay.classList.add("hidden");
  }

  // Phase glow
  dom.gameScreen.className = "screen active game-phase-" + phaseName;

  // Spec & instructions
  dom.specText.textContent = level.spec;
  dom.phaseInstructions.textContent = phase.instructions;

  // Configure panels based on phase
  if (phaseName === "red") {
    // Function: read-only | Tests: editable
    dom.functionEditor.value = phase.functionCode;
    dom.functionEditor.readOnly = true;
    dom.testEditor.value = phase.starterTest;
    dom.testEditor.readOnly = false;
    showBadges(true, false);
  } else if (phaseName === "green") {
    // Function: editable | Tests: read-only
    dom.functionEditor.value = phase.functionCode;
    dom.functionEditor.readOnly = false;
    dom.testEditor.value = phase.testCode;
    dom.testEditor.readOnly = true;
    showBadges(false, true);
  } else if (phaseName === "refactor") {
    // Function: editable | Tests: read-only
    dom.functionEditor.value = phase.functionCode;
    dom.functionEditor.readOnly = false;
    dom.testEditor.value = phase.testCode;
    dom.testEditor.readOnly = true;
    showBadges(false, true);
  }

  // Reset controls
  dom.nextBtn.classList.add("hidden");
  dom.runBtn.disabled = false;
  state.phaseComplete = false;

  // Clear console
  dom.consoleOutput.innerHTML = '<p class="console-muted">Press <strong>Run Tests</strong> to see results here.</p>';
}

function showBadges(functionReadonly, testReadonly) {
  dom.fnReadonlyBadge.classList.toggle("hidden", !functionReadonly);
  dom.fnEditableBadge.classList.toggle("hidden", functionReadonly);
  dom.testReadonlyBadge.classList.toggle("hidden", !testReadonly);
  dom.testEditableBadge.classList.toggle("hidden", testReadonly);
}

// ─── Test Execution & Evaluation ────────────────────────────

function handleRun() {
  if (state.phaseComplete) return;

  const functionCode = dom.functionEditor.value;
  const testCode = dom.testEditor.value;
  const phaseName = PHASES[state.currentPhase];
  const level = LEVELS[state.currentLevel];

  // Execute code
  const result = executeCode(functionCode, testCode);

  // Render raw test results to console
  let html = "";

  if (!result.success) {
    html += `<p class="result-error">⚠ Syntax/Runtime Error: ${escapeHtml(result.error)}</p>`;
    html += `<p class="result-failure-msg">Fix the error and try again.</p>`;
    dom.consoleOutput.innerHTML = html;
    return;
  }

  if (result.results.length === 0) {
    html += `<p class="result-error">⚠ No tests found. Make sure you use test('name', function() { ... });</p>`;
    dom.consoleOutput.innerHTML = html;
    return;
  }

  result.results.forEach(r => {
    if (r.passed) {
      html += `<p class="result-pass">${escapeHtml(r.name)}</p>`;
    } else {
      html += `<p class="result-fail">${escapeHtml(r.name)}: ${escapeHtml(r.error)}</p>`;
    }
  });

  const passCount = result.results.filter(r => r.passed).length;
  const failCount = result.results.length - passCount;

  html += `<p class="result-summary">${passCount} passed, ${failCount} failed</p>`;

  // Evaluate phase success
  let phaseSuccess = false;

  if (phaseName === "red") {
    // SUCCESS = at least one test FAILS (assertion failure, not runtime error)
    const hasAssertionFailure = result.results.some(r => !r.passed && r.error && !r.error.startsWith("Runtime error"));
    if (hasAssertionFailure) {
      // Bonus check: does the test pass against the CORRECT function?
      const correctResult = executeCode(level.red.correctFunction, testCode);
      const allPassCorrect = correctResult.success && correctResult.results.length > 0 && correctResult.results.every(r => r.passed);
      if (allPassCorrect) {
        phaseSuccess = true;
        html += `<p class="result-success-msg">🔴 Your test FAILED against the buggy code — and it PASSES against a correct implementation. You found the bug!</p>`;
      } else {
        html += `<p class="result-failure-msg">Your test fails, but it also fails against a correct implementation. Write a test based on the specification — what SHOULD the function return?</p>`;
      }
    } else if (failCount === 0) {
      html += `<p class="result-failure-msg">All tests passed! But they shouldn't — the function has a bug. Write a test that catches it.</p>`;
    } else {
      html += `<p class="result-failure-msg">There's an error in your test code. Check the syntax and try again.</p>`;
    }
  } else if (phaseName === "green") {
    // SUCCESS = ALL tests pass
    if (failCount === 0 && passCount > 0) {
      phaseSuccess = true;
      html += `<p class="result-success-msg">🟢 All tests pass! Your fix works!</p>`;
    } else {
      html += `<p class="result-failure-msg">Some tests are still failing. Keep working on the function!</p>`;
    }
  } else if (phaseName === "refactor") {
    // SUCCESS = ALL tests pass AND code is different from original
    const originalCode = level.refactor.functionCode;
    const normalizedOriginal = normalizeCode(originalCode);
    const normalizedCurrent = normalizeCode(functionCode);

    if (failCount === 0 && passCount > 0) {
      if (normalizedCurrent === normalizedOriginal) {
        html += `<p class="result-failure-msg">Tests pass, but you haven't changed the code yet! Refactor it to be cleaner.</p>`;
      } else {
        phaseSuccess = true;
        html += `<p class="result-success-msg">🔵 Tests still pass and the code is cleaner! Great refactoring!</p>`;
      }
    } else {
      html += `<p class="result-failure-msg">⚠ You broke something! Tests are failing. Undo your last change and try a different approach.</p>`;
    }
  }

  dom.consoleOutput.innerHTML = html;

  if (phaseSuccess) {
    onPhaseSuccess();
  }
}

// ─── Phase & Level Progression ──────────────────────────────

function onPhaseSuccess() {
  state.phaseComplete = true;

  // Scoring
  const points = 100;
  state.streak++;
  if (state.streak > state.bestStreak) state.bestStreak = state.streak;
  const streakBonus = state.streak > 1 ? (state.streak - 1) * 25 : 0;
  const totalPoints = points + streakBonus;
  state.score += totalPoints;

  dom.scoreValue.textContent = state.score;
  if (state.streak > 1) {
    dom.streakDisplay.classList.remove("hidden");
    dom.streakValue.textContent = state.streak;
  }

  // Show next button
  dom.nextBtn.classList.remove("hidden");
}

function advancePhase() {
  state.currentPhase++;

  if (state.currentPhase >= PHASES.length) {
    // Level complete
    onLevelComplete();
  } else {
    renderPhase();
  }
}

function onLevelComplete() {
  const level = LEVELS[state.currentLevel];
  dom.levelCompleteTitle.textContent = `✅ Level ${level.id} Complete!`;
  dom.levelCompleteMsg.textContent = `You've conquered "${level.title}" through all three TDD phases.`;
  dom.levelScoreSummary.textContent = `Score: ${state.score} pts | Streak: 🔥 x${state.streak}`;

  if (state.currentLevel >= LEVELS.length - 1) {
    dom.nextLevelBtn.textContent = "See Final Results →";
  } else {
    dom.nextLevelBtn.textContent = "Next Level →";
  }

  dom.overlay.classList.remove("hidden");
}

function advanceLevel() {
  dom.overlay.classList.add("hidden");
  state.currentLevel++;
  state.currentPhase = 0;

  if (state.currentLevel >= LEVELS.length) {
    // Game complete
    showCompleteScreen();
  } else {
    renderPhase();
  }
}

function showCompleteScreen() {
  dom.finalScore.textContent = state.score;
  dom.finalLevels.textContent = LEVELS.length + " / " + LEVELS.length;
  dom.finalStreak.textContent = "🔥 x" + state.bestStreak;
  showScreen(dom.completeScreen);
}

// ─── Hint System ────────────────────────────────────────────

function showHint() {
  const phaseName = PHASES[state.currentPhase];
  const level = LEVELS[state.currentLevel];

  if (phaseName === "red" && level.red.hint) {
    dom.consoleOutput.innerHTML = `<p class="hint-text">💡 Hint: ${escapeHtml(level.red.hint)}</p>`;
    // Penalty for using hint
    state.streak = 0;
    dom.streakDisplay.classList.add("hidden");
  } else if (phaseName === "green") {
    dom.consoleOutput.innerHTML = `<p class="hint-text">💡 Hint: Read the failing test carefully — it tells you exactly what the function should return for a given input. Focus on the simplest change that makes it work.</p>`;
  } else if (phaseName === "refactor") {
    dom.consoleOutput.innerHTML = `<p class="hint-text">💡 Hint: Look for opportunities to use modern JS features: const/let, arrow functions, array methods like .filter(), .map(), .reduce(). Remove unnecessary comments and variables.</p>`;
  }
}

// ─── Utilities ──────────────────────────────────────────────

function normalizeCode(code) {
  // Strip whitespace and comments for comparison
  return code.replace(/\/\/.*$/gm, "").replace(/\/\*[\s\S]*?\*\//g, "").replace(/\s+/g, "").trim();
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

// ─── Tab Key Support in Textareas ───────────────────────────

function handleTab(e) {
  if (e.key === "Tab") {
    e.preventDefault();
    const textarea = e.target;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    textarea.value = textarea.value.substring(0, start) + "  " + textarea.value.substring(end);
    textarea.selectionStart = textarea.selectionEnd = start + 2;
  }
}

// ─── Initialisation ─────────────────────────────────────────

function startGame() {
  state = {
    currentLevel: 0,
    currentPhase: 0,
    score: 0,
    streak: 0,
    bestStreak: 0,
    phaseComplete: false
  };
  showScreen(dom.gameScreen);
  renderPhase();
}

// Event listeners
dom.startBtn.addEventListener("click", startGame);
dom.runBtn.addEventListener("click", handleRun);
dom.hintBtn.addEventListener("click", showHint);
dom.nextBtn.addEventListener("click", advancePhase);
dom.nextLevelBtn.addEventListener("click", advanceLevel);
dom.restartBtn.addEventListener("click", () => {
  showScreen(dom.titleScreen);
});

// Tab support in editors
dom.functionEditor.addEventListener("keydown", handleTab);
dom.testEditor.addEventListener("keydown", handleTab);

// Keyboard shortcut: Ctrl+Enter to run tests
document.addEventListener("keydown", function(e) {
  if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
    if (dom.gameScreen.classList.contains("active")) {
      handleRun();
    }
  }
});
