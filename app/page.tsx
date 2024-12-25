"use client";
import React from 'react';
import dynamic from 'next/dynamic';
import { useActiveLink } from "./context/ContextProvider";
const PDFEditor = dynamic(() => import('../components/Core/PDFEditor/PDFEditor'), { ssr: false });
const AddPages = dynamic(() => import('../components/Core/AddPages'), { ssr: false });
import PDFMerger from '../components/Core/PDFMerge';
import ImageToPDF from '../components/Core/ImageToPDF';
import CompressPDF from '../components/Core/CompressPDF';
import ExtractImages from '../components/Core/ExtractImages';
import Home from "../components/Navigation/Home"
import PDFSplit from '../components/Core/PDFSplit';
function Base() {
  const { activeLink } = useActiveLink();

  return (
    <div className=' flex justify-center items-center'>
      {activeLink === 'home' && <Home />}
      {activeLink === 'split' && <PDFSplit />}
        {activeLink === 'edit' && <PDFEditor />}
        {activeLink === 'merge' && <PDFMerger />}
        {activeLink === 'image' && <ImageToPDF />}
        {activeLink === 'compress' && <CompressPDF />}
        {activeLink === 'addpages' && <AddPages />}
        {activeLink === 'extract' && <ExtractImages />}
    </div>
  );
}

export default Base;
