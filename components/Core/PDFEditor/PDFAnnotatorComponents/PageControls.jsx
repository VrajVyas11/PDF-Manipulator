import { useScroll } from '@embedpdf/plugin-scroll/react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import React from 'react'

const PageControls = () => {
    const { state: scrollState, provides: scrollApi } = useScroll();
    const totalPages = scrollState?.totalPages || 0;
    const currentPage = scrollState?.currentPage || 1;

    const handlePageChange = (e) => {
        const page = parseInt(e.target.value, 10);
        if (page >= 1 && page <= totalPages) {
            scrollApi?.scrollToPage({ pageNumber: page });
        }
    };

    if (!totalPages) return <div className="flex items-center justify-center py-4 text-slate-400">Assembling fragments...</div>;

    return (
        <div className="absolute w-full flex justify-center gap-4 items-end pb-4 h-full inset-0 pointer-events-none">
            <button
                onClick={() => scrollApi?.scrollToPreviousPage()}
                disabled={currentPage <= 1}
                className="p-3 relative z-50 pointer-events-auto !shadow-[inset_0_0_5px_rgba(100,100,255,0.6)] bg-gray-950/70 text-white rounded-xl transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed backdrop-blur-xl"
            >
                <ChevronUp strokeWidth={3} size={16} className="text-slate-300" />
            </button>
            <div className="flex pointer-events-auto relative z-50 w-fit items-center space-x-2 !shadow-[inset_0_0_5px_rgba(200,200,200,0.2)] bg-gray-950/70 text-white rounded-xl px-4 py-2.5 border border-slate-700/30 backdrop-blur-xl">
                <input
                    type="number"
                    value={currentPage}
                    min={1}
                    max={totalPages}
                    onChange={handlePageChange}
                    className="w-5 bg-transparent text-center font-semibold text-xs focus:outline-none text-white"
                />
                <span className="text-xs font-semibold text-slate-400 pr-2"> / {totalPages}</span>
            </div>
            <button
                onClick={() => scrollApi?.scrollToNextPage()}
                disabled={currentPage >= totalPages}
                className="p-3 pointer-events-auto relative z-50 !shadow-[inset_0_0_5px_rgba(100,100,255,0.6)] bg-gray-950/70 text-white rounded-xl transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed backdrop-blur-xl"
            >
                <ChevronDown strokeWidth={3} size={16} className="text-slate-300" />
            </button>
        </div>
    );
};

export default PageControls