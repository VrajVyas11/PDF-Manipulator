"use client"
import React, { useState, useEffect } from "react";
import { PDFDocument } from "pdf-lib";
import { saveAs } from "file-saver";
import * as pdfjsLib from "pdfjs-dist/webpack";
import Image from "next/image";
import { useToast } from "../../../hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";
import PDFViewer from "../../../components/Core/PDFViewer";

const PDFCompressor = () => {
  const [imageFile, setImageFile] = useState(null);
  const [compressionQuality, setCompressionQuality] = useState(0.5);
  const [compressedPdfBlob, setCompressedPdfBlob] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [originalSize, setOriginalSize] = useState(null);
  const [compressionMessage, setCompressionMessage] = useState("");
  const { toast } = useToast();
  const [previewOpen, setPreviewOpen] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);

  // object URL to preview; we track separately to revoke it when needed
  const [pdfObjectUrl, setPdfObjectUrl] = useState(null);

  useEffect(() => {
    pdfjsLib.GlobalWorkerOptions.workerSrc =
      "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js";
  }, []);

  useEffect(() => {
    return () => {
      // cleanup object URL on unmount
      if (pdfObjectUrl) URL.revokeObjectURL(pdfObjectUrl);
    };
  }, [pdfObjectUrl]);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    validateFile(file);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) validateFile(file);
  };

  const validateFile = (file) => {
    if (file.type === "application/pdf") {
      setImageFile(file);
      setOriginalSize((file.size / 1024 / 1024).toFixed(2));
    } else {
      showToastError("Please upload a valid PDF file.");
    }
  };

  const showToastError = (message) => {
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

  };

  const handleCompressionQualityChange = (e) => {
    const value = Math.min(Math.max(Number(e.target.value), 0), 1);
    setCompressionQuality(value);
  };

  const compressPDF = async () => {
    if (!imageFile) {
      showToastError("No PDF file selected.");
      return;
    }

    setIsProcessing(true);
    setCompressionMessage("");

    try {
      const arrayBuffer = await imageFile.arrayBuffer();
      const pdfDoc = await PDFDocument.create();
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const numPages = pdf.numPages;

      for (let i = 1; i <= numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 1 });
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({ canvasContext: ctx, viewport }).promise;

        const imageData = canvas.toDataURL("image/jpeg", compressionQuality);
        const imageBytes = await fetch(imageData).then((res) =>
          res.arrayBuffer()
        );
        const img = await pdfDoc.embedJpg(imageBytes);

        const pageWidth = img.width;
        const pageHeight = img.height;
        const newPage = pdfDoc.addPage([pageWidth, pageHeight]);
        newPage.drawImage(img, {
          x: 0,
          y: 0,
          width: pageWidth,
          height: pageHeight,
        });
      }

      const compressedPdfBytes = await pdfDoc.save();
      const compressedPdfBlob = new Blob([compressedPdfBytes], {
        type: "application/pdf",
      });

      // create an object URL for preview to avoid detached ArrayBuffer issues
      const objUrl = URL.createObjectURL(compressedPdfBlob);
      if (pdfObjectUrl) {
        URL.revokeObjectURL(pdfObjectUrl);
      }
      setPdfObjectUrl(objUrl);
      setPdfUrl(objUrl);

      setCompressedPdfBlob(compressedPdfBlob);
      setCompressionMessage(
        `Compressed size : ${(compressedPdfBlob.size / 1024 / 1024).toFixed(
          2
        )} MBs`
      );

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
            onClick={downloadPDF}
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
    } catch (err) {
      console.error("Error compressing PDF:", err);
      showToastError("Failed to compress the PDF.");
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadPDF = () => {
    if (compressedPdfBlob) {
      saveAs(compressedPdfBlob, `compressed_${compressionQuality}.pdf`);
    }
  };

  return (
    <div className="flex  flex-col w-full ">
      <div className="flex flex-col lg:px-0 lg:flex-row justify-center mt-5 mb-10 items-center w-full">
        <div className="flex flex-col  md:pl-4 w-full text-center lg:text-left">
          <h2 className="text-[30px] font-bold md:text-[38px] leading-[110%] text-p4">
            Compress PDF
          </h2>
          <p className="font-normal text-[16px] leading-[140%] mt-4 text-p5">
            Easily compress your PDFs with just a few clicks for faster sharing
            and storage.
          </p>
        </div>
        <button
          disabled={isProcessing || !imageFile || !compressedPdfBlob}
          onClick={downloadPDF}
          className={`flex w-full md:pr-4 disabled:opacity-40 disabled:cursor-not-allowed justify-center lg:justify-end rounded-2xl group mt-4 lg:mt-0`}
        >
          <span className="relative flex justify-around items-center w-fit before:g7 g4 min-h-fit px-4 py-2 rounded-2xl before:absolute before:inset-0 before:opacity-0 before:transition-opacity before:duration-500 before:content-[''] group-hover:before:opacity-100 overflow-hidden">
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
      <hr className="border-s3 border-2" />
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
              <div className="flex w-full   min-w-fit px-12 py-6 justify-self-center flex-col">
                <div className="flex w-full flex-col  justify-between items-center pb-4 gap-4 md:flex-row">
                  <h3 className="text-[30px] justify-center md:justify-normal flex w-full font-bold md:text-[38px] leading-[110%] text-p5">
                    Upload PDF File
                  </h3>
                  <div className="w-full  flex justify-center items-center flex-row">
                    <button
                      disabled={isProcessing || !imageFile || !compressedPdfBlob}
                      onClick={() => setPreviewOpen((prev) => !prev)}
                      className="flex w-full justify-center md:justify-end disabled:opacity-40 disabled:cursor-not-allowed  rounded-2xl group"
                    >
                      <span className="relative px-4 md:px-8 flex justify-end items-center w-fit before:g7 g4 min-h-fit py-2 rounded-2xl before:absolute before:inset-0 before:opacity-0 before:transition-opacity before:duration-500 before:content-[''] group-hover:before:opacity-100 overflow-hidden">
                        <Image
                          src={`${previewOpen
                            ? "images/ButtonUtils/eye1.svg"
                            : "images/ButtonUtils/eye2.svg"
                            }`}
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
                    {!isProcessing && imageFile && (
                      <button
                        disabled={!imageFile || isProcessing}
                        onClick={compressPDF}
                        className="flex pl-2 min-w-32 md:min-w-44 items-center justify-normal md:justify-end disabled:opacity-40 disabled:cursor-not-allowed rounded-2xl group"
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
                    <div className="flex justify-center items-center">
                      {isProcessing && (
                        <div className="w-6 ml-4 flex justify-self-center sm:w-8 h-6 sm:h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="w-full md:mt-3 flex flex-col gap-8">
                  <div
                    className={`flex-center ${dragActive ? "scale-105" : ""
                      } min-w-72 md:min-w-full flex h-48 cursor-pointer flex-col gap-5 rounded-[16px] border border-dashed bg-[#7986AC] bg-opacity-20 border-p1 border-opacity-40 justify-center items-center text-white text-center w-full backdrop-blur-lg brightness-125 overflow-hidden shadow-[inset_0_0_10px_rgba(0,0,0,1)]`}
                    onDragOver={handleDrag}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => document.getElementById("fileInput")?.click()}
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
                        className="brightness-125 "
                      />
                    </div>
                    <p className=" font-normal text-[16px] leading-[140%] brightness-75 text-p5">
                      {imageFile ? imageFile.name : "Click here to upload PDF"}
                    </p>
                  </div>

                  {imageFile && (
                    <div className="w-full flex -mt-3 items-center">
                      {/* Redesigned quality slider: majestic gradient, rounded track and thumb */}
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={compressionQuality}
                        onChange={handleCompressionQualityChange}
                        className="w-full border border-blue-400/40 backdrop-blur-lg brightness-125 bg-[#7986AC] bg-opacity-20 h-7 cursor-pointer appearance-none rounded-xl rounded-r-none  range-rose"
                        style={{
                          padding: "8px 0",
                        }}
                      />
                      {/* Fancy quality card */}
                      <div className="flex min-w-32 -ml-1 md:min-w-fit items-center gap-3 p-3 rounded-xl border border-indigo-500/20 bg-gradient-to-br from-slate-800/40 to-slate-900/20 backdrop-blur-md shadow-[0_6px_18px_rgba(2,6,23,0.6)]">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center bg-blue-500/20 p-1 ">
                          <Image
                            src="/images/ButtonUtils/quality.svg"
                            alt="Quality"
                            width={26}
                            height={26}
                            className="brightness-200 ml-1"
                          />
                        </div>
                        <div className="flex flex-row items-center justify-center gap-4 text-left">
                          <span className="font-semibold text-p5 text-[12px] md:text-[14px]">
                            PDF Quality
                          </span>
                          <span className="font-bold text-[14px] md:text-[16px] text-slate-100">
                            {Math.floor(compressionQuality * 100)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {originalSize && (
                    <div className="flex flex-col justify-center gap-4 items-center">
                      <div className="flex w-full justify-center items-center gap-4">
                        {/* Original size card */}
                        <div className="flex gap-3 w-full justify-center items-center p-3 rounded-xl border-2 border-red-500/20 bg-gradient-to-br from-red-700/6 to-red-900/4 backdrop-blur-md shadow-[0_8px_20px_rgba(139,0,0,0.06)]">
                          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-red-500/20">
                            <Image
                              src="/images/ButtonUtils/decompressed.svg"
                              alt="Original Size"
                              width={28}
                              height={28}
                              style={{ filter: "hue-rotate(90deg)" }}
                              className="brightness-200"
                            />
                          </div>
                          <span className="font-semibold text-[12px] md:text-[16px] text-red-400">
                            Original Size : {originalSize} MBs
                          </span>
                        </div>

                        {/* Compressed size card */}
                        {compressionMessage && (
                          <div className="flex gap-3 w-full justify-center items-center p-3 rounded-xl border-2 border-green-500/20 bg-gradient-to-br from-emerald-800/6 to-emerald-900/4 backdrop-blur-md shadow-[0_8px_20px_rgba(6,95,70,0.06)]">
                            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-green-500/20">
                              <Image
                                src="/images/options/compress.svg"
                                alt="Compressed Size"
                                width={28}
                                height={28}
                                style={{ filter: "hue-rotate(270deg)" }}
                                className="brightness-200"
                              />
                            </div>
                            <span className="font-semibold text-[12px] md:text-[16px] text-emerald-300">
                              {compressionMessage}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>


              {previewOpen && (
                <div className="mt-8 w-full px-6 md:px-0 pt-6 bg-gray-900/80 border border-gray-700/50 rounded-xl shadow-2xl backdrop-blur-lg">
                  <div className='flex flex-row pb-8 px-12 justify-between items-center'>
                    <div className="flex-1">
                      <h3 className="text-2xl md:text-3xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-gray-100 to-gray-300 tracking-tight">
                        PDF Preview
                      </h3>
                      <p className="text-sm text-gray-400 mt-1">Review your document before processing</p>
                    </div>
                    <button
                      disabled={!pdfUrl}
                      onClick={() => setPreviewOpen((prev) => !prev)}
                      className="ml-4 disabled:opacity-30 disabled:cursor-not-allowed transition-opacity"
                      aria-label="Close preview"
                    >
                      <span className="flex items-center justify-center w-10 h-10 rounded-full bg-red-600/60 hover:bg-red-600/70 backdrop-blur-lg border border-red-700 text-gray-300 hover:text-white transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="18" y1="6" x2="6" y2="18"></line>
                          <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                      </span>
                    </button>
                  </div>

                  {pdfUrl ? (
                    <div className="overflow-hidden">
                      <PDFViewer file={pdfUrl} />
                    </div>
                  ) : (
                    <div className="py-12 text-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto text-gray-500">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                        <line x1="16" y1="13" x2="8" y2="13"></line>
                        <line x1="16" y1="17" x2="8" y2="17"></line>
                        <polyline points="10 9 9 9 8 9"></polyline>
                      </svg>
                      <p className="mt-4 text-gray-400 font-medium">No files uploaded</p>
                      <p className="text-sm text-gray-500 mt-1">Upload PDFs to preview and merge</p>
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PDFCompressor;