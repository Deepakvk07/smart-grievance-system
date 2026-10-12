import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { AdminLayout } from '../../components/AdminLayout';
import {
  Search, ChevronLeft, ChevronRight, RefreshCw, MapPin,
  Phone, CheckCircle2, X, Download
} from 'lucide-react';

export const AdminComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [actionNotice, setActionNotice] = useState(null);
  const [assigningId, setAssigningId] = useState(null);

  // Filters
  const [category, setCategory] = useState('All');
  const [priority, setPriority] = useState('All');
  const [status, setStatus] = useState('All');
  const [department, setDepartment] = useState('All');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchComplaints();
  }, [page, category, priority, status, department]);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const params = { page, limit: 15 };
      if (category !== 'All') params.category = category;
      if (priority !== 'All') params.priority = priority;
      if (status !== 'All') params.status = status;
      if (department !== 'All') params.department = department;
      if (search.trim()) params.search = search.trim();

      const res = await api.getAdminComplaints(params);
      if (res.success) {
        setComplaints(res.complaints || []);
        setTotal(res.total || 0);
        setTotalPages(res.total_pages || 1);
      }
    } catch (err) {
      console.error('Failed to fetch complaints:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchComplaints();
  };

  const handleReset = () => {
    setCategory('All');
    setPriority('All');
    setStatus('All');
    setDepartment('All');
    setSearch('');
    setPage(1);
  };

  // Direct: Assign Problem to Department
  const handleAssignDepartment = async (complaintId, departmentName) => {
    if (!departmentName) return;
    try {
      setAssigningId(complaintId);
      const res = await api.assignDepartment(complaintId, {
        department: departmentName,
        remarks: `Assigned to ${departmentName}`
      });

      if (res.success) {
        setComplaints(prev => prev.map(c => 
          c.complaint_id === complaintId 
            ? { ...c, assigned_department: departmentName, status: c.status === 'Submitted' ? 'Assigned' : c.status } 
            : c
        ));

        setActionNotice({
          type: 'success',
          msg: `Complaint ${complaintId} assigned to ${departmentName}!`
        });
        setTimeout(() => setActionNotice(null), 3500);
      }
    } catch (err) {
      console.error('Failed to assign:', err);
    } finally {
      setAssigningId(null);
    }
  };

  const handleQuickStatus = async (complaintId, newStatus) => {
    try {
      const res = await api.updateComplaintStatus(complaintId, {
        status: newStatus,
        remarks: `Status updated to ${newStatus}`
      });

      if (res.success) {
        setComplaints(prev => prev.map(c => 
          c.complaint_id === complaintId ? { ...c, status: newStatus } : c
        ));

        setActionNotice({
          type: 'success',
          msg: `Complaint ${complaintId} updated to "${newStatus}".`
        });
        setTimeout(() => setActionNotice(null), 3500);
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        
        {/* TOP TITLE BAR */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              All Complaints
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Search all citizen complaints and assign them to the right department.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchComplaints}
              disabled={loading}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>

            <a
              href={api.getCSVExportUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export CSV</span>
            </a>
          </div>
        </div>

        {/* FEEDBACK NOTICE */}
        {actionNotice && (
          <div className={`p-4 rounded-xl flex items-center justify-between text-xs font-bold border animate-in fade-in ${
            actionNotice.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
              : 'bg-red-50 text-red-900 border-red-300'
          }`}>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>{actionNotice.msg}</span>
            </div>
            <button onClick={() => setActionNotice(null)} className="p-1 hover:bg-black/5 rounded">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* SEARCH & SIMPLE FILTERS */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="h-4 w-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by ID, name, location, or mobile..."
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            <button
              type="submit"
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl"
            >
              Search
            </button>

            {(search || category !== 'All' || priority !== 'All' || status !== 'All' || department !== 'All') && (
              <button
                type="button"
                onClick={handleReset}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
              >
                Reset
              </button>
            )}
          </form>

          {/* Simple Dropdown Filters */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
            <div className="flex items-center gap-2 flex-wrap">
              {/* Category */}
              <select
                value={category}
                onChange={(e) => { setCategory(e.target.value); setPage(1); }}
                className="py-1 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700"
              >
                <option value="All">All Categories</option>
                <option value="Road">Road</option>
                <option value="Water">Water</option>
                <option value="Electricity">Electricity</option>
              </select>

              {/* Priority */}
              <select
                value={priority}
                onChange={(e) => { setPriority(e.target.value); setPage(1); }}
                className="py-1 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700"
              >
                <option value="All">All Priorities</option>
                <option value="High">Urgent</option>
                <option value="Medium">Medium</option>
                <option value="Low">Normal</option>
              </select>

              {/* Status */}
              <select
                value={status}
                onChange={(e) => { setStatus(e.target.value); setPage(1); }}
                className="py-1 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700"
              >
                <option value="All">All Statuses</option>
                <option value="Submitted">New</option>
                <option value="Assigned">Assigned</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Solved</option>
              </select>

              {/* Department */}
              <select
                value={department}
                onChange={(e) => { setDepartment(e.target.value); setPage(1); }}
                className="py-1 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700"
              >
                <option value="All">All Departments</option>
                <option value="Road Department">Road Department</option>
                <option value="Water Department">Water Department</option>
                <option value="Electricity Department">Electricity Department</option>
              </select>
            </div>

            <span className="text-slate-400 font-mono text-[11px]">
              Total: <strong>{total}</strong> complaints
            </span>
          </div>
        </div>

        {/* COMPLAINTS TABLE */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100 text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[11px]">
                <tr>
                  <th className="py-3 px-3">Complaint ID</th>
                  <th className="py-3 px-3 min-w-[200px]">Problem & Location</th>
                  <th className="py-3 px-3">Citizen Contact</th>
                  <th className="py-3 px-3">Priority</th>
                  <th className="py-3 px-3 min-w-[200px]">Assign Department</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">Loading complaints...</td>
                  </tr>
                ) : complaints.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">No complaints found.</td>
                  </tr>
                ) : (
                  complaints.map((item) => {
                    const currentDept = item.assigned_department || 'Unassigned';

                    return (
                      <tr key={item.complaint_id} className="hover:bg-slate-50">
                        <td className="py-3 px-3 font-mono font-bold text-blue-700 whitespace-nowrap">
                          <Link to={`/admin/complaints/${item.complaint_id}`} className="hover:underline">
                            {item.complaint_id}
                          </Link>
                          <span className="text-[10px] text-slate-400 block font-mono">
                            {item.created_at?.substring(0, 10)}
                          </span>
                        </td>

                        <td className="py-3 px-3 max-w-xs">
                          <div className="font-bold text-slate-900 truncate" title={item.title}>
                            {item.title}
                          </div>
                          {item.location && (
                            <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5 truncate">
                              <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
                              <span className="truncate">{item.location}</span>
                            </div>
                          )}
                        </td>

                        <td className="py-3 px-3 whitespace-nowrap">
                          <div className="font-semibold text-slate-900">{item.citizen_name || 'Citizen'}</div>
                          {item.citizen_mobile && (
                            <a href={`tel:${item.citizen_mobile}`} className="text-[11px] text-blue-600 font-mono">
                              {item.citizen_mobile}
                            </a>
                          )}
                        </td>

                        <td className="py-3 px-3 whitespace-nowrap">
                          {item.priority === 'High' ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-red-100 text-red-700">
                              🔴 Urgent
                            </span>
                          ) : item.priority === 'Medium' ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700">
                              🟡 Medium
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
                              🟢 Normal
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-3 whitespace-nowrap">
                          <select
                            disabled={assigningId === item.complaint_id}
                            value={currentDept !== 'Unassigned' ? currentDept : ''}
                            onChange={(e) => handleAssignDepartment(item.complaint_id, e.target.value)}
                            className={`w-full py-1.5 px-2 rounded-xl text-xs font-bold border ${
                              currentDept === 'Road Department'
                                ? 'bg-blue-50 text-blue-900 border-blue-300'
                                : currentDept === 'Water Department'
                                ? 'bg-cyan-50 text-cyan-900 border-cyan-300'
                                : currentDept === 'Electricity Department'
                                ? 'bg-amber-50 text-amber-900 border-amber-300'
                                : 'bg-slate-50 text-slate-600 border-slate-300'
                            }`}
                          >
                            <option value="" disabled>-- Select Department --</option>
                            <option value="Road Department">🛣️ Road Department</option>
                            <option value="Water Department">🚰 Water Department</option>
                            <option value="Electricity Department">⚡ Electricity Department</option>
                          </select>
                        </td>

                        <td className="py-3 px-3 whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-800">
                            {item.status}
                          </span>
                        </td>

                        <td className="py-3 px-3 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            {item.status !== 'Resolved' && (
                              <button
                                type="button"
                                onClick={() => handleQuickStatus(item.complaint_id, item.status === 'In Progress' ? 'Resolved' : 'In Progress')}
                                className="px-2.5 py-1 text-[11px] font-bold rounded-lg text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200"
                              >
                                {item.status === 'In Progress' ? '✓ Solved' : '⚡ Start'}
                              </button>
                            )}

                            <Link
                              to={`/admin/complaints/${item.complaint_id}`}
                              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-bold"
                            >
                              Details
                            </Link>
                          </div>
                        </td>

                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Simple Pagination */}
          <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs text-slate-600">
            <div>
              Page <strong>{page}</strong> of <strong>{totalPages}</strong> &bull; Total: <strong>{total}</strong>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                disabled={page <= 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="px-2.5 py-1 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 font-bold disabled:opacity-40 flex items-center gap-1"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                <span>Prev</span>
              </button>
              <span className="font-mono px-2 font-bold text-slate-800">{page} / {totalPages}</span>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                className="px-2.5 py-1 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 font-bold disabled:opacity-40 flex items-center gap-1"
              >
                <span>Next</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>

      </div>
    </AdminLayout>
  );
};
