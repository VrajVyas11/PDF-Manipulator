import React, { useState, useEffect } from 'react';
import { PDFDocument } from 'pdf-lib';
import { saveAs } from 'file-saver';
import * as pdfjsLib from 'pdfjs-dist/webpack';
import Image from 'next/image';
import { useToast } from '../../hooks/use-toast';
import { ToastAction } from '@/components/ui/toast';
import PDFViewer from "./PDFViewer"
const PDFCompressor = () => {
  const [imageFile, setImageFile] = useState(null);
  const [compressionQuality, setCompressionQuality] = useState(0.5);
  const [compressedPdfBlob, setCompressedPdfBlob] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [originalSize, setOriginalSize] = useState(null);
  const [compressionMessage, setCompressionMessage] = useState('');
  const { toast } = useToast();
  const [previewOpen, setPreviewOpen] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);
  useEffect(() => {
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';
  }, []);

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
    if (file.type === 'application/pdf') {
      setImageFile(file);
      setOriginalSize((file.size / 1024 / 1024).toFixed(2));
    } else {
      showToastError('Please upload a valid PDF file.');
    }
  };

  const showToastError = (message) => {
    toast({
      title: message,
      variant: 'destructive',
      className: " font-semibold text-[12px] md:text-[16px] text-red-500 gap-3 w-full py-2 bg-red-500  bg-opacity-20 p-2 md:p-4 rounded-lg border-2 border-red-500 border-opacity-50 backdrop-blur-md",
    });
  };

  const handleCompressionQualityChange = (e) => {
    const value = Math.min(Math.max(Number(e.target.value), 0), 1);
    setCompressionQuality(value);
  };

  const compressPDF = async () => {
    if (!imageFile) {
      showToastError('No PDF file selected.');
      return;
    }

    setIsProcessing(true);
    setCompressionMessage('');

    try {
      const arrayBuffer = await imageFile.arrayBuffer();
      const pdfDoc = await PDFDocument.create();
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const numPages = pdf.numPages;

      for (let i = 1; i <= numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 1 });
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({ canvasContext: ctx, viewport }).promise;

        const imageData = canvas.toDataURL('image/jpeg', compressionQuality);
        const imageBytes = await fetch(imageData).then((res) => res.arrayBuffer());
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
      setPdfUrl(compressedPdfBytes)
      const compressedPdfBlob = new Blob([compressedPdfBytes], { type: 'application/pdf' });
      setCompressedPdfBlob(compressedPdfBlob);
      setCompressionMessage(`Compressed size : ${(compressedPdfBlob.size / 1024 / 1024).toFixed(2)} MBs`);

      toast({
        title: 'Your PDF is ready to be downloaded. Click below to download it.',
        action: (
          <ToastAction
            className="bg-green-500 hover:bg-green-800 text-p5 bg-opacity-10 border-green-500"
            onClick={downloadPDF}
            altText="Download PDF"
          >
            Download
          </ToastAction>
        ),
        className: "flex gap-3 font-bold text-[12px] md:text-[16px] text-green-500 w-full justify-center items-center bg-green-500 bg-opacity-20  p-2 md:p-4 py-2 rounded-lg border-2 border-green-500 backdrop-blur-md",
      });
    } catch (err) {
      console.error('Error compressing PDF:', err);
      showToastError('Failed to compress the PDF.');
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
          <h2 className="text-[30px] font-bold md:text-[38px] leading-[110%] text-p4">Compress PDF</h2>
          <p className="font-normal text-[16px] leading-[140%] mt-4 text-p5">
            Easily compress your PDFs with just a few clicks for faster sharing and storage.
          </p>

        </div>
        <button
          disabled={isProcessing || !imageFile || !compressedPdfBlob}
          onClick={downloadPDF}
          className={`flex w-full md:pr-4 disabled:opacity-40 disabled:cursor-not-allowed justify-center lg:justify-end rounded-2xl group mt-4 lg:mt-0`}
        >
          <span className="relative flex justify-around items-center w-fit before:g7 g4 min-h-fit px-4 py-2 rounded-2xl before:absolute before:inset-0 before:opacity-0 before:transition-opacity before:duration-500 before:content-[''] group-hover:before:opacity-100 overflow-hidden">
            <Image
              src="/images/download.svg"
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
      <hr className='border-s3 border-2' />
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
                  <div className='w-full  flex justify-center items-center flex-row'>
                    <button
                      disabled={isProcessing || !imageFile || !compressedPdfBlob}
                      onClick={() => setPreviewOpen((prev) => !prev)}
                      className="flex w-full justify-center md:justify-end disabled:opacity-40 disabled:cursor-not-allowed  rounded-2xl group"
                    >
                      <span className="relative px-4 md:px-8 flex justify-end items-center w-fit before:g7 g4 min-h-fit py-2 rounded-2xl before:absolute before:inset-0 before:opacity-0 before:transition-opacity before:duration-500 before:content-[''] group-hover:before:opacity-100 overflow-hidden">
                        <Image
                          src={`${previewOpen ? 'images/eye1.svg' : 'images/eye2.svg'}`}
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
                    {/* {imageFile &&<div className='flex justify-center items-center'> */}
                    {!isProcessing && imageFile && (
                      <button
                        disabled={!imageFile || isProcessing}
                        onClick={compressPDF}
                        className="flex pl-2 min-w-32 md:min-w-44 items-center justify-normal md:justify-end disabled:opacity-40 disabled:cursor-not-allowed rounded-2xl group"
                      >
                        <span className="relative px-4 md:px-8 flex justify-around items-center w-fit before:g7 g4 min-h-fit py-2 rounded-2xl before:absolute before:inset-0 before:opacity-0 before:transition-opacity before:duration-500 before:content-[''] group-hover:before:opacity-100 overflow-hidden">
                          <Image
                            src={`images/process.svg`}
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
                      {isProcessing && (
                        <div className="w-6 flex justify-self-center sm:w-8 h-6 sm:h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
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
                        src="/images/add.svg"
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

                  {imageFile && (
                    <div className="w-full flex items-center gap-4">
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={compressionQuality}
                        onChange={handleCompressionQualityChange}
                        className="w-full h-8 cursor-pointer appearance-none rounded-lg border-2 border-p1 border-opacity-50 bg-[#7986AC]/10"
                      />
                      <div className="flex min-w-32 md:min-w-44 items-center py-2 gap-3  bg-sky-500 bg-opacity-20 p-4 rounded-lg border-2 border-p1 border-opacity-50 backdrop-blur-md ">
                        <Image
                          src="/images/quality.svg"
                          alt="Quality"
                          width={32}
                          height={32}
                          style={{ filter: 'hue-rotate(300deg)' }}
                        />
                        <span className="font-semibold text-p5 text-[12px] md:text-[16px]">
                          Quality : {Math.floor(compressionQuality * 100)}%
                        </span>
                      </div>
                    </div>
                  )}
                  {originalSize && (
                    <div className="flex flex-col justify-center gap-4 items-center">
                      <div className="flex w-full justify-center items-center gap-4">
                        <div className="flex  gap-3 w-full justify-center py-2 items-center bg-red-500  bg-opacity-20 p-2 md:p-4 rounded-lg border-2 border-red-500 border-opacity-50 backdrop-blur-md">
                          <Image
                            src="/images/decompressed.svg"
                            alt="Original Size"
                            width={32}
                            height={32}
                            style={{ filter: 'hue-rotate(90deg)' }}
                            className="brightness-200 w-6 h-6 md:w-8 md:h-8"
                          />
                          <span className="font-semibold text-[12px] md:text-[16px] text-red-500">
                            Original Size : {originalSize} MBs
                          </span>
                        </div>
                        {compressionMessage && (
                          <div className="flex gap-3 w-full justify-center items-center bg-green-500 bg-opacity-20  p-2 md:p-4 py-2 rounded-lg border-2 border-green-500 backdrop-blur-md">
                            <Image
                              src="/images/compress.svg"
                              alt="Compressed Size"
                              width={32}
                              height={32}
                              style={{ filter: 'hue-rotate(270deg)' }}
                              className="brightness-200 w-6 h-6 md:w-8 md:h-8"
                            />
                            <span className="font-semibold text-[12px] md:text-[16px] text-green-500">
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

export default PDFCompressor;
