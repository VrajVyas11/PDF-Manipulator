import React, { useEffect, useState, useCallback } from 'react';
import { PDFDocument } from 'pdf-lib';
import PDFViewer from "./PDFViewer";
import Image from 'next/image';
import * as pdfjsLib from 'pdfjs-dist/webpack';
import { useToast } from "../../hooks/use-toast"

const PdfMerge = () => {
  const [pdfs, setPdfs] = useState([]);
  const [pages, setPages] = useState([]);
  const [previewPdf, setPreviewPdf] = useState(null);
  const [mergedPdfBytes, setMergedPdfBytes] = useState(null);
  const [count, setCount] = useState(0);
  const [previewPdfPages, setPreviewPdfPages] = useState([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const { toast } = useToast()

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
    for (const file of files) {
      const reader = new FileReader();
      reader.onload = async (ev) => {
        const pdfData = ev.target.result;
        await setingPreviewPages(pdfData, newPdfs.length - 1)
      };
      reader.readAsArrayBuffer(file);
    }
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
      toast({
        title: `Error extracting pages ${error}`,
        variant: "destructive",
        style: {
          color: "#C4CBF5",
          borderRadius: "8px",
          padding: "20px",
          fontSize: "16px",
          fontWeight: "bold",
        },
      });
    }
  };

  const setingPreviewPages = async (pdfData, pdfIndex) => {
    const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;
    const pageCount = pdf.numPages;

    const pagesArray = [];

    for (let i = 1; i <= pageCount; i++) {
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale: 1 });

      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      canvas.width = viewport.width;
      canvas.height = viewport.height;

      await page.render({ canvasContext: context, viewport }).promise;

      const image = canvas.toDataURL("image/png");

      pagesArray.push({
        index: i,
        pdfIndex,
        name: `PDF ${pdfIndex + 1} Page ${i}`,
        preview: image,
      });
    }

    setPreviewPdfPages((prev) => [...prev, ...pagesArray]);
  };

  console.log(previewPdfPages)

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
    setPreviewPdfPages((prevPages) => {
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
      toast({
        title: `Error merging PDFs: ${error}`,
        variant: "destructive",
        style: {
          color: "#C4CBF5",
          borderRadius: "8px",
          padding: "20px",
          fontSize: "16px",
          fontWeight: "bold",
        },
      });
    }
  }, [pdfs, pages, toast]);

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
  }, [count, mergePdfs])
  return (
    <div className="flex  flex-col w-full ">
      <div className="flex flex-col lg:px-0 lg:flex-row justify-center mt-5 mb-10 items-center w-full">
        <div className="flex flex-col  md:pl-4 w-full text-center lg:text-left">
          <h2 className="text-[30px] font-bold md:text-[38px] leading-[110%] text-p4">Merge PDF</h2>
          <p className="font-normal text-[16px] leading-[140%] mt-4 text-p5">
            Combine multiple PDFs effortlessly with a sleek drag-and-drop interface!
          </p>
        </div>
        <button
          disabled={!pages.length > 0}
          onClick={downloadPdf}
          className={`flex w-full md:pr-4 disabled:opacity-40 disabled:cursor-not-allowed justify-center lg:justify-end rounded-2xl group mt-4 lg:mt-0`}
        >
          <span className="relative flex justify-around items-center w-fit before:g7 g4 min-h-fit px-4 py-2 rounded-2xl before:absolute before:inset-0 before:opacity-0 before:transition-opacity before:duration-500 before:content-[''] group-hover:before:opacity-100  overflow-hidden">
            <Image
              src="/images/download.svg"
              alt="logo"
              width={28}
              height={28}
              className="brightness-200"
            />
            <span className="font-semibold text-16 flex gap-4 p-4 pr-0 text-p5">
              Download
            </span>
          </span>
        </button>
      </div>
      <hr className=' border-s3 border-2' />
      <div className="flex flex-col overflow-hidden text-white rounded-2xl h-fit w-full">
        <div
          className="absolute -z-2 top-1/2 left-1/2 lg:top-[55%] lg:left-[35%] transform -translate-x-1/2 -translate-y-1/2 w-[40%] sm:w-[50%] lg:w-[20%] h-[40%] sm:h-[50%] lg:h-[60%]"
          style={{
            background: "rgba(0, 123, 255, .25)",
            filter: "blur(150px)",
          }}
        ></div>
        <div
          className="absolute -z-2 top-1/2 left-1/2 lg:top-[55%] lg:left-[58%] transform -translate-x-1/2 -translate-y-1/2 w-[40%] sm:w-[50%] lg:w-[20%] h-[40%] sm:h-[50%] lg:h-[60%]"
          style={{
            background: "rgba(0, 123, 255, .25)",
            filter: "blur(150px)",
          }}
        ></div>
        <div
          className="absolute -z-2 top-1/2 left-1/2 lg:top-[55%] lg:left-[82%] transform -translate-x-1/2 -translate-y-1/2 w-[40%] sm:w-[50%] lg:w-[20%] h-[40%] sm:h-[50%] lg:h-[60%]"
          style={{
            background: "rgba(0, 123, 255, .25)",
            filter: "blur(150px)",
          }}
        ></div>


        <div className="w-full pr-0 lg:pr-4 md:mb-4 mb-0">
          <div className="min-h-[200px] rounded-lg p-4 pt-0">
            <div className="flex w-full flex-col justify-center items-center text-center">
              <div className="flex w-full   min-w-fit px-12 py-6 justify-self-center flex-col">
                <div className="flex w-full  justify-between items-center pb-4 gap-4 flex-row">
                  <h3 className="text-[30px] justify-center md:justify-normal flex w-full font-bold md:text-[38px] leading-[110%] text-p5">
                    Upload PDF File
                  </h3>
                  <button
                    disabled={!pages.length > 0 || !previewPdfPages.length > 0}
                    onClick={() => setPreviewOpen((prev) => !prev)}
                    className="flex w-full justify-center md:justify-end disabled:opacity-40 disabled:cursor-not-allowed rounded-2xl group"
                  >
                    <span className="relative px-4  md:px-8 flex justify-around items-center w-fit before:g7 g4 min-h-fit py-2 rounded-2xl before:absolute before:inset-0 before:opacity-0 before:transition-opacity before:duration-500 before:content-[''] group-hover:before:opacity-100 overflow-hidden">
                      <Image
                        src={`${previewOpen ? 'images/eye1.svg' : 'images/eye2.svg'}`}
                        alt="logo"
                        width={28}
                        height={28}
                        className="brightness-200"
                      />
                      <span className="font-semibold text-16 flex gap-4 p-4 pr-0 text-p5">
                        Preview
                      </span>
                    </span>
                  </button>
                </div>
                <div className=' w-full md:mt-3  justify-around flex flex-row'>
                  {/* <Image src="/images/feather.png" className=' w-36 h-auto' width={512} height={512} alt='feather'/>  */}
                  <div
                    onClick={() => document.getElementById('fileInput').click()}
                    className="flex-center min-w-72 md:min-w-full flex h-48 cursor-pointer flex-col gap-5 rounded-[16px] border border-dashed bg-[#7986AC] bg-opacity-20 border-p1 border-opacity-40 justify-center items-center text-white text-center  w-full backdrop-blur-lg  brightness-125 overflow-hidden shadow-[inset_0_0_10px_rgba(0,0,0,1)]"
                  >
                    <div className="rounded-[16px] bg-s0/40 p-5 shadow-sm shadow-purple-200/50">
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
                        className='brightness-125 '
                      />
                    </div>
                    <p className=" font-normal text-[16px] leading-[140%] brightness-75 text-p5">Click here to upload PDF</p>
                  </div>
                  {/* <Image src="/images/feather.png" className=' w-36 h-auto' width={512} height={512} alt='feather' /> */}
                </div>
              </div>

              {previewOpen && (
                <>
                  <div className="bg-p5/5 w-full font-normal p-1  rounded-lg pt-4 flex  cursor-pointer flex-col text-white text-center  backdrop-blur-[12px]   ">
                    <h2 className="font-bold mb-4 text-center text-[30px] leading-[140%] text-p5">
                      Full PDF Preview
                    </h2>

                    {pages.length > 0 ? (
                      <PDFViewer file={previewPdf} />
                    ) : (
                      <div className="font-normal text-[16px] leading-[140%] flex justify-center text-p5">
                        No files uploaded. Upload files to preview and merge.
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="w-full flex flex-col  pt-0 px-4 pb-4  gap-4 lg:w-full">
          {pages.length > 0 && (
            <h2 className="text-[24px]  leading-[140%] text-p5 text-center font-bold  mb-2">
              Uploaded Pages
            </h2>
          )}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {previewPdfPages.map((page, index) => (
              <div
                key={index}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, index)}
                className="bg-gray-800 justify-between border border-gray-700 p-1 rounded-md hover:bg-gray-700 cursor-move flex flex-col items-center shadow transition duration-150 ease-in-out"
              >
                <Image
                  width={111}
                  height={111}
                  src={page.preview}
                  alt={`Page ${index + 1}`}
                  className="w-full h-auto rounded-md mb-2"
                />
                <span className="font-normal text-[12px] leading-[140%] text-p5">
                  PDF {page.pdfIndex + 1} - Page No {page.index}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>

  );
};

export default PdfMerge;
