import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { AdminLayout } from '../../components/AdminLayout';
import { Building, RefreshCw, ArrowRight } from 'lucide-react';

export const AdminDepartments = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchDepts(); }, []);

  const fetchDepts = async () => {
    try {
      setLoading(true);
      const res = await api.getDepartments();
      if (res.success) setDepartments(res.departments || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getDeptIcon = (name) => {
    if (name.includes('Road')) return '🛣️';
    if (name.includes('Water')) return '🚰';
    if (name.includes('Electricity')) return '⚡';
    return '🏛️';
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        
        {/* TOP TITLE */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Building className="h-6 w-6 text-blue-600" />
              <span>Municipal Departments</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Complaints assigned to each department and their progress.
            </p>
          </div>

          <button
            onClick={fetchDepts}
            disabled={loading}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {/* 3 CLEAN DEPARTMENT CARDS */}
        {loading ? (
          <div className="p-16 text-center bg-white rounded-2xl border border-slate-200">
            <p className="text-sm font-bold text-slate-500">Loading departments...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {departments.map((dept) => {
              const stats = dept.stats || {};
              const total = stats.total_assigned || 0;
              const resolved = stats.resolved || 0;
              const inProgress = stats.in_progress || 0;
              const pending = stats.pending || 0;
              const emoji = getDeptIcon(dept.department_name);

              return (
                <div
                  key={dept.id}
                  className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-2xl shrink-0">
                        {emoji}
                      </div>
                      <div>
                        <h2 className="font-extrabold text-slate-900 text-base">{dept.department_name}</h2>
                        <span className="text-[11px] text-slate-500 font-medium">Active Department</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed min-h-[36px]">
                      {dept.description}
                    </p>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-2 text-center pt-2">
                      <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                        <span className="text-[10px] text-slate-400 block font-bold uppercase">Total</span>
                        <span className="text-lg font-black text-slate-900 mt-0.5 block">{total}</span>
                      </div>
                      <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-100">
                        <span className="text-[10px] text-amber-700 block font-bold uppercase">Working</span>
                        <span className="text-lg font-black text-amber-900 mt-0.5 block">{inProgress}</span>
                      </div>
                      <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-100">
                        <span className="text-[10px] text-emerald-700 block font-bold uppercase">Solved</span>
                        <span className="text-lg font-black text-emerald-900 mt-0.5 block">{resolved}</span>
                      </div>
                    </div>
                  </div>

                  {/* Direct Button */}
                  <Link
                    to={`/admin/dashboard?tab=${encodeURIComponent(dept.department_name)}`}
                    className="w-full py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-700 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>View {dept.department_name} Complaints</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </AdminLayout>
  );
};
