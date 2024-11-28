"use client";
import React from 'react';

function LandingExperimental({ setGetStarted }) {
    return (
        <main className="">
            <section className="hero sm:text-left md:pb-8 mt-2 sm:pt-16">
                <div className="hero-inner text-center flex pl-5 flex-col md:flex-row justify-between items-center">
                    <div className="hero-copy relative z-10 min-w-[552px] w-full px-32 sm-374:px-28 sm:pr-16 text-center sm:text-left">
                        {/* Background Blur Effect 1 */}
                        <div
                            className="absolute z-0 top-0 left-0 md:left-24 w-[40%] sm:w-[30%] h-[20%] sm:h-[30%] lg:w-[234px] lg:h-[234px]"
                            style={{
                                background: "rgba(0, 123, 255, .54)",
                                filter: "blur(150px)",
                            }}
                        ></div>
                        {/* Background Blur Effect 2 */}
                        <div
                            className="absolute z-0 top-0 right-0 md:right-24 md:top-64 w-[40%] sm:w-[30%] h-[20%] sm:h-[30%] lg:w-[234px] lg:h-[234px]"
                            style={{
                                background: "rgba(0, 123, 255, .54)",
                                filter: "blur(150px)",
                            }}
                        ></div>

                        <div className="hero-title text-[10vw] sm:text-[8vw] md:text-[60px] lg:pr-14  font-bold leading-[1.2] text-white mb-6">
                            PDF Manipulator:
                            <br />
                            <h6 className="hero-title text-[10vw] sm:text-[8vw] md:text-[50px] lg:pr-14  font-bold leading-[1.2] text-white mb-6">The Complete PDF Solution</h6>
                        </div>

                        <div className="hero-paragraph w-full text-wrap text-[1rem] sm:text-[1.2rem] leading-[1.5] mt-6 mb-6 text-[#8A94A7] tracking-[0.07em]">
                            A versatile PDF tool for editing, merging, compressing, and converting. Features include adding pages, extracting images, and viewing with drag-and-drop. Fully responsive, it simplifies document management for users across all devices.
                        </div>

                        <div className="flex flex-col pt-7 md:flex-row md:justify-start items-center space-y-5 md:space-y-0 md:space-x-7">
                            <button
                                onClick={() => setGetStarted(true)}
                                className="text-black hover:text-white bg-[#007BFF] border-2 border-[#007BFF] hover:bg-blue-800 hover:border-blue-800 active:scale-95 transition-all px-6 py-4 rounded-lg font-semibold"
                            >
                                Getting Started
                            </button>
                            <a
                                href="https://github.com/VrajVyas11/Next_JS_PDF_Manipulator"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <button className="text-white border-2 border-[#007BFF] hover:border-blue-800 hover:bg-blue-800 active:scale-95 transition-all px-4 py-4 rounded-lg font-semibold">
                                    Explore the Project on GitHub
                                </button>
                            </a>
                        </div>
                    </div>
                    <div className="hero-figure sm:hidden md:block mr-36  flex justify-center items-center anime-element relative text-center md:text-left md:before:absolute md:before:top-[-57.8%] md:before:left-[-1.3%] md:before:w-[152.84%] md:before:h-[178.78%] md:before:bg-[url('/images/hero-back-illustration.svg')] md:before:bg-cover md:after:absolute md:after:top-[-35.6%] md:after:w-[57.2%] md:after:h-[87.88%] md:after:left-[99.6%] md:after:bg-[url('/images/hero-top-illustration.svg')] md:after:bg-no-repeat">
                        <svg className="placeholder overflow-hidden block w-auto h-auto" width="528" height="396" viewBox="0 0 528 396">
                            <rect width="528" height="396" fill="transparent" />
                        </svg>

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
            </section>
        </main>
    );
}

export default LandingExperimental;
