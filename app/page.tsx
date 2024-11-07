"use client";
import React, { useState } from 'react';
import Image from 'next/image';
import dynamic from 'next/dynamic';

const PDFEditor = dynamic(() => import('./components/PDFEditor/PDFEditor'), { ssr: false });
import PDFMerger from './components/PDFMerge';
import ImageToPDF from './components/ImageToPDF';
import CompressPDF from "./components/CompressPDF";
import AddPages from "./components/AddPages";
import GetPDFImages from "./components/GetPDFImages";

function Home() {
  const [activeSection, setActiveSection] = useState('home');

  const handleButtonClick = (section:any) => {
    setActiveSection(section);
  };

  return (
    <div className="min-h-screen text-black">
      <div className="bg-transparent w-full py-12 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">PDF Utility Suite</h1>
          <p className="text-lg text-gray-600 mb-6">Merge, edit, convert, compress PDFs and more—all in one place!</p>
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
            <div
              className={`p-6 bg-white rounded-lg shadow-lg transition-transform duration-300 transform hover:scale-105 hover:shadow-xl cursor-pointer ${activeSection === 'merge' ? 'ring-4 ring-green-400' : ''}`}
              onClick={() => handleButtonClick('merge')}
            >
              <Image
                src="https://img.icons8.com/doodle/48/000000/merge-files.png"
                alt="Merge PDF"
                width={48}
                height={48}
                className="mx-auto mb-4"
              />
              <h3 className="text-2xl font-semibold text-gray-800 text-center mb-2">Merge PDF</h3>
              <p className="text-gray-600 text-center">Combine multiple PDFs into a single document easily.</p>
            </div>

            <div
              className={`p-6 bg-white rounded-lg shadow-lg transition-transform duration-300 transform hover:scale-105 hover:shadow-xl cursor-pointer ${activeSection === 'edit' ? 'ring-4 ring-yellow-400' : ''}`}
              onClick={() => handleButtonClick('edit')}
            >
              <Image
                src="https://img.icons8.com/doodle/48/000000/edit.png"
                alt="Edit PDF"
                width={48}
                height={48}
                className="mx-auto mb-4"
              />
              <h3 className="text-2xl font-semibold text-gray-800 text-center mb-2">Edit PDF</h3>
              <p className="text-gray-600 text-center">Modify PDF content quickly and easily.</p>
            </div>

            <div
              className={`p-6 bg-white rounded-lg shadow-lg transition-transform duration-300 transform hover:scale-105 hover:shadow-xl cursor-pointer ${activeSection === 'image' ? 'ring-4 ring-red-400' : ''}`}
              onClick={() => handleButtonClick('image')}
            >
              <Image
                src="https://img.icons8.com/?size=100&id=67369&format=png&color=000000"
                alt="Image to PDF"
                width={48}
                height={48}
                className="mx-auto mb-4"
              />
              <h3 className="text-2xl font-semibold text-gray-800 text-center mb-2">Image to PDF</h3>
              <p className="text-gray-600 text-center">Convert images to PDF format with a single click.</p>
            </div>

            <div
              className={`p-6 bg-white rounded-lg shadow-lg transition-transform duration-300 transform hover:scale-105 hover:shadow-xl cursor-pointer ${activeSection === 'compress' ? 'ring-4 ring-blue-400' : ''}`}
              onClick={() => handleButtonClick('compress')}
            >
              <Image
                src="https://img.icons8.com/48/000000/compress.png"
                alt="Compress PDF"
                width={48}
                height={48}
                className="mx-auto mb-4"
              />
              <h3 className="text-2xl font-semibold text-gray-800 text-center mb-2">Compress PDF</h3>
              <p className="text-gray-600 text-center">Reduce PDF file size for easy sharing.</p>
            </div>

            <div
              className={`p-6 bg-white rounded-lg shadow-lg transition-transform duration-300 transform hover:scale-105 hover:shadow-xl cursor-pointer ${activeSection === 'addpages' ? 'ring-4 ring-purple-400' : ''}`}
              onClick={() => handleButtonClick('addpages')}
            >
              <Image
                src="/addpages.png"
                alt="Add Pages to PDF"
                width={48}
                height={48}
                className="mx-auto mb-4"
              />
              <h3 className="text-2xl font-semibold text-gray-800 text-center mb-2">Add Pages to PDF</h3>
              <p className="text-gray-600 text-center">Insert new pages to an existing PDF.</p>
            </div>

            <div
              className={`p-6 bg-white rounded-lg shadow-lg transition-transform duration-300 transform hover:scale-105 hover:shadow-xl cursor-pointer ${activeSection === 'extract' ? 'ring-4 ring-teal-400' : ''}`}
              onClick={() => handleButtonClick('extract')}
            >
              <Image
                src="https://img.icons8.com/?size=100&id=wUqJRyU3Sxwa&format=png&color=000000"
                alt="Extract Images from PDF"
                width={48}
                height={48}
                className="mx-auto mb-4"
              />
              <h3 className="text-2xl font-semibold text-gray-800 text-center mb-2">Extract Images</h3>
              <p className="text-gray-600 text-center">Retrieve images embedded in PDFs.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto py-8 px-4">
        {activeSection === 'edit' && <PDFEditor />}
        {activeSection === 'merge' && (
          <div className="text-center">
            <h2 className="text-3xl bg-gray-800 p-4 text-white rounded-t-lg font-bold">Merge PDF</h2>
            <PDFMerger />
          </div>
        )}
        {activeSection === 'image' && <ImageToPDF />}
        {activeSection === 'compress' && <CompressPDF />}
        {activeSection === 'addpages' && <AddPages />}
        {activeSection === 'extract' && <GetPDFImages />}
      </div>
    </div>
  );
}

export default Home;
