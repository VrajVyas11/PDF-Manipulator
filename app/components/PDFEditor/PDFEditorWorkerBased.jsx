import React, { useEffect, useRef, useState } from 'react';
import JoditEditor from 'jodit-react';
import * as pdfjsLib from 'pdfjs-dist/webpack';
import pdfImgConvert from 'pdf-img-convert';
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
  const [isFileReady, setIsFileReady] = useState(false); // New state to control when to process file

  useEffect(() => {
    pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js";
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      setImageFile(file);
      setIsFileReady(true); // Enable "Continue" button when file is uploaded
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
      setIsFileReady(true); // Enable "Continue" button when file is dropped
    } else {
      alert('Please upload a valid PDF file');
    }
  };

  const handleDragLeave = () => {
    setDragActive(false);
  };


  const generatePageHtml = (graphicOperators, textContent) => {
    const currentPageHtml = [];
    const maxTop = Math.max(...textContent.items.map(item => item.transform[5]));
    const minTop = Math.min(...textContent.items.map(item => item.transform[5]));
    const colorMap = {};

    graphicOperators.forEach(op => {
      if (op.type === 'color') {
        colorMap.currentColor = op.value; // Store the last defined color
      }
    });
    // console.log(graphicOperators)
    // console.log(textContent);

    textContent.items.forEach((item) => {
      const text = item.str || '';
      if (!text.trim()) return;

      const [left, top] = item.transform.slice(4, 6);
      const fontSize = item.height || 12;
      const dir = item.dir || 'ltr';
      const fontName = item.fontName || 'sans-serif';
      let color = colorMap.currentColor || 'black'; // Use the last defined color or default to black

      for (let i = 0; i < graphicOperators.length; i++) {
        if (graphicOperators[i].type === "graphicState" && item.fontName === graphicOperators[i].flag) {
          // Move backwards to find the previous color
          for (let j = i - 1; j >= 0; j--) {
            if (graphicOperators[j].type === "color") {
              color = graphicOperators[j].value; // Set the color
              break; // Exit once the color is found
            }
          }
          break; // Exit the outer loop after processing the graphicState
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
                width: auto;
                height: auto; 
                color: ${color}; 
            ">
                ${text}
            </span>
        `);
    });

    return currentPageHtml.join('');
  };

  // const extractContent = async (url) => {
  //   try {
  //     const pdf = await pdfjsLib.getDocument({ url }).promise;
  //     setNumPages(pdf.numPages);
  //     let fullHtmlContent = [];

  //     for (let i = 1; i <= pdf.numPages; i++) {
  //       const page = await pdf.getPage(i);
  //       setHeight(page.view[3]);
  //       setWidth(page.view[2]);
  //       const graphicOperators = await extractGraphicOperators(page); // Extract graphic operators here
  //       const textContent = await page.getTextContent();
  //       const pageHtml = generatePageHtml(graphicOperators, textContent); // Pass graphicOperators to generatePageHtml
  //       fullHtmlContent.push(pageHtml);
  //     }
  //     setHtmlContent(fullHtmlContent);
  //   } catch (err) {
  //     alert(`Failed to load PDF: ${err.message}`);
  //   }
  // };


  const handleContinue = async () => {
    if (imageFile) {
      try {
        const images = await extractImages(imageFile);
        images.forEach((imgSrc) => {
          const imgElement = document.createElement("img");
          imgElement.src = imgSrc; // Use the data URL returned by pdf-img-convert
          imgElement.alt = "Extracted Image";
          document.body.appendChild(imgElement); // Append each image to the DOM
        });
      } catch (err) {
        alert(`Failed to load PDF: ${err.message}`);
      }
    }
  };

  const extractImages = async (file) => {
    try {
      const imageData = await pdfImgConvert(file);
      return imageData; // Returns an array of image data URLs
    } catch (error) {
      console.error('Error extracting images:', error);
      throw error; // Rethrow to handle in handleContinue
    }
  };
  
  const extractGraphicOperators = async (page) => {
    try {
      const operatorList = await page.getOperatorList();
      console.log(operatorList)
      const graphicsStateMap = {};
      const processedOperators = [];
      // console.log(operatorList)
      if (!operatorList || !operatorList.argsArray) {
        console.error("Operator list or arguments are undefined.");
        return;
      }

      operatorList.argsArray.forEach((arg, index) => {
        if (arg === null) {
          return;
        }
        // console.log(arg)
        if (arg instanceof Uint8ClampedArray) {
          const color = `RGB(${arg[0]}, ${arg[1]}, ${arg[2]})`;
          processedOperators.push({ type: 'color', value: color });
        }
        else if (Array.isArray(arg) && arg.length > 0) {
          if (typeof arg[0] === "string") {
            if (arg[0].startsWith("g_") && arg[1] && typeof arg[1] === "number") {
              graphicsStateMap[arg[0]] = { reference: `Reference at index ${index}` };
              processedOperators.push({ type: 'graphicState', flag: arg[0], value: arg[1] });
            }
          }
          else if (arg.length == 2) {
            // console.log("in herere i am ")
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
          graphicsStateMap[arg] = { reference: `Reference at index ${index}` };
          processedOperators.push({ type: 'graphicState', value: arg });
        }
      });

      // console.log("Processed Operators:", processedOperators);
      // console.log("Graphics State Map:", graphicsStateMap);
      return processedOperators
    } catch (err) {
      console.error("Failed to extract operators:", err);
    }
  };

  
const handleNextPage = () => {
    if (currentPage < numPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };


  // const extractContent = async (url) => {
  //   try {
  //     const pdf = await pdfjsLib.getDocument({ url }).promise;
  //     setNumPages(pdf.numPages);
  //     let fullHtmlContent = [];

  //     for (let i = 1; i <= pdf.numPages; i++) {
  //       const page = await pdf.getPage(i);
  //       setHeight(page.view[3])
  //       setWidth(page.view[2])
  //       const textContent = await page.getTextContent();
  //       const pageHtml = generatePageHtml(textContent);
  //       fullHtmlContent.push(pageHtml);
  //     }

  //     setHtmlContent(fullHtmlContent);
  //   } catch (err) {
  //     alert(`Failed to load PDF: ${err.message}`);
  //   }
  // };


  // const generatePageHtml = (textContent) => {
  //   const currentPageHtml = [];
  //   const maxTop = Math.max(...textContent.items.map(item => item.transform[5]));
  //   const minTop = Math.min(...textContent.items.map(item => item.transform[5]));

  //   textContent.items.forEach((item) => {
  //     const text = item.str || '';
  //     if (!text.trim()) return;

  //     const [left, top] = item.transform.slice(4, 6);
  //     const fontSize = item.height || 12;
  //     const dir = item.dir || 'ltr';
  //     const fontName = item.fontName || 'sans-serif';
  //     const color = 'black';

  //     const reversedTop = maxTop - top;
  //     const adjustedTop = Math.max(reversedTop + minTop * 0.2 - fontSize * 1.2, 0);

  //     currentPageHtml.unshift(`
  //             <span style="
  //                 font-size: ${fontSize}px; 
  //                 position: absolute; 
  //                 left: ${left}px; 
  //                 top: ${adjustedTop}px;  
  //                 direction: ${dir}; 
  //                 font-family: ${fontName}; 
  //                 color: ${color}; 
  //             ">
  //                 ${text}
  //             </span>
  //         `);
  //   });

  //   return currentPageHtml.join('');
  // };

  return (
    <div className="flex justify-center items-center flex-col p-6 bg-white shadow-md rounded-lg">
      <div
        className={`border-4 border-dashed bg-gray-100 p-10 rounded-lg w-full max-w-md flex items-center justify-center cursor-pointer transition-colors duration-300 ease-in-out ${dragActive ? 'border-blue-400' : 'border-gray-300'}`}
        onDragOver={handleDrag}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => pdfInputRef.current.click()}
      >
        <input
          type="file"
          ref={pdfInputRef}
          accept="application/pdf"
          className="hidden"
          onChange={handleFileChange}
        />
        <p className="text-center text-gray-500">{imageFile ? imageFile.name : 'Drag & Drop a PDF or click to upload'}</p>
      </div>

      {isFileReady && (
        <button
          onClick={handleContinue}
          className="mt-4 px-4 py-2 text-xl font-mono font-bold bg-green-500 w-fit text-white rounded-lg hover:bg-green-600 transition duration-300"
        >
          Continue
        </button>
      )}

      {htmlContent.length > 0 && (
        <div className="mt-6 h-full">
          <JoditEditor
            ref={editorRef}
            value={htmlContent[currentPage]}
            config={{
              readonly: false,
              toolbar: true,
              height: height,
              width: width,
            }}
            style={{
              minHeight: '400px',
              width: '100%',
              padding: '10px',
              background: 'white',
            }}
            className="bg-black border rounded"
          />

          <div className="flex justify-between items-center mt-4">
            <button onClick={handlePreviousPage} disabled={currentPage === 0} className="px-4 py-2 bg-blue-500 w-24 text-white rounded-lg hover:bg-blue-600 transition duration-300 disabled:bg-gray-400">
              Previous
            </button>
            <span className="text-lg">{`Page ${currentPage + 1} of ${numPages}`}</span>
            <button onClick={handleNextPage} disabled={currentPage === numPages - 1} className="px-4 py-2 bg-blue-500 w-24 text-white rounded-lg hover:bg-blue-600 transition duration-300 disabled:bg-gray-400">
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PDFEditorWorkerBased;
