import React from 'react'
import Image from 'next/image';
import dynamic from 'next/dynamic';

const PDFEditor = dynamic(() => import('./PDFEditor/PDFEditor'), { ssr: false });
import PDFMerger from './PDFMerge';
import ImageToPDF from './ImageToPDF';
import CompressPDF from "./CompressPDF";
const AddPages = dynamic(() => import('./AddPages'), { ssr: false });
import GetPDFImages from "./GetPDFImages";
const OptionsPage = ({handleButtonClick,activeSection}) => {
  return (
    <div className="min-h-screen relative z-40 mt-20  ">
    <div className="bg-transparent w-full py-12 px-4">
      <div className="max-w-7xl mx-auto text-center">
        <div className="text-4xl font-bold text-white mb-2">PDF Manipulator Suite</div>
        <p className="text-lg text-gray-500 mb-6">Edit, compress, merge, convert, and more—all in one tool!</p>
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div
            className={`relative cursor-pointer overflow-hidden rounded-lg py-12 flex-col flex justify-center items-center text-center font-extrabold  mb-10  transform hover:scale-[101%] transition-transform duration-200 ease-out tracking-wider hover:shadow-[inset_0_0_30px_rgba(0,0,155,1)] shadow-[inset_0_0_15px_rgba(0,0,155,0.7)] `}
            onClick={() => handleButtonClick('merge')}
          >
            <Image
              src="https://img.icons8.com/doodle/48/000000/merge-files.png"
              alt="Merge PDF"
              width={48}
              height={48}
              className="mx-auto mb-4"
            />
            <h3 className="text-2xl font-semibold text-white text-center mb-2">Merge PDF</h3>
            <p className="text-gray-300 text-center">Combine PDFs effortlessly.</p>
          </div>

          <div
            className={`relative cursor-pointer overflow-hidden rounded-lg py-12 flex-col flex justify-center items-center text-center font-extrabold  mb-10  transform hover:scale-[101%] transition-transform duration-200 ease-out tracking-wider hover:shadow-[inset_0_0_30px_rgba(0,0,155,1)] shadow-[inset_0_0_15px_rgba(0,0,155,0.7)] `}
            onClick={() => handleButtonClick('edit')}
          >
            <Image
              src="https://img.icons8.com/doodle/48/000000/edit.png"
              alt="Edit PDF"
              width={48}
              height={48}
              className="mx-auto mb-4"
            />
            <h3 className="text-2xl font-semibold text-white text-center mb-2">Edit PDF</h3>
            <p className="text-gray-300 text-center">Modify PDFs quickly and easily.</p>
          </div>

          <div
            className={`relative cursor-pointer overflow-hidden rounded-lg py-12 flex-col flex justify-center items-center text-center font-extrabold  mb-10  transform hover:scale-[101%] transition-transform duration-200 ease-out tracking-wider hover:shadow-[inset_0_0_30px_rgba(0,0,155,1)] shadow-[inset_0_0_15px_rgba(0,0,155,0.7)] `}
            onClick={() => handleButtonClick('image')}
          >
            <Image
              src="https://img.icons8.com/?size=100&id=67369&format=png&color=000000"
              alt="Image to PDF"
              width={48}
              height={48}
              className="mx-auto mb-4"
            />
            <h3 className="text-2xl font-semibold text-white text-center mb-2">Image to PDF</h3>
            <p className="text-gray-300 text-center">Convert images to PDF effortlessly.</p>
          </div>

          <div
            className={`relative cursor-pointer overflow-hidden rounded-lg py-12 flex-col flex justify-center items-center text-center font-extrabold  mb-10  transform hover:scale-[101%] transition-transform duration-200 ease-out tracking-wider hover:shadow-[inset_0_0_30px_rgba(0,0,155,1)] shadow-[inset_0_0_15px_rgba(0,0,155,0.7)] `}
            onClick={() => handleButtonClick('compress')}
          >
            <Image
              src="https://img.icons8.com/48/ffffff/compress.png"
              alt="Compress PDF"
              width={48}
              height={48}
              className="mx-auto mb-4"
            />
            <h3 className="text-2xl font-semibold text-white text-center mb-2">Compress PDF</h3>
            <p className="text-gray-300 text-center">Shrink PDFs for easy sharing.</p>
          </div>

          <div
            className={`relative cursor-pointer overflow-hidden rounded-lg py-12 flex-col flex justify-center items-center text-center font-extrabold  mb-10  transform hover:scale-[101%] transition-transform duration-200 ease-out tracking-wider hover:shadow-[inset_0_0_30px_rgba(0,0,155,1)] shadow-[inset_0_0_15px_rgba(0,0,155,0.7)] `}
            onClick={() => handleButtonClick('addpages')}
          >
            <Image
              src="/addpages.png"
              alt="Add Pages to PDF"
              width={48}
              height={48}
              className="mx-auto mb-4"
            />
            <h3 className="text-2xl font-semibold text-white text-center mb-2">Add Pages to PDF</h3>
            <p className="text-gray-300 text-center">Insert new pages to your PDF.</p>
          </div>

          <div
            className={`relative cursor-pointer overflow-hidden rounded-lg py-12 flex-col flex justify-center items-center text-center font-extrabold  mb-10  transform hover:scale-[101%] transition-transform duration-200 ease-out tracking-wider hover:shadow-[inset_0_0_30px_rgba(0,0,155,1)] shadow-[inset_0_0_15px_rgba(0,0,155,0.7)] `}
            onClick={() => handleButtonClick('extract')}
          >
            <Image
              src="https://img.icons8.com/?size=100&id=wUqJRyU3Sxwa&format=png&color=000000"
              alt="Extract Images from PDF"
              width={48}
              height={48}
              className="mx-auto mb-4"
            />
            <h3 className="text-2xl font-semibold text-white text-center mb-2">Extract Images</h3>
            <p className="text-gray-300 text-center">Easily extract images from PDFs.</p>
          </div>

        </div>
      </div>
    </div>

    <div 
    // className="text-black  h-fit w-full backdrop-blur-lg shadow-black bg-opacity-35 rounded-lg  bg-[#1a1a1a] shadow-[inset_0_0_30px_rgba(0,0,0,1)]  "
    >
      {activeSection === 'edit' && <PDFEditor />}
      {activeSection === 'merge' && (<PDFMerger />)}
      {activeSection === 'image' && <ImageToPDF />}
      {activeSection === 'compress' && <CompressPDF />}
      {activeSection === 'addpages' && <AddPages />}
      {activeSection === 'extract' && <GetPDFImages />}
    </div>
  </div>

  )
}

export default OptionsPage