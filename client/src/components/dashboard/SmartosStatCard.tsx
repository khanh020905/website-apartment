import React from 'react';

interface SmartosStatCardProps {
  icon: React.ReactNode;
  iconBg: string;
  value: string | number;
  subtitle: string;
  badge?: {
    text: string;
    type?: 'emerald' | 'amber' | 'blue' | 'orange' | 'purple';
  };
}

const BADGE_COLORS = {
  emerald: 'text-emerald-600 bg-emerald-50',
  amber: 'text-amber-600 bg-amber-50',
  blue: 'text-blue-600 bg-blue-50',
  orange: 'text-orange-600 bg-orange-50',
  purple: 'text-purple-600 bg-purple-50',
};

export const SmartosStatCard = ({ icon, iconBg, value, subtitle, badge }: SmartosStatCardProps) => {
  return (
    <div className="bg-white rounded-xl border border-slate-100 p-5 flex items-center gap-4 hover:shadow-md transition-shadow group">
      <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110 ${iconBg}`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-slate-900 tracking-tight">{value}</span>
          {badge && (
            <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${BADGE_COLORS[badge.type || 'emerald']}`}>
              {badge.text}
            </span>
          )}
        </div>
        <p className="text-[13px] font-semibold text-slate-400 mt-0.5 truncate uppercase tracking-tighter italic">{subtitle}</p>
      </div>
    </div>
  );
};
