import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  LayoutDashboard, AlertTriangle, ClipboardList,
  Building, LogOut, Bell, Menu, X, ExternalLink
} from 'lucide-react';

export const AdminLayout = ({ children }) => {
  const { adminUser, logoutAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [urgentAlerts, setUrgentAlerts] = useState([]);
  const [alertsDropdown, setAlertsDropdown] = useState(false);

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchAlerts = async () => {
    try {
      const res = await api.getAdminNotifications();
      if (res.success) {
        setUrgentAlerts(res.alerts || []);
      }
    } catch {
      // ignore
    }
  };

  const handleLogout = async () => {
    await logoutAdmin();
    navigate('/admin/login');
  };

  const navItems = [
    {
      name: 'Complaints',
      path: '/admin/dashboard',
      icon: ClipboardList,
      badge: urgentAlerts.length,
      badgeColor: 'bg-red-600 text-white'
    },
    {
      name: 'Departments',
      path: '/admin/departments',
      icon: Building
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
      
      {/* 1. TOP HEADER WITH TRICOLOR LINE */}
      <header className="w-full bg-white border-b border-slate-200 sticky top-0 z-40">
        
        {/* National Tricolor Line */}
        <div className="w-full h-1 bg-gradient-to-r from-orange-500 via-white to-green-600"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-3 flex items-center justify-between gap-4">
            
            {/* Logo and Simple Title */}
            <Link
              to="/admin/dashboard"
              className="flex items-center gap-3 group"
            >
              <div className="w-10 h-10 rounded-xl bg-white p-1 border border-slate-200 flex items-center justify-center shrink-0 shadow-xs">
                <img
                  src="/images/grievance_logo.png"
                  alt="Logo"
                  className="w-full h-full object-contain"
                />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-base tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors">
                    Smart Grievance System
                  </span>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                    Admin Panel
                  </span>
                </div>
                <p className="text-xs text-slate-500 hidden sm:block">
                  Assign complaints to municipal departments
                </p>
              </div>
            </Link>

            {/* Simple Navigation Links */}
            <nav className="hidden md:flex items-center gap-1.5">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path || 
                  (item.path !== '/admin/dashboard' && location.pathname.startsWith(item.path));

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                    <span>{item.name}</span>
                    {item.badge !== undefined && item.badge > 0 && (
                      <span className={`px-1.5 py-0.2 text-[10px] font-black rounded-full ${
                        isActive ? 'bg-white text-red-600' : 'bg-red-600 text-white'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Right Header Actions */}
            <div className="flex items-center gap-2.5">
              
              {/* Urgent Bell */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setAlertsDropdown(!alertsDropdown)}
                  className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors border border-slate-200"
                  title="Urgent Alerts"
                >
                  <Bell className="h-4 w-4" />
                  {urgentAlerts.length > 0 && (
                    <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-600 text-white rounded-full text-[10px] font-black flex items-center justify-center">
                      {urgentAlerts.length}
                    </span>
                  )}
                </button>

                {alertsDropdown && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 p-4 z-50">
                    <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
                      <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                        Urgent Problems ({urgentAlerts.length})
                      </h3>
                      <Link
                        to="/admin/dashboard?tab=urgent"
                        onClick={() => setAlertsDropdown(false)}
                        className="text-xs text-blue-600 hover:underline font-bold"
                      >
                        View all &rarr;
                      </Link>
                    </div>

                    <div className="mt-2 divide-y divide-slate-100 max-h-60 overflow-y-auto">
                      {urgentAlerts.length === 0 ? (
                        <p className="py-4 text-xs text-center text-slate-500">No urgent complaints right now.</p>
                      ) : (
                        urgentAlerts.slice(0, 5).map((alert, idx) => (
                          <Link
                            key={idx}
                            to={`/admin/complaints/${alert.complaint_id}`}
                            onClick={() => setAlertsDropdown(false)}
                            className="block py-2 px-1 hover:bg-slate-50 rounded-lg text-xs"
                          >
                            <div className="flex items-center justify-between font-bold text-slate-900">
                              <span>{alert.complaint_id}</span>
                              <span className="text-[10px] px-1.5 py-0.2 bg-red-100 text-red-700 rounded font-black">URGENT</span>
                            </div>
                            <p className="text-slate-600 line-clamp-1 mt-0.5">{alert.title}</p>
                          </Link>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Link to public website */}
              <Link
                to="/"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 transition-colors"
              >
                <ExternalLink className="h-3.5 w-3.5 text-slate-500" />
                <span className="hidden sm:inline">Public Website</span>
              </Link>

              {/* Logout Button */}
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-slate-600 hover:text-red-700 hover:bg-red-50 rounded-xl border border-slate-200 transition-colors text-xs font-semibold cursor-pointer"
                title="Log out"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </button>

              {/* Mobile Menu Button */}
              <button
                type="button"
                onClick={() => setMobileNavOpen(!mobileNavOpen)}
                className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 border border-slate-200"
              >
                {mobileNavOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>

            </div>

          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileNavOpen && (
          <div className="md:hidden bg-white border-t border-slate-200 p-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileNavOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </div>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="px-2 py-0.5 text-[10px] font-black rounded-full bg-red-600 text-white">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        )}

      </header>

      {/* 2. MAIN CONTENT AREA */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children || <Outlet />}
      </main>

      {/* 3. SIMPLE FOOTER */}
      <footer className="w-full bg-white border-t border-slate-200 py-4 px-4 text-center text-xs text-slate-500">
        <p className="font-medium">
          Smart Grievance System &bull; Admin Panel
        </p>
      </footer>

    </div>
  );
};
