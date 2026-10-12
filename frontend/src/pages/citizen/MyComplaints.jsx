import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { Navbar } from '../../components/Navbar';
import { StatusBadge } from '../../components/StatusBadge';
import { CategoryIcon } from '../../components/CategoryIcon';
import {
  FileText, Search, Filter, PlusCircle, ArrowUpDown,
  Calendar, MapPin, ExternalLink, RefreshCw, ArrowRight, Paperclip
} from 'lucide-react';

export const MyComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchComplaints();
  }, [categoryFilter, statusFilter]);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const params = {};
      if (categoryFilter !== 'All') params.category = categoryFilter;
      if (statusFilter !== 'All') params.status = statusFilter;
      if (searchQuery.trim()) params.search = searchQuery.trim();

      const res = await api.getUserComplaints(params);
      if (res.success) {
        setComplaints(res.complaints || []);
      }
    } catch (err) {
      console.error('Failed to fetch user complaints:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchComplaints();
  };

  const handleResetFilters = () => {
    setCategoryFilter('All');
    setStatusFilter('All');
    setSearchQuery('');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans pb-12">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              My Complaints
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
              Check the latest progress, assigned repair teams, and resolution notes for your reports
            </p>
          </div>

          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors shadow-xs self-start sm:self-auto"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Report an Issue</span>
          </Link>
        </div>

        {/* Filter Bar */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs mb-6 space-y-4">
          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="h-4 w-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by Complaint ID (e.g. GRV-1001), title, or location..."
                className="w-full pl-10 pr-3 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 bg-slate-900 text-white text-xs font-semibold rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Search
            </button>
            {(searchQuery || categoryFilter !== 'All' || statusFilter !== 'All') && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="px-4 py-2.5 border border-slate-300 text-slate-600 text-xs font-medium rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Reset
              </button>
            )}
          </form>

          <div className="flex items-center gap-4 flex-wrap text-xs pt-1">
            <span className="font-bold text-slate-700 flex items-center gap-1.5">
              <Filter className="h-3.5 w-3.5 text-blue-600" /> Filters:
            </span>

            {/* Category Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-medium">Category:</span>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="py-1.5 px-3 bg-slate-50 border border-slate-300 rounded-lg font-medium text-slate-800 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="All">All Categories</option>
                <option value="Road">Road</option>
                <option value="Water">Water</option>
                <option value="Electricity">Electricity</option>
              </select>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-medium">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="py-1.5 px-3 bg-slate-50 border border-slate-300 rounded-lg font-medium text-slate-800 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="All">All Statuses</option>
                <option value="Submitted">Submitted</option>
                <option value="Under Review">Under Review</option>
                <option value="Assigned">Assigned</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>

            <button
              onClick={fetchComplaints}
              className="ml-auto inline-flex items-center gap-1 text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
              title="Refresh Complaints"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Complaints Listing */}
        {loading ? (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-16 text-center shadow-xs">
            <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-xs text-slate-500 font-medium">Loading your complaints...</p>
          </div>
        ) : complaints.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-16 text-center shadow-xs space-y-3">
            <FileText className="h-12 w-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">No complaints found</h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
              We couldn't find any complaints matching your search or filters.
            </p>
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white font-semibold text-xs hover:bg-blue-700 transition-colors mt-2"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Report an Issue</span>
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="divide-y divide-slate-100">
              {complaints.map((item) => (
                <div
                  key={item.complaint_id}
                  className="p-5 sm:px-6 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
                      <CategoryIcon category={item.category} className="h-5 w-5 text-slate-700" />
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-bold text-blue-700">
                          {item.complaint_id}
                        </span>
                        <StatusBadge status={item.status} />
                      </div>

                      <h3 className="text-sm font-bold text-slate-900">
                        {item.title}
                      </h3>

                      <p className="text-xs text-slate-600 line-clamp-1 max-w-2xl">
                        {item.description}
                      </p>

                      <div className="flex items-center gap-4 text-xs text-slate-500 pt-1 flex-wrap">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5 text-slate-400" />
                          {item.location}
                        </span>
                        <span className="flex items-center gap-1 font-mono text-[11px]">
                          <Calendar className="h-3.5 w-3.5 text-slate-400" />
                          {item.created_at?.slice(0, 10)}
                        </span>
                        {item.assigned_department && (
                          <span className="text-[11px] font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                            {item.assigned_department}
                          </span>
                        )}
                        {item.image_url && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                            <Paperclip className="h-3 w-3" />
                            <span>Photo Attached</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    <Link
                      to={`/complaints/${item.complaint_id}`}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-900 hover:text-white text-slate-800 text-xs font-semibold transition-colors"
                    >
                      <span>Track Details</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
