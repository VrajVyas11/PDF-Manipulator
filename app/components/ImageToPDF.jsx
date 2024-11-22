import React, { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import PDFViewer from "./PDFViewer"
const ImageToPDF = () => {
  const [imageFile, setImageFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setImageFile(file);
      setPdfUrl(null);
    } else {
      alert('Please upload a valid image file');
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
      alert('Please upload a valid image file');
    }
  };

  const convertToPDF = async () => {
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
      } catch (err) {
        alert('Failed to convert image to PDF.',err);
      } finally {
        setIsProcessing(false);
      }
    };

    reader.readAsArrayBuffer(imageFile);
  };

  const downloadPdf = () => {
    if (pdfUrl) {
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = 'image-to-pdf.pdf';
      link.click();
    }
  };

  return (
    <div className="flex flex-col  items-center border-t-0 border-[1px] border-gray-200 w-full sm:w-fit mx-auto bg-opacity-40 bg-[#1a1a1a] backdrop-blur-lg shadow-inner rounded-3xl text-white mb-16">
      <div className="text-white mb-8 sm:mb-10 text-2xl sm:text-3xl border-0 rounded-3xl rounded-b-none border-y-[1px] border-gray-200 text-center h-fit w-full backdrop-blur-lg bg-opacity-90 bg-[#1a1a1a] overflow-hidden font-extrabold tracking-wider shadow-[inset_0_0_30px_rgba(0,0,0,1)]">
        <h3 className="text-2xl leading-10 sm:text-3xl font-extrabold px-8 sm:px-16 w-full p-3 sm:p-5 text-center rounded-t-3xl">
          PDF Preview,{' '}
          <span className="bg-yellow-400 text-black px-2 rounded-md">Annotation</span>{' '}
          and{' '}
          <span className="bg-blue-400 text-black px-2 rounded-md">Download</span>
        </h3>
      </div>
      <div className="px-6 sm:px-12 pb-5 sm:pb-7 w-full flex flex-col justify-center items-center">
        <div
          className={`border-4  mb-8 sm:mb-10 border-dashed p-4 sm:p-5 h-28 sm:h-36 rounded-lg w-full max-w-sm sm:max-w-md bg-gray-800 flex items-center justify-center cursor-pointer transition-transform duration-300 ease-in-out hover:scale-105 hover:border-blue-700 ${dragActive ? 'border-blue-400' : 'border-gray-600'
            }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => document.getElementById('fileInput')?.click()}
        >
          <input
            id="fileInput"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
          <p className="text-gray-400 text-center text-sm sm:text-base">
            {imageFile ? imageFile.name : 'Drag & Drop or click to upload an image'}
          </p>
        </div>

        {imageFile && !isProcessing && (
          <button
            onClick={convertToPDF}
            className="md:px-12 px-5  sm:px-6 py-3 sm:py-4 md:w-fit sm:w-fit mb-8 sm:mb-9 bg-blue-500 text-white font-mono shadow-lg tracking-wide rounded-lg hover:bg-blue-600 transition duration-300 font-extrabold ease-in-out disabled:opacity-50"
          >
            Continue
          </button>
        )}

        {isProcessing && (
          <div className="w-6 sm:w-8 h-6 sm:h-8 mb-8 sm:mb-9 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        )}

        {pdfUrl && (
          <div className="px-4 sm:px-6 w-full flex flex-col items-center">
            <div
              src={pdfUrl}
              title="PDF Preview"
              className="w-full h-fit border border-gray-600 rounded-lg shadow-md"
            >
              <PDFViewer file={pdfUrl} />
            </div>
            <button
              onClick={downloadPdf}
              className="mt-4 px-4 sm:px-6 w-full md:w-full sm:w-fit mb-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg shadow-lg transition"
            >
              Download
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageToPDF;
