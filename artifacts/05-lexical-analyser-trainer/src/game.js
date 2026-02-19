/* Lex Arena — game.js (1-level MVP) */
(function () {
  'use strict';

  /* ── Level Data ── */
  const LEVELS = [
    {
      title: 'Number Crunch',
      tokenType: 'INTEGER',
      intro: 'Find all the integer literals in this code. An integer is one or more digits in a row.',
      sourceCode: 'int x = 42;\nfloat pi = 3.14;\nint sum = x + 100;',
      targetRegex: /[0-9]+/g,
      starterPattern: '[0-9]',
      chips: [
        { label: '[0-9]', tip: 'Any single digit' },
        { label: '[a-z]', tip: 'Any lowercase letter' },
        { label: '+', tip: 'One or more of the previous' },
        { label: '*', tip: 'Zero or more of the previous' },
        { label: '\\d', tip: 'Shorthand for [0-9]' },
        { label: '.', tip: 'Any single character' }
      ],
      hints: [
        'You need a character class that matches digits, then a quantifier.',
        'Try [0-9]+ — the + means "one or more".'
      ],
      explanation: 'The pattern [0-9]+ uses a character class [0-9] to match any digit, and the + quantifier to match one or more consecutive digits. This is the foundation of every lexer — recognising number literals.'
    },
    {
      title: 'Go Float',
      tokenType: 'FLOAT',
      intro: 'Now find the floating-point literals. A float has digits, a dot, then more digits.',
      sourceCode: 'int x = 42;\nfloat pi = 3.14;\nint sum = x + 100;',
      targetRegex: /[0-9]+\.[0-9]+/g,
      starterPattern: '[0-9]+',
      chips: [
        { label: '[0-9]', tip: 'Any single digit' },
        { label: '+', tip: 'One or more of the previous' },
        { label: '\\.', tip: 'A literal dot (escaped)' },
        { label: '.', tip: 'Any single character (wildcard)' },
        { label: '*', tip: 'Zero or more of the previous' },
        { label: '\\d', tip: 'Shorthand for [0-9]' }
      ],
      hints: [
        'A float looks like digits, a literal dot, then more digits. Remember: . is special in regex.',
        'Try [0-9]+\\.[0-9]+ — the \\. matches a literal dot.'
      ],
      explanation: 'The pattern [0-9]+\\.[0-9]+ matches floating-point numbers. The key insight is that . in regex means "any character", so you must escape it as \\. to match a literal dot. This distinction between special and literal characters is fundamental to regex.'
    },
    {
      title: 'Name Game',
      tokenType: 'IDENTIFIER',
      intro: 'Find all identifiers — variable and function names. They start with a letter or underscore, followed by letters, digits, or underscores.',
      sourceCode: 'if (count > 0) {\n  int result = count * 2;\n  return result;\n} else {\n  return 0;\n}',
      targetRegex: /[a-zA-Z_][a-zA-Z0-9_]*/g,
      starterPattern: '[a-zA-Z_]',
      chips: [
        { label: '[a-zA-Z_]', tip: 'A letter or underscore' },
        { label: '[a-zA-Z0-9_]', tip: 'A letter, digit, or underscore' },
        { label: '*', tip: 'Zero or more of the previous' },
        { label: '+', tip: 'One or more of the previous' },
        { label: '\\w', tip: 'Shorthand for [a-zA-Z0-9_]' },
        { label: '[0-9]', tip: 'Any single digit' }
      ],
      hints: [
        'An identifier starts with a letter or _, then has zero or more word characters.',
        'Try [a-zA-Z_][a-zA-Z0-9_]* — the first class is the start, * allows the rest.'
      ],
      explanation: 'The pattern [a-zA-Z_][a-zA-Z0-9_]* matches identifiers. The first character class restricts the start to letters and underscore (identifiers can\'t start with a digit), while * allows zero or more continuation characters. Note: this also matches keywords like "if" — we\'ll fix that in the next level!'
    },
    {
      title: 'Reserved Words',
      tokenType: 'KEYWORD',
      intro: 'Now pick out just the keywords: if, else, while, return, int, float. They look like identifiers but are reserved.',
      sourceCode: 'if (count > 0) {\n  int result = count * 2;\n  return result;\n} else {\n  return 0;\n}',
      targetRegex: /\b(if|else|while|return|int|float)\b/g,
      starterPattern: '(if|else)',
      chips: [
        { label: '\\b', tip: 'Word boundary — edge between word and non-word' },
        { label: '|', tip: 'Alternation — match either side' },
        { label: '()', tip: 'Group — combine alternatives' },
        { label: 'if', tip: 'Literal text "if"' },
        { label: 'else', tip: 'Literal text "else"' },
        { label: 'while', tip: 'Literal text "while"' },
        { label: 'return', tip: 'Literal text "return"' },
        { label: 'int', tip: 'Literal text "int"' },
        { label: 'float', tip: 'Literal text "float"' }
      ],
      hints: [
        'Use alternation (|) inside a group to list all keywords. But how do you stop "int" matching inside "print"?',
        'Try \\b(if|else|while|return|int|float)\\b — \\b ensures whole-word matches only.'
      ],
      explanation: 'The pattern \\b(if|else|while|return|int|float)\\b uses alternation (|) inside a group to match any keyword, and word boundaries (\\b) to ensure we match whole words only. Without \\b, "int" would match inside "print". In a real lexer, keywords are checked before identifiers — priority matters!'
    },
    {
      title: 'Operators',
      tokenType: 'OPERATOR',
      intro: 'Find all operators: single characters like + - * / and two-character ones like >=, !=, &&.',
      sourceCode: 'x = a + b;\nif (x >= 10 && y != 0) {\n  msg = "hello";\n}',
      targetRegex: /[+\-*/<>=!&]{1,2}/g,
      starterPattern: '[+\\-*/]',
      chips: [
        { label: '[+\\-*/]', tip: 'Basic arithmetic operators' },
        { label: '[<>=!]', tip: 'Comparison characters' },
        { label: '&', tip: 'Ampersand character' },
        { label: '{1,2}', tip: 'Between 1 and 2 of the previous' },
        { label: '+', tip: 'One or more of the previous' },
        { label: '?', tip: 'Zero or one of the previous (optional)' }
      ],
      hints: [
        'You need a character class with all operator characters. Some operators are 2 chars long (>=, !=, &&).',
        'Try [+\\-*/<>=!&]{1,2} — the {1,2} quantifier matches 1 or 2 characters from the class.'
      ],
      explanation: 'The pattern [+\\-*/<>=!&]{1,2} uses a character class of operator characters and {1,2} to match sequences of 1 or 2 characters. This is a simplified approach — a production lexer would enumerate each multi-character operator explicitly. Note the escaped hyphen \\- inside the character class.'
    },
    {
      title: 'Strung Along',
      tokenType: 'STRING',
      intro: 'Find string literals — text enclosed in double quotes. Be careful not to match across multiple strings!',
      sourceCode: 'x = a + b;\nif (x >= 10 && y != 0) {\n  msg = "hello";\n  name = "Alice";\n}',
      targetRegex: /"[^"]*"/g,
      starterPattern: '"',
      chips: [
        { label: '"', tip: 'A literal double-quote character' },
        { label: '[^"]', tip: 'Any character except a double-quote' },
        { label: '*', tip: 'Zero or more of the previous' },
        { label: '+', tip: 'One or more of the previous' },
        { label: '.*', tip: 'Any characters (greedy — matches as much as possible!)' },
        { label: '.', tip: 'Any single character' }
      ],
      hints: [
        'A string starts with ", has characters that are NOT ", and ends with ". What does [^"] mean?',
        'Try "[^"]*" — the negated class [^"] matches anything except a quote, so it stops at the closing quote.'
      ],
      explanation: 'The pattern "[^"]*" uses a negated character class [^"] to match any character except a double-quote, wrapped between literal quotes. This avoids the greedy trap: ".*" would match from the first quote all the way to the LAST quote on the line, swallowing everything in between. Negated classes are how real lexers handle delimited tokens.'
    },
    {
      title: 'No Comment',
      tokenType: 'COMMENT',
      intro: 'Find both single-line (//) and multi-line (/* */) comments. You\'ll need alternation to handle both styles.',
      sourceCode: '// Calculate sum\nint total = 0; // running total\n/* multi-line\n   comment */\nreturn total;',
      targetRegex: /\/\/.*|\/\*[\s\S]*?\*\//g,
      starterPattern: '//.*',
      chips: [
        { label: '\\/\\/', tip: 'Escaped //' },
        { label: '.*', tip: 'Any characters to end of line' },
        { label: '|', tip: 'Alternation — match either side' },
        { label: '\\/\\*', tip: 'Escaped /*' },
        { label: '\\*\\/', tip: 'Escaped */' },
        { label: '[\\s\\S]*?', tip: 'Any character including newlines (lazy)' },
        { label: '[\\s\\S]*', tip: 'Any character including newlines (greedy)' },
        { label: '?', tip: 'Make the previous quantifier lazy' }
      ],
      hints: [
        'Single-line: //.*  Multi-line: needs to match across newlines. The dot . doesn\'t match \\n — use [\\s\\S] instead.',
        'Try \\/\\/.*|\\/\\*[\\s\\S]*?\\*\\/ — the ? after * makes it lazy so it stops at the first */.'
      ],
      explanation: 'The pattern \\/\\/.*|\\/\\*[\\s\\S]*?\\*\\/ handles both comment styles with alternation (|). Single-line comments use .* which stops at the newline. Multi-line comments use [\\s\\S]*? — the \\s\\S trick matches ANY character including newlines (since . doesn\'t), and the ? makes it lazy to stop at the first */ instead of the last. Lazy vs greedy quantifiers are critical in lexer design!'    },
    {
      title: 'The Full Lexer',
      tokenType: 'ALL',
      intro: 'Combine all your patterns into a complete lexer! Arrange the rules in the right priority order — hint: keywords must come before identifiers, and floats before integers.',
      sourceCode: '// Fibonacci\nint fibonacci(int n) {\n  if (n <= 1) {\n    return n;\n  }\n  /* Recursive case */\n  int a = fibonacci(n - 1);\n  int b = fibonacci(n - 2);\n  return a + b;\n}',
      targetRules: [
        { type: 'COMMENT',    regex: /\/\/.*|\/\*[\s\S]*?\*\//g },
        { type: 'KEYWORD',    regex: /\b(if|else|while|return|int|float)\b/g },
        { type: 'FLOAT',      regex: /[0-9]+\.[0-9]+/g },
        { type: 'INTEGER',    regex: /[0-9]+/g },
        { type: 'IDENTIFIER', regex: /[a-zA-Z_][a-zA-Z0-9_]*/g },
        { type: 'STRING',     regex: /"[^"]*"/g },
        { type: 'OPERATOR',   regex: /[+\-*/<>=!&]{1,2}/g }
      ],
      defaultPatterns: {
        COMMENT:    '\/\/.*|\/\*[\\s\\S]*?\\*\/',
        KEYWORD:    '\\b(if|else|while|return|int|float)\\b',
        FLOAT:      '[0-9]+\\.[0-9]+',
        INTEGER:    '[0-9]+',
        IDENTIFIER: '[a-zA-Z_][a-zA-Z0-9_]*',
        STRING:     '"[^"]*"',
        OPERATOR:   '[+\\-*/<>=!&]{1,2}'
      },
      chips: [],
      hints: [
        'Keywords like "if" also match the identifier pattern. Which rule should come first?',
        'Put KEYWORD before IDENTIFIER, and FLOAT before INTEGER. Comments should be first to avoid partial matches.'
      ],
      explanation: 'A lexer tries each rule in order at each position — the first match wins. This means KEYWORD must come before IDENTIFIER (otherwise "if" is matched as an identifier), and FLOAT before INTEGER (otherwise "3" in "3.14" is matched as an integer). Rule priority is the heart of lexical analysis!'    }
  ];

  /* ── State ── */
  const state = {
    phase: 'menu',        // menu | levelIntro | playing | levelComplete | gameComplete
    level: 0,
    score: 0,
    hintsUsed: 0,
    savedPatterns: []
  };

  /* ── DOM refs ── */
  const $ = (sel) => document.querySelector(sel);
  const overlay = $('#overlay');
  const overlayContent = $('#overlay-content');
  const sourceDisplay = $('#source-display');
  const tokenStream = $('#token-stream');
  const matchBar = $('#match-bar');
  const matchPct = $('#match-pct');
  const feedbackText = $('#feedback-text');
  const referenceChips = $('#reference-chips');
  const hintsList = $('#hints-list');
  const explanationPanel = $('#explanation-panel');
  const explanationText = $('#explanation-text');
  const levelTitle = $('#level-title');
  const progressEl = $('#progress');
  const scoreEl = $('#score');
  const targetType = $('#target-type');

  /* ── CodeMirror ── */
  let cmEditor = null;

  function initCodeMirror() {
    cmEditor = CodeMirror.fromTextArea($('#regex-input'), {
      lineNumbers: false,
      scrollbarStyle: 'null',
      lineWrapping: false
    });
    cmEditor.setSize('100%', 40);
    cmEditor.on('change', onPatternChange);
  }

  /* ── Overlay Helpers ── */
  function showOverlay(html) {
    overlayContent.innerHTML = html;
    overlay.classList.remove('hidden');
    const btn = overlayContent.querySelector('.btn');
    if (btn) btn.focus();
  }

  function hideOverlay() {
    overlay.classList.add('hidden');
  }

  /* ── Screens ── */
  function showMenu() {
    state.phase = 'menu';
    showOverlay(
      '<h1>⚔️ Lex Arena</h1>' +
      '<p class="subtitle">Build a Lexer, Block by Block</p>' +
      '<p>Learn how lexical analysers break source code into tokens by writing regex patterns.</p>' +
      '<button class="btn" id="btn-start">Enter the Arena</button>'
    );
    $('#btn-start').addEventListener('click', () => showLevelIntro());
  }

  function showLevelIntro() {
    const lv = LEVELS[state.level];
    state.phase = 'levelIntro';
    showOverlay(
      '<h2>Level ' + (state.level + 1) + ': ' + lv.title + '</h2>' +
      '<p>' + lv.intro + '</p>' +
      '<button class="btn" id="btn-go">Let\'s Go</button>'
    );
    $('#btn-go').addEventListener('click', () => startLevel());
  }

  function showLevelComplete(earned) {
    const lv = LEVELS[state.level];
    state.phase = 'levelComplete';
    explanationPanel.style.display = 'block';
    explanationText.textContent = lv.explanation;
    showOverlay(
      '<h2>✅ Level Complete!</h2>' +
      '<p>+' + earned + ' points</p>' +
      '<p style="font-size:0.85rem;color:var(--text-dim);">' + lv.explanation + '</p>' +
      '<button class="btn" id="btn-next">' +
      (state.level < LEVELS.length - 1 ? 'Next Level' : 'Finish') +
      '</button>'
    );
    $('#btn-next').addEventListener('click', () => {
      if (state.level < LEVELS.length - 1) {
        state.level++;
        showLevelIntro();
      } else {
        showGameComplete();
      }
    });
  }

  function showGameComplete() {
    state.phase = 'gameComplete';
    const max = LEVELS.length * 150;
    showOverlay(
      '<h1>🏆 Arena Complete!</h1>' +
      '<p>Final Score: ' + state.score + ' / ' + max + '</p>' +
      '<button class="btn" id="btn-replay">Play Again</button>'
    );
    $('#btn-replay').addEventListener('click', () => {
      state.level = 0;
      state.score = 0;
      state.hintsUsed = 0;
      state.savedPatterns = [];
      showMenu();
    });
  }

  /* ── Level Setup ── */
  function startLevel() {
    const lv = LEVELS[state.level];
    state.phase = 'playing';
    state.hintsUsed = 0;
    hideOverlay();
    explanationPanel.style.display = 'none';

    // Update header
    levelTitle.textContent = 'Level ' + (state.level + 1) + ': ' + lv.title;
    progressEl.textContent = 'Level ' + (state.level + 1) + ' / ' + LEVELS.length;
    scoreEl.textContent = 'Score: ' + state.score;
    targetType.textContent = lv.tokenType;

    // Source
    sourceDisplay.textContent = lv.sourceCode;

    // Clear token stream
    tokenStream.innerHTML = '';

    // Match bar reset
    matchBar.style.width = '0%';
    matchPct.textContent = '0%';
    feedbackText.textContent = lv.tokenType === 'ALL' ? 'Reorder the rules, then click Run Lexer.' : 'Type a regex pattern above...';
    feedbackText.classList.remove('error');

    const isCapstone = lv.tokenType === 'ALL';
    const editorPanel = $('#editor-panel');
    const refPanel = $('#reference-panel');
    const rulePanel = $('#rule-editor-panel');

    if (isCapstone) {
      // Hide normal editor + reference, show rule editor
      editorPanel.style.display = 'none';
      refPanel.style.display = 'none';
      rulePanel.style.display = 'block';
      setupRuleEditor(lv);
    } else {
      editorPanel.style.display = 'block';
      refPanel.style.display = 'block';
      rulePanel.style.display = 'none';

      // Chips
      referenceChips.innerHTML = '';
      lv.chips.forEach(c => {
        const el = document.createElement('span');
        el.className = 'chip';
        el.textContent = c.label;
        el.title = c.tip;
        el.addEventListener('click', () => {
          cmEditor.replaceSelection(c.label);
          cmEditor.focus();
        });
        referenceChips.appendChild(el);
      });

      // Editor
      cmEditor.setValue(lv.starterPattern);
      cmEditor.focus();
      onPatternChange();
    }

    // Hints
    hintsList.innerHTML = '';
    lv.hints.forEach((h, i) => {
      const btn = document.createElement('button');
      btn.className = 'hint-btn';
      btn.textContent = 'Hint ' + (i + 1);
      btn.addEventListener('click', () => {
        if (!btn.classList.contains('revealed')) {
          btn.classList.add('revealed');
          btn.textContent = h;
          state.hintsUsed++;
        }
      });
      hintsList.appendChild(btn);
    });
  }

  /* ── Level 8: Rule Editor ── */
  function setupRuleEditor(lv) {
    const ruleList = $('#rule-list');
    ruleList.innerHTML = '';

    // Build initial rule order (deliberately wrong — IDENTIFIER before KEYWORD, INTEGER before FLOAT)
    const ruleOrder = [
      'INTEGER', 'FLOAT', 'IDENTIFIER', 'KEYWORD', 'OPERATOR', 'STRING', 'COMMENT'
    ];

    // Override with saved patterns from earlier levels
    const patterns = {};
    ruleOrder.forEach(type => {
      patterns[type] = lv.defaultPatterns[type] || '';
    });
    // If student saved patterns from earlier levels, use those
    const typeMap = ['INTEGER','FLOAT','IDENTIFIER','KEYWORD','OPERATOR','STRING','COMMENT'];
    typeMap.forEach((type, i) => {
      if (state.savedPatterns[i]) patterns[type] = state.savedPatterns[i];
    });

    state.ruleOrder = [...ruleOrder];
    state.rulePatterns = patterns;

    renderRuleRows();

    $('#btn-run-lexer').onclick = () => runCapstone(lv);
  }

  function renderRuleRows() {
    const ruleList = $('#rule-list');
    ruleList.innerHTML = '';
    const colors = {
      INTEGER:'var(--tok-number)', FLOAT:'var(--tok-float)', IDENTIFIER:'var(--tok-identifier)',
      KEYWORD:'var(--tok-keyword)', OPERATOR:'var(--tok-operator)', STRING:'var(--tok-string)', COMMENT:'var(--tok-comment)'
    };
    state.ruleOrder.forEach((type, i) => {
      const row = document.createElement('div');
      row.className = 'rule-row';
      row.innerHTML =
        '<span class="rule-label" style="color:' + (colors[type]||'var(--text)') + ';">' + type + '</span>' +
        '<span class="rule-pattern">' + escapeHtml(state.rulePatterns[type]) + '</span>' +
        '<span class="rule-btns">' +
          '<button class="rule-btn" data-dir="up" data-idx="' + i + '">▲</button>' +
          '<button class="rule-btn" data-dir="down" data-idx="' + i + '">▼</button>' +
        '</span>';
      ruleList.appendChild(row);
    });
    ruleList.querySelectorAll('.rule-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.idx);
        const dir = btn.dataset.dir;
        if (dir === 'up' && idx > 0) {
          [state.ruleOrder[idx], state.ruleOrder[idx - 1]] = [state.ruleOrder[idx - 1], state.ruleOrder[idx]];
        } else if (dir === 'down' && idx < state.ruleOrder.length - 1) {
          [state.ruleOrder[idx], state.ruleOrder[idx + 1]] = [state.ruleOrder[idx + 1], state.ruleOrder[idx]];
        }
        renderRuleRows();
      });
    });
  }

  function runCapstone(lv) {
    const src = lv.sourceCode;

    // Build student lexer from rule order
    const studentTokens = runLexer(src, state.ruleOrder, state.rulePatterns);
    // Build expected tokens from target rule order
    const expectedTokens = runLexer(src, lv.targetRules.map(r => r.type),
      Object.fromEntries(lv.targetRules.map(r => [r.type, r.regex.source])));

    // Compare
    let correct = 0;
    const minLen = Math.min(studentTokens.length, expectedTokens.length);
    for (let i = 0; i < minLen; i++) {
      if (studentTokens[i].type === expectedTokens[i].type &&
          studentTokens[i].text === expectedTokens[i].text &&
          studentTokens[i].index === expectedTokens[i].index) {
        correct++;
      }
    }
    const pct = expectedTokens.length === 0 ? 0 : Math.round((correct / expectedTokens.length) * 100);

    // Update UI
    matchBar.style.width = pct + '%';
    matchPct.textContent = pct + '%';
    feedbackText.classList.remove('error');
    feedbackText.textContent = correct + ' / ' + expectedTokens.length + ' tokens correct (' + pct + '%)';

    // Highlight source with multi-type tokens
    highlightSourceMulti(src, studentTokens);
    buildTokenTableMulti(studentTokens);

    if (pct >= 100) {
      setTimeout(() => {
        if (state.phase !== 'playing') return;
        const bonus = state.hintsUsed === 0 ? 50 : 0;
        const earned = 100 - (state.hintsUsed * 10) + bonus;
        state.score += Math.max(0, earned);
        scoreEl.textContent = 'Score: ' + state.score;
        showLevelComplete(Math.max(0, earned));
      }, 400);
    }
  }

  function runLexer(src, ruleOrder, patterns) {
    const tokens = [];
    let pos = 0;
    while (pos < src.length) {
      let matched = false;
      for (const type of ruleOrder) {
        const patternStr = patterns[type];
        if (!patternStr) continue;
        let regex;
        try { regex = new RegExp(patternStr, 'g'); } catch(e) { continue; }
        regex.lastIndex = pos;
        const m = regex.exec(src);
        if (m && m.index === pos && m[0].length > 0) {
          tokens.push({ type: type, text: m[0], index: pos });
          pos += m[0].length;
          matched = true;
          break;
        }
      }
      if (!matched) pos++; // skip whitespace / unknown
    }
    return tokens;
  }

  function highlightSourceMulti(src, tokens) {
    if (tokens.length === 0) { sourceDisplay.textContent = src; return; }
    const sorted = [...tokens].sort((a, b) => a.index - b.index);
    let html = '';
    let last = 0;
    sorted.forEach(t => {
      if (t.index < last) return;
      html += escapeHtml(src.slice(last, t.index));
      html += '<span class="token-' + t.type + '">' + escapeHtml(t.text) + '</span>';
      last = t.index + t.text.length;
    });
    html += escapeHtml(src.slice(last));
    sourceDisplay.innerHTML = html;
  }

  function buildTokenTableMulti(tokens) {
    if (tokens.length === 0) {
      tokenStream.innerHTML = '<p style="color:var(--text-dim);font-size:0.85rem;">No tokens matched yet.</p>';
      return;
    }
    let html = '<table><tr><th>#</th><th>Type</th><th>Lexeme</th><th>Position</th></tr>';
    tokens.forEach((t, i) => {
      html += '<tr><td>' + (i + 1) + '</td><td>' + t.type +
        '</td><td>' + escapeHtml(t.text) + '</td><td>' + t.index + '</td></tr>';
    });
    html += '</table>';
    tokenStream.innerHTML = html;
  }

  /* ── Match Checking ── */
  function onPatternChange() {
    if (state.phase !== 'playing') return;
    const lv = LEVELS[state.level];
    const pattern = cmEditor.getValue().trim();

    if (!pattern) {
      sourceDisplay.textContent = lv.sourceCode;
      tokenStream.innerHTML = '';
      matchBar.style.width = '0%';
      matchPct.textContent = '0%';
      feedbackText.textContent = 'Type a regex pattern above...';
      feedbackText.classList.remove('error');
      return;
    }

    // Try compile
    let regex;
    try {
      regex = new RegExp(pattern, 'g');
    } catch (e) {
      feedbackText.textContent = 'Invalid regex: ' + e.message;
      feedbackText.classList.add('error');
      sourceDisplay.textContent = lv.sourceCode;
      tokenStream.innerHTML = '';
      matchBar.style.width = '0%';
      matchPct.textContent = '0%';
      return;
    }
    feedbackText.classList.remove('error');

    // Guard against zero-length infinite matches
    const testMatch = regex.exec('');
    regex.lastIndex = 0;
    if (testMatch && testMatch[0].length === 0 && pattern !== '') {
      feedbackText.textContent = 'Pattern matches empty strings — add a quantifier like +';
      sourceDisplay.textContent = lv.sourceCode;
      tokenStream.innerHTML = '';
      matchBar.style.width = '0%';
      matchPct.textContent = '0%';
      return;
    }

    // Get student matches
    const studentMatches = [];
    let m;
    const src = lv.sourceCode;
    while ((m = regex.exec(src)) !== null) {
      if (m[0].length === 0) { regex.lastIndex++; continue; }
      studentMatches.push({ text: m[0], index: m.index });
    }

    // Get expected matches
    const expectedRegex = new RegExp(lv.targetRegex.source, lv.targetRegex.flags);
    const expectedMatches = [];
    while ((m = expectedRegex.exec(src)) !== null) {
      if (m[0].length === 0) { expectedRegex.lastIndex++; continue; }
      expectedMatches.push({ text: m[0], index: m.index });
    }

    // Compare
    let correct = 0;
    const expectedSet = new Set(expectedMatches.map(e => e.index + ':' + e.text));
    const studentSet = new Set(studentMatches.map(e => e.index + ':' + e.text));
    studentSet.forEach(s => { if (expectedSet.has(s)) correct++; });
    const falsePositives = studentMatches.length - correct;
    const pct = expectedMatches.length === 0 ? 0 :
      Math.max(0, Math.round(((correct - falsePositives) / expectedMatches.length) * 100));

    // Update match bar
    matchBar.style.width = pct + '%';
    matchPct.textContent = pct + '%';
    feedbackText.textContent = studentMatches.length + ' match' +
      (studentMatches.length !== 1 ? 'es' : '') + ' found' +
      (falsePositives > 0 ? ' (' + falsePositives + ' extra)' : '');

    // Highlight source
    highlightSource(lv.sourceCode, studentMatches, lv.tokenType);

    // Token stream table
    buildTokenTable(studentMatches, lv.tokenType);

    // Level complete?
    if (pct >= 100) {
      setTimeout(() => {
        if (state.phase !== 'playing') return;
        const bonus = state.hintsUsed === 0 ? 50 : 0;
        const earned = 100 - (state.hintsUsed * 10) + bonus;
        state.score += Math.max(0, earned);
        state.savedPatterns[state.level] = pattern;
        scoreEl.textContent = 'Score: ' + state.score;
        showLevelComplete(Math.max(0, earned));
      }, 400);
    }
  }

  /* ── Source Highlighting ── */
  function highlightSource(src, matches, tokenType) {
    if (matches.length === 0) {
      sourceDisplay.textContent = src;
      return;
    }

    // Sort by position
    const sorted = [...matches].sort((a, b) => a.index - b.index);
    let html = '';
    let last = 0;

    sorted.forEach(m => {
      if (m.index < last) return; // skip overlaps
      html += escapeHtml(src.slice(last, m.index));
      html += '<span class="token-' + tokenType + '">' + escapeHtml(m.text) + '</span>';
      last = m.index + m.text.length;
    });
    html += escapeHtml(src.slice(last));
    sourceDisplay.innerHTML = html;
  }

  function escapeHtml(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  /* ── Token Stream Table ── */
  function buildTokenTable(matches, tokenType) {
    if (matches.length === 0) {
      tokenStream.innerHTML = '<p style="color:var(--text-dim);font-size:0.85rem;">No tokens matched yet.</p>';
      return;
    }
    let html = '<table><tr><th>#</th><th>Type</th><th>Lexeme</th><th>Position</th></tr>';
    matches.forEach((m, i) => {
      html += '<tr><td>' + (i + 1) + '</td><td>' + tokenType +
        '</td><td>' + escapeHtml(m.text) + '</td><td>' + m.index + '</td></tr>';
    });
    html += '</table>';
    tokenStream.innerHTML = html;
  }

  /* ── Init ── */
  function init() {
    initCodeMirror();
    showMenu();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
