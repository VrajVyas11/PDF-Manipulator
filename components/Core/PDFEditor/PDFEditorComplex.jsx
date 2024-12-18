import React, { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
const JoditEditor = dynamic(() => import('jodit-react'), { ssr: false });
import * as pdfjsLib from 'pdfjs-dist/webpack';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useToast } from '../../../hooks/use-toast';
import Image from 'next/image';

const PDFEditorComplex = () => {
  const [htmlContent, setHtmlContent] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [numPages, setNumPages] = useState(0);
  // const pdfInputRef = useRef();
  const editorRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [height, setHeight] = useState(0);
  const [width, setWidth] = useState(0);
  const [isContinueClicked, setIsContinueClicked] = useState(false);
  const { toast } = useToast();
  useEffect(() => {
    pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js";
  }, []);

  const showToastError = (message) => {
    toast({
      title: message,
      variant: 'destructive',
      className: " font-semibold text-[12px] md:text-[16px] text-red-500 gap-3 w-full py-2 bg-red-500  bg-opacity-20 p-2 md:p-4 rounded-lg border-2 border-red-500 border-opacity-50 backdrop-blur-md",
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      setImageFile(file);
      setIsContinueClicked(false); // Reset continue button state
    } else {
      showToastError('Please upload a valid PDF file');
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
      showToastError('Please upload a valid PDF file');
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
          showToastError(data.error);
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

          extractContent(URL.createObjectURL(imageFile), base64Images);
        }
      })
      .catch((err) => {
        console.error('Error uploading file:', err);
        showToastError('Error uploading file.');
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
      showToastError("Oops! Failed to load the PDF. This type of PDF might not be supported yet.");
      console.warn("proccess failed as", err.message)
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

      // Create a temporary container to render the content
      const tempCanvas = document.createElement('canvas');

      // Set canvas dimensions
      tempCanvas.width = width;
      tempCanvas.height = height;

      // Create an off-screen container to hold the HTML content
      const tempDiv = document.createElement('div');
      tempDiv.style.width = `${width}px`;
      tempDiv.style.height = `${height}px`;
      tempDiv.style.overflow = 'hidden';
      tempDiv.style.zIndex = '-1';
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px'; // Hide the div off-screen
      tempDiv.innerHTML = pageHtml;
      const children = tempDiv.querySelectorAll('*');
      children.forEach((child) => {
        child.style.lineHeight = '24px'; // Line height in px
        child.style.marginLeft = '4px';
        child.style.marginRight = '4px';
        child.style.wordSpacing = '4px'; // Add space between words (adjust the value as needed)
      });
      document.body.appendChild(tempDiv);

      // Convert the HTML content to canvas using html2canvas
      const canvas = await html2canvas(tempDiv, {
        scale: 2,
        backgroundColor: '#ffffff',
        x: 0,
        y: 0,
        width: width,
        height: height,
        useCORS: true, // Handle cross-origin images if necessary
      });

      const imgData = canvas.toDataURL('image/jpeg', 1.0);

      // Add the image to the PDF
      if (i > 0) {
        doc.addPage();
      }
      doc.addImage(imgData, 'JPEG', 0, 0, 210, 297);

      document.body.removeChild(tempDiv); // Clean up after each iteration
    }

    doc.save('document.pdf');
  };



  return (
    <div className=" flex w-full justify-center items-center flex-col">
      <div className="w-full pr-0 lg:pr-4 md:mb-4 mb-0">
        <div className="min-h-[200px] rounded-lg p-4 pt-0">
          <div className="flex w-full flex-col justify-center items-center text-center">
            <div className="flex w-full   min-w-fit px-12 py-6 justify-self-center flex-col">
              <div className="flex w-full flex-col  justify-between items-center pb-4 gap-4 md:flex-row">
                <h3 className="text-[30px] justify-center md:justify-normal flex w-full font-bold md:text-[38px] leading-[110%] text-p5">
                  Upload PDF File
                </h3>
                <div className='w-full  flex justify-center items-center flex-row'>
                  <button
                    disabled={!imageFile || !isContinueClicked || !htmlContent.length > 0}
                    onClick={downloadPdf}
                    className="flex w-full justify-center md:justify-end disabled:opacity-40 disabled:cursor-not-allowed  rounded-2xl group"
                  >
                    <span className="relative px-4 md:px-8 flex justify-end items-center w-fit before:g7 g4 min-h-fit py-2 rounded-2xl before:absolute before:inset-0 before:opacity-0 before:transition-opacity before:duration-500 before:content-[''] group-hover:before:opacity-100 overflow-hidden">
                      <Image
                        src={`images/ButtonUtils/download.svg`}
                        alt="logo"
                        width={28}
                        height={28}
                        className="brightness-200"
                      />
                      <span className="font-semibold text-16 flex gap-4 p-4 pr-0 text-p5">
                        Download
                      </span>
                    </span>
                  </button>
                  {/* {imageFile &&<div className='flex justify-center items-center'> */}
                  {imageFile && (
                    <button
                      disabled={!imageFile}
                      onClick={handleContinue}
                      className="flex pl-2 min-w-36 md:min-w-44 items-center justify-normal md:justify-end disabled:opacity-40 disabled:cursor-not-allowed rounded-2xl group"
                    >
                      <span className="relative px-4 md:px-8 flex justify-around items-center w-fit before:g7 g4 min-h-fit py-2 rounded-2xl before:absolute before:inset-0 before:opacity-0 before:transition-opacity before:duration-500 before:content-[''] group-hover:before:opacity-100 overflow-hidden">
                        <Image
                          src={`images/ButtonUtils/process.svg`}
                          alt="logo"
                          width={28}
                          height={28}
                          className="brightness-200"
                        />
                        <span className="font-semibold text-16 flex gap-4 p-4 pr-6 text-p5">
                          Process
                        </span>
                      </span>
                    </button>
                  )}
                  <div className='flex justify-center items-center'>
                    {isContinueClicked && htmlContent.length === 0 && (
                      <div className="w-6 ml-4 flex justify-self-center sm:w-8 h-6 sm:h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    )}
                  </div>
                  {/* </div>} */}
                </div>

              </div>

              <div className="w-full md:mt-3 flex flex-col gap-8">
                <div
                  className={`flex-center ${dragActive ? "scale-105" : ""} min-w-72 md:min-w-full flex h-48 cursor-pointer flex-col gap-5 rounded-[16px] border border-dashed bg-[#7986AC] bg-opacity-20 border-p1 border-opacity-40 justify-center items-center text-white text-center w-full backdrop-blur-lg brightness-125 overflow-hidden shadow-[inset_0_0_10px_rgba(0,0,0,1)]`}
                  onDragOver={handleDrag}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById('fileInput')?.click()}
                >
                  <div className="rounded-[16px] bg-s0/40 p-5 shadow-sm shadow-purple-200/50">
                    <input
                      id="fileInput"
                      type="file"
                      accept=".pdf"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                    <Image
                      src="/images/ButtonUtils/add.svg"
                      alt="Add Image"
                      width={24}
                      height={24}
                      className='brightness-125 '
                    />
                  </div>
                  <p className=" font-normal text-[16px] leading-[140%] brightness-75 text-p5">
                    {imageFile ? imageFile.name : 'Click here to upload PDF'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        {isContinueClicked && htmlContent.length > 0 && <div className="flex px-16 justify-center md:justify-between items-center md:mt-0 md:flex-row">
          <button
            disabled={currentPage === 0}
            onClick={handlePreviousPage}
            className="flex items-center justify-normal md:justify-end disabled:opacity-40 disabled:cursor-not-allowed rounded-2xl group"
          >
            <span className="relative min-w-28 md:min-w-44 px-2 md:px-6 flex justify-around items-center w-fit before:g7 g4 min-h-fit py-1 rounded-2xl before:absolute before:inset-0 before:opacity-0 before:transition-opacity before:duration-500 before:content-[''] group-hover:before:opacity-100 overflow-hidden">
              <Image
                src={`images/ButtonUtils/previous.svg`}
                alt="logo"
                width={28}
                height={28}
                className="brightness-200"
              />
              <span className="font-semibold text-[13px] md:text-16 flex p-4 md:pr-6 text-p5">
                Previous
              </span>
            </span>
          </button>
          <span className="text-[13px] min-w-16 flex justify-center items-center text-center md:text-[20px] tracking-wide font-semibold text-p5 mt-0 md:mt-2">{`Page ${currentPage + 1} of ${numPages}`}</span>
          <button
            disabled={currentPage === numPages - 1} onClick={handleNextPage}
            className="flex pl-2  items-center justify-normal md:justify-end disabled:opacity-40 disabled:cursor-not-allowed rounded-2xl group"
          >
            <span className="relative px-2 md:px-6 min-w-28 md:min-w-44  flex justify-around items-center w-fit before:g7 g4 min-h-fit py-1 rounded-2xl before:absolute before:inset-0 before:opacity-0 before:transition-opacity before:duration-500 before:content-[''] group-hover:before:opacity-100 overflow-hidden">
              <span className="font-semibold text-[13px] md:text-16 flex p-4 md:pl-6 text-p5">
                Next
              </span>
              <Image
                src={`images/ButtonUtils/next.svg`}
                alt="logo"
                width={28}
                height={28}
                className="brightness-200"
              />

            </span>
          </button>
        </div>}
      </div>


      {isContinueClicked && htmlContent.length > 0 && (
        <div className="sm-320:-mt-44 sm-374:-mt-40 md:mt-6 h-fit md:h-full">
          <div className="flex justify-center items-center sm-320:scale-[49%] sm-374:scale-[57%] sm:scale-75 md:scale-[100%] lg:scale-[100%] xl:scale-[100%]">
            <JoditEditor
              ref={instance => {
                if (instance) {
                  editorRef.current = instance; // Attach the Jodit instance to the ref
                }
              }}
              value={htmlContent[currentPage]}
              config={{
                readonly: false,
                toolbar: true,
                language: "en",
                buttons: [
                  "undo", "redo", "|", "bold", "strikethrough", "underline", "italic", "|",
                  "superscript", "subscript", "|", "align", "|", "ul", "ol", "outdent",
                  "indent", "|", "font", "fontsize", "brush", "paragraph", "|", "image",
                  "link", "table", "|", "hr", "eraser", "copyformat", "|", "fullsize",
                  "selectall", "print", "|", "source", "|"
                ],
                height: height,
                width: width,
                containerStyle: {
                  ".jodit-toolbar-editor-collection": {
                    background: "transparent", // Make toolbar background transparent
                  },
                },
              }}
              style={{
                minHeight: "400px",
                width: "100%",
                background: "white",
                color: "black",
              }}
              className="jodit-editor-container border border-red-500 rounded-lg w-full sm:w-3/4 lg:w-2/3 xl:w-1/2 jodit-dark-theme"
              onChange={(content) => {htmlContent[currentPage]=content }}
            />;
          </div>
        </div>
      )}
    </div>

  );
};

export default PDFEditorComplex;