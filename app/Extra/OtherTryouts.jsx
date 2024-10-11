// import React, { useEffect, useRef, useState } from 'react';
// import grapesjs from 'grapesjs'; // Import GrapesJS
// import renderPdfContent from '../utils/renderPdfContent.jsx'; // Function to render PDF content
// import InputPdfUpload from './InputPdfUpload.jsx';
// import Pagination from './Pagination.jsx';

// function GrapesJSComponent() {
//   const [pdfData, setPdfData] = useState(null);
//   const [currentPage, setCurrentPage] = useState(0);
//   const editorRef = useRef(null);

//   useEffect(() => {
//     const editor = grapesjs.init({
//       container: editorRef.current,
//       plugins: ['gjs-blocks-basic'],
//       height: '500px',
//       width: 'auto',
//       storageManager: { autoload: 0 }, // Disable automatic loading
//       style: `
//         body {
//           font-family: Arial, sans-serif;
//         }
//         .gjs-html {
//           white-space: pre-wrap; /* Preserve spaces and line breaks */
//         }
//       `,
//     });

//     if (pdfData) {
//       const renderedContent = renderPdfContent(pdfData, editorRef, currentPage);
//       editor.setComponents(renderedContent); // Set rendered content to the editor
//     }

//     // Cleanup on component unmount
//     return () => {
//       editor.destroy();
//     };
//   }, [pdfData, currentPage]); // Trigger on pdfData or currentPage change

//   return (
//     <div className="container flex flex-col items-center mx-auto p-6 font-sans">
//       <h1 className="text-2xl font-semibold mb-4 text-blue-600">PDF Editor</h1>

//       <InputPdfUpload setPdfData={setPdfData} setCurrentPage={setCurrentPage} />
//       <div
//         ref={editorRef}
//         style={{
//           border: '1px solid #ccc',
//           minHeight: '500px',
//           overflow: 'auto', // Allow scrolling if content overflows
//         }}
//       />
//       <Pagination pdfData={pdfData} currentPage={currentPage} />
//     </div>
//   );
// }

// export default GrapesJSComponent;
