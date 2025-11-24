import React from 'react'

 function Button({
    id,
    children,
    onClick,
    active = false,
    disabled = false,
    className = '',
    tooltip,
    ref,
    ...props
}) {
    return (
        <button
            id={id}
            ref={ref}
            onClick={onClick}
            disabled={disabled}
            title={tooltip}
            className={`flex h-9 min-w-[36px] items-center justify-center gap-2 rounded-xl px-3 text-sm transition-all duration-300 backdrop-blur-xl border border-slate-700/30
        ${active ? 'bg-blue-900/40 text-white ring-2 ring-blue-400/30 shadow-lg shadow-blue-500/20' : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50 hover:text-white'}
        ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
}

export default Button