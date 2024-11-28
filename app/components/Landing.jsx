import React from 'react'
const Landing = ({ setGetStarted }) => {
  return (
    <div className='-mt-4'>
      <div className="relative px-2">
        <div
          style={{
            background: 'rgba(0, 123, 255, .54)',
            filter: 'blur(150px)',
            width: '234px',
            height: '234px',
          }}
          className="absolute z-0 md:left-80 top-0 left-0"
        ></div>

        <div
          style={{
            background: 'rgba(0, 123, 255, .54)',
            filter: 'blur(150px)',
            width: '234px',
            height: '234px',
          }}
          className="absolute z-0 top-0 md:right-80 md:top-72 right-0"
        ></div>

        {/* <div
          style={{
            background: 'rgba(0, 123, 255, .54)',
            filter: 'blur(150px)',
            width: '234px',
            height: '234px',
          }}
          className="absolute z-0 md:right-96 top-16 right-0"
        ></div>

        <div
          style={{
            background: 'rgba(0, 123, 255, .54)',
            filter: 'blur(150px)',
            width: '234px',
            height: '234px',
          }}
          className="absolute z-0 top-0 md:left-96 md:top-72 left-0"
        ></div> */}

        <h1 className="text-center flex-col text-white md:text-7xl text-4xl font-bold md:pt-32 pt-16 lg:w-full mx-auto -mt-6 md:-mt-0">
          The Complete PDF Solution
          <br />

          <div className="text-center text-white md:text-5xl text-3xl font-bold lg:mt-5 lg:w-full relative">

            PDF Manipulator

          </div>


        </h1>

        <h2 className=" text-center pt-9 text-white md:w-[700px] mx-auto ">
          A versatile PDF tool for editing, merging, compressing, and converting. Features include adding pages, extracting images, and viewing with drag-and-drop. Fully responsive, it simplifies document management for users across all devices.
        </h2>
      </div>

      <div className="flex flex-col md:flex-row pt-10 md:justify-center items-center md:space-x-7 space-y-7 md:space-y-0 pb-28">
        <button onClick={() => { setGetStarted(true) }}
          className="text-black hover:text-white relative z-10 w-fit bg-[#007BFF] border-2 border-[#007BFF] hover:bg-blue-800 transition-all hover:border-blue-800 active:scale-95 p-2 rounded-lg px-6 font-semibold">
          Getting Started
        </button>
        <a href="https://github.com/VrajVyas11/Next_JS_PDF_Manipulator">
          <button className="text-white border-2 relative z-10 border-[#007BFF] hover:border-blue-800 hover:bg-blue-800 active:scale-95 transition-all p-2 rounded-lg px-4 font-semibold">
            Explore the Project on GitHub
          </button>
        </a>
      </div>
    </div>
  )
}

export default Landing