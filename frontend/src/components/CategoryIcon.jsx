import React from 'react';
import { Droplets, Zap, Compass, HelpCircle } from 'lucide-react';

export const CategoryIcon = ({ category, className = 'h-5 w-5', showLabel = false }) => {
  const cat = category || 'General';

  const config = {
    Road: {
      icon: Compass,
      bg: 'bg-slate-100 text-slate-700 border-slate-200',
      label: 'Road Infrastructure',
    },
    Water: {
      icon: Droplets,
      bg: 'bg-cyan-100 text-cyan-700 border-cyan-200',
      label: 'Water & Sanitation',
    },
    Electricity: {
      icon: Zap,
      bg: 'bg-amber-100 text-amber-700 border-amber-200',
      label: 'Power & Electricity',
    },
  }[cat] || {
    icon: HelpCircle,
    bg: 'bg-gray-100 text-gray-700 border-gray-200',
    label: cat,
  };

  const Icon = config.icon;

  if (showLabel) {
    return (
      <div className="inline-flex items-center gap-2">
        <span className={`p-1.5 rounded-lg border ${config.bg} inline-flex items-center justify-center`}>
          <Icon className={className} />
        </span>
        <span className="font-medium text-slate-800 text-sm">{cat}</span>
      </div>
    );
  }

  return (
    <span className={`p-1.5 rounded-lg border ${config.bg} inline-flex items-center justify-center`}>
      <Icon className={className} />
    </span>
  );
};
