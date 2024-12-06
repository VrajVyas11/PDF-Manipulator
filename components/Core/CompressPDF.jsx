import React, { useState, useRef, useEffect } from 'react';
import { PDFDocument } from 'pdf-lib';
import { saveAs } from 'file-saver';
import * as pdfjsLib from 'pdfjs-dist/webpack';

const PDFCompressor = () => {
  const [imageFile, setImageFile] = useState(null);
  const [compressionQuality, setCompressionQuality] = useState(0.5);
  const [compressedPdfBlob, setCompressedPdfBlob] = useState(null);
  const [error, setError] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [originalSize, setOriginalSize] = useState(null);
  const [compressionMessage, setCompressionMessage] = useState('');
  const pdfInputRef = useRef(null);

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
    if (file && file.type === 'application/pdf') {
      setImageFile(file);
      setError(null);
      setOriginalSize((file.size / 1024 / 1024).toFixed(2)); // Convert to MB
    } else {
      setError('Please upload a valid PDF file.');
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      setImageFile(file);
      setError(null);
      setOriginalSize((file.size / 1024 / 1024).toFixed(2)); // Convert to MB
    } else {
      setError('Please upload a valid PDF file.');
    }
  };

  const handleCompressionQualityChange = (e) => {
    setCompressionQuality(Number(e.target.value));
  };

  const compressPDF = async () => {
    if (!imageFile) {
      alert('Please select a PDF file to compress.');
      return;
    }

    setIsProcessing(true);
    setCompressionMessage('');

    const pdfDoc = await PDFDocument.create();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    try {
      const arrayBuffer = await imageFile.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      const numPages = pdf.numPages;

      for (let i = 1; i <= numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 1 });
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({
          canvasContext: ctx,
          viewport,
        }).promise;

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
      const compressedPdfBlob = new Blob([compressedPdfBytes], { type: 'application/pdf' });
      // console.log(compressedPdfBlob)
      setCompressedPdfBlob(compressedPdfBlob);
      setCompressionMessage(`Compressed size ${(compressedPdfBlob.size / 1024 / 1024).toFixed(2)} MB`);
    } catch (err) {
      console.error('Error compressing PDF:', err);
      alert('Failed to compress the PDF.');
    }

    setIsProcessing(false);
  };

  const previewPDF = () => {
    if (compressedPdfBlob) {
      const url = URL.createObjectURL(compressedPdfBlob);
      window.open(url, '_blank');
    }
  };

  const downloadPDF = () => {
    if (compressedPdfBlob) {
      saveAs(compressedPdfBlob, `compressed_${compressionQuality}.pdf`);
    }
  };

  return (
    <div className="flex w-full flex-col items-center border-t-0 border-[1px] border-gray-200 mx-auto bg-opacity-40 bg-[#1a1a1a] backdrop-blur-lg shadow-inner rounded-3xl text-white mb-16 sm:w-fit">
      <div className="text-white mb-10 text-2xl sm:text-3xl border-0 rounded-3xl rounded-b-none border-y-[1px] border-gray-200 text-center h-fit w-full backdrop-blur-lg bg-opacity-90 bg-[#1a1a1a] overflow-hidden font-extrabold tracking-wider shadow-[inset_0_0_30px_rgba(0,0,0,1)]">
        <h3 className="px-8 sm:px-16 w-full p-3 sm:p-5 text-center rounded-t-3xl">Compress PDF</h3>
      </div>
      <div className="px-6 sm:px-12 pb-5 sm:pb-7 w-full flex flex-col justify-center items-center">
        <div
          className={`border-4 border-dashed p-4 sm:p-5 h-28 sm:h-36 rounded-lg w-full max-w-md bg-gray-800 flex items-center justify-center cursor-pointer transition-transform duration-300 ease-in-out hover:scale-105 hover:border-blue-700 ${dragActive ? 'border-blue-400' : 'border-gray-600'
            }`}
          onDragOver={handleDrag}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => pdfInputRef.current?.click()}
        >
          <input
            id="fileInput"
            type="file"
            ref={pdfInputRef}
            accept="application/pdf"
            className="hidden"
            onChange={handleFileChange}
          />
          <p className="text-gray-400 text-center text-sm sm:text-base">
            {imageFile ? imageFile.name : 'Drag & Drop or click to upload a PDF'}
          </p>
        </div>
        {originalSize && <p className="text-gray-400 mt-2 text-sm">File Size: {originalSize} MB</p>}
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        <div className="justify-center flex items-end gap-2 text-lg sm:text-2xl">
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={compressionQuality}
            onChange={handleCompressionQualityChange}
            className="w-full sm:w-96 mt-4 h-6 sm:h-8 font-extrabold bg-gradient-to-r from-gray-600 via-gray-500 to-gray-600 rounded-full cursor-pointer appearance-none"
          />
          <span>{compressionQuality}</span>
        </div>
        <div className="flex gap-4 sm:gap-7 flex-wrap justify-center mt-6">
          <button
            onClick={compressPDF}
            className="px-4 sm:px-6 py-2 sm:py-4 bg-[#1e90ff] text-white font-mono shadow-lg tracking-wide rounded-lg hover:bg-blue-600 transition duration-300 font-extrabold ease-in-out disabled:opacity-50"
            disabled={isProcessing}
          >
            {isProcessing ? 'Processing...' : 'Compress PDF'}
          </button>
          <button
            onClick={previewPDF}
            className="px-4 sm:px-6 py-2 sm:py-4 bg-[#ff4500] text-white font-mono shadow-lg tracking-wide rounded-lg hover:bg-red-600 transition duration-300 font-extrabold ease-in-out disabled:opacity-50"
            disabled={!compressedPdfBlob}
          >
            Preview PDF
          </button>
          <button
            onClick={downloadPDF}
            className="px-4 sm:px-6 py-2 sm:py-4 bg-[#32cd32] text-white font-mono shadow-lg tracking-wide rounded-lg hover:bg-green-600 transition duration-300 font-extrabold ease-in-out disabled:opacity-50"
            disabled={!compressedPdfBlob}
          >
            Download PDF
          </button>
        </div>
        {compressionMessage && (
          <p className="text-green-400 text-center mt-4 text-lg">{compressionMessage}</p>
        )}
      </div>
    </div>
  );
};

export default PDFCompressor;
