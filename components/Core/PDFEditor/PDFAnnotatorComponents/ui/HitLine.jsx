import React, { useEffect, useRef } from 'react'

function HitLine({ hit, onClick, active }) {
    const { before, match, after, truncatedLeft, truncatedRight } = hit.context;
    const ref = useRef(null);

    useEffect(() => {
        if (active && ref.current) {
            ref.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }, [active]);

    return (
        <button
            ref={ref}
            onClick={() => onClick(hit)}
            className={`w-full text-left rounded-xl p-3 transition-all duration-400 ease-out
        relative overflow-hidden border
        bg-slate-900/50 backdrop-blur-2xl
        shadow-2xl
        ${active
                    ? 'border-blue-400/40 ring-1 ring-blue-400/30 bg-blue-900/30 text-blue-200'
                    : 'border-slate-700/30 border-l-4 border-l-blue-400/30  hover:border-blue-400/30 hover:bg-slate-800/30'
                }`}
            aria-current={active ? 'true' : 'false'}
        >
            <div className="flex items-start gap-4">
                <div className="min-w-0 flex-1 text-xs leading-tight text-slate-200">
                    <div className="truncate">
                        {truncatedLeft && <span className="text-slate-400">… </span>}
                        <span className="text-slate-300">{before.slice(-15)}</span>
                        <span className="font-bold text-white mx-1">{match}</span>
                        <span className="text-slate-300">{after}</span>
                        {truncatedRight && <span className="text-slate-400"> …</span>}
                    </div>
                </div>
            </div>
        </button>
    );
}

export default HitLine