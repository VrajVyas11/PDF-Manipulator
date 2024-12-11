import Image from "next/image"
import clsx from "clsx";
const Button = ({
    icon,
    children,
    href,
    containerClassName,
    onClick,
    markerFill,
    OuterContainerClassName
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

export default Button