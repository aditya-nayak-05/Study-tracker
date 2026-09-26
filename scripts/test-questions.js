import { parseQuestions, detectDuplicates, validateImportedQuestionSet, normalizeQuestionText } from '../src/utils/questionParser.js';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    passed++;
    console.log(`  ✓ ${message}`);
  } else {
    failed++;
    console.error(`  ✗ FAIL: ${message}`);
  }
}

console.log('\n--- 1. Testing Question Parser ---');

// Test 1: Numbered with dots
const test1 = `
1. What is JavaScript?
2. What is the difference between let and var?
3. What is React?
4. What are React hooks?
5. What is useEffect?
`;
const res1 = parseQuestions(test1);
assert(res1.questions.length === 5, 'Parses 5 numbered questions with dots');
assert(res1.questions[0].text === 'What is JavaScript?', 'Cleans prefix "1. " from first question');
assert(res1.questions[1].text === 'What is the difference between let and var?', 'Cleans prefix from question 2');

// Test 2: Numbered with parentheses
const test2 = `
1) Question one
2) Question two
3) Question three
`;
const res2 = parseQuestions(test2);
assert(res2.questions.length === 3, 'Parses 3 numbered questions with parentheses');
assert(res2.questions[0].text === 'Question one', 'Cleans prefix "1) "');

// Test 3: Q1. Q2. Q3.
const test3 = `
Q1. Question one
Q2. Question two
Q3. Question three
`;
const res3 = parseQuestions(test3);
assert(res3.questions.length === 3, 'Parses Q1. Q2. format');
assert(res3.questions[0].text === 'Question one', 'Cleans prefix "Q1. "');

// Test 4: Q1: Q2: Q3:
const test4 = `
Q1: Question one
Q2: Question two
Q3: Question three
`;
const res4 = parseQuestions(test4);
assert(res4.questions.length === 3, 'Parses Q1: Q2: format');
assert(res4.questions[0].text === 'Question one', 'Cleans prefix "Q1: "');

// Test 5: Double line breaks without numbering
const test5 = `
What is HTML?

What is CSS?

What is JavaScript?
`;
const res5 = parseQuestions(test5);
assert(res5.questions.length === 3, 'Parses unnumbered blank-line separated questions');
assert(res5.questions[0].text === 'What is HTML?', 'Correct text for unnumbered question 1');
assert(res5.questions[2].text === 'What is JavaScript?', 'Correct text for unnumbered question 3');

// Test 6: Questions with inline answers
const test6 = `
1. What is React?
Ans: A JavaScript library for building user interfaces.
2. What is JSX?
Answer: Syntax extension for JavaScript.
`;
const res6 = parseQuestions(test6);
assert(res6.questions.length === 2, 'Parses questions with inline answers');
assert(res6.questions[0].answer.includes('A JavaScript library'), 'Captures inline answer');

console.log('\n--- 2. Testing Duplicate Detection ---');
const existing = [
  { id: 'q1', text: 'What is JavaScript?' },
  { id: 'q2', text: 'What is React?' },
];

const newBatch = [
  { id: 'n1', text: 'What is javascript?' }, // duplicate with existing (case difference)
  { id: 'n2', text: 'what   is   react ?' }, // duplicate with existing (extra spaces + punctuation)
  { id: 'n3', text: 'What is Vue?' },
  { id: 'n4', text: 'What is Vue?' }, // duplicate within batch
];

const dupes = detectDuplicates(newBatch, existing);
assert(dupes.hasDuplicates === true, 'Detects duplicates correctly');
assert(dupes.duplicateCount === 3, `Expected 3 duplicates, found ${dupes.duplicateCount}`);
assert(dupes.duplicateIndices.has(0), 'Flags case-insensitive duplicate with existing');
assert(dupes.duplicateIndices.has(1), 'Flags space & punctuation duplicate with existing');
assert(dupes.duplicateIndices.has(3), 'Flags duplicate within the new batch');

console.log('\n--- 3. Testing Validation & Import Sanitization ---');
const validSet = {
  name: 'Test Set',
  description: 'Test description',
  questions: [
    { text: 'Sample Question 1', answer: 'Sample Answer' }
  ]
};
const val1 = validateImportedQuestionSet(validSet);
assert(val1.valid === true, 'Validates well-formed question set JSON');
assert(val1.questionSet.name === 'Test Set', 'Preserves question set name');
assert(val1.questionSet.questions.length === 1, 'Preserves questions array');
assert(val1.questionSet.questions[0].status === 'in_progress', 'Assigns in_progress status when answer exists');

const invalidSet = { randomKey: 'no name here' };
const val2 = validateImportedQuestionSet(invalidSet);
assert(val2.valid === false, 'Rejects question set without name');

const bulkBackup = {
  type: 'studyflow_questions_backup',
  questionSets: [validSet]
};
const val3 = validateImportedQuestionSet(bulkBackup);
assert(val3.valid === true && val3.isBulk === true, 'Validates bulk backup format');
assert(val3.questionSets.length === 1, 'Extracts bulk question sets');

console.log(`\n=============================`);
console.log(`Total: ${passed + failed} | Passed: ${passed} | Failed: ${failed}`);
if (failed > 0) process.exit(1);
