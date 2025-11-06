"use client"
import React, { useState } from 'react';
import Image from 'next/image.js';
import dynamic from "next/dynamic";
const PDFEditorComplex = dynamic(() => import( "../../../components/Core/PDFEditor/PDFEditorComplex.jsx"),{
  ssr:false,
  loading: () => (
    <div className="flex items-center justify-center h-screen">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm text-gray-400">Loading PDF Editor...</p>
      </div>
    </div>
  )
});

import PDFAnnotator from "../../../components/Core/PDFEditor/PDFAnnotator.jsx";
 
function PDFEditor() {
  const [isAnnotation, setIsAnnotation] = useState(true);
  const toggleImplementation = (toggle) => {
    setIsAnnotation(toggle);
  };

  // Dynamic title & description based on selection
  const title = isAnnotation ? 'PDF Annotator' : 'PDF Editor';
  const description = isAnnotation
    ? 'Full-featured PDF annotation suite — highlights, ink, shapes, text editing, stamps, and precise annotation controls for advanced workflows.'
    : 'Effortlessly edit and manage complex PDFs with our robust editor — ideal for multi-page documents, forms, and advanced layout needs.';

  return (
    <div className="flex  flex-col w-full ">
      <div className="flex flex-col lg:px-0 lg:flex-row justify-center mt-5 mb-10 items-center w-full">
        <div className="flex flex-col  md:pl-4 w-full text-center lg:text-left">
          <h2 className="text-[30px] font-bold md:text-[38px] leading-[110%] text-p4">
            {title}
          </h2>
          <p className="font-normal text-[16px] leading-[140%] mt-4 text-p5">
            {description}
          </p>
        </div>
        <div
          className={`flex w-full px-2 gap-4 justify-center lg:justify-end rounded-2xl group mt-4 lg:mt-0`}
        >
                    <span onClick={() => toggleImplementation(true)}
            className={`relative ${isAnnotation ? "brightness-150 shadow-[0_0_10px_rgba(0,0,0,1)] shadow-blue-400 " : ""} cursor-pointer flex justify-around items-center w-fit before:g7 g4 min-h-fit px-4 py-2 rounded-2xl before:absolute before:inset-0 before:opacity-0 before:transition-opacity before:duration-500 before:content-[''] group-hover:before:opacity-100 overflow-hidden`}>
            <Image
              src="/images/ButtonUtils/backend.svg"
              alt="logo"
              width={28}
              height={28}
              className="brightness-200"
            />
            <span className="font-semibold text-16 flex gap-4 p-4 pr-0 text-p5">
              PDF Annotator
            </span>
          </span>
          <span onClick={() => toggleImplementation(false)}
            className={`relative ${!isAnnotation ? "brightness-150 shadow-[0_0_10px_rgba(0,0,0,1)] shadow-blue-400 " : ""} cursor-pointer flex justify-around items-center w-fit before:g7 g4 min-h-fit px-4 py-2 rounded-2xl before:absolute before:inset-0 before:opacity-0 before:transition-opacity before:duration-500 before:content-[''] group-hover:before:opacity-100 overflow-hidden`}>
            <Image
              src="/images/ButtonUtils/zap.svg"
              alt="logo"
              width={32}
              height={32}
              className="brightness-200"
            />
            <span className="font-semibold text-16 flex p-4 pr-0 text-p5">
              PDF Editor
            </span>
          </span>

        </div>
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
        {isAnnotation ? (
          <div>
            <PDFAnnotator />
          </div>
        ) : (
          <PDFEditorComplex />
        )}
      </div>
    </div>
  );
}

export default PDFEditor;