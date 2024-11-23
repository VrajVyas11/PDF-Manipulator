import React, { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
const JoditEditor = dynamic(() => import('jodit-react'), { ssr: false });
import * as pdfjsLib from 'pdfjs-dist/webpack';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';


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
  const [error, setError] = useState(null);

  useEffect(() => {
    pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js";
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      setImageFile(file);
      setIsContinueClicked(false); // Reset continue button state
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
      setIsContinueClicked(false); // Reset continue button state
    } else {
      alert('Please upload a valid PDF file');
    }
  };

  const handleDragLeave = () => {
    setDragActive(false);
  };

  const handleContinue = () => {
    setIsContinueClicked(true);
    setCurrentPage(0)
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
            // Convert imageData object into an array
            const byteNumbers = Object.values(imageData);
            const byteArray = new Uint8Array(byteNumbers);

            // Convert byteArray to a Base64 string
            const base64String = btoa(Uint8ToString(byteArray));

            return { image, url: `data:image/jpeg;base64,${base64String}` };
          });

          // setImages(base64Images);
          setError(null);
          extractContent(URL.createObjectURL(imageFile), base64Images);
        }
      })
      .catch((err) => {
        console.error('Error uploading file:', err);
        setError('Error uploading file.');
      });
  };

  const generatePageHtml = (graphicOperators, textContent, base64Images, H) => {
    const currentPageHtml = [];
    const maxTop = Math.max(...textContent.items.map(item => item.transform[5]));
    const minTop = Math.min(...textContent.items.map(item => item.transform[5]));
    const colorMap = {};

    // Set current color
    graphicOperators.forEach(op => {
      if (op.type === 'color') {
        colorMap.currentColor = op.value;
      }
    });

    // Loop through graphic operators to find image operators and match with images
    graphicOperators.forEach((op) => {
      if (op.type === 'image') {
        // let matchFound = false;

        // Loop through all images to find a match
        for (let imgIndex = base64Images.length - 1; imgIndex >= 0; imgIndex--) {
          const currentImage = base64Images[imgIndex];
          // console.log("Processing image at index:", imgIndex);
          // console.log("Current Image Dimensions:", currentImage.image.width, currentImage.image.height);
          // console.log("Operator Dimensions:", op.width, op.height);

          // Check if current image dimensions match the operator dimensions
          if (currentImage.image.width === op.width && currentImage.image.height === op.height) {
            const w = op.position[0];
            const h = op.position[3];
            const left = op.position[4];
            const top = op.position[5];
            const reversedTop = H - top;
            const adjustedTop = Math.max(reversedTop - h * 1.25, 0);
            // console.log(minTop)
            // console.log(H)
            // console.log(maxTop)
            // console.log(top)
            // console.log(adjustedTop);
            // console.log(reversedTop, h);

            currentPageHtml.unshift(`
                        <img src="${currentImage.url}" style="
                            position: absolute;
                            left: ${left}px;
                            top: ${adjustedTop}px;
                            width: ${w}px;
                            height: ${h * 0.8}px;
                        " alt="Extracted Image"/>
                    `);

            // Mark match found and break inner loop
            // matchFound = true;
            break;
          } else {
            // console.log("Image dimensions do not match, continuing to next image.");
          }
        }

        // Reset imgIndex to retry matching all images with the next operator if needed
        // if (!matchFound) console.log("No matching image found for this operator.");
      }
    });

    // Process text content
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



  // console.log(images)

  const extractGraphicOperators = async (page) => {
    try {
      const operatorList = await page.getOperatorList();
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

        if (arg instanceof Uint8ClampedArray) {
          const color = `RGB(${arg[0]}, ${arg[1]}, ${arg[2]})`;
          processedOperators.push({ type: 'color', value: color });
        } else if (Array.isArray(arg) && arg.length > 0) {
          if (typeof arg[0] === "string") {
            if (arg[0].startsWith("g_") && arg[1] && typeof arg[1] === "number") {
              graphicsStateMap[arg[0]] = { reference: `Reference at index ${index}` };
              processedOperators.push({ type: 'graphicState', flag: arg[0], value: arg[1] });
            } else if (arg[0].startsWith("img_p")) {
              // Handle images
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
          graphicsStateMap[arg] = { reference: `Reference at index ${index}` };
          processedOperators.push({ type: 'graphicState', value: arg });
        }
      });

      return processedOperators;
    } catch (err) {
      console.error("Failed to extract operators:", err);
    }
  };


  // console.log(images)
  const extractContent = async (url, base64Images) => {
    try {
      const pdf = await pdfjsLib.getDocument({ url }).promise;
      setNumPages(pdf.numPages);
      let fullHtmlContent = [];
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        setHeight(page.view[3]);
        setWidth(page.view[2]);
        const graphicOperators = await extractGraphicOperators(page); // Extract graphic operators here
        const textContent = await page.getTextContent();
        const pageHtml = generatePageHtml(graphicOperators, textContent, base64Images, page.view[3], page.view[2]); // Pass graphicOperators to generatePageHtml
        fullHtmlContent.push(pageHtml);
      }
      setHtmlContent(fullHtmlContent);
    } catch (err) {
      alert("Oops! Failed to load the PDF. This type of PDF might not be supported yet.");
    }
  };

  const Uint8ToString = (u8a) => {
    const CHUNK_SZ = 0x8000;
    let c = [];
    for (let i = 0; i < u8a.length; i += CHUNK_SZ) {
      c.push(String.fromCharCode.apply(null, u8a.subarray(i, i + CHUNK_SZ)));
    }
    return c.join('');
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


  const downloadPdf = async () => {
    const doc = new jsPDF();
    const totalPages = htmlContent.length;

    for (let i = 0; i < totalPages; i++) {
      const pageHtml = htmlContent[i];

      const tempDiv = document.createElement('div');
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '0';
      tempDiv.style.top = '0';
      tempDiv.style.width = '560px'; // Set width for rendering
      tempDiv.style.height = '1000px'; // Set height for rendering
      tempDiv.style.overflow = 'hidden';
      tempDiv.style.zIndex = '-1'; // Place it behind other elements
      tempDiv.style.backgroundColor = 'white'; // Ensure a white background for the PDF
      tempDiv.innerHTML = pageHtml;

      document.body.appendChild(tempDiv);

      // console.log('Temporary Div Content:', tempDiv.innerHTML); // Log the content

      const canvas = await html2canvas(tempDiv, {
        scale: 2,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/jpeg', 1.0);

      if (i > 0) {
        doc.addPage();
      }

      doc.addImage(imgData, 'JPEG', 0, 0, 210, 297);

      document.body.removeChild(tempDiv);
    }

    doc.save('document.pdf');
  };




  return (
    <div className="flex flex-col justify-center items-center text-white text-center p-0 sm:p-6 lg:p-10 h-fit w-full backdrop-blur-lg bg-opacity-40 bg-[#1a1a1a] overflow-hidden shadow-[inset_0_0_30px_rgba(0,0,0,1)] rounded-lg">
      <h1 className="text-lg sm:text-xl lg:text-2xl font-extrabold tracking-widest mb-6 text-sky-500 border-y-2 w-full px-8 sm:px-16 lg:px-36 py-3 border-double rounded-2xl">
        Optimized for Complex PDFs
      </h1>

      <div
        className={`border-4 w-full border-dashed p-5 sm:p-6 h-36 rounded-lg bg-gray-800 flex items-center justify-center cursor-pointer transition-transform duration-300 ease-in-out hover:scale-105 hover:border-blue-700 ${dragActive ? 'border-blue-400' : 'border-gray-600'}`}
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
        <p className="text-center text-gray-400">{imageFile ? imageFile.name : 'Drag & Drop a PDF or click to upload'}</p>
      </div>

      {imageFile && !isContinueClicked && (
        <button
          onClick={handleContinue}
          className="px-6 py-4 w-fit mt-4 bg-blue-500 text-white font-mono shadow-lg tracking-wide rounded-lg hover:bg-blue-600 transition duration-300 font-extrabold ease-in-out disabled:opacity-50"
        >
          Continue
        </button>
      )}
      {isContinueClicked && htmlContent.length === 0 && (
        <div className="w-8 h-8 mt-4 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
      )}
    {error && (
        <div className="w-fit my-4 text-red-600 text-bold tracking-wide ">{error}*</div>
      )}
      {isContinueClicked && htmlContent.length > 0 && (
        <div className=" sm-320:-mt-44 sm-374:-mt-40 md:mt-6 h-fit md:h-full">
          <div className="flex justify-center items-center sm-320:scale-[49%] sm-374:scale-[57%] sm:scale-75 md:scale-[100%] lg:scale-[100%] xl:scale-[100%]">
            <JoditEditor
              ref={editorRef}
              value={htmlContent[currentPage]}
              config={{
                toolbar: true,
                height: height,
                width: width,
                editHTMLDocumentMode: true,
              }}
              style={{
                display: 'block',
                minHeight: '400px',
                width: '100%',
                padding: '10px',
                background: 'white',
                color: 'black',
              }}
              className="border  border-gray-700 rounded-lg w-full sm:w-3/4 lg:w-2/3 xl:w-1/2"
              onChange={() => { }}
            />
          </div>



          <div className="flex sm-320:-mt-44 sm-374:-mt-40 justify-between items-center md:mt-4  flex-col sm:flex-row">
            <button
              onClick={handlePreviousPage}
              disabled={currentPage === 0}
              className="px-6 py-3 w-fit mt-0 md:mt-4 bg-blue-600 text-white font-mono shadow-lg tracking-wide rounded-lg hover:bg-blue-700 transition duration-300 font-extrabold ease-in-out disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-lg text-gray-300 mt-2 sm:mt-0">{`Page ${currentPage + 1} of ${numPages}`}</span>
            <button
              onClick={handleNextPage}
              disabled={currentPage === numPages - 1}
              className="px-10 py-3 w-fit mt-2 md:mt-4 bg-blue-600 text-white font-mono shadow-lg tracking-wide rounded-lg hover:bg-blue-700 transition duration-300 font-extrabold ease-in-out disabled:opacity-50"
            >
              Next
            </button>
          </div>

          <button
            onClick={downloadPdf}
            className="px-6 py-4 w-full mt-4 bg-green-600 text-white font-mono shadow-lg tracking-wide  hover:bg-green-700 transition duration-300 font-extrabold ease-in-out disabled:opacity-50"
          >
            Download
          </button>
        </div>
      )}
    </div>

  );
};

export default PDFEditorWorkerBased;