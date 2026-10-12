import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { AdminLayout } from '../../components/AdminLayout';
import {
  Users, Search, UserCheck, UserX, Mail, Phone, MapPin,
  Calendar, FileText, CheckCircle2, Shield, RefreshCw, X,
  ArrowRight, ShieldAlert
} from 'lucide-react';

export const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionMessage, setActionMessage] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async (searchTerm = '') => {
    try {
      setLoading(true);
      const params = {};
      if (searchTerm.trim()) params.search = searchTerm.trim();
      const res = await api.getUsers(params);
      if (res.success) {
        setUsers(res.users || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchUsers(search);
  };

  const handleToggleStatus = async (user) => {
    const nextStatus = user.status === 'active' ? 'inactive' : 'active';
    try {
      const res = await api.toggleUserStatus(user.id, { status: nextStatus });
      if (res.success) {
        setActionMessage(`Citizen account ${user.email} status changed to "${nextStatus}".`);
        setUsers(prev =>
          prev.map(u => (u.id === user.id ? { ...u, status: nextStatus } : u))
        );
        setTimeout(() => setActionMessage(''), 4000);
      }
    } catch (err) {
      alert(err.message || 'Failed to update user status');
    }
  };

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
                <Users className="h-3.5 w-3.5 text-blue-400" />
                <span>नागरिक निर्देशिका • Citizen Registry & Access Control</span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white flex items-center gap-3">
                User & Citizen Directory
              </h1>

              <p className="text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
                Registered citizen profile records, verified contact identifiers, lifetime grievances filed, and security access states.
              </p>
            </div>

            <button
              onClick={() => fetchUsers(search)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold border border-white/20 transition-all hover:scale-102 self-start md:self-auto"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh Users</span>
            </button>
          </div>
        </div>

        {/* FEEDBACK BANNER */}
        {actionMessage && (
          <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl text-emerald-900 text-xs font-bold flex items-center justify-between animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>{actionMessage}</span>
            </div>
            <button
              onClick={() => setActionMessage('')}
              className="p-1 rounded-lg hover:bg-emerald-100 text-emerald-700"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* SEARCH BAR */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm">
          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1">
              <Search className="h-4 w-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search citizen by name, email, or mobile number..."
                className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => { setSearch(''); fetchUsers(''); }}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all shadow-xs"
            >
              Search
            </button>
            {search && (
              <button
                type="button"
                onClick={() => { setSearch(''); fetchUsers(''); }}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
              >
                Clear
              </button>
            )}
          </form>
        </div>

        {/* USERS DIRECTORY TABLE */}
        {loading ? (
          <div className="p-16 text-center bg-white rounded-2xl border border-slate-200/90 shadow-sm">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-sm font-bold text-slate-700">Retrieving Citizen Directory...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="p-16 text-center bg-white rounded-2xl border border-dashed border-slate-300 shadow-sm">
            <Users className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-extrabold text-slate-800">No Citizen Records Found</h3>
            <p className="text-xs text-slate-500 mt-1">Try adjusting the search query.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
            <div className="px-6 py-4 bg-slate-50/80 border-b border-slate-200/80 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
                <Users className="h-4 w-4 text-blue-600" />
                <span>Verified Citizen Profiles ({users.length})</span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
                <thead className="bg-slate-50/50 text-slate-600 font-extrabold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3.5 px-4">Citizen Name</th>
                    <th className="py-3.5 px-4">Email / Identifier</th>
                    <th className="py-3.5 px-4">Mobile</th>
                    <th className="py-3.5 px-4">Address / Ward</th>
                    <th className="py-3.5 px-4 text-center">Complaints</th>
                    <th className="py-3.5 px-4">Account Status</th>
                    <th className="py-3.5 px-4 text-right">Access Control</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-extrabold text-slate-900">{user.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          Registered: {user.created_at ? user.created_at.substring(0, 10) : ''}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-600">
                        {user.email}
                      </td>
                      <td className="py-3.5 px-4 font-mono whitespace-nowrap">
                        {user.mobile ? (
                          <a
                            href={`tel:${user.mobile}`}
                            className="text-blue-600 hover:text-blue-800 flex items-center gap-1 font-bold"
                            title="Call citizen"
                          >
                            <Phone className="h-3 w-3" />
                            <span>{user.mobile}</span>
                          </a>
                        ) : (
                          <span className="text-slate-400">N/A</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 max-w-xs truncate text-slate-500">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
                          <span className="truncate">{user.address || 'Address on file'}</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <Link
                          to={`/admin/complaints?search=${encodeURIComponent(user.name || user.mobile || '')}`}
                          className="font-bold text-blue-700 hover:underline"
                          title="View user's complaints"
                        >
                          {user.total_complaints || 0}
                        </Link>
                        <span className="text-slate-400 text-[11px]"> ({user.resolved_complaints || 0} res)</span>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            user.status === 'active'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${user.status === 'active' ? 'bg-emerald-600' : 'bg-rose-600'}`}></span>
                          {user.status === 'active' ? 'Active' : 'Deactivated'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => handleToggleStatus(user)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-colors ${
                            user.status === 'active'
                              ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                              : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                          }`}
                        >
                          {user.status === 'active' ? 'Deactivate' : 'Reactivate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};
