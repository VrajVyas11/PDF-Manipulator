import { Element, Link as LinkScroll } from "react-scroll";
import clsx from "clsx";
import Image from 'next/image';
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
                <Button onClick={() => setGetStarted(true)} icon="/images/zap.svg">Get Started</Button>
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


const Button = ({
  icon,
  children,
  href,
  containerClassName,
  onClick,
  markerFill,
}) => {
  const Inner = () => (
    <>
      <span className="relative flex items-center min-h-[60px] px-4 g4 rounded-2xl before:g7 before:absolute before:inset-0 before:opacity-0 before:transition-opacity before:duration-500 before:content-[''] group-hover:before:opacity-100 overflow-hidden">
        <span className="absolute -left-[1px]">
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
          height={111}
          width={111}
            src={icon}
            alt="circle"
            className="size-10 mr-5 object-contain z-10"
          />
        )}

        <span className="relative z-2 font-poppins text-[16px] font-bold leading-[24px] text-p1 uppercase">
          {children}
        </span>
      </span>

      <span className="before:g8 before:absolute before:left-2/5 before:top-0 before:z-4 before:h-0.5 before:w-3/5 before:opacity-0 before:transition-all before:duration-500 before:content-[''] group-hover:before:left-4 group-hover:before:opacity-40 after:g8 after:absolute after:bottom-0 after:left-4 after:z-4 after:h-0.5 after:w-7/20 after:opacity-0 after:transition-all after:duration-500 after:content-[''] group-hover:after:left-3/5 group-hover:after:opacity-40" />
    </>
  );
  return href ? (
    <a
      className={clsx(
        "relative p-0.5 g5 rounded-2xl shadow-500 group",
        containerClassName,
      )}
      href={href}
    >
      <Inner />
    </a>
  ) : (
    <button
      className={clsx(
        "relative p-0.5 g5 rounded-2xl shadow-500 group",
        containerClassName,
      )}
      onClick={onClick}
    >
      <Inner />
    </button>
  );
};
