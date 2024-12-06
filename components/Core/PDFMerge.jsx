import React, { useEffect, useState, useCallback, useTransition } from 'react';
import { PDFDocument } from 'pdf-lib';
import PDFViewer from "./PDFViewer";
import Image from 'next/image';

const PdfMerge = () => {
  const [pdfs, setPdfs] = useState([]);
  const [pages, setPages] = useState([]);
  const [previewPdf, setPreviewPdf] = useState(null);
  const [mergedPdfBytes, setMergedPdfBytes] = useState(null);
  const [count, setCount] = useState(0);

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    const newPdfs = [...pdfs];

    for (const file of files) {
      const reader = new FileReader();
      reader.onload = async (ev) => {
        const pdfData = ev.target.result;
        newPdfs.push(pdfData);
        await extractPages(pdfData, newPdfs.length - 1);
        setCount((prevCount) => prevCount + 1);
      };

      reader.readAsArrayBuffer(file);
    }

    setPdfs(newPdfs);
  };

  const extractPages = async (pdfData, pdfIndex) => {
    try {
      const pdfDoc = await PDFDocument.load(pdfData);
      const pageCount = pdfDoc.getPageCount();
      const extractedPages = Array.from({ length: pageCount }, (_, index) => ({
        index,
        pdfIndex,
        name: `pdf ${pdfIndex + 1} page ${index + 1}`,
      }));
      setPages((prev) => [...prev, ...extractedPages]);
    } catch (error) {
      console.error("Error extracting pages:", error);
    }
  };

  const handleDrop = (event, targetIndex) => {
    event.preventDefault();
    const sourceIndex = event.dataTransfer.getData('text/plain');

    if (sourceIndex === targetIndex.toString() || !pages[sourceIndex] || !pages[targetIndex]) return;

    setPages((prevPages) => {
      const updatedPages = [...prevPages];
      const [movedPage] = updatedPages.splice(sourceIndex, 1);
      updatedPages.splice(targetIndex, 0, movedPage);
      return updatedPages;
    });
  };

  const mergePdfs = useCallback(async () => {
    if (pdfs.length === 0 || pages.length === 0) return;

    try {
      const mergedPdf = await PDFDocument.create();

      for (const page of pages) {
        const { index } = page;
        const pdfDoc = await PDFDocument.load(pdfs[page.pdfIndex]);

        const copiedPages = await mergedPdf.copyPages(pdfDoc, [index]);
        mergedPdf.addPage(copiedPages[0]);
      }

      const pdfBytes = await mergedPdf.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      setPreviewPdf(URL.createObjectURL(blob));
      setMergedPdfBytes(pdfBytes);
    } catch (error) {
      console.error("Error merging PDFs:", error);
    }
  }, [pdfs, pages]);

  const handleDragStart = (event, index) => {
    event.dataTransfer.setData('text/plain', index);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const downloadPdf = () => {
    if (mergedPdfBytes) {
      const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'merged.pdf';
      link.click();
    }
  };

  useEffect(() => {
    if (pages.length > 0) {
      mergePdfs();
    }
  }, [pages, mergePdfs]);

  useEffect(() => {
    mergePdfs();
  }, [count, mergePdfs]);

  return (
    <div className="flex flex-col  w-full">
      <div className=' flex flex-row w-full'>
        <div className=' flex flex-col mt-5 mb-10 w-full'>
          <h2 className='text-[30px] font-bold md:text-[38px] leading-[110%] text-p4'>Merge PDf</h2>
          <p className='font-normal text-[16px] leading-[140%] mt-4 text-p5'>Merge your pdfs into one with dynamic grag and drop interface </p>
        </div>
        {pages.length > 0 &&<button
          onClick={downloadPdf}
          className={`flex w-full justify-end  rounded-2xl  group`}
        >
          <span className={`relative flex justify-around items-center w-fit before:g7 g4  min-h-fit px-4 py-2  rounded-2xl  before:absolute before:inset-0 before:opacity-0 before:transition-opacity before:duration-500 before:content-[''] group-hover:before:opacity-100 overflow-hidden `}>

            <Image
              src="/images/download.svg"
              alt='logo'
              width={28}
              height={28}
              className={`brightness-200`}
            />

            <span className="font-semibold text-16 flex size-full gap-4 p-4 pr-0 text-p5 ">
              Download
            </span>

          </span>
        </button>}

      </div>

      <div className="flex flex-row  text-white shadow-[inset_0_0_200px_rgba(0,0,150,0.1)]  rounded-lg p-4  h-fit w-full ">
        <div className="w-full lg:w-1/3 pr-0  lg:pr-4 mb-4 lg:mb-0">
          <div className="min-h-[200px] shadow-xl rounded-lg p-4 pt-0 ">

            <div className="flex flex-col text-center  gap-4">
              <h3 className="font-bold text-[30px] leading-[140%] text-p5">
                Upload
              </h3>

              <div
                onClick={() => document.getElementById('fileInput').click()}
                className="flex-center flex h-64 cursor-pointer flex-col gap-5 rounded-[16px] border border-dashed bg-purple-100/10 shadow-inner">
                <div
                  className="rounded-[16px] bg-s0/40  p-5 shadow-sm shadow-purple-200/50">
                  <input
                    id="fileInput"
                    type="file"
                    accept="application/pdf"
                    className="hidden"
                    onChange={handleFileChange}
                    multiple
                  />
                  <Image
                    src="/images/add.svg"
                    alt="Add Image"
                    width={24}
                    height={24}
                  />
                </div>
                <p className="font-normal">Click here to upload image</p>
              </div>
            </div>

            {pages.length > 0 && (
              <h2 className="text-sm sm:text-lg font-bold text-gray-400 mb-2 mt-6 sm:mt-10">
                Uploaded Pages
              </h2>
            )}
            <div className="grid grid-cols-1 gap-4">
              {pages.map((page, index) => (
                <div
                  key={index}
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, index)}
                  className="bg-gray-800 border border-gray-700 rounded-md p-3 hover:bg-gray-700 cursor-move flex justify-between items-center shadow transition duration-150 ease-in-out"
                >
                  <span className="text-gray-400 text-sm">{page.name}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        <div className="w-full flex flex-col gap-4 lg:w-2/3">
        <h2 className="font-bold text-center text-[30px] leading-[140%] text-p5">
                  PDF Preview
                </h2>
          <div className=" bg-purple-100/10 shadow-inner min-h-72 font-normal bg-opacity-70 border border-gray-800  rounded-xl p-4 sm:p-6">
            
            {pages.length > 0 ? (
              <>
                <PDFViewer file={previewPdf} />
              </>
            ) : (
              <div className="font-normal text-[16px] leading-[140%] flex justify-center text-p5">
                No files uploaded. Upload files to preview and merge.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PdfMerge;
