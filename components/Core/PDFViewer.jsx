import React from 'react';
import { Viewer, Worker } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';

import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';

const PDFViewer = ({ file }) => {
  const defaultLayoutPluginInstance = defaultLayoutPlugin({
    sidebarTabs: (defaultTabs) => [
      // Keep only the thumbnail tab for better UX
      defaultTabs[0], // Thumbnail tab
    ],
    toolbarPlugin: {
      searchPlugin: {
        keyword: ['search', 'find'],
      },
    },
  });

  return (
    <div className="relative w-full">
      {file ? (
        <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.js">
          <div 
            className="h-[650px] w-full overflow-auto rounded-xl border-2 border-slate-700/50 bg-slate-900/50 backdrop-blur-sm shadow-2xl" 
            style={{
              scrollbarWidth: "thin",
              scrollbarColor: "rgba(59, 130, 246, 0.8) rgba(30, 41, 59, 0.6)",
            }}
          >
            <style jsx>{`
              /* Custom scrollbar for webkit browsers */
              .h-\\[650px\\]::-webkit-scrollbar {
                width: 8px;
                height: 8px;
              }
              
              .h-\\[650px\\]::-webkit-scrollbar-track {
                background: rgba(30, 41, 59, 0.6);
                border-radius: 4px;
              }
              
              .h-\\[650px\\]::-webkit-scrollbar-thumb {
                background: rgba(59, 130, 246, 0.8);
                border-radius: 4px;
                transition: background 0.3s ease;
              }
              
              .h-\\[650px\\]::-webkit-scrollbar-thumb:hover {
                background: rgba(59, 130, 246, 1);
              }

              /* PDF Viewer Dark Theme Customization */
              .rpv-core__viewer {
                background-color: rgba(15, 23, 42, 0.8) !important;
              }
              
              .rpv-default-layout__container {
                background-color: rgba(15, 23, 42, 0.9) !important;
                border-radius: 12px;
                overflow: hidden;
              }
              
              .rpv-toolbar {
                background-color: rgba(30, 41, 59, 0.95) !important;
                border-bottom: 1px solid rgba(59, 130, 246, 0.3) !important;
                backdrop-filter: blur(10px);
              }
              
              .rpv-toolbar__item button {
                color: rgba(226, 232, 240, 0.9) !important;
                transition: all 0.3s ease;
              }
              
              .rpv-toolbar__item button:hover {
                background-color: rgba(59, 130, 246, 0.2) !important;
                color: rgba(59, 130, 246, 1) !important;
                transform: scale(1.05);
              }
              
              .rpv-core__page-layer {
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
                border-radius: 8px;
                margin: 10px;
                border: 1px solid rgba(59, 130, 246, 0.2);
              }
              
              .rpv-sidebar {
                background-color: rgba(30, 41, 59, 0.95) !important;
                border-right: 1px solid rgba(59, 130, 246, 0.3) !important;
                backdrop-filter: blur(10px);
              }
              
              .rpv-sidebar__tab {
                color: rgba(226, 232, 240, 0.8) !important;
              }
              
              .rpv-sidebar__tab--selected {
                background-color: rgba(59, 130, 246, 0.2) !important;
                color: rgba(59, 130, 246, 1) !important;
                border-radius: 6px;
              }
              
              .rpv-thumbnail__container {
                background-color: rgba(15, 23, 42, 0.6) !important;
                border: 1px solid rgba(59, 130, 246, 0.2);
                border-radius: 6px;
                transition: all 0.3s ease;
              }
              
              .rpv-thumbnail__container:hover {
                border-color: rgba(59, 130, 246, 0.5);
                transform: scale(1.02);
                box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
              }
              
              .rpv-search__popover {
                background-color: rgba(30, 41, 59, 0.95) !important;
                border: 1px solid rgba(59, 130, 246, 0.3) !important;
                border-radius: 8px;
                backdrop-filter: blur(10px);
              }
              
              .rpv-search__input {
                background-color: rgba(15, 23, 42, 0.8) !important;
                color: rgba(226, 232, 240, 1) !important;
                border: 1px solid rgba(59, 130, 246, 0.3) !important;
                border-radius: 6px;
              }
              
              .rpv-search__input:focus {
                border-color: rgba(59, 130, 246, 0.6) !important;
                box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2) !important;
              }
              
              /* Loading spinner customization */
              .rpv-core__spinner {
                border-color: rgba(59, 130, 246, 0.3) !important;
                border-top-color: rgba(59, 130, 246, 1) !important;
              }
              
              /* Page navigation */
              .rpv-page-navigation__input {
                background-color: rgba(15, 23, 42, 0.8) !important;
                color: rgba(226, 232, 240, 1) !important;
                border: 1px solid rgba(59, 130, 246, 0.3) !important;
                border-radius: 4px;
              }
              
              /* Zoom controls */
              .rpv-zoom__popover {
                background-color: rgba(30, 41, 59, 0.95) !important;
                border: 1px solid rgba(59, 130, 246, 0.3) !important;
                border-radius: 8px;
                backdrop-filter: blur(10px);
              }
              
              .rpv-menu__item {
                color: rgba(226, 232, 240, 0.9) !important;
                transition: all 0.2s ease;
              }
              
              .rpv-menu__item:hover {
                background-color: rgba(59, 130, 246, 0.2) !important;
                color: rgba(59, 130, 246, 1) !important;
              }
            `}</style>
            
            <Viewer
              theme="dark"
              fileUrl={file}
              defaultScale={1.2}
              plugins={[defaultLayoutPluginInstance]}
            />
          </div>
        </Worker>
      ) : (
        <div className="h-[650px] w-full flex items-center justify-center bg-slate-900/50 backdrop-blur-sm rounded-xl border-2 border-dashed border-slate-600/50">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-slate-700/50 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-slate-400 text-lg font-medium">No PDF to preview</p>
            <p className="text-slate-500 text-sm mt-2">Upload PDF files to see the merged preview</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PDFViewer;