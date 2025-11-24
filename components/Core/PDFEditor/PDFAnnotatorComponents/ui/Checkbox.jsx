import React from 'react'

 const Checkbox = ({ label, checked, onChange }) => {
    return (
        <label className="flex items-center gap-3 cursor-pointer select-none text-slate-300">
            <span
                className={`relative flex h-5 w-5 items-center justify-center rounded-[7px]
          transition-all duration-300 backdrop-blur-xl
          ${checked ? 'bg-blue-900/50 border border-blue-500/30 shadow-lg shadow-blue-500/20' : 'bg-slate-800/50 border border-slate-700/30'}`}
            >
                <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => onChange(e.target.checked)}
                    className="absolute inset-0 m-0 h-full w-full opacity-0 cursor-pointer"
                    aria-checked={checked}
                />
                <svg
                    viewBox="0 0 24 24"
                    className={`h-3 w-3 transition-opacity duration-300 ${checked ? 'opacity-100 text-blue-200' : 'opacity-0'}`}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={3}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <polyline points="20 6 9 17 4 12" />
                </svg>
            </span>
            <span className="select-none text-xs tracking-tight">{label}</span>
        </label>
    );
};

export default Checkbox