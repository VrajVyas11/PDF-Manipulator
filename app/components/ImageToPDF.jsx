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
      setPdfUrl(null)
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
      <div className={`${pdfUrl?"w-full":"w-fit"} p-8`}>
  <div className="flex w-full justify-center items-center">
    {/* Upload Section */}
    <div className={`flex flex-col justify-center items-center ${pdfUrl?"w-5/6":"w-full"}  bg-sky-100 rounded-lg shadow-lg`}>
    <div className="text-3xl bg-gray-800 px-8 py-2 pt-6 w-full placeholder:text-center text-white rounded-lg rounded-b-none font-bold">
    <h3 className="text-3xl flex justify-center items-center font-semibold text-white mb-6">
    PDF Preview,
    <span className="flex items-center mx-2 bg-opacity-60 px-2 bg-yellow-300 rounded-md shadow-sm">
      Annotation <Image className="mx-2 h-5 w-5" src="/annotate.png" alt="Annotate" width={20} height={20} />
    </span>
    and
    <span className="flex items-center mx-2 bg-opacity-60 px-2 bg-blue-300 rounded-md shadow-sm">
      Download <Image className="mx-2 h-6 w-6" src="/save.png" alt="Download" width={24} height={24} />
    </span>
  </h3>
  </div>
      <div
        className={`border-4 border-dashed p-8  rounded-lg w-4/5 mt-8 bg-sky-200 flex items-center justify-center cursor-pointer transition-transform duration-500 hover:scale-x-105 border-sky-500`}
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
        <p className="text-center text-blue-700 font-semibold">
          {imageFile ? imageFile.name : 'Drag & Drop or Click to Upload Image'}
        </p>
      </div>

    {/* PDF Preview Section */}
    {pdfUrl && (
      <div className="h-fit flex justify-center flex-col items-center w-full overflow-hidden">
  <iframe
    src={pdfUrl}
    title="Preview PDF"
    className="border border-sky-400 rounded-lg shadow-md transform scale-75 "
    style={{ width: '100%', height: '667px' }} // Compensating for the scale(0.75) factor
  />
  <button
        onClick={downloadPdf}
        className=" w-4/5 mb-10 py-3 bg-emerald-500 text-white font-semibold rounded-lg shadow-lg hover:bg-emerald-600 transition duration-300 ease-in-out disabled:opacity-50"
        disabled={!imageFile}
      >
        Download PDF
      </button>
</div>

    )}
      <button
        onClick={convertToPDF}
        className={` w-5/6 ${pdfUrl?"hidden":""} py-3 my-5 bg-blue-500 text-white font-semibold rounded-lg shadow-lg hover:bg-blue-600 transition duration-300 ease-in-out disabled:opacity-50`}
        disabled={!imageFile}
      >
        Convert to PDF
      </button>
    </div>

  </div>
</div>


    </div>
  );
};

export default ImageToPDF;
