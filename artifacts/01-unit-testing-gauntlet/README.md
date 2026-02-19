# Artifact 01: The Unit Testing Gauntlet

## Metadata

| Field                  | Value                                                      |
| :--------------------- | :--------------------------------------------------------- |
| **Artifact ID**        | `01-unit-testing-gauntlet`                                 |
| **Artifact Name**      | The Unit Testing Gauntlet                                  |
| **Learning Objective** | Understand the Red-Green-Refactor cycle of TDD             |
| **Target Module**      | CS5703: Software Quality                                   |
| **Module Coordinator** | _[To be confirmed]_                                        |
| **Status**             | `developed`                                                |
| **Deployment URL**     | _[To be added after deployment]_                           |
| **Repository URL**     | _[To be added after creation]_                             |

---

## 1. Overview

The Unit Testing Gauntlet is a browser-based educational game that teaches students the **Red-Green-Refactor** cycle of Test-Driven Development (TDD). Students progress through five levels of increasing difficulty, and at each level they complete all three TDD phases:

1. **🔴 RED** — Write a test that *fails* against buggy code (proving the bug exists)
2. **🟢 GREEN** — Fix the function so all tests *pass* (minimum viable fix)
3. **🔵 REFACTOR** — Clean up the working code without breaking any tests

The game reinforces the TDD discipline through repetition: by the end, students have practised the full cycle five times across different programming problems.

### Pedagogical Alignment

| Framework | Alignment |
| :--- | :--- |
| **ICAP** (Chi & Wylie, 2014) | **Interactive/Constructive** — students write original test cases and modify code, going beyond passive observation |
| **Constructionism** (Papert, 1991) | Students learn by building (tests and fixes) rather than by reading about testing |
| **Bloom's Taxonomy** | Levels target *Apply* (write tests), *Analyse* (find bugs), and *Evaluate* (judge refactoring quality) |

---

## 2. Architecture

### High-Level Design

```
┌──────────────────────────────────────────────────────┐
│                    index.html                         │
│  ┌─────────────┐ ┌─────────────┐ ┌───────────────┐  │
│  │ Title Screen │ │ Game Screen │ │ Complete Screen│  │
│  └─────────────┘ └──────┬──────┘ └───────────────┘  │
│                         │                             │
│         ┌───────────────┼───────────────┐             │
│         ▼               ▼               ▼             │
│  ┌────────────┐ ┌─────────────┐ ┌────────────┐      │
│  │  Function   │ │   Test      │ │  Console   │      │
│  │  Editor     │ │   Editor    │ │  Output    │      │
│  │ (textarea)  │ │ (textarea)  │ │  (div)     │      │
│  └──────┬──────┘ └──────┬──────┘ └────────────┘      │
│         │               │                             │
│         ▼               ▼                             │
│  ┌──────────────────────────────┐                     │
│  │   game.js — Game Engine      │                     │
│  │  ┌────────────────────────┐  │                     │
│  │  │ Sandboxed Test Runner  │  │                     │
│  │  │ (new Function())       │  │                     │
│  │  ├────────────────────────┤  │                     │
│  │  │ Mini Test Framework    │  │                     │
│  │  │ expect() / test()      │  │                     │
│  │  ├────────────────────────┤  │                     │
│  │  │ State Machine          │  │                     │
│  │  │ Phase → Phase → Level  │  │                     │
│  │  ├────────────────────────┤  │                     │
│  │  │ Scoring & Streak       │  │                     │
│  │  └────────────────────────┘  │                     │
│  └──────────────────────────────┘                     │
│                  ▲                                     │
│                  │                                     │
│  ┌──────────────────────────────┐                     │
│  │   levels.js — Content Data   │                     │
│  │  5 levels × 3 phases = 15    │                     │
│  │  challenge configurations    │                     │
│  └──────────────────────────────┘                     │
│                                                       │
│  ┌──────────────────────────────┐                     │
│  │   style.css — Presentation   │                     │
│  │  Dark theme, phase colours,  │                     │
│  │  responsive layout           │                     │
│  └──────────────────────────────┘                     │
└──────────────────────────────────────────────────────┘
```

### Design Decisions

| Decision | Rationale |
| :--- | :--- |
| **Zero dependencies** | Maximises disposability — no `npm install`, no build step, no version rot |
| **`new Function()` sandbox** | Isolates student code execution from the game engine; prevents global scope pollution |
| **Textarea editors (not CodeMirror)** | Avoids external dependency; sufficient for short code snippets; students focus on logic, not IDE features |
| **Content separated from engine** | `levels.js` is pure data; adding a new level requires no engine changes |
| **CSS custom properties for phases** | Phase colours (red/green/blue) cascade from a single source; changing a phase's look requires editing one variable |

---

## 3. Game Content — Levels

| Level | Title | Topic | Bug (RED phase) | Difficulty |
| :---: | :--- | :--- | :--- | :---: |
| 1 | Sum of Positives | Basic Arithmetic | Sums all numbers instead of only positives | ★☆☆☆☆ |
| 2 | Capitalize Words | String Manipulation | Capitalises only the first word, not every word | ★★☆☆☆ |
| 3 | Remove Duplicates | Array Processing | Fails on non-consecutive duplicates | ★★★☆☆ |
| 4 | FizzBuzz | Conditional Logic | Missing Fizz condition (only returns Buzz and FizzBuzz) | ★★★★☆ |
| 5 | Palindrome Checker | Boss Round | Doesn't handle mixed case or spaces | ★★★★★ |

Each level provides:
- A **buggy function** (RED phase) with a `correctFunction` for validation
- A **starter test template** with hints
- A **pre-written test suite** (GREEN phase) that the buggy function fails
- A **working-but-messy function** (REFACTOR phase) for students to clean up

---

## 4. Game Mechanics

### Scoring

| Event | Points |
| :--- | :--- |
| Phase completed | +100 |
| Streak bonus (consecutive phases without hints) | +(streak − 1) × 25 |
| Hint used | Streak reset to 0 |

### RED Phase Validation Logic

The RED phase uses a two-step validation to ensure students write *meaningful* tests:

1. Student's test must **fail** against the **buggy** function (proves the test detects the bug)
2. Student's test must **pass** against a hidden **correct** function (proves the test is based on the spec, not just broken)

This prevents students from writing trivially wrong tests (e.g., `expect(1).toBe(2)`).

### REFACTOR Phase Validation Logic

1. All tests must **pass** (code still works)
2. Code must be **different** from the original (whitespace-normalised comparison)

### Mini Test Framework

The game injects a lightweight test framework into the sandbox that provides:

| Function | Description |
| :--- | :--- |
| `test(name, fn)` | Registers and runs a test case |
| `expect(actual).toBe(expected)` | Strict equality (`===`) |
| `expect(actual).toEqual(expected)` | Deep equality (JSON comparison) |
| `expect(actual).toBeTruthy()` | Truthiness check |
| `expect(actual).toBeFalsy()` | Falsiness check |
| `expect(actual).toContain(item)` | Array/string inclusion |
| `expect(actual).toHaveLength(n)` | Length check |

This API mirrors a subset of Jest/Jasmine, so students learn transferable syntax.

### Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| `Ctrl+Enter` / `⌘+Enter` | Run tests |
| `Tab` | Insert 2-space indent (overrides default tab behaviour) |

---

## 5. Files

All source files are in `src/`:

| File | Lines | Language | Role |
| :--- | ----: | :--- | :--- |
| `index.html` | 110 | HTML | Three screens (title, game, complete), game layout with header/panels/controls/console |
| `style.css` | 448 | CSS | Dark theme, CSS custom properties for TDD phase colours, responsive breakpoints, glow effects |
| `levels.js` | 536 | JavaScript | Pure data: 5 levels × 3 phases = 15 challenge configurations, each with code strings and test suites |
| `game.js` | 399 | JavaScript | Engine: sandboxed test runner, mini test framework, game state machine, UI rendering, scoring, event handling |
| **Total** | **1493** | | |

### File Dependency Graph

```
index.html
  ├── style.css        (linked via <link>)
  ├── levels.js        (loaded first via <script>, defines LEVELS array)
  └── game.js          (loaded second via <script>, reads LEVELS, binds UI)
```

No circular dependencies. `levels.js` has no imports — it only defines a global `LEVELS` constant. `game.js` reads `LEVELS` and the DOM; it has no exports.

---

## 6. Requirements

### Runtime Requirements

| Requirement | Detail |
| :--- | :--- |
| **Browser** | Any modern browser: Chrome 60+, Firefox 55+, Safari 12+, Edge 79+ |
| **JavaScript** | ES6 (template literals, `let`/`const`, arrow functions, `.map()`, `.filter()`) |
| **Network** | Not required — all files are local, no API calls |
| **Backend** | None — fully client-side |

### Development Requirements

| Requirement | Detail |
| :--- | :--- |
| **Build tools** | None — no transpilation, bundling, or compilation required |
| **Package manager** | None — no `node_modules`, no `package.json` in artifact |
| **Dependencies** | 0 external libraries |

### Browser APIs Used

| API | Purpose |
| :--- | :--- |
| `new Function()` | Sandboxed code execution for test runner |
| `document.querySelector()` | DOM manipulation |
| `addEventListener()` | User interaction (click, keydown) |
| `JSON.stringify()` | Deep equality comparison in `toEqual()` |

---

## 7. Testing

### Manual Testing Performed

The artifact was tested manually after development to verify all gameplay paths:

| Test | Expected | Result |
| :--- | :--- | :--- |
| Title screen → Start button | Game screen loads, Level 1 RED phase displayed | ✅ Pass |
| RED: write a failing test with correct logic | Console shows "Your test FAILED against buggy code" + passes correct impl | ✅ Pass |
| RED: write a trivially wrong test | Console shows "fails against correct implementation too" rejection | ✅ Pass |
| RED: all tests pass (no bug caught) | Console shows "All tests passed! But they shouldn't" | ✅ Pass |
| GREEN: fix the function so all tests pass | Console shows "All tests pass! Your fix works!" | ✅ Pass |
| GREEN: partial fix (some tests still fail) | Console shows "Some tests are still failing" | ✅ Pass |
| REFACTOR: change code, all tests pass | Console shows "Tests still pass and the code is cleaner!" | ✅ Pass |
| REFACTOR: change code, break tests | Console shows "You broke something!" | ✅ Pass |
| REFACTOR: don't change code | Console shows "you haven't changed the code yet" | ✅ Pass |
| Complete all 5 levels | Completion screen with final score, levels, best streak | ✅ Pass |
| Hint button | Hint displayed, streak reset to 0 | ✅ Pass |
| Ctrl+Enter shortcut | Tests run | ✅ Pass |
| Tab key in editor | 2-space indent inserted | ✅ Pass |
| Play Again button | Returns to title screen, state reset | ✅ Pass |

### Automated Testing

No automated test suite exists for the game itself. The game **is** a testing tool — it validates student code in real time using its own sandboxed test runner. The correctness of each level's test suite and validation logic was verified through the manual testing above.

### Known Limitations

- The `new Function()` sandbox does not provide full isolation — a deliberately malicious student could potentially access `window`. This is acceptable for an educational tool, not a production security boundary.
- The code comparison in the REFACTOR phase (whitespace-normalised string comparison) is a blunt heuristic. It detects *any* change, but cannot judge whether the refactoring is genuinely better.
- The textarea editors lack syntax highlighting. This is a deliberate trade-off against adding a dependency (e.g., CodeMirror).

---

## 8. Deployment

### Method: GitHub Pages (Static Site)

The artifact is a static website (HTML + CSS + JS) with no build step. It can be deployed directly to GitHub Pages.

#### Steps

1. **Create a GitHub repository** (or use an existing one):
   ```bash
   cd artifacts/01-unit-testing-gauntlet/src
   git init
   git remote add origin https://github.com/<username>/unit-testing-gauntlet.git
   ```

2. **Push the source files:**
   ```bash
   git add .
   git commit -m "Initial deployment"
   git push -u origin main
   ```

3. **Enable GitHub Pages:**
   - Go to **Settings → Pages** in the repository
   - Under **Source**, select **Deploy from a branch**
   - Branch: `main`, Folder: `/ (root)`
   - Click **Save**

4. **Access the live URL:**
   ```
   https://<username>.github.io/unit-testing-gauntlet/
   ```

5. **Update the registry:**
   - Set `deployment_url` in `data/artifact-registry.json`
   - Set `repository_url` in `data/artifact-registry.json`

#### Alternative: Local Use

For classroom use without deployment, simply open `src/index.html` in any browser:

```bash
start src/index.html          # Windows
open src/index.html           # macOS
xdg-open src/index.html       # Linux
```

No web server is required — all paths are relative.

---

## 9. Development Log

### Session 1 — 2026-02-18
- **Duration:** 19 minutes (WakaTime active: 4 min 24 sec)
- **AI Tool(s) Used:** GitHub Copilot with Claude Opus 4.6
- **Prompts:** 2
- **Prompt Strategy:** Collaborative design then full implementation — asked AI to design a browser-based TDD game concept, then implement it entirely in a single follow-up prompt.
- **Outcome:** Complete working game: 4 source files, 1493 lines, zero dependencies.
- **Observations:** AI produced full game architecture from a single high-level prompt. Second prompt generated all source files with in-browser test execution sandbox, scoring/streak system, and 5 levels.

### Methodological Note

WakaTime captured only ~23% of wall-clock development time (264s of ~1140s). This is because WakaTime tracks active editor interaction but cannot observe the chat pane where the primary human–AI dialogue occurs. The AI agent wrote files directly to disk, bypassing editor interaction. Wall-clock time is the more honest total measure; WakaTime represents the human's review and inspection time.

---

## 10. DSQI Metrics (Automated)

Collected automatically by `dsqi_collect.py` on 2026-02-18. Full data in `data/evaluations/layer1-dsqi/dsqi-01-unit-testing-gauntlet.json`.

### Maintenance Cost (M)

| Sub-Metric | Raw Value | Normalised | Threshold |
| :--------- | --------: | ---------: | --------: |
| **M₁** Dependency Count | 0 | 0.0000 | 20 |
| **M₂** Cyclomatic Complexity (avg) | 4.07 | 0.2713 | 15 |
| **M₃** Deployment Steps | 3 | 0.3000 | 10 |
| **M (composite)** | | **0.1904** | |

### Creation Cost (C)

| Sub-Metric | Raw Value | Normalised | Threshold |
| :--------- | --------: | ---------: | --------: |
| **C₁** Lines of Code (cloc) | 1,396 | 0.2792 | 5,000 |
| **C₂** Development Time | 19 min | 0.0396 | 480 min |
| **C₃** AI Generation Ratio | 1.0 (100%) | 0.0000* | — |
| **C (composite)** | | **0.1063** | |

\*C₃ is inverted: high AI ratio → low human effort → lower C score.

### Pedagogical Alignment (P) & Purity (E)

Awaiting human evaluators (module coordinator review for P; expert review for E).

### Partial DSQI

```
DSQI = 0.3×(1−M) + 0.2×(1−C) + 0.3×P + 0.2×E
     = 0.3×0.8096 + 0.2×0.8937 + 0.3×P + 0.2×E
     = 0.4216 + 0.3×P + 0.2×E
```

### Complexity Breakdown

| File | Functions | Avg CC | Max CC |
| :--- | --------: | -----: | -----: |
| game.js | 12 | 4.1 | 21 |
| levels.js | 1 | 4.0 | 4 |

### cloc Summary

| Language | Files | Code | Comment | Blank |
| :------- | ----: | ---: | ------: | ----: |
| JavaScript | 2 | 868 | 67 | 94 |
| CSS | 1 | 427 | 21 | 52 |
| HTML | 1 | 101 | 9 | 11 |
| **Total** | **4** | **1,396** | **97** | **157** |

---

## 11. Technical Summary

| Metric | Value |
| :----- | :---- |
| **Tech Stack** | HTML, CSS, JavaScript (zero dependencies) |
| **Lines of Code** | 1,493 |
| **AI Generation Ratio** | 1.0 (100% AI-generated) |
| **External Dependencies** | 0 |
| **Build Step Required** | No |
| **Deployment Method** | GitHub Pages (static files) |
| **Browser Support** | Chrome 60+, Firefox 55+, Safari 12+, Edge 79+ |
| **Total Development Time** | ~19 minutes wall-clock |
| **WakaTime Active Time** | 4 min 24 sec |
| **Prompts to AI** | 2 |
