"use client"
import React, { useState } from "react";
import Image from "next/image";

const HeaderComponent = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="w-full relative z-50 bg-transparent shadow-sm">
      <div className="pb-2 pt-2 top-0 nav_gradient z-10 text-white xl:px-24 md:px-10 px-5">
        <nav>
          <div className="relative flex h-16">
            {/* Hamburger Menu Button */}
            <div className="absolute inset-y-0 right-0 flex items-center lg:hidden">
              <button
                className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                id="menu-button"
                type="button"
                aria-expanded={menuOpen}
                onClick={() => setMenuOpen(!menuOpen)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  aria-hidden="true"
                  className="block h-6 w-6 text-white"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                  />
                </svg>
              </button>
            </div>

            {/* Logo and Title */}
            <div className="w-full flex justify-between items-center">
              <a rel="noreferrer" href="/">
                <div className="flex items-center h-fit mt-2 -ml-4 md:ml-0">
                  <Image
                    width={2}
                    height={2}
                    src="/favicon.svg"
                    className="mx-4 sm:ml-9 w-[2.75rem] h-[2.5rem]"
                    draggable="false"
                    alt=""
                  />
                  <h1 className="text-[1rem] md:text-[1.4rem] lg:text-[2rem] font-pacifico py-1 text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-cyan-400 drop-shadow-lg">
                    PDF Manipulator
                  </h1>
                </div>
              </a>

              {/* Desktop Menu */}
              <div className="hidden text-xl lg:flex items-center">
                <div className="flex space-x-1">
                  <a
                    target="_blank"
                    href="https://github.com/VrajVyas11/Next_JS_PDF_Manipulator/blob/main/README.md"
                  >
                    <p className="text-white text-[1rem] hover:text-[#7eb4e7] transition-all cursor-pointer">
                      Docs
                    </p>
                  </a>
                </div>
                <div className="flex flex-row justify-center items-center space-x-2 pl-10 -mt-6 md:-mt-0">
                  <a
                    href="https://github.com/VrajVyas11/Next_JS_PDF_Manipulator"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <img
                      className="w-[2.5rem] h-auto"
                      src="/images/github-logo.png"
                      draggable="false"
                    />
                  </a>
                  <a
                    href="https://www.linkedin.com/in/vraj-vyas-983249297/"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <img
                      className="w-[2.5rem] h-auto"
                      src="https://img.icons8.com/?size=100&id=xuvGCOXi8Wyg&format=png&color=000000"
                      alt="LinkedIn Icon"
                      draggable="false"
                    />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Menu */}
          {menuOpen && (
            <div className="lg:hidden mt-4 text-white text-center bg-gray-800 rounded-lg p-4">
              <a
                href="https://github.com/VrajVyas11/Next_JS_PDF_Manipulator/blob/main/README.md"
                className="block py-2 hover:text-[#7eb4e7]"
              >
                Docs
              </a>
              <a
                href="https://github.com/VrajVyas11/Next_JS_PDF_Manipulator"
                target="_blank"
                rel="noreferrer"
                className="block py-2 hover:text-[#7eb4e7]"
              >
                GitHub
              </a>
              <a
                href="https://www.linkedin.com/in/vraj-vyas-983249297/"
                target="_blank"
                rel="noreferrer"
                className="block py-2 hover:text-[#7eb4e7]"
              >
                LinkedIn
              </a>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};

export default HeaderComponent;
