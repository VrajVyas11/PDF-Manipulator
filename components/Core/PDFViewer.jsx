import React from "react";
import { Viewer, Worker } from "@react-pdf-viewer/core";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";

import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";

const PDFViewer = ({ file }) => {
  const defaultLayoutPluginInstance = defaultLayoutPlugin({
    sidebarTabs: (defaultTabs) => [
      // Keep only the thumbnail tab for better UX
      defaultTabs[0], // Thumbnail tab
    ],
    toolbarPlugin: {
      searchPlugin: {
        keyword: ["search", "find"],
      },
    },
  });

  return (
    <div className="relative w-full">
      {file ? (
        <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.js">
          <div
            className="h-[650px] w-full overflow-auto rounded-xl"
            style={{
              scrollbarWidth: "thin",
              scrollbarColor: "hsl(0, 0%, 30%) hsl(0, 0%, 10%)",
            }}
          >
            <Viewer
              theme="dark"
              fileUrl={file}
              defaultScale={1}
              plugins={[defaultLayoutPluginInstance]}
            />
          </div>
        </Worker>
      ) : (
        <div className="h-[650px] w-full flex items-center justify-center bg-neutral-950/90 backdrop-blur-md rounded-xl border border-neutral-800/50">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-neutral-900/50 rounded-full flex items-center justify-center border border-neutral-700/50">
              <svg
                className="w-8 h-8 text-neutral-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <p className="text-neutral-400 text-lg font-medium">No PDF to preview</p>
            <p className="text-neutral-500 text-sm mt-2">
              Upload PDF files to see the merged preview
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PDFViewer;