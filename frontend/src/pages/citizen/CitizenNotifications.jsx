import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Navbar } from '../../components/Navbar';
import { Bell, CheckCheck, Clock, ShieldCheck, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

export const CitizenNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await api.getNotifications();
      if (res.success) {
        setNotifications(res.notifications || []);
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await api.markNotificationRead(id);
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, is_read: 1 } : n))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Citizen Notifications & Alerts
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Official status updates, automated triage notices, and department actions
            </p>
          </div>

          {notifications.some(n => n.is_read === 0) && (
            <button
              onClick={handleMarkAllRead}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <CheckCheck className="h-4 w-4" />
              <span>Mark All as Read</span>
            </button>
          )}
        </div>

        {loading ? (
          <div className="p-12 text-center bg-white rounded-xl border border-slate-200">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-xs text-slate-500">Retrieving alert notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-xl border border-dashed border-slate-300">
            <Bell className="h-10 w-10 text-slate-300 mx-auto mb-2" />
            <h3 className="text-sm font-semibold text-slate-700">No Notifications</h3>
            <p className="text-xs text-slate-500 mt-1">
              You will receive notices here as soon as your complaints are analyzed and triaged.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notif) => (
              <div
                key={notif.id}
                className={`p-4 rounded-xl border transition-all flex items-start justify-between gap-4 ${
                  notif.is_read === 0
                    ? 'bg-blue-50/60 border-blue-200 shadow-2xs'
                    : 'bg-white border-slate-200 opacity-90'
                }`}
              >
                <div className="flex items-start gap-3 flex-1">
                  <div
                    className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                      notif.is_read === 0 ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    <Bell className="h-4 w-4" />
                  </div>

                  <div className="space-y-1">
                    <p className={`text-xs sm:text-sm leading-relaxed ${
                      notif.is_read === 0 ? 'font-bold text-slate-900' : 'text-slate-700'
                    }`}>
                      {notif.message}
                    </p>

                    <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {notif.created_at}
                      </span>

                      {notif.complaint_id && (
                        <Link
                          to={`/complaints/${notif.complaint_id}`}
                          className="font-bold text-blue-600 hover:underline"
                        >
                          View {notif.complaint_id} &rarr;
                        </Link>
                      )}
                    </div>
                  </div>
                </div>

                {notif.is_read === 0 && (
                  <button
                    onClick={() => handleMarkRead(notif.id)}
                    className="shrink-0 text-[11px] font-semibold text-blue-600 hover:text-blue-800 px-2 py-1 bg-white border border-blue-200 rounded-md"
                  >
                    Mark read
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};
