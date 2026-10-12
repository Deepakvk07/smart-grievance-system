import React from 'react';
import { AlertTriangle, AlertCircle, CheckCircle2 } from 'lucide-react';

export const PriorityBadge = ({ priority, size = 'sm' }) => {
  const p = priority || 'Low';
  
  const config = {
    High: {
      bg: 'bg-red-50 text-red-700 border-red-200 ring-red-500/20',
      dot: 'bg-red-600',
      icon: AlertTriangle,
      label: 'High Priority',
    },
    Medium: {
      bg: 'bg-amber-50 text-amber-700 border-amber-200 ring-amber-500/20',
      dot: 'bg-amber-600',
      icon: AlertCircle,
      label: 'Medium Priority',
    },
    Low: {
      bg: 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-500/20',
      dot: 'bg-emerald-600',
      icon: CheckCircle2,
      label: 'Low Priority',
    },
  }[p] || {
    bg: 'bg-slate-50 text-slate-700 border-slate-200',
    dot: 'bg-slate-500',
    icon: CheckCircle2,
    label: p,
  };

  const Icon = config.icon;

  const sizeClasses = size === 'lg' 
    ? 'px-3 py-1.5 text-sm font-semibold' 
    : 'px-2.5 py-0.5 text-xs font-medium';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border shadow-xs ${config.bg} ${sizeClasses}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${config.dot} ${p === 'High' ? 'animate-pulse' : ''}`} />
      <Icon className={size === 'lg' ? 'h-4 w-4' : 'h-3.5 w-3.5'} />
      <span>{config.label}</span>
    </span>
  );
};
