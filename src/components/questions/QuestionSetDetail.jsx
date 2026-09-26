import React, { useState, useMemo, useCallback } from 'react';
import {
  ArrowLeft, Search, Plus, Play, Sparkles, Filter, SlidersHorizontal,
  Download, Edit2, Trash2, CheckCircle, Circle, Star, CheckSquare,
  Square, ChevronDown, ChevronUp, MoreVertical, Copy, Pin, PinOff
} from 'lucide-react';
import QuestionCard from './QuestionCard';
import QuestionModal from './QuestionModal';
import PasteQuestionsModal from './PasteQuestionsModal';
import QuestionSetModal from './QuestionSetModal';
import QuestionConfirmDialog from './QuestionConfirmDialog';
import { exportQuestionSetJSON, exportQuestionSetCSV } from '../../utils/questionParser';

export default function QuestionSetDetail({
  set,
  allSets = [],
  onBack,
  onStartPractice,
  onUpdateSet,
  onDeleteSet,
  onDuplicateSet,
  onPinSet,
  onAddQuestion,
  onUpdateQuestion,
  onDeleteQuestion,
  onBulkUpdateQuestions,
  onBulkDeleteQuestions,
  onImportQuestions,
  showToast,
}) {
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'incomplete' | 'completed' | 'answered' | 'unanswered' | 'important' | 'easy' | 'medium' | 'hard'
  const [sortBy, setSortBy] = useState('original');
  const [isCompact, setIsCompact] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [showPasteModal, setShowPasteModal] = useState(false);
  const [showEditSetModal, setShowEditSetModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, questionId: null, text: '' });
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);
  const [deleteSetConfirm, setDeleteSetConfirm] = useState(false);

  const questions = set?.questions || [];

  // Compute stats
  const total = questions.length;
  const completed = questions.filter((q) => q.completed).length;
  const remaining = total - completed;
  const answered = questions.filter((q) => q.answer && q.answer.trim()).length;
  const unanswered = total - answered;
  const completionPercent = total > 0 ? Math.round((completed / total) * 100) : 0;
  const answerPercent = total > 0 ? Math.round((answered / total) * 100) : 0;

  // Filter & Search & Sort
  const processedQuestions = useMemo(() => {
    let list = [...questions];

    // Search filter (text and answer)
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (item) =>
          item.text.toLowerCase().includes(q) ||
          (item.answer && item.answer.toLowerCase().includes(q)) ||
          (item.notes && item.notes.toLowerCase().includes(q)) ||
          (Array.isArray(item.tags) && item.tags.some((t) => t.toLowerCase().includes(q)))
      );
    }

    // Category / Status Filter
    switch (activeFilter) {
      case 'completed':
        list = list.filter((i) => i.completed);
        break;
      case 'incomplete':
        list = list.filter((i) => !i.completed);
        break;
      case 'answered':
        list = list.filter((i) => i.answer && i.answer.trim());
        break;
      case 'unanswered':
        list = list.filter((i) => !i.answer || !i.answer.trim());
        break;
      case 'important':
        list = list.filter((i) => i.important);
        break;
      case 'easy':
      case 'medium':
      case 'hard':
        list = list.filter((i) => i.difficulty === activeFilter);
        break;
      default:
        break;
    }

    // Sort
    switch (sortBy) {
      case 'newest':
        list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        break;
      case 'oldest':
        list.sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
        break;
      case 'completed-first':
        list.sort((a, b) => (b.completed ? 1 : 0) - (a.completed ? 1 : 0));
        break;
      case 'incomplete-first':
        list.sort((a, b) => (a.completed ? 1 : 0) - (b.completed ? 1 : 0));
        break;
      case 'answered-first':
        list.sort((a, b) => (b.answer ? 1 : 0) - (a.answer ? 1 : 0));
        break;
      case 'unanswered-first':
        list.sort((a, b) => (a.answer ? 1 : 0) - (b.answer ? 1 : 0));
        break;
      case 'alphabetical':
        list.sort((a, b) => a.text.localeCompare(b.text));
        break;
      case 'original':
      default:
        // maintain list index order
        break;
    }

    return list;
  }, [questions, search, activeFilter, sortBy]);

  // Bulk selection handling
  const handleToggleSelect = useCallback((id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleSelectAll = () => {
    if (selectedIds.size === processedQuestions.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(processedQuestions.map((q) => q.id)));
    }
  };

  const handleBulkComplete = (completedStatus) => {
    if (selectedIds.size === 0) return;
    onBulkUpdateQuestions(set.id, Array.from(selectedIds), { completed: completedStatus });
    showToast(`${selectedIds.size} questions marked ${completedStatus ? 'completed' : 'incomplete'} ✓`, 'success');
    setSelectedIds(new Set());
  };

  const handleConfirmBulkDelete = () => {
    if (selectedIds.size === 0) return;
    onBulkDeleteQuestions(set.id, Array.from(selectedIds));
    showToast(`Deleted ${selectedIds.size} questions`, 'info');
    setSelectedIds(new Set());
    setBulkDeleteConfirm(false);
  };

  const handleDeleteSingleQuestion = (questionId, text) => {
    setDeleteConfirm({ isOpen: true, questionId, text });
  };

  const handleConfirmDeleteSingle = () => {
    if (!deleteConfirm.questionId) return;
    onDeleteQuestion(set.id, deleteConfirm.questionId);
    showToast('Question deleted', 'info');
    setDeleteConfirm({ isOpen: false, questionId: null, text: '' });
  };

  const handleToggleComplete = (setId, questionId, status) => {
    onUpdateQuestion(setId, questionId, { completed: status });
    showToast(status ? 'Question completed ✓' : 'Marked incomplete', 'info');
  };

  const handleToggleImportant = (setId, questionId, importantStatus) => {
    onUpdateQuestion(setId, questionId, { important: importantStatus });
    showToast(importantStatus ? 'Marked as Important ⭐' : 'Removed from Important', 'info');
  };

  const handleUpdateAnswer = (setId, questionId, newAnswer) => {
    onUpdateQuestion(setId, questionId, { answer: newAnswer });
  };

  return (
    <div className="space-y-6">
      {/* Top Navigation & Action Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-muted hover:text-main hover:bg-[var(--neu-hover-bg)] inset-field transition-all cursor-pointer w-fit"
        >
          <ArrowLeft className="w-4 h-4 text-accent-primary" />
          <span>Back to Question Sets</span>
        </button>

        {/* Primary Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => onStartPractice(set.id)}
            disabled={total === 0}
            className="brass-btn px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
          >
            <Play className="w-3.5 h-3.5 text-accent-primary" />
            <span>Practice Mode</span>
          </button>

          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="px-3.5 py-2 rounded-xl text-xs font-bold inset-field border border-[var(--neu-border)] text-main hover:border-[var(--accent-orange)] transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-accent-primary" />
            <span>Add Question</span>
          </button>

          <button
            type="button"
            onClick={() => setShowPasteModal(true)}
            className="px-3.5 py-2 rounded-xl text-xs font-bold inset-field border border-[var(--neu-border)] text-main hover:border-[var(--accent-orange)] transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-accent-primary" />
            <span>Paste Questions</span>
          </button>

          {/* Set Options Dropdown Button */}
          <button
            type="button"
            onClick={() => setShowEditSetModal(true)}
            title="Edit Set Info"
            className="p-2 rounded-xl inset-field border border-[var(--neu-border)] text-muted hover:text-main transition-colors cursor-pointer"
          >
            <Edit2 className="w-4 h-4 text-accent-primary" />
          </button>

          <button
            type="button"
            onClick={() => exportQuestionSetJSON(set)}
            title="Export Question Set as JSON"
            className="p-2 rounded-xl inset-field border border-[var(--neu-border)] text-muted hover:text-main transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-accent-primary" />
          </button>
        </div>
      </div>

      {/* Set Header Hero Card */}
      <div
        className="p-6 rounded-3xl border dash-card shadow-lg relative overflow-hidden"
        style={{
          background: 'var(--neu-card-bg)',
          border: '1.5px solid var(--neu-border)',
        }}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              {set.pinned && (
                <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/30">
                  <Pin className="w-3 h-3 fill-amber-400" />
                  <span>Pinned</span>
                </span>
              )}
              <span
                className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border"
                style={{
                  background: `${set.color || '#6366f1'}15`,
                  color: set.color || '#6366f1',
                  borderColor: `${set.color || '#6366f1'}30`,
                }}
              >
                {set.subject || 'General'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-main tracking-tight">
              {set.name}
            </h1>
            <p className="text-xs sm:text-sm text-muted leading-relaxed max-w-3xl">
              {set.description || 'No description added. Click the edit icon to customize this set.'}
            </p>
          </div>

          {/* Quick Circular / Percent Indicator */}
          <div className="flex items-center gap-6 p-4 rounded-2xl inset-field border border-[var(--neu-border-subtle)] bg-[var(--neu-inset-bg)] shrink-0 justify-between sm:justify-start">
            <div>
              <span className="text-[10px] font-bold text-muted uppercase tracking-wider block">
                Completion Rate
              </span>
              <span className="text-2xl font-black text-main font-mono">
                {completionPercent}%
              </span>
              <span className="text-[10px] text-muted block">
                {completed} of {total} done
              </span>
            </div>

            <div className="h-10 w-px bg-[var(--neu-border-subtle)]" />

            <div>
              <span className="text-[10px] font-bold text-muted uppercase tracking-wider block">
                Answer Coverage
              </span>
              <span className="text-2xl font-black text-main font-mono">
                {answerPercent}%
              </span>
              <span className="text-[10px] text-muted block">
                {answered} of {total} written
              </span>
            </div>
          </div>
        </div>

        {/* Progress bar across set */}
        <div className="mt-6 pt-4 border-t border-[var(--neu-border-subtle)] space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-muted">
            <div className="flex items-center gap-3">
              <span className="text-main">{completed} Completed</span>
              <span>•</span>
              <span>{remaining} Remaining</span>
              <span>•</span>
              <span className="text-blue-400">{answered} Answered</span>
              <span>•</span>
              <span>{unanswered} Unanswered</span>
            </div>
            <span className="font-mono text-main">{completionPercent}%</span>
          </div>

          <div
            className="w-full h-2 rounded-full overflow-hidden neu-card"
            style={{
              background: 'var(--neu-inset-bg)',
              boxShadow: 'var(--neu-shadow-inset)',
            }}
          >
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${completionPercent}%`,
                background: 'linear-gradient(90deg, #6366f1 0%, #a855f7 100%)',
              }}
            />
          </div>
        </div>
      </div>

      {/* Toolbar: Search, Filters, Sort & View Mode */}
      <div className="space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Real-time search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-accent-primary pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search question titles, answers, notes, or tags..."
              className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl focus:outline-none inset-field text-main font-medium"
              style={{
                background: 'var(--neu-card-bg)',
                border: '1px solid var(--neu-border)',
              }}
            />
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl inset-field text-xs font-semibold text-muted">
              <SlidersHorizontal className="w-3.5 h-3.5 text-accent-primary" />
              <span>Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent font-bold text-main focus:outline-none cursor-pointer text-xs"
              >
                <option value="original">Original Order</option>
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="completed-first">Completed First</option>
                <option value="incomplete-first">Incomplete First</option>
                <option value="answered-first">Answered First</option>
                <option value="unanswered-first">Unanswered First</option>
                <option value="alphabetical">Alphabetical (A-Z)</option>
              </select>
            </div>

            {/* Compact mode toggle */}
            <button
              type="button"
              onClick={() => setIsCompact((prev) => !prev)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold inset-field transition-all cursor-pointer ${
                isCompact ? 'brass-btn text-white' : 'text-muted hover:text-main'
              }`}
            >
              {isCompact ? 'Compact: ON' : 'Compact: OFF'}
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 flex-wrap overflow-x-auto pb-1">
          {[
            { id: 'all', label: `All (${total})` },
            { id: 'incomplete', label: `Incomplete (${remaining})` },
            { id: 'completed', label: `Completed (${completed})` },
            { id: 'answered', label: `Answered (${answered})` },
            { id: 'unanswered', label: `Unanswered (${unanswered})` },
            { id: 'important', label: `⭐ Important (${questions.filter((q) => q.important).length})` },
            { id: 'easy', label: 'Easy' },
            { id: 'medium', label: 'Medium' },
            { id: 'hard', label: 'Hard' },
          ].map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setActiveFilter(f.id)}
              className={`px-3 py-1 text-xs font-bold rounded-full transition-all cursor-pointer shrink-0 ${
                activeFilter === f.id
                  ? 'brass-btn text-white shadow-sm'
                  : 'inset-field text-muted hover:text-main'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Bulk Selection Bar (appears when 1 or more selected) */}
      {selectedIds.size > 0 && (
        <div className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-xs animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleSelectAll}
              className="flex items-center gap-1.5 font-bold text-main cursor-pointer"
            >
              {selectedIds.size === processedQuestions.length ? (
                <CheckSquare className="w-4 h-4 text-accent-primary" />
              ) : (
                <Square className="w-4 h-4 text-muted" />
              )}
              <span>
                {selectedIds.size} selected of {processedQuestions.length}
              </span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleBulkComplete(true)}
              className="px-3 py-1.5 rounded-xl font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30 cursor-pointer"
            >
              Mark Completed
            </button>
            <button
              type="button"
              onClick={() => handleBulkComplete(false)}
              className="px-3 py-1.5 rounded-xl font-bold inset-field text-muted hover:text-main cursor-pointer"
            >
              Mark Incomplete
            </button>
            <button
              type="button"
              onClick={() => setBulkDeleteConfirm(true)}
              className="px-3 py-1.5 rounded-xl font-bold bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 cursor-pointer"
            >
              Delete Selected
            </button>
          </div>
        </div>
      )}

      {/* Question Cards List */}
      {processedQuestions.length > 0 ? (
        <div className="space-y-3.5">
          {processedQuestions.map((q, idx) => (
            <QuestionCard
              key={q.id || idx}
              question={q}
              index={idx}
              setId={set.id}
              searchQuery={search}
              isCompact={isCompact}
              isSelected={selectedIds.has(q.id)}
              onToggleSelect={handleToggleSelect}
              onToggleComplete={handleToggleComplete}
              onUpdateAnswer={handleUpdateAnswer}
              onToggleImportant={handleToggleImportant}
              onEdit={(target) => setEditingQuestion(target)}
              onDelete={(qId, text) => handleDeleteSingleQuestion(qId, text)}
              onPractice={(qId) => onStartPractice(set.id, qId)}
            />
          ))}
        </div>
      ) : (
        <div className="p-12 text-center rounded-3xl border border-[var(--neu-border)] bg-[var(--neu-card-bg)] space-y-4">
          <Circle className="w-8 h-8 text-muted mx-auto" />
          <h3 className="text-base font-bold text-main">
            {questions.length === 0
              ? 'No Questions in this Set Yet'
              : 'No questions match your current filter or search'}
          </h3>
          <p className="text-xs text-muted max-w-sm mx-auto">
            {questions.length === 0
              ? 'Paste a list of questions to convert them automatically, or add a single question.'
              : 'Try clearing your search query or switching filters to "All".'}
          </p>

          <div className="flex items-center justify-center gap-3 pt-2">
            {questions.length === 0 ? (
              <>
                <button
                  type="button"
                  onClick={() => setShowPasteModal(true)}
                  className="brass-btn px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Paste Questions</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(true)}
                  className="px-4 py-2 rounded-xl text-xs font-bold inset-field border border-[var(--neu-border)] text-main cursor-pointer"
                >
                  + Add Question
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  setActiveFilter('all');
                }}
                className="brass-btn px-4 py-2 rounded-xl text-xs font-bold cursor-pointer"
              >
                Clear Search & Filters
              </button>
            )}
          </div>
        </div>
      )}

      {/* Modals */}
      {showAddModal && (
        <QuestionModal
          isOpen={showAddModal}
          initialQuestion={null}
          onSave={(newQ) => {
            onAddQuestion(set.id, newQ);
            showToast('Question added ✓', 'success');
            setShowAddModal(false);
          }}
          onClose={() => setShowAddModal(false)}
        />
      )}

      {editingQuestion && (
        <QuestionModal
          isOpen={Boolean(editingQuestion)}
          initialQuestion={editingQuestion}
          onSave={(updates) => {
            onUpdateQuestion(set.id, editingQuestion.id, updates);
            showToast('Question updated ✓', 'success');
            setEditingQuestion(null);
          }}
          onClose={() => setEditingQuestion(null)}
        />
      )}

      {showPasteModal && (
        <PasteQuestionsModal
          isOpen={showPasteModal}
          targetSet={set}
          onImport={(imported) => {
            onImportQuestions(set.id, imported);
            showToast(`Imported ${imported.length} questions ✓`, 'success');
          }}
          onClose={() => setShowPasteModal(false)}
        />
      )}

      {showEditSetModal && (
        <QuestionSetModal
          isOpen={showEditSetModal}
          initialData={set}
          existingSets={allSets}
          onSave={(updates) => {
            onUpdateSet(set.id, updates);
            showToast('Question set updated ✓', 'success');
          }}
          onClose={() => setShowEditSetModal(false)}
        />
      )}

      {/* Delete Single Question Confirm */}
      <QuestionConfirmDialog
        isOpen={deleteConfirm.isOpen}
        title="Delete this question?"
        message={`This will permanently remove "${deleteConfirm.text?.slice(0, 50)}..." and its answer.`}
        confirmLabel="Delete Question"
        onConfirm={handleConfirmDeleteSingle}
        onCancel={() => setDeleteConfirm({ isOpen: false, questionId: null, text: '' })}
      />

      {/* Delete Bulk Questions Confirm */}
      <QuestionConfirmDialog
        isOpen={bulkDeleteConfirm}
        title={`Delete ${selectedIds.size} selected questions?`}
        message="This will permanently delete all selected questions and their answers from this set."
        confirmLabel={`Delete ${selectedIds.size} Questions`}
        onConfirm={handleConfirmBulkDelete}
        onCancel={() => setBulkDeleteConfirm(false)}
      />
    </div>
  );
}
