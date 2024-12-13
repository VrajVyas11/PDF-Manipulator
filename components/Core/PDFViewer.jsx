import React from 'react';
import { Viewer, Worker } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';

import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';

const PDFViewer = ({ file }) => {
  const defaultLayoutPluginInstance = defaultLayoutPlugin();

  return (
    <div>
      {file && (
        <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.js">
          <div className="h-[600px] overflow-auto" style={{
            scrollbarWidth: "thin",
            scrollbarColor: "rgba(100, 100, 100, 0.6) rgba(100, 100, 100, 0.1)",
          }}>
            <Viewer
              theme={"dark"}
              fileUrl={file}
              defaultScale={1}
              plugins={[defaultLayoutPluginInstance]}
            />
          </div>
        </Worker>
      )}
    </div>
  );
};

export default PDFViewer;
