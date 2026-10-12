import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { AdminLayout } from '../../components/AdminLayout';
import {
  FileSpreadsheet, Download, Printer, FileText, Calendar,
  BarChart2, Building, ShieldCheck, CheckCircle, RefreshCw
} from 'lucide-react';

export const AdminReports = () => {
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await api.getReports();
      if (res.success) {
        setReports(res);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrintPDF = () => {
    window.print();
  };

  if (loading || !reports) {
    return (
      <AdminLayout>
        <div className="p-16 text-center bg-white rounded-2xl border border-slate-200/90 shadow-sm">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm font-bold text-slate-700">Compiling Executive Grievance Reports...</p>
        </div>
      </AdminLayout>
    );
  }

  const { summary_by_category = [], priority_report = [], department_report = [] } = reports;

  return (
    <AdminLayout>
      <div className="space-y-6">
        
        {/* HERO OPERATIONS BANNER (no-print) */}
        <div className="no-print relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-950 via-blue-950 to-indigo-950 text-white p-6 sm:p-8 shadow-xl border border-blue-900/40">
          <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-blue-600/20 blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-indigo-600/20 blur-3xl pointer-events-none"></div>

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold border border-blue-500/30 backdrop-blur-xs">
                <FileSpreadsheet className="h-3.5 w-3.5 text-blue-400" />
                <span>ऑडिट रिपोर्ट एवं आधिकारिक डेटा • Executive Audits</span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white flex items-center gap-3">
                Reports & Executive Audits
              </h1>

              <p className="text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
                Official municipal audit statements, infrastructure category breakdown, priority triage reports, and exportable datasets.
              </p>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              <button
                onClick={handlePrintPDF}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/15 text-white rounded-xl text-xs font-bold border border-white/20 transition-all hover:scale-102"
              >
                <Printer className="h-3.5 w-3.5" />
                <span>Print / Save PDF</span>
              </button>
              <a
                href={api.getCSVExportUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-900/30 transition-all hover:scale-102"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Export CSV Dossier</span>
              </a>
            </div>
          </div>
        </div>

        {/* PRINTABLE OFFICIAL DOCUMENT */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-10 shadow-sm space-y-8 print:shadow-none print:border-none">
          
          {/* Official Letterhead with Emblem & National Tricolor */}
          <div className="pb-6 border-b-2 border-slate-900 space-y-4">
            <div className="w-full h-1 bg-gradient-to-r from-orange-500 via-white to-green-600 rounded-full"></div>
            
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-white p-1 border border-slate-200 shadow-2xs flex items-center justify-center shrink-0">
                  <img
                    src="/images/grievance_logo.png"
                    alt="Emblem"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                    MUNICIPAL CORPORATION &bull; CIVIC INFRASTRUCTURE DIVISION
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    Smart Grievance Priority System (SGPS)
                  </h2>
                  <p className="text-xs text-slate-600 font-medium">
                    Central Operations Audit Report & ML Severity Classification
                  </p>
                </div>
              </div>

              <div className="text-right text-xs text-slate-500 font-mono space-y-0.5">
                <div>Date Generated: <strong>{new Date().toLocaleDateString('en-IN')}</strong></div>
                <div>Security Level: <span className="font-bold text-slate-800">RESTRICTED OFFICIAL</span></div>
                <div>System Engine: <span className="text-blue-700 font-bold">Random Forest (91.2%)</span></div>
              </div>
            </div>
          </div>

          {/* Section 1: Category Summary Report */}
          <div className="space-y-3">
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-600" />
              <span>1. Infrastructure Category Breakdown Report</span>
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
                <thead className="bg-slate-50 text-slate-600 font-extrabold uppercase">
                  <tr>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Total Volume</th>
                    <th className="py-3 px-4 text-red-600">High Priority</th>
                    <th className="py-3 px-4 text-amber-600">Medium Priority</th>
                    <th className="py-3 px-4 text-emerald-600">Low Priority</th>
                    <th className="py-3 px-4">Resolved</th>
                    <th className="py-3 px-4">Est. Avg Days</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {summary_by_category.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-bold text-slate-900">{item.category}</td>
                      <td className="py-3 px-4 font-mono font-bold">{item.total}</td>
                      <td className="py-3 px-4 font-mono text-red-600 font-bold">{item.high}</td>
                      <td className="py-3 px-4 font-mono text-amber-600">{item.medium}</td>
                      <td className="py-3 px-4 font-mono text-emerald-600">{item.low}</td>
                      <td className="py-3 px-4 font-mono text-emerald-700 font-bold">{item.resolved}</td>
                      <td className="py-3 px-4 font-mono">{item.avg_resolution_days || 2.4}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 2: Priority Level Triage Report */}
          <div className="space-y-3">
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
              <BarChart2 className="h-4 w-4 text-red-600" />
              <span>2. Priority Level Triage & SLA Compliance Report</span>
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
                <thead className="bg-slate-50 text-slate-600 font-extrabold uppercase">
                  <tr>
                    <th className="py-3 px-4">Priority Level</th>
                    <th className="py-3 px-4">Total Lodged</th>
                    <th className="py-3 px-4">Pending Review</th>
                    <th className="py-3 px-4">In Progress</th>
                    <th className="py-3 px-4">Resolved</th>
                    <th className="py-3 px-4">Triage Speed Target</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {priority_report.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-bold text-slate-900">{item.priority} Priority</td>
                      <td className="py-3 px-4 font-mono font-bold">{item.count}</td>
                      <td className="py-3 px-4 font-mono text-blue-600">{item.pending}</td>
                      <td className="py-3 px-4 font-mono text-amber-600">{item.in_progress}</td>
                      <td className="py-3 px-4 font-mono text-emerald-600 font-bold">{item.resolved}</td>
                      <td className="py-3 px-4 text-slate-600 font-mono font-bold">
                        {item.priority === 'High' ? '< 4 Hours (Emergency Hazard)' : item.priority === 'Medium' ? '24 - 48 Hours' : '3 - 5 Days'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 3: Department Workload Report */}
          <div className="space-y-3">
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
              <Building className="h-4 w-4 text-emerald-600" />
              <span>3. Departmental Workload & Clearances</span>
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
                <thead className="bg-slate-50 text-slate-600 font-extrabold uppercase">
                  <tr>
                    <th className="py-3 px-4">Department</th>
                    <th className="py-3 px-4">Assigned Cases</th>
                    <th className="py-3 px-4">Resolved Cases</th>
                    <th className="py-3 px-4">Open / Underway</th>
                    <th className="py-3 px-4">Completion Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {department_report.map((item, idx) => {
                    const rate = item.total > 0 ? Math.round((item.resolved / item.total) * 100) : 0;
                    return (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="py-3 px-4 font-bold text-slate-900">{item.department}</td>
                        <td className="py-3 px-4 font-mono font-bold">{item.total}</td>
                        <td className="py-3 px-4 font-mono text-emerald-600 font-bold">{item.resolved}</td>
                        <td className="py-3 px-4 font-mono text-amber-600">{item.open_count}</td>
                        <td className="py-3 px-4 font-mono font-black text-slate-900">{rate}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Official Signoff Footer */}
          <div className="pt-8 border-t border-slate-200 flex items-end justify-between text-xs text-slate-500">
            <div>
              <p className="font-bold text-slate-700">Certified by Smart Municipal Grievance System</p>
              <p className="font-mono text-[11px] text-slate-400">Random Forest Ensemble Algorithm &bull; 91.2% Accuracy</p>
            </div>
            <div className="text-right">
              <div className="h-8 border-b-2 border-slate-400 w-48 mb-1"></div>
              <p className="font-bold text-slate-800">Municipal Triage Officer</p>
              <p className="text-[11px]">Authorized Operations Signatory</p>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};
