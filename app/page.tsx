"use client";
import React, { memo } from "react";
import dynamic from "next/dynamic";
import { useActiveLink } from "./context/ContextProvider";

const PDFEditor = memo(dynamic(() => import("../components/Core/PDFEditor/PDFEditor"), { ssr: false }));
const AddPages = memo(dynamic(() => import("../components/Core/AddPages"), { ssr: false }));
const PDFMerger = memo(dynamic(() => import("../components/Core/PDFMerge"), { ssr: false }));
const ImageToPDF = memo(dynamic(() => import("../components/Core/ImageToPDF"), { ssr: false }));
const CompressPDF = memo(dynamic(() => import("../components/Core/CompressPDF"), { ssr: false }));
const ExtractImages = memo(dynamic(() => import("../components/Core/ExtractImages"), { ssr: false }));
const Home = memo(dynamic(() => import("../components/Navigation/Home"), { ssr: false }));
const PDFSplit = memo(dynamic(() => import("../components/Core/PDFSplit"), { ssr: false }));

const Base = () => {
  const { activeLink } = useActiveLink();

  return (
    <div className="flex justify-center items-center">
      {activeLink === "home" && <Home />}
      {activeLink === "split" && <PDFSplit />}
      {activeLink === "edit" && <PDFEditor />}
      {activeLink === "merge" && <PDFMerger />}
      {activeLink === "image" && <ImageToPDF />}
      {activeLink === "compress" && <CompressPDF />}
      {activeLink === "addpages" && <AddPages />}
      {activeLink === "extract" && <ExtractImages />}
    </div>
  );
};

export default Base;
