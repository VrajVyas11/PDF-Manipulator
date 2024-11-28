import React from 'react'
import Image from 'next/image';
import dynamic from 'next/dynamic';

const PDFEditor = dynamic(() => import('./PDFEditor/PDFEditor'), { ssr: false });
import PDFMerger from './PDFMerge';
import ImageToPDF from './ImageToPDF';
import CompressPDF from "./CompressPDF";
const AddPages = dynamic(() => import('./AddPages'), { ssr: false });
import GetPDFImages from "./GetPDFImages";
const OptionsPage = ({ handleButtonClick, activeSection }) => {
  const cardData = [
    {
      id: 'merge',
      imageSrc: 'https://img.icons8.com/doodle/48/000000/merge-files.png',
      title: 'Merge PDF',
      description: 'Combine PDFs effortlessly.',
    },
    {
      id: 'edit',
      imageSrc: 'https://img.icons8.com/doodle/48/000000/edit.png',
      title: 'Edit PDF',
      description: 'Modify PDFs quickly and easily.',
    },
    {
      id: 'image',
      imageSrc: 'https://img.icons8.com/?size=100&id=67369&format=png&color=000000',
      title: 'Image to PDF',
      description: 'Convert images to PDF effortlessly.',
    },
    {
      id: 'compress',
      imageSrc: 'https://img.icons8.com/48/ffffff/compress.png',
      title: 'Compress PDF',
      description: 'Shrink PDFs for easy sharing.',
    },
    {
      id: 'addpages',
      imageSrc: '/addpages.png',
      title: 'Add Pages to PDF',
      description: 'Insert new pages to your PDF.',
    },
    {
      id: 'extract',
      imageSrc: 'https://img.icons8.com/?size=100&id=wUqJRyU3Sxwa&format=png&color=000000',
      title: 'Extract Images',
      description: 'Easily extract images from PDFs.',
    },
  ];
  return (
    <div className="min-h-screen relative z-40 -mt-80 md:-mt-0  ">
      <div className="bg-transparent w-full py-12 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="text-4xl font-bold text-white mb-2">PDF Manipulator Suite</div>
          <p className="text-lg text-gray-500 mb-6">Edit, compress, merge, convert, and more—all in one tool!</p>
          <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-8">
          {cardData.map((card) => (
              <div
                key={card.id}
                className="relative cursor-pointer overflow-hidden rounded-lg px-2 md:px-0 py-5 md:py-12 flex-col flex justify-center items-center text-center font-extrabold transform hover:scale-[101%] transition-transform duration-200 ease-out tracking-wider hover:shadow-[inset_0_0_30px_rgba(0,0,255,1)] shadow-[inset_0_0_15px_rgba(0,0,255,0.7)]"
                onClick={() => handleButtonClick(card.id)}
              >
                <Image
                  src={card.imageSrc}
                  alt={card.title}
                  width={48}
                  height={48}
                  className="mx-auto mb-4"
                />
                <h3 className="text-lg md:text-2xl  font-semibold text-white text-center mb-2">{card.title}</h3>
                <p className="text-gray-300 text-sm md:text-base font-normal text-center">{card.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-center px-2 items-center">
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