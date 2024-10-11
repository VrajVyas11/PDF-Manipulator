"use client"
import React, { useState } from 'react';
import PDFEditor from './components/PDFEditor';
import PDFMerger from './components/PDFMerge';
import ImageToPDF from './components/ImageToPDF';

function Home() {
  const [activeSection, setActiveSection] = useState('home');

  const handleButtonClick = (section:any) => {
    setActiveSection(section);
  };

  return (
    <>

    <div className="min-h-screen text-black ">
      {/* Hero Section */}
      <div className={`bg-transparent  w-full  py-12 px-4`}>
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl font-bold  mb-2">PDF Utility Suite</h1>
          <p className="text-lg  mb-6">Merge, edit, or convert images to PDFs quickly and easily!</p>
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div
            className={`p-6 bg-white rounded-lg shadow-lg transition-transform duration-300 transform hover:scale-105 hover:shadow-xl cursor-pointer ${activeSection === 'merge' ? 'ring-4 ring-green-400' : ''
              }`}
            onClick={() => handleButtonClick('merge')}
          >
            <img
              src="https://img.icons8.com/doodle/48/000000/merge-files.png"
              alt="Merge PDF"
              className="w-12 h-12 mx-auto mb-4"
            />
            <h3 className="text-2xl font-semibold text-center mb-2">Merge PDF</h3>
            <p className="text-gray-600 text-center">
              Combine multiple PDFs into one document easily.
            </p>
          </div>

          <div
            className={`p-6 bg-white rounded-lg shadow-lg transition-transform duration-300 transform hover:scale-105 hover:shadow-xl cursor-pointer ${activeSection === 'edit' ? 'ring-4 ring-yellow-400' : ''
              }`}
            onClick={() => handleButtonClick('edit')}
          >
            <img
              src="https://img.icons8.com/doodle/48/000000/edit.png"
              alt="Edit PDF"
              className="w-12 h-12 mx-auto mb-4"
            />
            <h3 className="text-2xl font-semibold text-center mb-2">Edit PDF</h3>
            <p className="text-gray-600 text-center">
              Modify the content of your PDFs with ease.
            </p>
          </div>

          <div
            className={`p-6 bg-white rounded-lg shadow-lg transition-transform duration-300 transform hover:scale-105 hover:shadow-xl cursor-pointer ${activeSection === 'image' ? 'ring-4 ring-red-400' : ''
              }`}
            onClick={() => handleButtonClick('image')}
          >
            <img
              src="https://img.icons8.com/48/000000/image.png"
              alt="Image to PDF"
              className="w-12 h-12 mx-auto mb-4"
            />
            <h3 className="text-2xl font-semibold text-center mb-2">Image to PDF</h3>
            <p className="text-gray-600 text-center">
              Convert your images to PDF format with one click.
            </p>
          </div>
        </div>
        </div>
      </div>

      {/* Features Section */}

      {/* Conditional Rendering */}
      <div className=" mx-auto py-7 px-4">
        {activeSection === 'edit' && <PDFEditor />}
        {activeSection === 'merge' && (
          <div className=" text-center">
            <h2 className="text-3xl bg-gray-800 p-4 text-white rounded-lg rounded-b-none font-bold">Merge PDF</h2>
            <PDFMerger />
          </div>
        )}
        {activeSection === 'image' && (
          <div className="text-center">
             <h2 className="text-3xl font-bold text-gray-700 mb-8">Image to PDF Converter</h2>
            <ImageToPDF/>
          </div>
        )}
      </div>
    </div>
    </>
  );
}

export default Home;
