import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, Shield, ArrowLeft } from 'lucide-react';

export const NotFound = () => {
  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6 text-center">
      <div className="p-4 bg-white/10 rounded-2xl mb-4 border border-white/10">
        <Building2 className="h-12 w-12 text-cyan-400" />
      </div>

      <h1 className="text-4xl font-black tracking-tight mb-2">404 - Page Not Found</h1>
      <p className="text-slate-400 text-sm max-w-md mb-8">
        The requested municipal address or resource could not be found. Please select an authorized entry point below.
      </p>

      <div className="flex flex-col sm:flex-row items-center gap-4">
        <Link
          to="/dashboard"
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-colors"
        >
          Citizen Portal Dashboard
        </Link>
        <Link
          to="/admin/login"
          className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-cyan-400 rounded-xl text-xs font-bold border border-slate-700 transition-colors flex items-center gap-1.5"
        >
          <Shield className="h-3.5 w-3.5" />
          <span>Admin Portal Login</span>
        </Link>
      </div>
    </div>
  );
};
