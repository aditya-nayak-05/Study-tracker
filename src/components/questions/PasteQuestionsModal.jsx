import React, { useState, useRef, useEffect } from 'react';
import {
  X, Sparkles, AlertTriangle, CheckCircle, ArrowRight, ArrowLeft,
  Trash2, Edit2, Check, Copy, HelpCircle
} from 'lucide-react';
import { modalEnter, modalExit, softShake } from '../../utils/motion';
import { parseQuestions, detectDuplicates } from '../../utils/questionParser';

const SAMPLE_TEXT = `1. What is the difference between let, const, and var?
2. What are closures in JavaScript and how are they used?
3. How does the JavaScript Event Loop work?
4. What is the difference between useMemo and useCallback?
5. How does React's virtual DOM reconciliation work?
6. What is prototypal inheritance?
7. Explain the concept of debouncing and throttling.
8. What is the purpose of useEffect cleanup functions?`;

export default function PasteQuestionsModal({
  isOpen,
  targetSet,
  onImport,
  onClose,
}) {
  const backdropRef = useRef(null);
  const boxRef = useRef(null);

  const [step, setStep] = useState('input'); // 'input' | 'preview'
  const [rawText, setRawText] = useState('');
  const [parsedQuestions, setParsedQuestions] = useState([]);
  const [warnings, setWarnings] = useState([]);
  const [duplicateInfo, setDuplicateInfo] = useState(null);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editText, setEditText] = useState('');

  useEffect(() => {
    if (isOpen) {
      setStep('input');
      setRawText('');
      setParsedQuestions([]);
      setWarnings([]);
      setDuplicateInfo(null);
      setEditingIndex(null);
      setEditText('');

      if (backdropRef.current && boxRef.current) {
        modalEnter(backdropRef.current, boxRef.current);
      }
    }
  }, [isOpen]);

  const handleClose = () => {
    if (backdropRef.current && boxRef.current) {
      modalExit(backdropRef.current, boxRef.current, onClose);
    } else {
      onClose();
    }
  };

  const handleConvert = () => {
    if (!rawText.trim()) {
      if (boxRef.current) softShake(boxRef.current);
      return;
    }

    const { questions, warnings: parseWarnings } = parseQuestions(rawText);
    if (questions.length === 0) {
      setWarnings(['No valid questions could be detected. Please check the pasted format.']);
      return;
    }

    // Run duplicate detection against existing questions in target set
    const existing = targetSet?.questions || [];
    const dupes = detectDuplicates(questions, existing);

    setParsedQuestions(questions);
    setWarnings(parseWarnings);
    setDuplicateInfo(dupes);
    setStep('preview');
  };

  const handleRemoveQuestion = (index) => {
    const updated = parsedQuestions.filter((_, i) => i !== index);
    const existing = targetSet?.questions || [];
    const dupes = detectDuplicates(updated, existing);
    setParsedQuestions(updated);
    setDuplicateInfo(dupes);
    if (editingIndex === index) {
      setEditingIndex(null);
    }
  };

  const startEdit = (index) => {
    setEditingIndex(index);
    setEditText(parsedQuestions[index].text);
  };

  const saveEdit = (index) => {
    if (!editText.trim()) return;
    const updated = [...parsedQuestions];
    updated[index] = { ...updated[index], text: editText.trim() };
    const existing = targetSet?.questions || [];
    const dupes = detectDuplicates(updated, existing);
    setParsedQuestions(updated);
    setDuplicateInfo(dupes);
    setEditingIndex(null);
  };

  const handleFinalImport = (skipDuplicates = false) => {
    let finalQuestions = parsedQuestions;
    if (skipDuplicates && duplicateInfo?.duplicateIndices) {
      finalQuestions = parsedQuestions.filter((_, idx) => !duplicateInfo.duplicateIndices.has(idx));
    }

    if (finalQuestions.length === 0) return;

    onImport(finalQuestions);
    handleClose();
  };

  const loadSample = () => {
    setRawText(SAMPLE_TEXT);
  };

  if (!isOpen) return null;

  const totalDetected = parsedQuestions.length;
  const duplicateCount = duplicateInfo?.duplicateCount || 0;
  const uniqueCount = totalDetected - duplicateCount;

  return (
    <div
      ref={backdropRef}
      className="fixed inset-0 z-[115] flex items-center justify-center p-3 sm:p-5 backdrop-blur-sm"
      style={{ background: 'rgba(13, 15, 23, 0.8)' }}
      onClick={handleClose}
    >
      <div
        ref={boxRef}
        onClick={(e) => e.stopPropagation()}
        className="rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col leather-card shadow-2xl relative overflow-hidden"
        style={{
          background: 'var(--neu-card-bg)',
          border: '1px solid var(--neu-border)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--neu-border-subtle)] shrink-0">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center brass-btn"
              style={{ color: 'var(--accent-btn-text)' }}
            >
              <Sparkles className="w-4 h-4 text-accent-primary" />
            </div>
            <div>
              <h2 className="text-base font-bold text-main">
                {step === 'input' ? 'Paste & Convert Questions' : 'Review & Import Questions'}
              </h2>
              <p className="text-xs text-muted truncate max-w-xs sm:max-w-md">
                Target Set:{' '}
                <span className="font-semibold text-main">
                  {targetSet ? targetSet.name : 'Selected Set'}
                </span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-1 rounded-lg text-muted hover:text-main hover:bg-[var(--neu-hover-bg)] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {step === 'input' ? (
            <>
              {/* Input step */}
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-muted uppercase tracking-wider">Paste your questions below:</span>
                <button
                  type="button"
                  onClick={loadSample}
                  className="text-accent-primary hover:underline font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Copy className="w-3 h-3 text-accent-primary" /> Load Example
                </button>
              </div>

              <textarea
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder={`Paste your list of questions here. Supports:
1. What is JavaScript?
2. What is React?
Q1: How does useEffect work?
1) Difference between let and var?
Or double newlines separating unnumbered questions.`}
                rows={10}
                className="w-full p-4 text-xs font-mono rounded-xl focus:outline-none inset-field leading-relaxed resize-none text-main"
                style={{
                  background: 'var(--neu-card-bg)',
                  border: '1px solid var(--neu-border)',
                }}
                autoFocus
              />

              {/* Format guidance hints */}
              <div
                className="p-3.5 rounded-xl border border-[var(--neu-border-subtle)] text-xs text-muted space-y-1.5"
                style={{ background: 'var(--neu-inset-bg)' }}
              >
                <div className="flex items-center gap-1.5 font-bold text-main">
                  <HelpCircle className="w-3.5 h-3.5 text-accent-primary shrink-0" />
                  <span>Supported formats:</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
                  <div>• Numbered: <code className="text-main">1. </code>, <code className="text-main">1) </code></div>
                  <div>• Labeled: <code className="text-main">Q1. </code>, <code className="text-main">Q1: </code></div>
                  <div>• Bullets or blank lines</div>
                </div>
                <p className="text-[10px] text-muted italic">
                  Numbering is automatically cleaned so you get clean question titles.
                </p>
              </div>

              {warnings.length > 0 && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold space-y-1">
                  {warnings.map((w, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      <span>{w}</span>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <>
              {/* Preview Step */}
              <div className="flex items-center justify-between flex-wrap gap-2 p-3 rounded-xl border border-[var(--neu-border-subtle)] bg-[var(--neu-inset-bg)]">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold text-main">
                    ✓ {totalDetected} question{totalDetected !== 1 ? 's' : ''} detected
                  </span>
                </div>
                {duplicateCount > 0 ? (
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400">
                    ⚠ {duplicateCount} duplicate{duplicateCount !== 1 ? 's' : ''} found
                  </span>
                ) : (
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                    All unique questions
                  </span>
                )}
              </div>

              {warnings.length > 0 && (
                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-medium space-y-1">
                  {warnings.map((w, idx) => (
                    <div key={idx} className="flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      <span>{w}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Questions Preview List */}
              <div className="space-y-2 max-h-[46vh] overflow-y-auto pr-1">
                {parsedQuestions.map((q, idx) => {
                  const isDup = duplicateInfo?.duplicateIndices?.has(idx);
                  const isEditing = editingIndex === idx;

                  return (
                    <div
                      key={q.id || idx}
                      className={`p-3 rounded-xl border transition-all flex items-start gap-3 ${
                        isDup
                          ? 'border-amber-500/40 bg-amber-500/5'
                          : 'border-[var(--neu-border-subtle)] bg-[var(--neu-card-bg)]'
                      }`}
                    >
                      <span className="text-[10px] font-mono font-bold text-muted px-2 py-0.5 rounded inset-field shrink-0">
                        {String(idx + 1).padStart(2, '0')}
                      </span>

                      <div className="flex-1 min-w-0">
                        {isEditing ? (
                          <div className="space-y-2">
                            <textarea
                              value={editText}
                              onChange={(e) => setEditText(e.target.value)}
                              className="w-full p-2 text-xs rounded-lg inset-field focus:outline-none text-main resize-none"
                              rows={2}
                              autoFocus
                            />
                            <div className="flex gap-2 justify-end">
                              <button
                                type="button"
                                onClick={() => setEditingIndex(null)}
                                className="px-2 py-1 text-[10px] rounded text-muted hover:text-main cursor-pointer"
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                onClick={() => saveEdit(idx)}
                                className="brass-btn px-2.5 py-1 text-[10px] rounded font-bold text-white flex items-center gap-1 cursor-pointer"
                              >
                                <Check className="w-3 h-3" /> Save
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <p className="text-xs font-semibold text-main leading-relaxed">
                              {q.text}
                            </p>
                            {q.answer && (
                              <p className="text-[11px] text-muted mt-1 italic line-clamp-1">
                                Ans: {q.answer}
                              </p>
                            )}
                            {isDup && (
                              <span className="inline-block mt-1 text-[9px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">
                                Duplicate Detected
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {!isEditing && (
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => startEdit(idx)}
                            title="Edit Question"
                            className="p-1 rounded text-muted hover:text-main hover:bg-[var(--neu-hover-bg)] cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveQuestion(idx)}
                            title="Remove Question"
                            className="p-1 rounded text-muted hover:text-red-400 hover:bg-[var(--neu-hover-bg)] cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between px-5 py-3.5 border-t border-[var(--neu-border-subtle)] shrink-0 bg-[var(--neu-card-bg)]">
          {step === 'input' ? (
            <>
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-muted hover:text-main hover:bg-[var(--neu-hover-bg)] transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConvert}
                disabled={!rawText.trim()}
                className="brass-btn px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
              >
                <span>Convert Questions</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setStep('input')}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-muted hover:text-main hover:bg-[var(--neu-hover-bg)] transition-all flex items-center gap-1 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Edit Input</span>
              </button>

              <div className="flex items-center gap-2">
                {duplicateCount > 0 && uniqueCount > 0 && (
                  <button
                    type="button"
                    onClick={() => handleFinalImport(true)}
                    className="px-3 py-2 rounded-xl text-xs font-semibold border border-amber-500/40 text-amber-400 hover:bg-amber-500/10 transition-all cursor-pointer"
                  >
                    Skip Duplicates ({uniqueCount})
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleFinalImport(false)}
                  disabled={totalDetected === 0}
                  className="brass-btn px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
                >
                  <Check className="w-3.5 h-3.5 text-accent-primary" />
                  <span>Import {totalDetected} Questions</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
