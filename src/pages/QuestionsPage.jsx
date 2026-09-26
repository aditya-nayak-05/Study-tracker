import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import gsap from 'gsap';
import { useStudy } from '../context/StudyContext';
import DashboardLayout from '../layouts/DashboardLayout';
import OverviewView from '../components/questions/OverviewView';
import QuestionSetsView from '../components/questions/QuestionSetsView';
import QuestionSetDetail from '../components/questions/QuestionSetDetail';
import PracticeMode from '../components/questions/PracticeMode';
import AnalyticsView from '../components/questions/AnalyticsView';
import QuestionSetModal from '../components/questions/QuestionSetModal';
import PasteQuestionsModal from '../components/questions/PasteQuestionsModal';
import QuestionConfirmDialog from '../components/questions/QuestionConfirmDialog';
import { exportQuestionSetJSON, exportQuestionSetCSV } from '../utils/questionParser';
import { getSpeedMultiplier, isReducedMotion, getMotionDuration } from '../utils/motion';
import {
  HelpCircle, BookOpen, Layers, BarChart3, Play, Search, Plus,
  Sparkles, Upload, X, ArrowRight
} from 'lucide-react';

export default function QuestionsPage() {
  const { state, dispatch, showToast } = useStudy();
  const navigate = useNavigate();
  const location = useLocation();
  const { setId: routeSetId } = useParams();

  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'sets' | 'practice' | 'analytics'
  const [selectedSetId, setSelectedSetId] = useState(routeSetId || null);
  const [practiceQuestionId, setPracticeQuestionId] = useState(null);

  // Global search modal / dropdown
  const [globalSearchOpen, setGlobalSearchOpen] = useState(false);
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');

  // Modals
  const [createSetModalOpen, setCreateSetModalOpen] = useState(false);
  const [pasteModalTargetSet, setPasteModalTargetSet] = useState(null);
  const [editingSet, setEditingSet] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, setId: null, name: '', total: 0 });

  const questionSets = state.questionSets || [];
  const containerRef = useRef(null);

  // Sync route param with state
  useEffect(() => {
    if (routeSetId) {
      setSelectedSetId(routeSetId);
    }
  }, [routeSetId]);

  // Entrance animation
  useEffect(() => {
    if (!containerRef.current) return;
    if (getSpeedMultiplier() === 0 || isReducedMotion()) {
      return;
    }
    const dur = getMotionDuration(0.35);
    gsap.fromTo(
      containerRef.current,
      { opacity: 0, y: 12 },
      { opacity: 1, y: 0, duration: dur, ease: 'power2.out' }
    );
  }, [activeTab, selectedSetId]);

  // Currently opened set
  const currentOpenSet = useMemo(() => {
    if (!selectedSetId) return null;
    return questionSets.find((s) => s.id === selectedSetId) || null;
  }, [questionSets, selectedSetId]);

  // Handlers for Question Sets
  const handleCreateSet = useCallback((setData) => {
    dispatch({ type: 'ADD_QUESTION_SET', payload: setData });
    showToast(`Question set "${setData.name}" created ✓`, 'success');
    // Find newly created set ID
    setTimeout(() => {
      // Switch to sets or open set
      setActiveTab('sets');
    }, 100);
  }, [dispatch, showToast]);

  const handleUpdateSet = useCallback((setId, updates) => {
    dispatch({ type: 'UPDATE_QUESTION_SET', payload: { id: setId, updates } });
  }, [dispatch]);

  const handleDeleteSet = useCallback((setId, name, total) => {
    setDeleteConfirm({ isOpen: true, setId, name, total });
  }, []);

  const handleConfirmDeleteSet = useCallback(() => {
    if (!deleteConfirm.setId) return;
    dispatch({ type: 'DELETE_QUESTION_SET', payload: deleteConfirm.setId });
    showToast(`Deleted question set "${deleteConfirm.name}"`, 'info');
    if (selectedSetId === deleteConfirm.setId) {
      setSelectedSetId(null);
      navigate('/questions', { replace: true });
    }
    setDeleteConfirm({ isOpen: false, setId: null, name: '', total: 0 });
  }, [deleteConfirm, dispatch, showToast, selectedSetId, navigate]);

  const handleDuplicateSet = useCallback((setId) => {
    dispatch({ type: 'DUPLICATE_QUESTION_SET', payload: setId });
    showToast('Question set duplicated ✓', 'success');
  }, [dispatch, showToast]);

  const handlePinSet = useCallback((setId) => {
    dispatch({ type: 'PIN_QUESTION_SET', payload: setId });
    const target = questionSets.find((s) => s.id === setId);
    showToast(target?.pinned ? 'Set unpinned' : 'Set pinned to top 📌', 'info');
  }, [dispatch, questionSets, showToast]);

  // Handlers for Questions inside sets
  const handleAddQuestion = useCallback((setId, question) => {
    dispatch({ type: 'ADD_QUESTION', payload: { setId, question } });
  }, [dispatch]);

  const handleUpdateQuestion = useCallback((setId, questionId, updates) => {
    dispatch({ type: 'UPDATE_QUESTION', payload: { setId, questionId, updates } });
  }, [dispatch]);

  const handleDeleteQuestion = useCallback((setId, questionId) => {
    dispatch({ type: 'DELETE_QUESTION', payload: { setId, questionId } });
  }, [dispatch]);

  const handleBulkUpdateQuestions = useCallback((setId, questionIds, updates) => {
    dispatch({ type: 'BULK_UPDATE_QUESTIONS', payload: { setId, questionIds, updates } });
  }, [dispatch]);

  const handleBulkDeleteQuestions = useCallback((setId, questionIds) => {
    dispatch({ type: 'BULK_DELETE_QUESTIONS', payload: { setId, questionIds } });
  }, [dispatch]);

  const handleImportQuestions = useCallback((setId, questions) => {
    dispatch({ type: 'IMPORT_QUESTIONS_TO_SET', payload: { setId, questions } });
  }, [dispatch]);

  const handleImportAllBackup = useCallback((newSets) => {
    dispatch({ type: 'IMPORT_ALL_QUESTIONS', payload: newSets });
  }, [dispatch]);

  const handleClearAll = useCallback(() => {
    dispatch({ type: 'CLEAR_ALL_QUESTIONS' });
    setSelectedSetId(null);
    navigate('/questions', { replace: true });
  }, [dispatch, navigate]);

  // Practice start helper
  const handleStartPractice = useCallback((setId, questionId = null) => {
    setSelectedSetId(setId);
    setPracticeQuestionId(questionId);
    setActiveTab('practice');
  }, []);

  // Open set helper
  const handleOpenSet = useCallback((setId) => {
    setSelectedSetId(setId);
    navigate(`/questions/${setId}`);
  }, [navigate]);

  const handleBackToSets = useCallback(() => {
    setSelectedSetId(null);
    navigate('/questions');
  }, [navigate]);

  // Global search results across all questions
  const globalSearchResults = useMemo(() => {
    if (!globalSearchQuery.trim()) return [];
    const q = globalSearchQuery.toLowerCase();
    const results = [];

    questionSets.forEach((set) => {
      (set.questions || []).forEach((question) => {
        if (
          question.text.toLowerCase().includes(q) ||
          (question.answer && question.answer.toLowerCase().includes(q))
        ) {
          results.push({
            question,
            setId: set.id,
            setName: set.name,
            subject: set.subject,
          });
        }
      });
    });

    return results.slice(0, 15);
  }, [questionSets, globalSearchQuery]);

  const handleSelectSearchResult = (result) => {
    setSelectedSetId(result.setId);
    setPracticeQuestionId(result.question.id);
    setGlobalSearchOpen(false);
    setGlobalSearchQuery('');
    navigate(`/questions/${result.setId}`);
  };

  return (
    <DashboardLayout
      title={currentOpenSet ? currentOpenSet.name : 'Questions'}
      subtitle={
        currentOpenSet
          ? `${currentOpenSet.questions?.length || 0} questions in this collection`
          : 'Manage question sets, convert pasted lists, practice consistently, and track progress.'
      }
      headerRight={
        <div className="flex items-center gap-2 justify-end">
          {/* Global Question Search Bar Trigger */}
          <button
            type="button"
            onClick={() => setGlobalSearchOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl inset-field border border-[var(--neu-border)] text-muted hover:text-main text-[13px] font-semibold cursor-pointer max-w-xs w-full transition-all"
          >
            <Search className="w-4 h-4 text-accent-primary shrink-0" />
            <span className="truncate">Search all questions & answers...</span>
            <kbd className="hidden sm:inline text-[9px] px-1.5 py-0.5 rounded bg-black/20 text-muted ml-auto font-mono">
              Ctrl+K
            </kbd>
          </button>
        </div>
      }
    >
      <div ref={containerRef} className="space-y-10">
        <div className="max-w-[1600px] w-full mx-auto space-y-10">
        {/* Navigation Tabs (Overview, Question Sets, Practice, Analytics) */}
        {!selectedSetId && (
          <div className="flex items-center justify-between border-b border-[var(--neu-border-subtle)] pb-5 mb-2 overflow-x-auto">
            <div className="flex items-center gap-2.5">
              {[
                { id: 'overview', label: 'Overview', icon: BookOpen },
                { id: 'sets', label: `Question Sets (${questionSets.length})`, icon: Layers },
                { id: 'practice', label: 'Practice Mode', icon: Play },
                { id: 'analytics', label: 'Analytics', icon: BarChart3 },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-[13px] font-bold transition-all cursor-pointer shrink-0 ${
                      isActive
                        ? 'brass-btn text-white shadow-md'
                        : 'inset-field text-muted hover:text-main hover:bg-[var(--neu-hover-bg)]'
                    }`}
                  >
                    <Icon className="w-[18px] h-[18px] text-accent-primary" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* View Switcher */}
        {selectedSetId && currentOpenSet ? (
          /* Question Set Detail View */
          <QuestionSetDetail
            set={currentOpenSet}
            allSets={questionSets}
            onBack={handleBackToSets}
            onStartPractice={(setId, qId) => handleStartPractice(setId, qId)}
            onUpdateSet={handleUpdateSet}
            onDeleteSet={handleDeleteSet}
            onDuplicateSet={handleDuplicateSet}
            onPinSet={handlePinSet}
            onAddQuestion={handleAddQuestion}
            onUpdateQuestion={handleUpdateQuestion}
            onDeleteQuestion={handleDeleteQuestion}
            onBulkUpdateQuestions={handleBulkUpdateQuestions}
            onBulkDeleteQuestions={handleBulkDeleteQuestions}
            onImportQuestions={handleImportQuestions}
            showToast={showToast}
          />
        ) : activeTab === 'overview' ? (
          /* Overview View */
          <OverviewView
            questionSets={questionSets}
            onOpenSet={handleOpenSet}
            onStartPractice={handleStartPractice}
            onCreateSet={() => setCreateSetModalOpen(true)}
            onPasteQuestions={() => {
              if (questionSets.length > 0) {
                setPasteModalTargetSet(questionSets[0]);
              } else {
                setCreateSetModalOpen(true);
              }
            }}
            onImportBackup={() => setActiveTab('analytics')}
            onPinSet={handlePinSet}
            onEditSet={(target) => setEditingSet(target)}
            onDuplicateSet={handleDuplicateSet}
            onExportJSON={exportQuestionSetJSON}
            onExportCSV={exportQuestionSetCSV}
            onDeleteSet={handleDeleteSet}
          />
        ) : activeTab === 'sets' ? (
          /* Question Sets View */
          <QuestionSetsView
            questionSets={questionSets}
            onOpenSet={handleOpenSet}
            onContinuePractice={handleStartPractice}
            onPinSet={handlePinSet}
            onEditSet={(target) => setEditingSet(target)}
            onDuplicateSet={handleDuplicateSet}
            onExportJSON={exportQuestionSetJSON}
            onExportCSV={exportQuestionSetCSV}
            onDeleteSet={handleDeleteSet}
            onCreateSet={() => setCreateSetModalOpen(true)}
          />
        ) : activeTab === 'practice' ? (
          /* Focused Practice View */
          <PracticeMode
            questionSets={questionSets}
            activeSetId={selectedSetId || questionSets[0]?.id}
            initialQuestionId={practiceQuestionId}
            onExit={() => {
              if (selectedSetId) {
                navigate(`/questions/${selectedSetId}`);
              } else {
                setActiveTab('overview');
              }
            }}
            onToggleComplete={handleUpdateQuestion}
            onUpdateAnswer={handleUpdateQuestion}
            onUpdateQuestionSet={handleUpdateSet}
          />
        ) : (
          /* Analytics View */
          <AnalyticsView
            questionSets={questionSets}
            onImportAll={handleImportAllBackup}
            onClearAll={handleClearAll}
            showToast={showToast}
          />
        )}
        </div>
      </div>

      {/* Global Questions Search Modal */}
      {globalSearchOpen && (
        <div
          className="fixed inset-0 z-[140] flex items-start justify-center pt-[12vh] p-4 backdrop-blur-sm"
          style={{ background: 'rgba(13, 15, 23, 0.75)' }}
          onClick={() => setGlobalSearchOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="rounded-2xl w-full max-w-xl leather-card shadow-2xl overflow-hidden border border-[var(--neu-border)] bg-[var(--neu-card-bg)]"
          >
            <div className="relative flex items-center px-4 py-3 border-b border-[var(--neu-border-subtle)]">
              <Search className="w-4 h-4 text-accent-primary absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={globalSearchQuery}
                onChange={(e) => setGlobalSearchQuery(e.target.value)}
                placeholder="Search across all questions and answers..."
                className="w-full pl-9 pr-8 py-2 text-sm rounded-xl focus:outline-none inset-field text-main font-semibold"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setGlobalSearchOpen(false)}
                className="absolute right-4 text-muted hover:text-main"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 max-h-96 overflow-y-auto space-y-2.5">
              {globalSearchResults.map((res, i) => (
                <div
                  key={i}
                  onClick={() => handleSelectSearchResult(res)}
                  className="p-3.5 rounded-xl border border-[var(--neu-border-subtle)] bg-[var(--neu-inset-bg)] hover:border-[var(--accent-orange)] transition-colors cursor-pointer group flex items-start justify-between gap-3"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-main group-hover:text-accent-primary transition-colors">
                      {res.question.text}
                    </p>
                    {res.question.answer && (
                      <p className="text-xs text-muted line-clamp-1 italic mt-0.5">
                        {res.question.answer}
                      </p>
                    )}
                    <span className="text-[11px] text-muted font-medium mt-1 inline-block">
                      Set: {res.setName} ({res.subject || 'General'})
                    </span>
                  </div>

                  <ArrowRight className="w-4 h-4 text-muted group-hover:text-accent-primary shrink-0 transition-transform group-hover:translate-x-1" />
                </div>
              ))}

              {globalSearchQuery.trim() && globalSearchResults.length === 0 && (
                <p className="text-xs text-muted text-center py-6">
                  No questions or answers matched "{globalSearchQuery}".
                </p>
              )}

              {!globalSearchQuery.trim() && (
                <p className="text-xs text-muted text-center py-6">
                  Type any keywords to search across all Question Sets and saved answers.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create Question Set Modal */}
      {createSetModalOpen && (
        <QuestionSetModal
          isOpen={createSetModalOpen}
          initialData={null}
          existingSets={questionSets}
          onSave={handleCreateSet}
          onClose={() => setCreateSetModalOpen(false)}
        />
      )}

      {/* Edit Question Set Modal */}
      {editingSet && (
        <QuestionSetModal
          isOpen={Boolean(editingSet)}
          initialData={editingSet}
          existingSets={questionSets}
          onSave={(updates) => {
            handleUpdateSet(editingSet.id, updates);
            showToast('Question set updated ✓', 'success');
            setEditingSet(null);
          }}
          onClose={() => setEditingSet(null)}
        />
      )}

      {/* Paste Questions Modal */}
      {pasteModalTargetSet && (
        <PasteQuestionsModal
          isOpen={Boolean(pasteModalTargetSet)}
          targetSet={pasteModalTargetSet}
          onImport={(importedQuestions) => {
            handleImportQuestions(pasteModalTargetSet.id, importedQuestions);
            showToast(`Imported ${importedQuestions.length} questions into "${pasteModalTargetSet.name}" ✓`, 'success');
            setPasteModalTargetSet(null);
          }}
          onClose={() => setPasteModalTargetSet(null)}
        />
      )}

      {/* Delete Question Set Confirm Dialog */}
      <QuestionConfirmDialog
        isOpen={deleteConfirm.isOpen}
        title={`Delete "${deleteConfirm.name}"?`}
        message={`${deleteConfirm.total} questions and their answers in this set will be permanently removed.`}
        confirmLabel="Delete Set"
        onConfirm={handleConfirmDeleteSet}
        onCancel={() => setDeleteConfirm({ isOpen: false, setId: null, name: '', total: 0 })}
      />
    </DashboardLayout>
  );
}
