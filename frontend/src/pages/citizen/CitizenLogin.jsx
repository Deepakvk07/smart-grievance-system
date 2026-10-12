import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import {
  Shield, Mail, Lock, ArrowRight, AlertCircle, CheckCircle2,
  PhoneCall, Eye, EyeOff, Sparkles, Construction, Droplets, Zap,
  ShieldCheck, Check, Clock, MapPin
} from 'lucide-react';

export const CitizenLogin = () => {
  const { loginCitizen } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setInfoMessage('');
    setLoading(true);

    try {
      const res = await api.citizenLogin({ email, password });
      if (res.success) {
        loginCitizen(res.token, res.user);
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please verify your email and password. / लॉगिन विफल। कृपया सही विवरण जांचें।');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Please enter your email to receive a password reset link. / कृपया पासवर्ड रीसेट लिंक के लिए अपना ईमेल लिखें।');
      return;
    }
    setError('');
    try {
      const res = await api.citizenForgotPassword({ email });
      setInfoMessage(res.message || 'Password reset link sent to your email. / पासवर्ड रीसेट लिंक आपके ईमेल पर भेजा गया।');
    } catch (err) {
      setError(err.message || 'Could not send reset link. Please try again.');
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-slate-50 font-sans selection:bg-blue-600 selection:text-white">

      {/* ========================================================= */}
      {/* LEFT HALF: SOFT PASTEL BANNER WITH CIVIC ILLUSTRATION     */}
      {/* ========================================================= */}
      <div className="w-full lg:w-1/2 bg-gradient-to-br from-blue-50/90 via-indigo-50/60 to-sky-50/80 p-8 sm:p-12 lg:p-16 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-200/80 relative overflow-hidden">

        {/* Ambient Soft Glow Background Elements */}
        <div className="absolute top-[-10%] left-[-10%] w-80 h-80 bg-blue-200/40 rounded-full blur-3xl pointer-events-none animate-aurora" />
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-indigo-200/30 rounded-full blur-3xl pointer-events-none animate-pulse-glow" />

        {/* Top Header */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <span className="text-base font-extrabold text-slate-900 tracking-tight block">
                Smart Grievance Portal
              </span>
              <span className="font-hindi text-xs text-slate-500 font-medium block">
                नागरिक सेवा केंद्र • नगर निगम
              </span>
            </div>
          </div>

          <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100/80 border border-emerald-300 text-emerald-800 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Active E-Service</span>
          </div>
        </div>

        {/* Middle: Content & Vector Civic Illustration */}
        <div className="relative z-10 my-auto py-8 space-y-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-semibold">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              <span>City Problem Reporting</span>
            </div>

            <h1 className="text-3xl sm:text-4xl xl:text-5xl font-black text-slate-900 leading-[1.15] tracking-tight">
              Report Issues. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                Get Quick Solutions.
              </span>
            </h1>

            <p className="font-hindi text-sm sm:text-base text-slate-600 leading-relaxed max-w-md pt-1">
              सड़क, पेयजल एवं बिजली समस्याओं का पारदर्शी व त्वरित समाधान। अब घर बैठे अपनी शिकायत दर्ज करें और लाइव प्रगति देखें।
            </p>
          </div>

          {/* Civic City Vector Illustration */}
          <div className="relative py-2">
            <svg
              viewBox="0 0 520 280"
              className="w-full max-w-lg mx-auto drop-shadow-sm select-none"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Soft Ground & Road Curve */}
              <path
                d="M10 240 C 140 240, 200 230, 320 235 C 420 240, 480 245, 510 245"
                stroke="#cbd5e1"
                strokeWidth="28"
                strokeLinecap="round"
              />
              <path
                d="M10 240 C 140 240, 200 230, 320 235 C 420 240, 480 245, 510 245"
                stroke="#94a3b8"
                strokeWidth="22"
                strokeLinecap="round"
              />
              <path
                d="M40 240 L100 240 M160 236 L220 233 M280 234 L340 236 M400 240 L460 243"
                stroke="#ffffff"
                strokeWidth="3"
                strokeDasharray="8 8"
                strokeLinecap="round"
              />

              {/* Background Skyline Buildings */}
              <rect x="50" y="90" width="60" height="135" rx="8" fill="#e2e8f0" />
              <rect x="62" y="105" width="12" height="16" rx="2" fill="#cbd5e1" />
              <rect x="84" y="105" width="12" height="16" rx="2" fill="#cbd5e1" />
              <rect x="62" y="135" width="12" height="16" rx="2" fill="#cbd5e1" />
              <rect x="84" y="135" width="12" height="16" rx="2" fill="#cbd5e1" />
              <rect x="62" y="165" width="12" height="16" rx="2" fill="#cbd5e1" />
              <rect x="84" y="165" width="12" height="16" rx="2" fill="#cbd5e1" />

              <rect x="125" y="60" width="85" height="165" rx="8" fill="#cbd5e1" />
              <rect x="140" y="75" width="16" height="20" rx="3" fill="#93c5fd" fillOpacity="0.8" />
              <rect x="175" y="75" width="16" height="20" rx="3" fill="#93c5fd" fillOpacity="0.8" />
              <rect x="140" y="110" width="16" height="20" rx="3" fill="#93c5fd" fillOpacity="0.8" />
              <rect x="175" y="110" width="16" height="20" rx="3" fill="#93c5fd" fillOpacity="0.8" />
              <rect x="140" y="145" width="16" height="20" rx="3" fill="#ffffff" fillOpacity="0.8" />
              <rect x="175" y="145" width="16" height="20" rx="3" fill="#ffffff" fillOpacity="0.8" />

              <rect x="225" y="105" width="70" height="120" rx="8" fill="#e2e8f0" />
              <rect x="240" y="120" width="14" height="18" rx="2" fill="#cbd5e1" />
              <rect x="268" y="120" width="14" height="18" rx="2" fill="#cbd5e1" />
              <rect x="240" y="150" width="14" height="18" rx="2" fill="#cbd5e1" />
              <rect x="268" y="150" width="14" height="18" rx="2" fill="#cbd5e1" />

              {/* Park Trees */}
              <circle cx="330" cy="190" r="24" fill="#86efac" />
              <circle cx="345" cy="180" r="20" fill="#4ade80" />
              <rect x="334" y="195" width="8" height="35" rx="2" fill="#78350f" />

              <circle cx="385" cy="195" r="20" fill="#a7f3d0" />
              <rect x="382" y="200" width="6" height="30" rx="2" fill="#78350f" />

              {/* Smart Street Lamp Post with Amber Glow */}
              <path d="M430 235 L430 115" stroke="#475569" strokeWidth="4" strokeLinecap="round" />
              <path d="M430 115 C 430 100, 450 100, 455 110" stroke="#475569" strokeWidth="4" fill="none" />
              <circle cx="455" cy="115" r="8" fill="#fbbf24" />
              <path d="M455 123 L440 180 L470 180 Z" fill="#fef08a" fillOpacity="0.3" />

              {/* Road Work Cones */}
              <polygon points="30,230 40,210 50,230" fill="#f97316" />
              <rect x="34" y="218" width="12" height="3" fill="#ffffff" />
              <rect x="28" y="230" width="24" height="3" rx="1" fill="#ea580c" />

              {/* Floating Verified Badge Card 1 */}
              <g transform="translate(18, 40)">
                <rect width="165" height="46" rx="14" fill="#ffffff" filter="drop-shadow(0 4px 12px rgba(15,23,42,0.08))" />
                <circle cx="24" cy="23" r="13" fill="#dcfce7" />
                <path d="M19 23 L23 27 L29 19" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                <text x="44" y="19" fontFamily="sans-serif" fontSize="11" fontWeight="bold" fill="#0f172a">Road Pothole Fixed</text>
                <text x="44" y="33" fontFamily="sans-serif" fontSize="9.5" fill="#16a34a" fontWeight="600">✓ Resolved in 24 hrs</text>
              </g>

              {/* Floating Water Pipeline Badge Card 2 */}
              <g transform="translate(325, 30)">
                <rect width="170" height="46" rx="14" fill="#ffffff" filter="drop-shadow(0 4px 12px rgba(15,23,42,0.08))" />
                <circle cx="24" cy="23" r="13" fill="#e0f2fe" />
                <path d="M24 14 C 20 20, 18 23, 18 26 C 18 29.3, 20.7 32, 24 32 C 27.3 32, 30 29.3, 30 26 C 30 23, 28 20, 24 14 Z" fill="#0284c7" />
                <text x="44" y="19" fontFamily="sans-serif" fontSize="11" fontWeight="bold" fill="#0f172a">Water Pipe Restored</text>
                <text x="44" y="33" fontFamily="sans-serif" fontSize="9.5" fill="#0284c7" fontWeight="600">✓ Clean Supply Active</text>
              </g>
            </svg>
          </div>

          {/* 3 Clean Horizontal Chips */}
          <div className="flex flex-wrap gap-2 pt-1">
            <div className="px-3.5 py-1.5 rounded-xl bg-white/90 border border-slate-200/80 shadow-xs flex items-center gap-2 text-xs">
              <Construction className="h-4 w-4 text-amber-500 shrink-0" />
              <span className="font-semibold text-slate-800">Roads & Potholes</span>
              <span className="font-hindi text-[11px] text-slate-500">(सड़क व गड्ढे)</span>
            </div>

            <div className="px-3.5 py-1.5 rounded-xl bg-white/90 border border-slate-200/80 shadow-xs flex items-center gap-2 text-xs">
              <Droplets className="h-4 w-4 text-blue-500 shrink-0" />
              <span className="font-semibold text-slate-800">Water Supply</span>
              <span className="font-hindi text-[11px] text-slate-500">(पेयजल व सीवर)</span>
            </div>

            <div className="px-3.5 py-1.5 rounded-xl bg-white/90 border border-slate-200/80 shadow-xs flex items-center gap-2 text-xs">
              <Zap className="h-4 w-4 text-yellow-500 shrink-0" />
              <span className="font-semibold text-slate-800">Streetlights</span>
              <span className="font-hindi text-[11px] text-slate-500">(बिजली व लाइट)</span>
            </div>
          </div>
        </div>

        {/* Bottom Helpline */}
        <div className="relative z-10 pt-4 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <PhoneCall className="h-3.5 w-3.5 text-emerald-600" />
            <span>Toll-Free Helpline: <strong className="text-slate-900 font-mono">1800-11-2026</strong></span>
          </div>
          <span className="font-hindi text-xs text-slate-500 hidden sm:inline">निःशुल्क नागरिक सेवा</span>
        </div>

      </div>


      {/* ========================================================= */}
      {/* RIGHT HALF: HIGH-POLISH WHITE FORM CARD                   */}
      {/* ========================================================= */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-16 bg-white lg:bg-slate-50/50 min-h-screen">
        <div className="w-full max-w-md bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/80 space-y-6 auth-box-card">
          
          {/* Animated Gradient Top Accent Stripe */}
          <div className="auth-card-top-stripe" />

          {/* Form Header */}
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[11px] font-bold border border-blue-200/70 animate-float-slow">
              <ShieldCheck className="h-3.5 w-3.5 text-blue-600" />
              <span>Citizen Portal</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Citizen Login
            </h2>
            <p className="font-hindi text-xs text-slate-500">
              अपनी शिकायत दर्ज करने या स्थिति देखने के लिए लॉगिन करें
            </p>
          </div>

          {/* Error Feedback */}
          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-2.5 text-rose-700 text-xs animate-fadeIn">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
              <span className="leading-relaxed">{error}</span>
            </div>
          )}

          {/* Info / Success Feedback */}
          {infoMessage && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-2.5 text-emerald-800 text-xs animate-fadeIn">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
              <span className="leading-relaxed">{infoMessage}</span>
            </div>
          )}

          {/* Form */}
          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                <span>Email Address</span>
                <span className="font-hindi text-[11px] text-slate-400 font-normal ml-1.5">
                  (ईमेल पता)
                </span>
              </label>
              <div className="relative">
                <Mail className="h-4 w-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-3.5 py-3 text-xs sm:text-sm bg-slate-50/80 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-2xs"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-700">
                  <span>Password</span>
                  <span className="font-hindi text-[11px] text-slate-400 font-normal ml-1.5">
                    (पासवर्ड)
                  </span>
                </label>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors cursor-pointer"
                >
                  Forgot?
                </button>
              </div>

              <div className="relative">
                <Lock className="h-4 w-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-10 py-3 text-xs sm:text-sm bg-slate-50/80 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-2xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 p-0.5 rounded cursor-pointer transition-colors"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:from-blue-800 active:to-indigo-800 text-white font-bold text-xs sm:text-sm rounded-xl py-3.5 px-6 shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed group"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <span className="font-hindi font-normal text-xs text-blue-100">(लॉगिन करें)</span>
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Account Registration Link */}
          <div className="pt-5 border-t border-slate-100 text-center space-y-1">
            <p className="text-xs text-slate-600">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="font-bold text-blue-600 hover:text-blue-700 underline underline-offset-2 ml-0.5"
              >
                Create Account
              </Link>
            </p>
            <p className="font-hindi text-[11px] text-slate-400">
              नया नागरिक खाता बनाएं
            </p>
          </div>

          {/* Bottom Security Assurance */}
          <div className="pt-1 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
            <span>256-Bit Encrypted &bull; Secure Digital Citizen Gateway</span>
          </div>

        </div>
      </div>

    </div>
  );
};
