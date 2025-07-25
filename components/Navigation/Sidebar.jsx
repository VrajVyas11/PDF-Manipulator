"use client";
import Link from "next/link";
import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { navLinks } from "../../app/Constants/index.ts";

const Sidebar = () => {
  const router = useRouter();

  const handleLinkClick = (url) => {
    router.push(url);
  };

  return (
    <aside className="hidden overflow-auto min-h-screen w-72  border-2 bg-opacity-40 border-s2 bg-black py-5 shadow-md shadow-purple-200/50 lg:flex    p-5 ">
      <div className="flex size-full flex-col gap-5">
        <h1 className="text-[1rem] font-bold mt-5 flex  flex-row justify-start items-center gap-3 md:text-[1.4rem] lg:text-[1.4rem] font-pacifico pb-1 text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-cyan-400 drop-shadow-lg">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/images/UI_Nav/logo.svg"
              alt="logo"
              width={30}
              height={30}
            />
          </Link>
          PDF Manipulator
        </h1>
        <nav className="h-full flex-col justify-around md:flex ">
          <ul className="hidden w-full flex-col items-start gap-1 md:flex">
            {navLinks.slice(0, 9).map((link) => (
              <li
                key={link.id}
                className="flex-center w-full whitespace-nowrap rounded-full bg-cover hover:bg-opacity-70 hover:shadow-[inset_0_0_30px_rgba(0,0,0,0.7)] transition-all duration-150 ease-in-out flex items-center justify-center text-[16px] font-semibold leading-[140%]"
              >
                <button
                  onClick={() => handleLinkClick(link.URL)}
                  className="relative w-full text-gray-300 rounded-full group"
                >
                  <span className="relative flex justify-around items-center w-full  min-h-fit px-4 rounded-full before:absolute before:inset-0 before:opacity-0 before:transition-opacity before:duration-500 before:content-[''] group-hover:before:opacity-100 overflow-hidden">
                    {link.icon && (
                      <Image
                        src={link.icon}
                        alt="logo"
                        width={28}
                        height={28}
                        className="brightness-200"
                      />
                    )}

                    <span className="font-semibold text-16 flex size-full gap-4 p-4 text-white">
                      {link.label}
                    </span>
                  </span>

                  <span className="g8 before:absolute before:left-2/5 before:top-0 before:z-4 before:h-0.5 before:w-3/5 before:opacity-0 before:transition-all before:duration-500 before:content-[''] group-hover:before:left-4 group-hover:before:opacity-40 after:g8 after:absolute after:bottom-0 after:left-4 after:z-4 after:h-0.5 after:w-7/20 after:opacity-0 after:transition-all after:duration-500 after:content-[''] group-hover:after:left-3/5 group-hover:after:opacity-40" />
                </button>
              </li>
            ))}
          </ul>
          <ul className="flex flex-row gap-2 justify-center items-center">
            {navLinks.slice(9).map((link) => (
              <li
                key={link.id}
                className="w-full whitespace-nowrap rounded-full hover:bg-opacity-70 transition-all duration-150 ease-in-out flex items-center justify-start text-[16px] font-semibold leading-[140%]"
              >
                <button
                  onClick={() => window.open(link.URL, "_blank")}
                  className="relative w-full gap-2 shadow-400 rounded-full flex flex-row justify-start items-center group"
                >
                  <span className="relative flex justify-around p-2 items-center w-auto before:g7 g4 min-h-fit rounded-full before:absolute before:inset-0 before:opacity-0 before:transition-opacity before:duration-500 before:content-[''] group-hover:before:opacity-100 overflow-hidden">
                    <span className="absolute -left-[1px]">
                      <svg
                        width="8"
                        height="22"
                        viewBox="0 0 9 22"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <rect x="0" y="0" width="1" height="22" fill="#2EF2FF" />
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M3.5 0H1.5V4V18V22H3.5V16.25L8.63991 11.7526C9.09524 11.3542 9.09524 10.6458 8.63991 10.2474L3.5 5.75V0Z"
                          fill="#2EF2FF"
                        />
                      </svg>
                    </span>
                    <span className="absolute -right-[1px]">
                      <svg
                        width="8"
                        height="22"
                        viewBox="0 0 8 22"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M5.5 0H7.5V4V18V22H5.5V16.25L0.36009 11.7526C-0.0952434 11.3542 -0.0952434 10.6458 0.36009 10.2474L5.5 5.75V0Z"
                          fill="#2EF2FF"
                        />
                      </svg>
                    </span>
                    {link.icon && (
                      <div className="flex justify-center items-center h-9 w-9 p-1">
                        <Image
                          src={link.icon}
                          width={25}
                          height={25}
                          alt="circle"
                          className={`object-contain ${
                            link.name === "LinkedIn" ? "size-5" : "size-44"
                          } z-10`}
                        />
                      </div>
                    )}
                  </span>
                  <span className="z-2 font-semibold tracking-wide normal-case rounded-full font-poppins text-sm mr-2 text-white">
                    {link.name}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;