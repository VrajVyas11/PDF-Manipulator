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
  const [getStarted, setGetStarted] = useState(false);
  getStarted
  const handleButtonClick = (section:any) => {
    setActiveSection(section);
  };

  return (
    <body className="m-0 text-[#8A94A7] text-base leading-[1.15] box-border -moz-osx-font-smoothing: grayscale -webkit-font-smoothing: antialiased">
      <div className={`body-wrap overflow-hidden flex flex-col min-h-screen bg-[url('/bg3.png')] bg-cover bg-center bg-no-repeat  bg-opacity-80 bg-fixed `}>
        <header className={`site-header px-0 py-6 relative before:content-['']  before:w-full before:top-0 before:left-0 before:bg-opacity-60 before:fixed before:bg-black before:h-screen  `}
        >
          <div className="container mx-auto px-4 py-2 max-w-[1128px] sm:px-6">
            <div className="site-header-inner relative flex justify-between items-center">
              <div className="brand header-brand">
                <h1 className="m-0">
                  <a href="#">
                    <img className="header-logo-image h-16 mt-4 border-none max-w-full align-middle block" src="images/logo.svg" alt="Logo" />
                  </a>
                </h1>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-[1_0_auto] block">
          <section className="hero text-center pb-[88px] sm:text-left sm:pt-16 sm:pb-[88px]">
            <div className="container mx-auto px-4 max-w-[1128px] sm:px-6">
              <div className="hero-inner flex justify-between items-center">
                <div className="hero-copy relative z-10 min-w-[552px] w-[552px] sm:pr-16">
                <h1 className="hero-title text-[38px] font-bold leading-[48px] tracking-[0px] sm:text-[44px] sm:leading-[54px] text-white">
  PDF Manipulator: Complete PDF Solution
</h1>
<div className="hero-paragraph text-lg leading-[1.8] mt-6 mb-6 text-[#8A94A7] tracking-[0.07em]">
  Edit, compress, annotate, add pages, and convert images to PDF with ease. PDF Manipulator streamlines PDF management on any device.
</div>




                  <div className="hero-cta flex justify-start items-center space-x-4 max-w-[280px] mx-auto sm:max-w-none sm:mb-10">
                    <button onClick={()=>{setGetStarted(true)}}
                      className="button button-primary rounded-sm text-sm font-bold uppercase bg-[#0270D7] text-white px-6 py-3 transition-all ease-in-out duration-300 hover:bg-[#0266B3]  active:outline-none"
                    >
                      get Started
                    </button>

                    {/* <button
                      className="button uppercase font-bold rounded-sm text-sm  bg-transparent   px-6 py-3 transition-all ease-in-out duration-300 bg-[#1d2026] hover:bg-[#1d1d1d] text-white  active:outline-none"
                    >
                      Get in touch
                    </button> */}

                  </div>
                </div>
                <div className="hero-figure anime-element relative text-center md:text-left md:before:absolute md:before:top-[-57.8%] md:before:left-[-1.3%] md:before:w-[152.84%] md:before:h-[178.78%] md:before:bg-[url('/images/hero-back-illustration.svg')] md:before:bg-cover md:after:absolute md:after:top-[-35.6%] md:after:w-[57.2%] md:after:h-[87.88%] md:after:left-[99.6%] md:after:bg-[url('/images/hero-top-illustration.svg')] md:after:bg-no-repeat">
  <svg className="placeholder overflow-hidden block w-auto h-auto" width="528" height="396" viewBox="0 0 528 396">
    <rect width="528" height="396" fill="transparent" />
  </svg>

  <style jsx>{`
    @keyframes slideIn {
      0% {
        transform: translateX(100%) rotateZ(20deg);
        opacity: 0;
      }
      100% {
        transform: translateX(0) rotateZ(20deg);
        opacity: 1;
      }
    }

    @keyframes slideInReverse {
      0% {
        transform: translateX(-100%) rotateZ(-20deg);
        opacity: 0;
      }
      100% {
        transform: translateX(0) rotateZ(-20deg);
        opacity: 1;
      }
    }

    @keyframes scaleUp {
      0% {
        transform: scale(0.5);
        opacity: 0;
      }
      100% {
        transform: scale(1) perspective(500px) rotateY(-15deg) rotateX(8deg) rotateZ(-1deg);
        opacity: 1;
      }
    }

    @keyframes rotateUp {
      0% {
        transform: rotateZ(0deg);
        opacity: 0;
      }
      100% {
        transform: rotateZ(-45deg);
        opacity: 1;
      }
    }

    @keyframes hoverFloat {
      0%, 100% {
        transform: translateY(0);
      }
      50% {
        transform: translateY(-5px);
      }
    }

    @keyframes DifAnimation {
      0% {
        transform: scale(1) rotate(0deg) rotateZ(-22deg);
        opacity: 0.9;
      }
      50% {
        transform: scale(1.2) rotate(180deg) rotateZ(-22deg);
        opacity: 1;
      }
      100% {
        transform: scale(1) rotate(360deg) rotateZ(-22deg);
        opacity: 0.9;
      }
    }

    @keyframes DifAnimation1 {
      0% {
        transform: scale(0.7) rotate(0deg) translateX(0) translateY(0);
        z-index: 0;
        opacity: 1;
      }
      25% {
        transform: scale(0.85) rotate(90deg) translateX(-2%) translateY(2%);
        z-index: 5;
        opacity: 1;
      }
      50% {
        transform: scale(1.1) rotate(180deg) translateX(0) translateY(-2%);
        z-index: 10;
        opacity: 1;
      }
      75% {
        transform: scale(0.85) rotate(270deg) translateX(2%) translateY(2%);
        z-index: 5;
        opacity: 1;
      }
      100% {
        transform: scale(0.7) rotate(360deg) translateX(0) translateY(0);
        z-index: 0;
        opacity: 1;
      }
    }

      @keyframes backgroundMove {
      0% {
        transform: scale(1) translateY(0);
        opacity: 0.5;
      }
      50% {
        transform: scale(1.1) translateY(-5%);
        opacity: 1;
      }
      100% {
        transform: scale(1) translateY(0);
        opacity: 0.8;
      }
    }



    .hero-figure-box-01 {
      animation: slideIn 2s ease-in-out forwards;
    }

    .hero-figure-box-02 {
      animation: slideInReverse 2s ease-in-out forwards;
    }

    .hero-figure-box-03 {
      animation: scaleUp 2s ease-in-out forwards;
    }

    .hero-figure-box-04 {
      animation: rotateUp 2s ease-in-out forwards;
    }

    .hero-figure-box-05 {
      animation: scaleUp 2s ease-in-out forwards;
    }

    .hero-figure-box-06 {
      animation: slideIn 2s ease-in-out forwards, DifAnimation1 6s ease-in-out infinite;
    }

    .hero-figure-box-07 {
      animation: rotateUp 2s ease-in-out forwards, hoverFloat 4s ease-in-out infinite;
    }

    .hero-figure-box-08 {
      animation: rotateUp 2s ease-in-out forwards, DifAnimation 5s ease-in-out infinite;
    }

    .hero-figure-box-09 {
      animation: slideInReverse 2s ease-in-out forwards, hoverFloat 6s ease-in-out infinite;
    }

    .hero-figure-box-10 {
      animation: scaleUp 2s ease-in-out forwards, hoverFloat 3s ease-in-out infinite;
    }

    .anime-element:before,
    .anime-element:after {
      animation: backgroundMove 10s ease-in-out infinite;
    }
  `}</style>

  <div
    className="hero-figure-box hero-figure-box-01 absolute will-change-transform overflow-hidden w-[28.03%] h-[37.37%] left-[103.2%] top-[41.9%] bg-[linear-gradient(to_left_top,_#00bffb,_rgba(0,_191,_251,_0))] transform transition-all duration-700 ease-in-out hover:scale-110 hover:rotate-[60deg] hover:translate-x-[-10%] hover:translate-y-[-10%]"
    style={{ transform: 'rotateZ(45deg)' }}
  ></div>

  <div
    className="hero-figure-box hero-figure-box-02 absolute will-change-transform overflow-hidden w-[37.87%] h-[50.50%] left-[61.3%] top-[64.1%] bg-[linear-gradient(to_left_top,_#0270d7,_rgba(2,_112,_215,_0))] transform transition-all duration-700 ease-in-out hover:scale-110 hover:rotate-[30deg] hover:translate-x-[15%]"
    style={{ transform: 'rotateZ(-45deg)' }}
  ></div>

  <div
    className="hero-figure-box hero-figure-box-03 absolute will-change-transform top-[-56.8%] w-[56.81%] h-[75.75%] left-[87.7%] bg-[linear-gradient(to_left_top,_#00bffb,_rgba(0,_191,_251,_0))] overflow-hidden before:content-[''] before:absolute before:inset-0 before:bg-[linear-gradient(to_left,_#15181d_0%,_rgba(21,_24,_29,_0)_60%)] before:transform before:rotate-45 before:scale-[1.5]"
    style={{ transform: 'rotateZ(45deg)' }}
  ></div>

  <div
    className="hero-figure-box hero-figure-box-04 absolute will-change-transform overflow-hidden w-[45.45%] h-[60.60%] left-[54.9%] top-[-8%] bg-[linear-gradient(to_left_top,_#0270d7,_rgba(2,_112,_215,_0))] transform transition-all duration-700 ease-in-out hover:scale-110 hover:rotateZ(-30deg)"
    style={{ transform: 'rotateZ(-135deg)' }}
  ></div>

  <div
    className="hero-figure-box hero-figure-box-05 absolute will-change-transform overflow-hidden w-[64%] h-[73.7%] left-[17.4%] top-[13.3%] bg-[#242830] shadow-[-20px_32px_64px_rgba(0,0,0,0.25)] transform transition-all duration-700 ease-in-out hover:scale-110 hover:rotateY(-10deg) hover:rotateX(5deg)"
    style={{ transform: 'perspective(500px) rotateY(-15deg) rotateX(8deg) rotateZ(-1deg)' }}
  ></div>

  <div
    className="hero-figure-box hero-figure-box-06 absolute will-change-transform overflow-hidden w-[30.3%] h-[40.4%] left-[65.5%] top-[6.3%] bg-[#242830] shadow-[-20px_32px_64px_rgba(0,0,0,0.25)] transform transition-all duration-700 ease-in-out hover:scale-110 hover:rotateZ(25deg)"
    style={{ transform: 'rotateZ(20deg)' }}
  ></div>

  <div
    className="hero-figure-box hero-figure-box-07 absolute will-change-transform overflow-hidden w-[12.12%] h-[16.16%] left-[1.9%] top-[42.4%] bg-[#242830] shadow-[-20px_32px_64px_rgba(0,0,0,0.25)] transform transition-all duration-700 ease-in-out hover:scale-110 hover:rotateZ(40deg)"
    style={{ transform: 'rotateZ(20deg)' }}
  ></div>

  <div
    className="hero-figure-box hero-figure-box-08 absolute will-change-transform overflow-hidden w-[19.51%] h-[26.01%] left-[27.1%] top-[81.6%] bg-[#0270d7] transform transition-all duration-700 ease-in-out hover:scale-110 hover:rotateZ(-45deg)"
    style={{ transform: 'rotateZ(-22deg)' }}
  ></div>

<div className="hero-figure-box hero-figure-box-09 absolute will-change-transform overflow-hidden w-[6.63%] h-[8.63%] left-[42.6%] top-[-17.9%] bg-[#00bffb] transform rotateZ-[-52deg] before:content-[''] before:absolute before:origin-[100%_100%] before:inset-0 before:bg-[linear-gradient(to_left,_rgba(255,_255,_255,_0)_0%,_rgba(255,_255,_255,_0.64)_100%)] before:transform before:rotateZ(45deg) before:scale-[1.5]"
style={{ transform: 'rotateZ(45deg)' }}></div>

<div className="hero-figure-box hero-figure-box-10 absolute will-change-transform  overflow-hidden left-[-3.8%] w-[3.03%] h-[4.04%] top-[4.3%] bg-[rgba(0,_191,_251,_0.32)] transform rotateZ-[-50deg]"
style={{ transform: 'rotateZ(-22deg)' }}></div>
</div>

              </div>
            </div>
       {getStarted &&(
            <div className="min-h-screen relative z-40 mt-20 text-white bg-gradient-to-b ">
            <div className="bg-transparent w-full py-12 px-4">
              <div className="max-w-7xl mx-auto text-center">
                <div className="text-4xl font-bold text-white mb-2">PDF Manipulator Suite</div>
                <p className="text-lg text-gray-500 mb-6">Edit, compress, merge, convert, and more—all in one tool!</p>
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
                <div
                  className={`relative overflow-hidden rounded-lg py-12 flex-col flex justify-center items-center text-center font-extrabold  mb-10  transform hover:scale-[101%] transition-transform duration-200 ease-out tracking-wider hover:shadow-[inset_0_0_30px_rgba(0,0,155,1)] shadow-[inset_0_0_15px_rgba(0,0,155,0.7)] `}
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
                  className={`relative overflow-hidden rounded-lg py-12 flex-col flex justify-center items-center text-center font-extrabold  mb-10  transform hover:scale-[101%] transition-transform duration-200 ease-out tracking-wider hover:shadow-[inset_0_0_30px_rgba(0,0,155,1)] shadow-[inset_0_0_15px_rgba(0,0,155,0.7)] `}
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
                  className={`relative overflow-hidden rounded-lg py-12 flex-col flex justify-center items-center text-center font-extrabold  mb-10  transform hover:scale-[101%] transition-transform duration-200 ease-out tracking-wider hover:shadow-[inset_0_0_30px_rgba(0,0,155,1)] shadow-[inset_0_0_15px_rgba(0,0,155,0.7)] `}
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
                  className={`relative overflow-hidden rounded-lg py-12 flex-col flex justify-center items-center text-center font-extrabold  mb-10  transform hover:scale-[101%] transition-transform duration-200 ease-out tracking-wider hover:shadow-[inset_0_0_30px_rgba(0,0,155,1)] shadow-[inset_0_0_15px_rgba(0,0,155,0.7)] `}
  onClick={() => handleButtonClick('compress')}
>
  <Image
    src="https://img.icons8.com/48/000000/compress.png"
    alt="Compress PDF"
    width={48}
    height={48}
    className="mx-auto mb-4"
  />
  <h3 className="text-2xl font-semibold text-white text-center mb-2">Compress PDF</h3>
  <p className="text-gray-300 text-center">Shrink PDFs for easy sharing.</p>
</div>

<div
                  className={`relative overflow-hidden rounded-lg py-12 flex-col flex justify-center items-center text-center font-extrabold  mb-10  transform hover:scale-[101%] transition-transform duration-200 ease-out tracking-wider hover:shadow-[inset_0_0_30px_rgba(0,0,155,1)] shadow-[inset_0_0_15px_rgba(0,0,155,0.7)] `}
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
                  className={`relative overflow-hidden rounded-lg py-12 flex-col flex justify-center items-center text-center font-extrabold  mb-10  transform hover:scale-[101%] transition-transform duration-200 ease-out tracking-wider hover:shadow-[inset_0_0_30px_rgba(0,0,155,1)] shadow-[inset_0_0_15px_rgba(0,0,155,0.7)] `}
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
          
       )}
          </section>
        </main>
      </div>
    </body>
   
  );
}

export default Home;
