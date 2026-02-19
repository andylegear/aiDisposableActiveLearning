# Artifact 05: Lex Arena — The Lexical Analyser Trainer

## Metadata

| Field                  | Value                                                                    |
| :--------------------- | :----------------------------------------------------------------------- |
| **Artifact ID**        | `05-lexical-analyser-trainer`                                            |
| **Artifact Name**      | Lex Arena — The Lexical Analyser Trainer                                 |
| **Learning Objective** | Understand how lexical analysis breaks source code into tokens            |
| **Target Module**      | CS4158: Programming Language Technology                                  |
| **Module Coordinator** | _[To be confirmed]_                                                      |
| **Status**             | `developed`                                                              |
| **Deployment URL**     | https://andylegear.github.io/aiDisposableActiveLearning/artifacts/05-lexical-analyser-trainer/src/index.html |
| **Repository URL**     | https://github.com/andylegear/aiDisposableActiveLearning/tree/main/artifacts/05-lexical-analyser-trainer |

---

## 1. Overview

Lex Arena is a browser-based training game that teaches university students **regular expressions and lexical analysis** through 8 progressive levels. Students write regex patterns in a syntax-highlighted editor to tokenise source code, see real-time visual feedback as tokens are highlighted in the source, and build towards a capstone level where they assemble a complete multi-rule lexer.

The game uses a dark code-editor aesthetic with a CodeMirror-powered regex editor, clickable reference chips, progressive hints, a token stream table, and a percentage-based match bar.

### Pedagogical Alignment

| Framework | Alignment |
| :--- | :--- |
| **ICAP** (Chi & Wylie, 2014) | **Constructive/Interactive** — students write regex patterns (constructive), observe real-time token highlighting (active), and iterate towards a 100% match (interactive). The instant feedback loop between pattern and highlighted source creates tight constructive engagement. |
| **Constructionism** (Papert, 1991) | Students construct understanding of lexical analysis by building a tokeniser piece by piece — each level adds a token type, and Level 8 assembles them into a complete lexer. The progression mirrors real compiler construction. |
| **Bloom's Taxonomy** | *Remember* (recall regex syntax), *Understand* (how character classes and quantifiers work), *Apply* (write correct regex for a token type), *Analyse* (why word boundaries matter for keywords vs identifiers), *Evaluate* (choose lazy vs greedy quantifiers), *Create* (Level 8 capstone: assemble and order a complete lexer) |

### Token Types Covered

| Level | Title | Token Type | Regex Concept |
| :---: | :--- | :--- | :--- |
| 1 | Number Crunch | INTEGER | Character classes, `+` quantifier |
| 2 | Go Float | FLOAT | Escaped dot `\.` vs wildcard `.` |
| 3 | Name Game | IDENTIFIER | Multi-class pattern, `*` quantifier |
| 4 | Reserved Words | KEYWORD | Alternation `|`, word boundaries `\b` |
| 5 | Operators | OPERATOR | Character class with `{1,2}` quantifier |
| 6 | Strung Along | STRING | Negated character class `[^"]` |
| 7 | No Comment | COMMENT | Alternation, `[\s\S]*?` lazy matching |
| 8 | The Full Lexer | ALL | Rule priority ordering (capstone) |

---

## 2. Architecture

### High-Level Design

```
┌──────────────────────────────────────────────────────────────┐
│                        index.html                             │
│  CDN: CodeMirror 5 (default mode)                             │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ Top Bar: Level Name · Progress (N/8) · Score           │  │
│  ├────────────────────┬───────────────────────────────────┤  │
│  │    Left Column     │        Right Column               │  │
│  │                    │                                    │  │
│  │  📄 Source Code   │  ✏️ Regex Editor (CodeMirror)     │  │
│  │  (token highlight) │     Single-line mode               │  │
│  │                    │                                    │  │
│  │  📊 Token Stream  │  📈 Match Bar (0–100%)            │  │
│  │  (scrollable table)│     + Feedback text                │  │
│  │                    │                                    │  │
│  │                    │  📖 Reference Chips (clickable)   │  │
│  │                    │  💡 Hints (progressive)           │  │
│  │                    │                                    │  │
│  │                    │  🔧 Rule Editor (Level 8 only)    │  │
│  │                    │     ▲/▼ reorder buttons            │  │
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
│  │  │  8 Level Definitions                              │  │  │
│  │  │  Each with: sourceCode, targetRegex,              │  │  │
│  │  │  starterPattern, chips, hints, explanation         │  │  │
│  │  ├──────────────────────────────────────────────────┤  │  │
│  │  │  Native RegExp Match Engine                       │  │  │
│  │  │  new RegExp(pattern,'g') → matchAll               │  │  │
│  │  ├──────────────────────────────────────────────────┤  │  │
│  │  │  Level 8: Priority-Based Lexer Engine             │  │  │
│  │  │  Rules tried in order, first match wins           │  │  │
│  │  ├──────────────────────────────────────────────────┤  │  │
│  │  │  CodeMirror Integration · Match Checker ·          │  │  │
│  │  │  Scoring · Hints · Overlay System                  │  │  │
│  │  └──────────────────────────────────────────────────┘  │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐  │
│  │    style.css — Presentation                             │  │
│  │  Dark editor theme, CSS Grid 2-column layout,           │  │
│  │  CodeMirror overrides, token colours, chip/hint         │  │
│  │  styling, match bar gradient, overlay animations,       │  │
│  │  rule-editor rows, responsive stacking                  │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

### Design Decisions

| Decision | Rationale |
| :--- | :--- |
| **CodeMirror 5 for regex editor** | Provides syntax highlighting, cursor management, and change events — eliminates the need to style a plain textarea. Proven in Artifact 4. |
| **Native `RegExp` for matching** | JavaScript's built-in `new RegExp(pattern, 'g')` handles all student patterns directly — no need for an external regex library. `matchAll()` returns positions and text, which is all the game needs. |
| **No external lexer library** | The capstone lexer (Level 8) uses a simple 20-line `runLexer()` function that tries each regex rule in order at each source position. This is pedagogically transparent — students can understand the algorithm. |
| **8 levels, not 10** | Reduced from original 10-level design after three implementation timeouts. Removed whitespace and separate float/integer levels; the 8 remaining levels cover all core regex and lexer concepts. |
| **Level 8 rule reordering via ▲/▼ buttons** | Simpler than drag-and-drop (no SortableJS dependency). Students click buttons to reorder rules, making the priority concept explicit and debuggable. |
| **Incremental development strategy** | After 3 timeout failures trying to generate all files at once, the game was built incrementally: MVP with 1 level, then levels added 2–3 at a time. This is a key methodological finding for the study. |
| **Token-coloured `<span>` highlighting** | Matched tokens in the source code are wrapped in `<span class="token-TYPE">` with distinct background + text colours per token type. This creates an immediate visual link between regex pattern and source code. |
| **Match percentage with false-positive penalty** | `max(0, correct - falsePositives) / expected * 100` — overly broad patterns are penalised, not just rewarded for catching some tokens. Teaches precision in regex design. |

---

## 3. Game Content

### Level Overview

| Level | Title | Token Type | Source Code | Target Regex | Key Concept |
| :---: | :--- | :--- | :--- | :--- | :--- |
| 1 | Number Crunch | INTEGER | `int x = 42; ...` | `[0-9]+` | Character class + quantifier |
| 2 | Go Float | FLOAT | same as L1 | `[0-9]+\.[0-9]+` | Escaped dot |
| 3 | Name Game | IDENTIFIER | `if (count > 0) ...` | `[a-zA-Z_][a-zA-Z0-9_]*` | Multi-class + `*` |
| 4 | Reserved Words | KEYWORD | same as L3 | `\b(if\|else\|...)\b` | Word boundaries + alternation |
| 5 | Operators | OPERATOR | `x = a + b; ...` | `[+\-*/<>=!&]{1,2}` | Char class + `{n,m}` |
| 6 | Strung Along | STRING | same as L5 | `"[^"]*"` | Negated class |
| 7 | No Comment | COMMENT | `// Calculate ...` | `\/\/.*\|\/\*[\s\S]*?\*\/` | Lazy quantifier + alternation |
| 8 | The Full Lexer | ALL | Fibonacci function | All 7 rules in priority order | Rule priority |

### Level Detail

#### Level 1: Number Crunch
- **Source:** `int x = 42;\nfloat pi = 3.14;\nint sum = x + 100;`
- **Target:** `[0-9]+` — match integer literals
- **Starter:** `[0-9]` (matches single digits, student adds `+`)
- **Concept:** Character classes define sets of characters; `+` means "one or more"

#### Level 2: Go Float
- **Source:** Same as Level 1
- **Target:** `[0-9]+\.[0-9]+` — match floating-point literals
- **Starter:** `[0-9]+` (from Level 1, student adds `\.[0-9]+`)
- **Concept:** `.` is special in regex (any char); `\.` matches a literal dot

#### Level 3: Name Game
- **Source:** `if (count > 0) {\n  int result = count * 2;\n  return result;\n} else {\n  return 0;\n}`
- **Target:** `[a-zA-Z_][a-zA-Z0-9_]*` — match all identifiers
- **Starter:** `[a-zA-Z_]` (first character only)
- **Concept:** Identifiers can't start with digits; `*` allows zero or more continuation characters

#### Level 4: Reserved Words
- **Source:** Same as Level 3
- **Target:** `\b(if|else|while|return|int|float)\b` — match keywords only
- **Starter:** `(if|else)` (missing other keywords and word boundaries)
- **Concept:** `\b` prevents partial matches; alternation `|` lists alternatives

#### Level 5: Operators
- **Source:** `x = a + b;\nif (x >= 10 && y != 0) {\n  msg = "hello";\n}`
- **Target:** `[+\-*/<>=!&]{1,2}` — match single and multi-char operators
- **Starter:** `[+\-*/]` (only arithmetic operators)
- **Concept:** `{1,2}` quantifier for variable-length matches; escaped hyphen in char class

#### Level 6: Strung Along
- **Source:** Same as Level 5 (with added `name = "Alice";` line)
- **Target:** `"[^"]*"` — match string literals
- **Starter:** `"` (just the opening quote)
- **Concept:** Negated class `[^"]` avoids greedy over-matching

#### Level 7: No Comment
- **Source:** `// Calculate sum\nint total = 0; // running total\n/* multi-line\n   comment */\nreturn total;`
- **Target:** `\/\/.*|\/\*[\s\S]*?\*\/` — match both comment styles
- **Starter:** `//.*` (only single-line comments)
- **Concept:** `[\s\S]` matches any char including newlines; `*?` is lazy (stops at first match)

#### Level 8: The Full Lexer (Capstone)
- **Source:** Fibonacci function (11 lines, all token types present)
- **Mechanic:** No regex editor — instead a rule list with ▲/▼ reorder buttons
- **Pre-filled:** Patterns saved from Levels 1–7 (or defaults)
- **Initial order:** Deliberately wrong (INTEGER before FLOAT, IDENTIFIER before KEYWORD)
- **Target order:** COMMENT → KEYWORD → FLOAT → INTEGER → IDENTIFIER → STRING → OPERATOR
- **Concept:** Lexer rule priority — first match wins, so keywords must precede identifiers and floats must precede integers

---

## 4. Game Mechanics

### Scoring System

| Component | Value |
| :--- | :--- |
| Level complete (base) | 100 points |
| No-hints bonus | +50 points |
| Hint penalty | −10 points per hint revealed |
| Maximum per level | 150 points (100 base + 50 bonus) |
| Maximum possible score | 1,200 (8 levels × 150) |

### Match System (Levels 1–7)

1. Student types a regex in CodeMirror → `change` event fires
2. Pattern compiled as `new RegExp(pattern, 'g')` — invalid patterns show error in feedback
3. `matchAll()` run against source code → student matches collected
4. Compared against expected matches from `targetRegex`:
   - A correct match = same substring at same position
   - Match % = `max(0, correct - falsePositives) / expected * 100`
5. Source display updated: matched substrings wrapped in `<span class="token-TYPE">`
6. Token stream table updated with `[#, Type, Lexeme, Position]`
7. At 100% → 400ms delay → level complete

### Match System (Level 8 — Capstone)

1. Student reorders 7 rules using ▲/▼ buttons
2. Clicks "Run Lexer" → `runLexer()` processes source from position 0:
   - At each position, try each rule in list order
   - First regex that matches at current position wins → token emitted
   - Advance past the match; skip unmatched characters
3. Student token stream compared against expected token stream (generated with correct rule order)
4. Match % = `correct tokens / expected tokens * 100`

### Hints System

- **2 progressive hints per level**, each more specific than the last
- Each hint costs 10 points when revealed
- Hints are one-directional — once revealed, they stay visible
- Example progression (Level 1):
  1. "You need a character class that matches digits, then a quantifier."
  2. "Try [0-9]+ — the + means 'one or more'."

### Regex Reference Chips

- Displayed as clickable pill-shaped buttons below the editor
- Each chip shows a tooltip on hover describing the syntax
- Clicking inserts the chip's text at the CodeMirror cursor position
- Level-specific subsets — only relevant syntax shown per level

---

## 5. Files

| File | Lines | Code | Comments | Blank | Purpose |
| :--- | ----: | ---: | -------: | ----: | :--- |
| `index.html` | 75 | 64 | 6 | 5 | Page shell, CDN ref (CodeMirror 5), 2-column grid, rule editor panel |
| `style.css` | 288 | 254 | 16 | 18 | Dark editor theme, token colours, CodeMirror overrides, rule editor styles |
| `game.js` | 689 | 594 | 40 | 55 | Game engine — state machine, 8 levels, scoring, lexer, rule editor |
| **Total** | **1,052** | **912** | **62** | **78** | |

### Dependency Graph

```
index.html
  ├── CDN: codemirror@5.65.18 (codemirror.min.js + codemirror.min.css)
  ├── style.css   (no further dependencies)
  └── game.js     (depends on CodeMirror global)
```

### External Libraries

| Library | Version | CDN | Purpose | Size (min+gzip) |
| :--- | :--- | :--- | :--- | :--- |
| CodeMirror 5 | 5.65.18 | cdnjs | Regex pattern editor with cursor management | ~140 KB |

> **Note:** Only 1 CDN dependency (vs 2 in Artifact 4). The native `RegExp` engine handles all tokenisation — no external lexer library needed.

---

## 6. Requirements

### Runtime

- Any modern web browser with ES6 support
- **Internet connection required** at load time (CDN library)
- No web server required — opens directly from the file system (`file://`)

### Development

- A text editor (VS Code recommended)
- No build step, no `npm install`, no transpilation

### Browser API Dependencies

| API | Usage |
| :--- | :--- |
| `document.querySelector()` | DOM element references |
| `addEventListener()` | Button clicks, chip interactions |
| `innerHTML` | Dynamic content rendering (overlays, hints, chips, token table, source highlighting) |
| `classList` | Animation triggers (hidden, revealed, error) |
| `setTimeout` | Level completion delay (400ms) |
| `new RegExp()` | Student pattern compilation and matching |
| `String.matchAll()` | Token extraction from source code |
| `CodeMirror.fromTextArea()` | Regex editor initialisation |

### Browser Compatibility

| Browser | Minimum Version |
| :--- | :--- |
| Chrome | 73+ (for `matchAll`) |
| Firefox | 67+ |
| Safari | 13+ |
| Edge | 79+ (Chromium) |

---

## 7. Testing

### Manual Test Matrix

| # | Test Case | Level | Steps | Expected Result | Status |
| :-: | :--- | :---: | :--- | :--- | :---: |
| 1 | Menu loads | — | Open `index.html` | Overlay with "Enter the Arena" button | ✅ |
| 2 | Start game | — | Click "Enter the Arena" | Level 1 intro overlay | ✅ |
| 3 | Level intro | 1 | Read intro | Title, description, "Let's Go" button | ✅ |
| 4 | CodeMirror editor | 1 | Click in editor | Dark theme, cursor blinks, starter pattern shown | ✅ |
| 5 | Starter pattern matches | 1 | View initial state | `[0-9]` matches individual digits, partial % | ✅ |
| 6 | Type [0-9]+ | 1 | Add `+` to starter | All integers highlighted, 100% match | ✅ |
| 7 | Token stream table | 1 | Achieve matches | Table shows #, Type, Lexeme, Position | ✅ |
| 8 | Source highlighting | 1 | Achieve matches | Integers highlighted in amber | ✅ |
| 9 | Match bar fills | 1 | Achieve 100% | Bar gradient from amber to green, 100% text | ✅ |
| 10 | Level complete overlay | 1 | Hit 100% | Score shown, explanation, "Next Level" | ✅ |
| 11 | Reference chip click | 2 | Click `\.` chip | `\.` inserted at cursor | ✅ |
| 12 | Chip tooltip | 2 | Hover over chip | Tooltip describes the syntax | ✅ |
| 13 | Float matching | 2 | Type `[0-9]+\.[0-9]+` | Only 3.14 highlighted, 100% | ✅ |
| 14 | Identifier matching | 3 | Type target pattern | All identifiers highlighted in blue | ✅ |
| 15 | Keyword with \b | 4 | Type `\b(if\|else\|while\|return\|int\|float)\b` | Only keywords highlighted in red | ✅ |
| 16 | Operator matching | 5 | Type target pattern | Operators highlighted in purple | ✅ |
| 17 | String matching | 6 | Type `"[^"]*"` | Strings highlighted in light blue | ✅ |
| 18 | Comment matching | 7 | Type target pattern | Both comment styles highlighted in grey | ✅ |
| 19 | Level 8 rule editor | 8 | Reach Level 8 | Rule list with ▲/▼ buttons, "Run Lexer" button | ✅ |
| 20 | Rule reordering | 8 | Click ▲/▼ buttons | Rules swap positions in list | ✅ |
| 21 | Run Lexer (wrong order) | 8 | Click "Run Lexer" with default order | Partial match, some tokens misclassified | ✅ |
| 22 | Run Lexer (correct order) | 8 | Reorder correctly, run | 100% match, all tokens coloured correctly | ✅ |
| 23 | Hint reveal | 1 | Click "Hint 1" | Hint text shown, button styled as revealed | ✅ |
| 24 | Hint scoring penalty | 1 | Use 1 hint then complete | Score = 100 + 0 bonus − 10 = 90 | ✅ |
| 25 | Invalid regex | 1 | Type `[0-9` (unclosed bracket) | Error message in feedback panel | ✅ |
| 26 | False positive penalty | 1 | Type `.+` (matches everything) | Match % < 100% due to false positives | ✅ |
| 27 | Game complete | 8 | Finish all levels | Final score out of 1,200, "Play Again" button | ✅ |
| 28 | Play again | 8 | Click "Play Again" | Score resets, Level 1 restarts | ✅ |
| 29 | Responsive layout | — | Resize to <900px | Columns stack vertically | ✅ |

### Bugs Found & Fixed

| # | Level | Description | Fix | Status |
| :-: | :---: | :--- | :--- | :---: |
| — | — | No bugs found during testing | — | — |

### Known Limitations

- The regex matching uses JavaScript's native `RegExp` which supports features not available in all regex flavours (e.g., `\b`, `[\s\S]`). Students may need to adapt patterns for other languages.
- Level 8's lexer skips unmatched characters silently — whitespace and punctuation like `(){}` are not tokenised. A production lexer would handle these explicitly.
- The operator regex `[+\-*/<>=!&]{1,2}` is simplified — it would match invalid two-character sequences like `><`. A production lexer would enumerate each multi-character operator.
- Match checking compares exact substrings at exact positions. A student's regex can be functionally equivalent but different in form (e.g., `\d+` vs `[0-9]+`) and still achieve 100%.
- CDN dependency means the artifact requires internet at load time.

---

## 8. Deployment

### GitHub Pages (Recommended)

1. Push the `src/` directory contents to a repository's `main` branch
2. Go to **Settings → Pages → Source** → select `main` branch, `/ (root)` folder
3. Access at `https://<username>.github.io/<repo>/`

### Local

Open `src/index.html` in any modern browser. An internet connection is required for the CDN library to load.

---

## 9. Development Log

### Session 1 — 2026-02-18

- **Duration:** 54 minutes (wall-clock)
- **AI Tool(s) Used:** GitHub Copilot with Claude Opus 4.6
- **Prompts:** 11 (3 design, 3 failed implementations, 1 successful MVP implementation, 4 incremental level additions)
- **Prompt Strategy:**
  1. Design prompt → 10-level regex-typing game with CodeMirror (Prompt 1: success)
  2. Implementation attempt (Prompt 2: **timeout** — game too complex for single generation)
  3. Design revision → 8-level drag-and-drop game, zero dependencies (Prompt 3: success)
  4. Implementation attempt (Prompt 4: **timeout** — still too complex)
  5. Design revision → use moo.js, SortableJS, CodeMirror 5 (Prompt 5: success)
  6. Implementation attempt (Prompt 6: **timeout** — 3 files at once too large)
  7. **Breakthrough: 1-level MVP** (Prompt 7: **success** — all 3 files generated)
  8. Add Level 2 (Prompt 8: success)
  9. Add Levels 3–4 (Prompt 9: success)
  10. Add Levels 5–7 (Prompt 10: success)
  11. Add Level 8 capstone with rule editor (Prompt 11: success)
- **Outcome:** Complete working game: 3 source files, 1,052 total lines (912 code), 1 CDN dependency. Eight levels covering regex fundamentals through a complete lexer with rule priority.
- **Observations:**
  - **Three consecutive implementation timeouts** (Prompts 2, 4, 6) — the worst failure rate of any artifact. Root cause was attempting to generate all game logic + all levels + all UI in a single prompt, regardless of complexity or library usage.
  - **Key breakthrough:** Generating a 1-level MVP first, then adding levels incrementally. This strategy should be the default for all future multi-level game artifacts.
  - **Libraries considered but not used:** moo.js (lexer engine) and SortableJS (drag-and-drop) were proposed but ultimately unnecessary. JavaScript's native `RegExp` handles all tokenisation, and simple ▲/▼ buttons replace drag-and-drop.
  - **Final design used only CodeMirror 5** — the simplest dependency set of any library-using artifact.
  - **Level 8 capstone** teaches the most important compiler concept: rule priority ordering determines correct tokenisation.
  - **Zero bugs found** in manual testing (29 test cases).

### Testing

- **Round 1:** All 29 test cases passed. No bugs found.

---

## 10. DSQI Metrics

The Disposable Software Quality Index (DSQI) is the study's primary evaluation metric. It combines four sub-scores:

$$\text{DSQI} = w_1(1-M) + w_2(1-C) + w_3 P + w_4 E$$

with weights $w_1 = 0.3$, $w_2 = 0.2$, $w_3 = 0.3$, $w_4 = 0.2$.

### Raw Metrics

| Metric | Component | Value | Normalised |
| :----- | :-------- | :---- | :--------- |
| M₁: Dependency count | Maintenance | 0 (CDN libraries not counted as npm/pip deps) | 0.000 |
| M₂: Cyclomatic complexity avg | Maintenance | 4.40 (max 18, 15 functions) | 0.2933 |
| M₃: Deployment steps | Maintenance | 3 | 0.300 |
| C₁: Lines of code (cloc) | Creation | 912 code / 62 comment / 78 blank | 0.1824 |
| C₂: AI generation ratio | Creation | 1.0 (100% AI-generated) | — |
| C₃: Development time | Creation | 54 min wall-clock | 0.1125 |

### Sub-Scores

| Sub-Score | Value | Meaning |
| :-------- | :---- | :------ |
| **M** (Maintenance Cost) | 0.1978 | → (1 − M) = **0.8022** |
| **C** (Creation Cost) | 0.0983 | → (1 − C) = **0.9017** |
| **P** (Pedagogical Alignment) | _awaiting review_ | Module coordinator evaluation |
| **E** (Pedagogical Purity) | _awaiting review_ | Expert panel evaluation |

### Partial DSQI

$$\text{DSQI} = 0.3 \times 0.8022 + 0.2 \times 0.9017 + 0.3P + 0.2E = 0.4210 + 0.3P + 0.2E$$

Full DSQI score will be computed once P and E evaluations are complete.

### WakaTime Session Data

| Metric | Value |
| :----- | :---- |
| WakaTime active time | 0 secs |
| WakaTime % of wall-clock | 0% |
| Machine | — |
| Editor | — |

> **Methodological note:** WakaTime recorded zero active editor time for this artifact. All code was generated via Copilot chat panel interactions (designing prompts, reviewing output, iterating on design revisions after timeouts) — which WakaTime does not track. The 54 minutes of wall-clock time was spent entirely in the chat panel.

---

## 11. Technical Summary

| Metric | Value |
| :----- | :---- |
| **Tech Stack** | HTML, CSS, JavaScript + CodeMirror 5 |
| **Total Lines** | 1,052 (code: 912 · comments: 62 · blank: 78) |
| **AI Generation Ratio** | 1.0 (100% AI-generated) |
| **External Dependencies** | 1 (CodeMirror 5.65.18 via CDN) |
| **Build Step Required** | No |
| **Deployment Method** | GitHub Pages (static files) |
| **Session Duration** | 54 min wall-clock · 0 secs WakaTime active |
| **Prompts to AI** | 11 (3 failed — most failures of any artifact) |
| **Bugs Found in Testing** | 0 |
| **Cyclomatic Complexity** | avg 4.40 · max 18 |
| **DSQI M score** | 0.1978 |
| **DSQI C score** | 0.0983 |
| **DSQI (partial)** | 0.4210 + 0.3P + 0.2E |
| **Levels** | 8 |
| **Token Types** | 7 (INTEGER, FLOAT, IDENTIFIER, KEYWORD, OPERATOR, STRING, COMMENT) |
