import React, { useState, useMemo } from 'react';
import { Plus, Search, FolderPlus, Sparkles, Pin } from 'lucide-react';
import QuestionSetCard from './QuestionSetCard';

export default function QuestionSetsView({
  questionSets = [],
  onOpenSet,
  onContinuePractice,
  onPinSet,
  onEditSet,
  onDuplicateSet,
  onExportJSON,
  onExportCSV,
  onDeleteSet,
  onCreateSet,
}) {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'pinned' | 'recent' | 'completed'

  const filteredSets = useMemo(() => {
    let list = [...questionSets];

    // Filter by tab
    if (activeTab === 'pinned') {
      list = list.filter((s) => s.pinned);
    } else if (activeTab === 'recent') {
      list = [...list].sort(
        (a, b) => new Date(b.lastOpenedAt || b.updatedAt || 0) - new Date(a.lastOpenedAt || a.updatedAt || 0)
      );
    } else if (activeTab === 'completed') {
      list = list.filter((s) => {
        const total = s.questions?.length || 0;
        const done = s.questions?.filter((q) => q.completed).length || 0;
        return total > 0 && done === total;
      });
    }

    // Search query
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          (s.description && s.description.toLowerCase().includes(q)) ||
          (s.subject && s.subject.toLowerCase().includes(q))
      );
    }

    // Default sorting: pinned first unless recent tab is active
    if (activeTab !== 'recent') {
      list.sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));
    }

    return list;
  }, [questionSets, search, activeTab]);

  return (
    <div className="space-y-8">
      {/* Search & Filter Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {[
            { id: 'all', label: `All (${questionSets.length})` },
            { id: 'pinned', label: `Pinned 📌 (${questionSets.filter((s) => s.pinned).length})` },
            { id: 'recent', label: 'Recently Practiced' },
            { id: 'completed', label: 'Completed Sets' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-2 text-[13px] font-bold rounded-xl transition-all cursor-pointer shrink-0 ${
                activeTab === tab.id
                  ? 'brass-btn text-white shadow-sm'
                  : 'inset-field text-muted hover:text-main'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search bar & Create button */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-accent-primary pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search question sets..."
              className="w-full pl-10 pr-4 py-2 text-sm rounded-xl focus:outline-none inset-field text-main font-semibold"
              style={{
                background: 'var(--neu-card-bg)',
                border: '1px solid var(--neu-border)',
              }}
            />
          </div>

          <button
            type="button"
            onClick={onCreateSet}
            className="brass-btn px-4 py-2.5 rounded-xl text-[13px] font-bold flex items-center gap-1.5 cursor-pointer shrink-0 active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Set</span>
          </button>
        </div>
      </div>

      {/* Grid of Sets */}
      {filteredSets.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredSets.map((set) => (
            <QuestionSetCard
              key={set.id}
              set={set}
              onOpenSet={onOpenSet}
              onContinuePractice={onContinuePractice}
              onPin={onPinSet}
              onEdit={onEditSet}
              onDuplicate={onDuplicateSet}
              onExportJSON={onExportJSON}
              onExportCSV={onExportCSV}
              onDelete={onDeleteSet}
            />
          ))}
        </div>
      ) : (
        <div className="p-12 text-center rounded-3xl border border-[var(--neu-border)] bg-[var(--neu-card-bg)] space-y-4">
          <FolderPlus className="w-12 h-12 text-muted mx-auto" />
          <h3 className="text-lg font-bold text-main">
            {questionSets.length === 0
              ? 'No Question Sets Yet'
              : 'No question sets match your current search or filter'}
          </h3>
          <p className="text-sm text-muted max-w-sm mx-auto">
            {questionSets.length === 0
              ? 'Create your first question set and start practicing!'
              : 'Try changing your filter or clearing the search text.'}
          </p>

          <button
            type="button"
            onClick={questionSets.length === 0 ? onCreateSet : () => { setSearch(''); setActiveTab('all'); }}
            className="brass-btn px-5 py-2.5 rounded-xl text-xs font-bold inline-flex items-center gap-2 cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>{questionSets.length === 0 ? 'Create Question Set' : 'Reset Filters'}</span>
          </button>
        </div>
      )}
    </div>
  );
}
