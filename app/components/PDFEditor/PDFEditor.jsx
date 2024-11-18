import React, { useState, useRef } from 'react';
import Pagination from '../../utils/Pagination.jsx';
import PellComponent from "../../utils/Pell.jsx";
import PDFEditorWorkerBased from "./PDFEditorWorkerBased.jsx";
function PDFEditor() {
  const [pdfData, setPdfData] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [isBackendBased, setIsBackendBased] = useState(false); 

  const editorRef = useRef(null);

  const toggleImplementation = (toggle) => {
    setIsBackendBased(toggle);
  };

  return (
    <div className=" w-fit px-24 mb-16 flex-col items-center mx-auto p-10 font-sans bg-transparent  rounded-xl border border-gray-200 flex  backdrop-blur-lg  bg-opacity-40   text-center  bg-[#1d1d1d]  overflow-hidden  shadow-[inset_0_0_40px_rgba(0,0,0,0.1)] h-fit ">
    <h1 className="text-5xl font-bold font-mono mb-6 tracking-wide text-white drop-shadow-lg">PDF Editor</h1>

    <div className="flex w-full  mb-8 justify-center">
  <button
    onClick={() => toggleImplementation(false)}
    className={`w-2/3  py-3 font-semibold text-lg transition-all duration-300 ease-in-out rounded-xl rounded-r-none transform shadow-md ${
      !isBackendBased
        ? 'bg-gradient-to-r from-blue-500 to-sky-600 text-white hover:from-blue-600 hover:to-sky-700 shadow-inner shadow-blue-500'
        : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-gray-300 shadow-inner'
    }`}
  >
    Worker Based
  </button>
  <button
    onClick={() => toggleImplementation(true)}
    className={`w-2/3  py-3 font-semibold text-lg transition-all duration-300 ease-in-out rounded-xl rounded-l-none transform shadow-md ${
      isBackendBased
      ? 'bg-gradient-to-r from-blue-500 to-sky-600 text-white hover:from-blue-600 hover:to-sky-700 shadow-inner shadow-blue-500'
      : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-gray-300 shadow-inner'
  }`}
  >
    Backend Based
  </button>
</div>


    <div className="w-full rounded-lg transition-transform duration-300 transform">
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
        )}
    </div>
</div>

  );
}

export default PDFEditor;
