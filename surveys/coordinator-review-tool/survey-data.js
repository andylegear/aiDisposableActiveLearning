/**
 * survey-data.js — Static data for the DSQI Module Coordinator Review Portal
 *
 * Artifact metadata, ICAP levels, and Likert scale definitions.
 * survey.js imports nothing — both files are loaded as plain <script> tags
 * so these are globals.
 */

// ── Artifact Definitions ────────────────────────────────────

const ARTIFACTS = [
  {
    id: "01-unit-testing-gauntlet",
    name: "The Unit Testing Gauntlet",
    module: "CS5703",
    moduleName: "Software Quality Assurance",
    description:
      "A gamified TDD exercise teaching Red-Green-Refactor through 5 progressive levels.",
    learningObjective:
      "Students will understand the Test-Driven Development cycle by writing failing tests, implementing fixes, and refactoring code.",
    liveUrl:
      "https://your-github-pages-url/artifacts/01-unit-testing-gauntlet/src/",
    repoUrl:
      "https://github.com/your-repo/artifacts/01-unit-testing-gauntlet",
  },
  {
    id: "02-big-o-visualiser",
    name: "The Big-O Dojo",
    module: "CE4003",
    moduleName: "Algorithms and Data Structures",
    description:
      "A martial-arts themed game teaching Big-O notation through code classification, growth curve prediction, and algorithm races.",
    learningObjective:
      "Students will classify algorithm complexity, predict growth behaviour, and compare algorithmic efficiency.",
    liveUrl:
      "https://your-github-pages-url/artifacts/02-big-o-visualiser/src/",
    repoUrl: "https://github.com/your-repo/artifacts/02-big-o-visualiser",
  },
  {
    id: "03-sql-injection-simulator",
    name: "The SQL Injection Lab",
    module: "CE4018",
    moduleName: "Database Systems",
    description:
      "A cybersecurity-themed game where students perform SQL injection attacks on simulated web apps, then learn to defend against them.",
    learningObjective:
      "Students will understand how SQL injection attacks exploit string concatenation vulnerabilities and how parameterised queries prevent them.",
    liveUrl:
      "https://your-github-pages-url/artifacts/03-sql-injection-simulator/src/",
    repoUrl:
      "https://github.com/your-repo/artifacts/03-sql-injection-simulator",
  },
  {
    id: "04-css-flexbox-trainer",
    name: "Flexbox Forge",
    module: "CE4026",
    moduleName: "Web Development",
    description:
      "A forge-themed CSS trainer where students write flexbox properties and see layouts update in real time against target layouts.",
    learningObjective:
      "Students will learn CSS Flexbox properties by writing CSS to match target layouts across 10 progressive levels.",
    liveUrl:
      "https://your-github-pages-url/artifacts/04-css-flexbox-trainer/src/",
    repoUrl: "https://github.com/your-repo/artifacts/04-css-flexbox-trainer",
  },
  {
    id: "05-lexical-analyser-trainer",
    name: "Lex Arena",
    module: "CS4081",
    moduleName: "Compiler Design",
    description:
      "A token-matching game where students write regex patterns to build a lexical analyser, culminating in a full multi-rule tokeniser.",
    learningObjective:
      "Students will understand regular expressions and lexical analysis by writing patterns that tokenise source code.",
    liveUrl:
      "https://your-github-pages-url/artifacts/05-lexical-analyser-trainer/src/",
    repoUrl:
      "https://github.com/your-repo/artifacts/05-lexical-analyser-trainer",
  },
];

// ── ICAP Framework Levels ───────────────────────────────────

const ICAP_LEVELS = [
  {
    value: "passive",
    label: "Passive",
    description: "Receiving information without overt cognitive engagement",
    example: "Watching a video, listening to a lecture",
  },
  {
    value: "active",
    label: "Active",
    description: "Manipulating or physically interacting with materials",
    example:
      "Pausing/restarting a simulation, clicking through predefined examples",
  },
  {
    value: "constructive",
    label: "Constructive",
    description:
      "Generating or producing new outputs beyond what was presented",
    example: "Answering a conceptual question, writing a summary",
  },
  {
    value: "interactive",
    label: "Interactive",
    description:
      "Collaborating, dialoguing, or co-constructing understanding with the system",
    example: "Debating a concept, co-writing a program",
  },
];

// ── Likert Scales ───────────────────────────────────────────

const P1_SCALES = {
  Q1: {
    label:
      "How relevant is the artifact's target learning objective to your module's curriculum?",
    anchors: {
      1: "Not at all relevant",
      2: "Slightly relevant",
      3: "Moderately relevant",
      4: "Very relevant",
      5: "Extremely relevant",
    },
  },
  Q2: {
    label:
      "How well does this artifact address a concept that students typically find challenging in your module?",
    anchors: {
      1: "Does not address a challenging concept",
      2: "Addresses a minor challenge",
      3: "Addresses a moderate challenge",
      4: "Addresses a significant challenge",
      5: "Addresses a critical and persistent challenge",
    },
  },
  Q3: {
    label:
      "To what extent does this artifact cover the intended learning objective?",
    anchors: {
      1: "Very poor coverage",
      2: "Poor coverage",
      3: "Adequate coverage",
      4: "Good coverage",
      5: "Excellent coverage",
    },
  },
};

const ADOPTION_SCALES = {
  Q5: {
    label:
      "How easy would it be to integrate this artifact into your existing module activities (e.g., as an in-class demo, a lab task, a pre-class activity)?",
    anchors: {
      1: "Very difficult",
      2: "Difficult",
      3: "Neither easy nor difficult",
      4: "Easy",
      5: "Very easy",
    },
  },
  Q6: {
    label:
      "Assuming the tool is reliable, how likely would you be to use this artifact in your module?",
    anchors: {
      1: "Very unlikely",
      2: "Unlikely",
      3: "Neutral",
      4: "Likely",
      5: "Very likely",
    },
  },
};
