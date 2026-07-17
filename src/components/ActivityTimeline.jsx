import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { formatDistanceToNow } from '../utils/helpers';
import {
  Plus, Edit, Trash2, CheckCircle2, Clock, FileUp, FileDown,
  User, Target, BookOpen, Calendar, Zap,
} from 'lucide-react';

const iconMap = {
  create: Plus,
  add: Plus,
  edit: Edit,
  delete: Trash2,
  status: CheckCircle2,
  study: Clock,
  import: FileUp,
  export: FileDown,
  profile: User,
  goal: Target,
  'date-change': Calendar,
  duplicate: BookOpen,
  default: Zap,
};

const colorMap = {
  create: 'text-neon-green bg-neon-green/10',
  add: 'text-brand-400 bg-brand-500/10',
  delete: 'text-neon-rose bg-neon-rose/10',
  status: 'text-neon-amber bg-neon-amber/10',
  study: 'text-neon-blue bg-neon-blue/10',
  import: 'text-accent-400 bg-accent-500/10',
  profile: 'text-brand-400 bg-brand-500/10',
  default: 'text-dark-300 bg-dark-700',
};

const ActivityTimeline = React.memo(function ActivityTimeline({ activities = [], maxItems = 15 }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      const items = containerRef.current.querySelectorAll('.activity-item');
      gsap.fromTo(items, { x: -15, opacity: 0 }, { x: 0, opacity: 1, duration: 0.3, stagger: 0.04, ease: 'power2.out' });
    }
  }, [activities.length]);

  const visibleActivities = activities.slice(0, maxItems);

  if (visibleActivities.length === 0) {
    return <p className="text-dark-400 text-sm text-center py-6">No recent activity</p>;
  }

  return (
    <div ref={containerRef} className="space-y-1">
      {visibleActivities.map((activity) => {
        const Icon = iconMap[activity.type] || iconMap.default;
        const colorClass = colorMap[activity.type] || colorMap.default;
        return (
          <div key={activity.id} className="activity-item flex items-start gap-3 py-2 px-3 rounded-lg hover:bg-glass-hover transition-all">
            <div className={`w-7 h-7 rounded-lg ${colorClass} flex items-center justify-center shrink-0 mt-0.5`}>
              <Icon className="w-3.5 h-3.5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-dark-100 truncate">{activity.message}</p>
              <p className="text-[11px] text-dark-400">
                {activity.timestamp ? formatDistanceToNow(activity.timestamp) : ''}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
});

export default ActivityTimeline;
