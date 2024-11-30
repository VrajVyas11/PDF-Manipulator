"use client";
import React, { useState } from 'react';
import OptionsPage from "./components/OptionsPage";
import Landing from "./components/Landing"
import Header from "./components/Header"
function Home() {
  const [activeSection, setActiveSection] = useState('home');
  const [getStarted, setGetStarted] = useState(false);

  const handleButtonClick = (section: string) => {
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
      className={`body-wrap m-0 sm:min-h-screen min-h-screen ${getStarted?"":"h-[740px]"} md:h-auto text-white font-sans text-body bg-[#1A202C] transition-colors duration-200 leading-6 text-base box-border -webkit-font-smoothing:antialiased overflow-hidden flex flex-col bg-fixed`}
    >
     <Header/>
     <Landing setGetStarted={setGetStarted}/>
      {/* <LandingExperimental setGetStarted={setGetStarted} /> */}
      {getStarted && (
        <OptionsPage handleButtonClick={handleButtonClick} activeSection={activeSection} />
      )}
    </div>
  );
}

export default Home;
