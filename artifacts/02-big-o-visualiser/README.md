# Artifact 02: Big-O Dojo

## Metadata

| Field                  | Value                                                                  |
| :--------------------- | :--------------------------------------------------------------------- |
| **Artifact ID**        | `02-big-o-visualiser`                                                  |
| **Artifact Name**      | Big-O Dojo                                                             |
| **Learning Objective** | Visualise and compare the time complexity of different algorithms       |
| **Target Module**      | CS4115: Data Structures and Algorithms                                 |
| **Module Coordinator** | _[To be confirmed]_                                                    |
| **Status**             | `developed`                                                            |
| **Deployment URL**     | https://andylegear.github.io/aiDisposableActiveLearning/artifacts/02-big-o-visualiser/src/index.html |
| **Repository URL**     | https://github.com/andylegear/aiDisposableActiveLearning/tree/main/artifacts/02-big-o-visualiser |

---

## 1. Overview

Big-O Dojo is a browser-based educational game that teaches university students **Big-O notation** through five distinct active-learning challenge types. Themed as a martial-arts dojo, students earn belt colours (White → Yellow → Green → Blue → Black) as they progress through 17 rounds across 5 levels.

The game goes beyond passive classification — students **predict growth curves**, **trace nested loops**, **visualise binary trees**, and **watch algorithms race** on animated canvas charts. Every answer is followed by a visual confirmation that makes the abstract concept of asymptotic growth tangible.

### Pedagogical Alignment

| Framework | Alignment |
| :--- | :--- |
| **ICAP** (Chi & Wylie, 2014) | **Interactive/Constructive** — students make predictions (Growth Lab curve placement), analyse code structures (Nested Depths traps), and evaluate competing algorithms (Arena). Goes well beyond passive observation. |
| **Constructionism** (Papert, 1991) | Students build mental models of growth rates by predicting then observing — the animated feedback loop reinforces understanding through cognitive conflict when predictions are wrong. |
| **Bloom's Taxonomy** | *Remember* (recall complexity classes), *Understand* (match code to classes), *Analyse* (decompose nested loops), *Evaluate* (compare competing algorithms) |

### Complexity Classes Covered

O(1), O(log n), O(n), O(n log n), O(n²), O(2ⁿ)

---

## 2. Architecture

### High-Level Design

```
┌─────────────────────────────────────────────────────────────┐
│                       index.html                             │
│  ┌───────────────┐ ┌───────────────┐ ┌──────────────────┐  │
│  │ Overlay        │ │ Game Main     │ │ Bottom Bar       │  │
│  │ (menu, intros, │ │ (split panel) │ │ (answers, action)│  │
│  │ results)       │ │               │ │                  │  │
│  └───────────────┘ └──────┬────────┘ └──────────────────┘  │
│                           │                                  │
│          ┌────────────────┼────────────────┐                 │
│          ▼                ▼                ▼                  │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐        │
│  │ Code Panel    │ │ Viz Panel    │ │ Belt Bar     │        │
│  │ (syntax-hl'd  │ │ (HTML5       │ │ (progress    │        │
│  │ code blocks)  │ │  <canvas>)   │ │  segments)   │        │
│  └──────┬───────┘ └──────┬───────┘ └──────────────┘        │
│         │                │                                   │
│         ▼                ▼                                   │
│  ┌──────────────────────────────────────────┐               │
│  │        game.js — Game Engine              │               │
│  │  ┌────────────────────────────────────┐  │               │
│  │  │  State Machine                      │  │               │
│  │  │  menu → levelIntro → playing →      │  │               │
│  │  │  feedback → levelComplete →         │  │               │
│  │  │  gameComplete                       │  │               │
│  │  ├────────────────────────────────────┤  │               │
│  │  │  5 Level Renderers                  │  │               │
│  │  │  classify · growth_lab ·            │  │               │
│  │  │  nested_depths · log_rhythms ·      │  │               │
│  │  │  arena                              │  │               │
│  │  ├────────────────────────────────────┤  │               │
│  │  │  Canvas Animations                  │  │               │
│  │  │  Ops counter · Curve reveal ·       │  │               │
│  │  │  Tree builder · Race bars           │  │               │
│  │  ├────────────────────────────────────┤  │               │
│  │  │  Timer · Scoring · Streak tracker   │  │               │
│  │  └────────────────────────────────────┘  │               │
│  └──────────────────────────────────────────┘               │
│                      ▲                                       │
│                      │                                       │
│  ┌──────────────────────────────────────────┐               │
│  │    levels.js — Content Data               │               │
│  │  5 levels × 3–4 rounds = 17 total        │               │
│  │  Code snippets, ops functions,            │               │
│  │  answers, explanations, configs           │               │
│  └──────────────────────────────────────────┘               │
│                                                              │
│  ┌──────────────────────────────────────────┐               │
│  │    style.css — Presentation               │               │
│  │  Dark dojo theme, split panel,            │               │
│  │  belt progress, syntax highlighting,      │               │
│  │  canvas styling, responsive layout        │               │
│  └──────────────────────────────────────────┘               │
└─────────────────────────────────────────────────────────────┘
```

### Design Decisions

| Decision | Rationale |
| :--- | :--- |
| **Zero dependencies** | Maximises disposability — no `npm install`, no build step, no version rot. A single directory of static files. |
| **HTML5 `<canvas>` for all visualisations** | Avoids charting libraries (Chart.js, D3) — keeps the zero-dependency constraint. All growth curves, trees, and race bars rendered via Canvas 2D API. |
| **Split-panel layout** | Code on the left, visualisation on the right mirrors the developer workflow of "read code → see results". Responsive: stacks vertically on mobile. |
| **Content separated from engine** | `levels.js` is pure data — adding a new level/round requires no engine changes. Each round provides its own `ops(n)` function for accurate visualisation. |
| **Regex-based syntax highlighting** | Avoids CodeMirror/Prism dependency. Covers keywords, strings, numbers, comments — sufficient for the short snippets shown. |
| **Belt-based progression** | Martial-arts metaphor provides motivational scaffolding and a clear sense of advancement. Each level = one belt earned. |

---

## 3. Game Content

### Level Overview

| Level | Name | Belt | Type | Rounds | Mechanic |
| :---: | :--- | :--- | :--- | :----: | :------- |
| 1 | Classify | White | `classify` | 4 | Timed code → complexity class selection |
| 2 | Growth Lab | Yellow | `growth_lab` | 3 | Click-to-predict growth curves on canvas |
| 3 | Nested Depths | Green | `nested_depths` | 4 | Analyse nested/sequential loops (with traps) |
| 4 | Log Rhythms | Blue | `log_rhythms` | 3 | Logarithmic patterns + binary tree visualisation |
| 5 | The Arena | Black | `arena` | 3 | Head-to-head algorithm race animations |

### Round Detail

#### Level 1: Classify (White Belt)

| Round | Code Pattern | Answer | Key Insight |
| :---: | :--- | :--- | :--- |
| 1 | `arr[0]` — direct index access | O(1) | No loops = constant time |
| 2 | Single `for` loop summing array | O(n) | One pass = linear |
| 3 | Nested loops checking all pairs | O(n²) | n × n iterations |
| 4 | Binary search with halving | O(log n) | Halving = logarithmic |

#### Level 2: Growth Lab (Yellow Belt)

| Round | Challenge | Target Class |
| :---: | :--- | :--- |
| 1 | Draw the growth curve for O(n) | O(n) — straight line |
| 2 | Draw the growth curve for O(n²) | O(n²) — steep upward curve |
| 3 | Draw the growth curve for O(log n) | O(log n) — flattening curve |

#### Level 3: Nested Depths (Green Belt)

| Round | Code Pattern | Answer | Trap? |
| :---: | :--- | :--- | :---: |
| 1 | Two nested loops, both 0 to n | O(n²) | No |
| 2 | Two sequential (not nested) loops | O(n) | Yes — looks like O(2n) but constants drop |
| 3 | Outer loop n, inner loop runs exactly 5 times | O(n) | **Yes** — inner bound is constant |
| 4 | Triangle pattern: inner loop `j ≤ i` | O(n²) | Yes — 1+2+…+n = n(n+1)/2 |

#### Level 4: Log Rhythms (Blue Belt)

| Round | Code Pattern | Answer | Visualisation |
| :---: | :--- | :--- | :--- |
| 1 | While-loop halving n | O(log n) | Binary tree (depth only) |
| 2 | Divide-and-conquer with O(n) work per level | O(n log n) | Tree + work-per-level bars |
| 3 | Exponentiation by squaring | O(log n) | Binary tree (depth only) |

#### Level 5: The Arena (Black Belt)

| Round | Algorithm A | Algorithm B | Winner | Ratio at large n |
| :---: | :--- | :--- | :---: | :--- |
| 1 | Linear Search O(n) | Binary Search O(log n) | B | ~100× at n=1000 |
| 2 | Bubble Sort O(n²) | Merge Sort O(n log n) | B | ~100× at n=1000 |
| 3 | Brute-Force Pair Sum O(n²) | Hash-Map Pair Sum O(n) | B | ~500× at n=1000 |

---

## 4. Game Mechanics

### Scoring System

| Component | Value |
| :--- | :--- |
| Base points (correct) | 100 |
| Time bonus (classify/nested/log) | Up to 50 (proportional to remaining time) |
| Streak ×2 multiplier | After 3 consecutive correct |
| Streak ×3 multiplier | After 5 consecutive correct |
| Incorrect answer | 0 points, streak reset |
| Growth Lab scoring | 0–100 based on prediction accuracy |

### Timer

- **15 seconds** per round for Classify, Nested Depths, and Log Rhythms levels.
- Visual countdown with urgent (red pulsing) animation at ≤5 seconds.
- Time expiry counts as an incorrect answer.
- Growth Lab and Arena have no timer.

### Canvas Visualisations

| Level Type | Visualisation | Description |
| :--- | :--- | :--- |
| Classify / Nested Depths | **Ops Counter** | Animated bar chart showing operation counts at n = 10, 50, 100, 500. Bars grow sequentially with easing. |
| Growth Lab | **Curve Prediction** | Coordinate chart with guide lines. Student clicks to place points. Actual curve draws progressively after submission. |
| Log Rhythms | **Binary Tree** | Animated tree building level-by-level, showing node count halving. Optional work-per-level bars for O(n log n). |
| Arena | **Algorithm Race** | Two horizontal bars growing at each algorithm's ops rate as n increases from 1 to max. Winner announced with trophy. |

### Syntax Highlighting

All code snippets are syntax-highlighted with a dark-theme palette:

| Token | Colour | Example |
| :--- | :--- | :--- |
| Keywords | Purple `#c792ea` | `function`, `for`, `return` |
| Strings | Green `#c3e88d` | `'hello'` |
| Numbers | Orange `#f78c6c` | `42`, `0.5` |
| Built-ins | Blue `#82aaff` | `Math`, `console` |
| Comments | Grey `#546e7a` | `// note` |

### Complexity Class Colour Coding

| Class | Colour | Usage |
| :--- | :--- | :--- |
| O(1) | Green `#00e676` | Button border, bar fill, curve colour |
| O(log n) | Blue `#448aff` | |
| O(n) | Yellow `#ffea00` | |
| O(n log n) | Orange `#ff9100` | |
| O(n²) | Red `#ff1744` | |
| O(2ⁿ) | Purple `#d500f9` | |

### Keyboard & Input

- All interaction is mouse/touch-based (button clicks and canvas clicks).
- No keyboard shortcuts required — optimised for classroom projector use.

---

## 5. Files

| File | Lines | Purpose |
| :--- | ----: | :--- |
| `index.html` | 66 | Single-page HTML structure — header, split-panel main, footer, overlay |
| `style.css` | 496 | Dark dojo theme, split-panel layout, belt bar, syntax colours, responsive |
| `levels.js` | 402 | All 17 rounds of data: code snippets, answers, `ops()` functions, explanations |
| `game.js` | 982 | Game engine: state machine, 5 level renderers, canvas animations, scoring |
| **Total** | **1,946** | |

### Dependency Graph

```
index.html
  ├── style.css        (no dependencies)
  ├── levels.js        (no dependencies — pure data + functions)
  └── game.js          (reads from levels.js globals: LEVELS, BELT_INFO,
                         COMPLEXITY_COLORS, COMPLEXITY_OPTIONS)
```

All four files are self-contained. No external libraries, CDN links, or build tools.

---

## 6. Requirements

### Runtime

- Any modern web browser with HTML5 Canvas support
- No web server required — opens directly from the file system (`file://`)

### Development

- A text editor (VS Code recommended)
- No build step, no `npm install`, no transpilation

### Browser API Dependencies

| API | Usage |
| :--- | :--- |
| `CanvasRenderingContext2D` | All visualisations (charts, trees, race bars) |
| `requestAnimationFrame` | Smooth animations (60fps feedback sequences) |
| `setInterval` | Countdown timer |
| `performance.now()` | Animation timing |
| `window.devicePixelRatio` | Hi-DPI canvas scaling |
| `getBoundingClientRect()` | Click-to-canvas coordinate mapping |

### Browser Compatibility

| Browser | Minimum Version |
| :--- | :--- |
| Chrome | 60+ |
| Firefox | 55+ |
| Safari | 12+ |
| Edge | 79+ (Chromium) |

---

## 7. Testing

### Manual Test Matrix

| # | Test Case | Level | Steps | Expected Result | Status |
| :-: | :--- | :---: | :--- | :--- | :---: |
| 1 | Menu loads | — | Open `index.html` | Overlay with "Enter the Dojo" button | ✅ |
| 2 | Start game | — | Click "Enter the Dojo" | Level 1 intro overlay appears | ✅ |
| 3 | Classify correct answer | 1 | Select correct O() class | Green highlight, +points, ops counter animation | ✅ |
| 4 | Classify wrong answer | 1 | Select wrong O() class | Red highlight, correct answer revealed, explanation shown | ✅ |
| 5 | Timer expiry | 1 | Wait 15 seconds | "Time's up!" feedback, no points | ✅ |
| 6 | Timer urgent state | 1 | Wait until ≤5 seconds | Timer turns red and pulses | ✅ |
| 7 | Streak multiplier ×2 | 1 | Get 3 consecutive correct | "×2" badge appears, points doubled | ✅ |
| 8 | Growth Lab click placement | 2 | Click at guide lines | Points placed at click Y position on chart | ✅ |
| 9 | Growth Lab curve reveal | 2 | Place all prediction points | Actual curve draws progressively, accuracy shown | ✅ |
| 10 | Nested Depths trap question | 3 | Answer inner-loop-constant-5 round | Correct answer is O(n); explanation mentions constant inner bound | ✅ |
| 11 | Step counter animation | 3 | Answer any round | Bar chart shows ops at n=10, 50, 100, 500 | ✅ |
| 12 | Tree visualisation | 4 | Answer any round | Binary tree builds level-by-level | ✅ |
| 13 | Work-per-level bars | 4 | Answer O(n log n) round | Orange bars appear beside each tree level | ✅ |
| 14 | Arena race animation | 5 | Choose faster algorithm | Two bars race, winner announced with trophy | ✅ |
| 15 | Arena wrong prediction | 5 | Choose slower algorithm | Red highlight on choice, correct winner still announced | ✅ |
| 16 | Belt progression | All | Complete each level | Belt bar fills, belt name changes colour | ✅ |
| 17 | Level complete screen | All | Finish all rounds in a level | Stats shown, belt earned animation | ✅ |
| 18 | Game complete screen | All | Finish all 5 levels | Final score, all belts shown, "Play Again" button | ✅ |
| 19 | Play again | — | Click "Play Again" | Score resets, menu reappears | ✅ |
| 20 | Responsive layout | — | Resize browser to <800px | Panels stack vertically | ✅ |

### Bugs Found & Fixed

| # | Level | Description | Fix | Status |
| :-: | :---: | :--- | :--- | :---: |
| 1 | 2 | Growth Lab clicks always recorded y=0 due to canvas bounding-rect vs CSS style size mismatch | Scaled clickY by `style.height / rect.height` ratio | ✅ Fixed |

### Known Limitations

- Regex-based syntax highlighting may occasionally miscolour tokens in edge cases (e.g., regex literals inside strings).
- Growth Lab scoring uses a simple distance metric — very steep curves (O(n²)) can be harder to predict accurately.
- The tree visualisation caps visible nodes at 16 per level to prevent overcrowding.

---

## 8. Deployment

### GitHub Pages (Recommended)

1. Push the `src/` directory contents to a repository's `main` branch
2. Go to **Settings → Pages → Source** → select `main` branch, `/ (root)` folder
3. Access at `https://<username>.github.io/<repo>/`

### Local

Simply open `src/index.html` in any modern browser. No web server is required — all paths are relative.

---

## 9. Development Log

### Session 1 — 2026-02-18

- **Duration:** 36 minutes (wall-clock) · 8 mins active editor time (WakaTime)
- **AI Tool(s) Used:** GitHub Copilot with Claude Opus 4.6
- **Prompts:** 2
- **Prompt Strategy:** Collaborative design then full implementation — asked AI to design a game concept for teaching Big-O notation, producing a detailed implementation brief. Then fed that brief back to the AI to implement the complete game in a single prompt.
- **Outcome:** Complete working game: 4 source files, 1,946 lines, zero dependencies. Five level types with distinct mechanics and canvas visualisations.
- **Observations:** AI produced the entire game engine including 5 distinct canvas visualisation types from a single detailed prompt. The two-stage prompt strategy (design brief → implementation) was effective — the detailed specification from step 1 allowed step 2 to focus entirely on code generation.

### Testing

- **Round 1:** 1 bug found — Growth Lab click coordinates always mapped to y=0. Root cause: canvas `getBoundingClientRect()` size differed from CSS `style.height` due to flex layout stretching. Fixed by scaling click coordinates.
- **Round 2:** Bug fix verified. Full regression pass — all 5 levels, all 17 rounds, all animations working correctly.

---

## 10. DSQI Metrics

The Disposable Software Quality Index (DSQI) is the study's primary evaluation metric. It combines four sub-scores:

$$\text{DSQI} = w_1(1-M) + w_2(1-C) + w_3 P + w_4 E$$

with weights $w_1 = 0.3$, $w_2 = 0.2$, $w_3 = 0.3$, $w_4 = 0.2$.

### Raw Metrics

| Metric | Component | Value |
| :----- | :-------- | :---- |
| M₁: Dependency count | Maintenance | 0 (normalised: 0.000) |
| M₂: Cyclomatic complexity avg | Maintenance | 1.18 (normalised: 0.079) |
| M₃: Deployment steps | Maintenance | 3 (normalised: 0.300) |
| C₁: Lines of code (cloc) | Creation | 1,603 code / 158 comment / 185 blank |
| C₂: AI generation ratio | Creation | 1.0 (100% AI-generated) |
| C₃: Development time | Creation | 36 min wall-clock (normalised: 0.075) |

### Sub-Scores

| Sub-Score | Value | Meaning |
| :-------- | :---- | :------ |
| **M** (Maintenance Cost) | 0.1262 | → (1 − M) = **0.8738** |
| **C** (Creation Cost) | 0.1319 | → (1 − C) = **0.8681** |
| **P** (Pedagogical Alignment) | _awaiting review_ | Module coordinator evaluation |
| **E** (Pedagogical Purity) | _awaiting review_ | Expert panel evaluation |

### Partial DSQI

$$\text{DSQI} = 0.3 \times 0.8738 + 0.2 \times 0.8681 + 0.3P + 0.2E = 0.4358 + 0.3P + 0.2E$$

Full DSQI score will be computed once P and E evaluations are complete.

### WakaTime Session Data

| Metric | Value |
| :----- | :---- |
| WakaTime active time | 8 mins (530.7s) |
| WakaTime % of wall-clock | 24.6% |
| Machine | Andy-LeGearXPS |
| Editor | VS Code |

> **Methodological note:** WakaTime captures only editor-active time (~25% of wall-clock). The majority of session time was spent in the Copilot chat panel (designing prompts, reviewing output, discussing fixes) — which WakaTime does not track.

---

## 11. Technical Summary

| Metric | Value |
| :----- | :---- |
| **Tech Stack** | HTML, CSS, JavaScript (zero dependencies) |
| **Total Lines** | 1,946 (code: 1,603 · comments: 158 · blank: 185) |
| **AI Generation Ratio** | 1.0 (100% AI-generated) |
| **External Dependencies** | 0 |
| **Build Step Required** | No |
| **Deployment Method** | GitHub Pages (static files) |
| **Session Duration** | 36 min wall-clock · 8 min WakaTime active |
| **Prompts to AI** | 2 |
| **Bugs Found in Testing** | 1 (fixed) |
| **Cyclomatic Complexity** | avg 1.18 · max 2 |
| **DSQI M score** | 0.1262 |
| **DSQI C score** | 0.1319 |
| **DSQI (partial)** | 0.4358 + 0.3P + 0.2E |
| **Canvas Visualisations** | 4 types (ops counter, curve chart, binary tree, race bars) |
| **Total Rounds** | 17 across 5 levels |
| **Complexity Classes** | O(1), O(log n), O(n), O(n log n), O(n²) |
