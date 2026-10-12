import React from 'react';
import { Clock, Search, UserCheck, Wrench, CheckCircle, XCircle } from 'lucide-react';

export const StatusBadge = ({ status }) => {
  const s = status || 'Submitted';

  const config = {
    Submitted: {
      bg: 'bg-blue-50 text-blue-700 border-blue-200',
      icon: Clock,
    },
    'Under Review': {
      bg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      icon: Search,
    },
    Assigned: {
      bg: 'bg-cyan-50 text-cyan-700 border-cyan-200',
      icon: UserCheck,
    },
    'In Progress': {
      bg: 'bg-amber-50 text-amber-700 border-amber-200',
      icon: Wrench,
    },
    Resolved: {
      bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      icon: CheckCircle,
    },
    Rejected: {
      bg: 'bg-rose-50 text-rose-700 border-rose-200',
      icon: XCircle,
    },
  }[s] || {
    bg: 'bg-slate-50 text-slate-700 border-slate-200',
    icon: Clock,
  };

  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.bg}`}
    >
      <Icon className="h-3 w-3" />
      <span>{s}</span>
    </span>
  );
};
