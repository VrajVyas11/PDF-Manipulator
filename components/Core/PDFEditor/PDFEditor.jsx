import React, { useState } from 'react';
import PDFEditorSimpleText from "./PDFEditorSimpleText.jsx";
import PDFEditorComplex from "./PDFEditorComplex.jsx";
import Image from 'next/image.js';
function PDFEditor() {
  const [isBackendBased, setIsBackendBased] = useState(false);
  const toggleImplementation = (toggle) => {
    setIsBackendBased(toggle);
  };

  return (
    <div className="flex  flex-col w-full ">
      <div className="flex flex-col lg:px-0 lg:flex-row justify-center mt-5 mb-10 items-center w-full">
        <div className="flex flex-col  md:pl-4 w-full text-center lg:text-left">
          <h2 className="text-[30px] font-bold md:text-[38px] leading-[110%] text-p4">
            PDF Editor
          </h2>
          <p className="font-normal text-[16px] leading-[140%] mt-4 text-p5">
            Effortlessly edit your PDFs with just a few clicks, enhancing your documents for seamless sharing and storage.
          </p>
        </div>
        <div
          className={`flex w-full px-2 gap-4 justify-center lg:justify-end rounded-2xl group mt-4 lg:mt-0`}
        >
          <span onClick={() => toggleImplementation(false)}
            className={`relative ${!isBackendBased ? "brightness-150 shadow-[0_0_10px_rgba(0,0,0,1)] shadow-blue-400 " : ""} cursor-pointer flex justify-around items-center w-fit before:g7 g4 min-h-fit px-4 py-2 rounded-2xl before:absolute before:inset-0 before:opacity-0 before:transition-opacity before:duration-500 before:content-[''] group-hover:before:opacity-100 overflow-hidden`}>
            <Image
              src="/images/ButtonUtils/zap.svg"
              alt="logo"
              width={32}
              height={32}
              className="brightness-200"
            />
            <span className="font-semibold text-16 flex p-4 pr-0 text-p5">
              Complex PDFs
            </span>
          </span>
          <span onClick={() => toggleImplementation(true)}
            className={`relative ${isBackendBased ? "brightness-150 shadow-[0_0_10px_rgba(0,0,0,1)] shadow-blue-400 " : ""} cursor-pointer flex justify-around items-center w-fit before:g7 g4 min-h-fit px-4 py-2 rounded-2xl before:absolute before:inset-0 before:opacity-0 before:transition-opacity before:duration-500 before:content-[''] group-hover:before:opacity-100 overflow-hidden`}>
            <Image
              src="/images/ButtonUtils/backend.svg"
              alt="logo"
              width={28}
              height={28}
              className="brightness-200"
            />
            <span className="font-semibold text-16 flex gap-4 p-4 pr-0 text-p5">
              Simple PDFs
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
        {isBackendBased ? (
          <div>
            <PDFEditorSimpleText />
          </div>
        ) : (
          <PDFEditorComplex />
        )}
      </div>
    </div>
  );
}

export default PDFEditor;
