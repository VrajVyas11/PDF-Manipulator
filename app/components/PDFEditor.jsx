import React, { useState, useRef } from 'react';
import Pagination from '../utils/Pagination.jsx';
import PellComponent from "../utils/Pell.jsx"


function PDFEditor() {
  const [pdfData, setPdfData] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);

  const editorRef = useRef(null);

  return (
    <div className="container flex flex-col items-center mx-auto p-6 font-sans">
      <PellComponent />
      <Pagination pdfData={pdfData} currentPage={currentPage} editorRef={editorRef} setCurrentPage={setCurrentPage} />
    </div>
  );
}

export default PDFEditor;