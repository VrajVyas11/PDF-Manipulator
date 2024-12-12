import React from 'react'
import { Link as LinkScroll } from "react-scroll";
import { useEffect, useState } from "react";
import clsx from "clsx";
import Image from 'next/image';
const Header = () => {
    const [hasScrolled, setHasScrolled] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setHasScrolled(window.scrollY > 32);
        };

        window.addEventListener("scroll", handleScroll);

        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, []);


    return (
        <header
            className={`
                fixed top-0 left-0 z-50 w-full bg-opacity-60  transition-all duration-500
                ${hasScrolled ? "py-2 bg-black-100 backdrop-blur-[8px]" : "max-lg:py-4 py-4 bg-gray-900 "},
            `}
        >
            <div className="mx-auto max-w-[1252px] px-16 max-xl:px-10 max-sm:px-4 flex h-14 items-center max-lg:px-5">
                <a className="lg:hidden flex flex-row justify-start items-center flex-1 cursor-pointer z-2">
                    <Image src="/images/UI_Nav/logo.svg" width={50} height={50} alt="logo" />
                    <h1 className="text-[1.2rem] ml-4  font-pacifico py-1 text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-cyan-400 drop-shadow-lg">
                        PDF Manipulator
                    </h1>
                </a>

                <div
                    className={clsx(
                        "w-full max-lg:fixed max-lg:top-0 max-lg:left-0 max-lg:w-full max-lg:bg-s2 max-lg:opacity-0",
                        isOpen ? "max-lg:opacity-100" : "max-lg:pointer-events-none",
                    )}
                >
                    <div className="max-lg:relative max-lg:flex max-lg:flex-col max-lg:min-h-screen max-lg:p-6 max-lg:overflow-hidden max-lg:before:absolute max-lg:before:-right-64 max-lg:before:top-2/5 max-lg:before:h-[440px] max-lg:before:w-[252px] max-lg:before:bg-s4 max-lg:before:blur-[200px] max-lg:before:content-[''] max-md:px-4">
                        <nav className="max-lg:relative max-lg:z-2 max-lg:my-auto">
                            <ul className="flex max-lg:block max-lg:px-12">
                                <li className="relative flex flex-1 items-center justify-between max-lg:flex-col max-lg:items-start">
                                    <a
                                        href="https://www.linkedin.com/in/vraj-vyas-983249297/"
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        <Image
                                            width={111}
                                            height={111}
                                            className="w-[2.5rem] hidden lg:block h-auto"
                                            src="https://img.icons8.com/?size=100&id=xuvGCOXi8Wyg&format=png&color=000000"
                                            alt="LinkedIn Icon"
                                            draggable="false"
                                        />
                                        <p className="text-[16px] font-bold leading-[24px] lg:hidden text-p4 uppercase transition-colors duration-500 cursor-pointer hover:text-p1 max-lg:my-4 max-lg:text-[32px] max-lg:font-semibold max-lg:leading-[40px]">
                                            LinkedIn
                                        </p>
                                    </a>
                                    <div className="size-1.5 rounded-full bg-p2 max-lg:hidden" />
                                    <LinkScroll
                                        onClick={() => setIsOpen(false)}
                                        to={"features"}
                                        offset={-100}
                                        spy
                                        smooth
                                        activeClass="nav-active"
                                        className="text-[16px] font-bold leading-[24px] active:text-p3 text-p4 uppercase transition-colors duration-500 cursor-pointer hover:text-p1 max-lg:my-4  max-lg:text-[32px] max-lg:font-semibold max-lg:leading-[40px]"
                                    >
                                        features
                                    </LinkScroll>


                                </li>

                                <li className="relative flex flex-1 items-center justify-center">
                                    <LinkScroll
                                        to="hero"
                                        offset={-250}
                                        spy
                                        smooth
                                        className={clsx(
                                            "max-lg:hidden flex justify-center items-center transition-transform duration-500 cursor-pointer",
                                        )}
                                    >
                                        <Image src="/images/UI_Nav/logo.svg" width={50} height={50} alt="logo" />
                                        <h1 className=" ml-4 text-[1.2rem] font-pacifico py-1 text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-cyan-400 drop-shadow-lg">
                                            PDF Manipulator
                                        </h1>
                                    </LinkScroll>
                                </li>

                                <li className="relative flex flex-1 items-center justify-between max-lg:flex-col max-lg:items-start">
                                    <a
                                        target="_blank"
                                        href="https://github.com/VrajVyas11/Next_JS_PDF_Manipulator/blob/main/README.md"
                                    >
                                        <p className="text-[16px] font-bold leading-[24px] text-p4 uppercase transition-colors duration-500 cursor-pointer hover:text-p1 max-lg:my-4  max-lg:text-[32px] max-lg:font-semibold max-lg:leading-[40px]">
                                            Docs
                                        </p>
                                    </a>
                                    <div className='size-1.5 rounded-full bg-p2 max-lg:hidden' />
                                    <a
                                        href="https://github.com/VrajVyas11/Next_JS_PDF_Manipulator"
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        <Image
                                        alt='github'
                                            width={111}
                                            height={111}
                                            className="w-[2.5rem] hidden lg:block h-auto"
                                            src="/images/github-logo.png"
                                            draggable="false"
                                        />
                                        <p className="text-[16px] font-bold leading-[24px] lg:hidden text-p4 uppercase transition-colors duration-500 cursor-pointer hover:text-p1 max-lg:my-4  max-lg:text-[32px] max-lg:font-semibold max-lg:leading-[40px]">
                                            GitHub
                                        </p>
                                    </a>

                                </li>
                            </ul>
                        </nav>

                        <div className="lg:hidden block absolute top-1/2 left-0 w-[960px] h-[380px] translate-x-[-290px] -translate-y-1/2 rotate-90">
                            <Image
                                src="/images/ExtraUI/bg-outlines.svg"
                                width={960}
                                height={380}
                                alt="outline"
                                className="relative z-2"
                            />
                            <Image
                                src="/images/bg-outlines-fill.png"
                                width={960}
                                height={380}
                                alt="outline"
                                className="absolute inset-0 mix-blend-soft-light opacity-5"
                            />
                        </div>
                    </div>
                </div>

                <button
                    className="lg:hidden z-2 size-10 border-2 border-s4/25 rounded-full flex justify-center items-center"
                    onClick={() => setIsOpen((prevState) => !prevState)}
                >
                    <Image
                        width={111}
                        height={111}
                        src={`/images/UI_Nav/${isOpen ? "close" : "magic"}.svg`}
                        alt="magic"
                        className="size-1/2 object-contain"
                    />
                </button>
            </div>
        </header>
    )
}

export default Header