import React, { useState, useRef, useEffect } from 'react';
import renderPdfContent from '../../../app/utils/tools/renderPdfContent.jsx';
import ReactDOMServer from 'react-dom/server';
import Image from 'next/image.js';
import downloadPdf from "../../../app/utils/tools/downloadPdf";
import { uploadPdf } from "../../../app/utils/tools/uploadPdf.jsx";
import dynamic from 'next/dynamic.js';
import { useToast } from '../../../hooks/use-toast';
const JoditEditor = dynamic(() => import('jodit-react'), { ssr: false });
function PDFEditorSimpleText() {
  const [pdfData, setPdfData] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [content, setContent] = useState('<p>Edit me!</p>');
  const editorRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [isContinueClicked, setIsContinueClicked] = useState(false);
  const { toast } = useToast();
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
    } else {
      showToastError('Please upload a valid PDF file');
    }
  };

  const handleDragLeave = () => {
    setDragActive(false);
  };

  const handleUpload = async () => {
    setIsContinueClicked(true)
    await uploadPdf(imageFile, setPdfData, setCurrentPage);
    setIsContinueClicked(false)
  };

  useEffect(() => {
    if (pdfData) {
      const renderedContent = renderPdfContent(pdfData, editorRef, currentPage);
      const contentString = typeof renderedContent === 'string'
        ? renderedContent
        : ReactDOMServer.renderToStaticMarkup(renderedContent);

      setContent(contentString);
    }
  }, [pdfData, currentPage]);


  useEffect(() => {
    if (editorRef.current) {
      const editorElement = document.createElement('div');
      editorElement.contentEditable = true;
      editorElement.innerHTML = content;
      editorRef.current.innerHTML = content;
    }
  }, [content]);



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
                    disabled={!imageFile}
                    onClick={() => { downloadPdf(editorRef) }}
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
                      onClick={handleUpload}
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
                  <div className='flex  justify-center items-center'>
                    {isContinueClicked && imageFile && (
                      <div className="w-6 ml-4 flex justify-self-center sm:w-8 h-6 sm:h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    )}
                  </div>
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
        {pdfData && pdfData.Pages && (
          <div className="flex px-16 justify-center md:justify-between items-center md:mt-0 md:flex-row">
            <button
              disabled={currentPage === 0}
              onClick={() => setCurrentPage(currentPage - 1)}
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
            <span className="text-[13px] min-w-16 flex justify-center items-center text-center md:text-[20px] tracking-wide font-semibold text-p5 mt-0 md:mt-2">{`Page ${currentPage + 1} of ${pdfData.Pages.length}`}</span>
            <button
              disabled={currentPage === pdfData.Pages.length - 1}
              onClick={() => setCurrentPage(currentPage + 1)}
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

          </div>

        )}
        {pdfData && (
          <div className="sm-320:-mt-52 sm-374:-mt-44 md:mt-6 h-fit md:h-full">
            <div className="flex justify-center items-center sm-320:scale-[49%] sm-374:scale-[57%] sm:scale-75 md:scale-[100%] lg:scale-[100%] xl:scale-[100%]">
              <JoditEditor
                ref={editorRef}
                value={content}
                style={{
                  margin: "0 auto",
                  minHeight: '50px',
                  minWidth: '500px',
                  whiteSpace: 'pre-wrap',
                }}
                config={{
                  readonly: false,
                  toolbar: true,
                  language: 'en',
                  buttons: ["undo", "redo", "|", "bold", "strikethrough", "underline", "italic", "|", "superscript", "subscript",
                    "|", "align", "|", "ul", "ol", "outdent", "indent", "|", "font", "fontsize", "brush",
                    "paragraph", "|", "image", "link", "table", "|", "hr", "eraser", "copyformat",
                    "|", "fullsize", "selectall", "print", "|", "source", "|",],
                  containerStyle: {
                    '.jodit-toolbar-editor-collection': {
                      background: 'transparent', // Make toolbar background transparent
                    },
                  },
                }}
                className="jodit-editor-container mx-28 lg:mx-32 border border-red-500 rounded-lg w-full sm:w-fit lg:w-full jodit-dark-theme"
                onChange={(newContent) => console.log(newContent)}
              />
              {/* <div
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
              /> */}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default PDFEditorSimpleText;
