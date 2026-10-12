import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Shield, Lock, Mail, ArrowRight, AlertCircle, KeyRound, ArrowLeft } from 'lucide-react';

export const AdminLogin = () => {
  const { loginAdmin } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [infoMsg, setInfoMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setInfoMsg('');
    setLoading(true);

    try {
      const res = await api.adminLogin({ email, password });
      if (res.success) {
        loginAdmin(res.token, res.admin);
        navigate('/admin/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Authentication rejected. Administrative credentials invalid.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Please provide administrative ID / Email.');
      return;
    }
    setError('');
    try {
      const res = await api.adminForgotPassword({ email });
      setInfoMsg(res.message);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans relative">
      {/* Tricolor Bar */}
      <div className="w-full h-1 bg-gradient-to-r from-orange-500 via-white to-green-600 fixed top-0 left-0 right-0 z-50"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex w-14 h-14 rounded-2xl bg-white p-1.5 border border-slate-200 items-center justify-center shadow-md mb-3">
          <img
            src="/images/grievance_logo.png"
            alt="Smart Grievance System"
            className="w-full h-full object-contain"
          />
        </div>
        <div className="flex items-center justify-center gap-2 leading-tight">
          <span className="font-extrabold text-2xl tracking-tight text-slate-900">Smart Grievance System</span>
        </div>
        <div className="mt-1 flex items-center justify-center gap-1.5">
          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
            Admin Portal Login
          </span>
        </div>
        <p className="mt-2 text-xs text-slate-500 font-medium">
          Sign in to manage complaints and assign tasks to municipal departments
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xs rounded-2xl sm:px-10 border border-slate-200/80">

          {error && (
            <div className="mb-4 p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-rose-700 text-xs leading-relaxed">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {infoMsg && (
            <div className="mb-4 p-3.5 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-2.5 text-blue-900 text-xs">
              <KeyRound className="h-4 w-4 shrink-0 text-blue-600 mt-0.5" />
              <span>{infoMsg}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Admin Email / Officer ID
              </label>
              <div className="relative">
                <Mail className="h-4 w-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@gov.in"
                  className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs sm:text-sm"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Password
                </label>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <Lock className="h-4 w-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs sm:text-sm"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs sm:text-sm rounded-xl py-3 px-6 transition-all duration-150 shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Admin Console</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
            {/* One-Click Quick Fill Credentials for Evaluation */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => {
                  setEmail('admin@gov.in');
                  setPassword('admin123');
                  setError('');
                }}
                className="w-full py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>🔑 Auto-Fill Admin Credentials</span>
                <span className="text-[10px] text-slate-500 font-normal">(admin@gov.in / admin123)</span>
              </button>
            </div>
          </form>

          {/* Citizen Portal Link */}
          <div className="mt-6 pt-5 border-t border-slate-100 text-center">
            <Link
              to="/"
              className="text-xs font-semibold text-slate-600 hover:text-blue-600 inline-flex items-center gap-1 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Return to Public Grievance Portal</span>
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
};
