import "./globals.css";
import { ActiveLinkProvider } from "./context/ContextProvider"; 
import Sidebar from "../components/Reworks/Sidebar"; 
import MobileNav from "../components/Reworks/MobileNav";
import { IBM_Plex_Sans } from "next/font/google";
import { twMerge } from "tailwind-merge";
import clsx, { ClassValue } from "clsx";
import { Toaster } from "@/components/ui/toaster"
const IBMPlex = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-ibm-plex",
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
     <head>
        <link rel="icon" href="/favicon.svg" />
        <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Pacifico&display=swap" rel="stylesheet"/>
      </head>
      <body 
          style={{
      lineHeight: '1.5',
      WebkitTextSizeAdjust: '100%',
      fontFamily: 'system-ui, sans-serif',
      WebkitFontSmoothing: 'antialiased',
      textRendering: 'optimizeLegibility',
      MozOsxFontSmoothing: 'grayscale',
      touchAction: 'manipulation',
      // backgroundColor: '#11111a',
      backgroundImage: 'radial-gradient(#2d2d2d 1px, transparent 0), radial-gradient(#373636 1px, transparent 0)',
      backgroundPosition: '0 0, 25px 25px',
      backgroundSize: '50px 50px',
    }}
    className={cn(
      "font-IBMPlex antialiased", 
      IBMPlex.variable, 
      `body-wrap m-0 sm:min-h-screen min-h-screen md:h-auto text-white font-sans text-body bg-[#03050e] bg-opacity-95 transition-colors duration-200 leading-6 text-base box-border -webkit-font-smoothing:antialiased overflow-scroll flex flex-row bg-fixed`
    )}>
    
       <ActiveLinkProvider>
          <Sidebar />
          <MobileNav />
          <div className="mt-16 flex-1 overflow-auto py-8 lg:mt-0 lg:max-h-screen lg:py-10">
          <div className=' max-w-5xl mx-auto md:px-2 w-full text-dark-400'>
         {children}
         <Toaster />
         </div>
          </div>
        </ActiveLinkProvider>
      </body>
    </html>
  );
}
