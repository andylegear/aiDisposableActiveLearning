/* ================================================================
   SQL Injection Lab — Game Engine
   Zero dependencies. Pattern-matching attack detection (no SQL parser).
   ================================================================ */

// ── Data: all level databases ────────────────────────────────────
const DATA = {
  users: [
    { id: 1, username: 'admin',   password: 's3cur3Pa$$', role: 'admin' },
    { id: 2, username: 'alice',   password: 'password123', role: 'user' },
    { id: 3, username: 'bob',     password: 'letmein',     role: 'user' },
    { id: 4, username: 'charlie', password: 'qwerty',      role: 'user' },
    { id: 5, username: 'diana',   password: 'dragon99',    role: 'user' }
  ],
  products: [
    { id: 1, name: 'Laptop',      price: 999, category: 'Electronics' },
    { id: 2, name: 'Phone',       price: 699, category: 'Electronics' },
    { id: 3, name: 'Tablet',      price: 449, category: 'Electronics' },
    { id: 4, name: 'Headphones',  price: 149, category: 'Audio' },
    { id: 5, name: 'Keyboard',    price: 79,  category: 'Peripherals' },
    { id: 6, name: 'Mouse',       price: 29,  category: 'Peripherals' }
  ],
  credit_cards: [
    { id: 1, cardholder: 'Alice Johnson', card_number: '4532-XXXX-XXXX-8901', expiry: '08/27' },
    { id: 2, cardholder: 'Bob Smith',     card_number: '5421-XXXX-XXXX-3456', expiry: '11/26' },
    { id: 3, cardholder: 'CEO Jenkins',   card_number: '6011-XXXX-XXXX-7890', expiry: '03/28' },
    { id: 4, cardholder: 'Diana Prince',  card_number: '3782-XXXX-XXXX-1234', expiry: '06/27' }
  ],
  employees: [
    { id: 1, name: 'John Manager',  salary: 95000, ssn: '123-45-6789' },
    { id: 2, name: 'Jane Dev',      salary: 85000, ssn: '234-56-7890' },
    { id: 3, name: 'Bob Intern',    salary: 35000, ssn: '345-67-8901' },
    { id: 4, name: 'Alice Director',salary: 120000,ssn: '456-78-9012' }
  ],
  feedback: [
    { id: 1, comment: 'Great service!',    timestamp: '2026-01-15 09:30' },
    { id: 2, comment: 'Could be better.',  timestamp: '2026-02-01 14:15' }
  ]
};

// ── SQL syntax highlighting helper ──────────────────────────────
const SQL_KEYWORDS = /\b(SELECT|FROM|WHERE|AND|OR|UNION|INSERT|INTO|VALUES|UPDATE|SET|DELETE|DROP|TABLE|LIKE|SUBSTRING|NOT|NULL|IN|AS|JOIN|ON|ORDER|BY|GROUP|HAVING|LIMIT)\b/gi;

function hlSQL(str) {
  return str
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/(--.*$|#.*$)/gm, '<span class="sql-comment">$1</span>')
    .replace(/'([^']*)'/g, "'<span class=\"sql-str\">$1</span>'")
    .replace(/\b(\d+)\b/g, '<span class="sql-num">$1</span>')
    .replace(SQL_KEYWORDS, '<span class="sql-kw">$&</span>');
}

// ── State ───────────────────────────────────────────────────────
let state = {
  screen: 'menu',          // menu | missionBrief | playing | levelComplete | gameComplete
  level: 0,                // 0-indexed
  score: 0,
  hintsUsed: 0,
  attempts: 0,             // per main objective
  objectivesCompleted: [],  // per level: array of booleans
  crackedChars: [],         // level 3 password cracker
  defenceStep: 0,           // level 5
  dbSnapshot: null          // for resetting level 4
};

// ── DOM refs ────────────────────────────────────────────────────
const $ = id => document.getElementById(id);
const levelNameEl  = $('level-name');
const progressEl   = $('progress');
const scoreEl      = $('score-display');
const appTitle     = $('app-title');
const appForm      = $('app-form');
const vulnCode     = $('vulnerable-code');
const liveQuery    = $('live-query');
const dbTables     = $('db-tables');
const resultsEl    = $('results-content');
const objectivesEl = $('objectives-list');
const hintsList    = $('hints-list');
const explanationPanel = $('explanation-panel');
const explanationEl    = $('explanation-content');
const overlay      = $('overlay');
const overlayContent = $('overlay-content');

// ── Levels ──────────────────────────────────────────────────────
const LEVELS = [
  // ── Level 1: The Login Bypass ──
  {
    name: 'The Login Bypass',
    subtitle: 'Authentication Bypass',
    tables: ['users'],
    vulnTemplate: `<span class="sql-comment">// Vulnerable backend code:</span>\nquery = <span class="sql-str">"SELECT * FROM users WHERE username='"</span> + user + <span class="sql-str">"' AND password='"</span> + pass + <span class="sql-str">"'"</span>`,
    briefing: {
      title: '🔓 Mission 1: The Login Bypass',
      context: 'In 2012, LinkedIn suffered a data breach affecting 6.5 million user accounts. Many of these attacks begin with a simple login bypass — the most fundamental SQL injection technique.',
      description: 'You\'ve discovered MegaCorp\'s employee portal. The backend naively concatenates user input into a SQL query. Your mission: <strong>log in as admin without knowing the password.</strong>',
      tip: 'Watch the Query Builder panel as you type. Notice how your input becomes part of the SQL statement.'
    },
    objectives: [
      { text: 'Log in as admin without the password', main: true },
      { text: 'Log in as any user without a password', main: false },
      { text: 'Log in specifically as alice', main: false },
      { text: 'Make the query return ALL user records', main: false }
    ],
    hints: [
      "In SQL, <code>--</code> starts a comment — everything after it is ignored.",
      "If the username is <code>admin' --</code>, what happens to the password check?",
      "Try typing <code>admin' --</code> in the username field (leave password empty)."
    ],
    buildForm() {
      return `
        <label>Username</label>
        <input type="text" id="input-user" placeholder="Enter username" autocomplete="off">
        <label>Password</label>
        <input type="text" id="input-pass" placeholder="Enter password" autocomplete="off">
        <button id="btn-submit">Login</button>`;
    },
    buildQuery(inputs) {
      const u = inputs.user || '';
      const p = inputs.pass || '';
      return `<span class="sql-template">SELECT * FROM users WHERE username='</span><span class="sql-injection">${esc(u)}</span><span class="sql-template">' AND password='</span><span class="sql-injection">${esc(p)}</span><span class="sql-template">'</span>`;
    },
    getInputs() {
      return {
        user: (document.getElementById('input-user') || {}).value || '',
        pass: (document.getElementById('input-pass') || {}).value || ''
      };
    },
    bindLive() {
      const handler = () => updateLiveQuery();
      const u = document.getElementById('input-user');
      const p = document.getElementById('input-pass');
      if (u) u.addEventListener('input', handler);
      if (p) p.addEventListener('input', handler);
    },
    check(inputs, objectiveIdx) {
      const u = inputs.user.trim();
      const p = inputs.pass.trim();

      // Objective 0: Log in as admin
      if (objectiveIdx === 0) {
        // admin' -- pattern
        if (/admin['"]\s*(--|#)/i.test(u))
          return { success: true, type: 'comment-bypass', message: '✓ Login successful! Welcome, admin.', rows: [DATA.users[0]], explanation: explainCommentBypass(u, p) };
        // tautology in username field
        if (hasTautology(u))
          return { success: true, type: 'tautology', message: '✓ Login successful! Welcome, admin.', rows: DATA.users, explanation: explainTautology(u, p) };
        // tautology in password field
        if (hasTautology(p))
          return { success: true, type: 'tautology', message: '✓ Login successful! Welcome, admin.', rows: DATA.users, explanation: explainTautology(u, p) };
        return { success: false, message: '✗ Access denied. Invalid credentials.' };
      }
      // Objective 1: Log in as any user
      if (objectiveIdx === 1) {
        if (hasTautology(u) || hasTautology(p) || /['"]\s*(--|#)/i.test(u))
          return { success: true, message: '✓ Bypass successful!', rows: DATA.users };
        return { success: false, message: '✗ Access denied.' };
      }
      // Objective 2: Log in as alice
      if (objectiveIdx === 2) {
        if (/alice['"]\s*(--|#)/i.test(u))
          return { success: true, message: '✓ Login successful! Welcome, alice.', rows: [DATA.users[1]] };
        return { success: false, message: '✗ Not logged in as alice.' };
      }
      // Objective 3: Return ALL rows
      if (objectiveIdx === 3) {
        if (hasTautology(u) || hasTautology(p))
          return { success: true, message: '✓ All user records returned!', rows: DATA.users };
        return { success: false, message: '✗ Query did not return all rows.' };
      }
      return { success: false, message: '✗ Try again.' };
    }
  },

  // ── Level 2: Data Heist ──
  {
    name: 'Data Heist',
    subtitle: 'UNION-Based Extraction',
    tables: ['products', 'credit_cards', 'employees'],
    vulnTemplate: `<span class="sql-comment">// Vulnerable backend code:</span>\nquery = <span class="sql-str">"SELECT name, price FROM products WHERE name LIKE '%"</span> + input + <span class="sql-str">"%'"</span>`,
    briefing: {
      title: '💳 Mission 2: Data Heist',
      context: 'The 2013 Target data breach exposed 40 million credit card numbers. Attackers often use UNION-based injection to extract data from tables the application never intended to expose.',
      description: 'ShopMart\'s product search page has a vulnerability. The database contains more than just products — there are <strong>credit cards</strong> and <strong>employee records</strong> hidden in other tables. Your mission: <strong>extract the credit card numbers.</strong>',
      tip: 'The UNION keyword combines results from two SELECT queries. Both must return the same number of columns.'
    },
    objectives: [
      { text: 'Extract credit card numbers', main: true },
      { text: 'Extract employee SSNs', main: false },
      { text: 'Cause a column count mismatch error', main: false }
    ],
    hints: [
      "<code>UNION</code> lets you combine results from two SELECT statements.",
      "Both SELECTs in a UNION must return the same number of columns. The product query returns <strong>2 columns</strong> (name, price).",
      "Try: <code>' UNION SELECT card_number, expiry FROM credit_cards --</code>"
    ],
    buildForm() {
      return `
        <label>Search Products</label>
        <input type="text" id="input-search" placeholder="Search..." autocomplete="off">
        <button id="btn-submit">Search</button>`;
    },
    buildQuery(inputs) {
      const s = inputs.search || '';
      return `<span class="sql-template">SELECT name, price FROM products WHERE name LIKE '%</span><span class="sql-injection">${esc(s)}</span><span class="sql-template">%'</span>`;
    },
    getInputs() {
      return { search: (document.getElementById('input-search') || {}).value || '' };
    },
    bindLive() {
      const el = document.getElementById('input-search');
      if (el) el.addEventListener('input', () => updateLiveQuery());
    },
    check(inputs, objectiveIdx) {
      const s = inputs.search.trim();
      const upper = s.toUpperCase();

      if (objectiveIdx === 0) {
        // Credit cards via UNION
        if (/UNION/i.test(s) && /credit_cards/i.test(s)) {
          // Check column count — need exactly 2 selected columns
          const colMatch = s.match(/UNION\s+SELECT\s+(.+?)\s+FROM/i);
          if (colMatch) {
            const cols = colMatch[1].split(',').map(c => c.trim()).filter(c => c !== '');
            if (cols.length !== 2 && !/\*/.test(colMatch[1])) {
              return { success: false, message: '✗ Column count mismatch! The first query returns 2 columns, but your UNION SELECT returns ' + cols.length + '.', isError: true };
            }
          }
          if (/\*/.test(s) && /UNION\s+SELECT\s+\*/i.test(s)) {
            return { success: false, message: '✗ Column count mismatch! SELECT * from credit_cards returns 4 columns, but the product query returns 2.', isError: true };
          }
          return {
            success: true,
            message: '✓ Credit card data extracted!',
            rows: DATA.credit_cards.map(c => ({ name: c.card_number, price: c.expiry })),
            columns: ['card_number', 'expiry'],
            explanation: '<p>The <code>UNION</code> keyword appended your second SELECT to the product query\'s results. Because both return 2 columns, the database combined them into one result set — leaking the credit card table.</p><div class="explain-query">' + hlSQL("SELECT name, price FROM products WHERE name LIKE '%...%' UNION SELECT card_number, expiry FROM credit_cards") + '</div><p>In a real application, the attacker would see credit card data mixed in with product search results.</p>'
          };
        }
        return { success: false, message: s ? '✗ No sensitive data extracted. Try using UNION.' : '' };
      }
      if (objectiveIdx === 1) {
        if (/UNION/i.test(s) && /employees/i.test(s) && /ssn/i.test(s)) {
          return { success: true, message: '✓ Employee SSNs extracted!', rows: DATA.employees.map(e => ({ name: e.ssn, price: e.name })), columns: ['ssn', 'name'] };
        }
        return { success: false, message: '✗ SSNs not extracted yet.' };
      }
      if (objectiveIdx === 2) {
        // Intentional mismatch
        if (/UNION/i.test(s)) {
          const colMatch = s.match(/UNION\s+SELECT\s+(.+?)\s+FROM/i);
          if (colMatch) {
            const cols = colMatch[1].split(',').map(c => c.trim()).filter(c => c !== '');
            if (cols.length !== 2 || /\*/.test(colMatch[1])) {
              return { success: true, message: '✓ Column count mismatch error triggered! The database rejects UNION queries with mismatched column counts.', isError: true };
            }
          }
          if (/UNION\s+SELECT\s+\*/i.test(s)) {
            return { success: true, message: '✓ Column count mismatch error triggered!' };
          }
        }
        return { success: false, message: '✗ Try a UNION with the wrong number of columns.' };
      }
      return { success: false, message: '✗ Try again.' };
    }
  },

  // ── Level 3: Blind Spot ──
  {
    name: 'Blind Spot',
    subtitle: 'Boolean-Based Blind Injection',
    tables: ['users'],
    vulnTemplate: `<span class="sql-comment">// Vulnerable backend code:</span>\nquery = <span class="sql-str">"SELECT * FROM users WHERE id="</span> + input`,
    briefing: {
      title: '🕵️ Mission 3: Blind Spot',
      context: 'Many real-world applications don\'t show database errors or query results. In 2014, researchers demonstrated blind SQL injection attacks that extracted entire databases from government websites — one boolean answer at a time.',
      description: 'This user lookup page only tells you if a user exists or not — it never shows actual data. But that single bit of information is enough. Your mission: <strong>extract the admin\'s password, one character at a time.</strong>',
      tip: 'The admin\'s user ID is 1. Their password is 10 characters long. Use SUBSTRING to test each character position.'
    },
    objectives: [
      { text: 'Crack all 10 characters of the admin password', main: true }
    ],
    hints: [
      "<code>AND</code> lets you add extra conditions. Try: <code>1 AND 1=1</code> → exists, <code>1 AND 1=2</code> → not found.",
      "<code>SUBSTRING(column, position, length)</code> extracts part of a string. The admin's user ID is <strong>1</strong>.",
      "Try: <code>1 AND SUBSTRING(password,1,1)='a'</code> — change the letter until you get 'exists'."
    ],
    buildForm() {
      const pw = 's3cur3Pa$$';
      let slots = '';
      for (let i = 0; i < pw.length; i++) {
        const cracked = state.crackedChars[i] || '';
        const cls = cracked ? 'cracked' : (i === nextUncracked() ? 'active' : '');
        slots += `<div class="pw-slot ${cls}">${cracked ? esc(cracked) : '_'}</div>`;
      }
      return `
        <label>Enter User ID</label>
        <input type="text" id="input-userid" placeholder="e.g. 1" autocomplete="off">
        <button id="btn-submit">Check</button>
        <div style="margin-top:1rem;text-align:center;">
          <div style="color:var(--text-dim);font-size:0.75rem;margin-bottom:0.4rem;">PASSWORD CRACKER — Admin (id=1)</div>
          <div class="password-cracker">${slots}</div>
          <div style="color:var(--text-dim);font-size:0.7rem;">${state.crackedChars.filter(c=>c).length} / ${pw.length} characters cracked</div>
        </div>`;
    },
    buildQuery(inputs) {
      const v = inputs.userid || '';
      return `<span class="sql-template">SELECT * FROM users WHERE id=</span><span class="sql-injection">${esc(v)}</span>`;
    },
    getInputs() {
      return { userid: (document.getElementById('input-userid') || {}).value || '' };
    },
    bindLive() {
      const el = document.getElementById('input-userid');
      if (el) el.addEventListener('input', () => updateLiveQuery());
    },
    check(inputs) {
      const v = inputs.userid.trim();
      const pw = 's3cur3Pa$$';

      // Pure number — normal lookup
      if (/^\d+$/.test(v)) {
        const id = parseInt(v);
        const exists = DATA.users.some(u => u.id === id);
        return { success: false, message: exists ? '✓ User exists.' : '✗ User not found.', noFail: true };
      }

      // Boolean test: 1=1 / 1=2
      if (/^\d+\s+AND\s+1\s*=\s*1$/i.test(v)) {
        return { success: false, message: '✓ User exists.', noFail: true };
      }
      if (/^\d+\s+AND\s+1\s*=\s*2$/i.test(v)) {
        return { success: false, message: '✗ User not found.', noFail: true };
      }

      // SUBSTRING test
      const subMatch = v.match(/(\d+)\s+AND\s+SUBSTRING\s*\(\s*password\s*,\s*(\d+)\s*,\s*1\s*\)\s*=\s*'([^']*)'/i);
      if (subMatch) {
        const userId = parseInt(subMatch[1]);
        const pos = parseInt(subMatch[2]);
        const testChar = subMatch[3];

        if (userId !== 1) {
          return { success: false, message: '✗ User not found.', noFail: true };
        }

        if (pos >= 1 && pos <= pw.length) {
          const actual = pw[pos - 1];
          if (testChar === actual) {
            // Crack this character
            state.crackedChars[pos - 1] = actual;
            // Re-render form to update slots
            setTimeout(() => {
              appForm.innerHTML = LEVELS[2].buildForm();
              LEVELS[2].bindLive();
              bindSubmit();
            }, 100);

            // Check if all cracked
            const allCracked = state.crackedChars.filter(c => c).length === pw.length;
            if (allCracked) {
              return {
                success: true,
                message: '✓ User exists. CHARACTER CRACKED: position ' + pos + " = '" + actual + "'\n\n🔓 PASSWORD FULLY CRACKED: " + pw,
                explanation: '<p>Blind SQL injection extracts data using only yes/no responses. By testing each character position with <code>SUBSTRING</code>, you reconstructed the entire password.</p><div class="explain-query">' + hlSQL("1 AND SUBSTRING(password,1,1)='s'  → exists (TRUE)\n1 AND SUBSTRING(password,2,1)='3'  → exists (TRUE)\n...and so on for all 10 characters") + '</div><p>In real attacks, this process is automated — scripts can extract entire databases through a single boolean endpoint.</p>'
              };
            }
            return { success: false, message: '✓ User exists. CHARACTER CRACKED: position ' + pos + " = '" + actual + "'", noFail: true };
          } else {
            return { success: false, message: '✗ User not found.', noFail: true };
          }
        }
      }

      // Generic AND condition — try to be helpful
      if (/AND/i.test(v)) {
        return { success: false, message: '✗ User not found.', noFail: true };
      }

      return { success: false, message: '✗ Invalid input.', noFail: true };
    }
  },

  // ── Level 4: Drop Zone ──
  {
    name: 'Drop Zone',
    subtitle: 'Destructive Attacks',
    tables: ['feedback', 'users', 'products'],
    vulnTemplate: `<span class="sql-comment">// Vulnerable backend code:</span>\nquery = <span class="sql-str">"INSERT INTO feedback (comment) VALUES ('"</span> + input + <span class="sql-str">"')"</span>`,
    briefing: {
      title: '💥 Mission 4: Drop Zone',
      context: 'In 2011, the hacking group LulzSec used SQL injection to breach Sony Pictures, deleting databases and leaking 1 million user accounts. Destructive SQL injection can cause irreversible damage.',
      description: 'This feedback form has a dangerous vulnerability. The INSERT statement can be terminated and followed by <strong>any SQL command</strong>. Your mission: <strong>demonstrate the damage an attacker could do.</strong>',
      tip: 'Close the INSERT with <code>\')</code> then add a semicolon <code>;</code> to start a new statement. Don\'t forget <code>--</code> to comment out the trailing quote.'
    },
    objectives: [
      { text: 'Drop the users table', main: true },
      { text: 'Change the admin password to "hacked"', main: false },
      { text: 'Delete all products', main: false }
    ],
    hints: [
      "You need to close the INSERT's VALUES clause first. Start with: <code>'); </code>",
      "<code>DROP TABLE users</code> permanently destroys a table. <code>DELETE FROM products</code> removes all rows.",
      "Try: <code>'); DROP TABLE users; --</code>"
    ],
    buildForm() {
      return `
        <label>Leave your feedback</label>
        <textarea id="input-feedback" placeholder="Write your comment..." rows="3"></textarea>
        <button id="btn-submit">Submit Feedback</button>
        <button class="reset-btn" id="btn-reset-db" style="margin-top:0.4rem;">↻ Reset Database</button>`;
    },
    buildQuery(inputs) {
      const f = inputs.feedback || '';
      return `<span class="sql-template">INSERT INTO feedback (comment) VALUES ('</span><span class="sql-injection">${esc(f)}</span><span class="sql-template">')</span>`;
    },
    getInputs() {
      return { feedback: (document.getElementById('input-feedback') || {}).value || '' };
    },
    bindLive() {
      const el = document.getElementById('input-feedback');
      if (el) el.addEventListener('input', () => updateLiveQuery());
      const resetBtn = document.getElementById('btn-reset-db');
      if (resetBtn) resetBtn.addEventListener('click', () => {
        state.dbSnapshot = JSON.parse(JSON.stringify({ users: DATA.users, products: DATA.products, feedback: DATA.feedback }));
        renderDB();
        resultsEl.innerHTML = '<span class="result-info">Database restored.</span>';
      });
    },
    check(inputs, objectiveIdx) {
      const f = inputs.feedback.trim();
      const upper = f.toUpperCase();

      // Must close the INSERT first
      const closesInsert = /'\s*\)\s*;/i.test(f);

      if (objectiveIdx === 0) {
        if (closesInsert && /DROP\s+TABLE\s+users/i.test(f)) {
          // Animate table drop
          setTimeout(() => animateTableDrop('users'), 200);
          return {
            success: true,
            message: '💥 TABLE DROPPED!',
            damage: 'The <strong>users</strong> table has been destroyed. 5 user accounts lost forever. In a real system, this data might be unrecoverable without backups.',
            explanation: '<p>By closing the INSERT statement with <code>\')</code> and starting a new statement with <code>;</code>, you injected a <code>DROP TABLE</code> command.</p><div class="explain-query">' + hlSQL("INSERT INTO feedback (comment) VALUES (''); DROP TABLE users; --')") + '</div><p>The database executed both statements: first the harmless INSERT, then the destructive DROP.</p>'
          };
        }
        if (!closesInsert && /DROP/i.test(f)) {
          return { success: false, message: '✗ Your DROP is inside the string literal. You need to close the INSERT statement first with <code>\')</code> then <code>;</code>' };
        }
        return { success: false, message: f ? '✗ No damage done. Try closing the INSERT first.' : '' };
      }
      if (objectiveIdx === 1) {
        if (closesInsert && /UPDATE\s+users\s+SET\s+password\s*=\s*'hacked'/i.test(f) && /admin/i.test(f)) {
          setTimeout(() => animateRowUpdate('users', 0, 'password', 'hacked'), 200);
          return {
            success: true,
            message: '⚠️ ADMIN PASSWORD CHANGED!',
            damage: 'The admin password has been changed to "hacked". The attacker now has full administrative access.'
          };
        }
        return { success: false, message: f ? '✗ Admin password unchanged.' : '' };
      }
      if (objectiveIdx === 2) {
        if (closesInsert && /DELETE\s+FROM\s+products/i.test(f)) {
          setTimeout(() => animateRowsDelete('products'), 200);
          return {
            success: true,
            message: '🗑️ ALL PRODUCTS DELETED!',
            damage: 'All 6 products have been deleted from the database. The e-commerce site is now completely empty.'
          };
        }
        return { success: false, message: f ? '✗ Products still intact.' : '' };
      }
      return { success: false, message: '✗ Try again.' };
    }
  },

  // ── Level 5: Defence Lab ──
  {
    name: 'Defence Lab',
    subtitle: 'Parameterised Queries',
    tables: ['users'],
    vulnTemplate: '<span class="sql-comment">// Fix the vulnerable code below using parameterised queries (? placeholders)</span>',
    briefing: {
      title: '🛡️ Mission 5: Defence Lab',
      context: 'Parameterised queries (also called prepared statements) are the #1 defence against SQL injection. They separate SQL structure from user data, making injection impossible — not just harder, but logically impossible.',
      description: 'Role reversal: <strong>you are now the defender.</strong> Fix each vulnerable query by rewriting it to use <code>?</code> placeholders instead of string concatenation. Then watch as the injection attacks from earlier levels bounce harmlessly off your defences.',
      tip: 'Replace string concatenation (<code>+ user +</code>) with <code>?</code> placeholders, and specify a <code>params</code> array with the variables.'
    },
    objectives: [
      { text: 'Fix the login query', main: true },
      { text: 'Fix the search query', main: false },
      { text: 'Fix the feedback INSERT query', main: false }
    ],
    hints: [
      "Replace <code>+ user +</code> with <code>?</code> and add <code>params = [user, pass]</code>.",
      "For the search query, the LIKE still needs <code>?</code> — the <code>%</code> wildcards go in the params: <code>params = ['%' + input + '%']</code>.",
      "The pattern is always: remove concatenation, use <code>?</code>, provide <code>params = [...]</code>."
    ],
    defenceChallenges: [
      {
        title: 'Fix the Login Query',
        vulnerable: `// VULNERABLE — fix this!\nquery = "SELECT * FROM users WHERE username='" + user + "' AND password='" + pass + "'";`,
        varNames: ['user', 'pass'],
        attacks: ["admin' --", "' OR '1'='1' --", "' OR 1=1 --"]
      },
      {
        title: 'Fix the Search Query',
        vulnerable: `// VULNERABLE — fix this!\nquery = "SELECT name, price FROM products WHERE name LIKE '%" + input + "%'";`,
        varNames: ['input'],
        attacks: ["' UNION SELECT card_number, expiry FROM credit_cards --", "' OR '1'='1' --"]
      },
      {
        title: 'Fix the Feedback INSERT',
        vulnerable: `// VULNERABLE — fix this!\nquery = "INSERT INTO feedback (comment) VALUES ('" + input + "')";`,
        varNames: ['input'],
        attacks: ["'); DROP TABLE users; --", "'); DELETE FROM products; --"]
      }
    ],
    buildForm() {
      const ch = this.defenceChallenges[state.defenceStep] || this.defenceChallenges[0];
      return `
        <div style="color:var(--amber);font-weight:bold;margin-bottom:0.6rem;">${ch.title}</div>
        <textarea class="defence-editor" id="input-defence" rows="4">${esc(ch.vulnerable)}</textarea>
        <button id="btn-submit">Submit Fix</button>`;
    },
    buildQuery(inputs) {
      const code = inputs.defence || '';
      return `<span class="sql-template">${esc(code)}</span>`;
    },
    getInputs() {
      return { defence: (document.getElementById('input-defence') || {}).value || '' };
    },
    bindLive() {
      const el = document.getElementById('input-defence');
      if (el) el.addEventListener('input', () => updateLiveQuery());
    },
    check(inputs, objectiveIdx) {
      const code = inputs.defence.trim();
      const ch = this.defenceChallenges[objectiveIdx] || this.defenceChallenges[0];

      // Validation: must have ? placeholder
      if (!/\?/.test(code)) {
        return { success: false, message: '✗ No <code>?</code> placeholders found. Use <code>?</code> instead of concatenation.' };
      }
      // Must not have concatenation with variable names
      for (const v of ch.varNames) {
        const concatRe = new RegExp('[+]\\s*' + v + '|' + v + '\\s*[+]', 'i');
        if (concatRe.test(code)) {
          return { success: false, message: `✗ Still concatenating <code>${v}</code> into the query. Replace it with <code>?</code>.` };
        }
      }
      // Must have params array
      if (!/params\s*=\s*\[/.test(code)) {
        return { success: false, message: '✗ Missing <code>params</code> array. Add <code>params = [...]</code> with your variables.' };
      }

      // All checks pass — run attack simulation
      return {
        success: true,
        message: '🛡️ SECURE!',
        attacks: ch.attacks,
        explanation: '<p>With parameterised queries, user input is treated as <strong>data</strong>, never as SQL code. The database engine keeps the query structure and user values completely separate.</p><p>No matter what an attacker types — <code>\' OR 1=1 --</code>, <code>DROP TABLE</code>, anything — it\'s treated as a literal string value, not executable SQL.</p>'
      };
    }
  }
];

// ── Helper functions ────────────────────────────────────────────
function esc(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function hasTautology(s) {
  return /['"]?\s*OR\s+['"]?1['"]?\s*=\s*['"]?1/i.test(s)
    || /['"]?\s*OR\s+1\s*=\s*1/i.test(s)
    || /['"]?\s*OR\s+['"]?['"]?\s*=\s*['"]?/i.test(s)
    || /OR\s+true/i.test(s);
}

function nextUncracked() {
  for (let i = 0; i < 10; i++) {
    if (!state.crackedChars[i]) return i;
  }
  return -1;
}

function explainCommentBypass(u, p) {
  return `<p>Your input <code>${esc(u)}</code> closed the username string and added <code>--</code>, which comments out the rest of the query — including the password check.</p>
<div class="explain-query">${hlSQL("SELECT * FROM users WHERE username='" + u + "' AND password='" + p + "'")}</div>
<p>Everything after <code>--</code> is ignored, so the query becomes:</p>
<div class="explain-query">${hlSQL("SELECT * FROM users WHERE username='admin'")}</div>
<p>No password required!</p>`;
}

function explainTautology(u, p) {
  return `<p>Your injection introduced <code>OR 1=1</code> (or equivalent), which is always TRUE. This makes the WHERE clause match <strong>every row</strong> in the table.</p>
<div class="explain-query">${hlSQL("SELECT * FROM users WHERE username='" + u + "' AND password='" + p + "'")}</div>
<p>Since <code>1=1</code> is always true, the OR condition bypasses all authentication — every user record is returned.</p>`;
}

// ── DB animation helpers ────────────────────────────────────────
function animateTableDrop(tableName) {
  const el = document.querySelector(`.db-table[data-table="${tableName}"]`);
  if (!el) return;
  el.querySelectorAll('tr').forEach((row, i) => {
    setTimeout(() => row.classList.add('row-flash-red'), i * 100);
    setTimeout(() => row.classList.add('row-fade-out'), i * 100 + 300);
  });
  setTimeout(() => el.classList.add('dropped'), 600);
}

function animateRowsDelete(tableName) {
  const el = document.querySelector(`.db-table[data-table="${tableName}"]`);
  if (!el) return;
  const rows = el.querySelectorAll('tbody tr');
  rows.forEach((row, i) => {
    setTimeout(() => row.classList.add('row-flash-red'), i * 150);
    setTimeout(() => row.classList.add('row-fade-out'), i * 150 + 400);
  });
}

function animateRowUpdate(tableName, rowIdx, colName, newValue) {
  const el = document.querySelector(`.db-table[data-table="${tableName}"]`);
  if (!el) return;
  const headers = Array.from(el.querySelectorAll('th')).map(th => th.textContent.trim());
  const colIdx = headers.indexOf(colName);
  if (colIdx < 0) return;
  const row = el.querySelectorAll('tbody tr')[rowIdx];
  if (!row) return;
  row.classList.add('row-updated');
  const cell = row.querySelectorAll('td')[colIdx];
  if (cell) {
    setTimeout(() => { cell.textContent = newValue; }, 300);
  }
}

// ── Render helpers ──────────────────────────────────────────────
function renderDB() {
  const level = LEVELS[state.level];
  let html = '';
  for (const tName of level.tables) {
    const rows = (state.dbSnapshot && state.dbSnapshot[tName]) ? state.dbSnapshot[tName] : DATA[tName];
    if (!rows || rows.length === 0) continue;
    const cols = Object.keys(rows[0]);
    html += `<div class="db-table" data-table="${tName}">
      <div class="db-table-name">${tName}</div>
      <table><thead><tr>${cols.map(c => `<th>${esc(c)}</th>`).join('')}</tr></thead>
      <tbody>${rows.map(r => `<tr>${cols.map(c => `<td>${esc(String(r[c]))}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
  }
  dbTables.innerHTML = html;
}

function renderObjectives() {
  const level = LEVELS[state.level];
  let html = '';
  level.objectives.forEach((obj, i) => {
    const done = state.objectivesCompleted[i];
    const isActive = !done && (i === 0 || (i > 0 && state.objectivesCompleted[0]));
    const cls = done ? 'completed' : (isActive ? 'active' : '');
    const check = done ? '✓' : '';
    const label = obj.main ? obj.text : `⭐ Bonus: ${obj.text}`;
    html += `<div class="objective-item ${cls}"><span class="objective-check">${check}</span> ${label}</div>`;
  });
  objectivesEl.innerHTML = html;
}

function renderHints() {
  const level = LEVELS[state.level];
  if (!level.hints || level.hints.length === 0) {
    hintsList.innerHTML = '<span class="result-info">No hints for this level.</span>';
    return;
  }
  let html = '';
  level.hints.forEach((hint, i) => {
    html += `<div class="hint-item" id="hint-${i}">
      <button class="hint-reveal-btn" onclick="revealHint(${i})">Reveal Hint ${i + 1}</button>
    </div>`;
  });
  hintsList.innerHTML = html;
}

function revealHint(idx) {
  const level = LEVELS[state.level];
  const container = document.getElementById('hint-' + idx);
  if (!container) return;
  container.innerHTML = `<div class="hint-text">💡 ${level.hints[idx]}</div>`;
  state.score = Math.max(0, state.score - 10);
  state.hintsUsed++;
  updateScore();
}

function updateScore() {
  scoreEl.textContent = 'Score: ' + state.score;
}

function updateLiveQuery() {
  const level = LEVELS[state.level];
  const inputs = level.getInputs();
  liveQuery.innerHTML = level.buildQuery(inputs);
}

function renderLevel() {
  const level = LEVELS[state.level];
  levelNameEl.textContent = level.name;
  progressEl.textContent = `Level ${state.level + 1} / 5`;
  appTitle.textContent = level.name + ' — ' + level.subtitle;
  vulnCode.innerHTML = level.vulnTemplate;

  // Reset level state
  state.objectivesCompleted = level.objectives.map(() => false);
  state.attempts = 0;
  state.hintsUsed = 0;
  if (state.level === 2) state.crackedChars = [];
  if (state.level === 3) state.dbSnapshot = JSON.parse(JSON.stringify({ users: DATA.users, products: DATA.products, feedback: DATA.feedback }));
  if (state.level === 4) state.defenceStep = 0;

  appForm.innerHTML = level.buildForm();
  level.bindLive();
  bindSubmit();
  renderDB();
  renderObjectives();
  renderHints();
  resultsEl.innerHTML = '';
  explanationPanel.classList.add('hidden');
  updateLiveQuery();
  updateScore();
}

function bindSubmit() {
  const btn = document.getElementById('btn-submit');
  if (btn) btn.addEventListener('click', handleSubmit);
  // Enter key submits on single-line inputs
  appForm.querySelectorAll('input[type="text"], input[type="password"]').forEach(inp => {
    inp.addEventListener('keydown', e => { if (e.key === 'Enter') handleSubmit(); });
  });
}

// ── Submit handler ──────────────────────────────────────────────
function handleSubmit() {
  const level = LEVELS[state.level];
  const inputs = level.getInputs();

  // Find current active objective
  let activeObj = -1;
  for (let i = 0; i < level.objectives.length; i++) {
    if (!state.objectivesCompleted[i]) {
      if (i === 0 || state.objectivesCompleted[0]) {
        activeObj = i;
        break;
      }
    }
  }
  if (activeObj === -1) return; // all done

  const result = level.check(inputs, activeObj);

  // Render result
  if (result.success) {
    state.objectivesCompleted[activeObj] = true;

    // Score
    const pts = level.objectives[activeObj].main ? 100 : 50;
    const firstTry = (activeObj === 0 && state.attempts === 0) ? 50 : 0;
    state.score += pts + firstTry;
    updateScore();

    // Results display
    let resHTML = `<span class="result-success">${result.message}</span>`;
    if (firstTry) resHTML += `<br><span style="color:var(--amber);">+${firstTry} first-try bonus!</span>`;
    if (result.damage) resHTML += `<div class="damage-report">⚠️ ${result.damage}</div>`;

    // Result rows
    if (result.rows) {
      resHTML += renderResultTable(result.rows, result.columns);
    }

    // Defence lab attack simulation
    if (result.attacks) {
      resHTML += '<div class="shield-icon">🛡️</div>';
      result.attacks.forEach((atk, i) => {
        setTimeout(() => {
          const attackDiv = document.getElementById('attack-test-' + i);
          if (attackDiv) {
            attackDiv.classList.add('blocked');
            attackDiv.style.animationDelay = (i * 0.3) + 's';
          }
        }, i * 600);
      });
      resHTML += result.attacks.map((atk, i) =>
        `<div class="attack-test blocked" id="attack-test-${i}" style="animation-delay:${i * 0.3}s;">
          <span class="attack-status">BLOCKED ✓</span>
          <span class="attack-payload"><code>${esc(atk)}</code></span>
        </div>`
      ).join('');
    }

    resultsEl.innerHTML = resHTML;

    // Explanation
    if (result.explanation) {
      explanationPanel.classList.remove('hidden');
      explanationEl.innerHTML = result.explanation;
    }

    renderObjectives();

    // Check if all objectives done
    const allDone = state.objectivesCompleted.every(c => c);
    if (allDone) {
      setTimeout(() => showLevelComplete(), 1500);
    } else if (state.level === 3) {
      // Level 4 — reset DB between sub-challenges
      if (activeObj < level.objectives.length - 1) {
        setTimeout(() => {
          state.dbSnapshot = JSON.parse(JSON.stringify({ users: DATA.users, products: DATA.products, feedback: DATA.feedback }));
          renderDB();
        }, 2000);
      }
    } else if (state.level === 4) {
      // Defence lab — advance to next challenge
      state.defenceStep = state.objectivesCompleted.filter(c => c).length;
      if (state.defenceStep < level.defenceChallenges.length) {
        setTimeout(() => {
          appForm.innerHTML = level.buildForm();
          level.bindLive();
          bindSubmit();
          updateLiveQuery();
        }, 1000);
      }
    }
  } else {
    if (!result.noFail) state.attempts++;
    resultsEl.innerHTML = `<span class="${result.isError ? 'result-fail' : 'result-fail'}">${result.message}</span>`;
  }
}

function renderResultTable(rows, colOverride) {
  if (!rows || rows.length === 0) return '';
  const cols = colOverride || Object.keys(rows[0]);
  let html = '<table class="result-table"><thead><tr>';
  cols.forEach(c => html += `<th>${esc(c)}</th>`);
  html += '</tr></thead><tbody>';
  rows.forEach(r => {
    html += '<tr>';
    cols.forEach(c => {
      const val = r[c] !== undefined ? r[c] : (Object.values(r)[cols.indexOf(c)] || '');
      html += `<td>${esc(String(val))}</td>`;
    });
    html += '</tr>';
  });
  html += '</tbody></table>';
  return html;
}

// ── Overlays ────────────────────────────────────────────────────
function showOverlay(html) {
  overlayContent.innerHTML = html;
  overlay.classList.remove('hidden');
}

function hideOverlay() {
  overlay.classList.add('hidden');
}

function showMenu() {
  state.screen = 'menu';
  state.level = 0;
  state.score = 0;
  showOverlay(`
    <h2>🔐 SQL Injection Lab</h2>
    <p style="text-align:center;">A hands-on cybersecurity training game.<br>Learn how SQL injection attacks work — and how to stop them.</p>
    <p style="text-align:center;color:var(--text-dim);font-size:0.8rem;">5 Missions · Attack & Defence · Zero Dependencies</p>
    <button class="overlay-btn" onclick="startLevel()">Begin Training</button>
  `);
}

function showMissionBrief() {
  const level = LEVELS[state.level];
  const b = level.briefing;
  showOverlay(`
    <h2>${b.title}</h2>
    <div class="mission-context">${b.context}</div>
    <p>${b.description}</p>
    <h3>💡 Tip</h3>
    <p>${b.tip}</p>
    <button class="overlay-btn" onclick="beginPlaying()">Start Mission</button>
  `);
}

function showLevelComplete() {
  const level = LEVELS[state.level];
  const isLast = state.level === LEVELS.length - 1;
  showOverlay(`
    <h2>✓ ${level.name} — Complete!</h2>
    <div class="overlay-score">Score: ${state.score}</div>
    <p style="text-align:center;">All objectives achieved.</p>
    <button class="overlay-btn" onclick="${isLast ? 'showGameComplete()' : 'nextLevel()'}">
      ${isLast ? 'See Final Results' : 'Next Mission →'}
    </button>
  `);
}

function showGameComplete() {
  showOverlay(`
    <h2>🏆 Training Complete!</h2>
    <div class="overlay-score">Final Score: ${state.score}</div>
    <p style="text-align:center;">You've mastered SQL injection — both attack and defence.</p>
    <h3>Key Takeaways</h3>
    <p>1. <strong>Never concatenate user input into SQL.</strong> Always use parameterised queries.</p>
    <p>2. SQL injection can <strong>bypass authentication</strong>, <strong>steal data</strong>, and <strong>destroy databases</strong>.</p>
    <p>3. <strong>Prepared statements</strong> make injection logically impossible — not just harder, but impossible.</p>
    <button class="overlay-btn" onclick="showMenu()">Play Again</button>
  `);
}

// ── Navigation ──────────────────────────────────────────────────
function startLevel() {
  hideOverlay();
  showMissionBrief();
}

function beginPlaying() {
  hideOverlay();
  state.screen = 'playing';
  renderLevel();
}

function nextLevel() {
  state.level++;
  hideOverlay();
  showMissionBrief();
}

// Make functions available to onclick handlers
window.revealHint = revealHint;
window.startLevel = startLevel;
window.beginPlaying = beginPlaying;
window.nextLevel = nextLevel;
window.showMenu = showMenu;
window.showGameComplete = showGameComplete;

// ── Init ────────────────────────────────────────────────────────
showMenu();
