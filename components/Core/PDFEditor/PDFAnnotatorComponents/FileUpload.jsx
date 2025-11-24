import React from 'react';
import Image from 'next/image';

const FileUpload = ({ pdfFile, dragActive, handleDrag, handleDrop, handleDragLeave, handleFileChange }) => {
  return (
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
          onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
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
        {pdfFile ? pdfFile.name : 'Click here to upload PDF'}
      </p>
    </div>
  );
};

export default FileUpload;