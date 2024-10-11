import React, { useEffect, useRef, useState } from 'react';
import JoditEditor from 'jodit-react'; // Import JoditEditor
const PdfExtractor = () => {
    const [allText, setAllText] = useState([]);
    const [selectedPage, setSelectedPage] = useState(0);
    const pdfInputRef = useRef();
    const pwdInputRef = useRef();
    const textareaRef = useRef();
    const [pdfData, setPdfData] = useState(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [content, setContent] = useState('<p>Edit me!</p>');
    const [history, setHistory] = useState([]);
    const [historyIndex, setHistoryIndex] = useState(-1);
    const editorRef = useRef(null);

    useEffect(() => {
      if (pdfData) {
        const renderedContent = ReactDOMServer.renderToStaticMarkup(renderPdfContent(pdfData, editorRef, currentPage));
        setContent(renderedContent);
      }
    }, [pdfData]);
  
    const saveToHistory = (newContent) => {
      const newHistory = [...history.slice(0, historyIndex + 1), newContent];
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    };
  
    const handleEditorChange = (newContent) => {
      // Preserve spaces and special characters
      const formattedContent = newContent.replace(/ /g, ' ')
      setContent(formattedContent);
      saveToHistory(formattedContent);
    };
  
    useEffect(() => {
        pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js";
    }, []);

    const handleUpload = () => {
        const file = pdfInputRef.current.files[0];
        const password = pwdInputRef.current.value;

        if (file && file.type === "application/pdf") {
            const fr = new FileReader();
            fr.readAsDataURL(file);
            fr.onload = () => {
                const res = fr.result;
                extractText(res, password !== "");
            };
        } else {
            alert("Select a valid PDF file");
        }
    };
    // console.log(allText)
    const extractText = async (url, hasPassword) => {
        try {
            const pdf = await pdfjsLib.getDocument({ url, password: hasPassword ? pwdInputRef.current.value : undefined }).promise;
            const pages = pdf.numPages;
            const extractedTexts = [];
            for (let i = 1; i <= pages; i++) {
                const page = await pdf.getPage(i);
                console.log(page)
                const txt = await page.getTextContent();
                const text = txt.items.map((s) => s.str).join("");
                extractedTexts.push(text);
            }

            setAllText(extractedTexts);
            setSelectedPage(0);
        } catch (err) {
            alert(err.message);
        }
    };

    const handlePageChange = (e) => {
        setSelectedPage(e.target.value - 1);
    };

    const downloadText = () => {
        const textToDownload = allText[selectedPage];
        const blob = new Blob([textToDownload], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'extractedText.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    return (
        <div className="pdfExtractor">
            <h1>PDF To Text Extractor</h1>
            <input type="file" ref={pdfInputRef} />
            <input type="password" ref={pwdInputRef} placeholder="Optional Password" />
            <button onClick={handleUpload}>Upload</button>

            {allText.length > 0 && (
                <div>
                    <span>Select Page</span>
                    <select onChange={handlePageChange}>
                        {allText.map((_, index) => (
                            <option key={index} value={index + 1}>
                                {index + 1}
                            </option>
                        ))}
                    </select>
                    <button onClick={downloadText}>Download Extracted Text</button>
                    <textarea ref={textareaRef} value={allText[selectedPage]} readOnly />
                </div>

                
            )}
              <JoditEditor
        ref={editorRef}
        value={allText.join()}
        onChange={handleEditorChange}
        config={{
          enter: 'BR', // Insert a <br> instead of a block element on Enter
          cleanOnPaste: false, // Prevent cleaning whitespace
          toolbarButtonSize: 'small', // Adjust button sizes if necessary
          preserveWhitespace: true, // Preserve whitespace
          useClasses: false, // Use inline styles instead of classes
          defaultMode: '1', // Ensure the editor starts in WYSIWYG mode
          removeEmptyNodes: false, // Prevent removal of empty nodes
        }}
        style={{
          border: '1px solid #ccc',
          padding: '10px',
          background: "white",
          minHeight: '200px',
          whiteSpace: 'pre-wrap', // Preserve spaces and line breaks
        }}
      />
        </div>
    );
};

export default PdfExtractor;
