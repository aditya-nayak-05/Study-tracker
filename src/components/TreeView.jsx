import React, { useState, useCallback, useMemo } from 'react';
import { ChevronRight, ChevronDown, Folder, FolderOpen, FileText, CheckCircle2, Circle, Clock, Play } from 'lucide-react';
import { extractVideoId } from '../utils/youtube';
import { useNavigate } from 'react-router-dom';
import { useStudy } from '../context/StudyContext';

/* ── Reusable bulk‐toggle button (Memoized) ── */
const BulkToggleBtn = React.memo(function BulkToggleBtn({ allCompleted, total, onToggle }) {
  if (total === 0) return null;
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onToggle(); }}
      title={allCompleted ? 'Mark all as not started' : 'Mark all as completed'}
      className="shrink-0 cursor-pointer transition-transform hover:scale-110 active:scale-95 p-0.5"
    >
      {allCompleted ? (
        <CheckCircle2 className="w-4 h-4 text-[#38a169] drop-shadow-sm" />
      ) : (
        <Circle className="w-4 h-4 text-muted hover:text-[#38a169] transition-colors" />
      )}
    </button>
  );
});

/* ── Hardware-Accelerated Smooth Tree Node (Memoized) ── */
const TreeNode = React.memo(function TreeNode({ label, level = 0, children, progress, status, isToday, defaultOpen = false, onClick, toggleBtn }) {
  const [open, setOpen] = useState(defaultOpen);
  const hasChildren = Boolean(children);

  const toggle = useCallback(() => {
    if (!hasChildren) {
      onClick?.();
      return;
    }
    setOpen((o) => !o);
  }, [hasChildren, onClick]);

  const handleRowClick = useCallback((e) => {
    // Prevent double toggle if clicking an interactive inner button
    if (e.target.closest('button') && !e.target.closest('.tree-node-click-target')) {
      return;
    }
    toggle();
  }, [toggle]);

  const statusIcon = status === 'completed' ? (
    <CheckCircle2 key="done" className="w-3.5 h-3.5 text-[#38a169] shrink-0 state-morph-icon" />
  ) : status === 'in-progress' ? (
    <Clock key="prog" className="w-3.5 h-3.5 text-accent-primary shrink-0 state-morph-icon" />
  ) : (
    <Circle key="todo" className="w-3.5 h-3.5 text-muted shrink-0 state-morph-icon" />
  );

  return (
    <div className="relative select-none">
      <div
        onClick={handleRowClick}
        className={`w-full flex items-center gap-2 py-1.5 px-2 rounded-lg hover:bg-[var(--neu-hover-bg)] active:scale-[0.995] transition-all duration-150 text-left group cursor-pointer ${
          isToday ? 'bg-[var(--accent-orange)]/15 border border-[var(--accent-orange)]/30 shadow-sm' : ''
        }`}
        style={{ paddingLeft: level * 20 + 8 }}
      >
        {toggleBtn && <span className="shrink-0">{toggleBtn}</span>}

        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); toggle(); }}
          className="tree-node-click-target flex items-center gap-2 flex-1 min-w-0 cursor-pointer text-left focus:outline-none"
        >
          {hasChildren ? (
            <ChevronRight
              className={`w-3.5 h-3.5 shrink-0 transition-transform duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                open ? 'rotate-90 text-accent-primary' : 'text-muted rotate-0 group-hover:text-main'
              }`}
            />
          ) : (
            <span className="w-3.5 shrink-0" />
          )}

          {/* Animated Folder / Document Icon */}
          <span className="shrink-0 transition-transform duration-200 ease-out group-hover:scale-110">
            {hasChildren ? (
              open ? (
                <FolderOpen className="w-4 h-4 text-accent-primary transition-colors duration-150" />
              ) : (
                <Folder className="w-4 h-4 text-muted group-hover:text-main transition-colors duration-150" />
              )
            ) : (
              <FileText className="w-4 h-4 text-muted group-hover:text-main transition-colors duration-150" />
            )}
          </span>

          <span
            className={`text-sm flex-1 truncate transition-colors duration-150 ${
              status === 'completed'
                ? 'text-muted line-through opacity-75'
                : open && hasChildren
                ? 'text-main font-medium'
                : 'text-main'
            }`}
          >
            {label}
          </span>
        </button>

        {progress !== undefined && progress !== null && (
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-16 h-1.5 bg-[var(--neu-border-subtle)] rounded-full overflow-hidden shadow-inner">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#ed8936] to-[#f6ad55] transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-[10px] font-mono text-muted w-8 text-right">{progress}%</span>
          </div>
        )}
        {!hasChildren && statusIcon}
      </div>

      {/* ⚡ High-Speed 60-120fps Hardware-Accelerated Accordion with Physics Slide & Fade */}
      {hasChildren && (
        <div className={`tree-grid-accordion ${open ? 'tree-open' : 'tree-closed'}`}>
          <div className="tree-content-inner">
            <div className={`tree-content-glide relative ${open ? 'tree-open' : 'tree-closed'}`}>
              {/* Subtle hierarchy connector guide line */}
              {open && level >= 0 && (
                <div
                  className="absolute top-0 bottom-2 w-px bg-gradient-to-b from-[var(--neu-border-subtle)] via-[var(--neu-border-subtle)]/40 to-transparent pointer-events-none"
                  style={{ left: level * 20 + 15 }}
                />
              )}
              {children}
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

const TreeView = React.memo(function TreeView({ plan, onTaskClick, onAddMonth }) {
  const navigate = useNavigate();
  const { dispatch } = useStudy();

  // ── Ultra-Fast Single-Pass Statistics Precomputation O(N) ──
  const statsMap = useMemo(() => {
    const map = new Map();
    if (!plan?.months) return map;

    (plan.months || []).forEach((m) => {
      let mTotal = 0, mCompleted = 0;
      (m.weeks || []).forEach((w) => {
        let wTotal = 0, wCompleted = 0;
        (w.days || []).forEach((d) => {
          let dTotal = 0, dCompleted = 0;
          (d.tasks || []).forEach((t) => {
            dTotal++;
            if (t.status === 'completed') dCompleted++;
          });
          const dProg = dTotal === 0 ? 0 : Math.round((dCompleted / dTotal) * 100);
          const dStatus = dTotal === 0 ? 'not-started' : dCompleted === dTotal ? 'completed' : dCompleted > 0 ? 'in-progress' : 'not-started';
          map.set(d.id, { total: dTotal, completed: dCompleted, progress: dProg, status: dStatus, allDone: dTotal > 0 && dCompleted === dTotal });
          wTotal += dTotal;
          wCompleted += dCompleted;
        });
        const wProg = wTotal === 0 ? 0 : Math.round((wCompleted / wTotal) * 100);
        map.set(w.id, { total: wTotal, completed: wCompleted, progress: wProg, allDone: wTotal > 0 && wCompleted === wTotal });
        mTotal += wTotal;
        mCompleted += wCompleted;
      });
      const mProg = mTotal === 0 ? 0 : Math.round((mCompleted / mTotal) * 100);
      map.set(m.id, { total: mTotal, completed: mCompleted, progress: mProg, allDone: mTotal > 0 && mCompleted === mTotal });
    });
    return map;
  }, [plan]);

  const toggleScope = useCallback((scope, scopeId) => {
    const currentStats = statsMap.get(scopeId);
    const allDone = currentStats ? currentStats.allDone : false;
    dispatch({
      type: 'BULK_SET_TASKS_STATUS',
      payload: { planId: plan.id, scope, scopeId, status: allDone ? 'not-started' : 'completed' },
    });
  }, [dispatch, plan?.id, statsMap]);

  if (!plan || !plan.months) return null;

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-0.5">
      {plan.months.map((month) => {
        const mStats = statsMap.get(month.id) || { total: 0, progress: 0, allDone: false };
        return (
          <TreeNode
            key={month.id}
            label={month.name}
            level={0}
            progress={mStats.progress}
            defaultOpen
            toggleBtn={
              <BulkToggleBtn
                allCompleted={mStats.allDone}
                total={mStats.total}
                onToggle={() => toggleScope('month', month.id)}
              />
            }
          >
            {month.weeks?.map((week) => {
              const wStats = statsMap.get(week.id) || { total: 0, progress: 0, allDone: false };
              return (
                <TreeNode
                  key={week.id}
                  label={week.name}
                  level={1}
                  progress={wStats.progress}
                  toggleBtn={
                    <BulkToggleBtn
                      allCompleted={wStats.allDone}
                      total={wStats.total}
                      onToggle={() => toggleScope('week', week.id)}
                    />
                  }
                >
                  {week.days?.map((day) => {
                    const dStats = statsMap.get(day.id) || { total: 0, progress: 0, status: 'not-started', allDone: false };
                    return (
                      <TreeNode
                        key={day.id}
                        label={day.name}
                        level={2}
                        progress={dStats.progress}
                        status={dStats.status}
                        isToday={day.date === todayStr}
                        toggleBtn={
                          <BulkToggleBtn
                            allCompleted={dStats.allDone}
                            total={dStats.total}
                            onToggle={() => toggleScope('day', day.id)}
                          />
                        }
                      >
                        {/* Rich Structured Day Header Cards */}
                        {(day.objective || day.dsa || day.projectTask || day.revision) && (
                          <div className="ml-10 my-2 p-3.5 rounded-xl border border-[var(--neu-border)] bg-[var(--neu-card-bg)] shadow-sm space-y-2 text-left transition-all duration-200 hover:border-accent-primary/40 hover:shadow-md">
                            {day.objective && (
                              <p className="text-xs text-main font-medium leading-relaxed">
                                🎯 <span className="font-semibold text-accent-primary">Objective:</span> {day.objective}
                              </p>
                            )}
                            <div className="flex flex-wrap gap-1.5 pt-1">
                              {day.dsa && (
                                <span className="text-[10px] px-2.5 py-1 rounded-lg font-semibold bg-[#6366f1]/15 text-[#818cf8] border border-[#6366f1]/30 transition-all duration-150 hover:scale-105 hover:bg-[#6366f1]/25">
                                  🧮 DSA: {day.dsa}
                                </span>
                              )}
                              {day.projectTask && (
                                <span className="text-[10px] px-2.5 py-1 rounded-lg font-semibold bg-[#ed8936]/15 text-[#ed8936] border border-[#ed8936]/30 transition-all duration-150 hover:scale-105 hover:bg-[#ed8936]/25">
                                  🚀 Project: {day.projectTask}
                                </span>
                              )}
                              {day.revision && (
                                <span className="text-[10px] px-2.5 py-1 rounded-lg font-semibold bg-[#38a169]/15 text-[#38a169] border border-[#38a169]/30 transition-all duration-150 hover:scale-105 hover:bg-[#38a169]/25">
                                  🔁 Revision: {day.revision}
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                        {day.tasks?.map((task) => {
                          const hasVideo = task.youtubeUrl && extractVideoId(task.youtubeUrl);
                          return (
                            <div key={task.id} className="flex items-center gap-1 group/task">
                              <div className="flex-1">
                                <TreeNode label={task.title} level={3} status={task.status} onClick={() => onTaskClick?.(task, day)} />
                              </div>
                              {hasVideo && (
                                <button
                                  onClick={(e) => { e.stopPropagation(); navigate(`/learn/${plan.id}/${task.id}`); }}
                                  className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-medium cursor-pointer shrink-0 transition-transform duration-150 hover:scale-105 active:scale-95"
                                  style={{ background: 'var(--neu-card-bg)', color: 'var(--accent-orange)', border: '1px solid var(--neu-border)', boxShadow: '2px 2px 5px rgba(163, 177, 198, 0.4), -2px -2px 5px rgba(255, 255, 255, 0.8)' }}
                                >
                                  <Play className="w-2.5 h-2.5" /> Watch
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </TreeNode>
                    );
                  })}
                </TreeNode>
              );
            })}
          </TreeNode>
        );
      })}
      {onAddMonth && (
        <div className="pt-4 px-2">
          <button
            onClick={onAddMonth}
            className="w-full py-2.5 px-4 text-xs font-semibold rounded-xl border border-dashed border-[var(--neu-border)] hover:border-[var(--accent-orange)] text-muted hover:text-main flex items-center justify-center gap-2 cursor-pointer transition-all"
            style={{ background: 'var(--neu-card-bg)' }}
          >
            <Folder className="w-3.5 h-3.5" /> + Add New Month to this Roadmap
          </button>
        </div>
      )}
    </div>
  );
});

export default TreeView;
