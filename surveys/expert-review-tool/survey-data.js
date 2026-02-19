/**
 * survey-data.js — Static data for the DSQI Expert Review Portal
 *
 * All artifact metadata, heuristic definitions, ICAP levels, and
 * Likert scale labels live here. survey.js imports nothing — both
 * files are loaded as plain <script> tags so these are globals.
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
  },
  {
    value: "active",
    label: "Active",
    description: "Manipulating or physically interacting with materials",
  },
  {
    value: "constructive",
    label: "Constructive",
    description:
      "Generating or producing new outputs beyond what was presented",
  },
  {
    value: "interactive",
    label: "Interactive",
    description:
      "Collaborating, dialoguing, or co-constructing understanding with the system",
  },
];

// ── Nielsen's Heuristics + Instructional Scaffolding ────────

const HEURISTICS = [
  {
    key: "visibility_of_status",
    name: "1. Visibility of System Status",
    description:
      "The system keeps users informed about what is going on through appropriate, timely feedback.",
  },
  {
    key: "match_with_real_world",
    name: "2. Match with Real World",
    description:
      "The system uses concepts, language, and conventions familiar to the target learner.",
  },
  {
    key: "user_control_and_freedom",
    name: "3. User Control and Freedom",
    description:
      "Users can easily undo, redo, reset, or exit unwanted states.",
  },
  {
    key: "consistency_and_standards",
    name: "4. Consistency and Standards",
    description:
      "The interface follows platform conventions and is internally consistent.",
  },
  {
    key: "error_prevention",
    name: "5. Error Prevention",
    description:
      "The design prevents errors from occurring in the first place.",
  },
  {
    key: "recognition_over_recall",
    name: "6. Recognition over Recall",
    description:
      "The interface minimises memory load by making options and information visible.",
  },
  {
    key: "flexibility_and_efficiency",
    name: "7. Flexibility and Efficiency",
    description:
      "The system accommodates both novice and experienced users effectively.",
  },
  {
    key: "aesthetic_and_minimalist_design",
    name: "8. Aesthetic and Minimalist Design",
    description:
      "The interface is clean and contains only relevant, necessary information.",
  },
  {
    key: "help_with_errors",
    name: "9. Help Users Recognise and Recover from Errors",
    description:
      "Error messages are clear, constructive, and help users fix the problem.",
  },
  {
    key: "instructional_scaffolding",
    name: "10. Instructional Scaffolding",
    description:
      "The tool provides appropriate guidance, hints, and progressive support for the learning process.",
  },
];

// ── Likert Scale Labels ─────────────────────────────────────

const LIKERT_LABELS = {
  1: "Strongly Disagree",
  2: "Disagree",
  3: "Neutral",
  4: "Agree",
  5: "Strongly Agree",
};

// ── Constructionism Questions ───────────────────────────────

const CONSTRUCTIONISM_Q1 = {
  label:
    "To what extent does the user create a meaningful artifact or output?",
  scale: [
    { value: 1, label: "Not at all", description: "No user-created output" },
    {
      value: 2,
      label: "Minimally",
      description: "Trivial or meaningless output",
    },
    {
      value: 3,
      label: "Somewhat",
      description: "Some meaningful output but limited",
    },
    {
      value: 4,
      label: "Significantly",
      description: "Clear, meaningful artifact created",
    },
    {
      value: 5,
      label: "Extensively",
      description: "Rich, complex artifact that demonstrates understanding",
    },
  ],
};

const CONSTRUCTIONISM_Q2 = {
  label:
    "How well does the tool support learning through building, making, or fixing?",
  scale: [
    {
      value: 1,
      label: "Not at all",
      description: "Purely passive consumption",
    },
    {
      value: 2,
      label: "Poorly",
      description: "Limited building/making activities",
    },
    {
      value: 3,
      label: "Adequately",
      description: "Some building/making with guidance",
    },
    {
      value: 4,
      label: "Well",
      description: "Strong building/making emphasis throughout",
    },
    {
      value: 5,
      label: "Excellently",
      description: "Core mechanic is building/making with rich feedback loops",
    },
  ],
};

// ── DSQI E₁ Conceptual Fidelity Scale ──────────────────────

const E1_SCALE = [
  {
    value: 1,
    label: "Poor",
    description: "The tool includes many distracting or irrelevant features",
  },
  {
    value: 2,
    label: "Below Average",
    description: "Some features are unrelated to the learning objective",
  },
  {
    value: 3,
    label: "Average",
    description: "Mostly focused but some scope creep evident",
  },
  {
    value: 4,
    label: "Good",
    description: "Tightly focused with only minor distractions",
  },
  {
    value: 5,
    label: "Excellent",
    description:
      "Every feature directly serves the stated learning objective",
  },
];

// ── DSQI E₂ Process Replicability Scale ─────────────────────

const E2_SCALE = [
  {
    value: 1,
    label: "Very Difficult",
    description: "Would require extensive specialist expertise and significant time",
  },
  {
    value: 2,
    label: "Difficult",
    description: "Would require significant effort and some specialist knowledge",
  },
  {
    value: 3,
    label: "Moderate",
    description: "Achievable with moderate effort and basic AI tool familiarity",
  },
  {
    value: 4,
    label: "Easy",
    description: "Straightforward process most educators could follow",
  },
  {
    value: 5,
    label: "Very Easy",
    description: "Trivially replicable with minimal effort by any educator",
  },
];
