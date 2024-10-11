import React, { useState, useRef, useEffect } from 'react';
import JoditEditor from 'jodit-react'; // Import JoditEditor
import renderPdfContent from '../utils/renderPdfContent.jsx'; // Function to render PDF content
import InputPdfUpload from '../components/InputPdfUpload.jsx';
import Pagination from '../components/Pagination.jsx';
import ReactDOMServer from 'react-dom/server';

function JoditComponent() {
  const [pdfData, setPdfData] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [content, setContent] = useState('<p>Edit me!</p>'); // Default content
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const editorRef = useRef(null);

  useEffect(() => {
    if (pdfData) {
      const renderedContent = renderPdfContent(pdfData, editorRef, currentPage);
      // Ensure the content is a string and preserves whitespace
      const contentString = typeof renderedContent === 'string' 
        ? renderedContent 
        : ReactDOMServer.renderToStaticMarkup(renderedContent);
      
      setContent(contentString); // Set content as a string
    }
  }, [pdfData, currentPage]); // Trigger on pdfData or currentPage change

  const saveToHistory = (newContent) => {
    const newHistory = [...history.slice(0, historyIndex + 1), newContent];
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const handleEditorChange = (newContent) => {
    setContent(newContent); // Update the content directly
    saveToHistory(newContent); // Save the new content to history
  };

  return (
    <div className="container flex flex-col items-center mx-auto p-6 font-sans">
      <h1 className="text-2xl font-semibold mb-4 text-blue-600">PDF Editor</h1>

      <InputPdfUpload setPdfData={setPdfData} setCurrentPage={setCurrentPage} />
      <JoditEditor
        ref={editorRef}
        value={content} // Use content as string
        onChange={handleEditorChange}
        config={{
          enter: 'BR',
          cleanOnPaste: false,
          toolbarButtonSize: 'small',
          preserveWhitespace: true,
          useClasses: false,
          defaultMode: '1',
          removeEmptyNodes: false,
        }}
        style={{
          border: '1px solid #ccc',
          padding: '10px',
          background: "white",
          minHeight: '200px',
          whiteSpace: 'pre-wrap', // Preserve spaces and line breaks
        }}
      />
      <Pagination pdfData={pdfData} currentPage={currentPage} editorRef={editorRef} setCurrentPage={setCurrentPage} />
    </div>
  );
}

export default JoditComponent;
