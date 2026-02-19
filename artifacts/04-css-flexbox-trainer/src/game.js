/* ================================================================
   Flexbox Forge — Game Engine
   Uses CodeMirror 5 for CSS editing, highlight.js for HTML viewing.
   ================================================================ */

(function () {
  'use strict';

  /* ── DOM refs ─────────────────────────────────────────────── */
  const $  = id => document.getElementById(id);
  const el = {
    levelName : $('level-name'),
    progress  : $('progress'),
    score     : $('score-display'),
    htmlViewer: $('html-viewer'),
    cssEditor : $('css-editor'),
    refChips  : $('reference-chips'),
    hintsList : $('hints-list'),
    targetFrame : $('target-frame'),
    previewFrame: $('preview-frame'),
    matchBar  : $('match-bar'),
    matchText : $('match-text'),
    explanation : $('explanation-content'),
    explanPanel : $('explanation-panel'),
    overlay   : $('overlay'),
    overlayCon: $('overlay-content')
  };

  /* ── CodeMirror setup ─────────────────────────────────────── */
  const cmEditor = CodeMirror.fromTextArea(el.cssEditor, {
    mode: 'css',
    theme: 'material-darker',
    lineNumbers: false,
    lineWrapping: true,
    tabSize: 2,
    indentWithTabs: false,
    autofocus: false
  });

  /* ── Game state ───────────────────────────────────────────── */
  let state = {
    phase: 'menu',          // menu | levelIntro | playing | levelComplete | gameComplete
    currentLevel: 0,        // 0-indexed
    score: 0,
    hintsUsed: 0,
    hintsRevealedThisLevel: 0
  };

  /* ── Iframe srcdoc builder ────────────────────────────────── */
  const ITEM_COLORS = ['#e94560', '#f5a623', '#533483', '#0f3460', '#00e676'];
  const ITEM_LABELS = ['A', 'B', 'C', 'D', 'E'];

  function buildSrcdoc(htmlBody, css) {
    return `<!DOCTYPE html>
<html><head><style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #f5f5f5; padding: 10px; font-family: sans-serif; }
  .container { background: #fff; border: 1px solid #ddd; border-radius: 6px; padding: 10px; min-height: 80px; }
  .item { width: 60px; height: 60px; display: flex; align-items: center; justify-content: center;
          color: #fff; font-weight: 700; font-size: 1.1rem; border-radius: 6px; }
${ITEM_COLORS.map((c, i) => `  .item.${ITEM_LABELS[i].toLowerCase()} { background: ${c}; }`).join('\n')}
  /* Level-specific base styles injected per-level */
${css}
</style></head><body>${htmlBody}</body></html>`;
  }

  /* ── Levels ───────────────────────────────────────────────── */
  const LEVELS = [
    /* 0 — First Flex */
    {
      title: 'First Flex',
      intro: 'Turn a stack of boxes into a row using <span class="new-property">display: flex</span>.',
      html: `<div class="container">\n  <div class="item a">A</div>\n  <div class="item b">B</div>\n  <div class="item c">C</div>\n</div>`,
      starterCSS: '.container {\n  \n}',
      targetCSS: '.container {\n  display: flex;\n}',
      checkProperties: { '.container': { 'display': 'flex' } },
      allowedProperties: ['display'],
      referenceChips: [
        { name: 'display', desc: 'block | flex | grid …' }
      ],
      hints: [
        'Flex containers are created with a single property on the parent.',
        'Try: display: flex;'
      ],
      explanation: '<code>display: flex</code> turns a block container into a flex container. Its children become flex items that lay out in a row by default.'
    },

    /* 1 — Direction */
    {
      title: 'Direction',
      intro: 'Arrange items in a column using <span class="new-property">flex-direction</span>.',
      html: `<div class="container">\n  <div class="item a">A</div>\n  <div class="item b">B</div>\n  <div class="item c">C</div>\n</div>`,
      starterCSS: '.container {\n  display: flex;\n  \n}',
      targetCSS: '.container {\n  display: flex;\n  flex-direction: column;\n}',
      checkProperties: { '.container': { 'display': 'flex', 'flex-direction': 'column' } },
      allowedProperties: ['display', 'flex-direction'],
      referenceChips: [
        { name: 'flex-direction', desc: 'row | row-reverse | column | column-reverse' }
      ],
      hints: [
        'The main axis can be changed with flex-direction.',
        'Try: flex-direction: column;'
      ],
      explanation: '<code>flex-direction: column</code> changes the main axis from horizontal to vertical, stacking items top-to-bottom.'
    },

    /* 2 — Pack the Line */
    {
      title: 'Pack the Line',
      intro: 'Centre items horizontally with <span class="new-property">justify-content</span>.',
      html: `<div class="container">\n  <div class="item a">A</div>\n  <div class="item b">B</div>\n  <div class="item c">C</div>\n</div>`,
      starterCSS: '.container {\n  display: flex;\n  \n}',
      targetCSS: '.container {\n  display: flex;\n  justify-content: center;\n}',
      checkProperties: { '.container': { 'display': 'flex', 'justify-content': 'center' } },
      allowedProperties: ['display', 'justify-content'],
      referenceChips: [
        { name: 'justify-content', desc: 'flex-start | center | flex-end | space-between | space-around | space-evenly' }
      ],
      hints: [
        'justify-content controls alignment along the main axis.',
        'Try: justify-content: center;'
      ],
      explanation: '<code>justify-content: center</code> packs flex items toward the centre of the main axis.'
    },

    /* 3 — Cross Check */
    {
      title: 'Cross Check',
      intro: 'Vertically centre items with <span class="new-property">align-items</span>.',
      html: `<div class="container">\n  <div class="item a">A</div>\n  <div class="item b">B</div>\n  <div class="item c">C</div>\n</div>`,
      starterCSS: '.container {\n  display: flex;\n  height: 200px;\n  \n}',
      targetCSS: '.container {\n  display: flex;\n  height: 200px;\n  align-items: center;\n}',
      checkProperties: { '.container': { 'display': 'flex', 'align-items': 'center' } },
      allowedProperties: ['display', 'align-items'],
      referenceChips: [
        { name: 'align-items', desc: 'stretch | flex-start | center | flex-end | baseline' }
      ],
      hints: [
        'align-items controls alignment on the cross axis.',
        'Try: align-items: center;'
      ],
      explanation: '<code>align-items: center</code> centres items along the cross axis (vertical when flex-direction is row).',
      extraContainerCSS: 'height: 200px;'
    },

    /* 4 — Wrap It */
    {
      title: 'Wrap It',
      intro: 'Let items wrap onto new lines with <span class="new-property">flex-wrap</span>.',
      html: `<div class="container">\n  <div class="item a">A</div>\n  <div class="item b">B</div>\n  <div class="item c">C</div>\n  <div class="item d">D</div>\n  <div class="item e">E</div>\n</div>`,
      starterCSS: '.container {\n  display: flex;\n  width: 200px;\n  \n}',
      targetCSS: '.container {\n  display: flex;\n  width: 200px;\n  flex-wrap: wrap;\n}',
      checkProperties: { '.container': { 'display': 'flex', 'flex-wrap': 'wrap' } },
      allowedProperties: ['display', 'flex-wrap'],
      referenceChips: [
        { name: 'flex-wrap', desc: 'nowrap | wrap | wrap-reverse' }
      ],
      hints: [
        'By default flex items try to fit on one line. There\'s a property to change that.',
        'Try: flex-wrap: wrap;'
      ],
      explanation: '<code>flex-wrap: wrap</code> allows items to flow onto the next line when they run out of room.',
      extraContainerCSS: 'width: 200px;'
    },

    /* 5 — Mind the Gap */
    {
      title: 'Mind the Gap',
      intro: 'Add spacing between items with <span class="new-property">gap</span>.',
      html: `<div class="container">\n  <div class="item a">A</div>\n  <div class="item b">B</div>\n  <div class="item c">C</div>\n</div>`,
      starterCSS: '.container {\n  display: flex;\n  \n}',
      targetCSS: '.container {\n  display: flex;\n  gap: 20px;\n}',
      checkProperties: { '.container': { 'display': 'flex', 'gap': '20px' } },
      allowedProperties: ['display', 'gap'],
      referenceChips: [
        { name: 'gap', desc: 'e.g. 10px, 1rem — space between items' }
      ],
      hints: [
        'gap adds space between flex items without affecting the edges.',
        'Try: gap: 20px;'
      ],
      explanation: '<code>gap</code> adds gutters between flex items. Unlike margins, it only applies between items, not on the outer edges.'
    },

    /* 6 — Grow & Shrink */
    {
      title: 'Grow & Shrink',
      intro: 'Make item B fill remaining space with <span class="new-property">flex-grow</span>.',
      html: `<div class="container">\n  <div class="item a">A</div>\n  <div class="item b">B</div>\n  <div class="item c">C</div>\n</div>`,
      starterCSS: '.container {\n  display: flex;\n}\n\n.item.b {\n  \n}',
      targetCSS: '.container {\n  display: flex;\n}\n\n.item.b {\n  flex-grow: 1;\n}',
      checkProperties: { '.container': { 'display': 'flex' }, '.item.b': { 'flex-grow': '1' } },
      allowedProperties: ['display', 'flex-grow', 'flex-shrink'],
      referenceChips: [
        { name: 'flex-grow', desc: '0 (default) | 1 | 2 … — grow factor' },
        { name: 'flex-shrink', desc: '1 (default) | 0 — shrink factor' }
      ],
      hints: [
        'flex-grow tells an item how much of the leftover space it should take.',
        'Try adding flex-grow: 1; to the .item.b rule.'
      ],
      explanation: '<code>flex-grow: 1</code> tells item B to absorb all remaining space in the container. A value of 0 (default) means "don\'t grow".'
    },

    /* 7 — Stand Out */
    {
      title: 'Stand Out',
      intro: 'Override alignment for one item with <span class="new-property">align-self</span>.',
      html: `<div class="container">\n  <div class="item a">A</div>\n  <div class="item b">B</div>\n  <div class="item c">C</div>\n</div>`,
      starterCSS: '.container {\n  display: flex;\n  height: 200px;\n  align-items: flex-start;\n}\n\n.item.c {\n  \n}',
      targetCSS: '.container {\n  display: flex;\n  height: 200px;\n  align-items: flex-start;\n}\n\n.item.c {\n  align-self: flex-end;\n}',
      checkProperties: {
        '.container': { 'display': 'flex', 'align-items': 'flex-start' },
        '.item.c': { 'align-self': 'flex-end' }
      },
      allowedProperties: ['display', 'align-items', 'align-self'],
      referenceChips: [
        { name: 'align-self', desc: 'auto | flex-start | center | flex-end | stretch' }
      ],
      hints: [
        'align-self overrides the container\'s align-items for one item.',
        'Try: align-self: flex-end; on .item.c'
      ],
      explanation: '<code>align-self</code> overrides <code>align-items</code> for an individual flex item, letting it break from the group.',
      extraContainerCSS: 'height: 200px;'
    },

    /* 8 — Reorder */
    {
      title: 'Reorder',
      intro: 'Change visual order without changing HTML using <span class="new-property">order</span>.',
      html: `<div class="container">\n  <div class="item a">A</div>\n  <div class="item b">B</div>\n  <div class="item c">C</div>\n</div>`,
      starterCSS: '.container {\n  display: flex;\n}\n\n.item.a {\n  \n}',
      targetCSS: '.container {\n  display: flex;\n}\n\n.item.a {\n  order: 3;\n}',
      checkProperties: { '.container': { 'display': 'flex' }, '.item.a': { 'order': '3' } },
      allowedProperties: ['display', 'order'],
      referenceChips: [
        { name: 'order', desc: '0 (default) | integer — visual order' }
      ],
      hints: [
        'All items have order: 0 by default. A higher order pushes an item later.',
        'Try: order: 3; on .item.a to move A to the end.'
      ],
      explanation: '<code>order</code> controls the visual order of flex items. Items with a higher value appear later. The HTML source order is unchanged.'
    },

    /* 9 — The Final Layout */
    {
      title: 'The Final Layout',
      intro: 'Combine everything! Build a navbar + content + sidebar layout.',
      html: `<div class="page">\n  <nav class="item a">Nav</nav>\n  <main class="item b">Content</main>\n  <aside class="item c">Side</aside>\n</div>`,
      starterCSS: '.page {\n  \n}\n\n.item.b {\n  \n}',
      targetCSS: '.page {\n  display: flex;\n  gap: 10px;\n  height: 200px;\n}\n\n.item.b {\n  flex-grow: 1;\n}',
      checkProperties: {
        '.page': { 'display': 'flex', 'gap': '10px' },
        '.item.b': { 'flex-grow': '1' }
      },
      allowedProperties: ['display', 'flex-direction', 'justify-content', 'align-items', 'flex-wrap', 'gap', 'flex-grow', 'flex-shrink', 'align-self', 'order'],
      referenceChips: [
        { name: 'display', desc: 'flex' },
        { name: 'gap', desc: 'spacing between items' },
        { name: 'flex-grow', desc: 'fill remaining space' }
      ],
      hints: [
        'Start by making .page a flex container.',
        'The Content area should grow to fill available space.',
        'Use gap for spacing and flex-grow: 1 on .item.b.'
      ],
      explanation: 'A classic "holy grail" layout: the page is a flex row, the middle content column uses <code>flex-grow: 1</code> to fill remaining space, and <code>gap</code> adds gutters.',
      customContainer: '.page',
      extraContainerCSS: 'height: 200px;'
    }
  ];

  /* ── CSS Parsing  ─────────────────────────────────────────── */
  // Parse the student's CSS text into { selector: { prop: value } }
  function parseCSS(text) {
    const result = {};
    // Remove comments
    const clean = text.replace(/\/\*[\s\S]*?\*\//g, '');
    // Match rule blocks: selector { ... }
    const ruleRe = /([^{}]+)\{([^}]*)\}/g;
    let m;
    while ((m = ruleRe.exec(clean)) !== null) {
      const selector = m[1].trim();
      const body = m[2];
      const props = {};
      body.split(';').forEach(decl => {
        const parts = decl.split(':');
        if (parts.length >= 2) {
          const prop = parts[0].trim().toLowerCase();
          const val  = parts.slice(1).join(':').trim().toLowerCase();
          if (prop) props[prop] = val;
        }
      });
      result[selector] = props;
    }
    return result;
  }

  /* ── Match checking ───────────────────────────────────────── */
  function calcMatch(level) {
    const studentRules = parseCSS(cmEditor.getValue());
    const required = level.checkProperties;
    let total = 0, matched = 0;

    for (const selector in required) {
      const requiredProps = required[selector];
      const studentProps  = studentRules[selector] || {};
      for (const prop in requiredProps) {
        total++;
        if (studentProps[prop] === requiredProps[prop]) matched++;
      }
    }

    return total === 0 ? 0 : Math.round((matched / total) * 100);
  }

  /* ── Rendering helpers ────────────────────────────────────── */
  function renderHTMLViewer(html) {
    el.htmlViewer.textContent = html;
    hljs.highlightElement(el.htmlViewer);
  }

  function renderTarget(level) {
    const container = level.customContainer || '.container';
    const extraCSS = level.extraContainerCSS
      ? `${container} { ${level.extraContainerCSS} }`
      : '';
    const css = level.targetCSS + '\n' + extraCSS;
    el.targetFrame.srcdoc = buildSrcdoc(level.html, css);
  }

  function renderPreview(level) {
    const studentCSS = cmEditor.getValue();
    const container = level.customContainer || '.container';
    const extraCSS = level.extraContainerCSS
      ? `${container} { ${level.extraContainerCSS} }`
      : '';
    const css = studentCSS + '\n' + extraCSS;
    el.previewFrame.srcdoc = buildSrcdoc(level.html, css);
  }

  function updateMatchBar(pct) {
    el.matchBar.style.width = pct + '%';
    el.matchText.textContent = pct + '%';
    if (pct >= 100) {
      el.matchBar.classList.add('full');
      el.previewFrame.classList.add('matched');
    } else {
      el.matchBar.classList.remove('full');
      el.previewFrame.classList.remove('matched');
    }
  }

  function renderChips(level) {
    el.refChips.innerHTML = '';
    level.referenceChips.forEach(chip => {
      const span = document.createElement('span');
      span.className = 'ref-chip';
      span.textContent = chip.name;
      const desc = document.createElement('span');
      desc.className = 'chip-desc';
      desc.textContent = chip.desc;
      span.appendChild(desc);
      span.addEventListener('click', () => insertProperty(chip.name));
      el.refChips.appendChild(span);
    });
  }

  function insertProperty(propName) {
    const cursor = cmEditor.getCursor();
    cmEditor.replaceRange(propName + ': ;', cursor);
    // Place cursor before the semicolon
    cmEditor.setCursor({ line: cursor.line, ch: cursor.ch + propName.length + 2 });
    cmEditor.focus();
  }

  function renderHints(level) {
    el.hintsList.innerHTML = '';
    state.hintsRevealedThisLevel = 0;
    level.hints.forEach((hint, i) => {
      const div = document.createElement('div');
      div.className = 'hint-item';
      const btn = document.createElement('button');
      btn.className = 'hint-reveal-btn';
      btn.textContent = `Hint ${i + 1} (−10 pts)`;
      btn.addEventListener('click', () => {
        btn.replaceWith(Object.assign(document.createElement('span'), {
          className: 'hint-text',
          textContent: hint
        }));
        state.hintsRevealedThisLevel++;
        state.hintsUsed++;
      });
      div.appendChild(btn);
      el.hintsList.appendChild(div);
    });
  }

  function updateTopBar(level) {
    el.levelName.textContent = `⚒️ ${level.title}`;
    el.progress.textContent  = `Level ${state.currentLevel + 1} / ${LEVELS.length}`;
    el.score.textContent     = `Score: ${state.score}`;
  }

  /* ── Overlay system ───────────────────────────────────────── */
  function showOverlay(html) {
    el.overlayCon.innerHTML = html;
    el.overlay.classList.remove('hidden');
  }

  function hideOverlay() {
    el.overlay.classList.add('hidden');
  }

  function showMenu() {
    state.phase = 'menu';
    showOverlay(`
      <h2>⚒️ Flexbox Forge</h2>
      <p>Master CSS Flexbox in 10 progressive levels. Write real CSS, see instant results, and match the target layout.</p>
      <p class="overlay-subtitle">Each level introduces a new Flexbox property.</p>
      <button class="overlay-btn" id="btn-start">Start Forging</button>
    `);
    $('btn-start').addEventListener('click', () => {
      hideOverlay();
      startLevel(0);
    });
  }

  function showLevelIntro(idx) {
    state.phase = 'levelIntro';
    const level = LEVELS[idx];
    showOverlay(`
      <h2>Level ${idx + 1}: ${level.title}</h2>
      <p>${level.intro}</p>
      <button class="overlay-btn" id="btn-go">Let's Go</button>
    `);
    $('btn-go').addEventListener('click', () => {
      hideOverlay();
      state.phase = 'playing';
    });
  }

  function showLevelComplete(idx) {
    state.phase = 'levelComplete';
    const level = LEVELS[idx];
    const hintPenalty = state.hintsRevealedThisLevel * 10;
    const levelScore = Math.max(0, 100 + (state.hintsRevealedThisLevel === 0 ? 50 : 0) - hintPenalty);
    state.score += levelScore;
    el.score.textContent = `Score: ${state.score}`;

    // Show explanation
    el.explanPanel.classList.remove('hidden');
    el.explanation.innerHTML = level.explanation;

    el.previewFrame.classList.add('success-flash');
    setTimeout(() => el.previewFrame.classList.remove('success-flash'), 1500);

    const isLast = idx >= LEVELS.length - 1;
    showOverlay(`
      <h2>✅ Level ${idx + 1} Complete!</h2>
      <div class="overlay-score">+${levelScore} pts</div>
      <p>${hintPenalty > 0 ? `(−${hintPenalty} hint penalty)` : '🔥 No hints used! +50 bonus!'}</p>
      <div class="overlay-properties">${level.explanation}</div>
      <button class="overlay-btn" id="btn-next">${isLast ? 'See Final Score' : 'Next Level →'}</button>
    `);
    $('btn-next').addEventListener('click', () => {
      hideOverlay();
      el.explanPanel.classList.add('hidden');
      if (isLast) {
        showGameComplete();
      } else {
        startLevel(idx + 1);
      }
    });
  }

  function showGameComplete() {
    state.phase = 'gameComplete';
    const max = LEVELS.length * 150;
    showOverlay(`
      <h2>🏆 Forge Master!</h2>
      <div class="overlay-score">${state.score} / ${max}</div>
      <p>You completed all ${LEVELS.length} levels of Flexbox Forge.</p>
      <p>Properties mastered:</p>
      <div class="overlay-properties">display · flex-direction · justify-content · align-items<br>flex-wrap · gap · flex-grow · align-self · order</div>
      <button class="overlay-btn" id="btn-restart">Play Again</button>
    `);
    $('btn-restart').addEventListener('click', () => {
      hideOverlay();
      state.score = 0;
      state.hintsUsed = 0;
      startLevel(0);
    });
  }

  /* ── Level lifecycle ──────────────────────────────────────── */
  function startLevel(idx) {
    state.currentLevel = idx;
    state.hintsRevealedThisLevel = 0;
    const level = LEVELS[idx];

    updateTopBar(level);
    renderHTMLViewer(level.html);
    renderTarget(level);
    renderChips(level);
    renderHints(level);
    el.explanPanel.classList.add('hidden');

    cmEditor.setValue(level.starterCSS);
    cmEditor.clearHistory();

    // Initial preview
    renderPreview(level);
    updateMatchBar(0);

    showLevelIntro(idx);
  }

  /* ── Real-time update on edit ─────────────────────────────── */
  cmEditor.on('change', () => {
    if (state.phase !== 'playing') return;
    const level = LEVELS[state.currentLevel];
    renderPreview(level);
    const pct = calcMatch(level);
    updateMatchBar(pct);

    if (pct >= 100) {
      // Small delay so the student sees the bar hit 100%
      setTimeout(() => {
        if (state.phase === 'playing') showLevelComplete(state.currentLevel);
      }, 400);
    }
  });

  /* ── Boot ─────────────────────────────────────────────────── */
  el.explanPanel.classList.add('hidden');
  showMenu();

})();
