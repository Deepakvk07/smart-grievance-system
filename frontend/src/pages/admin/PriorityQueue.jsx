import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { AdminLayout } from '../../components/AdminLayout';
import {
  AlertTriangle, RefreshCw, User, Phone, MapPin, Check,
  X, Search, CheckCircle2
} from 'lucide-react';

export const PriorityQueue = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionNotice, setActionNotice] = useState(null);
  const [assigningId, setAssigningId] = useState(null);
  const [statusUpdatingId, setStatusUpdatingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('All');

  useEffect(() => { fetchQueue(); }, [priorityFilter]);

  const fetchQueue = async () => {
    try {
      setLoading(true);
      const params = {};
      if (priorityFilter !== 'All') params.priority = priorityFilter;
      const res = await api.getPriorityQueue(params);
      if (res.success) setComplaints(res.complaints || []);
    } catch (err) {
      console.error('Failed to load queue:', err);
    } finally {
      setLoading(false);
    }
  };

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
      setActionNotice({ type: 'error', msg: err.message || 'Error' });
      setTimeout(() => setActionNotice(null), 3500);
    } finally {
      setAssigningId(null);
    }
  };

  const handleUpdateStatus = async (complaintId, newStatus) => {
    try {
      setStatusUpdatingId(complaintId);
      const res = await api.updateComplaintStatus(complaintId, {
        status: newStatus,
        remarks: `Status changed to ${newStatus}`
      });

      if (res.success) {
        setComplaints(prev => prev.map(c => 
          c.complaint_id === complaintId ? { ...c, status: newStatus } : c
        ));

        setActionNotice({
          type: 'success',
          msg: `Complaint ${complaintId} marked as "${newStatus}".`
        });
        setTimeout(() => setActionNotice(null), 3500);
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setStatusUpdatingId(null);
    }
  };

  const highCount = complaints.filter(c => c.priority === 'High').length;
  const mediumCount = complaints.filter(c => c.priority === 'Medium').length;
  const lowCount = complaints.filter(c => c.priority === 'Low').length;

  const filtered = complaints.filter(item => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (item.complaint_id || '').toLowerCase().includes(q) ||
      (item.title || '').toLowerCase().includes(q) ||
      (item.citizen_name || '').toLowerCase().includes(q) ||
      (item.location || '').toLowerCase().includes(q);
  });

  return (
    <AdminLayout>
      <div className="space-y-6">

        {/* TOP TITLE */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <AlertTriangle className="h-6 w-6 text-red-600" />
              <span>Urgent Complaints</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              High-priority problems sorted so you can assign them to departments quickly.
            </p>
          </div>

          <button
            onClick={fetchQueue}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer self-start sm:self-auto"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {/* FEEDBACK TOAST */}
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

        {/* SUMMARY FILTER BUTTONS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button
            type="button"
            onClick={() => setPriorityFilter(priorityFilter === 'High' ? 'All' : 'High')}
            className={`p-4 rounded-2xl border text-left transition-all ${
              priorityFilter === 'High'
                ? 'bg-red-50 border-red-500 ring-2 ring-red-400'
                : 'bg-white border-red-200 hover:border-red-300'
            }`}
          >
            <span className="text-xs font-bold text-red-700 uppercase">🔴 High Urgency</span>
            <div className="text-2xl font-black text-red-950 mt-1">{highCount}</div>
            <span className="text-[11px] text-red-600 font-medium">Danger or major outage</span>
          </button>

          <button
            type="button"
            onClick={() => setPriorityFilter(priorityFilter === 'Medium' ? 'All' : 'Medium')}
            className={`p-4 rounded-2xl border text-left transition-all ${
              priorityFilter === 'Medium'
                ? 'bg-amber-50 border-amber-500 ring-2 ring-amber-400'
                : 'bg-white border-amber-200 hover:border-amber-300'
            }`}
          >
            <span className="text-xs font-bold text-amber-700 uppercase">🟡 Medium Priority</span>
            <div className="text-2xl font-black text-amber-950 mt-1">{mediumCount}</div>
            <span className="text-[11px] text-amber-600 font-medium">Service issues</span>
          </button>

          <button
            type="button"
            onClick={() => setPriorityFilter(priorityFilter === 'Low' ? 'All' : 'Low')}
            className={`p-4 rounded-2xl border text-left transition-all ${
              priorityFilter === 'Low'
                ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-400'
                : 'bg-white border-emerald-200 hover:border-emerald-300'
            }`}
          >
            <span className="text-xs font-bold text-emerald-700 uppercase">🟢 Normal Priority</span>
            <div className="text-2xl font-black text-emerald-950 mt-1">{lowCount}</div>
            <span className="text-[11px] text-emerald-600 font-medium">Routine maintenance</span>
          </button>
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <span className="text-xs font-bold text-slate-500">
              Showing {filtered.length} complaints
            </span>
            <div className="relative w-full sm:w-64">
              <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100 text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[11px]">
                <tr>
                  <th className="py-3 px-3">Complaint ID</th>
                  <th className="py-3 px-3 min-w-[200px]">Problem & Location</th>
                  <th className="py-3 px-3">Citizen</th>
                  <th className="py-3 px-3">Priority</th>
                  <th className="py-3 px-3 min-w-[200px]">Assign Department</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">Loading...</td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">No complaints found.</td>
                  </tr>
                ) : (
                  filtered.map((item) => {
                    const currentDept = item.assigned_department || 'Unassigned';

                    return (
                      <tr key={item.complaint_id} className="hover:bg-slate-50">
                        <td className="py-3 px-3 font-mono font-bold text-blue-700">
                          <Link to={`/admin/complaints/${item.complaint_id}`} className="hover:underline">
                            {item.complaint_id}
                          </Link>
                        </td>

                        <td className="py-3 px-3 max-w-xs">
                          <div className="font-bold text-slate-900 truncate">{item.title}</div>
                          {item.location && (
                            <div className="text-[11px] text-slate-500 truncate flex items-center gap-1 mt-0.5">
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
                                disabled={statusUpdatingId === item.complaint_id}
                                onClick={() => handleUpdateStatus(item.complaint_id, item.status === 'In Progress' ? 'Resolved' : 'In Progress')}
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
        </div>

      </div>
    </AdminLayout>
  );
};
