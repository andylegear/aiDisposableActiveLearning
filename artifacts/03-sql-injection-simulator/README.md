# Artifact 03: SQL Injection Lab

## Metadata

| Field                  | Value                                                                  |
| :--------------------- | :--------------------------------------------------------------------- |
| **Artifact ID**        | `03-sql-injection-simulator`                                           |
| **Artifact Name**      | SQL Injection Lab                                                      |
| **Learning Objective** | Understand how SQL injection vulnerabilities work and how to prevent them |
| **Target Module**      | CS4416: Database Systems                                               |
| **Module Coordinator** | _[To be confirmed]_                                                    |
| **Status**             | `developed`                                                            |
| **Deployment URL**     | https://andylegear.github.io/aiDisposableActiveLearning/artifacts/03-sql-injection-simulator/src/index.html |
| **Repository URL**     | https://github.com/andylegear/aiDisposableActiveLearning/tree/main/artifacts/03-sql-injection-simulator |

---

## 1. Overview

SQL Injection Lab is a browser-based cybersecurity training game that teaches university students **SQL injection** through five hands-on missions. Students progress from attacker to defender — first exploiting vulnerable applications using real injection techniques, then fixing those vulnerabilities using parameterised queries.

The game uses a dark terminal/hacker aesthetic with visible database tables, a real-time query builder that shows how user input becomes part of SQL, and pattern-matching detection that validates injection attempts without requiring a full SQL parser.

### Pedagogical Alignment

| Framework | Alignment |
| :--- | :--- |
| **ICAP** (Chi & Wylie, 2014) | **Interactive/Constructive** — students craft injection payloads (constructive), observe real-time query manipulation (active), and rewrite vulnerable code (interactive). The Defence Lab level reverses the role from attacker to defender. |
| **Constructionism** (Papert, 1991) | Students build understanding of SQL structure by manipulating it — seeing their input injected into live queries creates cognitive conflict that reinforces the boundary between code and data. |
| **Bloom's Taxonomy** | *Remember* (recall SQL syntax), *Understand* (how concatenation creates vulnerability), *Apply* (craft working injections), *Analyse* (boolean-blind extraction), *Evaluate* (assess destructive impact), *Create* (write parameterised queries) |

### SQL Injection Techniques Covered

- Authentication bypass (comment injection, tautology)
- UNION-based data extraction
- Boolean-based blind injection (SUBSTRING)
- Destructive stacked queries (DROP TABLE, UPDATE, DELETE)
- Defence: parameterised queries with `?` placeholders

---

## 2. Architecture

### High-Level Design

```
┌─────────────────────────────────────────────────────────────┐
│                       index.html                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Top Bar: Level Name · Progress · Score                │  │
│  ├──────────┬──────────────────┬─────────────────────────┤  │
│  │ Left Col │   Centre Col     │      Right Col          │  │
│  │          │                  │                          │  │
│  │ Target   │   Database       │  Results                │  │
│  │ App Form │   Tables         │  (query output,         │  │
│  │          │   (visible       │   damage reports,       │  │
│  │ Query    │    in-memory     │   attack simulations)   │  │
│  │ Builder  │    data with     │                          │  │
│  │ (vuln    │    animations)   │  Objectives             │  │
│  │  code +  │                  │  (checklist with        │  │
│  │  live    │                  │   main + bonus)         │  │
│  │  query)  │                  │                          │  │
│  │          │                  │  Hints                  │  │
│  │          │                  │  (progressive reveal)   │  │
│  │          │                  │                          │  │
│  │          │                  │  Explanation            │  │
│  │          │                  │  (post-success)         │  │
│  └──────────┴──────────────────┴─────────────────────────┘  │
│                                                              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Overlay (menu, mission briefs, level complete, final) │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                    game.js                             │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │  State Machine                                   │  │  │
│  │  │  menu → missionBrief → playing →                 │  │  │
│  │  │  levelComplete → gameComplete                    │  │  │
│  │  ├─────────────────────────────────────────────────┤  │  │
│  │  │  5 Level Definitions                             │  │  │
│  │  │  Each with: data, vulnTemplate, buildForm(),     │  │  │
│  │  │  buildQuery(), check(), objectives, hints,       │  │  │
│  │  │  briefing, explanation generators                │  │  │
│  │  ├─────────────────────────────────────────────────┤  │  │
│  │  │  Pattern-Matching Detection Engine               │  │  │
│  │  │  Regex-based per level (no SQL parser)           │  │  │
│  │  ├─────────────────────────────────────────────────┤  │  │
│  │  │  DOM-Based Database Rendering                    │  │  │
│  │  │  HTML tables + animations (drop, delete, update) │  │  │
│  │  ├─────────────────────────────────────────────────┤  │  │
│  │  │  Overlay System · Scoring · Hints · Defence Lab  │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │    style.css — Presentation                            │  │
│  │  Dark terminal theme, CSS Grid 3-column layout,        │  │
│  │  SQL syntax highlighting, password cracker animations, │  │
│  │  defence lab editor, damage reports, responsive layout │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Design Decisions

| Decision | Rationale |
| :--- | :--- |
| **Zero dependencies** | Maximises disposability — no `npm install`, no build step, no version rot. A single directory of static files. |
| **Pattern-matching instead of SQL parser** | Original design included a full SQL parser (SimDB class) — this exceeded the LLM's single-prompt generation capacity. Pattern-matching preserves the pedagogical value (students see input become part of SQL) while being implementable in one prompt. This is a key research finding. |
| **3-column CSS Grid layout** | Left: app + query builder, Centre: visible database, Right: results + objectives. Students see the full attack chain: input → query → database → result. |
| **Real-time query builder** | As students type, they see their input injected into the SQL template with distinct colour highlighting — making the concatenation vulnerability immediately visible. |
| **Attacker-to-defender progression** | Levels 1–4 teach attack techniques; Level 5 reverses the role. This mirrors real-world security training and reaches the highest Bloom's level (Create). |
| **Mission briefings with real breach context** | Each level opens with a real-world data breach (LinkedIn, Target, Sony, etc.) to connect abstract concepts to concrete consequences. |
| **DOM-based database with animations** | Tables visibly update/drop/delete when destructive queries succeed — dramatic visual feedback reinforces the severity of injection attacks. |

---

## 3. Game Content

### Level Overview

| Level | Name | Subtitle | Technique | Objectives | Key Mechanic |
| :---: | :--- | :--- | :--- | :---: | :--- |
| 1 | The Login Bypass | Authentication Bypass | Comment injection, tautology | 4 | Form inputs → login bypass |
| 2 | Data Heist | UNION-Based Extraction | UNION SELECT | 3 | Search box → cross-table extraction |
| 3 | Blind Spot | Boolean-Based Blind Injection | SUBSTRING | 1 | User ID checker → password cracker |
| 4 | Drop Zone | Destructive Attacks | Stacked queries | 3 | Feedback form → DROP/UPDATE/DELETE |
| 5 | Defence Lab | Parameterised Queries | `?` placeholders | 3 | Code editor → fix vulnerable queries |

### Level Detail

#### Level 1: The Login Bypass

| Objective | Type | Injection Pattern | Detection |
| :--- | :--- | :--- | :--- |
| Log in as admin without the password | Main | `admin' --` | `/admin['"]\s*(--\|#)/i` |
| Log in as any user without a password | Bonus | `' OR '1'='1' --` | `hasTautology()` or comment bypass |
| Log in specifically as alice | Bonus | `alice' --` | `/alice['"]\s*(--\|#)/i` |
| Make the query return ALL user records | Bonus | `' OR '1'='1' --` | `hasTautology()` |

**Database:** `users` table (5 rows: admin, alice, bob, charlie, diana)

**Vulnerable code:** `"SELECT * FROM users WHERE username='" + user + "' AND password='" + pass + "'"`

**Real-world context:** LinkedIn 2012 breach (6.5M accounts)

#### Level 2: Data Heist

| Objective | Type | Injection Pattern | Detection |
| :--- | :--- | :--- | :--- |
| Extract credit card numbers | Main | `' UNION SELECT card_number, expiry FROM credit_cards --` | `/UNION/i` + `/credit_cards/i` + column count validation |
| Extract employee SSNs | Bonus | `' UNION SELECT ssn, name FROM employees --` | `/UNION/i` + `/employees/i` + `/ssn/i` |
| Cause a column count mismatch error | Bonus | `' UNION SELECT * FROM credit_cards --` | Column count ≠ 2 |

**Database:** `products` (6 rows), `credit_cards` (4 rows), `employees` (4 rows)

**Vulnerable code:** `"SELECT name, price FROM products WHERE name LIKE '%" + input + "%'"`

**Real-world context:** Target 2013 breach (40M credit cards)

#### Level 3: Blind Spot

| Objective | Type | Mechanic |
| :--- | :--- | :--- |
| Crack all 10 characters of the admin password | Main | Iterative SUBSTRING testing with password cracker UI |

**Interface:** User ID input → boolean response ("User exists" / "User not found")

**Target password:** `s3cur3Pa$$` (10 characters, displayed as cracker slots)

**Detection:** Parses `SUBSTRING(password,N,1)='X'` pattern, checks character match, updates cracker slots progressively

**Real-world context:** 2014 government website blind injection research

#### Level 4: Drop Zone

| Objective | Type | Injection Pattern | Visual Effect |
| :--- | :--- | :--- | :--- |
| Drop the users table | Main | `'); DROP TABLE users; --` | Table rows flash red, collapse |
| Change admin password to "hacked" | Bonus | `'); UPDATE users SET password='hacked' WHERE username='admin'; --` | Row highlights, cell updates |
| Delete all products | Bonus | `'); DELETE FROM products; --` | Rows flash red, fade out |

**Database:** `feedback` (2 rows), `users` (5 rows), `products` (6 rows) — with reset button

**Vulnerable code:** `"INSERT INTO feedback (comment) VALUES ('" + input + "')"`

**Real-world context:** Sony Pictures 2011 breach by LulzSec

#### Level 5: Defence Lab

| Challenge | Vulnerable Code | Required Fix | Validation |
| :--- | :--- | :--- | :--- |
| Fix the login query | `"...username='" + user + "'..."` | Replace with `?`, add `params = [user, pass]` | Has `?`, no concatenation, has `params` array |
| Fix the search query | `"...LIKE '%" + input + "%'"` | Replace with `?`, add `params = ['%' + input + '%']` | Same validation |
| Fix the feedback INSERT | `"...VALUES ('" + input + "')"` | Replace with `?`, add `params = [input]` | Same validation |

**Post-fix:** Visual attack simulation — previously successful injections are replayed against the fixed code and shown as "BLOCKED ✓"

---

## 4. Game Mechanics

### Scoring System

| Component | Value |
| :--- | :--- |
| Main objective (correct) | 100 points |
| Bonus objective (correct) | 50 points |
| First-try bonus (main objective, no failed attempts) | 50 points |
| Defence Lab fix (per challenge) | 100 points (included in main/bonus) |
| Hint penalty | −10 points per hint revealed |
| Maximum possible score | ~1,500 (varies with hints used) |

### Hints System

- **3 progressive hints per level**, each more specific than the last.
- Each hint costs 10 points when revealed.
- Hints are one-directional — once revealed, they stay visible.
- Example progression (Level 1):
  1. "In SQL, `--` starts a comment — everything after it is ignored."
  2. "If the username is `admin' --`, what happens to the password check?"
  3. "Try typing `admin' --` in the username field (leave password empty)."

### Mission Briefings

Each level opens with a full-screen overlay containing:
- **Real-world context** — a historical data breach that used the technique being taught
- **Mission description** — what the student needs to accomplish
- **Tip** — a starting hint for the approach

### Query Builder

The query builder panel shows two things:
1. **Vulnerable code** — the backend code template with string concatenation highlighted
2. **Live query** — the actual SQL that would be executed, updated in real-time as the student types, with injection segments colour-highlighted in amber

### SQL Syntax Highlighting

| Token | Colour | CSS Class |
| :--- | :--- | :--- |
| Keywords (SELECT, FROM, etc.) | Purple `#c792ea` | `.sql-kw` |
| Strings | Green `#00e676` | `.sql-str` |
| Numbers | Orange `#f78c6c` | `.sql-num` |
| Operators (AND, OR) | Blue `#82aaff` | `.sql-op` |
| Comments (--) | Grey `#546e7a` | `.sql-comment` |
| Query template | Green (dim) | `.sql-template` |
| Injected input | Amber background | `.sql-injection` |

### Database Display

- Visible HTML tables in the centre column with neon green borders
- Each table shows all rows and columns from the level's dataset
- **Animations on destructive queries:**
  - `.row-flash-red` — rows turn red before deletion/drop
  - `.row-fade-out` — rows fade and collapse
  - `.dropped` — entire table collapses with max-height transition
  - `.row-updated` — row highlights on UPDATE

### Password Cracker (Level 3)

- 10 character slots displayed as a horizontal row
- Active slot (next to crack) highlighted with green border
- Cracked characters revealed with a `slotReveal` animation
- Progress counter shows `N / 10 characters cracked`

---

## 5. Files

| File | Lines | Code | Comments | Blank | Purpose |
| :--- | ----: | ---: | -------: | ----: | :--- |
| `index.html` | 77 | 63 | 6 | 8 | Page structure — top bar, 3-column CSS Grid, overlay |
| `style.css` | 610 | 570 | 19 | 21 | Dark terminal theme, grid layout, SQL colours, animations |
| `game.js` | 944 | 821 | 57 | 66 | Game engine — state machine, 5 levels, detection, scoring |
| **Total** | **1,631** | **1,454** | **82** | **95** | |

### Dependency Graph

```
index.html
  ├── style.css    (no dependencies)
  └── game.js      (no dependencies — self-contained engine + data)
```

All three files are self-contained. No external libraries, CDN links, or build tools.

---

## 6. Requirements

### Runtime

- Any modern web browser with ES6 support
- No web server required — opens directly from the file system (`file://`)

### Development

- A text editor (VS Code recommended)
- No build step, no `npm install`, no transpilation

### Browser API Dependencies

| API | Usage |
| :--- | :--- |
| `document.getElementById()` | DOM element references |
| `addEventListener()` | Form input, button clicks, keyboard events |
| `innerHTML` | Dynamic content rendering (forms, tables, results) |
| `classList` | Animation triggers (add/remove CSS classes) |
| `setTimeout` | Animation sequencing |
| `RegExp` | Pattern-matching injection detection |

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
| 1 | Menu loads | — | Open `index.html` | Overlay with "Begin Training" button | ✅ |
| 2 | Start game | — | Click "Begin Training" | Mission 1 briefing overlay | ✅ |
| 3 | Mission briefing | 1 | Read briefing | Context, description, tip displayed; "Start Mission" button | ✅ |
| 4 | Comment bypass login | 1 | Type `admin' --` in username | "Login successful! Welcome, admin." + admin row returned | ✅ |
| 5 | Tautology login | 1 | Type `' OR '1'='1' --` in username | All user records returned | ✅ |
| 6 | Real-time query builder | 1 | Type in username field | Live query updates with injection highlighting | ✅ |
| 7 | Explanation panel | 1 | Complete main objective | Explanation with highlighted SQL shown | ✅ |
| 8 | UNION extraction | 2 | Type `' UNION SELECT card_number, expiry FROM credit_cards --` | Credit card data displayed | ✅ |
| 9 | Column mismatch error | 2 | Type `' UNION SELECT * FROM credit_cards --` | Column count mismatch error message | ✅ |
| 10 | Blind boolean test | 3 | Type `1 AND 1=1` then `1 AND 1=2` | "exists" then "not found" | ✅ |
| 11 | Password cracker | 3 | Type `1 AND SUBSTRING(password,1,1)='s'` | First slot reveals 's', progress updates | ✅ |
| 12 | Full password crack | 3 | Crack all 10 characters | Password revealed, level completes | ✅ |
| 13 | DROP TABLE | 4 | Type `'); DROP TABLE users; --` | Table rows flash red, table collapses | ✅ |
| 14 | UPDATE password | 4 | Type `'); UPDATE users SET password='hacked' WHERE username='admin'; --` | Admin password cell updates | ✅ |
| 15 | DB reset button | 4 | Click "↻ Reset Database" | All tables restored | ✅ |
| 16 | Defence Lab fix | 5 | Replace concatenation with `?` + `params` array | "SECURE!" + attack simulation with "BLOCKED ✓" | ✅ |
| 17 | Defence validation — no placeholders | 5 | Submit without `?` | Error: "No ? placeholders found" | ✅ |
| 18 | Defence validation — still concatenating | 5 | Submit with `?` but keep `+ user +` | Error: "Still concatenating user" | ✅ |
| 19 | Level complete overlay | All | Complete all objectives in a level | Score shown, "Next Mission" button | ✅ |
| 20 | Game complete | All | Finish all 5 levels | Final score, key takeaways, "Play Again" button | ✅ |
| 21 | Hint reveal and scoring | 1 | Click "Reveal Hint 1" | Hint text shown, score decreases by 10 | ✅ |
| 22 | Objective progression | 1 | Complete main objective | Bonus objectives become active | ✅ |
| 23 | Responsive layout | — | Resize browser to <900px | Columns stack vertically | ✅ |

### Bugs Found & Fixed

| # | Level | Description | Fix | Status |
| :-: | :---: | :--- | :--- | :---: |
| — | — | No bugs found during testing | — | — |

### Known Limitations

- Pattern-matching detection is less flexible than a full SQL parser — students must use injection patterns close to the expected format.
- Blind injection (Level 3) only supports testing against user ID 1 (admin); a more open-ended approach would require actual SQL execution.
- The Defence Lab validates code structure (has `?`, no concatenation, has `params`) but cannot execute the fixed code against a real database engine.
- Level 1 bonus objective "Make the query return ALL user records" may not be discoverable without hints — the distinction between tautology and comment-bypass isn't explicitly guided.

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

- **Duration:** 53 minutes (wall-clock) · 7s active editor time (WakaTime)
- **AI Tool(s) Used:** GitHub Copilot with Claude Opus 4.6
- **Prompts:** 4 (1 design, 1 failed implementation, 1 design revision, 1 successful implementation)
- **Prompt Strategy:** Collaborative design → failed implementation (SQL parser too complex) → design revision (pattern-matching approach) → successful implementation.
- **Outcome:** Complete working game: 3 source files, 1,631 lines, zero dependencies. Five levels covering attack and defence, with real-time query builder and animated database.
- **Observations:**
  - **Prompt 2 failed** — the original design included a full SQL parser/evaluator (SimDB class with SELECT/INSERT/UPDATE/DELETE/DROP/UNION/SUBSTRING/comment stripping/stacked queries). Combined with a 5-level game engine, this exceeded the model's single-prompt generation capacity (timeout).
  - **Resolution:** Eliminated the SQL parser entirely, replacing it with per-level regex pattern-matching. This preserved the pedagogical core (students see their input become part of SQL) while being implementable in one prompt.
  - **This is the first artifact where a prompt failed and required a design revision** — a significant data point about the limits of single-prompt generation for complex software.
  - **Key insight:** The complexity threshold appears to be around the point where two independently non-trivial systems (parser + game engine) must be generated together. Removing one made the other feasible.

### Testing

- **Round 1:** All 23 test cases passed. No bugs found.
- **Observation:** Level 1 bonus objective "Make the query return ALL user records" required researcher clarification — may indicate insufficient in-game guidance for distinguishing tautology vs comment-bypass techniques.

---

## 10. DSQI Metrics

The Disposable Software Quality Index (DSQI) is the study's primary evaluation metric. It combines four sub-scores:

$$\text{DSQI} = w_1(1-M) + w_2(1-C) + w_3 P + w_4 E$$

with weights $w_1 = 0.3$, $w_2 = 0.2$, $w_3 = 0.3$, $w_4 = 0.2$.

### Raw Metrics

| Metric | Component | Value | Normalised |
| :----- | :-------- | :---- | :--------- |
| M₁: Dependency count | Maintenance | 0 | 0.000 |
| M₂: Cyclomatic complexity avg | Maintenance | 4.6 (max 13) | 0.3067 |
| M₃: Deployment steps | Maintenance | 3 | 0.300 |
| C₁: Lines of code (cloc) | Creation | 1,454 code / 82 comment / 95 blank | 0.2908 |
| C₂: AI generation ratio | Creation | 1.0 (100% AI-generated) | — |
| C₃: Development time | Creation | 53 min wall-clock | 0.1104 |

### Sub-Scores

| Sub-Score | Value | Meaning |
| :-------- | :---- | :------ |
| **M** (Maintenance Cost) | 0.2022 | → (1 − M) = **0.7978** |
| **C** (Creation Cost) | 0.1337 | → (1 − C) = **0.8663** |
| **P** (Pedagogical Alignment) | _awaiting review_ | Module coordinator evaluation |
| **E** (Pedagogical Purity) | _awaiting review_ | Expert panel evaluation |

### Partial DSQI

$$\text{DSQI} = 0.3 \times 0.7978 + 0.2 \times 0.8663 + 0.3P + 0.2E = 0.4126 + 0.3P + 0.2E$$

Full DSQI score will be computed once P and E evaluations are complete.

### WakaTime Session Data

| Metric | Value |
| :----- | :---- |
| WakaTime active time | 7.3s |
| WakaTime % of wall-clock | 0.23% |
| Machine | Andy-LeGearXPS |
| Editor | VS Code |

> **Methodological note:** WakaTime captures only editor-active time. For this artifact, virtually all work occurred in the Copilot chat panel (designing prompts, reviewing output, discussing design revision after prompt failure) — which WakaTime does not track. The 7.3s represents only the time spent with the README template open in the editor.

---

## 11. Technical Summary

| Metric | Value |
| :----- | :---- |
| **Tech Stack** | HTML, CSS, JavaScript (zero dependencies) |
| **Total Lines** | 1,631 (code: 1,454 · comments: 82 · blank: 95) |
| **AI Generation Ratio** | 1.0 (100% AI-generated) |
| **External Dependencies** | 0 |
| **Build Step Required** | No |
| **Deployment Method** | GitHub Pages (static files) |
| **Session Duration** | 53 min wall-clock · 7.3s WakaTime active |
| **Prompts to AI** | 4 (1 failed — first across all artifacts) |
| **Bugs Found in Testing** | 0 |
| **Cyclomatic Complexity** | avg 4.6 · max 13 |
| **DSQI M score** | 0.2022 |
| **DSQI C score** | 0.1337 |
| **DSQI (partial)** | 0.4126 + 0.3P + 0.2E |
| **Levels** | 5 (attack: 4, defence: 1) |
| **Total Objectives** | 14 (5 main + 9 bonus) |
| **Injection Techniques** | 5 (comment, tautology, UNION, blind boolean, stacked queries) |
| **Database Tables** | 5 (users, products, credit_cards, employees, feedback) |
