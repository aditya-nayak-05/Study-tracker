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
  create: 'text-[#38a169] bg-[#38a169]/15',
  add: 'text-[#ed8936] bg-[#ed8936]/15',
  delete: 'text-[#e53e3e] bg-[#e53e3e]/15',
  status: 'text-[#ed8936] bg-[#ed8936]/15',
  study: 'text-[#ed8936] bg-[#ed8936]/15',
  import: 'text-[#38a169] bg-[#38a169]/15',
  profile: 'text-[#ed8936] bg-[#ed8936]/15',
  default: 'text-[#718096] bg-[#cbd5e0]/30',
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
    return <p className="text-[#718096] text-sm text-center py-6">No recent activity</p>;
  }

  return (
    <div ref={containerRef} className="space-y-1">
      {visibleActivities.map((activity) => {
        const Icon = iconMap[activity.type] || iconMap.default;
        const colorClass = colorMap[activity.type] || colorMap.default;
        return (
          <div key={activity.id} className="activity-item flex items-start gap-3 py-2 px-3 rounded-lg hover:bg-[#ebf0f7] transition-all">
            <div className={`w-7 h-7 rounded-lg ${colorClass} flex items-center justify-center shrink-0 mt-0.5 shadow-sm`}>
              <Icon className="w-3.5 h-3.5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-[#1a202c] truncate">{activity.message}</p>
              <p className="text-[11px] text-[#718096]">
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
