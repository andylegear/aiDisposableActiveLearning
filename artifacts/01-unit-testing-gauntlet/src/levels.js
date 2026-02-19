/* ============================================================
   LEVELS DATA
   Each level has three phases: red, green, refactor
   matching the TDD cycle.
   ============================================================ */

const LEVELS = [

  // ──────────────────────────────────────────────────────────
  // LEVEL 1 — Sum of Positives (Basic Arithmetic)
  // ──────────────────────────────────────────────────────────
  {
    id: 1,
    title: "Sum of Positives",
    topic: "Basic Arithmetic",
    spec: "sumPositives(numbers) should return the sum of all POSITIVE numbers in an array. Negative numbers and zero should be ignored.",

    red: {
      instructions: "The function below has a bug. Read the spec, then write a test that EXPOSES the bug — your test should FAIL against this code.",
      functionCode: [
        "function sumPositives(numbers) {",
        "  let total = 0;",
        "  for (let i = 0; i < numbers.length; i++) {",
        "    total += numbers[i];",
        "  }",
        "  return total;",
        "}"
      ].join("\n"),
      starterTest: [
        "// Write a test that catches the bug!",
        "// Hint: think about what the spec says vs what the code does.",
        "",
        "test('should only sum positive numbers', function() {",
        "  // Your assertion here, e.g.:",
        "  // expect(sumPositives([...])).toBe(...);",
        "});"
      ].join("\n"),
      hint: "What happens when the array contains negative numbers? The spec says they should be ignored…",
      // Used to verify the student's test is meaningful (passes against correct code)
      correctFunction: [
        "function sumPositives(numbers) {",
        "  let total = 0;",
        "  for (let i = 0; i < numbers.length; i++) {",
        "    if (numbers[i] > 0) total += numbers[i];",
        "  }",
        "  return total;",
        "}"
      ].join("\n")
    },

    green: {
      instructions: "The tests below are FAILING. Fix the function to make ALL tests PASS. Make only the minimum change needed!",
      functionCode: [
        "function sumPositives(numbers) {",
        "  let total = 0;",
        "  for (let i = 0; i < numbers.length; i++) {",
        "    total += numbers[i];",
        "  }",
        "  return total;",
        "}"
      ].join("\n"),
      testCode: [
        "test('should sum only positive numbers', function() {",
        "  expect(sumPositives([1, -2, 3, -4, 5])).toBe(9);",
        "});",
        "",
        "test('should return 0 for empty array', function() {",
        "  expect(sumPositives([])).toBe(0);",
        "});",
        "",
        "test('should ignore zero', function() {",
        "  expect(sumPositives([0, 1, 2])).toBe(3);",
        "});"
      ].join("\n")
    },

    refactor: {
      instructions: "The function works and all tests pass — but the code is messy. REFACTOR it to be cleaner without breaking any tests!",
      functionCode: [
        "function sumPositives(numbers) {",
        "  var total = 0;",
        "  var i;",
        "  for (i = 0; i < numbers.length; i++) {",
        "    if (numbers[i] > 0) {",
        "      total = total + numbers[i];",
        "    } else {",
        "      // do nothing for negatives",
        "    }",
        "  }",
        "  return total;",
        "}"
      ].join("\n"),
      testCode: [
        "test('should sum only positive numbers', function() {",
        "  expect(sumPositives([1, -2, 3, -4, 5])).toBe(9);",
        "});",
        "",
        "test('should return 0 for empty array', function() {",
        "  expect(sumPositives([])).toBe(0);",
        "});",
        "",
        "test('should return 0 for all negatives', function() {",
        "  expect(sumPositives([-1, -2, -3])).toBe(0);",
        "});",
        "",
        "test('should handle single positive', function() {",
        "  expect(sumPositives([42])).toBe(42);",
        "});"
      ].join("\n")
    }
  },

  // ──────────────────────────────────────────────────────────
  // LEVEL 2 — Capitalize Words (String Manipulation)
  // ──────────────────────────────────────────────────────────
  {
    id: 2,
    title: "Capitalize Words",
    topic: "String Manipulation",
    spec: "capitalizeWords(str) should return the string with the first letter of EVERY word capitalized. Other letters should remain unchanged.",

    red: {
      instructions: "This function has a bug — it doesn't correctly capitalize ALL words. Write a test that proves it.",
      functionCode: [
        "function capitalizeWords(str) {",
        "  if (str.length === 0) return str;",
        "  return str.charAt(0).toUpperCase() + str.slice(1);",
        "}"
      ].join("\n"),
      starterTest: [
        "// The function should capitalize the first letter of EVERY word.",
        "// Can you find an input where it fails?",
        "",
        "test('should capitalize every word', function() {",
        "  // Your assertion here",
        "});"
      ].join("\n"),
      hint: "What happens with a string like 'hello world' — does every word get capitalized, or just the first?",
      correctFunction: [
        "function capitalizeWords(str) {",
        "  return str.split(' ').map(function(word) {",
        "    if (word.length === 0) return word;",
        "    return word.charAt(0).toUpperCase() + word.slice(1);",
        "  }).join(' ');",
        "}"
      ].join("\n")
    },

    green: {
      instructions: "The tests below are failing. Fix the function to capitalize the first letter of EVERY word.",
      functionCode: [
        "function capitalizeWords(str) {",
        "  if (str.length === 0) return str;",
        "  return str.charAt(0).toUpperCase() + str.slice(1);",
        "}"
      ].join("\n"),
      testCode: [
        "test('should capitalize every word', function() {",
        "  expect(capitalizeWords('hello world')).toBe('Hello World');",
        "});",
        "",
        "test('should handle single word', function() {",
        "  expect(capitalizeWords('javascript')).toBe('Javascript');",
        "});",
        "",
        "test('should handle empty string', function() {",
        "  expect(capitalizeWords('')).toBe('');",
        "});"
      ].join("\n")
    },

    refactor: {
      instructions: "The code works but it's verbose. Refactor it to be more concise and idiomatic — don't break the tests!",
      functionCode: [
        "function capitalizeWords(str) {",
        "  var words = str.split(' ');",
        "  var result = [];",
        "  for (var i = 0; i < words.length; i++) {",
        "    var word = words[i];",
        "    if (word.length > 0) {",
        "      var firstLetter = word.charAt(0);",
        "      var rest = word.slice(1);",
        "      var capitalized = firstLetter.toUpperCase() + rest;",
        "      result.push(capitalized);",
        "    } else {",
        "      result.push(word);",
        "    }",
        "  }",
        "  return result.join(' ');",
        "}"
      ].join("\n"),
      testCode: [
        "test('should capitalize every word', function() {",
        "  expect(capitalizeWords('hello world')).toBe('Hello World');",
        "});",
        "",
        "test('should handle single word', function() {",
        "  expect(capitalizeWords('javascript')).toBe('Javascript');",
        "});",
        "",
        "test('should handle empty string', function() {",
        "  expect(capitalizeWords('')).toBe('');",
        "});",
        "",
        "test('should handle multiple spaces', function() {",
        "  expect(capitalizeWords('the quick brown fox')).toBe('The Quick Brown Fox');",
        "});"
      ].join("\n")
    }
  },

  // ──────────────────────────────────────────────────────────
  // LEVEL 3 — Remove Duplicates (Array Operations)
  // ──────────────────────────────────────────────────────────
  {
    id: 3,
    title: "Remove Duplicates",
    topic: "Array Operations",
    spec: "removeDuplicates(arr) should return a new array with duplicate values removed, keeping only the FIRST occurrence of each value. The order of elements should be preserved.",

    red: {
      instructions: "This function is supposed to remove duplicates but has a subtle bug. Write a test that exposes it.",
      functionCode: [
        "function removeDuplicates(arr) {",
        "  return arr.filter(function(item) {",
        "    return arr.indexOf(item) === arr.lastIndexOf(item);",
        "  });",
        "}"
      ].join("\n"),
      starterTest: [
        "// This function is supposed to KEEP one copy of each value.",
        "// But does it? Try an array with duplicates.",
        "",
        "test('should keep one copy of duplicated values', function() {",
        "  // Your assertion here",
        "});"
      ].join("\n"),
      hint: "The current code checks if indexOf === lastIndexOf. What does that actually filter? It keeps only values that appear ONCE — removing ALL copies of duplicated values entirely!",
      correctFunction: [
        "function removeDuplicates(arr) {",
        "  return arr.filter(function(item, index) {",
        "    return arr.indexOf(item) === index;",
        "  });",
        "}"
      ].join("\n")
    },

    green: {
      instructions: "The tests are failing because the function removes ALL copies of duplicated values instead of keeping one. Fix it!",
      functionCode: [
        "function removeDuplicates(arr) {",
        "  return arr.filter(function(item) {",
        "    return arr.indexOf(item) === arr.lastIndexOf(item);",
        "  });",
        "}"
      ].join("\n"),
      testCode: [
        "test('should remove duplicate numbers', function() {",
        "  expect(removeDuplicates([1, 2, 2, 3, 3, 3])).toEqual([1, 2, 3]);",
        "});",
        "",
        "test('should preserve order', function() {",
        "  expect(removeDuplicates([3, 1, 2, 1, 3])).toEqual([3, 1, 2]);",
        "});",
        "",
        "test('should handle empty array', function() {",
        "  expect(removeDuplicates([])).toEqual([]);",
        "});"
      ].join("\n")
    },

    refactor: {
      instructions: "This works but is more verbose than it needs to be. Can you refactor it using modern JavaScript features?",
      functionCode: [
        "function removeDuplicates(arr) {",
        "  var result = [];",
        "  for (var i = 0; i < arr.length; i++) {",
        "    var found = false;",
        "    for (var j = 0; j < result.length; j++) {",
        "      if (result[j] === arr[i]) {",
        "        found = true;",
        "        break;",
        "      }",
        "    }",
        "    if (!found) {",
        "      result.push(arr[i]);",
        "    }",
        "  }",
        "  return result;",
        "}"
      ].join("\n"),
      testCode: [
        "test('should remove duplicate numbers', function() {",
        "  expect(removeDuplicates([1, 2, 2, 3, 3, 3])).toEqual([1, 2, 3]);",
        "});",
        "",
        "test('should preserve order', function() {",
        "  expect(removeDuplicates([3, 1, 2, 1, 3])).toEqual([3, 1, 2]);",
        "});",
        "",
        "test('should handle empty array', function() {",
        "  expect(removeDuplicates([])).toEqual([]);",
        "});",
        "",
        "test('should handle strings', function() {",
        "  expect(removeDuplicates(['a', 'b', 'a', 'c'])).toEqual(['a', 'b', 'c']);",
        "});"
      ].join("\n")
    }
  },

  // ──────────────────────────────────────────────────────────
  // LEVEL 4 — FizzBuzz (Conditional Logic / Edge Cases)
  // ──────────────────────────────────────────────────────────
  {
    id: 4,
    title: "FizzBuzz",
    topic: "Conditional Logic",
    spec: "fizzBuzz(n) should return 'Fizz' if n is divisible by 3, 'Buzz' if divisible by 5, 'FizzBuzz' if divisible by BOTH 3 and 5, or the number as a string otherwise.",

    red: {
      instructions: "Classic FizzBuzz — but this implementation has a common bug. Write a test that catches it.",
      functionCode: [
        "function fizzBuzz(n) {",
        "  if (n % 3 === 0) {",
        "    return 'Fizz';",
        "  } else if (n % 5 === 0) {",
        "    return 'Buzz';",
        "  } else if (n % 3 === 0 && n % 5 === 0) {",
        "    return 'FizzBuzz';",
        "  } else {",
        "    return String(n);",
        "  }",
        "}"
      ].join("\n"),
      starterTest: [
        "// Read the spec carefully. Is there a number that",
        "// should produce a specific output but doesn't?",
        "",
        "test('should handle the tricky case', function() {",
        "  // Your assertion here",
        "});"
      ].join("\n"),
      hint: "What should fizzBuzz(15) return? 15 is divisible by both 3 AND 5. But which if-branch runs first?",
      correctFunction: [
        "function fizzBuzz(n) {",
        "  if (n % 3 === 0 && n % 5 === 0) {",
        "    return 'FizzBuzz';",
        "  } else if (n % 3 === 0) {",
        "    return 'Fizz';",
        "  } else if (n % 5 === 0) {",
        "    return 'Buzz';",
        "  } else {",
        "    return String(n);",
        "  }",
        "}"
      ].join("\n")
    },

    green: {
      instructions: "The test for numbers divisible by BOTH 3 and 5 is failing. Fix the function — think about the ORDER of conditions!",
      functionCode: [
        "function fizzBuzz(n) {",
        "  if (n % 3 === 0) {",
        "    return 'Fizz';",
        "  } else if (n % 5 === 0) {",
        "    return 'Buzz';",
        "  } else if (n % 3 === 0 && n % 5 === 0) {",
        "    return 'FizzBuzz';",
        "  } else {",
        "    return String(n);",
        "  }",
        "}"
      ].join("\n"),
      testCode: [
        "test('should return FizzBuzz for 15', function() {",
        "  expect(fizzBuzz(15)).toBe('FizzBuzz');",
        "});",
        "",
        "test('should return Fizz for 9', function() {",
        "  expect(fizzBuzz(9)).toBe('Fizz');",
        "});",
        "",
        "test('should return Buzz for 10', function() {",
        "  expect(fizzBuzz(10)).toBe('Buzz');",
        "});",
        "",
        "test('should return number as string for 7', function() {",
        "  expect(fizzBuzz(7)).toBe('7');",
        "});"
      ].join("\n")
    },

    refactor: {
      instructions: "The function works but the nested if/else is a bit clunky. Refactor it to be cleaner — don't break the tests!",
      functionCode: [
        "function fizzBuzz(n) {",
        "  if (n % 3 === 0 && n % 5 === 0) {",
        "    return 'FizzBuzz';",
        "  } else {",
        "    if (n % 3 === 0) {",
        "      return 'Fizz';",
        "    } else {",
        "      if (n % 5 === 0) {",
        "        return 'Buzz';",
        "      } else {",
        "        return String(n);",
        "      }",
        "    }",
        "  }",
        "}"
      ].join("\n"),
      testCode: [
        "test('should return FizzBuzz for 15', function() {",
        "  expect(fizzBuzz(15)).toBe('FizzBuzz');",
        "});",
        "",
        "test('should return FizzBuzz for 30', function() {",
        "  expect(fizzBuzz(30)).toBe('FizzBuzz');",
        "});",
        "",
        "test('should return Fizz for 9', function() {",
        "  expect(fizzBuzz(9)).toBe('Fizz');",
        "});",
        "",
        "test('should return Buzz for 10', function() {",
        "  expect(fizzBuzz(10)).toBe('Buzz');",
        "});",
        "",
        "test('should return number string for 7', function() {",
        "  expect(fizzBuzz(7)).toBe('7');",
        "});"
      ].join("\n")
    }
  },

  // ──────────────────────────────────────────────────────────
  // LEVEL 5 — isPalindrome (Boss Round)
  // ──────────────────────────────────────────────────────────
  {
    id: 5,
    title: "Palindrome Checker",
    topic: "Boss Round 🏆",
    spec: "isPalindrome(str) should return true if the string reads the same forwards and backwards. It should be CASE-INSENSITIVE and should IGNORE spaces and punctuation (only consider alphanumeric characters).",

    red: {
      instructions: "Boss round! This palindrome checker has TWO bugs. Write tests that expose at least one of them.",
      functionCode: [
        "function isPalindrome(str) {",
        "  var reversed = str.split('').reverse().join('');",
        "  return str === reversed;",
        "}"
      ].join("\n"),
      starterTest: [
        "// This palindrome checker has bugs related to the spec.",
        "// Think: case sensitivity? Spaces? Punctuation?",
        "",
        "test('should detect palindromes correctly', function() {",
        "  // Your assertion(s) here",
        "});"
      ].join("\n"),
      hint: "Try 'Racecar' (mixed case) or 'A man a plan a canal Panama' (with spaces). The spec says to ignore case, spaces and punctuation!",
      correctFunction: [
        "function isPalindrome(str) {",
        "  var cleaned = str.toLowerCase().replace(/[^a-z0-9]/g, '');",
        "  var reversed = cleaned.split('').reverse().join('');",
        "  return cleaned === reversed;",
        "}"
      ].join("\n")
    },

    green: {
      instructions: "Multiple tests are failing. The function needs to handle case-insensitivity AND ignore non-alphanumeric characters. Fix it!",
      functionCode: [
        "function isPalindrome(str) {",
        "  var reversed = str.split('').reverse().join('');",
        "  return str === reversed;",
        "}"
      ].join("\n"),
      testCode: [
        "test('should detect simple palindrome', function() {",
        "  expect(isPalindrome('racecar')).toBe(true);",
        "});",
        "",
        "test('should be case-insensitive', function() {",
        "  expect(isPalindrome('Racecar')).toBe(true);",
        "});",
        "",
        "test('should ignore spaces', function() {",
        "  expect(isPalindrome('nurses run')).toBe(true);",
        "});",
        "",
        "test('should ignore punctuation', function() {",
        "  expect(isPalindrome('A man, a plan, a canal: Panama')).toBe(true);",
        "});",
        "",
        "test('should reject non-palindromes', function() {",
        "  expect(isPalindrome('hello')).toBe(false);",
        "});"
      ].join("\n")
    },

    refactor: {
      instructions: "Final refactor! This code works but is extremely verbose. Clean it up into something elegant.",
      functionCode: [
        "function isPalindrome(str) {",
        "  // Step 1: convert to lowercase",
        "  var lower = str.toLowerCase();",
        "  // Step 2: remove non-alphanumeric",
        "  var cleaned = '';",
        "  for (var i = 0; i < lower.length; i++) {",
        "    var code = lower.charCodeAt(i);",
        "    if ((code >= 97 && code <= 122) || (code >= 48 && code <= 57)) {",
        "      cleaned = cleaned + lower[i];",
        "    }",
        "  }",
        "  // Step 3: reverse",
        "  var reversed = '';",
        "  for (var j = cleaned.length - 1; j >= 0; j--) {",
        "    reversed = reversed + cleaned[j];",
        "  }",
        "  // Step 4: compare",
        "  if (cleaned === reversed) {",
        "    return true;",
        "  } else {",
        "    return false;",
        "  }",
        "}"
      ].join("\n"),
      testCode: [
        "test('should detect simple palindrome', function() {",
        "  expect(isPalindrome('racecar')).toBe(true);",
        "});",
        "",
        "test('should be case-insensitive', function() {",
        "  expect(isPalindrome('Racecar')).toBe(true);",
        "});",
        "",
        "test('should ignore spaces', function() {",
        "  expect(isPalindrome('nurses run')).toBe(true);",
        "});",
        "",
        "test('should ignore punctuation', function() {",
        "  expect(isPalindrome('A man, a plan, a canal: Panama')).toBe(true);",
        "});",
        "",
        "test('should reject non-palindromes', function() {",
        "  expect(isPalindrome('hello')).toBe(false);",
        "});",
        "",
        "test('should handle empty string', function() {",
        "  expect(isPalindrome('')).toBe(true);",
        "});"
      ].join("\n")
    }
  }

];
