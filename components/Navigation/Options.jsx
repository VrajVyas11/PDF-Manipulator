import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { navLinks } from "../../app/Constants/index";

const Options = () => {
  const router = useRouter();

  const handleLinkClick = (url) => {
    router.push(url);
  };

  return (
    <div className="min-h-screen relative z-40  md:-mt-10  ">
      <div className="bg-transparent flex flex-col justify-center items-center  w-full py-12">
        <div
          className="relative text-center md:bg-opacity-10 bg-black md:bg-transparent bg-opacity-80 w-fit border-p1 flex justify-center items-center flex-col z-2 border-y-[1px] my-7 "
        >
          <div className="rounded-half absolute -top-10 left-[calc(50%-40px)] z-4 flex size-20 items-center justify-center border-2 border-s2 bg-s1">
            <Image
              width={10}
              height={10}
              src="/images/ButtonUtils/optionsHead.svg"
              alt="logo"
              className="size-1/2"
            />
          </div>
          <div className="text-4xl mt-11 font-bold text-white mb-2">
            PDF Manipulator Suite
          </div>
          <p className="text-lg text-gray-500 mb-6">
            Edit, compress, merge, convert, and more—all in one tool!
          </p>

          <div className=" features mx-auto md:px-8 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-3 gap-4 md:gap-4">
            {navLinks.slice(1, 9).map((card) => (
              <div
                key={card.id}
                onClick={() => handleLinkClick(card.URL)}
                className="relative z-2 border-2 cursor-pointer  border-p1 border-opacity-60 bg-s1 rounded-2xl my-7 md:my-10 before:absolute before:left-[calc(50%-160px)] before:top-[-160px] before:size-[320px] before:bg-s4/10 before:mix-blend-soft-light before:blur-[200px] before:content-['']"
              >
                <div className="relative z-10 mx-auto py-10 px-2 flex gap-8 max-lg:block rounded-xl shadow-lg transition-all duration-300">
                  <div className="rounded-full absolute p-2 -top-10 left-[calc(50%-35px)] md:left-[calc(50%-40px)] shadow-xl z-4 flex items-center justify-center border-4 border-s3 bg-gradient-to-r from-s1 to-s4">
                    <div className="w-12 h-12 md:w-16 md:h-16 p-2 flex justify-center items-center bg-opacity-20  rounded-full">
                      <Image
                        width={111}
                        height={111}
                        src={card.icon}
                        alt="logo"
                        className="w-16 h-16 object-contain brightness-200"
                      />
                    </div>
                  </div>
                  <div
                    className="relative w-full  md:pt-6 rounded-lg px-2 flex-col flex justify-center items-center text-center font-extrabold transform hover:scale-[101%] transition-transform duration-200 ease-out tracking-wider  "
                  >
                    <div className="flex flex-row mb-0 md:mb-4 gap-2 justify-between items-center">
                      <h3 className="text-[24px] font-black tracking-[-0.03em] text-p4 uppercase max-lg:mb-7  max-lg:font-black ">
                        {card.title}
                      </h3>
                    </div>
                    <p className="text-gray-300 text-sm md:text-base font-normal text-center">
                      <span className="block md:hidden overflow-hidden text-ellipsis whitespace-wrap">
                        {card.description.length > 50
                          ? `${card.description.slice(0, 50)}...`
                          : card.description}
                      </span>
                      <span className="hidden md:block">{card.description}</span>
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Options;