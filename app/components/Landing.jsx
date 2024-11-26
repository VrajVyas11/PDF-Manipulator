import React from 'react'
import Image from "next/image"
const Landing = ({ setGetStarted }) => {
  return (
    <div>
    <header className="w-full bg-transparent shadow-sm">
      <div className="pb-2 pt-2 top-0 nav_gradient z-10 text-white xl:px-24 md:px-10 px-5">
        <nav data-headlessui-state=""><div className="relative flex h-16">
          <div className="absolute inset-y-0 right-0 flex items-center lg:hidden">
            <button className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white" id="headlessui-disclosure-button-:r0:" type="button" aria-expanded="false" data-headlessui-state="">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true" className="block h-6 w-6 text-white">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5">
                </path>
              </svg>
            </button>
          </div>
          <div className="w-[100%] flex justify-between items-center">
            <a rel="noreferrer" href="/">
              <div className="flex items-center h-fit mt-2 -ml-4 md:ml-0">
                <Image width={2} height={2} src="/favicon.svg" className="mx-4 sm:ml-9 sm:h-5 w-15 md:h-10 w-10 " draggable="false" />
                <h1 className="md:text-3xl sm:text-3xl xs:text-2xl text-xl text-white  whitespace-nowrap">
                  PDF Manipulator
                </h1>
              </div>
            </a>
            <div className="hidden text-xl lg:flex items-center">
              <div className="flex space-x-8">
                <a href="#">
                  <p className=" text-white hover:text-[#7EE787] transition-all cursor-pointer ">
                    Docs
                  </p>
                </a>
              </div>
              <div className="flex flex-row justify-center items-center space-x-5 pl-10 -mt-6 md:-mt-0">
                <a href="https://github.com/VrajVyas11/Next_JS_PDF_Manipulator" target="_blank" rel="noreferrer">
                  <img className=' w-10 h-auto' src="/images/github-logo.png" draggable="false" />
                </a>
              </div>
            </div>
          </div>
        </div>
        </nav>
      </div>
    </header>

    <div className="relative px-2">
      <div
        style={{
          background: 'rgba(0, 123, 255, .54)',
          filter: 'blur(138.5px)',
          width: '234px',
          height: '234px',
        }}
        className="absolute z-0 md:left-80 left-0"
      ></div>

      <div
        style={{
          background: 'rgba(0, 123, 255, .54)',
          filter: 'blur(138.5px)',
          width: '234px',
          height: '234px',
        }}
        className="green-gradient absolute z-0 md:right-80 md:top-72 right-0"
      ></div>

      <h1 className="text-center flex-col text-white md:text-7xl text-4xl font-bold md:pt-32 pt-16 lg:w-full mx-auto -mt-6 md:-mt-0">
        NextJS PDF Manipulator
        <br />
        <div className="text-center text-white md:text-4xl text-3xl font-bold mt-5  lg:w-full">Complete PDF Solution</div>

      </h1>

      <h2 className=" text-center pt-9 text-white md:w-[700px] mx-auto ">
        A versatile PDF tool for editing, merging, compressing, and converting PDFs. It offers features like adding pages, extracting images, and viewing PDFs with a user-friendly drag-and-drop interface. Fully responsive across devices, it streamlines document management for all users.
      </h2>
    </div>

    <div className="flex flex-col md:flex-row pt-10 md:justify-center items-center md:space-x-7 space-y-7 md:space-y-0 pb-28">
      <button onClick={() => { setGetStarted(true) }}
      className="text-black hover:text-white relative z-10 w-fit bg-[#007BFF] border-2 border-[#007BFF] hover:bg-blue-800 transition-all hover:border-blue-800 active:scale-95 p-2 rounded-lg px-6 font-semibold">
        Getting Started
      </button>
      <a href="https://github.com/VrajVyas11/Next_JS_PDF_Manipulator">
        <button className="text-white border-2 relative z-10 border-[#007BFF] hover:border-blue-800 hover:bg-blue-800 active:scale-95 transition-all p-2 rounded-lg px-4 font-semibold">
          View on Github
        </button>
      </a>
    </div>
  </div>
  )
}

export default Landing