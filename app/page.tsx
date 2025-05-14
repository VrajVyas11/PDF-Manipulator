"use client";
import React, { memo, lazy, Suspense } from "react";

import { useActiveLink } from "./context/ContextProvider";
import Loading from "@/components/ui/Loading";

const PDFEditor = memo(lazy(() => import("../components/Core/PDFEditor/PDFEditor")));
const AddPages = memo(lazy(() => import("../components/Core/AddPages")));
const PDFMerger = memo(lazy(() => import("../components/Core/PDFMerge")));
const ImageToPDF = memo(lazy(() => import("../components/Core/ImageToPDF")));
const CompressPDF = memo(lazy(() => import("../components/Core/CompressPDF")));
const ExtractImages = memo(lazy(() => import("../components/Core/ExtractImages")));
const Home = memo(lazy(() => import("../components/Navigation/Home")));
const PDFSplit = memo(lazy(() => import("../components/Core/PDFSplit")));
const WordDocxToPdf = memo(lazy(() => import("../components/Core/WordDocxToPdf")));
const Base = () => {
  const { activeLink } = useActiveLink();

  return (
    <div
      className="flex justify-center items-center">
      <Suspense fallback={
        <Loading />}>
        {activeLink === "home" && <Home />}
        {activeLink === "split" && <PDFSplit />}
        {activeLink === "edit" && <PDFEditor />}
        {activeLink === "merge" && <PDFMerger />}
        {activeLink === "image" && <ImageToPDF />}
        {activeLink === "compress" && <CompressPDF />}
        {activeLink === "addpages" && <AddPages />}
        {activeLink === "extract" && <ExtractImages />}
        {activeLink == "wordtopdf" && <WordDocxToPdf />}
      </Suspense>
    </div>
  );
};

export default Base;
