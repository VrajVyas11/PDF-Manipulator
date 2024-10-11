import React, { useState, useEffect, useRef } from 'react';
import Quill from 'quill'; // Import Quill
import renderPdfContent from '../utils/renderPdfContent.jsx'; // Function to render PDF content
import InputPdfUpload from '../components/InputPdfUpload.jsx';
import Pagination from '../components/Pagination.jsx';
import ReactDOMServer from 'react-dom/server';
import 'quill/dist/quill.snow.css'; // Import Quill's CSS

function QuillComponent() {
  const [pdfData, setPdfData] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [content, setContent] = useState('<p>Edit me!</p>'); // Default content
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const editorRef = useRef(null);
  const quillRef = useRef(null); // Quill instance reference

  useEffect(() => {
    if (quillRef.current === null && editorRef.current) {
      // Initialize Quill when the editor is ready
      quillRef.current = new Quill(editorRef.current, {
        theme: 'snow',
        placeholder: 'Edit your PDF content here...',
        modules: {
          toolbar: [
            [{ 'header': [1, 2, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
            ['link', 'image'],
            [{ 'align': [] }],
            [{ 'color': [] }, { 'background': [] }],
            ['clean']
          ]
        },
      });

      quillRef.current.on('text-change', () => {
        const newContent = quillRef.current.root.innerHTML; // Get the updated content
        setContent(newContent); // Update state with the new content
        saveToHistory(newContent); // Save content to history
      });
    }
  }, [editorRef]);

  useEffect(() => {
    if (pdfData) {
      const renderedContent = renderPdfContent(pdfData, editorRef, currentPage);
      // Ensure the content is a string and preserves whitespace
      const contentString = typeof renderedContent === 'string' 
        ? renderedContent 
        : ReactDOMServer.renderToStaticMarkup(renderedContent);
      
      setContent(contentString); // Set content as a string
      if (quillRef.current) {
        quillRef.current.clipboard.dangerouslyPasteHTML(contentString); // Update Quill content
      }
    }
  }, [pdfData, currentPage]);

  const saveToHistory = (newContent) => {
    const newHistory = [...history.slice(0, historyIndex + 1), newContent];
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  return (
    <div className="container flex flex-col items-center mx-auto p-6 font-sans">
      <h1 className="text-2xl font-semibold mb-4 text-blue-600">PDF Editor</h1>

      <InputPdfUpload setPdfData={setPdfData} setCurrentPage={setCurrentPage} />
      
      <div
        ref={editorRef} // Reference to the DOM element where Quill is mounted
        style={{
          border: '1px solid #ccc',
          padding: '10px',
          background: 'white',
          minHeight: '200px',
          whiteSpace: 'pre-wrap', // Preserve spaces and line breaks
        }}
      />
      
      <Pagination pdfData={pdfData} currentPage={currentPage} editorRef={editorRef} setCurrentPage={setCurrentPage} />
    </div>
  );
}

export default QuillComponent;
