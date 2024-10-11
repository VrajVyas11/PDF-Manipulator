     
   const [content, setContent] = useState('<p>Edit me!</p>');
   const [history, setHistory] = useState([]);
   const [historyIndex, setHistoryIndex] = useState(-1);
  const handleInput = (e) => {
    const newContent = e.currentTarget.innerHTML;

    if (newContent !== content) {
      const selection = window.getSelection();
      const range = selection.rangeCount > 0 ? selection.getRangeAt(0) : null;

      setContent(newContent);
      saveToHistory(newContent);

      setTimeout(() => {
        if (range) {
          selection.removeAllRanges();
          selection.addRange(range);
        }
      }, 0);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // Prevent default Enter behavior
      const selection = window.getSelection();
      if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const br = document.createElement('br');
        range.insertNode(br); // Insert a <br> element
        range.setStartAfter(br); // Move the cursor after the <br>
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range); // Update the selection
      }
    }
  };

  const saveToHistory = (newContent) => {
    const newHistory = [...history.slice(0, historyIndex + 1), newContent];
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setContent(history[historyIndex - 1]);
    }
  };

  const clearSameStyles = (range, styleType) => {
    const selectedContents = range.cloneContents();
    const spans = selectedContents.querySelectorAll('span');

    spans.forEach(span => {
      const styleValue = span.style[styleType];
      if (styleValue) {
        span.removeAttribute('style');
        const parent = span.parentNode;
        while (span.firstChild) {
          parent.insertBefore(span.firstChild, span);
        }
        parent.removeChild(span);
      }
    });
  };

  const applyStyle = (style) => {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      clearSameStyles(range, 'fontSize');
      clearSameStyles(range, 'fontFamily');

      document.execCommand(style);
      saveToHistory(editorRef.current.innerHTML);
    }
  };

  const setFontSize = (size) => {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      clearSameStyles(range, 'fontSize');

      const selectedContent = range.cloneContents();
      const span = document.createElement('span');
      span.style.fontSize = `${size}px`;
      span.appendChild(selectedContent);

      range.deleteContents();
      range.insertNode(span);

      saveToHistory(editorRef.current.innerHTML);
    }
  };

  const setFontFamily = (family) => {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      clearSameStyles(range, 'fontFamily');

      const selectedContent = range.cloneContents();
      const span = document.createElement('span');
      span.style.fontFamily = family;
      span.appendChild(selectedContent);

      range.deleteContents();
      range.insertNode(span);

      saveToHistory(editorRef.current.innerHTML);
    }
  };

  const setTextColor = (color) => {
    document.execCommand('foreColor', false, color);
    saveToHistory(editorRef.current.innerHTML);
  };

  const setBackgroundColor = (color) => {
    document.execCommand('backColor', false, color);
    saveToHistory(editorRef.current.innerHTML);
  };

  const insertImage = (imageSrc) => {
    const img = document.createElement('img');
    img.src = imageSrc;
    img.style.maxWidth = '100%';
    const selection = document.getSelection();
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      range.insertNode(img);
      saveToHistory(editorRef.current.innerHTML);
    }
  };
    
     
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => insertImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const renderedContent = pdfData ? ReactDOMServer.renderToStaticMarkup(renderPdfContent(pdfData, editorRef, currentPage)) : content;

     {/* <InputPdfUpload setPdfData={setPdfData} setCurrentPage={setCurrentPage} /> 
     <Toolbar
        applyStyle={applyStyle}
        setFontSize={setFontSize}
        setFontFamily={setFontFamily}
        undo={undo}
        setTextColor={setTextColor}
        setBackgroundColor={setBackgroundColor}
        handleImageUpload={handleImageUpload}
      />
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        style={{
          border: '1px solid #ccc',
          padding: '10px',
          background: 'white',
          minHeight: '200px',
          whiteSpace: 'pre-wrap',
          overflowWrap: 'break-word',
        }}
        suppressContentEditableWarning={true}
        dangerouslySetInnerHTML={{ __html: renderedContent.replace(/&amp;/g, '&') }}
      />  */}