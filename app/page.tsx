"use client";
import React, { useState } from 'react';

import LandingPage from "./components/LandingPage"
import OptionsPage from "./components/OptionsPage"
function Home() {
  const [activeSection, setActiveSection] = useState('home');
  const [getStarted, setGetStarted] = useState(false);
  getStarted
  const handleButtonClick = (section: any) => {
    setActiveSection(section);
  };

  return (
    <div className={`body-wrap m-0  text-base leading-[1.15] box-border  -webkit-font-smoothing:antialiased overflow-hidden flex flex-col min-h-screen bg-[url('/bg3.png')] bg-cover bg-center bg-no-repeat  bg-opacity-80 bg-fixed `}>
      <LandingPage setGetStarted={setGetStarted} />
      {getStarted && (
        <OptionsPage handleButtonClick={handleButtonClick} activeSection={activeSection} />
      )}
    </div>
  );
}

export default Home;
