"use client";
import React from 'react';
import Image from 'next/image';

function LandingPage({ setGetStarted }) {

  return (
    <>
      <header className={`site-header px-0 py-6 pb-0 sm:py-6 relative before:content-['']  before:w-full before:top-0 before:left-0 before:bg-opacity-60 before:fixed before:bg-black before:h-screen  `}
      >
        <div className="container mx-auto px-4 mt-3 sm-374:mt-6 sm:mt-12 py-2 mb-16 sm-374:mb-24 sm:mb-0 max-w-[1128px] sm:px-6">
          <div className="site-header-inner  relative  flex  justify-center sm:pl-28 sm:justify-between items-center">
            <div className="brand header-brand">
              <h1 className="m-0">
                <a
                  href="#"
                  className="relative mt-4  w-fit rounded-full justify-center items-center shadow-lg p-8 hover:shadow-2xl transition-shadow duration-300"
                >
                  <Image
                    width={69}
                    height={16}
                    className="absolute top-0 left-0 h-32 object-contain border-none max-w-full align-middle block"
                    src="images/logo.svg"
                    alt="Logo SVG"
                  />

                  <Image
                    width={69}
                    height={16}
                    className="absolute top-0 left-0 h-32 w-96 object-contain border-none max-w-full align-middle block"
                    src="/logo.png"
                    alt="Logo PNG"
                  />
                </a>

              </h1>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-[1_0_auto] block">
        <section className="hero text-center sm:text-left pb-0 sm:pt-16 lg:mb-40">
          <div className="container mx-auto px-4 max-w-[1128px] sm:px-6">
            <div className="hero-inner flex flex-col md:flex-row justify-between items-center">
              <div className="hero-copy relative z-10 min-w-[552px] w-full px-32 sm-374:px-28 sm:pr-16 text-center sm:text-left">
                <h1 className="hero-title text-[38px] font-bold leading-[48px] tracking-[0px] sm:text-[44px] sm:leading-[54px] text-white mb-4 sm:mb-6">
                  PDF Manipulator: Complete PDF Solution
                </h1>
                <div className="hero-paragraph text-lg leading-[1.8] mt-6 mb-6 text-[#8A94A7] tracking-[0.07em]">
                  Edit, compress, annotate, add pages, and convert images to PDF with ease. PDF Manipulator streamlines PDF management on any device.
                </div>

                <div className="hero-cta flex justify-center sm:justify-start items-center space-x-4 max-w-[280px] mx-auto sm:max-w-none sm:mb-10">
                  <button onClick={() => { setGetStarted(true) }}
                    className="button button-primary rounded-sm text-sm font-bold uppercase bg-[#0270D7] text-white px-6 py-3 transition-all ease-in-out duration-300 hover:bg-[#0266B3] active:outline-none"
                  >
                    Get Started
                  </button>
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
                {/* Remove polygon boxes for screens larger than md */}
                <div className="hidden md:block">
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

                  <div className="hero-figure-box hero-figure-box-10 absolute will-change-transform overflow-hidden left-[-3.8%] w-[3.03%] h-[4.04%] top-[4.3%] bg-[rgba(0,_191,_251,_0.32)] transform rotateZ-[-50deg]"
                    style={{ transform: 'rotateZ(-22deg)' }}></div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

    </>
  );
}

export default LandingPage;
