import { Element, Link as LinkScroll } from "react-scroll";
import Button from "../app/utils/Button"
const Landing = ({ setGetStarted }) => {


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


            <div className="hero-figure top-40 md:top-24 lg:top-40 left-[calc(50%)]  pointer-events-none hero-img_res max-lg:top-40 max-lg:left-[calc(50%)]  max-md:left-[calc(50%)] max-md:top-auto  md:mt-44  lg:mt-16 anime-element absolute text-center md:text-left md:before:absolute md:before:top-[-57.8%] md:before:left-[-1.3%] md:before:w-[152.84%] md:before:h-[178.78%] md:before:bg-[url('/images/ExtraUI/hero-back-illustration.svg')] md:before:bg-cover md:after:absolute md:after:top-[-35.6%] md:after:w-[57.2%] md:after:h-[87.88%] md:after:left-[99.6%] md:after:bg-[url('/images/ExtraUI/hero-top-illustration.svg')] md:after:bg-no-repeat">
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
        </Element>
      </section>
    </>
  );
};

export default Landing;



