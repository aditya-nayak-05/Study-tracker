import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import gsap from 'gsap';
import { ChevronRight, ChevronDown, Folder, FolderOpen, FileText, CheckCircle2, Circle, Clock, Youtube, Play } from 'lucide-react';
import { calculateProgress } from '../utils/helpers';
import { extractVideoId } from '../utils/youtube';
import { useNavigate } from 'react-router-dom';

function TreeNode({ label, level = 0, children, progress, status, isToday, defaultOpen = false, onClick }) {
  const [open, setOpen] = useState(defaultOpen);
  const childRef = useRef(null);
  const hasChildren = children && children.length > 0;

  const toggle = useCallback(() => {
    if (!hasChildren) {
      onClick?.();
      return;
    }
    setOpen((o) => !o);
  }, [hasChildren, onClick]);

  useEffect(() => {
    if (childRef.current) {
      if (open) {
        gsap.fromTo(childRef.current, { height: 0, opacity: 0 }, { height: 'auto', opacity: 1, duration: 0.3, ease: 'power2.out' });
      }
    }
  }, [open]);

  const statusIcon = status === 'completed' ? (
    <CheckCircle2 className="w-3.5 h-3.5 text-neon-green shrink-0" />
  ) : status === 'in-progress' ? (
    <Clock className="w-3.5 h-3.5 text-neon-amber shrink-0" />
  ) : (
    <Circle className="w-3.5 h-3.5 text-dark-400 shrink-0" />
  );

  const folderIcon = hasChildren ? (
    open ? <FolderOpen className="w-4 h-4 text-brand-400 shrink-0" /> : <Folder className="w-4 h-4 text-dark-300 shrink-0" />
  ) : (
    <FileText className="w-4 h-4 text-dark-400 shrink-0" />
  );

  return (
    <div>
      <button
        onClick={toggle}
        className={`w-full flex items-center gap-2 py-1.5 px-2 rounded-lg hover:bg-glass-hover transition-all text-left group cursor-pointer ${isToday ? 'bg-brand-500/10 border border-brand-500/20' : ''}`}
        style={{ paddingLeft: level * 20 + 8 }}
      >
        {hasChildren ? (
          open ? <ChevronDown className="w-3.5 h-3.5 text-dark-400 shrink-0" /> : <ChevronRight className="w-3.5 h-3.5 text-dark-400 shrink-0" />
        ) : (
          <span className="w-3.5 shrink-0" />
        )}
        {folderIcon}
        <span className={`text-sm flex-1 truncate ${status === 'completed' ? 'text-dark-300 line-through' : 'text-dark-100'}`}>
          {label}
        </span>
        {progress !== undefined && progress !== null && (
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-16 h-1 bg-dark-700 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-brand-500 to-accent-500 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-[10px] font-mono text-dark-400 w-8 text-right">{progress}%</span>
          </div>
        )}
        {!hasChildren && statusIcon}
      </button>
      {hasChildren && open && (
        <div ref={childRef} className="overflow-hidden">
          {children}
        </div>
      )}
    </div>
  );
}

const TreeView = React.memo(function TreeView({ plan, onTaskClick }) {
  const containerRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (containerRef.current) {
      const nodes = containerRef.current.querySelectorAll(':scope > div');
      gsap.fromTo(nodes, { x: -15, opacity: 0 }, { x: 0, opacity: 1, duration: 0.25, stagger: 0.03, ease: 'power2.out' });
    }
  }, [plan?.id]);

  if (!plan || !plan.months) return null;

  const getMonthProgress = (month) => {
    let total = 0, completed = 0;
    month.weeks?.forEach((w) => w.days?.forEach((d) => d.tasks?.forEach((t) => { total++; if (t.status === 'completed') completed++; })));
    return calculateProgress(completed, total);
  };

  const getWeekProgress = (week) => {
    let total = 0, completed = 0;
    week.days?.forEach((d) => d.tasks?.forEach((t) => { total++; if (t.status === 'completed') completed++; }));
    return calculateProgress(completed, total);
  };

  const getDayProgress = (day) => {
    const total = day.tasks?.length || 0;
    const completed = day.tasks?.filter((t) => t.status === 'completed').length || 0;
    return calculateProgress(completed, total);
  };

  const getDayStatus = (day) => {
    if (!day.tasks || day.tasks.length === 0) return 'not-started';
    if (day.tasks.every((t) => t.status === 'completed')) return 'completed';
    if (day.tasks.some((t) => t.status !== 'not-started')) return 'in-progress';
    return 'not-started';
  };

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div ref={containerRef} className="space-y-0.5">
      {plan.months.map((month) => (
        <TreeNode key={month.id} label={month.name} level={0} progress={getMonthProgress(month)} defaultOpen>
          {month.weeks?.map((week) => (
            <TreeNode key={week.id} label={week.name} level={1} progress={getWeekProgress(week)}>
              {week.days?.map((day) => (
                <TreeNode key={day.id} label={`${day.name}${day.date ? ' — ' + day.date : ''}`} level={2} progress={getDayProgress(day)} status={getDayStatus(day)} isToday={day.date === todayStr}>
                  {day.tasks?.map((task) => {
                    const hasVideo = task.youtubeUrl && extractVideoId(task.youtubeUrl);
                    return (
                      <div key={task.id} className="flex items-center gap-1">
                        <div className="flex-1">
                          <TreeNode label={task.title} level={3} status={task.status} onClick={() => onTaskClick?.(task, day)} />
                        </div>
                        {hasVideo && (
                          <button
                            onClick={(e) => { e.stopPropagation(); navigate(`/learn/${plan.id}/${task.id}`); }}
                            className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-medium cursor-pointer shrink-0"
                            style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171' }}
                          >
                            <Play className="w-2.5 h-2.5" /> Watch
                          </button>
                        )}
                      </div>
                    );
                  })}
                </TreeNode>
              ))}
            </TreeNode>
          ))}
        </TreeNode>
      ))}
    </div>
  );
});

export default TreeView;
