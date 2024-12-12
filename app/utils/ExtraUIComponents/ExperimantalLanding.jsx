import { Element, Link as LinkScroll } from "react-scroll";
import Image from 'next/image';
import Button from "../app/utils/Button"
const ExperimentalLanding = ({ setGetStarted }) => {

  return (
    <>

      <section className="relative max-sm:pt-32 max-sm:pb-0 pt-40 pb-40 max-lg:pt-52 max-lg:pb-36 max-md:pt-36 max-md:pb-32">
        <Element name="hero">
          <div className="mx-auto   max-w-[1252px] pl-16 max-xl:pl-10 max-lg:pl-6 max-sm:pl-4">
            <div className="relative sm:pr-4  md:pr-0 text-center md:text-left z-2 max-w-512 max-lg:max-w-388">
              <div className="text-[18px] ml-3 font-bold leading-[16px] tracking-[0.3em] mb-5 uppercase text-p3 ">
                PDF Manipulator
              </div>
              <h1 className="mb-6 text-[72px] font-black leading-[84px] tracking-[-0.03em] text-p4 uppercase max-lg:mb-7 max-lg:text-[64px] max-lg:font-black max-lg:leading-[64px] max-md:mb-4 max-md:text-5xl max-md:leading-12">
                Complete PDF Solution
              </h1>
              <p className="max-w-440 text-gray-400 mb-14 leading-[32px] text-[18px] md:text-[22px] md:leading-[36px] max-md:mb-10">
                A versatile PDF tool for editing, merging, compressing, and converting. Features include drag-and-drop for adding pages, extracting images, and viewing. Fully responsive, it simplifies document management.
              </p>
              <LinkScroll to="features" offset={-100} spy smooth>
                <Button onClick={() => setGetStarted(true)} icon="/images/ButtonUtils/zap.svg">Get Started</Button>
              </LinkScroll>
            </div>

            {/* <div className="absolute -top-40 md:-top-24 lg:-top-40 left-[calc(50%-320px)] w-[1230px] pointer-events-none hero-img_res max-lg:-top-40 max-lg:left-[calc(50%-280px)] max-lg:w-[1160px] max-md:bottom-[-590px] max-md:left-[calc(50%-390px)] max-md:top-auto">
            <Image
            width={111}
            height={111}
              src="/images/hero.png"
              className="size-1230 max-lg:h-auto"
              alt="hero"
            />
          </div> */}


            <div className="absolute lg:top-24 left-[calc(50%)] w-[1230px] pointer-events-none">
              <div
                className="absolute z-0 top-20 left-48 w-[40%] sm:w-[30%] h-[30%] sm:h-[30%] lg:w-[234px] lg:h-[434px]"
                style={{
                  background: "rgba(0, 123, 255, .72)",
                  filter: "blur(150px)",
                }}
              ></div>
              <Image
                width={111}
                height={111}
                src="/images/ex2.png"
                className="object-cover rounded-full w-[650px] h-[650px] transform hover:rotate-12 hover:scale-105 transition-transform duration-300 ease-in-out"
                alt="hero"
                style={{
                  transform: "perspective(1000px) rotateX(-5deg) rotateY(-10deg)",
                  filter: "drop-shadow(10px 10px 5px rgba(0, 0, 0, 0.8))", // Compact and solid shadow
                }}
              />



            </div>
          </div>
        </Element>
      </section>
    </>
  );
};

export default ExperimentalLanding;



