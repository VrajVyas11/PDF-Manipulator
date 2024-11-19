import React, { useState } from 'react';
import { uploadPdf } from '../utils/uploadPdf';

const InputPdfUpload = ({ setPdfData, setCurrentPage}) => {
  const [dragActive, setDragActive] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [isContinueClicked, setIsContinueClicked] = useState(false);
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

  const handleUpload = async () => {
    setIsContinueClicked(true)
    await uploadPdf(imageFile, setPdfData, setCurrentPage);
    setIsContinueClicked(false)
  };

  return (

  <div className="flex flex-col justify-center items-center text-white text-center  p-5  h-fit w-full  rounded-lg ">
      
    <h1 className="text-lg text-sky-500 justify-self-center   border-y-2 w-full px-36 py-3 border-double rounded-2xl font-extrabold tracking-widest mb-6 text-center ">
        Optimized for text only PDFs 
</h1>
<div
   className={`border-4 w-full border-dashed p-5 h-36 rounded-lg  bg-gray-800 flex items-center justify-center cursor-pointer transition-transform duration-300 ease-in-out hover:scale-105 hover:border-blue-700 ${dragActive ? 'border-blue-400' : 'border-gray-600'}`}
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
        <p className="text-center text-gray-400">{imageFile ? imageFile.name : 'Drag & Drop a PDF or click to upload'}</p>
      </div>
      {imageFile && !isContinueClicked &&
      <button
        onClick={handleUpload}
        className="px-6 py-4 w-fit mt-4 bg-blue-500 text-white font-mono shadow-lg tracking-wide rounded-lg hover:bg-blue-600 transition duration-300 font-extrabold ease-in-out disabled:opacity-50"
    >
      Continue
      </button>
      }
  {isContinueClicked && (
    <div className="w-8 h-8 mt-4 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
  )}

    </div>
  );
};

export default InputPdfUpload;
