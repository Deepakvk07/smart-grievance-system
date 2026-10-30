import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../../services/api';
import { AdminLayout } from '../../components/AdminLayout';
import {
  AlertTriangle, CheckCircle2, Clock, Wrench, ArrowRight,
  User, RefreshCw, Phone, MapPin, Check, X, Search,
  ClipboardList
} from 'lucide-react';

export const AdminDashboard = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionNotice, setActionNotice] = useState(null);
  const [assigningId, setAssigningId] = useState(null);
  const [statusUpdatingId, setStatusUpdatingId] = useState(null);

  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'all';

  // Filter tab: 'all' | 'urgent' | 'unassigned' | 'Road Department' | 'Water Department' | 'Electricity Department' | 'in_progress' | 'resolved'
  const [activeTab, setActiveTab] = useState(initialTab);
  const [searchQuery, setSearchQuery] = useState('');

  // Sync tab from URL if URL param changes
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      try {
        const res = await api.getPriorityQueue();
        if (res && res.success && Array.isArray(res.complaints) && res.complaints.length > 0) {
          setComplaints(res.complaints);
          return;
        }
      } catch (err) {
        console.warn('Failed to load complaints from API:', err);
      }

      // Direct fallback to localStorage
      try {
        const raw = localStorage.getItem('smart_grievance_complaints');
        if (raw) {
          const list = JSON.parse(raw);
          if (Array.isArray(list) && list.length > 0) {
            setComplaints(list);
            return;
          }
        }
      } catch (e) {
        console.warn('LocalStorage error in AdminDashboard:', e);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
    if (newTab === 'all') {
      setSearchParams({});
    } else {
      setSearchParams({ tab: newTab });
    }
  };

  // Direct: Assign Problem to Respected Department
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
          msg: `Complaint ${complaintId} assigned to ${departmentName} successfully!`
        });
        setTimeout(() => setActionNotice(null), 3500);
      }
    } catch (err) {
      console.error('Failed to assign department:', err);
      setActionNotice({
        type: 'error',
        msg: `Failed to assign: ${err.message || 'Error'}`
      });
      setTimeout(() => setActionNotice(null), 3500);
    } finally {
      setAssigningId(null);
    }
  };

  // Direct: Update Status
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

  // Calculate Simple Counts
  const totalCount = complaints.length;
  const urgentCount = complaints.filter(c => c.priority === 'High').length;
  const inProgressCount = complaints.filter(c => c.status === 'In Progress' || c.status === 'Assigned').length;
  const resolvedCount = complaints.filter(c => c.status === 'Resolved').length;

  const roadCount = complaints.filter(c => c.assigned_department === 'Road Department').length;
  const waterCount = complaints.filter(c => c.assigned_department === 'Water Department').length;
  const electricityCount = complaints.filter(c => c.assigned_department === 'Electricity Department').length;
  const unassignedCount = complaints.filter(c => !c.assigned_department || c.assigned_department === 'Unassigned').length;

  // Filter complaints
  const filteredComplaints = complaints.filter(item => {
    // Tab filter
    if (activeTab === 'urgent') {
      if (item.priority !== 'High') return false;
    } else if (activeTab === 'unassigned') {
      if (item.assigned_department && item.assigned_department !== 'Unassigned') return false;
    } else if (activeTab === 'in_progress') {
      if (item.status !== 'In Progress' && item.status !== 'Assigned') return false;
    } else if (activeTab === 'resolved') {
      if (item.status !== 'Resolved') return false;
    } else if (activeTab !== 'all') {
      if (item.assigned_department !== activeTab) return false;
    }

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchId = (item.complaint_id || '').toLowerCase().includes(q);
      const matchTitle = (item.title || '').toLowerCase().includes(q);
      const matchCitizen = (item.citizen_name || '').toLowerCase().includes(q);
      const matchPhone = (item.citizen_mobile || '').toLowerCase().includes(q);
      const matchLoc = (item.location || '').toLowerCase().includes(q);
      return matchId || matchTitle || matchCitizen || matchPhone || matchLoc;
    }

    return true;
  });

  return (
    <AdminLayout>
      <div className="space-y-6">

        {/* 1. SIMPLE TOP TITLE BAR */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Complaints & Department Assignment
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Review citizen complaints and assign them to Road, Water, or Electricity departments.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadData}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* SUCCESS OR ERROR MESSAGE BANNER */}
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

        {/* 2. SIMPLE SUMMARY CARDS (Clickable to Filter Instantly) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          
          {/* Total Complaints */}
          <button
            type="button"
            onClick={() => handleTabChange('all')}
            className={`text-left p-4 rounded-2xl border transition-all cursor-pointer ${
              activeTab === 'all'
                ? 'bg-blue-50/60 border-blue-500 shadow-sm ring-2 ring-blue-500/20'
                : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-xs'
            }`}
          >
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">All Complaints</span>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">{totalCount}</div>
            <span className="text-[11px] text-slate-400">Click to view all</span>
          </button>

          {/* Urgent Complaints */}
          <button
            type="button"
            onClick={() => handleTabChange('urgent')}
            className={`text-left p-4 rounded-2xl border transition-all cursor-pointer ${
              activeTab === 'urgent'
                ? 'bg-red-50/70 border-red-500 shadow-sm ring-2 ring-red-500/20'
                : 'bg-white border-red-200 hover:border-red-300 hover:shadow-xs'
            }`}
          >
            <span className="text-xs font-bold text-red-600 uppercase tracking-wide flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
              Urgent / High
            </span>
            <div className="text-2xl sm:text-3xl font-black text-red-950 mt-1">{urgentCount}</div>
            <span className="text-[11px] text-red-600 font-medium">Click to filter urgent</span>
          </button>

          {/* In Progress */}
          <button
            type="button"
            onClick={() => handleTabChange('in_progress')}
            className={`text-left p-4 rounded-2xl border transition-all cursor-pointer ${
              activeTab === 'in_progress'
                ? 'bg-amber-50/70 border-amber-500 shadow-sm ring-2 ring-amber-500/20'
                : 'bg-white border-amber-200 hover:border-amber-300 hover:shadow-xs'
            }`}
          >
            <span className="text-xs font-bold text-amber-700 uppercase tracking-wide">Working On It</span>
            <div className="text-2xl sm:text-3xl font-black text-amber-950 mt-1">{inProgressCount}</div>
            <span className="text-[11px] text-amber-600 font-medium">Click to filter active</span>
          </button>

          {/* Solved */}
          <button
            type="button"
            onClick={() => handleTabChange('resolved')}
            className={`text-left p-4 rounded-2xl border transition-all cursor-pointer ${
              activeTab === 'resolved'
                ? 'bg-emerald-50/70 border-emerald-500 shadow-sm ring-2 ring-emerald-500/20'
                : 'bg-white border-emerald-200 hover:border-emerald-300 hover:shadow-xs'
            }`}
          >
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wide">Solved</span>
            <div className="text-2xl sm:text-3xl font-black text-emerald-950 mt-1">{resolvedCount}</div>
            <span className="text-[11px] text-emerald-600 font-medium">Click to filter solved</span>
          </button>

        </div>

        {/* 3. MAIN COMPLAINTS TABLE CONTAINER */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden space-y-4 p-5 sm:p-6">
          
          {/* Top Filter Buttons & Search Box */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            
            {/* Department Filter Tabs */}
            <div className="flex items-center gap-1.5 flex-wrap text-xs">
              <button
                type="button"
                onClick={() => handleTabChange('all')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                  activeTab === 'all'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                All ({totalCount})
              </button>

              <button
                type="button"
                onClick={() => handleTabChange('urgent')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                  activeTab === 'urgent'
                    ? 'bg-red-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                🔴 Urgent ({urgentCount})
              </button>

              <button
                type="button"
                onClick={() => handleTabChange('unassigned')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                  activeTab === 'unassigned'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                ⚠️ Not Assigned ({unassignedCount})
              </button>

              <button
                type="button"
                onClick={() => handleTabChange('Road Department')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                  activeTab === 'Road Department'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                🛣️ Road ({roadCount})
              </button>

              <button
                type="button"
                onClick={() => handleTabChange('Water Department')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                  activeTab === 'Water Department'
                    ? 'bg-cyan-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                🚰 Water ({waterCount})
              </button>

              <button
                type="button"
                onClick={() => handleTabChange('Electricity Department')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                  activeTab === 'Electricity Department'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                ⚡ Electricity ({electricityCount})
              </button>

              <button
                type="button"
                onClick={() => handleTabChange('resolved')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                  activeTab === 'resolved'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                ✅ Solved ({resolvedCount})
              </button>
            </div>

            {/* Quick Search */}
            <div className="relative w-full sm:w-64">
              <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search complaints..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

          </div>

          {/* Simple Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100 text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-3">Complaint ID</th>
                  <th className="py-3 px-3 min-w-[200px]">Problem & Location</th>
                  <th className="py-3 px-3">Citizen Contact</th>
                  <th className="py-3 px-3">Urgency</th>
                  <th className="py-3 px-3 min-w-[200px]">Assign to Department</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      Loading complaints...
                    </td>
                  </tr>
                ) : filteredComplaints.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      No complaints found.
                    </td>
                  </tr>
                ) : (
                  filteredComplaints.map((item) => {
                    const currentDept = item.assigned_department || 'Unassigned';
                    const isAssigning = assigningId === item.complaint_id;
                    const isStatusUpdating = statusUpdatingId === item.complaint_id;

                    return (
                      <tr key={item.complaint_id} className="hover:bg-slate-50 transition-colors">
                        
                        {/* Complaint ID */}
                        <td className="py-3 px-3 font-mono font-bold text-blue-700 whitespace-nowrap">
                          <Link to={`/admin/complaints/${item.complaint_id}`} className="hover:underline">
                            {item.complaint_id}
                          </Link>
                          <span className="text-[10px] text-slate-400 block font-mono">
                            {item.created_at?.substring(0, 10)}
                          </span>
                        </td>

                        {/* Problem & Location */}
                        <td className="py-3 px-3 max-w-xs">
                          <div className="font-bold text-slate-900 truncate" title={item.title}>
                            {item.title}
                          </div>
                          {item.location && (
                            <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5 truncate" title={item.location}>
                              <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
                              <span className="truncate">{item.location}</span>
                            </div>
                          )}
                        </td>

                        {/* Citizen Contact */}
                        <td className="py-3 px-3 whitespace-nowrap">
                          <div className="font-semibold text-slate-900">{item.citizen_name || 'Citizen'}</div>
                          {item.citizen_mobile && (
                            <a
                              href={`tel:${item.citizen_mobile}`}
                              className="text-[11px] text-blue-600 hover:underline font-mono flex items-center gap-1 mt-0.5"
                            >
                              <Phone className="h-2.5 w-2.5" />
                              <span>{item.citizen_mobile}</span>
                            </a>
                          )}
                        </td>

                        {/* Urgency Priority */}
                        <td className="py-3 px-3 whitespace-nowrap">
                          {item.priority === 'High' ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-red-100 text-red-700 border border-red-200">
                              🔴 Urgent
                            </span>
                          ) : item.priority === 'Medium' ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700 border border-amber-200">
                              🟡 Medium
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
                              🟢 Normal
                            </span>
                          )}
                        </td>

                        {/* 🎯 DIRECT ASSIGN DEPARTMENT DROPDOWN */}
                        <td className="py-3 px-3 whitespace-nowrap">
                          <select
                            disabled={isAssigning}
                            value={currentDept !== 'Unassigned' ? currentDept : ''}
                            onChange={(e) => handleAssignDepartment(item.complaint_id, e.target.value)}
                            className={`w-full py-1.5 px-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                              currentDept === 'Road Department'
                                ? 'bg-blue-50 text-blue-900 border-blue-300'
                                : currentDept === 'Water Department'
                                ? 'bg-cyan-50 text-cyan-900 border-cyan-300'
                                : currentDept === 'Electricity Department'
                                ? 'bg-amber-50 text-amber-900 border-amber-300'
                                : 'bg-slate-50 text-slate-600 border-slate-300 hover:border-blue-400'
                            }`}
                          >
                            <option value="" disabled>-- Select Department --</option>
                            <option value="Road Department">🛣️ Road Department</option>
                            <option value="Water Department">🚰 Water Department</option>
                            <option value="Electricity Department">⚡ Electricity Department</option>
                          </select>
                        </td>

                        {/* Current Status */}
                        <td className="py-3 px-3 whitespace-nowrap">
                          {item.status === 'Resolved' ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              Solved
                            </span>
                          ) : item.status === 'In Progress' ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                              In Progress
                            </span>
                          ) : item.status === 'Assigned' ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                              Assigned
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                              New
                            </span>
                          )}
                        </td>

                        {/* Action Buttons */}
                        <td className="py-3 px-3 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            {item.status !== 'Resolved' && (
                              <button
                                type="button"
                                disabled={isStatusUpdating}
                                onClick={() => handleUpdateStatus(item.complaint_id, item.status === 'In Progress' ? 'Resolved' : 'In Progress')}
                                className="px-2.5 py-1 text-[11px] font-bold rounded-lg transition-colors cursor-pointer disabled:opacity-50 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200"
                              >
                                {isStatusUpdating ? '...' : (item.status === 'In Progress' ? '✓ Mark Solved' : '⚡ Start Work')}
                              </button>
                            )}

                            <Link
                              to={`/admin/complaints/${item.complaint_id}`}
                              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-bold transition-colors"
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
