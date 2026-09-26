import { generateId } from './helpers.js';

/**
 * Intelligent Question Parser
 * Parses pasted text in various formats into structured Question items.
 */
export function parseQuestions(rawText) {
  if (!rawText || typeof rawText !== 'string' || !rawText.trim()) {
    return { questions: [], warnings: ['No text provided to parse.'] };
  }

  const warnings = [];
  const lines = rawText.split(/\r?\n/);
  const questions = [];

  // Patterns for numbered / labeled prefixes
  // e.g. "1. ", "1) ", "1 - ", "Q1. ", "Q1: ", "Q1 - ", "Question 1: ", "Question 1. "
  const prefixRegex = /^(?:(?:Q|Question)\s*\d+[\.:\-\)]*|\d+[\.\)\-:]|\-\s+|\*\s+|•\s+)\s*/i;
  
  // Patterns for answer lines: e.g. "Ans:", "Answer:", "A:", "Ans -"
  const answerPrefixRegex = /^(?:Ans(?:wer)?\s*[:\-]|A\s*[:\-])\s*/i;

  let currentQuestion = null;

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const line = rawLine.trim();

    if (!line) {
      // Empty line - if we have a current question, we might be separating questions
      continue;
    }

    // Check if line looks like an answer line to the current question
    if (currentQuestion && answerPrefixRegex.test(line)) {
      const answerContent = line.replace(answerPrefixRegex, '').trim();
      currentQuestion.answer = currentQuestion.answer 
        ? `${currentQuestion.answer}\n${answerContent}` 
        : answerContent;
      continue;
    }

    // Check if line starts with a numbered question prefix
    const isNumbered = prefixRegex.test(line);

    if (isNumbered) {
      if (currentQuestion) {
        questions.push(finalizeQuestion(currentQuestion));
      }
      const cleanText = line.replace(prefixRegex, '').trim();
      currentQuestion = createDraftQuestion(cleanText);
    } else {
      // Line is not explicitly numbered.
      // If we don't have a current question yet, this starts the first question.
      // If we do have a current question:
      // If previous line was empty or if the text looks like a question (ends with '?' or starts with common question words),
      // treat as a new question; otherwise treat as continuation of previous question/answer.
      const isQuestionLike = /\?$/.test(line) || /^(what|how|why|when|where|who|explain|describe|define|difference between|compare|can you|is it|does|which)\b/i.test(line);
      const prevLineEmpty = i > 0 && !lines[i - 1].trim();

      if (!currentQuestion) {
        currentQuestion = createDraftQuestion(line);
      } else if (prevLineEmpty || isQuestionLike) {
        questions.push(finalizeQuestion(currentQuestion));
        currentQuestion = createDraftQuestion(line);
      } else {
        // Continuation of current question or answer
        if (currentQuestion.answer) {
          currentQuestion.answer += `\n${line}`;
        } else {
          currentQuestion.text += ` ${line}`;
        }
      }
    }
  }

  if (currentQuestion) {
    questions.push(finalizeQuestion(currentQuestion));
  }

  // Warnings
  if (questions.length === 0) {
    warnings.push('No valid questions could be detected from the pasted text.');
  } else if (questions.length === 1 && rawText.length > 250) {
    warnings.push('Only 1 question was detected from a large text input. Please verify formatting.');
  }

  return { questions, warnings };
}

function createDraftQuestion(text) {
  return {
    id: generateId(),
    text: text || '',
    answer: '',
    notes: '',
    difficulty: 'medium',
    tags: [],
    important: false,
    completed: false,
    status: 'not_started',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    completedAt: null,
    answerUpdatedAt: null,
  };
}

function finalizeQuestion(draft) {
  return {
    ...draft,
    text: draft.text.trim(),
    answer: (draft.answer || '').trim(),
    notes: (draft.notes || '').trim(),
    status: draft.completed ? 'completed' : draft.answer ? 'in_progress' : 'not_started',
  };
}

/**
 * Normalize question text for duplicate detection
 */
export function normalizeQuestionText(text) {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/[?.,!;:\-_]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Detect duplicates within the new list and against existing questions in the set
 */
export function detectDuplicates(newQuestions = [], existingQuestions = []) {
  const existingMap = new Map();
  existingQuestions.forEach((q) => {
    const norm = normalizeQuestionText(q.text);
    if (norm) existingMap.set(norm, q);
  });

  const seenInBatch = new Set();
  const duplicateIndices = new Set();
  const duplicatesWithExisting = [];
  const duplicatesWithinBatch = [];

  newQuestions.forEach((q, idx) => {
    const norm = normalizeQuestionText(q.text);
    if (!norm) return;

    if (existingMap.has(norm)) {
      duplicateIndices.add(idx);
      duplicatesWithExisting.push({
        index: idx,
        question: q,
        matchedWith: existingMap.get(norm),
      });
    } else if (seenInBatch.has(norm)) {
      duplicateIndices.add(idx);
      duplicatesWithinBatch.push({
        index: idx,
        question: q,
      });
    } else {
      seenInBatch.add(norm);
    }
  });

  return {
    hasDuplicates: duplicateIndices.size > 0,
    duplicateCount: duplicateIndices.size,
    duplicateIndices,
    duplicatesWithExisting,
    duplicatesWithinBatch,
  };
}

/**
 * Export a Question Set as JSON file download
 */
export function exportQuestionSetJSON(questionSet) {
  if (!questionSet) return;
  const data = JSON.stringify(questionSet, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const filename = `${(questionSet.name || 'question-set').toLowerCase().replace(/\s+/g, '-')}.json`;
  triggerDownload(blob, filename);
}

/**
 * Export a Question Set as CSV file download
 */
export function exportQuestionSetCSV(questionSet) {
  if (!questionSet || !questionSet.questions) return;
  const headers = ['#', 'Question', 'Answer', 'Difficulty', 'Important', 'Completed', 'Tags', 'Notes', 'Created At'];
  const rows = [headers];

  questionSet.questions.forEach((q, idx) => {
    rows.push([
      idx + 1,
      q.text || '',
      q.answer || '',
      q.difficulty || 'medium',
      q.important ? 'Yes' : 'No',
      q.completed ? 'Yes' : 'No',
      Array.isArray(q.tags) ? q.tags.join(', ') : '',
      q.notes || '',
      q.createdAt || '',
    ]);
  });

  const csvContent = rows
    .map((r) => r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const filename = `${(questionSet.name || 'question-set').toLowerCase().replace(/\s+/g, '-')}.csv`;
  triggerDownload(blob, filename);
}

/**
 * Export all Question Sets as a single backup JSON file
 */
export function exportAllQuestionsBackup(questionSets) {
  const payload = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    type: 'studyflow_questions_backup',
    questionSets: questionSets || [],
  };
  const data = JSON.stringify(payload, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const filename = `studyflow-questions-backup-${new Date().toISOString().split('T')[0]}.json`;
  triggerDownload(blob, filename);
}

/**
 * Validate imported Question Set JSON file data
 */
export function validateImportedQuestionSet(json) {
  if (!json || typeof json !== 'object') {
    return { valid: false, error: 'File content is not valid JSON.' };
  }

  // Check if it's a bulk backup format
  if (json.type === 'studyflow_questions_backup' && Array.isArray(json.questionSets)) {
    return {
      valid: true,
      isBulk: true,
      questionSets: json.questionSets.map(sanitizeQuestionSet),
    };
  }

  // Check if single question set
  if (!json.name || typeof json.name !== 'string') {
    return { valid: false, error: 'Missing or invalid "name" attribute for Question Set.' };
  }

  const sanitized = sanitizeQuestionSet(json);
  return { valid: true, isBulk: false, questionSet: sanitized };
}

/**
 * Sanitize and ensure safe defaults for a Question Set
 */
export function sanitizeQuestionSet(set) {
  const now = new Date().toISOString();
  const questions = Array.isArray(set.questions)
    ? set.questions.map((q, idx) => ({
        id: q.id || `q_${Date.now()}_${idx}`,
        text: q.text || `Question ${idx + 1}`,
        answer: q.answer || '',
        notes: q.notes || '',
        difficulty: ['easy', 'medium', 'hard'].includes(q.difficulty) ? q.difficulty : 'medium',
        tags: Array.isArray(q.tags) ? q.tags : [],
        important: Boolean(q.important),
        completed: Boolean(q.completed),
        status: q.completed ? 'completed' : q.answer ? 'in_progress' : 'not_started',
        createdAt: q.createdAt || now,
        updatedAt: q.updatedAt || now,
        completedAt: q.completedAt || (q.completed ? now : null),
        answerUpdatedAt: q.answerUpdatedAt || null,
      }))
    : [];

  return {
    id: set.id || `qset_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    name: (set.name || 'Imported Question Set').trim(),
    description: (set.description || '').trim(),
    subject: (set.subject || 'General').trim(),
    color: set.color || '#6366f1',
    pinned: Boolean(set.pinned),
    createdAt: set.createdAt || now,
    updatedAt: set.updatedAt || now,
    lastOpenedAt: set.lastOpenedAt || now,
    lastPracticeQuestionId: set.lastPracticeQuestionId || (questions[0] ? questions[0].id : null),
    questions,
  };
}

function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
