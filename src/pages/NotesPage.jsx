import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useStudy } from '../context/StudyContext';
import {
  FileText, Upload, Plus, Trash2, MoveLeft, MoveRight, Copy, Download,
  Eye, Grid, ZoomIn, ZoomOut, RotateCcw, ChevronLeft, ChevronRight,
  BookOpen, Edit3, CheckSquare, Sparkles, Folder, FileUp, GripVertical,
  HelpCircle, MessageSquare, Save, X, Layout, Layers, FileCode
} from 'lucide-react';
import { savePdfDocument, getAllPdfDocuments, getPdfDocument, deletePdfDocument } from '../utils/pdfStorage';
import { generateId } from '../utils/helpers';

// Predefined page templates for note creation
const NOTE_TEMPLATES = [
  {
    id: 'blank',
    name: 'Blank Note Page',
    icon: FileText,
    description: 'Clean canvas for general notes & summaries',
    content: '## Quick Notes\n- Write your study points here...\n\n### Key Concepts\n',
  },
  {
    id: 'cornell',
    name: 'Cornell Notes Template',
    icon: Layout,
    description: 'Structured layout with Cues, Notes, and Summary',
    content: `### 📌 Cues / Questions\n- What is the main idea?\n- Key vocabulary / formula?\n\n---\n\n### 📝 Lecture & Reading Notes\n- Detail point 1:\n- Detail point 2:\n- Example or diagram notes:\n\n---\n\n### 💡 Summary\nSummarize the main takeaways in 2-3 sentences here...`,
  },
  {
    id: 'summary',
    name: 'Summary & Action Plan',
    icon: CheckSquare,
    description: 'Key takeaways, action items, and revision checklist',
    content: `## 🎯 Learning Objectives & Summary\n\n### Key Takeaways\n1. \n2. \n3. \n\n### 🚀 Action Items & Practice\n- [ ] Review chapter questions\n- [ ] Solved example problems\n- [ ] Create flashcards for formulas`,
  },
  {
    id: 'grid',
    name: 'Formula & Code Cheatsheet',
    icon: FileCode,
    description: 'Format formulas, pseudocode, and technical definitions',
    content: `## 💻 Code & Formula Cheatsheet\n\n\`\`\`python\n# Add sample code or formulas\ndef algorithm():
    pass
\`\`\`\n\n> **Key Property**: Add important properties or limits here.`,
  },
];

export default function NotesPage() {
  const { showToast } = useStudy();
  const [documents, setDocuments] = useState([]);
  const [activeDoc, setActiveDoc] = useState(null);
  const [activePdfUrl, setActivePdfUrl] = useState(null);

  // Active state within workspace
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [viewMode, setViewMode] = useState('split'); // 'split' | 'pdf' | 'notes' | 'grid'
  const [pageNotes, setPageNotes] = useState('');
  const [draggedPageIndex, setDraggedPageIndex] = useState(null);
  const [isDragOverDropZone, setIsDragOverDropZone] = useState(false);

  // UI Modals & Dropdowns
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [showDocModal, setShowDocModal] = useState(false);
  const [newDocTitle, setNewDocTitle] = useState('');

  const fileInputRef = useRef(null);
  const appendFileInputRef = useRef(null);
  const pdfContainerRef = useRef(null);

  // Fetch all documents on mount
  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      const docs = await getAllPdfDocuments();
      setDocuments(docs);
      if (docs.length > 0 && !activeDoc) {
        openDocument(docs[0].id);
      }
    } catch (err) {
      console.error('Error loading documents:', err);
    }
  };

  const openDocument = async (id) => {
    try {
      const fullDoc = await getPdfDocument(id);
      if (fullDoc) {
        setActiveDoc(fullDoc);
        setCurrentPageIndex(0);

        if (fullDoc.blob) {
          if (activePdfUrl) URL.revokeObjectURL(activePdfUrl);
          const url = URL.createObjectURL(fullDoc.blob);
          setActivePdfUrl(url);
        } else {
          setActivePdfUrl(null);
        }

        const initialNotes = fullDoc.pages?.[0]?.notes || fullDoc.globalNotes || '';
        setPageNotes(initialNotes);
      }
    } catch (err) {
      console.error('Error opening document:', err);
      showToast('Failed to load PDF document', 'error');
    }
  };

  // Revoke Blob URL when unmounting or changing active document
  useEffect(() => {
    return () => {
      if (activePdfUrl) {
        URL.revokeObjectURL(activePdfUrl);
      }
    };
  }, [activePdfUrl]);

  // Handle PDF Upload / Creation
  const handlePdfUpload = async (file) => {
    if (!file || file.type !== 'application/pdf') {
      showToast('Please select a valid PDF file (.pdf)', 'error');
      return;
    }

    try {
      const docId = generateId();
      const initialPages = Array.from({ length: 5 }, (_, i) => ({
        id: generateId(),
        pageNumber: i + 1,
        title: `Page ${i + 1}`,
        type: 'pdf',
        notes: '',
      }));

      const newDoc = {
        id: docId,
        title: file.name.replace(/\.pdf$/i, ''),
        fileName: file.name,
        fileSize: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
        pageCount: initialPages.length,
        pages: initialPages,
        globalNotes: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await savePdfDocument(newDoc, file);
      showToast(`Uploaded "${file.name}" successfully!`, 'success');
      await loadDocuments();
      await openDocument(docId);
    } catch (err) {
      console.error('Failed to upload PDF:', err);
      showToast('Error uploading PDF file', 'error');
    }
  };

  // Create a new empty Notebook
  const handleCreateNotebook = async () => {
    const title = newDocTitle.trim() || 'Untitled Study Notebook';
    const docId = generateId();
    const defaultPage = {
      id: generateId(),
      pageNumber: 1,
      title: 'Page 1 — Notes',
      type: 'note',
      notes: NOTE_TEMPLATES[0].content,
    };

    const newDoc = {
      id: docId,
      title,
      fileName: `${title}.pdf`,
      fileSize: '0 MB',
      pageCount: 1,
      pages: [defaultPage],
      globalNotes: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      await savePdfDocument(newDoc, null);
      showToast(`Created notebook "${title}"`, 'success');
      setNewDocTitle('');
      setShowDocModal(false);
      await loadDocuments();
      await openDocument(docId);
    } catch (err) {
      console.error('Error creating notebook:', err);
      showToast('Error creating notebook', 'error');
    }
  };

  // Delete Document
  const handleDeleteDoc = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this document?')) return;
    try {
      await deletePdfDocument(id);
      showToast('Document deleted', 'info');
      const updated = documents.filter((d) => d.id !== id);
      setDocuments(updated);
      if (activeDoc?.id === id) {
        setActiveDoc(null);
        setActivePdfUrl(null);
        if (updated.length > 0) openDocument(updated[0].id);
      }
    } catch (err) {
      console.error('Error deleting document:', err);
    }
  };

  // Page Management: Add Page Button Actions
  const handleAddPage = async (templateId) => {
    if (!activeDoc) return;
    setShowAddMenu(false);

    const template = NOTE_TEMPLATES.find((t) => t.id === templateId) || NOTE_TEMPLATES[0];
    const newPageNumber = (activeDoc.pages?.length || 0) + 1;
    const newPage = {
      id: generateId(),
      pageNumber: newPageNumber,
      title: `Page ${newPageNumber} (${template.name})`,
      type: 'note',
      notes: template.content,
    };

    const updatedPages = [...(activeDoc.pages || []), newPage];
    const updatedDoc = {
      ...activeDoc,
      pages: updatedPages,
      pageCount: updatedPages.length,
      updatedAt: new Date().toISOString(),
    };

    setActiveDoc(updatedDoc);
    setCurrentPageIndex(updatedPages.length - 1);
    setPageNotes(template.content);

    try {
      await savePdfDocument(updatedDoc, activeDoc.blob);
      showToast(`Added ${template.name}!`, 'success');
    } catch (err) {
      console.error('Error saving updated document:', err);
    }
  };

  // Append external PDF or image file as new page(s)
  const handleAppendFileAsPage = async (file) => {
    if (!activeDoc || !file) return;
    setShowAddMenu(false);

    const newPageNumber = (activeDoc.pages?.length || 0) + 1;
    const newPage = {
      id: generateId(),
      pageNumber: newPageNumber,
      title: `Page ${newPageNumber} (${file.name})`,
      type: file.type.startsWith('image/') ? 'image' : 'pdf',
      notes: `### Notes for attached file: ${file.name}\n- Uploaded on ${new Date().toLocaleDateString()}`,
    };

    const updatedPages = [...(activeDoc.pages || []), newPage];
    const updatedDoc = {
      ...activeDoc,
      pages: updatedPages,
      pageCount: updatedPages.length,
      updatedAt: new Date().toISOString(),
    };

    setActiveDoc(updatedDoc);
    setCurrentPageIndex(updatedPages.length - 1);
    setPageNotes(newPage.notes);

    try {
      await savePdfDocument(updatedDoc, activeDoc.blob);
      showToast(`Appended ${file.name} to document!`, 'success');
    } catch (err) {
      console.error('Error appending page:', err);
    }
  };

  // Duplicate Page
  const handleDuplicatePage = async (index) => {
    if (!activeDoc || !activeDoc.pages?.[index]) return;
    const srcPage = activeDoc.pages[index];
    const newPage = {
      ...srcPage,
      id: generateId(),
      title: `${srcPage.title} (Copy)`,
    };

    const updatedPages = [...activeDoc.pages];
    updatedPages.splice(index + 1, 0, newPage);
    // Reindex page numbers
    const reindexed = updatedPages.map((p, i) => ({ ...p, pageNumber: i + 1 }));

    const updatedDoc = {
      ...activeDoc,
      pages: reindexed,
      pageCount: reindexed.length,
      updatedAt: new Date().toISOString(),
    };

    setActiveDoc(updatedDoc);
    setCurrentPageIndex(index + 1);

    try {
      await savePdfDocument(updatedDoc, activeDoc.blob);
      showToast('Page duplicated!', 'success');
    } catch (err) {
      console.error('Error duplicating page:', err);
    }
  };

  // Delete Page
  const handleDeletePage = async (index) => {
    if (!activeDoc || activeDoc.pages.length <= 1) {
      showToast('Cannot delete the only page in the document', 'warning');
      return;
    }
    const updatedPages = activeDoc.pages.filter((_, i) => i !== index);
    const reindexed = updatedPages.map((p, i) => ({ ...p, pageNumber: i + 1 }));

    const updatedDoc = {
      ...activeDoc,
      pages: reindexed,
      pageCount: reindexed.length,
      updatedAt: new Date().toISOString(),
    };

    const newIndex = Math.min(index, reindexed.length - 1);
    setActiveDoc(updatedDoc);
    setCurrentPageIndex(newIndex);
    setPageNotes(reindexed[newIndex]?.notes || '');

    try {
      await savePdfDocument(updatedDoc, activeDoc.blob);
      showToast('Page removed', 'info');
    } catch (err) {
      console.error('Error removing page:', err);
    }
  };

  // Drag and Drop Page Reordering handlers
  const handlePageDragStart = (e, index) => {
    setDraggedPageIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handlePageDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handlePageDrop = async (e, targetIndex) => {
    e.preventDefault();
    if (draggedPageIndex === null || draggedPageIndex === targetIndex || !activeDoc) return;

    const pagesCopy = [...activeDoc.pages];
    const [draggedPage] = pagesCopy.splice(draggedPageIndex, 1);
    pagesCopy.splice(targetIndex, 0, draggedPage);

    // Reindex numbers
    const reindexed = pagesCopy.map((p, i) => ({ ...p, pageNumber: i + 1 }));

    const updatedDoc = {
      ...activeDoc,
      pages: reindexed,
      updatedAt: new Date().toISOString(),
    };

    setActiveDoc(updatedDoc);
    setCurrentPageIndex(targetIndex);
    setDraggedPageIndex(null);

    try {
      await savePdfDocument(updatedDoc, activeDoc.blob);
      showToast(`Moved page ${draggedPageIndex + 1} to position ${targetIndex + 1}`, 'success');
    } catch (err) {
      console.error('Error reordering pages:', err);
    }
  };

  // Save current page notes
  const handleNotesChange = (text) => {
    setPageNotes(text);
    if (!activeDoc || !activeDoc.pages?.[currentPageIndex]) return;

    const updatedPages = activeDoc.pages.map((p, i) =>
      i === currentPageIndex ? { ...p, notes: text } : p
    );

    const updatedDoc = {
      ...activeDoc,
      pages: updatedPages,
      updatedAt: new Date().toISOString(),
    };

    setActiveDoc(updatedDoc);
    savePdfDocument(updatedDoc, activeDoc.blob).catch((err) => console.error('Auto-save notes error:', err));
  };

  // Global Dropzone File Upload
  const handleDropZoneDrop = (e) => {
    e.preventDefault();
    setIsDragOverDropZone(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === 'application/pdf') {
        handlePdfUpload(file);
      } else {
        handleAppendFileAsPage(file);
      }
    }
  };

  // Export Notes
  const handleExportNotes = () => {
    if (!activeDoc) return;
    const fullText = activeDoc.pages
      .map((p, i) => `====================\nPAGE ${i + 1}: ${p.title}\n====================\n\n${p.notes || '(No notes recorded)'}\n\n`)
      .join('\n');

    const blob = new Blob([fullText], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeDoc.title}_Notes.md`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Notes exported as Markdown!', 'success');
  };

  const activePage = activeDoc?.pages?.[currentPageIndex];

  return (
    <div className="space-y-6 min-h-[calc(100vh-8rem)]">
      {/* Hidden File Inputs */}
      <input
        type="file"
        ref={fileInputRef}
        accept="application/pdf"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && handlePdfUpload(e.target.files[0])}
      />
      <input
        type="file"
        ref={appendFileInputRef}
        accept="application/pdf,image/*"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && handleAppendFileAsPage(e.target.files[0])}
      />

      {/* Top Header & Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl leather-card" style={{ background: 'var(--neu-card-bg)', border: '1px solid var(--neu-border)' }}>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-[var(--neu-inset-bg)] border border-[var(--neu-border-subtle)] text-accent-primary shrink-0 shadow-inner">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-main tracking-tight">
                {activeDoc ? activeDoc.title : 'Notes & PDF Reader'}
              </h1>
              {activeDoc && (
                <span className="text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-md bg-black/20 text-accent-primary border border-[var(--neu-border-subtle)]">
                  {activeDoc.pages?.length || 0} Pages
                </span>
              )}
            </div>
            <p className="text-xs text-muted font-medium">
              Read PDFs, add note pages, take structured notes, and reorder pages via drag-and-drop.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowDocModal(true)}
            className="px-3.5 py-2 text-xs font-bold rounded-xl flex items-center gap-2 bg-[var(--neu-card-bg)] hover:bg-[var(--neu-hover-bg)] text-main transition-all cursor-pointer border border-[var(--neu-border)]"
            title="Create new notebook"
          >
            <Plus className="w-4 h-4 text-accent-primary" />
            <span>New Notebook</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 text-xs font-extrabold rounded-xl flex items-center gap-2 text-[var(--accent-btn-text)] shadow-md cursor-pointer transition-all hover:scale-102"
            style={{ background: 'var(--accent-btn-bg)' }}
          >
            <Upload className="w-4 h-4" />
            <span>Open PDF</span>
          </button>

          {activeDoc && (
            <button
              onClick={handleExportNotes}
              className="px-3.5 py-2 text-xs font-bold rounded-xl flex items-center gap-2 bg-[var(--neu-card-bg)] hover:bg-[var(--neu-hover-bg)] text-main transition-all cursor-pointer border border-[var(--neu-border)]"
              title="Export all page notes"
            >
              <Download className="w-4 h-4 text-accent-primary" />
              <span>Export Notes</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Workspace Area */}
      {!activeDoc ? (
        /* Empty State / Dropzone */
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragOverDropZone(true); }}
          onDragLeave={() => setIsDragOverDropZone(false)}
          onDrop={handleDropZoneDrop}
          className={`flex flex-col items-center justify-center p-12 text-center rounded-3xl border-2 border-dashed transition-all duration-300 min-h-[450px] ${
            isDragOverDropZone ? 'border-[var(--accent-orange)] bg-[var(--neu-hover-bg)] scale-[0.99]' : 'border-[var(--neu-border-subtle)] bg-[var(--neu-card-bg)]'
          }`}
        >
          <div className="w-20 h-20 rounded-full flex items-center justify-center bg-[var(--neu-inset-bg)] text-accent-primary mb-5 shadow-inner border border-[var(--neu-border-subtle)]">
            <FileUp className="w-10 h-10 animate-pulse" />
          </div>
          <h3 className="text-lg font-extrabold text-main mb-2">No PDF or Notebook Open</h3>
          <p className="text-xs text-muted max-w-md mb-6 leading-relaxed">
            Drag and drop a PDF file anywhere here to open it, or create a brand-new digital study notebook to start writing notes.
          </p>

          <div className="flex items-center gap-3">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-5 py-2.5 text-xs font-extrabold rounded-xl flex items-center gap-2 text-[var(--accent-btn-text)] shadow-md cursor-pointer transition-all hover:scale-105"
              style={{ background: 'var(--accent-btn-bg)' }}
            >
              <Upload className="w-4 h-4" />
              <span>Browse & Open PDF</span>
            </button>
            <button
              onClick={() => setShowDocModal(true)}
              className="px-5 py-2.5 text-xs font-bold rounded-xl flex items-center gap-2 bg-[var(--neu-card-bg)] text-main transition-all cursor-pointer border border-[var(--neu-border)] hover:bg-[var(--neu-hover-bg)]"
            >
              <Plus className="w-4 h-4 text-accent-primary" />
              <span>New Note Page</span>
            </button>
          </div>
        </div>
      ) : (
        /* Workspace Active View */
        <div className="space-y-4">
          {/* Top Document Switcher Bar & View Mode Control */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 rounded-xl bg-[var(--neu-card-bg)] border border-[var(--neu-border)]">
            {/* List of document tabs */}
            <div className="flex items-center gap-2 overflow-x-auto max-w-full pb-1 scrollbar-thin">
              {documents.map((doc) => (
                <button
                  key={doc.id}
                  onClick={() => openDocument(doc.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 cursor-pointer transition-all shrink-0 border ${
                    activeDoc.id === doc.id
                      ? 'bg-[var(--accent-orange)] text-white border-[var(--accent-orange)] shadow'
                      : 'bg-[var(--neu-inset-bg)] text-muted hover:text-main border-[var(--neu-border-subtle)]'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span className="truncate max-w-[120px]">{doc.title}</span>
                  <X
                    className="w-3 h-3 hover:text-red-400 opacity-60 hover:opacity-100 cursor-pointer"
                    onClick={(e) => handleDeleteDoc(doc.id, e)}
                  />
                </button>
              ))}
            </div>

            {/* View Mode Switcher */}
            <div className="flex items-center gap-1 bg-[var(--neu-inset-bg)] p-1 rounded-xl border border-[var(--neu-border-subtle)]">
              <button
                onClick={() => setViewMode('split')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  viewMode === 'split' ? 'bg-[var(--neu-card-bg)] text-main shadow-sm' : 'text-muted hover:text-main'
                }`}
                title="Split View (PDF + Notes)"
              >
                <Layers className="w-3.5 h-3.5 text-accent-primary" />
                <span className="hidden sm:inline">Split</span>
              </button>
              <button
                onClick={() => setViewMode('pdf')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  viewMode === 'pdf' ? 'bg-[var(--neu-card-bg)] text-main shadow-sm' : 'text-muted hover:text-main'
                }`}
                title="Full PDF View"
              >
                <Eye className="w-3.5 h-3.5 text-accent-primary" />
                <span className="hidden sm:inline">PDF</span>
              </button>
              <button
                onClick={() => setViewMode('notes')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  viewMode === 'notes' ? 'bg-[var(--neu-card-bg)] text-main shadow-sm' : 'text-muted hover:text-main'
                }`}
                title="Full Notes View"
              >
                <Edit3 className="w-3.5 h-3.5 text-accent-primary" />
                <span className="hidden sm:inline">Notes</span>
              </button>
            </div>
          </div>

          {/* PAGE MANAGEMENT TOOLBAR & DRAG AND DROP PAGE STRIP */}
          <div className="p-4 rounded-2xl bg-[var(--neu-card-bg)] border border-[var(--neu-border)] space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <GripVertical className="w-4 h-4 text-accent-primary" />
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-main">
                  Document Pages ({activeDoc.pages?.length || 0}) — Drag & Drop to Reorder
                </h4>
              </div>

              {/* Add Page Dropdown Button */}
              <div className="relative">
                <button
                  onClick={() => setShowAddMenu((prev) => !prev)}
                  className="px-3.5 py-1.5 text-xs font-extrabold rounded-xl flex items-center gap-1.5 text-[var(--accent-btn-text)] cursor-pointer shadow-sm hover:scale-102 transition-all"
                  style={{ background: 'var(--accent-btn-bg)' }}
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Page</span>
                </button>

                {showAddMenu && (
                  <div className="absolute right-0 top-10 z-50 w-64 rounded-2xl shadow-xl p-2 bg-[var(--neu-card-bg)] border border-[var(--neu-border)] space-y-1">
                    <p className="px-3 py-1.5 text-[10px] uppercase font-bold text-muted border-b border-[var(--neu-border-subtle)]">
                      Select Page Template
                    </p>
                    {NOTE_TEMPLATES.map((tmpl) => {
                      const Icon = tmpl.icon;
                      return (
                        <button
                          key={tmpl.id}
                          onClick={() => handleAddPage(tmpl.id)}
                          className="w-full flex items-start gap-2.5 p-2 rounded-xl hover:bg-[var(--neu-hover-bg)] text-left cursor-pointer transition-all group"
                        >
                          <Icon className="w-4 h-4 text-accent-primary mt-0.5 shrink-0" />
                          <div>
                            <div className="text-xs font-bold text-main group-hover:text-accent-primary">{tmpl.name}</div>
                            <div className="text-[10px] text-muted">{tmpl.description}</div>
                          </div>
                        </button>
                      );
                    })}

                    <div className="border-t border-[var(--neu-border-subtle)] pt-1 mt-1">
                      <button
                        onClick={() => appendFileInputRef.current?.click()}
                        className="w-full flex items-center gap-2.5 p-2 rounded-xl hover:bg-[var(--neu-hover-bg)] text-left cursor-pointer transition-all text-xs font-bold text-main"
                      >
                        <FileUp className="w-4 h-4 text-accent-primary shrink-0" />
                        <span>Append PDF / Image File...</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Interactive Thumbnail Strip with HTML5 Drag & Drop */}
            <div className="flex items-center gap-2.5 overflow-x-auto py-2 scrollbar-thin max-w-full">
              {activeDoc.pages?.map((page, index) => (
                <div
                  key={page.id}
                  draggable
                  onDragStart={(e) => handlePageDragStart(e, index)}
                  onDragOver={(e) => handlePageDragOver(e, index)}
                  onDrop={(e) => handlePageDrop(e, index)}
                  onClick={() => {
                    setCurrentPageIndex(index);
                    setPageNotes(page.notes || '');
                  }}
                  className={`group relative flex-shrink-0 w-32 p-2.5 rounded-xl cursor-pointer transition-all duration-200 border ${
                    currentPageIndex === index
                      ? 'bg-[var(--neu-inset-bg)] border-[var(--accent-orange)] shadow-md ring-2 ring-[var(--accent-orange)]/20'
                      : 'bg-[var(--neu-card-bg)] border-[var(--neu-border-subtle)] hover:border-[var(--accent-orange)]/50'
                  } ${draggedPageIndex === index ? 'opacity-40 scale-95 border-dashed' : ''}`}
                >
                  <div className="flex items-center justify-between text-[10px] font-bold text-muted mb-1.5">
                    <span className="flex items-center gap-1">
                      <GripVertical className="w-3 h-3 text-accent-primary cursor-grab" />
                      Page {index + 1}
                    </span>
                    <span className="uppercase text-[9px] px-1 rounded bg-black/10">{page.type || 'note'}</span>
                  </div>

                  <div className="h-16 rounded-lg bg-[var(--neu-inset-bg)] border border-[var(--neu-border-subtle)] flex flex-col items-center justify-center p-2 text-center overflow-hidden">
                    <FileText className="w-5 h-5 text-accent-primary mb-1 opacity-75" />
                    <span className="text-[10px] font-bold text-main line-clamp-1 w-full">{page.title}</span>
                  </div>

                  {/* Page Hover Action Buttons */}
                  <div className="absolute inset-x-0 bottom-1 flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-[var(--neu-card-bg)]/90 backdrop-blur-xs py-1 rounded-b-xl border-t border-[var(--neu-border-subtle)]">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDuplicatePage(index); }}
                      className="p-1 hover:text-accent-primary text-muted transition-colors cursor-pointer"
                      title="Duplicate Page"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDeletePage(index); }}
                      className="p-1 hover:text-red-400 text-muted transition-colors cursor-pointer"
                      title="Delete Page"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* MAIN SPLIT WORKSPACE: PDF VIEWER & NOTES EDITOR */}
          <div className={`grid gap-5 ${
            viewMode === 'split' ? 'grid-cols-1 lg:grid-cols-12' : 'grid-cols-1'
          }`}>
            {/* PDF / PAGE VIEWER PANE */}
            {(viewMode === 'split' || viewMode === 'pdf') && (
              <div className={`${
                viewMode === 'split' ? 'lg:col-span-7' : 'w-full'
              } flex flex-col rounded-2xl bg-[var(--neu-card-bg)] border border-[var(--neu-border)] overflow-hidden min-h-[520px]`}>
                {/* PDF Viewer Controls Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--neu-border-subtle)] bg-[var(--neu-inset-bg)]">
                  <div className="flex items-center gap-2 text-xs font-bold text-main">
                    <BookOpen className="w-4 h-4 text-accent-primary" />
                    <span>Page {currentPageIndex + 1} of {activeDoc.pages?.length || 1}</span>
                  </div>

                  {/* Page Controls & Zoom */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        const prev = Math.max(0, currentPageIndex - 1);
                        setCurrentPageIndex(prev);
                        setPageNotes(activeDoc.pages?.[prev]?.notes || '');
                      }}
                      disabled={currentPageIndex === 0}
                      className="p-1.5 rounded-lg bg-[var(--neu-card-bg)] hover:bg-[var(--neu-hover-bg)] text-main disabled:opacity-40 cursor-pointer border border-[var(--neu-border-subtle)]"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        const next = Math.min((activeDoc.pages?.length || 1) - 1, currentPageIndex + 1);
                        setCurrentPageIndex(next);
                        setPageNotes(activeDoc.pages?.[next]?.notes || '');
                      }}
                      disabled={currentPageIndex >= (activeDoc.pages?.length || 1) - 1}
                      className="p-1.5 rounded-lg bg-[var(--neu-card-bg)] hover:bg-[var(--neu-hover-bg)] text-main disabled:opacity-40 cursor-pointer border border-[var(--neu-border-subtle)]"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>

                    <div className="h-4 w-px bg-[var(--neu-border-subtle)] mx-1" />

                    <button
                      onClick={() => setZoomLevel((z) => Math.max(50, z - 15))}
                      className="p-1.5 rounded-lg bg-[var(--neu-card-bg)] text-main cursor-pointer hover:bg-[var(--neu-hover-bg)] border border-[var(--neu-border-subtle)]"
                      title="Zoom Out"
                    >
                      <ZoomOut className="w-4 h-4" />
                    </button>
                    <span className="text-[11px] font-bold text-muted w-10 text-center">{zoomLevel}%</span>
                    <button
                      onClick={() => setZoomLevel((z) => Math.min(200, z + 15))}
                      className="p-1.5 rounded-lg bg-[var(--neu-card-bg)] text-main cursor-pointer hover:bg-[var(--neu-hover-bg)] border border-[var(--neu-border-subtle)]"
                      title="Zoom In"
                    >
                      <ZoomIn className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setZoomLevel(100)}
                      className="p-1.5 rounded-lg bg-[var(--neu-card-bg)] text-main cursor-pointer hover:bg-[var(--neu-hover-bg)] border border-[var(--neu-border-subtle)]"
                      title="Reset Zoom"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* PDF Object / Document View Container */}
                <div ref={pdfContainerRef} className="flex-1 flex items-center justify-center p-4 overflow-auto bg-[#1a1c23] min-h-[460px]">
                  {activePdfUrl ? (
                    <object
                      data={`${activePdfUrl}#page=${currentPageIndex + 1}`}
                      type="application/pdf"
                      className="w-full h-full min-h-[460px] rounded-lg shadow-2xl transition-transform duration-200"
                      style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
                    >
                      <iframe
                        src={`${activePdfUrl}#page=${currentPageIndex + 1}`}
                        title="PDF Viewer"
                        className="w-full h-full min-h-[460px] rounded-lg"
                      />
                    </object>
                  ) : (
                    /* Fallback display for custom note pages */
                    <div className="w-full max-w-xl p-8 rounded-2xl bg-[var(--neu-card-bg)] border border-[var(--neu-border)] shadow-xl text-center space-y-4 my-auto">
                      <div className="w-14 h-14 rounded-full bg-[var(--neu-inset-bg)] text-accent-primary flex items-center justify-center mx-auto shadow-inner">
                        <Edit3 className="w-7 h-7" />
                      </div>
                      <h3 className="text-base font-extrabold text-main">
                        {activePage?.title || `Notebook Page ${currentPageIndex + 1}`}
                      </h3>
                      <p className="text-xs text-muted leading-relaxed max-w-md mx-auto">
                        This is a digital note page. You can write rich markdown study notes in the notes editor on the right side!
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* SIDE NOTES & ANNOTATIONS EDITOR PANE */}
            {(viewMode === 'split' || viewMode === 'notes') && (
              <div className={`${
                viewMode === 'split' ? 'lg:col-span-5' : 'w-full'
              } flex flex-col rounded-2xl bg-[var(--neu-card-bg)] border border-[var(--neu-border)] overflow-hidden min-h-[520px]`}>
                {/* Notes Header Bar */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--neu-border-subtle)] bg-[var(--neu-inset-bg)]">
                  <div className="flex items-center gap-2">
                    <Edit3 className="w-4 h-4 text-accent-primary" />
                    <span className="text-xs font-black uppercase tracking-wider text-main">
                      Notes for Page {currentPageIndex + 1}
                    </span>
                  </div>

                  <span className="text-[10px] text-muted font-semibold flex items-center gap-1">
                    <Save className="w-3 h-3 text-accent-primary" /> Auto-saved
                  </span>
                </div>

                {/* Textarea Notes Editor */}
                <div className="flex-1 p-4 flex flex-col space-y-3 bg-[var(--neu-card-bg)]">
                  <textarea
                    value={pageNotes}
                    onChange={(e) => handleNotesChange(e.target.value)}
                    placeholder="Write your study notes, summary points, formulas, or key concepts for this page..."
                    className="w-full flex-1 p-4 rounded-xl text-xs font-mono leading-relaxed bg-[var(--neu-inset-bg)] text-main border border-[var(--neu-border-subtle)] focus:outline-none focus:border-[var(--accent-orange)] resize-none shadow-inner"
                    style={{ minHeight: '380px' }}
                  />

                  {/* Formatting Hints & Toolbar */}
                  <div className="flex items-center justify-between text-[11px] text-muted pt-2 border-t border-[var(--neu-border-subtle)]">
                    <span className="font-semibold">Supports Markdown formatting</span>
                    <span className="text-[10px] font-mono">{pageNotes.length} chars</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* CREATE NEW NOTEBOOK MODAL */}
      {showDocModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs" onClick={() => setShowDocModal(false)}>
          <div className="w-full max-w-md p-6 rounded-2xl bg-[var(--neu-card-bg)] border border-[var(--neu-border)] shadow-2xl space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between pb-3 border-b border-[var(--neu-border-subtle)]">
              <h3 className="text-base font-extrabold text-main flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-accent-primary" />
                Create Study Notebook
              </h3>
              <button onClick={() => setShowDocModal(false)} className="text-muted hover:text-main">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="text-xs font-bold text-main block mb-1.5">Notebook Title</label>
              <input
                type="text"
                value={newDocTitle}
                onChange={(e) => setNewDocTitle(e.target.value)}
                placeholder="e.g. Data Structures & Algorithms Notes"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[var(--neu-inset-bg)] border border-[var(--neu-border-subtle)] text-main focus:outline-none focus:border-[var(--accent-orange)]"
                autoFocus
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowDocModal(false)}
                className="px-4 py-2 text-xs font-bold rounded-xl text-muted hover:text-main cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateNotebook}
                className="px-4 py-2 text-xs font-extrabold rounded-xl text-[var(--accent-btn-text)] cursor-pointer shadow-md"
                style={{ background: 'var(--accent-btn-bg)' }}
              >
                Create Notebook
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
