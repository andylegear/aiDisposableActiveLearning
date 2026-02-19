# Static Analysis Results

This directory holds the raw output of static analysis tools run against each artifact's source code during DSQI evaluation.

## Subdirectories

Each artifact gets its own subdirectory:

```
01-unit-testing-gauntlet/
  cloc-output.json         # Lines of code (from cloc --json)
  complexity-report.json   # Cyclomatic complexity analysis
  dependency-list.json     # npm/pip dependency tree
  lighthouse-report.json   # (optional) If web-based, Lighthouse accessibility/performance
```

## Tools Used

| Tool | Purpose | Install |
| :--- | :--- | :--- |
| `cloc` | Count lines of code by language | `npm install -g cloc` |
| `es-complex` / `radon` | Cyclomatic complexity | Depends on artifact language |
| `npm ls --json` / `pip list --format=json` | Dependency enumeration | Built into package managers |
