import React, { useState, useRef,useEffect } from 'react';
import { PDFDocument } from 'pdf-lib';
import { saveAs } from 'file-saver';
import * as pdfjsLib from 'pdfjs-dist/webpack';
const PDFCompressor = () => {
  const [pdfFiles, setPdfFiles] = useState([]);
  const [compressionQuality, setCompressionQuality] = useState(0.5);
  const [compressedPdfBlob, setCompressedPdfBlob] = useState(null);
  const pdfInputRef = useRef(null);
  const [imageFile, setImageFile] = useState(null);
  const [images, setImages] = useState([]);
  const [error, setError] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js";
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
    } else {
      setError('Please upload a PDF file.');
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const validPdfs = files.filter((file) => file.type === 'application/pdf');
    setPdfFiles(validPdfs);
  };

  const handleCompressionQualityChange = (e) => {
    setCompressionQuality(Number(e.target.value));
  };

  const compressPDF = async () => {
    if (pdfFiles.length === 0) {
      alert("Please select PDF files to compress.");
      return;
    }
  
    const pdfDoc = await PDFDocument.create();
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
  
    for (const file of pdfFiles) {
      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  
      try {
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
  
          const imageData = canvas.toDataURL("image/jpeg", compressionQuality); 
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
      } catch (err) {
        console.error(`Error processing file: ${file.name}`, err);
        alert(`Failed to process ${file.name}`);
      }
    }
  
    const compressedPdfBytes = await pdfDoc.save();
    const compressedPdfBlob = new Blob([compressedPdfBytes], { type: "application/pdf" });
    setCompressedPdfBlob(compressedPdfBlob);
    resetInput();
  };
  
  const resetInput = () => {
    pdfInputRef.current.value = '';
    setPdfFiles([]);
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
    <div className="flex w-fit flex-col items-center border-t-0 border-[1px] border-gray-200 mx-auto bg-opacity-40 bg-[#1a1a1a] backdrop-blur-lg shadow-inner rounded-3xl text-white mb-16 ">
    <div className="text-white mb-10 text-3xl border-0 rounded-3xl rounded-b-none border-y-[1px] border-gray-200   text-center  h-fit w-full backdrop-blur-lg  bg-opacity-90  bg-[#1a1a1a]  overflow-hidden  font-extrabold  tracking-wider  shadow-[inset_0_0_30px_rgba(0,0,0,1)]">
      <h3 className="text-3xl font-extrabold  px-16 w-full p-5 text-center rounded-t-3xl">
        Compress PDF
      </h3>
    </div>
    <div className=' px-12 pb-7 w-full flex flex-col justify-center items-center'>
      <div
        className={`border-4 border-dashed p-5 h-36 rounded-lg w-full max-w-md bg-gray-800 flex items-center justify-center cursor-pointer transition-transform duration-300 ease-in-out hover:scale-105 hover:border-blue-700 ${dragActive ? 'border-blue-400' : 'border-gray-600'}`}
        onDragOver={handleDrag}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => document.getElementById('fileInput')?.click()}
      >
        <input
          id="fileInput"
          type="file"
          ref={pdfInputRef}
          accept="application/pdf"
          className="hidden"
          onChange={handleFileChange}
        />
        <p className="text-gray-400">{imageFile ? imageFile.name : 'Drag & Drop or click to upload an image'}</p>
      </div>
      <div className=' justify-center flex items-end gap-2 text-2xl'>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={compressionQuality}
          onChange={handleCompressionQualityChange}
          className="w-96 mt-4 h-8 font-extrabold bg-gradient-to-r from-gray-600 via-gray-500 to-gray-600 rounded-full cursor-pointer appearance-none"
        />

        <span>{compressionQuality}</span>
      </div>
      <div className='flex gap-7'>
        <button
          onClick={compressPDF}
          className="px-6 mt-10 py-4 w-fit bg-[#1e90ff] text-white font-mono shadow-lg tracking-wide rounded-lg hover:bg-blue-600 transition duration-300 font-extrabold ease-in-out disabled:opacity-50"
        >
          Compress PDF
        </button>
        <button
          onClick={previewPDF}
          className="px-6 mt-10 py-4 w-fit bg-[#ff4500] text-white font-mono shadow-lg tracking-wide rounded-lg hover:bg-red-600 transition duration-300 font-extrabold ease-in-out disabled:opacity-50"
          disabled={!compressedPdfBlob}
        >
          Preview PDF
        </button>
        <button
          onClick={downloadPDF}
          className="px-6 mt-10 py-4 w-fit bg-[#32cd32] text-white font-mono shadow-lg tracking-wide rounded-lg hover:bg-green-600 transition duration-300 font-extrabold ease-in-out disabled:opacity-50"
          disabled={!compressedPdfBlob}
        >
          Download PDF
        </button>
      </div>
      <div style={{ marginTop: '20px' }}>
        {pdfFiles.map((file, index) => (
          <p key={index} style={{ color: '#aaa' }}>
            {file.name}
          </p>
        ))}
      </div>
      </div>
    </div>
  );
};

export default PDFCompressor;
