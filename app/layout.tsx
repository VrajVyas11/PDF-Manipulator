/* eslint-disable @next/next/no-page-custom-font */
import "./globals.css";
import React from "react";
import Sidebar from "../components/Navigation/Sidebar";
import MobileNav from "../components/Navigation/MobileNav";
import { IBM_Plex_Sans } from "next/font/google";
import { twMerge } from "tailwind-merge";
import clsx, { ClassValue } from "clsx";
import { Toaster } from "@/components/ui/toaster";

const IBMPlex = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-ibm-plex",
});

export const metadata = {
  title: "PDF Manipulator",
  description: "A comprehensive and versatile PDF tool designed to streamline the process of editing, merging, compressing, and converting PDF files. With a user-friendly interface, it offers convenient features such as drag-and-drop functionality for effortlessly adding pages, as well as powerful image extraction capabilities. The tool also enables seamless PDF viewing, ensuring you can work with your documents in a hassle-free manner. Fully responsive and intuitive, this solution enhances document management, making it easier than ever to handle your PDF files with efficiency and precision.",
  icons: {
    icon: "/favicon.svg",
  }
};

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" />
        <link href="https://fonts.googleapis.com/css2?family=Edu+AU+VIC+WA+NT+Arrows:wght@400..700&family=Pacifico&display=swap" rel="stylesheet" />
      </head>
      <body
        style={{
          lineHeight: "1.5",
          WebkitTextSizeAdjust: "100%",
          fontFamily: "system-ui, sans-serif",
          WebkitFontSmoothing: "antialiased",
          textRendering: "optimizeLegibility",
          MozOsxFontSmoothing: "grayscale",
          touchAction: "manipulation",
          backgroundImage:
            "radial-gradient(#2d2d2d 1px, transparent 0), radial-gradient(#373636 1px, transparent 0)",
          backgroundPosition: "0 0, 25px 25px",
          backgroundSize: "50px 50px",
        }}
        className={cn(
          "font-IBMPlex antialiased",
          IBMPlex.variable,
          `body-wrap m-0 sm:min-h-screen min-h-screen text-white font-sans text-body bg-[#03050e] bg-opacity-95 transition-colors duration-200 leading-6 text-base box-border -webkit-font-smoothing:antialiased flex flex-row bg-fixed`
        )}
      >
          <Sidebar />
          <MobileNav />
          <div style={{
            scrollbarWidth: "none",
            scrollbarColor: "rgba(0, 89, 182, 0.6) rgba(0, 0, 0, 0.1)",
          }} className="mt-16 flex-1 overflow-auto py-8 lg:mt-0 lg:max-h-screen lg:py-10">
            <div className=" max-w-5xl mx-auto md:px-2 w-full text-dark-400">
              {children}
              <Toaster />
            </div>
          </div>
      </body>
    </html>
  );
}
