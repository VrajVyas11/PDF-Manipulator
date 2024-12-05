import React, { useState } from 'react';
import PellComponent from "../../app/utils/Pell.jsx";
import PDFEditorWorkerBased from "./PDFEditorWorkerBased.jsx";
function PDFEditor() {
  const [isBackendBased, setIsBackendBased] = useState(false);
  const toggleImplementation = (toggle) => {
    setIsBackendBased(toggle);
  };

  return (
    <div className="w-full lg:w-fit px-2 sm:px-6 lg:px-24 mb-16 flex-col items-center mx-auto p-6 lg:p-10 font-sans bg-transparent rounded-xl border border-gray-200 flex backdrop-blur-lg bg-opacity-40 text-center bg-[#1d1d1d] overflow-hidden shadow-[inset_0_0_40px_rgba(0,0,0,0.1)] h-fit">
      <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-mono mb-6 tracking-wide text-white drop-shadow-lg">
        PDF Editor
      </h1>

      <div className="flex w-full mb-8 justify-center flex-wrap sm:flex-nowrap">
        <button
          onClick={() => toggleImplementation(false)}
          className={`w-full sm:w-2/3 py-3 font-semibold text-lg transition-all duration-300 ease-in-out rounded-xl sm:rounded-r-none transform shadow-md ${!isBackendBased
            ? 'bg-gradient-to-r from-blue-500 to-sky-600 text-white hover:from-blue-600 hover:to-sky-700'
            : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-gray-300'
            }`}
        >
          Worker Based
        </button>
        <button
          onClick={() => toggleImplementation(true)}
          className={`w-full sm:w-2/3 py-3 font-semibold text-lg transition-all duration-300 ease-in-out rounded-xl sm:rounded-l-none transform shadow-md ${isBackendBased
            ? 'bg-gradient-to-r from-blue-500 to-sky-600 text-white hover:from-blue-600 hover:to-sky-700'
            : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-gray-300'
            }`}
        >
          Backend Based
        </button>
      </div>

      <div className="w-full rounded-xl sm:rounded-lg transition-transform duration-300 transform">
        {isBackendBased ? (
          <div>
            <PellComponent />
          </div>
        ) : (
          <PDFEditorWorkerBased />
        )}
      </div>
    </div>

  );
}

export default PDFEditor;
