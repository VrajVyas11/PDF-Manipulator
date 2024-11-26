"use client";
import React, { useState } from 'react';
// import LandingPage from "./components/LandingPage";
import OptionsPage from "./components/OptionsPage";
import Landing from "./components/Landing"
import Image from 'next/image';
function Home() {
  const [activeSection, setActiveSection] = useState('home');
  const [getStarted, setGetStarted] = useState(false);

  const handleButtonClick = (section: string) => { // Updated to `string`
    setActiveSection(section);
  };

  return (
    <div
      style={{
        lineHeight: '1.5',
        WebkitTextSizeAdjust: '100%',
        fontFamily: 'system-ui, sans-serif',
        WebkitFontSmoothing: 'antialiased',
        textRendering: 'optimizeLegibility',
        MozOsxFontSmoothing: 'grayscale',
        touchAction: 'manipulation',
        backgroundColor: '#111',
        backgroundImage: 'radial-gradient(#2d2d2d 1px, transparent 0), radial-gradient(#373636 1px, transparent 0)',
        backgroundPosition: '0 0, 25px 25px',
        backgroundSize: '50px 50px',
      }}
      className="body-wrap m-0 min-h-screen  text-white font-sans text-body bg-[#1A202C] transition-colors duration-200 leading-6 text-base  box-border -webkit-font-smoothing:antialiased overflow-hidden flex flex-col bg-fixed">
      {/* <LandingPage setGetStarted={setGetStarted} /> */}
      <header className="w-full bg-transparent shadow-sm">
        <div className="pb-2 pt-2 top-0 nav_gradient z-10 text-white xl:px-24 md:px-10 px-5">
          <nav data-headlessui-state=""><div className="relative flex h-16">
            <div className="absolute inset-y-0 right-0 flex items-center lg:hidden">
              <button className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white" id="headlessui-disclosure-button-:r0:" type="button" aria-expanded="false" data-headlessui-state="">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true" className="block h-6 w-6 text-white">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5">
                  </path>
                </svg>
              </button>
            </div>
            <div className="w-[100%] flex justify-between items-center">
              <a rel="noreferrer" href="/">
                <div className="flex items-center h-fit mt-2 -ml-4 md:ml-0">
                  <Image width={2} height={2} src="/favicon.svg" className="mx-4 sm:ml-9 sm:h-5 w-15 md:h-10 w-10 " draggable="false" alt={''} />
                  <h1 className="md:text-2xl tracking-normal font-bold font-sans sm:text-3xl xs:text-2xl text-xl text-white  whitespace-nowrap">
                    PDF Manipulator
                  </h1>
                </div>
              </a>
              <div className="hidden text-xl lg:flex items-center">
                <div className="flex space-x-1">
                  <a target='_blank' href="https://github.com/VrajVyas11/Next_JS_PDF_Manipulator/blob/main/README.md">
                    <p className=" text-white text-lg hover:text-[#7eb4e7] transition-all cursor-pointer ">
                      Docs
                    </p>
                  </a>
                </div>
                <div className="flex flex-row justify-center items-center space-x-2 pl-10 -mt-6 md:-mt-0">
                  <a href="https://github.com/VrajVyas11/Next_JS_PDF_Manipulator" target="_blank" rel="noreferrer">
                    <img className=' w-10 h-auto' src="/images/github-logo.png" draggable="false" />
                  </a>
                  <a
                    href="https://www.linkedin.com/in/vraj-vyas-983249297/"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <img
                      className="w-10 h-auto"
                      src="https://img.icons8.com/?size=100&id=xuvGCOXi8Wyg&format=png&color=000000"
                      alt="LinkedIn Icon"
                      draggable="false"
                    />
                  </a>

                </div>
              </div>
            </div>
          </div>
          </nav>
        </div>
      </header>
      <Landing setGetStarted={setGetStarted} />
      {getStarted && (
        <OptionsPage handleButtonClick={handleButtonClick} activeSection={activeSection} />
      )}
    </div>
  );
}

export default Home;
