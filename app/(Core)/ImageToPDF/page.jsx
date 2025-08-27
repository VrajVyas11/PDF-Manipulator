"use client"
import { useCallback, useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import Image from 'next/image';
import { ToastAction } from "@/components/ui/toast"
import { useToast } from "../../../hooks/use-toast"
import dynamic from "next/dynamic";

const PDFViewer = dynamic(() => import("../../../components/Core/PDFViewer"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-64 bg-gray-800/50 rounded-lg">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm text-gray-400">Loading PDF viewer...</p>
      </div>
    </div>
  )
});

const ImageToPDF = () => {
  const [imageFile, setImageFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const { toast } = useToast();

  const showToastError = useCallback((message) => {
    toast({
      variant: "destructive",
      title: (
        <div className="flex items-center w-full gap-3">
          {/* subtle check icon */}
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-red-400 flex-shrink-0" viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true">
            <path fillRule="evenodd" d="M6.99486 7.00636C6.60433 7.39689 6.60433 8.03005 6.99486 8.42058L10.58 12.0057L6.99486 15.5909C6.60433 15.9814 6.60433 16.6146 6.99486 17.0051C7.38538 17.3956 8.01855 17.3956 8.40907 17.0051L11.9942 13.4199L15.5794 17.0051C15.9699 17.3956 16.6031 17.3956 16.9936 17.0051C17.3841 16.6146 17.3841 15.9814 16.9936 15.5909L13.4084 12.0057L16.9936 8.42059C17.3841 8.03007 17.3841 7.3969 16.9936 7.00638C16.603 6.61585 15.9699 6.61585 15.5794 7.00638L11.9942 10.5915L8.40907 7.00636C8.01855 6.61584 7.38538 6.61584 6.99486 7.00636Z" />
          </svg>
          <div className="text-left ">
            <div className="text-sm md:text-base font-semibold text-red-100">
              {message}
            </div>
          </div>
        </div>
      ),
      className:
        "flex items-center justify-between gap-3 w-full max-w-[640px] bg-gradient-to-r from-slate-900/60 to-slate-800/40 border border-red-500/10 p-3 md:p-4 rounded-2xl shadow-lg backdrop-blur-md",
    });
  }, [toast]);


  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setImageFile(file);
      setPdfUrl(null);
    } else {
      showToastError("Please Upload A Valid Image File");
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = () => {
    setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setImageFile(file);
      setPdfUrl(null);
    } else {
      showToastError("Please Upload A Valid Image File");
    }
  };

  const downloadPdf = useCallback(async () => {
    if (pdfUrl) {
      try {
        const fileSaver = await import("file-saver");
        fileSaver?.saveAs(pdfUrl, `image-to-pdf.pdf`);
      } catch (error) {
        console.error("Download failed:", error);
        showToastError("Download failed. Please try again.");
      }
    }
  }, [pdfUrl, showToastError]);


  const showToast = useCallback(() => {
    toast({
      title: (
        <div className="flex items-center w-full gap-3">
          {/* subtle check icon */}
          <svg
            className="w-5 h-5 text-emerald-400 flex-shrink-0"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M16.704 5.29a1 1 0 00-1.408-1.418L7.5 11.668 4.704 8.88a1 1 0 10-1.408 1.418l4 4a1 1 0 001.408 0l8-8z"
              clipRule="evenodd"
            />
          </svg>

          <div className="text-left ">
            <div className="text-sm md:text-base font-semibold text-emerald-100">
              PDF ready to download
            </div>
            <div className="text-xs md:text-sm text-emerald-200/80">
              Your compressed PDF is available. Click Download to save it.
            </div>
          </div>
        </div>
      ),
      action: (
        <ToastAction
          onClick={downloadPdf}
          altText="Download PDF"
          className="ml-3 inline-flex items-center gap-2 rounded-full bg-emerald-500/95 px-4 py-2 min-h-12 text-sm font-semibold text-slate-900 shadow-md hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-400"
        >
          {/* download icon */}
          <svg
            className="w-4 h-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Download
        </ToastAction>
      ),
      className:
        "flex items-center justify-between gap-3 w-full max-w-[640px] bg-gradient-to-r from-slate-900/60 to-slate-800/40 border border-emerald-500/10 p-3 md:p-4 rounded-2xl shadow-lg backdrop-blur-md",
    });
  }, [downloadPdf, toast])

  const convertToPDF = useCallback(async () => {
    if (!imageFile) return;

    setIsProcessing(true);

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const imageBytes = e.target?.result;
        const pdfDoc = await PDFDocument.create();
        const page = pdfDoc.addPage();

        const embeddedImage =
          imageFile.type === 'image/png'
            ? await pdfDoc.embedPng(imageBytes)
            : await pdfDoc.embedJpg(imageBytes);

        const { width, height } = embeddedImage.scale(1);
        page.setSize(width, height);
        page.drawImage(embeddedImage, { x: 0, y: 0, width, height });

        const pdfBytes = await pdfDoc.save();
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        setPdfUrl(URL.createObjectURL(blob));
        showToast()
      } catch (err) {
        showToastError(`Failed to convert image to PDF: ${err}`);
      } finally {
        setIsProcessing(false);
      }
    };

    reader.readAsArrayBuffer(imageFile);
  }, [imageFile, showToast, showToastError]);


  return (
    <div className="flex  flex-col w-full ">
      <div className="flex flex-col lg:px-0 lg:flex-row justify-center mt-5 mb-10 items-center w-full">
        <div className="flex flex-col  md:pl-4 w-full text-center lg:text-left">
          <h2 className="text-[30px] font-bold md:text-[38px] leading-[110%] text-p4">Convert Image to PDF</h2>
          <p className="font-normal text-[16px] leading-[140%] mt-4 text-p5">
            Easily convert your images to PDF with just a few clicks and a smooth interface!
          </p>

        </div>
        <button
          disabled={!imageFile || !pdfUrl || isProcessing}
          onClick={downloadPdf}
          className={`flex min-w-fit w-fit md:pr-4 disabled:opacity-40 disabled:cursor-not-allowed justify-center lg:justify-end rounded-2xl group mt-4 lg:mt-0`}
        >
          <span className="relative flex justify-around items-center w-fit before:g7 g4 min-h-fit px-4 py-2 rounded-2xl before:absolute before:inset-0 before:opacity-0 before:transition-opacity before:duration-500 before:content-[''] group-hover:before:opacity-100  overflow-hidden">
            <Image
              src="/images/ButtonUtils/download.svg"
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
      </div>
      <hr className=' border-s3 border-2' />
      <div className="flex flex-col overflow-hidden text-white rounded-2xl h-fit w-full">
        <div
          className="absolute -z-2 top-1/2 left-1/2 lg:top-[55%] lg:left-[35%] transform -translate-x-1/2 -translate-y-1/2 w-[40%] sm:w-[50%] lg:w-[20%] h-[40%] sm:h-[50%] lg:h-[60%]"
          style={{
            background: "rgba(0, 123, 255, .25)",
            filter: "blur(150px)",
          }}
        ></div>
        <div
          className="absolute -z-2 top-1/2 left-1/2 lg:top-[55%] lg:left-[58%] transform -translate-x-1/2 -translate-y-1/2 w-[40%] sm:w-[50%] lg:w-[20%] h-[40%] sm:h-[50%] lg:h-[60%]"
          style={{
            background: "rgba(0, 123, 255, .25)",
            filter: "blur(150px)",
          }}
        ></div>
        <div
          className="absolute -z-2 top-1/2 left-1/2 lg:top-[55%] lg:left-[82%] transform -translate-x-1/2 -translate-y-1/2 w-[40%] sm:w-[50%] lg:w-[20%] h-[40%] sm:h-[50%] lg:h-[60%]"
          style={{
            background: "rgba(0, 123, 255, .25)",
            filter: "blur(150px)",
          }}
        ></div>
        <div className="w-full pr-0 lg:pr-4 md:mb-4 mb-0">
          <div className="min-h-[200px] rounded-lg p-4 pt-0">
            <div className="flex w-full flex-col justify-center items-center text-center">
              <div className="flex w-full   min-w-fit px-3 md:px-12 py-6 justify-self-center flex-col">
                <div className="flex w-full  justify-between items-center pb-4 gap-4 flex-col md:flex-row">
                  <h3 className="text-[30px] justify-center md:justify-normal flex w-full font-bold md:text-[38px] leading-[110%] text-p5">
                    Upload PDF File
                  </h3>
                  <div className='w-full flex  flex-row'>
                    <button
                      disabled={!imageFile || isProcessing || !pdfUrl}
                      onClick={() => setPreviewOpen((prev) => !prev)}
                      className="flex w-full justify-center md:justify-end disabled:opacity-40 disabled:cursor-not-allowed  rounded-2xl group"
                    >
                      <span className="relative px-4  md:px-8 flex justify-around items-center w-fit before:g7 g4 min-h-fit py-2 rounded-2xl before:absolute before:inset-0 before:opacity-0 before:transition-opacity before:duration-500 before:content-[''] group-hover:before:opacity-100 overflow-hidden">
                        <Image
                          src={`${previewOpen ? 'images/ButtonUtils/eye1.svg' : 'images/ButtonUtils/eye2.svg'}`}
                          alt="logo"
                          width={28}
                          height={28}
                          className="brightness-200"
                        />
                        <span className="font-semibold text-16 flex gap-4 p-4 pr-0 text-p5">
                          Preview
                        </span>
                      </span>
                    </button>
                    {imageFile && !isProcessing && (
                      <button
                        onClick={() => {
                          convertToPDF()
                        }}
                        className="flex w-full disabled:opacity-40 disabled:cursor-not-allowed justify-center rounded-2xl group"
                      >
                        <span className="relative px-4  md:px-8 flex justify-around items-center w-fit before:g7 g4 min-h-fit py-2 rounded-2xl before:absolute before:inset-0 before:opacity-0 before:transition-opacity before:duration-500 before:content-[''] group-hover:before:opacity-100 overflow-hidden">
                          <Image
                            src={`images/ButtonUtils/process.svg`}
                            alt="logo"
                            width={28}
                            height={28}
                            className="brightness-200"
                          />
                          <span className="font-semibold text-16 flex gap-4 p-4 pr-0 text-p5">
                            Proccess
                          </span>
                        </span>
                      </button>
                    )}
                    <div className=' justify-center items-center flex'>
                      {isProcessing && (
                        <div className="w-6 ml-4 flex justify-self-center sm:w-8 h-6 sm:h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                      )}
                    </div>
                  </div>
                </div>
                <div className=' w-full md:mt-3  justify-around flex flex-col'>
                  <div
                    className={`flex-center ${dragActive ? "scale-105" : ""} min-w-72 md:min-w-full flex h-48 cursor-pointer flex-col gap-5 rounded-[16px] border border-dashed bg-[#7986AC] bg-opacity-20 border-p1 border-opacity-40 justify-center items-center text-white text-center  w-full backdrop-blur-lg  brightness-125 overflow-hidden shadow-[inset_0_0_10px_rgba(0,0,0,1)]`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => document.getElementById('fileInput')?.click()}
                  >
                    <div className="rounded-[16px] bg-s0/40 p-5 shadow-sm shadow-purple-200/50">
                      <input
                        id="fileInput"
                        type="file"
                        accept=".jpg, .jpeg, .png" // Limits to JPG and PNG formats
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

              {previewOpen && (
                <>
                  <div className="bg-p5/5 w-full font-normal p-1  rounded-lg pt-4 flex  cursor-pointer flex-col text-white text-center  backdrop-blur-[12px]   ">
                    <h2 className="font-bold mb-4 text-center text-[30px] leading-[140%] text-p5">
                      Full PDF Preview
                    </h2>

                    {pdfUrl ? (
                      <PDFViewer file={pdfUrl} />
                    ) : (
                      <div className="font-normal text-[16px] leading-[140%] flex justify-center text-p5">
                        No files uploaded. Upload files to preview and merge.
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageToPDF;
