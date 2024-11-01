import React, { useState, useRef } from 'react';
import Pagination from '../../utils/Pagination.jsx';
import PellComponent from "../../utils/Pell.jsx";
import PDFEditorWorkerBased from "./PDFEditorWorkerBased.jsx";
import PdfGenerator from "./temp.jsx"
function PDFEditor() {
  const [pdfData, setPdfData] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [isBackendBased, setIsBackendBased] = useState(true); // Toggle state for backend vs worker

  const editorRef = useRef(null);

  const toggleImplementation = (toggle) => {
    setIsBackendBased(toggle);
  };

  return (
    <div className="bg-opacity-20 backdrop-blur-xl w-fit flex flex-col items-center mx-auto p-10 font-sans bg-gray-200  shadow-xl rounded-xl border border-gray-200">
    <h1 className="text-5xl font-bold font-mono mb-6 tracking-wide text-blue-700 drop-shadow-lg">PDF Editor</h1>

    <div className="flex mb-8">

        <button
            onClick={() => toggleImplementation(false)}
            className={`w-40 py-3  font-semibold text-lg transition-all duration-300 ease-in-out rounded-full rounded-r-none transform  shadow-md ${
                !isBackendBased
                    ? 'bg-gradient-to-r from-sky-400 to-sky-500 text-white hover:from-sky-500 hover:to-sky-600'
                    : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
            }`}
        >
            Worker Based
        </button>
        <button
            onClick={() => toggleImplementation(true)}
            className={`w-40 py-3 font-semibold text-lg transition-all duration-300 ease-in-out rounded-full rounded-l-none transform shadow-md ${
                isBackendBased
                    ? 'bg-gradient-to-r from-sky-400 to-sky-500 text-white hover:from-sky-500 hover:to-sky-600'
                    : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
            }`}
        >
            Backend Based
        </button>
    </div>

    <div className="w-full bg-white p-8 rounded-lg shadow-lg border border-gray-300 transition-transform duration-300 transform">
        {isBackendBased ? (
            <div>
                <PellComponent />
                <Pagination
                    pdfData={pdfData}
                    currentPage={currentPage}
                    editorRef={editorRef}
                    setCurrentPage={setCurrentPage}
                />
            </div>
        ) : (
            <PDFEditorWorkerBased/>
            // <PdfGenerator/>
        )}
    </div>
</div>

  );
}

export default PDFEditor;
