import React from 'react';

/**
 * Official Civic & Grievance Portal Emblem Logo Component
 * Renders the new Smart Grievance System crest with tricolor accent,
 * golden justice scales, and smart resolution checkmark.
 */
export const CivicLogo = ({
  size = 'md',
  className = '',
  showText = false,
  textVariant = 'dark'
}) => {
  const sizeMap = {
    xs: 'w-7 h-7',
    sm: 'w-9 h-9',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-20 h-20'
  };

  const dimensionClass = sizeMap[size] || sizeMap.md;

  return (
    <div className={`inline-flex items-center gap-3.5 ${className}`}>
      <div className="relative group shrink-0">
        <div
          className={`${dimensionClass} rounded-2xl bg-white p-1 border border-slate-200/90 shadow-md shadow-blue-900/10 flex items-center justify-center overflow-hidden transition-all duration-300 group-hover:scale-105 group-hover:shadow-lg group-hover:border-blue-300`}
        >
          <img
            src="/images/grievance_logo.png"
            alt="Smart Grievance System Official Logo"
            className="w-full h-full object-contain"
          />
        </div>
        {/* Ambient subtle aura on hover */}
        <div className="absolute -inset-1 bg-gradient-to-r from-orange-400 via-blue-500 to-emerald-400 rounded-2xl blur-xs opacity-0 group-hover:opacity-30 transition-opacity -z-10 pointer-events-none"></div>
      </div>

      {showText && (
        <div className="space-y-0.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`text-xl sm:text-2xl font-black tracking-tight ${
                textVariant === 'light' ? 'text-white' : 'text-slate-900'
              }`}
            >
              Smart Grievance System
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-blue-100 text-blue-800 border border-blue-200">
              Official Portal
            </span>
          </div>
          <p
            className={`font-hindi text-xs sm:text-[13px] font-bold ${
              textVariant === 'light' ? 'text-sky-200' : 'text-blue-950'
            }`}
          >
            स्मार्ट जन-शिकायत निवारण एवं त्वरित नागरिक सेवा पोर्टल
          </p>
          <p
            className={`text-[11px] hidden sm:block ${
              textVariant === 'light' ? 'text-slate-300' : 'text-slate-500'
            }`}
          >
            Centralized Municipal Grievance Redressal & Rapid Ground Response
          </p>
        </div>
      )}
    </div>
  );
};
