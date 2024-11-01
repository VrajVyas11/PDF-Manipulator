import React, { useEffect, useRef, useState } from 'react';
import JoditEditor from 'jodit-react';
import * as pdfjsLib from 'pdfjs-dist/webpack';
import jsPDF from 'jspdf';

const PDFEditorWorkerBased = () => {
  const [htmlContent, setHtmlContent] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [numPages, setNumPages] = useState(0);
  const pdfInputRef = useRef();
  const editorRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [height, setHeight] = useState(0);
  const [width, setWidth] = useState(0);
  const [isContinueClicked, setIsContinueClicked] = useState(false);
  const [images, setImages] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js";
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      setImageFile(file);
      setIsContinueClicked(false);
    } else {
      alert('Please upload a valid PDF file');
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type === 'application/pdf') {
      setImageFile(file);
      setIsContinueClicked(false);
    } else {
      alert('Please upload a valid PDF file');
    }
  };

  const handleDragLeave = () => {
    setDragActive(false);
  };

  const handleContinue = () => {
    setIsContinueClicked(true);
    setCurrentPage(0);
    const formData = new FormData();
    formData.append('pdf', imageFile);

    fetch('/api/ExtractImages', {
      method: 'POST',
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          const base64Images = data.images.map((image) => {
            const imageData = image.data;
            const byteNumbers = Object.values(imageData);
            const byteArray = new Uint8Array(byteNumbers);
            const base64String = btoa(Uint8ToString(byteArray));
            return { image, url: `data:image/jpeg;base64,${base64String}` };
          });

          setImages(base64Images);
          setError(null);
          extractContent(URL.createObjectURL(imageFile), base64Images);
        }
      })
      .catch((err) => {
        console.error('Error uploading file:', err);
        setError('Error uploading file.');
      });
  };

  const generatePageHtml = (graphicOperators, textContent, base64Images, H, W) => {
    const currentPageHtml = [];
    const maxTop = Math.max(...textContent.items.map(item => item.transform[5]));
    const minTop = Math.min(...textContent.items.map(item => item.transform[5]));
    const colorMap = {};

    graphicOperators.forEach(op => {
      if (op.type === 'color') {
        colorMap.currentColor = op.value;
      }
    });

    graphicOperators.forEach((op) => {
      if (op.type === 'image') {
        let matchFound = false;

        for (let imgIndex = base64Images.length - 1; imgIndex >= 0; imgIndex--) {
          const currentImage = base64Images[imgIndex];
          if (currentImage.image.width === op.width && currentImage.image.height === op.height) {
            const w = op.position[0];
            const h = op.position[3];
            const left = op.position[4];
            const top = op.position[5];
            const reversedTop = H - top;
            const adjustedTop = Math.max(reversedTop - h * 1.25, 0);
            currentPageHtml.unshift(`
              <img src="${currentImage.url}" style="
                  position: absolute;
                  left: ${left}px;
                  top: ${adjustedTop}px;
                  width: ${w}px;
                  height: ${h * 0.8}px;
              " alt="Extracted Image"/>
            `);
            matchFound = true;
            break;
          }
        }

        if (!matchFound) console.log("No matching image found for this operator.");
      }
    });

    textContent.items.forEach((item) => {
      const text = item.str || '';
      if (!text.trim()) return;

      const [left, top] = item.transform.slice(4, 6);
      const fontSize = item.height || 12;
      const dir = item.dir || 'ltr';
      const fontName = item.fontName || 'sans-serif';
      let color = colorMap.currentColor || 'black';

      for (let i = 0; i < graphicOperators.length; i++) {
        if (graphicOperators[i].type === "graphicState" && item.fontName === graphicOperators[i].flag) {
          for (let j = i - 1; j >= 0; j--) {
            if (graphicOperators[j].type === "color") {
              color = graphicOperators[j].value;
              break;
            }
          }
          break;
        }
      }

      const reversedTop = maxTop - top;
      const adjustedTop = Math.max(reversedTop + minTop * 0.2 - fontSize * 1.2, 0);

      currentPageHtml.unshift(`
        <span style="
            font-size: ${fontSize}px;
            position: absolute;
            left: ${left}px;
            top: ${adjustedTop}px;
            direction: ${dir};
            font-family: ${fontName};
            color: ${color};
        ">
            ${text}
        </span>
      `);
    });

    return currentPageHtml.join('');
  };

  const extractGraphicOperators = async (page) => {
    try {
      const operatorList = await page.getOperatorList();
      const processedOperators = [];
      if (!operatorList || !operatorList.argsArray) {
        console.error("Operator list or arguments are undefined.");
        return [];
      }

      operatorList.argsArray.forEach((arg, index) => {
        if (arg === null) {
          return;
        }

        if (arg instanceof Uint8ClampedArray) {
          const color = `RGB(${arg[0]}, ${arg[1]}, ${arg[2]})`;
          processedOperators.push({ type: 'color', value: color });
        } else if (Array.isArray(arg) && arg.length > 0) {
          if (typeof arg[0] === "string") {
            if (arg[0].startsWith("g_") && arg[1] && typeof arg[1] === "number") {
              processedOperators.push({ type: 'graphicState', flag: arg[0], value: arg[1] });
            } else if (arg[0].startsWith("img_p")) {
              const imageId = arg[0];
              const [width, height] = arg.length >= 3 ? [arg[1], arg[2]] : [0, 0];
              processedOperators.push({ type: 'image', id: imageId, width, height, position: operatorList.argsArray[index - 2] });
            }
          } else if (arg.length === 2) {
            processedOperators.push({ type: 'coordinates', left: arg[0], top: arg[1] });
          }

          arg.forEach((item) => {
            if (Array.isArray(item) && item[0].fontChar) {
              processedOperators.push({ type: 'array', value: item });
            } else if (typeof item === 'object' && item.fontChar) {
              processedOperators.push({
                type: 'character',
                value: {
                  fontChar: item.fontChar,
                  unicode: item.unicode,
                  width: item.width,
                },
              });
            }
          });
        } else if (typeof arg === "string" && arg.startsWith("g_")) {
          processedOperators.push({ type: 'graphicState', value: arg });
        }
      });

      return processedOperators;
    } catch (err) {
      console.error("Failed to extract operators:", err);
      return [];
    }
  };

  const extractContent = async (url, base64Images) => {
    const pdf = await pdfjsLib.getDocument(url).promise;
    const totalPages = pdf.numPages;
    setNumPages(totalPages);
    const pagesHtml = [];

    for (let pageNumber = 1; pageNumber <= totalPages; pageNumber++) {
      const page = await pdf.getPage(pageNumber);
      const viewport = page.getViewport({ scale: 1 });
      const graphicOperators = await extractGraphicOperators(page);
      const textContent = await page.getTextContent();
      const H = viewport.height;
      const W = viewport.width;

      const pageHtml = generatePageHtml(graphicOperators, textContent, base64Images, H, W);
      pagesHtml.push(pageHtml);
    }

    setHtmlContent(pagesHtml);
  };

  const downloadPdf = () => {
    const doc = new jsPDF();
    const content = htmlContent.join('\n');
    doc.html(content, {
      callback: (doc) => {
        doc.save('document.pdf');
      },
      x: 10,
      y: 10
    });
  };

  return (
    <div>
      <input type="file" accept="application/pdf" onChange={handleFileChange} />
      <div onDragOver={handleDrag} onDrop={handleDrop} onDragLeave={handleDragLeave}>
        Drag and drop a PDF file here
      </div>
      <button onClick={handleContinue}>Continue</button>
      {error && <p>{error}</p>}
      <JoditEditor
        ref={editorRef}
        value={Array.isArray(htmlContent) ? htmlContent.join('\n') : ''} 
        onChange={(newContent) => setHtmlContent(Array.isArray(newContent) ? newContent : [newContent])}
      />
      <button onClick={downloadPdf}>Download PDF</button>
      <div>
        {htmlContent.map((pageHtml, index) => (
          <div key={index} dangerouslySetInnerHTML={{ __html: pageHtml }} />
        ))}
      </div>
    </div>
  );
};

export default PDFEditorWorkerBased;
