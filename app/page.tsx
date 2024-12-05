"use client";
import React, { useState } from 'react';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { useActiveLink } from "./context/ContextProvider";
const PDFEditor = dynamic(() => import('../components/PDFEditor/PDFEditor'), { ssr: false });
const AddPages = dynamic(() => import('../components/AddPages'), { ssr: false });
import PDFMerger from '../components/PDFMerge';
import ImageToPDF from '../components/ImageToPDF';
import CompressPDF from '../components/CompressPDF';
import GetPDFImages from '../components/GetPDFImages';
import Home from "../components/Reworks/Home"
function Base() {
  const { activeLink, setActiveLink } = useActiveLink();

  return (
    <div className=' flex justify-center items-center'>
      {activeLink === 'home' && <Home />}
        {activeLink === 'edit' && <PDFEditor />}
        {activeLink === 'merge' && <PDFMerger />}
        {activeLink === 'image' && <ImageToPDF />}
        {activeLink === 'compress' && <CompressPDF />}
        {activeLink === 'addpages' && <AddPages />}
        {activeLink === 'extract' && <GetPDFImages />}
    </div>
  );
}

export default Base;
