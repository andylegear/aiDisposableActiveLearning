# Artifact 04: Flexbox Forge

## Metadata

| Field                  | Value                                                                  |
| :--------------------- | :--------------------------------------------------------------------- |
| **Artifact ID**        | `04-css-flexbox-trainer`                                               |
| **Artifact Name**      | Flexbox Forge                                                          |
| **Learning Objective** | Master CSS Flexbox properties for layout design                        |
| **Target Module**      | CE4026: Web Development                                                |
| **Module Coordinator** | _[To be confirmed]_                                                    |
| **Status**             | `developed`                                                            |
| **Deployment URL**     | _[To be added after deployment]_                                       |
| **Repository URL**     | _[To be added after creation]_                                         |

---

## 1. Overview

Flexbox Forge is a browser-based training game that teaches university students **CSS Flexbox** through 10 progressive levels. Students write real CSS in a syntax-highlighted editor, see instant visual feedback via a split-screen target vs preview comparison, and advance by matching a target layout. Each level introduces a new Flexbox property.

The game uses a dark forge/workshop aesthetic with a CodeMirror-powered CSS editor, iframe-isolated preview panels, property reference chips, progressive hints, and a percentage-based match bar.

### Pedagogical Alignment

| Framework | Alignment |
| :--- | :--- |
| **ICAP** (Chi & Wylie, 2014) | **Constructive/Interactive** — students write real CSS (constructive), observe instant layout changes (active), and iterate towards a target (interactive). The real-time preview creates a tight feedback loop between code and visual output. |
| **Constructionism** (Papert, 1991) | Students construct understanding of Flexbox by building layouts — writing CSS properties and immediately seeing their spatial effects creates direct manipulation of abstract concepts. |
| **Bloom's Taxonomy** | *Remember* (recall property names), *Understand* (how properties affect layout), *Apply* (write correct CSS to achieve a layout), *Analyse* (why items behave differently on main vs cross axis), *Evaluate* (choose between properties for a given goal), *Create* (Level 10 capstone: combine all properties for a page layout) |

### Flexbox Properties Covered

| Level | Property | Concept |
| :---: | :--- | :--- |
| 1 | `display: flex` | Activating flex context |
| 2 | `flex-direction` | Main axis direction |
| 3 | `justify-content` | Main axis alignment |
| 4 | `align-items` | Cross axis alignment |
| 5 | `flex-wrap` | Multi-line containers |
| 6 | `gap` | Spacing between items |
| 7 | `flex-grow` | Distributing remaining space |
| 8 | `align-self` | Per-item cross axis override |
| 9 | `order` | Visual reordering |
| 10 | Combined | Capstone: navbar + content + sidebar |

---

## 2. Architecture

### High-Level Design

```
┌──────────────────────────────────────────────────────────────┐
│                        index.html                             │
│  CDN: CodeMirror 5 (CSS mode + material-darker theme)         │
│  CDN: highlight.js (xml mode + atom-one-dark theme)           │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ Top Bar: Level Name · Progress (N/10) · Score          │  │
│  ├────────────────────┬───────────────────────────────────┤  │
│  │    Left Column     │        Right Column               │  │
│  │                    │                                    │  │
│  │  📄 HTML Viewer   │  🎯 Target (iframe srcdoc)        │  │
│  │  (highlight.js)    │     dashed border                 │  │
│  │                    │                                    │  │
│  │  ✏️ CSS Editor    │  👁️ Preview (iframe srcdoc)       │  │
│  │  (CodeMirror 5)    │     solid border → green on match │  │
│  │                    │     Match Bar (0–100%)            │  │
│  │  📖 Reference     │                                    │  │
│  │  Chips (clickable) │  📝 Explanation                   │  │
│  │                    │     (shown after completion)       │  │
│  │  💡 Hints         │                                    │  │
│  │  (progressive)     │                                    │  │
│  └────────────────────┴───────────────────────────────────┘  │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  Overlay (menu, level intros, level complete, final)   │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐  │
│  │                      game.js                            │  │
│  │  ┌──────────────────────────────────────────────────┐  │  │
│  │  │  State Machine                                    │  │  │
│  │  │  menu → levelIntro → playing →                    │  │  │
│  │  │  levelComplete → gameComplete                     │  │  │
│  │  ├──────────────────────────────────────────────────┤  │  │
│  │  │  10 Level Definitions                             │  │  │
│  │  │  Each with: html, starterCSS, targetCSS,          │  │  │
│  │  │  checkProperties, referenceChips, hints,           │  │  │
│  │  │  explanation                                       │  │  │
│  │  ├──────────────────────────────────────────────────┤  │  │
│  │  │  Simple Regex CSS Parser                          │  │  │
│  │  │  selector { prop: value } → object map            │  │  │
│  │  ├──────────────────────────────────────────────────┤  │  │
│  │  │  Iframe Srcdoc Renderer (target + preview)        │  │  │
│  │  ├──────────────────────────────────────────────────┤  │  │
│  │  │  CodeMirror Integration · Match Checker ·          │  │  │
│  │  │  Scoring · Hints · Overlay System                  │  │  │
│  │  └──────────────────────────────────────────────────┘  │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐  │
│  │    style.css — Presentation                             │  │
│  │  Dark forge theme, CSS Grid 2-column layout,            │  │
│  │  CodeMirror/highlight.js overrides, chip/hint styling,  │  │
│  │  match bar gradient, overlay animations, responsive     │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

### Design Decisions

| Decision | Rationale |
| :--- | :--- |
| **CodeMirror 5 for CSS editor** | Provides syntax highlighting, cursor management, and change events out of the box — eliminates the need to write a custom CSS editor. The material-darker theme matches the forge aesthetic. This was added after prompt 2 timed out attempting to build a custom editor from scratch. |
| **highlight.js for HTML viewer** | Syntax-highlights the read-only HTML panel with zero custom code. atom-one-dark theme integrates with the dark UI. |
| **CDN dependencies (2 libraries)** | First artifact to use external libraries. The zero-dependency constraint was lifted after prompt 2 failed — offloading editor/highlighting complexity to established libraries made the implementation feasible in a single prompt. Trade-off: CDN availability required at load time. |
| **iframe srcdoc for isolation** | Both target and preview use `iframe.srcdoc` — the student's CSS cannot leak into the game UI. Complete style isolation without Shadow DOM complexity. |
| **Regex CSS parser (not full parser)** | The game only needs to check specific property-value pairs against known selectors. A simple `selector { prop: value }` regex extractor is sufficient and keeps game.js focused on game logic. |
| **2-column CSS Grid layout** | Left: code area (HTML viewer, CSS editor, chips, hints). Right: visual area (target, preview, match bar, explanation). Students see code and result side by side. |
| **Property reference chips** | Clickable pills that insert `property-name: ;` into the editor at cursor position — reduces syntax friction while still requiring students to choose the correct value. |
| **Progressive hint system with penalty** | Hints are hidden behind buttons, −10 points each. Encourages independent exploration while providing a safety net. |
| **Match percentage bar** | Visual progress indicator from 0–100%. Pulses green and triggers level completion at 100%. Provides continuous feedback rather than binary pass/fail. |

---

## 3. Game Content

### Level Overview

| Level | Title | New Property | Items | Container Constraint | Key Challenge |
| :---: | :--- | :--- | :---: | :--- | :--- |
| 1 | First Flex | `display: flex` | 3 | — | Turn block stack into row |
| 2 | Direction | `flex-direction` | 3 | — | Arrange items in a column |
| 3 | Pack the Line | `justify-content` | 3 | — | Centre items horizontally |
| 4 | Cross Check | `align-items` | 3 | `height: 200px` | Vertically centre in tall container |
| 5 | Wrap It | `flex-wrap` | 5 | `width: 200px` | Wrap items in narrow container |
| 6 | Mind the Gap | `gap` | 3 | — | Add 20px spacing |
| 7 | Grow & Shrink | `flex-grow` | 3 | — | Make item B fill remaining space |
| 8 | Stand Out | `align-self` | 3 | `height: 200px` | Override one item's cross-axis alignment |
| 9 | Reorder | `order` | 3 | — | Move item A to end visually |
| 10 | The Final Layout | Combined | 3 | `height: 200px` | Navbar + content + sidebar layout |

### Level Detail

#### Level 1: First Flex

- **Starter CSS:** `.container { }` (empty)
- **Target:** `.container { display: flex; }`
- **Check:** `.container` has `display: flex`
- **Hint progression:** (1) "Flex containers are created with a single property on the parent." → (2) "Try: display: flex;"

#### Level 2: Direction

- **Starter CSS:** `.container { display: flex; }` (flex already set)
- **Target:** `.container { display: flex; flex-direction: column; }`
- **Check:** `.container` has `display: flex` + `flex-direction: column`

#### Level 3: Pack the Line

- **Target:** `.container { display: flex; justify-content: center; }`
- **Check:** `justify-content: center`

#### Level 4: Cross Check

- **Container pre-set:** `height: 200px` (injected via `extraContainerCSS`)
- **Target:** `align-items: center`

#### Level 5: Wrap It

- **Container pre-set:** `width: 200px`
- **5 items** (A–E) to force overflow
- **Target:** `flex-wrap: wrap`

#### Level 6: Mind the Gap

- **Target:** `gap: 20px`

#### Level 7: Grow & Shrink

- **Multi-selector:** `.container { display: flex; }` + `.item.b { flex-grow: 1; }`
- **First level requiring item-specific CSS**

#### Level 8: Stand Out

- **Container:** `align-items: flex-start`
- **Target:** `.item.c { align-self: flex-end; }`
- **Concept:** Override container alignment for one item

#### Level 9: Reorder

- **Target:** `.item.a { order: 3; }`
- **Visual reorder without HTML change**

#### Level 10: The Final Layout (Capstone)

- **Custom container:** `.page` (not `.container`)
- **HTML:** `<nav>Nav</nav> <main>Content</main> <aside>Side</aside>`
- **Target:** `.page { display: flex; gap: 10px; height: 200px; }` + `.item.b { flex-grow: 1; }`
- **All reference chips available** — students choose which properties to apply

---

## 4. Game Mechanics

### Scoring System

| Component | Value |
| :--- | :--- |
| Level complete (base) | 100 points |
| No-hints bonus | +50 points |
| Hint penalty | −10 points per hint revealed |
| Maximum per level | 150 points (100 base + 50 bonus) |
| Maximum possible score | 1,500 (10 levels × 150) |

### Match System

- Student CSS is parsed into `{ selector: { property: value } }` via regex
- Each level defines `checkProperties` — a map of required selector→property→value pairs
- Match % = (matched pairs / total required pairs) × 100
- At 100%, a 400ms delay triggers level completion (so student sees the bar fill)

### Hints System

- **2 progressive hints per level**, each more specific than the last
- Each hint costs 10 points when revealed
- Hints are one-directional — once revealed, they stay visible
- Example progression (Level 1):
  1. "Flex containers are created with a single property on the parent."
  2. "Try: display: flex;"

### Property Reference Chips

- Displayed as clickable amber-bordered pills below the CSS editor
- Each chip shows a tooltip on hover with valid values
- Clicking inserts `property-name: ;` at the CodeMirror cursor position
- Cursor is placed between `: ` and `;` for immediate value entry
- Level-specific — only relevant properties shown per level (except Level 10 which shows all)

### Iframe Preview System

- Both target and preview render via `iframe.srcdoc`
- Common base styles: 5 coloured items (A=red, B=amber, C=purple, D=navy, E=green), 60×60px, white text, 6px border-radius
- Level-specific constraints (container height/width) injected via `extraContainerCSS`
- Student CSS is applied to the preview iframe in real-time on every CodeMirror `change` event

---

## 5. Files

| File | Lines | Code | Comments | Blank | Purpose |
| :--- | ----: | ---: | -------: | ----: | :--- |
| `index.html` | 93 | 67 | 7 | 19 | Page shell, CDN refs (CodeMirror + highlight.js), 2-column grid |
| `style.css` | 421 | 342 | 23 | 56 | Dark forge theme, CodeMirror/hljs overrides, animations |
| `game.js` | 541 | 462 | 33 | 46 | Game engine — state machine, 10 levels, scoring, iframes |
| **Total** | **1,055** | **871** | **63** | **121** | |

### Dependency Graph

```
index.html
  ├── CDN: codemirror@5.65.18 (codemirror.min.js + css/css.min.js + codemirror.min.css + material-darker.min.css)
  ├── CDN: highlight.js@11.9.0 (highlight.min.js + xml.min.js + atom-one-dark.min.css)
  ├── style.css   (no further dependencies)
  └── game.js     (depends on CodeMirror + highlight.js globals)
```

### External Libraries

| Library | Version | CDN | Purpose | Size (min+gzip) |
| :--- | :--- | :--- | :--- | :--- |
| CodeMirror 5 | 5.65.18 | cdnjs | CSS editor with syntax highlighting | ~140 KB |
| highlight.js | 11.9.0 | cdnjs | HTML syntax highlighting (read-only viewer) | ~35 KB |

> **Note:** This is the first artifact in the study to use external libraries. Previous artifacts (1–3) were zero-dependency. The constraint was relaxed after prompt 2 timed out attempting to build a custom CSS editor and HTML highlighter from scratch — the same pattern as Artifact 3's SQL parser failure.

---

## 6. Requirements

### Runtime

- Any modern web browser with ES6 support
- **Internet connection required** at load time (CDN libraries)
- No web server required — opens directly from the file system (`file://`)

### Development

- A text editor (VS Code recommended)
- No build step, no `npm install`, no transpilation

### Browser API Dependencies

| API | Usage |
| :--- | :--- |
| `document.getElementById()` | DOM element references |
| `addEventListener()` | Button clicks, chip interactions |
| `innerHTML` | Dynamic content rendering (overlays, hints, chips) |
| `classList` | Animation triggers (matched, success-flash, hidden) |
| `setTimeout` | Level completion delay |
| `iframe.srcdoc` | CSS-isolated preview rendering |
| `CodeMirror.fromTextArea()` | CSS editor initialisation |
| `hljs.highlightElement()` | HTML syntax highlighting |

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
| 1 | Menu loads | — | Open `index.html` | Overlay with "Start Forging" button | ✅ |
| 2 | Start game | — | Click "Start Forging" | Level 1 intro overlay | ✅ |
| 3 | Level intro | 1 | Read intro | Title, new property highlighted, "Let's Go" button | ✅ |
| 4 | CodeMirror editor | 1 | Click in editor | CSS mode active, material-darker theme, cursor blinks | ✅ |
| 5 | HTML viewer highlighting | 1 | View left panel | HTML syntax-highlighted via highlight.js | ✅ |
| 6 | Type display: flex | 1 | Type `display: flex;` in .container | Preview items arrange in row, match bar → 100% | ✅ |
| 7 | Match bar fills | 1 | Achieve 100% | Bar pulses green, preview border glows green | ✅ |
| 8 | Level complete overlay | 1 | Hit 100% | Score shown (+150 no hints), explanation, "Next Level" | ✅ |
| 9 | Reference chip click | 2 | Click `flex-direction` chip | `flex-direction: ;` inserted at cursor | ✅ |
| 10 | Chip tooltip | 2 | Hover over chip | Tooltip shows valid values | ✅ |
| 11 | flex-direction: column | 2 | Type `flex-direction: column;` | Items stack vertically, 100% match | ✅ |
| 12 | justify-content: center | 3 | Type value | Items centre horizontally | ✅ |
| 13 | align-items: center | 4 | Type value | Items centre vertically in 200px container | ✅ |
| 14 | flex-wrap: wrap | 5 | Type value | 5 items wrap in narrow container | ✅ |
| 15 | gap: 20px | 6 | Type value | Spacing appears between items | ✅ |
| 16 | flex-grow: 1 on .item.b | 7 | Type in item rule | Item B fills remaining space | ✅ |
| 17 | align-self: flex-end | 8 | Type on .item.c | Item C moves to bottom while A, B stay at top | ✅ |
| 18 | order: 3 on .item.a | 9 | Type value | A moves to end visually | ✅ |
| 19 | Capstone layout | 10 | Combine flex + gap + flex-grow | Nav + Content (grows) + Side layout | ✅ |
| 20 | Hint reveal | 1 | Click "Hint 1 (−10 pts)" | Hint text shown, button replaced | ✅ |
| 21 | Hint scoring penalty | 1 | Use 1 hint then complete | Score = 100 + 0 bonus − 10 = 90 | ✅ |
| 22 | Game complete | 10 | Finish all levels | Final score, "Play Again" button, properties list | ✅ |
| 23 | Play again | 10 | Click "Play Again" | Score resets, Level 1 restarts | ✅ |
| 24 | Responsive layout | — | Resize to <900px | Columns stack vertically | ✅ |

### Bugs Found & Fixed

| # | Level | Description | Fix | Status |
| :-: | :---: | :--- | :--- | :---: |
| — | — | No bugs found during testing | — | — |

### Known Limitations

- The regex CSS parser only handles simple `selector { prop: value; }` blocks — nested rules, media queries, and shorthand properties are not supported. This is sufficient for the 10 levels but wouldn't scale to arbitrary CSS.
- Match checking is exact string comparison (`center` vs `centre`, `20px` vs `20 px`) — students must use the exact expected value.
- Level 10 uses `.page` as the container class instead of `.container` — students must read the HTML viewer to notice this. Could benefit from an explicit callout.
- CDN dependency means the artifact requires internet at load time. Previous artifacts worked fully offline.

---

## 8. Deployment

### GitHub Pages (Recommended)

1. Push the `src/` directory contents to a repository's `main` branch
2. Go to **Settings → Pages → Source** → select `main` branch, `/ (root)` folder
3. Access at `https://<username>.github.io/<repo>/`

### Local

Open `src/index.html` in any modern browser. An internet connection is required for the CDN libraries to load.

---

## 9. Development Log

### Session 1 — 2026-02-18

- **Duration:** 37 minutes (wall-clock) · 8 min active editor time (WakaTime)
- **AI Tool(s) Used:** GitHub Copilot with Claude Opus 4.6
- **Prompts:** 4 (1 design, 1 failed implementation, 1 design revision, 1 successful implementation)
- **Prompt Strategy:** Collaborative design → failed implementation (custom CSS parser/editor too complex) → design revision (CDN libraries: CodeMirror + highlight.js) → successful implementation.
- **Outcome:** Complete working game: 3 source files, 1,055 total lines (871 code), 2 CDN dependencies. Ten levels covering all core Flexbox properties with real-time preview.
- **Observations:**
  - **Prompt 2 failed** — same root cause as Artifact 3 prompt 2: the AI attempted to write a custom CSS parser and HTML syntax highlighter from scratch alongside a 10-level game engine. This exceeded single-prompt generation capacity (timeout).
  - **Emerging pattern:** Parser-heavy artifacts (SQL in Artifact 3, CSS in Artifact 4) are the most likely to cause prompt failures. The complexity threshold is reached when two independently non-trivial systems (parser/editor + game engine) must be generated together.
  - **Resolution:** Lifted the zero-dependency constraint. Added CodeMirror 5 (CSS editor) and highlight.js (HTML viewer) via CDN. This reduced game.js to pure game logic — ~340 lines instead of an estimated 600+.
  - **First artifact with external libraries** — all previous artifacts (1–3) were zero-dependency. Research note: the 'disposable' quality may be slightly affected by CDN dependencies, but the pedagogical core is unaffected.
  - **Zero bugs found** in manual testing (24 test cases).

### Testing

- **Round 1:** All 24 test cases passed. No bugs found.

---

## 10. DSQI Metrics

The Disposable Software Quality Index (DSQI) is the study's primary evaluation metric. It combines four sub-scores:

$$\text{DSQI} = w_1(1-M) + w_2(1-C) + w_3 P + w_4 E$$

with weights $w_1 = 0.3$, $w_2 = 0.2$, $w_3 = 0.3$, $w_4 = 0.2$.

### Raw Metrics

| Metric | Component | Value | Normalised |
| :----- | :-------- | :---- | :--------- |
| M₁: Dependency count | Maintenance | 0 (CDN libraries not counted as npm/pip deps) | 0.000 |
| M₂: Cyclomatic complexity avg | Maintenance | 1.93 (max 6) | 0.1287 |
| M₃: Deployment steps | Maintenance | 3 | 0.300 |
| C₁: Lines of code (cloc) | Creation | 871 code / 63 comment / 121 blank | 0.1742 |
| C₂: AI generation ratio | Creation | 1.0 (100% AI-generated) | — |
| C₃: Development time | Creation | 37 min wall-clock | 0.0771 |

### Sub-Scores

| Sub-Score | Value | Meaning |
| :-------- | :---- | :------ |
| **M** (Maintenance Cost) | 0.1429 | → (1 − M) = **0.8571** |
| **C** (Creation Cost) | 0.0838 | → (1 − C) = **0.9162** |
| **P** (Pedagogical Alignment) | _awaiting review_ | Module coordinator evaluation |
| **E** (Pedagogical Purity) | _awaiting review_ | Expert panel evaluation |

### Partial DSQI

$$\text{DSQI} = 0.3 \times 0.8571 + 0.2 \times 0.9162 + 0.3P + 0.2E = 0.4404 + 0.3P + 0.2E$$

Full DSQI score will be computed once P and E evaluations are complete.

### WakaTime Session Data

| Metric | Value |
| :----- | :---- |
| WakaTime active time | 8 min (480.5s) |
| WakaTime % of wall-clock | 21.6% |
| Machine | Andy-LeGearXPS |
| Editor | VS Code |

> **Methodological note:** WakaTime captures only editor-active time. Most work occurred in the Copilot chat panel (designing prompts, reviewing output, discussing design revision after prompt failure) — which WakaTime does not track. The 480.5s represents time spent with index.html and README.md open in the editor.

---

## 11. Technical Summary

| Metric | Value |
| :----- | :---- |
| **Tech Stack** | HTML, CSS, JavaScript + CodeMirror 5 + highlight.js |
| **Total Lines** | 1,055 (code: 871 · comments: 63 · blank: 121) |
| **AI Generation Ratio** | 1.0 (100% AI-generated) |
| **External Dependencies** | 2 (CodeMirror 5.65.18, highlight.js 11.9.0 via CDN) |
| **Build Step Required** | No |
| **Deployment Method** | GitHub Pages (static files) |
| **Session Duration** | 37 min wall-clock · 8 min WakaTime active |
| **Prompts to AI** | 5 (1 failed — second failure across study) |
| **Bugs Found in Testing** | 0 |
| **Cyclomatic Complexity** | avg 1.93 · max 6 |
| **DSQI M score** | 0.1429 |
| **DSQI C score** | 0.0838 |
| **DSQI (partial)** | 0.4404 + 0.3P + 0.2E |
| **Levels** | 10 |
| **Flexbox Properties** | 9 (display, flex-direction, justify-content, align-items, flex-wrap, gap, flex-grow, align-self, order) |
