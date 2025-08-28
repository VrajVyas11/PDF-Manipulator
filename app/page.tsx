"use client"
import React, { MouseEventHandler, useState } from 'react'
import { navLinks } from "./Constants/index"
import Image from "next/image"
import Options from "../components/Navigation/Options"
import clsx from "clsx";
const Home = () => {
  const [getStarted, setGetStarted] = useState(false);
  return (

    <section className="am:flex-center items-start justify-start flex h-full flex-col gap-4 w-full bg-banner bg-cover bg-no-repeat shadow-inner">
      <section className="relative w-full max-sm:pt-6 max-sm:pb-0 pt-20 max-lg:pt-32  max-md:pt-16 ">
        <div className="mx-auto w-full max-xl:pl-10 max-lg:pl-6 max-sm:pl-0">
          <div className="relative w-full  text-center md:text-left z-2 max-w-none">
            <div className="text-[18px] w-full md:ml-3 font-bold leading-[16px] tracking-[0.3em] mb-5 uppercase text-p3">
              PDF Manipulator
            </div>
            <div className="mb-6 w-full text-[72px] font-black leading-[84px] tracking-[-0.03em] text-p4 uppercase max-lg:mb-7 max-lg:text-[64px] max-lg:font-black max-lg:leading-[64px] max-md:mb-4 max-md:text-5xl max-md:leading-12">
              Complete PDF Solution
            </div>
            <p className="w-full hidden md:block text-gray-400 mb-14 leading-[32px] text-[18px] md:text-[22px] md:leading-[36px] max-md:mb-10">
              A comprehensive and versatile PDF tool designed to streamline the process of editing, merging, compressing, and converting PDF files. With a user-friendly interface, it offers convenient features such as drag-and-drop functionality for effortlessly adding pages, as well as powerful image extraction capabilities. The tool also enables seamless PDF viewing, ensuring you can work with your documents in a hassle-free manner. Fully responsive and intuitive, this solution enhances document management, making it easier than ever to handle your PDF files with efficiency and precision.
            </p>

            <p className="w-full block px-3 md:px-0 md:hidden text-gray-400 mb-14 leading-[32px] text-[18px] md:text-[22px] md:leading-[36px] max-md:mb-10">
              {`${"A comprehensive and versatile PDF tool designed to streamline the process of editing, merging, compressing, and converting PDF files. With a user-friendly interface, it offers convenient features such as drag-and-drop functionality for effortlessly adding pages, as well as powerful image extraction capabilities. The tool also enables seamless PDF viewing, ensuring you can work with your documents in a hassle-free manner. Fully responsive and intuitive, this solution enhances document management, making it easier than ever to handle your PDF files with efficiency and precision.".slice(0, 312)}...`}
            </p>

            <ul className="flex items-center justify-center lg:justify-start w-full gap-5">
              <div className='mr-0 md:mr-12'>
                <a href='#features'>
                  <Button onClick={() => setGetStarted(true)} icon="/images/ButtonUtils/zap.svg" href={""} OuterContainerClassName={""} markerFill={""} containerClassName={""}>Get Started</Button>
                </a>
              </div>
              {
                navLinks.slice(0, 8).map((link) => (
                  <div
                    key={link.id}
                    className=" hidden overflow-hidden -ml-10 lg:-ml-12 max-lg:-mt-0 md:block "
                  >
                    <li className="flex-center flex-col w-20 h-20 rounded-full scale-[85%] border-p1 border-2  bg-s2 p-4">
                      <Image src={link.icon}
                        alt="image"
                        width={39}
                        height={39}
                        className=' brightness-200'
                      />
                      {/* <p className="p-14-medium text-center text-white">{link.label}</p> */}
                    </li>

                  </div>
                ))
              }
              <div
                className=" hidden overflow-hidden -ml-10 lg:-ml-12 max-lg:-mt-0 md:block "
              >
                <li className="flex justify-center text-gray-700 items-center w-20 h-20 pb-3 rounded-full text-6xl scale-[85%] border-p1 border-2 bg-p5 ">
                  +

                </li>

              </div>
            </ul>
          </div>
        </div>
      </section>
      {getStarted && <div id='features'><Options /></div>}
    </section>
  )
}

export default Home
const Button = ({
    icon,
    children,
    href,
    containerClassName,
    onClick,
    markerFill,
    OuterContainerClassName
}:{icon:string;
    children:string;
    href:string;
    containerClassName:string;
    onClick:MouseEventHandler<HTMLButtonElement>;
    markerFill:string;
    OuterContainerClassName:string;
}) => {
    const Inner = () => (
        <>
            <span className={`relative flex items-center min-h-[60px] px-4 g4 rounded-2xl before:g7 before:absolute before:inset-0 before:opacity-0 before:transition-opacity before:duration-500 before:content-[''] group-hover:before:opacity-100 overflow-hidden ${OuterContainerClassName}`}>
            <span className="absolute  -left-[1px]">
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
                            d="M2.5 0H0.5V4V18V22H2.5V16.25L7.63991 11.7526C8.09524 11.3542 8.09524 10.6458 7.63991 10.2474L2.5 5.75V0Z"
                            fill={markerFill || "#2EF2FF"}
                        />
                    </svg>
                </span>
                {icon && (
                    <Image
                        src={icon}
                        width={111}
                        height={111}
                        alt="circle"
                        className="size-10 mr-5 object-contain z-10"
                    />
                )}

                <span className="relative z-2 rounded-full font-poppins text-[16px] font-bold leading-[24px] text-p1 uppercase">
                    {children}
                </span>
            </span>

            <span className="before:g8   before:absolute before:left-2/5 before:top-0 before:z-4 before:h-0.5 before:w-3/5 before:opacity-0 before:transition-all before:duration-500 before:content-[''] group-hover:before:left-4 group-hover:before:opacity-40 after:g8 after:absolute after:bottom-0 after:left-4 after:z-4 after:h-0.5 after:w-7/20 after:opacity-0 after:transition-all after:duration-500 after:content-[''] group-hover:after:left-3/5 group-hover:after:opacity-40" />
        </>
    );
    return href ? (
        <a
            className={clsx(
                "relative p-0.5  g5 rounded-2xl shadow-500 group",
                containerClassName,
            )}
            href={href}
        >
            <Inner />
        </a>
    ) : (
        <button
            className={clsx(
                "relative p-0.5 g5 rounded-2xl  shadow-500 group",
                containerClassName,
            )}
            onClick={onClick}
        >
            <Inner />
        </button>
    );
};

