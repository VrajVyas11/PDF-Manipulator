import React, { useState, useRef, useEffect } from 'react';
// import Pell from 'pell';
// const Pell = dynamic(() => import('pell'), { ssr: false });
import renderPdfContent from '../../../app/utils/tools/renderPdfContent.jsx';
import InputPdfUpload from '../../../app/utils/tools/InputPdfUpload.jsx';
import Pagination from '../../../app/utils/tools/Pagination.jsx';
import ReactDOMServer from 'react-dom/server';
import Toolbar from '../../../app/utils/tools/ToolbarPell.jsx';
import 'pell/dist/pell.css';
// import dynamic from 'next/dynamic.js';

function PDFEditorSimpleText() {
  const [pdfData, setPdfData] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [content, setContent] = useState('<p>Edit me!</p>');
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const editorRef = useRef(null);

  useEffect(() => {
    if (pdfData) {
      const renderedContent = renderPdfContent(pdfData, editorRef, currentPage);
      const contentString = typeof renderedContent === 'string'
        ? renderedContent
        : ReactDOMServer.renderToStaticMarkup(renderedContent);

      setContent(contentString);
    }
  }, [pdfData, currentPage]);

  const saveToHistory = (newContent) => {
    const newHistory = [...history.slice(0, historyIndex + 1), newContent];
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const handleEditorChange = () => {
    const newContent = editorRef.current.innerHTML;
    setContent(newContent);
    saveToHistory(newContent);
  };

  // const handleKeyDown = (e) => {
  //   if (e.key === 'Enter') {
  //     e.preventDefault(); // Prevent the default behavior of the Enter key

  //     const selection = window.getSelection();
  //     if (!selection.rangeCount) return;

  //     const range = selection.getRangeAt(0);
  //     const br = document.createElement('br');

  //     // Insert the <br> at the current cursor position
  //     range.insertNode(br);

  //     // Move the cursor to the next position after the <br>
  //     range.setStartAfter(br);
  //     range.collapse(true);

  //     // Update the selection with the new range
  //     selection.removeAllRanges();
  //     selection.addRange(range);

  //     handleEditorChange(); // Update content after insertion
  //   }
  // };

  useEffect(() => {
    if (editorRef.current) {
      const editorElement = document.createElement('div');
      editorElement.contentEditable = true;
      editorElement.innerHTML = content;
      editorRef.current.innerHTML = content;
    }
  }, [content]);

  // useEffect(() => {

  //   Pell.init({
  //     element: editorRef.current,
  //     onChange: handleEditorChange,
  //     defaultParagraphSeparator: 'p',
  //     styleWithCSS: true,
  //   });

  //   editorRef.current.innerHTML = content;

  //   editorRef.current.addEventListener('keydown', handleKeyDown);

  // }, [content]);

  const execCommand = (command) => {
    document.execCommand(command, false, null);
    handleEditorChange();
  };


  const applyStyle = (style) => {
    execCommand(style);
  };

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setContent(history[historyIndex - 1]);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setContent(history[historyIndex + 1]);
    }
  };

  const setFontSize = (size) => {
    document.execCommand('fontSize', false, size);
    handleEditorChange();
  };

  const setFontFamily = (font) => {
    document.execCommand('fontName', false, font);
    handleEditorChange();
  };

  const setTextColor = (color) => {
    document.execCommand('foreColor', false, color);
    handleEditorChange();
  };

  const setBackgroundColor = (color) => {
    document.execCommand('backColor', false, color);
    handleEditorChange();
  };

  const setHighlight = () => {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const span = document.createElement('span');
      span.style.backgroundColor = 'yellow'; // Highlight color
      range.surroundContents(span);
      handleEditorChange();
    }
  };

  const applyJustify = (alignment) => {
    document.execCommand(`justify${alignment.charAt(0).toUpperCase() + alignment.slice(1)}`);
    handleEditorChange();
  };

  const insertList = () => {
    const isOrderedList = confirm("Insert ordered list? (OK for Yes, Cancel for No)");
    document.execCommand(isOrderedList ? 'insertOrderedList' : 'insertUnorderedList');
    handleEditorChange();
  };

  const applyStrikethrough = () => {
    execCommand('strikeThrough');
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = document.createElement('img');
        img.src = e.target.result;
        img.style.maxWidth = '100%'; // Adjust image size if needed
        document.execCommand('insertHTML', false, img.outerHTML);
        handleEditorChange();
      };
      reader.readAsDataURL(file);
    }
  };
  // Other methods like undo, redo, apply styles, etc. would go here...

  return (
    <div className="container flex flex-col justify-center items-center text-white  h-fit w-full backdrop-blur-lg bg-opacity-40 bg-[#1a1a1a] overflow-hidden shadow-[inset_0_0_30px_rgba(0,0,0,1)] rounded-lg mx-auto font-sans">
      <InputPdfUpload setPdfData={setPdfData} setCurrentPage={setCurrentPage} />

      {pdfData && (
        <div className='bg-gray-300 w-full justify-center items-center shadow-[inset_0_0_30px_rgba(0,0,0,0.7)] bg-opacity-20 mt-10 p-4 mx-6 pb-0 md:pb-4 pt-2 flex flex-col gap-4 rounded-2xl'>
          <Toolbar
            applyStyle={applyStyle}
            setFontSize={setFontSize}
            setFontFamily={setFontFamily}
            undo={undo}
            redo={redo}
            setHighlight={setHighlight}
            handleImageUpload={handleImageUpload}
            setTextColor={setTextColor}
            setBackgroundColor={setBackgroundColor}
            applyJustify={applyJustify}
            insertList={insertList}
            applyStrikethrough={applyStrikethrough}
          />
          <div className="sm-320:-mt-56 sm-374:-mt-44 sm:-mt-0 sm-320:scale-[42%] sm-374:scale-[54%] sm:scale-75 md:scale-[100%] lg:scale-[100%] xl:scale-[100%]">
            <div
              ref={editorRef}
              style={{
                border: '1px solid #ccc',
                padding: '10px',
                background: 'white',
                minHeight: '50px',
                minWidth: '700px',
                whiteSpace: 'pre-wrap',
              }}
              contentEditable={true}
              suppressContentEditableWarning={true}
              className="w-full text-start"
            />
          </div>
        </div>
      )}
      <Pagination pdfData={pdfData} currentPage={currentPage} editorRef={editorRef} setCurrentPage={setCurrentPage} />
    </div>

  );
}

export default PDFEditorSimpleText;
