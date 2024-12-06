"use client";
import React, { useState } from 'react';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { useActiveLink } from "./context/ContextProvider";
const PDFEditor = dynamic(() => import('../components/Core/PDFEditor/PDFEditor'), { ssr: false });
const AddPages = dynamic(() => import('../components/Core/AddPages'), { ssr: false });
import PDFMerger from '../components/Core/PDFMerge';
import ImageToPDF from '../components/Core/ImageToPDF';
import CompressPDF from '../components/Core/CompressPDF';
import GetPDFImages from '../components/Core/GetPDFImages';
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
