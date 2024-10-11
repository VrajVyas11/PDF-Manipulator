import React, { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import Image from 'next/image'; // Importing the Image component

const ImageToPDF = () => {
  const [imageFile, setImageFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);

  // Handle file input change
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setImageFile(file);
    } else {
      alert('Please upload a valid image file');
    }
  };

  // Handle drag and drop functionality
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
    if (file && file.type.startsWith('image/')) {
      setImageFile(file);
    } else {
      alert('Please upload a valid image file');
    }
  };

  const handleDragLeave = () => {
    setDragActive(false);
  };

  // Convert the image to a PDF and display preview
  const convertToPDF = async () => {
    if (!imageFile) return;

    const fileReader = new FileReader();
    fileReader.onload = async (e) => {
      const imageBytes = e.target.result;

      // Create a new PDF Document
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage();

      let img;
      try {
        img = await pdfDoc.embedJpg(imageBytes);
      } catch (error) {
        try {
          img = await pdfDoc.embedPng(imageBytes);
        } catch (pngError) {
          alert('Error: Image format not supported.');
          return;
        }
      }

      const { width, height } = img.scale(1);
      page.setSize(width, height);
      page.drawImage(img, { x: 0, y: 0, width, height });

      const pdfBytes = await pdfDoc.save();

      // Create a blob URL for preview in iframe
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const pdfBlobUrl = URL.createObjectURL(blob);
      setPdfUrl(pdfBlobUrl);
    };

    fileReader.readAsArrayBuffer(imageFile);
  };

  // Download the PDF
  const downloadPdf = () => {
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = 'image-to-pdf.pdf';
    link.click();
  };

  return (
    <div className="flex flex-col items-center justify-center h-fit p-6 space-y-6 md:space-y-8">
      {/* Drag & Drop Area */}
      <div
 className={`border-4 border-dashed p-10 rounded-lg w-full max-w-md bg-sky-200 flex items-center justify-center cursor-pointer transition-transform duration-1000 ease-in-out hover:scale-105 border-sky-500`}
        onDragOver={handleDrag}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => document.getElementById('fileInput').click()}
      >
        <input
          id="fileInput"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
        <p className="text-center text-gray-800">
          {imageFile ? imageFile.name : 'Drag & Drop an image or click to upload'}
        </p>
      </div>

      {/* Convert Button */}
      <button
        onClick={convertToPDF}
        className="px-6 py-4 bg-blue-500 text-white font-mono tracking-wide rounded-lg hover:bg-blue-600 transition duration-300 ease-in-out disabled:opacity-50"
        disabled={!imageFile}
      >
        Convert to PDF
      </button>

      {/* PDF Preview Section */}
      {pdfUrl && (
        <div className="mt-8 w-full tracking-widest bg-gray-800 rounded-lg p-2 py-1 flex flex-col items-center">
          <h3 className="text-3xl flex justify-center items-center font-semibold text-white my-2">
            PDF Preview,
            <span className="flex items-center mx-1 bg-opacity-50 px-1 bg-yellow-200">
              Annotation <Image className="mx-1 h-5 w-5" src="/annotate.png" alt="Annotate" width={20} height={20} />
            </span>
            and
            <span className="flex items-center mx-1 bg-opacity-50 px-1 bg-blue-200">
              Download <Image className="mx-1 h-6 w-6" src="/save.png" alt="Download" width={24} height={24} />
            </span>
          </h3>
          <div className=' w-full h-screen'>
          <iframe
            src={pdfUrl}
            title="PDF Preview"
            className="border-2 border-gray-300 rounded-lg w-full h-full"

          />
          </div>
          {/* <button
            onClick={downloadPdf}
            className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition duration-300 ease-in-out"
          >
            Download PDF
          </button> */}
        </div>
      )}
    </div>
  );
};

export default ImageToPDF;
