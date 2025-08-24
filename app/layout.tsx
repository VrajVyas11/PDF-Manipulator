/* eslint-disable @next/next/no-page-custom-font */
import "./globals.css";
import React from "react";
import dynamic from "next/dynamic";

// Lazy load navigation components to reduce initial bundle
const Sidebar = dynamic(() => import("../components/Navigation/Sidebar"), {
  ssr: true, // Keep SSR for SEO and initial layout
});

const MobileNav = dynamic(() => import("../components/Navigation/MobileNav"), {
  ssr: true,
});

// Lazy load toaster since it's only needed when toast is triggered
const Toaster = dynamic(() => import("@/components/ui/toaster").then(mod => ({ default: mod.Toaster })), {
  ssr: false,
});


export const metadata = {
  title: "PDF Manipulator",
  description: "A comprehensive and versatile PDF tool designed to streamline the process of editing, merging, compressing, and converting PDF files. With a user-friendly interface, it offers convenient features such as drag-and-drop functionality for effortlessly adding pages, as well as powerful image extraction capabilities. The tool also enables seamless PDF viewing, ensuring you can work with your documents in a hassle-free manner. Fully responsive and intuitive, this solution enhances document management, making it easier than ever to handle your PDF files with efficiency and precision.",
  icons: {
    icon: "/favicon.svg",
  },
  robots: {
    index: true,
    follow: true,
  }
};
export async function generateViewport() {
  return {
    viewport: {
      width: "device-width",
      initialScale: 1,
      maximumScale: 5,
    },
    themeColor: "#03050e",
  };
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        {/* Preconnect to external domains */}
        <link rel="preconnect" href="https://fonts.googleapis.com" crossOrigin="" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="preconnect" href="https://cdnjs.cloudflare.com" crossOrigin="" />

        {/* Optimized font loading */}
        <link
          href="https://fonts.googleapis.com/css2?family=Edu+AU+VIC+WA+NT+Arrows:wght@400..700&family=Pacifico&display=swap"
          rel="stylesheet"
        />

        {/* DNS prefetch for better performance */}
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//fonts.gstatic.com" />
        <link rel="dns-prefetch" href="//cdnjs.cloudflare.com" />

        {/* Optimize viewport */}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta name="theme-color" content="#03050e" />

        {/* Performance hints */}
        <meta httpEquiv="x-dns-prefetch-control" content="on" />
      </head>
      <body
        className={" antialiased body-wrap m-0 sm:min-h-screen min-h-screen text-white font-sans text-body bg-[#03050e] bg-opacity-95 transition-colors duration-200 leading-6 text-base box-border flex flex-row bg-fixed"}
        style={{
          lineHeight: "1.5",
          WebkitTextSizeAdjust: "100%",
          fontFamily: "var(--font-ibm-plex), system-ui, sans-serif",
          WebkitFontSmoothing: "antialiased",
          textRendering: "optimizeLegibility",
          MozOsxFontSmoothing: "grayscale",
          touchAction: "manipulation",
          backgroundImage:
            "radial-gradient(#2d2d2d 1px, transparent 0), radial-gradient(#373636 1px, transparent 0)",
          backgroundPosition: "0 0, 25px 25px",
          backgroundSize: "50px 50px",
        }}
      >
        <Sidebar />
        <MobileNav />

        <main
          className="mt-16 flex-1 overflow-auto py-8 lg:mt-0 lg:max-h-screen lg:py-10"
          style={{
            scrollbarWidth: "none",
            scrollbarColor: "rgba(0, 89, 182, 0.6) rgba(0, 0, 0, 0.1)",
          }}
        >
          <div className="max-w-5xl mx-auto md:px-2 w-full text-dark-400">
            {children}
          </div>
        </main>

        <Toaster />
      </body>
    </html>
  );
}