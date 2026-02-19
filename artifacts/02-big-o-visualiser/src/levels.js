/* ═══════════════════════════════════════════════════════════════
   levels.js — Big-O Dojo: Level & Round Data
   Module:  CE4003 Algorithms and Data Structures
   Study:   AI-Generated Disposable Software in CS Education
   ═══════════════════════════════════════════════════════════════ */

/* ── Colour map per complexity class ── */
const COMPLEXITY_COLORS = {
  'O(1)':       '#00e676',
  'O(log n)':   '#448aff',
  'O(n)':       '#ffea00',
  'O(n log n)': '#ff9100',
  'O(n²)':      '#ff1744',
  'O(2ⁿ)':      '#d500f9'
};

/* ── Belt progression ── */
const BELT_INFO = [
  { name: 'White',  color: '#e0e0e0', dark: '#bdbdbd', text: '#1a1a2e' },
  { name: 'Yellow', color: '#ffd740', dark: '#c8a415', text: '#1a1a2e' },
  { name: 'Green',  color: '#00e676', dark: '#00a152', text: '#1a1a2e' },
  { name: 'Blue',   color: '#448aff', dark: '#1565c0', text: '#ffffff' },
  { name: 'Black',  color: '#424242', dark: '#212121', text: '#ffd740' }
];

/* ── Answer button set ── */
const COMPLEXITY_OPTIONS = ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)', 'O(n²)', 'O(2ⁿ)'];

/* ══════════════════════════════════════════════════════════════
   LEVELS  —  5 levels, 17 rounds total
   ══════════════════════════════════════════════════════════════ */
const LEVELS = [

  /* ─────────────────────────────────────────────────────────
     Level 1 : CLASSIFY  (White Belt)
     Read the code ➜ pick the correct Big-O class
     ───────────────────────────────────────────────────────── */
  {
    id: 1,
    name: 'Classify',
    beltIndex: 0,
    type: 'classify',
    subtitle: 'White Belt — The Basics',
    description: 'Read the code snippet.\nPick the correct Big-O complexity class.\nYou have 15 seconds per round!',
    rounds: [
      {
        code:
`function getFirst(arr) {
  return arr[0];
}`,
        answer: 'O(1)',
        explanation: 'This function accesses a single element by index. No loops, no recursion — just one operation regardless of array size. That\'s constant time: O(1).',
        ops: function (n) { return 1; },
        timeLimit: 15
      },
      {
        code:
`function sum(arr) {
  let total = 0;
  for (let i = 0; i < arr.length; i++) {
    total += arr[i];
  }
  return total;
}`,
        answer: 'O(n)',
        explanation: 'The for-loop visits every element exactly once. If the array has n elements the loop runs n times. One pass through the data = O(n).',
        ops: function (n) { return n; },
        timeLimit: 15
      },
      {
        code:
`function hasDuplicate(arr) {
  for (let i = 0; i < arr.length; i++) {
    for (let j = i + 1; j < arr.length; j++) {
      if (arr[i] === arr[j]) return true;
    }
  }
  return false;
}`,
        answer: 'O(n²)',
        explanation: 'Two nested loops each iterating up to n elements. The inner loop runs roughly n times for each outer iteration. n × n ≈ O(n²).',
        ops: function (n) { return n * (n - 1) / 2; },
        timeLimit: 15
      },
      {
        code:
`function binarySearch(arr, target) {
  let lo = 0, hi = arr.length - 1;
  while (lo <= hi) {
    let mid = Math.floor((lo + hi) / 2);
    if (arr[mid] === target) return mid;
    if (arr[mid] < target) lo = mid + 1;
    else hi = mid - 1;
  }
  return -1;
}`,
        answer: 'O(log n)',
        explanation: 'Each iteration halves the search space. Starting with n elements we reach 1 after log₂(n) steps. This "halving" pattern is the hallmark of O(log n).',
        ops: function (n) { return Math.max(1, Math.ceil(Math.log2(n + 1))); },
        timeLimit: 15
      }
    ]
  },

  /* ─────────────────────────────────────────────────────────
     Level 2 : GROWTH LAB  (Yellow Belt)
     Click on the chart to predict the shape of a growth curve
     ───────────────────────────────────────────────────────── */
  {
    id: 2,
    name: 'Growth Lab',
    beltIndex: 1,
    type: 'growth_lab',
    subtitle: 'Yellow Belt — Seeing Growth',
    description: 'Predict what the growth curve looks like.\nClick at each marked n-value to place your predicted operation count.\nThen see how close you were!',
    rounds: [
      {
        challenge: 'Draw the growth curve for O(n)',
        targetClass: 'O(n)',
        targetFn: function (n) { return n; },
        maxN: 100,
        maxOps: 120,
        predictionXs: [20, 40, 60, 80, 100],
        explanation: 'O(n) grows linearly — a straight line from the origin. Double the input, double the work. This is the baseline "one pass through the data" pattern.'
      },
      {
        challenge: 'Draw the growth curve for O(n²)',
        targetClass: 'O(n²)',
        targetFn: function (n) { return n * n; },
        maxN: 50,
        maxOps: 2600,
        predictionXs: [10, 20, 30, 40, 50],
        explanation: 'O(n²) grows quadratically — it curves upward steeply. At n=10 there are 100 ops; at n=50, 2500 ops. Doubling n quadruples the work.'
      },
      {
        challenge: 'Draw the growth curve for O(log n)',
        targetClass: 'O(log n)',
        targetFn: function (n) { return n <= 0 ? 0 : Math.log2(n) * 20; },
        maxN: 100,
        maxOps: 160,
        predictionXs: [10, 25, 50, 75, 100],
        explanation: 'O(log n) grows very slowly — the curve flattens out quickly. Going from n=10 to n=100 barely adds operations. This is the power of halving the problem.'
      }
    ]
  },

  /* ─────────────────────────────────────────────────────────
     Level 3 : NESTED DEPTHS  (Green Belt)
     Nested loops, sequential loops, and trick questions
     ───────────────────────────────────────────────────────── */
  {
    id: 3,
    name: 'Nested Depths',
    beltIndex: 2,
    type: 'nested_depths',
    subtitle: 'Green Belt — Look Deeper',
    description: 'These snippets have nested loops, sequential loops,\nand traps. Analyse the structure carefully!\nYou have 15 seconds per round.',
    rounds: [
      {
        code:
`function printPairs(arr) {
  for (let i = 0; i < arr.length; i++) {
    for (let j = 0; j < arr.length; j++) {
      console.log(arr[i], arr[j]);
    }
  }
}`,
        answer: 'O(n²)',
        explanation: 'Two nested loops, each going 0 to n. The inner loop runs n times per outer iteration. Total: n × n = O(n²).',
        ops: function (n) { return n * n; },
        timeLimit: 15
      },
      {
        code:
`function twoScans(arr) {
  for (let i = 0; i < arr.length; i++) {
    console.log(arr[i]);
  }
  for (let j = 0; j < arr.length; j++) {
    console.log(arr[j] * 2);
  }
}`,
        answer: 'O(n)',
        explanation: 'Two sequential (not nested!) loops, each running n times. Total: n + n = 2n. Drop the constant ➜ O(n). Sequential loops add; nested loops multiply.',
        ops: function (n) { return 2 * n; },
        timeLimit: 15
      },
      {
        code:
`function process(arr) {
  for (let i = 0; i < arr.length; i++) {
    for (let j = 0; j < 5; j++) {
      console.log(arr[i] + j);
    }
  }
}`,
        answer: 'O(n)',
        explanation: 'Trick! The inner loop always runs exactly 5 times — it does NOT depend on n. Total: n × 5 = 5n. Drop the constant ➜ O(n). Always check what the inner bound depends on!',
        ops: function (n) { return 5 * n; },
        timeLimit: 15
      },
      {
        code:
`function triangle(n) {
  for (let i = 0; i < n; i++) {
    for (let j = 0; j <= i; j++) {
      console.log(i, j);
    }
  }
}`,
        answer: 'O(n²)',
        explanation: 'The inner loop runs 1, then 2, then 3, … up to n. Total: 1+2+…+n = n(n+1)/2 ≈ n²/2. Drop the constant ➜ O(n²). A "triangle" is still quadratic growth.',
        ops: function (n) { return n * (n + 1) / 2; },
        timeLimit: 15
      }
    ]
  },

  /* ─────────────────────────────────────────────────────────
     Level 4 : LOG RHYTHMS  (Blue Belt)
     Logarithmic and linearithmic complexity with tree viz
     ───────────────────────────────────────────────────────── */
  {
    id: 4,
    name: 'Log Rhythms',
    beltIndex: 3,
    type: 'log_rhythms',
    subtitle: 'Blue Belt — The Power of Halving',
    description: 'Logarithmic complexity explained.\nWatch how dividing the problem in half gives O(log n).\nThink about recursion depth and work per level.',
    rounds: [
      {
        code:
`function countHalves(n) {
  let count = 0;
  while (n > 1) {
    n = Math.floor(n / 2);
    count++;
  }
  return count;
}`,
        answer: 'O(log n)',
        explanation: 'Each iteration divides n by 2. Starting from n we reach 1 after log₂(n) divisions. This halving pattern is the signature of O(log n).',
        ops: function (n) { return Math.max(1, Math.ceil(Math.log2(n + 1))); },
        treeDepth: function (n) { return Math.ceil(Math.log2(n + 1)); },
        showWorkPerLevel: false,
        timeLimit: 15
      },
      {
        code:
`// Merge-sort style: divide then process
function divideProcess(arr, lo, hi) {
  if (lo >= hi) return;
  let mid = Math.floor((lo + hi) / 2);
  for (let i = lo; i <= hi; i++) {
    process(arr[i]);           // O(n) work
  }
  divideProcess(arr, lo, mid);
  divideProcess(arr, mid + 1, hi);
}`,
        answer: 'O(n log n)',
        explanation: 'The recursion splits in half each time (log n levels). At every level the for-loop touches every element (n work per level). n work × log n levels = O(n log n).',
        ops: function (n) { return n > 0 ? n * Math.max(1, Math.ceil(Math.log2(n + 1))) : 0; },
        treeDepth: function (n) { return Math.ceil(Math.log2(n + 1)); },
        showWorkPerLevel: true,
        timeLimit: 15
      },
      {
        code:
`function fastPower(base, exp) {
  if (exp === 0) return 1;
  if (exp % 2 === 0) {
    let half = fastPower(base, exp / 2);
    return half * half;
  }
  return base * fastPower(base, exp - 1);
}`,
        answer: 'O(log n)',
        explanation: 'Each recursive call roughly halves exp. Even the odd case reduces exp by 1, making the next call even and halvable. Recursion depth ≈ O(log n). This is "exponentiation by squaring".',
        ops: function (n) { return Math.max(1, Math.ceil(1.5 * Math.log2(n + 1))); },
        treeDepth: function (n) { return Math.ceil(Math.log2(n + 1)); },
        showWorkPerLevel: false,
        timeLimit: 15
      }
    ]
  },

  /* ─────────────────────────────────────────────────────────
     Level 5 : THE ARENA  (Black Belt)
     Two algorithms race — predict the winner
     ───────────────────────────────────────────────────────── */
  {
    id: 5,
    name: 'The Arena',
    beltIndex: 4,
    type: 'arena',
    subtitle: 'Black Belt — Algorithm Showdown',
    description: 'Two algorithms enter the arena.\nRead both and predict which is faster for large n.\nThen watch them race!',
    rounds: [
      {
        algorithmA: {
          name: 'Linear Search',
          code:
`function linearSearch(arr, t) {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === t) return i;
  }
  return -1;
}`,
          complexity: 'O(n)',
          ops: function (n) { return n; }
        },
        algorithmB: {
          name: 'Binary Search',
          code:
`function binarySearch(arr, t) {
  let lo = 0, hi = arr.length - 1;
  while (lo <= hi) {
    let m = Math.floor((lo+hi)/2);
    if (arr[m] === t) return m;
    if (arr[m] < t) lo = m + 1;
    else hi = m - 1;
  }
  return -1;
}`,
          complexity: 'O(log n)',
          ops: function (n) { return Math.max(1, Math.ceil(Math.log2(n + 1))); }
        },
        fasterAtLargeN: 'B',
        explanation: 'Linear search checks up to n elements; binary search halves the space each step. For n = 1000: linear ≈ 1000 ops, binary ≈ 10 ops. Binary search wins — but needs a sorted array.',
        raceMaxN: 500
      },
      {
        algorithmA: {
          name: 'Bubble Sort',
          code:
`function bubbleSort(arr) {
  for (let i = 0; i < arr.length; i++) {
    for (let j = 0; j < arr.length-1; j++){
      if (arr[j] > arr[j+1])
        [arr[j],arr[j+1]] = [arr[j+1],arr[j]];
    }
  }
}`,
          complexity: 'O(n²)',
          ops: function (n) { return n * n; }
        },
        algorithmB: {
          name: 'Merge Sort',
          code:
`function mergeSort(arr) {
  if (arr.length <= 1) return arr;
  let mid = Math.floor(arr.length/2);
  let L = mergeSort(arr.slice(0, mid));
  let R = mergeSort(arr.slice(mid));
  return merge(L, R); // O(n) merge
}`,
          complexity: 'O(n log n)',
          ops: function (n) { return n > 0 ? n * Math.max(1, Math.ceil(Math.log2(n + 1))) : 0; }
        },
        fasterAtLargeN: 'B',
        explanation: 'Bubble sort\'s nested loops give O(n²). Merge sort divides in half (log n levels) and merges linearly for O(n log n). At n = 1000: bubble ≈ 1,000,000 vs merge ≈ 10,000. That\'s 100× faster!',
        raceMaxN: 300
      },
      {
        algorithmA: {
          name: 'Brute-Force Pair Sum',
          code:
`function pairSumBrute(arr, target) {
  for (let i = 0; i < arr.length; i++) {
    for (let j = i+1; j < arr.length; j++){
      if (arr[i]+arr[j] === target)
        return [i, j];
    }
  }
  return null;
}`,
          complexity: 'O(n²)',
          ops: function (n) { return n * (n - 1) / 2; }
        },
        algorithmB: {
          name: 'Hash-Map Pair Sum',
          code:
`function pairSumHash(arr, target) {
  let seen = {};
  for (let i = 0; i < arr.length; i++) {
    let need = target - arr[i];
    if (seen[need] !== undefined)
      return [seen[need], i];
    seen[arr[i]] = i;
  }
  return null;
}`,
          complexity: 'O(n)',
          ops: function (n) { return n; }
        },
        fasterAtLargeN: 'B',
        explanation: 'Brute-force checks every pair with nested loops → O(n²). The hash-map version makes one pass using O(1) lookups → O(n). Trading space for time: a classic algorithm design pattern!',
        raceMaxN: 400
      }
    ]
  }
];
