import React, { useState, useRef } from 'react';
import Pagination from '../../utils/Pagination.jsx';
import PellComponent from "../../utils/Pell.jsx";
import PDFEditorWorkerBased from "./PDFEditorWorkerBased.jsx";

function PDFEditor() {
  const [pdfData, setPdfData] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [isBackendBased, setIsBackendBased] = useState(true); // Toggle state for backend vs worker

  const editorRef = useRef(null);

  const toggleImplementation = () => {
    setIsBackendBased(prev => !prev);
  };

  return (
    <div className="container flex flex-col items-center mx-auto p-6 font-sans">
      <button onClick={toggleImplementation} className="mb-4 p-2 bg-blue-500 text-white rounded">
        Switch to {isBackendBased ? 'Worker Based' : 'Backend Based'}
      </button>
      
      {isBackendBased ? (
        <div>
          <h2>Backend Based Implementation</h2>
          <PellComponent />
          <Pagination pdfData={pdfData} currentPage={currentPage} editorRef={editorRef} setCurrentPage={setCurrentPage} />
        </div>
      ) : (
        <PDFEditorWorkerBased pdfData={pdfData} currentPage={currentPage} editorRef={editorRef} setCurrentPage={setCurrentPage} />
      )}
    </div>
  );
}

export default PDFEditor;
