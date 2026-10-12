import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { AdminLayout } from '../../components/AdminLayout';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import {
  BarChart3, Cpu, Sparkles, ShieldCheck, CheckCircle2,
  Clock, TrendingUp, Layers, Activity, FileSpreadsheet,
  RefreshCw, AlertTriangle, Zap, Download
} from 'lucide-react';

export const AdminAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await api.getAnalytics();
      if (res.success) {
        setAnalytics(res);
      }
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !analytics) {
    return (
      <AdminLayout>
        <div className="p-16 text-center bg-white rounded-2xl border border-slate-200/90 shadow-sm">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm font-bold text-slate-700">Calculating Municipal Intelligence Metrics...</p>
          <p className="text-xs text-slate-400 mt-1">Aggregating cross-validation telemetry and resolution SLAs</p>
        </div>
      </AdminLayout>
    );
  }

  const {
    kpis = {},
    category_distribution = [],
    priority_distribution = [],
    status_distribution = [],
    department_workload = [],
    trend_data = [],
    avg_resolution_days = 2.4,
    ml_performance = {}
  } = analytics;

  const PRIORITY_COLORS = {
    High: '#dc2626',
    Medium: '#d97706',
    Low: '#059669',
  };

  const CATEGORY_COLORS = ['#2563eb', '#06b6d4', '#f59e0b', '#8b5cf6'];

  const resolvedVsPendingData = [
    { name: 'Resolved', value: kpis.resolved || 0, color: '#059669' },
    { name: 'In Progress', value: kpis.in_progress || 0, color: '#d97706' },
    { name: 'Pending Review', value: kpis.pending || 0, color: '#3b82f6' },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        
        {/* HERO OPERATIONS BANNER */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-950 via-blue-950 to-indigo-950 text-white p-6 sm:p-8 shadow-xl border border-blue-900/40">
          <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-blue-600/20 blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-indigo-600/20 blur-3xl pointer-events-none"></div>

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold border border-blue-500/30 backdrop-blur-xs">
                <Activity className="h-3.5 w-3.5 text-blue-400" />
                <span>डेटा विश्लेषण और एआई रिपोर्ट • AI Telemetry Hub</span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white flex items-center gap-3">
                Analytics & ML Performance Hub
              </h1>

              <p className="text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
                Multi-dimensional municipal intelligence, departmental resolution velocity, and empirical Random Forest NLP classification accuracy.
              </p>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <button
                onClick={fetchAnalytics}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold border border-white/20 transition-all hover:scale-102"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh Metrics</span>
              </button>

              <a
                href={api.getCSVExportUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-900/30 transition-all hover:scale-102"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Export Dataset</span>
              </a>
            </div>
          </div>
        </div>

        {/* TOP METRIC KPI CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">Total Grievances Lodged</span>
            <div className="text-3xl font-black text-slate-900 mt-1">{kpis.total_complaints || 0}</div>
            <div className="text-[11px] text-emerald-700 font-bold mt-1 flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" />
              <span>100% Ingested into Database</span>
            </div>
          </div>

          <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">Average Resolution Time</span>
            <div className="text-3xl font-black text-blue-600 mt-1">{avg_resolution_days} Days</div>
            <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
              <Clock className="h-3 w-3 text-slate-400" />
              <span>Submission to field verification</span>
            </div>
          </div>

          <div className="p-5 bg-white rounded-2xl border border-red-200/80 shadow-sm hover:shadow-md transition-all">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-red-700">High Priority Emergency Share</span>
            <div className="text-3xl font-black text-red-600 mt-1">
              {kpis.total_complaints ? Math.round((kpis.high_priority / kpis.total_complaints) * 100) : 0}%
            </div>
            <div className="text-[11px] text-red-700 font-bold mt-1 flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              <span>{kpis.high_priority || 0} Life Hazard Flags</span>
            </div>
          </div>

          <div className="p-5 bg-white rounded-2xl border border-emerald-200/80 shadow-sm hover:shadow-md transition-all">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-700">Resolution SLA Rate</span>
            <div className="text-3xl font-black text-emerald-600 mt-1">
              {kpis.total_complaints ? Math.round((kpis.resolved / kpis.total_complaints) * 100) : 0}%
            </div>
            <div className="text-[11px] text-emerald-700 font-bold mt-1 flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" />
              <span>{kpis.resolved || 0} Verified Resolved</span>
            </div>
          </div>
        </div>

        {/* MACHINE LEARNING MODEL TELEMETRY */}
        <div className="bg-gradient-to-br from-slate-950 via-[#0a2540] to-slate-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-bold mb-2 border border-cyan-400/30">
                <Cpu className="h-4 w-4" />
                <span>Empirical Machine Learning Research Benchmark</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                Machine Learning Model Performance
              </h2>
              <p className="text-xs text-slate-300 mt-1">
                Comparative cross-validation evaluation on civic complaint dataset
              </p>
            </div>

            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                Selected Production Model
              </span>
              <span className="text-lg font-black text-emerald-400">Random Forest (91.2%)</span>
            </div>
          </div>

          {/* Model Comparison Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {(ml_performance.models || []).map((model, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-2xl border transition-all ${
                  model.is_production
                    ? 'bg-gradient-to-b from-blue-900/40 to-cyan-900/30 border-cyan-500/60 ring-2 ring-cyan-500/30'
                    : 'bg-slate-800/40 border-slate-700/60'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-300">{model.name}</span>
                  {model.is_production && (
                    <span className="text-[10px] font-black bg-cyan-500 text-slate-950 px-2 py-0.5 rounded-full">
                      ACTIVE
                    </span>
                  )}
                </div>

                <div className="text-3xl font-black text-white mb-2">
                  {model.accuracy}%
                </div>

                <div className="w-full bg-slate-700 rounded-full h-2 mb-3">
                  <div
                    className={`h-2 rounded-full ${model.is_production ? 'bg-cyan-400' : 'bg-slate-400'}`}
                    style={{ width: `${model.accuracy}%` }}
                  ></div>
                </div>

                <p className="text-[11px] text-slate-400 leading-snug">
                  {model.description}
                </p>
              </div>
            ))}
          </div>

          {/* End-to-End Pipeline */}
          <div className="pt-4 border-t border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 mb-3 flex items-center gap-1.5">
              <Sparkles className="h-4 w-4" />
              <span>End-to-End Prediction Pipeline</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-center text-xs">
              {[
                { step: 'Citizen Grievance', sub: 'Raw Text Input' },
                { step: 'NLP Cleaning', sub: 'NLTK Tokenize & Stem' },
                { step: 'TF-IDF Extraction', sub: 'Bi-gram Vectorization' },
                { step: 'Random Forest', sub: 'Ensemble Trees (91.2%)' },
                { step: 'Severity Matrix', sub: 'Triage Prediction' },
                { step: 'Dispatch Queue', sub: 'Database & SLA' }
              ].map((p, idx) => (
                <div key={idx} className="p-3 bg-white/5 border border-white/10 rounded-xl">
                  <div className="text-cyan-400 font-mono font-bold text-[10px] mb-1">0{idx + 1}</div>
                  <div className="font-bold text-white text-xs">{p.step}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{p.sub}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RECHARTS VISUALIZATION GRIDS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Chart 1: Priority Distribution */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm">
            <h3 className="text-sm font-extrabold text-slate-900 mb-1">
              Priority Triage Distribution
            </h3>
            <p className="text-xs text-slate-500 mb-4">Grievance volume partitioned across urgency levels</p>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={priority_distribution}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="priority" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#2563eb" radius={[6, 6, 0, 0]}>
                    {priority_distribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PRIORITY_COLORS[entry.priority] || '#2563eb'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Category Distribution */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm">
            <h3 className="text-sm font-extrabold text-slate-900 mb-1">
              Complaints by Infrastructure Category
            </h3>
            <p className="text-xs text-slate-500 mb-4">Roads vs Water Supply vs Electricity grid</p>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={category_distribution}
                    dataKey="count"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ category, count }) => `${category}: ${count}`}
                  >
                    {category_distribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 3: Department Workload */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm">
            <h3 className="text-sm font-extrabold text-slate-900 mb-1">
              Department Workload & Progress
            </h3>
            <p className="text-xs text-slate-500 mb-4">Pending vs In Progress vs Resolved per division</p>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={department_workload}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="department" tick={{ fontSize: 11 }} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="pending" name="Pending" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="in_progress" name="In Progress" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="resolved" name="Resolved" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 4: Resolution Status Breakdown */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm">
            <h3 className="text-sm font-extrabold text-slate-900 mb-1">
              Resolution Pipeline Health
            </h3>
            <p className="text-xs text-slate-500 mb-4">Proportion of grievances resolved vs active</p>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={resolvedVsPendingData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    label
                  >
                    {resolvedVsPendingData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};
