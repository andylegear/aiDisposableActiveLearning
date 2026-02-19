/* ═══════════════════════════════════════════════════════════════
   game.js — Big-O Dojo: Game Engine
   State machine · Canvas rendering · Scoring · Animations
   ═══════════════════════════════════════════════════════════════ */

/* ── DOM helpers ──────────────────────────────────────────────── */
const $ = id => document.getElementById(id);
const show = el => { if (typeof el === 'string') el = $(el); el.classList.remove('hidden'); };
const hide = el => { if (typeof el === 'string') el = $(el); el.classList.add('hidden'); };

/* ── State ────────────────────────────────────────────────────── */
const state = {
  screen: 'menu',          // menu | levelIntro | playing | feedback | levelComplete | gameComplete
  currentLevel: 0,
  currentRound: 0,
  score: 0,
  streak: 0,
  timer: 0,
  timerID: null,
  levelScore: 0,
  levelCorrect: 0,
  // Growth Lab
  placedPoints: [],
  currentPointIdx: 0,
  // Arena
  playerChoice: null,
  // Feedback animation
  animStart: 0,
  animDuration: 3000,
  animFrame: null,
  // Answer tracking
  lastAnswer: null,
  wasCorrect: false,
  pointsEarned: 0,
};

/* ── Canvas & context ─────────────────────────────────────────── */
let canvas, ctx;
const PAD = { top: 24, right: 20, bottom: 42, left: 54 };

function setupCanvas() {
  canvas = $('viz-canvas');
  const rect = canvas.parentElement.getBoundingClientRect();
  const w = Math.min(rect.width - 32, 520);
  const h = Math.min(rect.height - 60, 400);
  const dpr = window.devicePixelRatio || 1;
  canvas.style.width = w + 'px';
  canvas.style.height = h + 'px';
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  return { w, h };
}

function cw() { return parseFloat(canvas.style.width); }
function ch() { return parseFloat(canvas.style.height); }
function plotW() { return cw() - PAD.left - PAD.right; }
function plotH() { return ch() - PAD.top - PAD.bottom; }

/* coordinate mappers */
function xToC(dataX, maxX) { return PAD.left + (dataX / maxX) * plotW(); }
function yToC(dataY, maxY) { return PAD.top + plotH() - (dataY / maxY) * plotH(); }
function cToY(canvasY, maxY) {
  return maxY * (1 - (canvasY - PAD.top) / plotH());
}

/* ── Syntax highlighting ──────────────────────────────────────── */
function hlCode(code) {
  let s = code
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  // comments first
  s = s.replace(/(\/\/.*$)/gm, '<span class="hl-comment">$1</span>');
  // strings
  s = s.replace(/('(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*")/g, '<span class="hl-string">$1</span>');
  // keywords
  s = s.replace(/\b(function|return|let|const|var|for|while|if|else|do|new|typeof|of|in|break|continue|switch|case|default)\b/g,
    '<span class="hl-keyword">$1</span>');
  // literals
  s = s.replace(/\b(true|false|null|undefined)\b/g, '<span class="hl-literal">$1</span>');
  // builtins
  s = s.replace(/\b(Math|console|Array|Object|process)\b/g, '<span class="hl-builtin">$1</span>');
  // numbers
  s = s.replace(/\b(\d+\.?\d*)\b/g, '<span class="hl-number">$1</span>');
  return s;
}

/* ── Belt bar ─────────────────────────────────────────────────── */
function renderBeltBar() {
  const cont = $('belt-segments');
  cont.innerHTML = '';
  for (let i = 0; i < BELT_INFO.length; i++) {
    const seg = document.createElement('div');
    seg.className = 'belt-seg';
    if (i < state.currentLevel) {
      seg.classList.add('earned');
      seg.style.background = BELT_INFO[i].color;
    } else if (i === state.currentLevel) {
      seg.style.background = BELT_INFO[i].dark;
    } else {
      seg.style.background = '#2a2a4a';
    }
    cont.appendChild(seg);
  }
  const belt = BELT_INFO[Math.min(state.currentLevel, BELT_INFO.length - 1)];
  $('belt-label').textContent = belt.name + ' Belt';
  $('belt-label').style.color = belt.color;
}

function updateScoreDisplay() {
  $('score-value').textContent = state.score;
  $('streak-value').textContent = state.streak;
  const badge = $('mult-badge');
  badge.className = '';
  if (state.streak >= 5) { badge.textContent = '×3'; badge.className = 'x3'; }
  else if (state.streak >= 3) { badge.textContent = '×2'; badge.className = 'x2'; }
  else { badge.textContent = ''; }
}

/* ── Overlay helper ───────────────────────────────────────────── */
function showOverlay(html) {
  $('overlay-content').innerHTML = html;
  show('overlay');
}
function hideOverlay() { hide('overlay'); }

/* ── Timer ────────────────────────────────────────────────────── */
function startTimer(seconds) {
  state.timer = seconds;
  $('timer-value').textContent = seconds;
  $('timer-value').classList.remove('urgent');
  show('timer-display');
  clearInterval(state.timerID);
  state.timerID = setInterval(() => {
    state.timer--;
    $('timer-value').textContent = Math.max(0, state.timer);
    if (state.timer <= 5) $('timer-value').classList.add('urgent');
    if (state.timer <= 0) {
      clearInterval(state.timerID);
      handleAnswer(null); // time's up
    }
  }, 1000);
}

function stopTimer() {
  clearInterval(state.timerID);
  state.timerID = null;
}

/* ══════════════════════════════════════════════════════════════
   SCREEN: MENU
   ══════════════════════════════════════════════════════════════ */
function showMenu() {
  state.screen = 'menu';
  hide('top-bar'); hide('game-main'); hide('bottom-bar');
  showOverlay(`
    <h1 style="color:var(--accent)">🥋 Big-O Dojo</h1>
    <p class="subtitle">Master the art of algorithmic complexity</p>
    <p class="description">Five levels. Five belts. From O(1) to O(n²) and beyond.\nClassify code, predict growth curves, spot traps, and watch algorithms race.</p>
    <button class="overlay-btn" onclick="startGame()">Enter the Dojo</button>
  `);
}

function startGame() {
  state.score = 0;
  state.streak = 0;
  state.currentLevel = 0;
  showLevelIntro(0);
}

/* ══════════════════════════════════════════════════════════════
   SCREEN: LEVEL INTRO
   ══════════════════════════════════════════════════════════════ */
function showLevelIntro(levelIdx) {
  state.screen = 'levelIntro';
  state.currentLevel = levelIdx;
  state.currentRound = 0;
  state.levelScore = 0;
  state.levelCorrect = 0;
  const lvl = LEVELS[levelIdx];
  const belt = BELT_INFO[lvl.beltIndex];
  hide('top-bar'); hide('game-main'); hide('bottom-bar');
  showOverlay(`
    <div class="belt-icon" style="background:${belt.color}"></div>
    <h2>Level ${lvl.id}: ${lvl.name}</h2>
    <p class="subtitle">${lvl.subtitle}</p>
    <p class="description">${lvl.description}</p>
    <p class="subtitle">${lvl.rounds.length} rounds</p>
    <button class="overlay-btn" onclick="beginLevel()">Begin</button>
  `);
}

function beginLevel() {
  hideOverlay();
  show('top-bar'); show('game-main'); show('bottom-bar');
  renderBeltBar();
  updateScoreDisplay();
  startRound();
}

/* ══════════════════════════════════════════════════════════════
   SCREEN: PLAYING — dispatch to level-specific renderer
   ══════════════════════════════════════════════════════════════ */
function startRound() {
  state.screen = 'playing';
  state.lastAnswer = null;
  state.wasCorrect = false;
  state.pointsEarned = 0;
  cancelAnimationFrame(state.animFrame);

  const lvl = LEVELS[state.currentLevel];
  const round = lvl.rounds[state.currentRound];

  // Reset panels
  hide('explanation-box');
  $('action-row').innerHTML = '';
  $('viz-instruction').textContent = '';
  $('viz-label').textContent = '';
  hide('code-header-b'); hide('code-block-b');
  show('code-panel'); show('viz-panel');

  switch (lvl.type) {
    case 'classify':      renderClassify(round, lvl); break;
    case 'growth_lab':    renderGrowthLab(round, lvl); break;
    case 'nested_depths': renderNestedDepths(round, lvl); break;
    case 'log_rhythms':   renderLogRhythms(round, lvl); break;
    case 'arena':         renderArena(round, lvl); break;
  }
}

/* ── Level 1 & 3: Classify / Nested Depths ────────────────────── */
function renderClassify(round) {
  $('code-header').textContent = 'What is the Big-O complexity?';
  $('code-content').innerHTML = hlCode(round.code);
  renderComplexityButtons();
  startTimer(round.timeLimit);
  // Clear canvas — show hint text
  const { w, h } = setupCanvas();
  ctx.clearRect(0, 0, w, h);
  drawCentreText(w, h, 'Answer to see the\noperation counter');
}

function renderNestedDepths(round) {
  $('code-header').textContent = 'Analyse the loops — what is the Big-O?';
  $('code-content').innerHTML = hlCode(round.code);
  renderComplexityButtons();
  startTimer(round.timeLimit);
  const { w, h } = setupCanvas();
  ctx.clearRect(0, 0, w, h);
  drawCentreText(w, h, 'Answer to see the\nstep counter');
}

/* ── Level 4: Log Rhythms ─────────────────────────────────────── */
function renderLogRhythms(round) {
  $('code-header').textContent = 'What is the Big-O complexity?';
  $('code-content').innerHTML = hlCode(round.code);
  renderComplexityButtons();
  startTimer(round.timeLimit);
  const { w, h } = setupCanvas();
  ctx.clearRect(0, 0, w, h);
  drawCentreText(w, h, 'Answer to see the\ntree visualisation');
}

/* ── Level 2: Growth Lab ──────────────────────────────────────── */
function renderGrowthLab(round) {
  $('code-header').textContent = round.challenge;
  $('code-content').innerHTML = hlCode(
    `// Predict: how many operations for each n?\n// Click at each vertical guide line to\n// place your prediction point.`
  );
  $('answer-buttons').innerHTML = '';
  hide('timer-display');

  state.placedPoints = [];
  state.currentPointIdx = 0;

  const { w, h } = setupCanvas();
  canvas.style.cursor = 'crosshair';
  drawGrowthLabCanvas(round, w, h);
  $('viz-instruction').textContent = `Click at n = ${round.predictionXs[0]} to place your prediction`;
}

function drawGrowthLabCanvas(round, w, h) {
  w = w || cw(); h = h || ch();
  ctx.clearRect(0, 0, w, h);
  drawAxes(w, h, round.maxN, round.maxOps, 'Input size (n)', 'Operations');

  // Guide lines
  for (let i = 0; i < round.predictionXs.length; i++) {
    const nx = round.predictionXs[i];
    const cx = xToC(nx, round.maxN);
    ctx.strokeStyle = i === state.currentPointIdx ? 'rgba(255,215,64,0.6)' : 'rgba(255,255,255,0.15)';
    ctx.lineWidth = i === state.currentPointIdx ? 2 : 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(cx, PAD.top);
    ctx.lineTo(cx, PAD.top + plotH());
    ctx.stroke();
    ctx.setLineDash([]);
    // Label
    ctx.fillStyle = i === state.currentPointIdx ? '#ffd740' : '#666';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('n=' + nx, cx, PAD.top + plotH() + 16);
  }

  // Placed points + line
  if (state.placedPoints.length > 0) {
    ctx.strokeStyle = '#ffd740';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i < state.placedPoints.length; i++) {
      const p = state.placedPoints[i];
      const cx = xToC(p.x, round.maxN);
      const cy = yToC(p.y, round.maxOps);
      if (i === 0) ctx.moveTo(cx, cy);
      else ctx.lineTo(cx, cy);
    }
    ctx.stroke();

    for (const p of state.placedPoints) {
      const cx = xToC(p.x, round.maxN);
      const cy = yToC(p.y, round.maxOps);
      ctx.beginPath();
      ctx.arc(cx, cy, 5, 0, Math.PI * 2);
      ctx.fillStyle = '#ffd740';
      ctx.fill();
    }
  }
}

/* ── Level 5: Arena ───────────────────────────────────────────── */
function renderArena(round) {
  // Show both algorithms
  $('code-header').textContent = '⚔️ Algorithm A: ' + round.algorithmA.name;
  $('code-content').innerHTML = hlCode(round.algorithmA.code);
  show('code-header-b'); show('code-block-b');
  $('code-header-b').textContent = '⚔️ Algorithm B: ' + round.algorithmB.name;
  $('code-content-b').innerHTML = hlCode(round.algorithmB.code);

  hide('timer-display');

  // Arena buttons
  $('answer-buttons').innerHTML = `
    <button class="arena-btn" onclick="handleArenaChoice('A')">🅰️ ${round.algorithmA.name} is faster</button>
    <button class="arena-btn" onclick="handleArenaChoice('B')">🅱️ ${round.algorithmB.name} is faster</button>
  `;

  const { w, h } = setupCanvas();
  ctx.clearRect(0, 0, w, h);
  drawCentreText(w, h, 'Choose which algorithm\nis faster for large n');
}

/* ── Complexity answer buttons ────────────────────────────────── */
function renderComplexityButtons() {
  const cont = $('answer-buttons');
  cont.innerHTML = '';
  for (const opt of COMPLEXITY_OPTIONS) {
    const btn = document.createElement('button');
    btn.className = 'answer-btn';
    btn.setAttribute('data-answer', opt);
    btn.textContent = opt;
    btn.onclick = () => handleAnswer(opt);
    cont.appendChild(btn);
  }
}

/* ══════════════════════════════════════════════════════════════
   ANSWER HANDLING
   ══════════════════════════════════════════════════════════════ */
function handleAnswer(answer) {
  if (state.screen !== 'playing') return;
  stopTimer();
  canvas.style.cursor = 'default';

  const lvl = LEVELS[state.currentLevel];
  const round = lvl.rounds[state.currentRound];
  const correct = answer === round.answer;

  // Highlight buttons
  const btns = $('answer-buttons').querySelectorAll('.answer-btn');
  btns.forEach(b => {
    b.classList.add('disabled');
    if (b.getAttribute('data-answer') === round.answer) b.classList.add('reveal-correct');
    if (b.getAttribute('data-answer') === answer && !correct) b.classList.add('selected-wrong');
    if (b.getAttribute('data-answer') === answer && correct) b.classList.add('selected-correct');
  });

  showFeedback(correct, answer, round, lvl);
}

function handleArenaChoice(choice) {
  if (state.screen !== 'playing') return;
  const lvl = LEVELS[state.currentLevel];
  const round = lvl.rounds[state.currentRound];
  const correct = choice === round.fasterAtLargeN;

  state.playerChoice = choice;

  // Highlight arena buttons
  const btns = $('answer-buttons').querySelectorAll('.arena-btn');
  btns.forEach(b => b.style.pointerEvents = 'none');
  btns.forEach(b => {
    if (b.textContent.startsWith('🅰️') && choice === 'A') b.classList.add(correct ? 'selected-correct' : 'selected-wrong');
    if (b.textContent.startsWith('🅱️') && choice === 'B') b.classList.add(correct ? 'selected-correct' : 'selected-wrong');
  });

  showFeedback(correct, choice, round, lvl);
}

function handleGrowthLabSubmit(round) {
  if (state.screen !== 'playing') return;
  canvas.style.cursor = 'default';

  // Score: compare placed points to actual
  let totalErr = 0;
  for (const p of state.placedPoints) {
    const actual = round.targetFn(p.x);
    totalErr += Math.abs(p.y - actual) / round.maxOps;
  }
  const avgErr = totalErr / state.placedPoints.length;
  const accuracy = Math.max(0, 1 - avgErr * 3);
  const pts = Math.round(accuracy * 100);

  state.wasCorrect = accuracy >= 0.4;
  state.pointsEarned = pts;
  if (state.wasCorrect) { state.streak++; state.levelCorrect++; }
  else { state.streak = 0; }

  const mult = state.streak >= 5 ? 3 : state.streak >= 3 ? 2 : 1;
  state.pointsEarned = Math.round(pts * mult);
  state.score += state.pointsEarned;
  state.levelScore += state.pointsEarned;

  updateScoreDisplay();
  showPointsPopup(state.pointsEarned, state.wasCorrect);

  // Show explanation
  const box = $('explanation-box');
  box.className = state.wasCorrect ? 'correct' : 'incorrect';
  box.innerHTML = `<strong>${state.wasCorrect ? '✓ Nice prediction!' : '✗ Not quite!'}</strong> Accuracy: ${Math.round(accuracy * 100)}%<br>${round.explanation}`;
  show(box);

  // Animate actual curve reveal
  state.screen = 'feedback';
  state.animStart = performance.now();
  state.animDuration = 2000;
  animateGrowthLabReveal(round);

  // Continue button
  $('action-row').innerHTML = '<button class="action-btn" onclick="nextRound()">Continue</button>';
}

/* ══════════════════════════════════════════════════════════════
   SCREEN: FEEDBACK
   ══════════════════════════════════════════════════════════════ */
function showFeedback(correct, answer, round, lvl) {
  state.screen = 'feedback';
  state.wasCorrect = correct;
  state.lastAnswer = answer;

  // Scoring
  let base = correct ? 100 : 0;
  let timeBonus = correct ? Math.round((state.timer / (round.timeLimit || 15)) * 50) : 0;
  if (correct) { state.streak++; state.levelCorrect++; }
  else { state.streak = 0; }
  const mult = state.streak >= 5 ? 3 : state.streak >= 3 ? 2 : 1;
  state.pointsEarned = (base + timeBonus) * mult;
  state.score += state.pointsEarned;
  state.levelScore += state.pointsEarned;

  updateScoreDisplay();
  showPointsPopup(state.pointsEarned, correct);

  // Explanation box
  const box = $('explanation-box');
  box.className = correct ? 'correct' : 'incorrect';
  const prefix = correct ? '✓ Correct!' : (answer === null ? '⏱ Time\'s up!' : '✗ Incorrect.');
  box.innerHTML = `<strong>${prefix}</strong> ${round.explanation}`;
  show(box);

  // Continue button
  $('action-row').innerHTML = '<button class="action-btn" onclick="nextRound()">Continue</button>';

  // Start feedback animation
  state.animStart = performance.now();
  state.animDuration = 3000;

  switch (lvl.type) {
    case 'classify':
    case 'nested_depths':
      animateOpsCounter(round);
      break;
    case 'log_rhythms':
      animateTree(round);
      break;
    case 'arena':
      animateRace(round);
      break;
  }
}

/* ── Points popup ─────────────────────────────────────────────── */
function showPointsPopup(pts, correct) {
  const el = document.createElement('div');
  el.className = 'points-popup ' + (correct ? 'correct' : 'incorrect');
  el.textContent = (pts > 0 ? '+' : '') + pts;
  el.style.left = '50%';
  el.style.top = '40%';
  el.style.transform = 'translateX(-50%)';
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 1200);
}

/* ══════════════════════════════════════════════════════════════
   FEEDBACK ANIMATIONS
   ══════════════════════════════════════════════════════════════ */

/* ── Ops Counter (Levels 1 & 3) ───────────────────────────────── */
function animateOpsCounter(round) {
  const testNs = round.timeLimit ? [10, 50, 100, 500] : [5, 10, 20, 50];
  const opsValues = testNs.map(n => round.ops(n));
  const maxOps = Math.max(...opsValues, 1);
  const color = COMPLEXITY_COLORS[round.answer] || '#ffd740';

  function draw(timestamp) {
    const t = Math.min(1, (timestamp - state.animStart) / state.animDuration);
    const { w, h } = { w: cw(), h: ch() };
    ctx.clearRect(0, 0, w, h);

    const barW = plotW() / testNs.length - 12;
    const baseY = PAD.top + plotH();

    // Draw axis
    ctx.strokeStyle = '#444';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(PAD.left, PAD.top);
    ctx.lineTo(PAD.left, baseY);
    ctx.lineTo(PAD.left + plotW(), baseY);
    ctx.stroke();

    for (let i = 0; i < testNs.length; i++) {
      const barProgress = Math.min(1, t * testNs.length - i);
      if (barProgress <= 0) continue;
      const ease = easeOutCubic(Math.min(1, barProgress));

      const barH = (opsValues[i] / maxOps) * plotH() * ease;
      const x = PAD.left + 8 + i * (barW + 12);

      // Bar
      ctx.fillStyle = color;
      ctx.globalAlpha = 0.8;
      ctx.beginPath();
      roundRect(ctx, x, baseY - barH, barW, barH, 4);
      ctx.fill();
      ctx.globalAlpha = 1;

      // n label
      ctx.fillStyle = '#aaa';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('n=' + testNs[i], x + barW / 2, baseY + 16);

      // ops label
      if (ease > 0.5) {
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 12px sans-serif';
        ctx.fillText(fmtNum(Math.round(opsValues[i] * ease)), x + barW / 2, baseY - barH - 6);
      }
    }

    // Title
    ctx.fillStyle = color;
    ctx.font = 'bold 13px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Operations at different n — ' + round.answer, w / 2, 16);

    if (t < 1) state.animFrame = requestAnimationFrame(draw);
  }
  state.animFrame = requestAnimationFrame(draw);
}

/* ── Growth Lab curve reveal ──────────────────────────────────── */
function animateGrowthLabReveal(round) {
  function draw(timestamp) {
    const t = Math.min(1, (timestamp - state.animStart) / state.animDuration);
    const w = cw(), h = ch();

    // Redraw base (axes, student points)
    drawGrowthLabCanvas(round, w, h);

    // Draw actual curve progressively
    const color = COMPLEXITY_COLORS[round.targetClass] || '#00e676';
    const maxDrawX = round.maxN * t;
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.setLineDash([]);
    ctx.beginPath();
    let started = false;
    for (let nx = 1; nx <= maxDrawX; nx++) {
      const cx = xToC(nx, round.maxN);
      const cy = yToC(round.targetFn(nx), round.maxOps);
      if (!started) { ctx.moveTo(cx, cy); started = true; }
      else ctx.lineTo(cx, cy);
    }
    ctx.stroke();

    // Label
    if (t > 0.5) {
      ctx.fillStyle = color;
      ctx.font = 'bold 13px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Actual: ' + round.targetClass, w / 2, 16);
    }

    if (t < 1) state.animFrame = requestAnimationFrame(draw);
  }
  state.animFrame = requestAnimationFrame(draw);
}

/* ── Tree visualisation (Level 4) ─────────────────────────────── */
function animateTree(round) {
  const n = 64; // visualise for n=64
  const depth = round.treeDepth ? round.treeDepth(n) : 6;
  const showWork = round.showWorkPerLevel || false;
  const color = COMPLEXITY_COLORS[round.answer] || '#448aff';

  function draw(timestamp) {
    const t = Math.min(1, (timestamp - state.animStart) / state.animDuration);
    const w = cw(), h = ch();
    ctx.clearRect(0, 0, w, h);

    const levelsToShow = Math.floor(t * (depth + 1));
    const nodeR = Math.max(6, Math.min(14, w / (Math.pow(2, depth) * 3)));
    const levelH = (plotH() - 20) / depth;
    const treeLeft = showWork ? PAD.left : PAD.left;
    const treeWidth = showWork ? plotW() * 0.6 : plotW();

    // Title
    ctx.fillStyle = color;
    ctx.font = 'bold 13px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(round.answer + '  (n = ' + n + ', depth = ' + depth + ')', w / 2, 16);

    for (let d = 0; d < Math.min(levelsToShow, depth); d++) {
      const nodes = Math.pow(2, d);
      const sizeAtLevel = Math.ceil(n / Math.pow(2, d));
      const y = PAD.top + 20 + d * levelH;

      for (let i = 0; i < Math.min(nodes, 16); i++) { // cap at 16 visible
        const x = treeLeft + treeWidth * (i + 0.5) / Math.min(nodes, 16);

        // Draw edge to parent
        if (d > 0) {
          const parentIdx = Math.floor(i / 2);
          const parentNodes = Math.min(Math.pow(2, d - 1), 16);
          const px = treeLeft + treeWidth * (parentIdx + 0.5) / parentNodes;
          const py = y - levelH;
          ctx.strokeStyle = 'rgba(255,255,255,0.15)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(px, py + nodeR);
          ctx.lineTo(x, y - nodeR);
          ctx.stroke();
        }

        // Node
        ctx.beginPath();
        ctx.arc(x, y, nodeR, 0, Math.PI * 2);
        ctx.fillStyle = d < levelsToShow - 1 ? color : COMPLEXITY_COLORS[round.answer];
        ctx.globalAlpha = d < levelsToShow - 1 ? 0.7 : 1;
        ctx.fill();
        ctx.globalAlpha = 1;

        // Label inside node (only if big enough)
        if (nodeR >= 10 && nodes <= 8) {
          ctx.fillStyle = '#fff';
          ctx.font = 'bold ' + Math.max(8, nodeR - 2) + 'px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(sizeAtLevel > 999 ? '…' : sizeAtLevel, x, y);
          ctx.textBaseline = 'alphabetic';
        }
      }

      if (nodes > 16) {
        ctx.fillStyle = '#888';
        ctx.font = '11px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('(' + nodes + ' nodes)', treeLeft + treeWidth / 2, y + nodeR + 14);
      }

      // Work per level bar (for O(n log n))
      if (showWork) {
        const barX = PAD.left + plotW() * 0.7;
        const barMaxW = plotW() * 0.25;
        const barH = Math.max(8, levelH - 8);
        const workRatio = 1; // each level does O(n) work
        ctx.fillStyle = '#ff9100';
        ctx.globalAlpha = 0.6;
        ctx.beginPath();
        roundRect(ctx, barX, y - barH / 2, barMaxW * workRatio, barH, 3);
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.fillStyle = '#ddd';
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('n work', barX + barMaxW * workRatio + 4, y + 4);
      }

      // Level label on the right
      ctx.fillStyle = '#888';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText('d=' + d, treeLeft - 6, y + 4);
    }

    if (t < 1) state.animFrame = requestAnimationFrame(draw);
  }
  state.animFrame = requestAnimationFrame(draw);
}

/* ── Race animation (Level 5) ─────────────────────────────────── */
function animateRace(round) {
  const maxN = round.raceMaxN;
  const maxOpsA = round.algorithmA.ops(maxN);
  const maxOpsB = round.algorithmB.ops(maxN);
  const maxOps = Math.max(maxOpsA, maxOpsB, 1);
  const winner = round.fasterAtLargeN;

  function draw(timestamp) {
    const t = Math.min(1, (timestamp - state.animStart) / state.animDuration);
    const w = cw(), h = ch();
    ctx.clearRect(0, 0, w, h);

    const currentN = Math.max(1, Math.floor(t * maxN));
    const opsA = round.algorithmA.ops(currentN);
    const opsB = round.algorithmB.ops(currentN);

    const barMaxW = plotW() - 80;
    const barH = 36;
    const gapY = 30;
    const startY = h / 2 - barH - gapY / 2;

    // Title
    ctx.fillStyle = '#ffd740';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Algorithm Race  —  n = ' + currentN, w / 2, PAD.top);

    // Bar A
    const wA = (opsA / maxOps) * barMaxW;
    const colorA = t >= 1 ? (winner === 'B' ? '#ff1744' : '#00e676') : '#ff9100';
    ctx.fillStyle = colorA;
    ctx.globalAlpha = 0.8;
    ctx.beginPath();
    roundRect(ctx, PAD.left, startY, wA, barH, 6);
    ctx.fill();
    ctx.globalAlpha = 1;
    // Label
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('A: ' + round.algorithmA.name, PAD.left, startY - 8);
    ctx.textAlign = 'right';
    ctx.fillText(fmtNum(Math.round(opsA)) + ' ops', PAD.left + barMaxW + 60, startY + barH / 2 + 5);
    // Complexity label
    if (t >= 1) {
      ctx.fillStyle = '#aaa';
      ctx.font = '11px sans-serif';
      ctx.fillText(round.algorithmA.complexity, PAD.left + barMaxW + 60, startY + barH + 14);
    }

    // Bar B
    const wB = (opsB / maxOps) * barMaxW;
    const colorB = t >= 1 ? (winner === 'A' ? '#ff1744' : '#00e676') : '#448aff';
    ctx.fillStyle = colorB;
    ctx.globalAlpha = 0.8;
    ctx.beginPath();
    roundRect(ctx, PAD.left, startY + barH + gapY, wB, barH, 6);
    ctx.fill();
    ctx.globalAlpha = 1;
    // Label
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('B: ' + round.algorithmB.name, PAD.left, startY + barH + gapY - 8);
    ctx.textAlign = 'right';
    ctx.fillText(fmtNum(Math.round(opsB)) + ' ops', PAD.left + barMaxW + 60, startY + barH + gapY + barH / 2 + 5);
    if (t >= 1) {
      ctx.fillStyle = '#aaa';
      ctx.font = '11px sans-serif';
      ctx.fillText(round.algorithmB.complexity, PAD.left + barMaxW + 60, startY + barH + gapY + barH + 14);
    }

    // Winner label
    if (t >= 1) {
      const winnerName = winner === 'A' ? round.algorithmA.name : round.algorithmB.name;
      ctx.fillStyle = '#00e676';
      ctx.font = 'bold 16px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🏆 ' + winnerName + ' wins!', w / 2, startY + 2 * barH + gapY + 40);
    }

    if (t < 1) state.animFrame = requestAnimationFrame(draw);
  }
  state.animFrame = requestAnimationFrame(draw);
}

/* ══════════════════════════════════════════════════════════════
   NAVIGATION: next round / level complete / game complete
   ══════════════════════════════════════════════════════════════ */
function nextRound() {
  cancelAnimationFrame(state.animFrame);
  const lvl = LEVELS[state.currentLevel];
  state.currentRound++;
  if (state.currentRound >= lvl.rounds.length) {
    showLevelComplete();
  } else {
    startRound();
  }
}

function showLevelComplete() {
  state.screen = 'levelComplete';
  hide('game-main'); hide('bottom-bar');
  stopTimer();
  const lvl = LEVELS[state.currentLevel];
  const belt = BELT_INFO[lvl.beltIndex];
  const total = lvl.rounds.length;
  showOverlay(`
    <div class="belt-icon belt-earned-anim" style="background:${belt.color}"></div>
    <h2>🥋 ${belt.name} Belt Earned!</h2>
    <p class="subtitle">Level ${lvl.id}: ${lvl.name} complete</p>
    <div class="stats-row">
      <span>Correct: <strong>${state.levelCorrect}/${total}</strong></span>
      <span>Level Score: <strong>${state.levelScore}</strong></span>
      <span>Total Score: <strong>${state.score}</strong></span>
    </div>
    <button class="overlay-btn" onclick="advanceLevel()">
      ${state.currentLevel < LEVELS.length - 1 ? 'Next Level' : 'See Results'}
    </button>
  `);
}

function advanceLevel() {
  state.currentLevel++;
  if (state.currentLevel >= LEVELS.length) {
    showGameComplete();
  } else {
    showLevelIntro(state.currentLevel);
  }
}

function showGameComplete() {
  state.screen = 'gameComplete';
  hide('top-bar'); hide('game-main'); hide('bottom-bar');
  const maxPossible = LEVELS.reduce((sum, l) => sum + l.rounds.length * 150, 0);
  const pct = Math.round((state.score / maxPossible) * 100);
  showOverlay(`
    <h1 style="color:var(--accent)">🏆 Black Belt Master!</h1>
    <p class="subtitle">You have completed all five levels of the Big-O Dojo</p>
    <div class="score-big">${state.score} points</div>
    <p class="subtitle">${pct}% of maximum possible score</p>
    <div class="stats-row">
      ${BELT_INFO.map(b => `<span style="color:${b.color}">■ ${b.name}</span>`).join('')}
    </div>
    <button class="overlay-btn" onclick="showMenu()" style="margin-top:20px">Play Again</button>
  `);
}

/* ══════════════════════════════════════════════════════════════
   CANVAS UTILITIES
   ══════════════════════════════════════════════════════════════ */
function drawAxes(w, h, maxX, maxY, labelX, labelY) {
  ctx.strokeStyle = '#555';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(PAD.left, PAD.top);
  ctx.lineTo(PAD.left, PAD.top + plotH());
  ctx.lineTo(PAD.left + plotW(), PAD.top + plotH());
  ctx.stroke();

  // Y axis ticks
  const yTicks = 5;
  for (let i = 0; i <= yTicks; i++) {
    const val = maxY * i / yTicks;
    const y = yToC(val, maxY);
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.beginPath();
    ctx.moveTo(PAD.left, y);
    ctx.lineTo(PAD.left + plotW(), y);
    ctx.stroke();
    ctx.fillStyle = '#777';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(fmtNum(Math.round(val)), PAD.left - 6, y + 4);
  }

  // Labels
  ctx.fillStyle = '#999';
  ctx.font = '11px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(labelX, PAD.left + plotW() / 2, h - 4);
  ctx.save();
  ctx.translate(12, PAD.top + plotH() / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText(labelY, 0, 0);
  ctx.restore();
}

function drawCentreText(w, h, text) {
  ctx.fillStyle = '#555';
  ctx.font = '15px sans-serif';
  ctx.textAlign = 'center';
  const lines = text.split('\n');
  const lineH = 22;
  const startY = h / 2 - (lines.length - 1) * lineH / 2;
  lines.forEach((line, i) => ctx.fillText(line, w / 2, startY + i * lineH));
}

function roundRect(ctx, x, y, w, h, r) {
  if (w < 0) { x += w; w = -w; }
  if (h < 0) { y += h; h = -h; }
  r = Math.min(r, w / 2, h / 2);
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
}

function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

function fmtNum(n) {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return '' + n;
}

/* ══════════════════════════════════════════════════════════════
   EVENT HANDLERS
   ══════════════════════════════════════════════════════════════ */
function onCanvasClick(e) {
  if (state.screen !== 'playing') return;
  const lvl = LEVELS[state.currentLevel];
  if (lvl.type !== 'growth_lab') return;

  const round = lvl.rounds[state.currentRound];
  if (state.currentPointIdx >= round.predictionXs.length) return;

  const rect = canvas.getBoundingClientRect();
  const scaleY = parseFloat(canvas.style.height) / rect.height;
  const clickY = (e.clientY - rect.top) * scaleY;
  const dataY = cToY(clickY, round.maxOps);
  const clampedY = Math.max(0, Math.min(round.maxOps, dataY));

  state.placedPoints.push({
    x: round.predictionXs[state.currentPointIdx],
    y: clampedY
  });
  state.currentPointIdx++;

  drawGrowthLabCanvas(round);

  if (state.currentPointIdx < round.predictionXs.length) {
    $('viz-instruction').textContent = `Click at n = ${round.predictionXs[state.currentPointIdx]}`;
  } else {
    $('viz-instruction').textContent = 'All points placed — revealing actual curve…';
    setTimeout(() => handleGrowthLabSubmit(round), 600);
  }
}

/* ══════════════════════════════════════════════════════════════
   INIT
   ══════════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  $('viz-canvas').addEventListener('click', onCanvasClick);
  showMenu();
});
