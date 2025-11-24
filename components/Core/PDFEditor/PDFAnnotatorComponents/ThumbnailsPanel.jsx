import { useScroll } from '@embedpdf/plugin-scroll/react';
import {
	ThumbnailsPane,
	ThumbImg,
} from '@embedpdf/plugin-thumbnail/react';
import React from 'react'

const ThumbnailsPanel = React.memo(() => {
    const { state, provides } = useScroll();
    return (
        <ThumbnailsPane
            style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgb(24, 78, 132,0.8) rgba(0, 0, 0, 0.1)' }}
            className=' relative w-full !flex-row !flex !justify-center !items-start'>
            {(meta) => {
                const isActive = state.currentPage === meta.pageIndex + 1;
                return (
                    <div
                        key={meta.pageIndex}
                        style={{
                            position: 'relative',
                            // height: meta.wrapperHeight,
                            cursor: 'pointer',
                        }}
                        className={`border  w-fit my-4 !shadow-[inset_0_0_5px_rgba(200,200,200,0.2)]  flex flex-col justify-center items-center rounded-xl overflow-hidden hover:border-blue-400/30 transition-all duration-400 ease-out bg-slate-900/40 hover:shadow-blue-500/10 ${isActive ? 'border-blue-400/40 ring-2 ring-blue-400/20 bg-blue-900/20 scale-105' : 'border-slate-700/30'}`}
                        onClick={() =>
                            provides?.scrollToPage({ pageNumber: meta.pageIndex + 1 })
                        }
                    >
                        <div
                            style={{
                                width: meta.width * 1.4,
                                height: meta.height * 1.3,
                            }}
                            className="bg-white bg-contain overflow-hidden rounded-t-xl"
                        >
                            <ThumbImg className='h-full w-full ' meta={meta} />
                        </div>
                        <div className="px-2 py-2 text-xs text-center text-white/70 font-bold bg-slate-900/40 backdrop-blur-xl">
                            page {meta.pageIndex + 1}
                        </div>
                    </div>
                );
            }}
        </ThumbnailsPane>
    );
});
ThumbnailsPanel.displayName = "ThumbnailsPanel";


export default ThumbnailsPanel