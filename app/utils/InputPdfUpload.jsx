import React, { useState } from 'react';
import { uploadPdf } from '../utils/uploadPdf';

const InputPdfUpload = ({ setPdfData, setCurrentPage }) => {
  const [dragActive, setDragActive] = useState(false);
  const [imageFile, setImageFile] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      setImageFile(file);
    } else {
      alert('Please upload a valid PDF file');
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
      alert('Please upload a valid PDF file');
    }
  };

  const handleDragLeave = () => {
    setDragActive(false);
  };

  const handleUpload = () => {
    uploadPdf(imageFile, setPdfData, setCurrentPage);
  };

  return (
    <div className="flex flex-col items-center justify-center h-fit space-y-6">
      <div
        className={`border-4 border-dashed bg-gray-100 p-10 rounded-lg w-full max-w-md bg-wheat flex items-center justify-center cursor-pointer transition-colors duration-300 ease-in-out ${dragActive ? 'border-blue-400' : 'border-gray-300'}`}
        onDragOver={handleDrag}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => document.getElementById('fileInput').click()}
      >
        <input
          id="fileInput"
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={handleFileChange}
        />
        <p className="text-center text-gray-500">{imageFile ? imageFile.name : 'Drag & Drop a PDF or click to upload'}</p>
      </div>
      <button
        onClick={handleUpload}
        className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700"
      >
        Upload PDF
      </button>
    </div>
  );
};

export default InputPdfUpload;
