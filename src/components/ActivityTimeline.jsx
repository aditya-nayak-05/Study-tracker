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
  create: 'text-[#4a7c3f] bg-[#4a7c3f]/10',
  add: 'text-[#f2d894] bg-[#d8a442]/10',
  delete: 'text-[#8b3a3a] bg-[#8b3a3a]/10',
  status: 'text-[#d8a442] bg-[#d8a442]/10',
  study: 'text-[#d8a442] bg-[#d8a442]/10',
  import: 'text-[#d8a442] bg-[#d8a442]/10',
  profile: 'text-[#f2d894] bg-[#d8a442]/10',
  default: 'text-[#94a3b8] bg-[#18181f]',
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
    return <p className="text-[#94a3b8] text-sm text-center py-6">No recent activity</p>;
  }

  return (
    <div ref={containerRef} className="space-y-1">
      {visibleActivities.map((activity) => {
        const Icon = iconMap[activity.type] || iconMap.default;
        const colorClass = colorMap[activity.type] || colorMap.default;
        return (
          <div key={activity.id} className="activity-item flex items-start gap-3 py-2 px-3 rounded-lg hover:bg-[#18181f] transition-all">
            <div className={`w-7 h-7 rounded-lg ${colorClass} flex items-center justify-center shrink-0 mt-0.5`}>
              <Icon className="w-3.5 h-3.5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-[#f5f5f7] truncate">{activity.message}</p>
              <p className="text-[11px] text-[#94a3b8]">
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
