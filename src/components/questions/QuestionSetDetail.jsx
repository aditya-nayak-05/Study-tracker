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
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'incomplete' | 'completed' 
  const [sortBy, setSortBy] = useState('original');
  const [isCompact, setIsCompact] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());
  
  // Dropdown for more options
  const [showMoreMenu, setShowMoreMenu] = useState(false);

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
      // removed other filters from UI but keep logic if needed
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
    <div className="max-w-[1600px] mx-auto w-full space-y-10">
      {/* Top Navigation & Action Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-semibold text-muted hover:text-main hover:bg-[var(--neu-hover-bg)] transition-all cursor-pointer w-fit"
        >
          <ArrowLeft className="w-4 h-4 text-accent-primary" />
          <span>Back to Question Sets</span>
        </button>

        {/* Primary Action Buttons */}
        <div className="flex items-center gap-3 flex-wrap">
          <button
            type="button"
            onClick={() => onStartPractice(set.id)}
            disabled={total === 0}
            className="brass-btn h-10 px-5 rounded-[10px] text-sm font-semibold flex items-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 transition-all"
          >
            <Play className="w-4 h-4 text-accent-primary" />
            <span>Practice Mode</span>
          </button>

          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="h-10 px-4 rounded-[10px] text-sm font-semibold inset-field border border-[var(--neu-border)] text-main hover:border-[var(--accent-orange)] transition-all flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4 text-accent-primary" />
            <span>Add Question</span>
          </button>

          <button
            type="button"
            onClick={() => setShowPasteModal(true)}
            className="h-10 px-4 rounded-[10px] text-sm font-semibold inset-field border border-[var(--neu-border)] text-main hover:border-[var(--accent-orange)] transition-all flex items-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-accent-primary" />
            <span>Paste Questions</span>
          </button>
        </div>
      </div>

      {/* Set Header Hero Card */}
      <div
        className="p-7 sm:p-9 rounded-3xl border dash-card shadow-lg relative overflow-hidden"
        style={{
          background: 'var(--neu-card-bg)',
          border: '1.5px solid var(--neu-border)',
        }}
      >
        {/* Absolute More Menu */}
        <div className="absolute top-7 right-7 sm:top-9 sm:right-9 z-10">
          <div className="relative">
            <button
              onClick={() => setShowMoreMenu(!showMoreMenu)}
              className="p-2 rounded-xl inset-field border border-[var(--neu-border)] text-muted hover:text-main transition-colors cursor-pointer"
            >
              <MoreVertical className="w-4 h-4 text-accent-primary" />
            </button>
            {showMoreMenu && (
              <div 
                className="absolute right-0 mt-2 w-48 rounded-xl shadow-xl border overflow-hidden py-1"
                style={{
                  background: 'var(--neu-card-bg)',
                  borderColor: 'var(--neu-border)',
                }}
              >
                <button
                  type="button"
                  onClick={() => {
                    setShowEditSetModal(true);
                    setShowMoreMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm font-medium text-main hover:bg-[var(--neu-hover-bg)] flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <Edit2 className="w-4 h-4 text-muted" />
                  Edit Set Info
                </button>
                <button
                  type="button"
                  onClick={() => {
                    exportQuestionSetJSON(set);
                    setShowMoreMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm font-medium text-main hover:bg-[var(--neu-hover-bg)] flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <Download className="w-4 h-4 text-muted" />
                  Export as JSON
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-6 max-w-4xl">
          <div className="space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              {set.pinned && (
                <span className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-amber-500 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/30">
                  <Pin className="w-3.5 h-3.5 fill-amber-500" />
                  <span>Pinned</span>
                </span>
              )}
              <span
                className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border"
                style={{
                  background: `${set.color || '#6366f1'}15`,
                  color: set.color || '#6366f1',
                  borderColor: `${set.color || '#6366f1'}30`,
                }}
              >
                {set.subject || 'General'}
              </span>
            </div>

            <h1 className="text-3xl sm:text-[38px] font-black text-main tracking-tight leading-tight pr-12">
              {set.name}
            </h1>
            <p className="text-sm sm:text-base text-muted leading-relaxed">
              {set.description || 'No description added. Click the edit icon to customize this set.'}
            </p>
          </div>
          
          {/* Subtle Progress Bar */}
          <div className="pt-2 max-w-md w-full">
             <div className="flex items-center justify-between text-sm font-semibold text-muted mb-2">
               <span>{completed} of {total} completed</span>
               <span className="font-mono text-main">{completionPercent}%</span>
             </div>
             <div
               className="w-full h-[6px] rounded-full overflow-hidden"
               style={{
                 background: 'var(--neu-inset-bg)',
                 boxShadow: 'var(--neu-shadow-inset)',
               }}
             >
               <div
                 className="h-full rounded-full transition-all duration-500"
                 style={{
                   width: `${completionPercent}%`,
                   background: 'linear-gradient(90deg, var(--accent-primary) 0%, #a855f7 100%)',
                 }}
               />
             </div>
          </div>
        </div>
      </div>

      {/* Toolbar: Search, Filters, Sort & View Mode */}
      <div className="space-y-5">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          
          {/* Filter Pills */}
          <div className="flex items-center gap-2 flex-wrap overflow-x-auto pb-1">
            {[
              { id: 'all', label: `All (${total})` },
              { id: 'incomplete', label: `Incomplete (${remaining})` },
              { id: 'completed', label: `Completed (${completed})` },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setActiveFilter(f.id)}
                className={`h-10 px-5 text-sm font-semibold rounded-xl transition-all cursor-pointer shrink-0 ${
                  activeFilter === f.id
                    ? 'brass-btn text-white shadow-sm'
                    : 'inset-field text-muted hover:text-main border border-[var(--neu-border)]'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Real-time search */}
            <div className="relative min-w-[240px]">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-accent-primary pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                className="w-full pl-10 pr-4 h-10 text-sm rounded-xl focus:outline-none inset-field text-main font-medium placeholder:text-muted"
                style={{
                  background: 'var(--neu-card-bg)',
                  border: '1px solid var(--neu-border)',
                }}
              />
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 h-10 px-3 rounded-xl inset-field border border-[var(--neu-border)] text-sm font-semibold text-muted bg-[var(--neu-card-bg)]">
              <SlidersHorizontal className="w-4 h-4 text-accent-primary" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent font-semibold text-main focus:outline-none cursor-pointer text-sm"
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
              className={`h-10 px-4 rounded-xl text-sm font-semibold inset-field border border-[var(--neu-border)] transition-all cursor-pointer ${
                isCompact ? 'brass-btn text-white' : 'text-muted hover:text-main'
              }`}
            >
              {isCompact ? 'Compact: ON' : 'Compact: OFF'}
            </button>
          </div>
        </div>
      </div>

      {/* Bulk Selection Bar */}
      {selectedIds.size > 0 && (
        <div className="flex items-center justify-between gap-3 p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-sm animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleSelectAll}
              className="flex items-center gap-2 font-bold text-main cursor-pointer"
            >
              {selectedIds.size === processedQuestions.length ? (
                <CheckSquare className="w-5 h-5 text-accent-primary" />
              ) : (
                <Square className="w-5 h-5 text-muted" />
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
              className="px-4 py-2 rounded-xl font-bold bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30 cursor-pointer transition-colors"
            >
              Mark Completed
            </button>
            <button
              type="button"
              onClick={() => handleBulkComplete(false)}
              className="px-4 py-2 rounded-xl font-bold inset-field text-muted hover:text-main cursor-pointer border border-[var(--neu-border)] transition-colors"
            >
              Mark Incomplete
            </button>
            <button
              type="button"
              onClick={() => setBulkDeleteConfirm(true)}
              className="px-4 py-2 rounded-xl font-bold bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/30 hover:bg-red-500/30 cursor-pointer transition-colors"
            >
              Delete Selected
            </button>
          </div>
        </div>
      )}

      {/* Question Cards List */}
      {processedQuestions.length > 0 ? (
        <div className="space-y-6">
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
              onUpdateQuestion={onUpdateQuestion}
            />
          ))}
        </div>
      ) : (
        <div className="p-16 text-center rounded-3xl border border-[var(--neu-border)] bg-[var(--neu-card-bg)] space-y-4">
          <Circle className="w-10 h-10 text-muted mx-auto" />
          <h3 className="text-xl font-bold text-main">
            {questions.length === 0
              ? 'No Questions in this Set Yet'
              : 'No questions match your current filter or search'}
          </h3>
          <p className="text-base text-muted max-w-md mx-auto leading-relaxed">
            {questions.length === 0
              ? 'Paste a list of questions to convert them automatically, or add a single question.'
              : 'Try clearing your search query or switching filters to "All".'}
          </p>

          <div className="flex items-center justify-center gap-3 pt-6">
            {questions.length === 0 ? (
              <>
                <button
                  type="button"
                  onClick={() => setShowPasteModal(true)}
                  className="brass-btn h-11 px-6 rounded-xl text-sm font-bold flex items-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Paste Questions</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(true)}
                  className="h-11 px-6 rounded-xl text-sm font-bold inset-field border border-[var(--neu-border)] text-main cursor-pointer hover:border-[var(--accent-orange)] transition-colors"
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
                className="brass-btn h-11 px-6 rounded-xl text-sm font-bold cursor-pointer"
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
