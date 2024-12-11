import React, { useEffect, useState, useCallback } from 'react';
import { PDFDocument } from 'pdf-lib';
import dynamic from 'next/dynamic';
const QuillEditor = dynamic(() => import('../../app/utils/tools/QuillEditor'), { ssr: false });
import html2pdf from 'html2pdf.js';
import PDFViewer from "./PDFViewer"
import Image from 'next/image';
import * as pdfjsLib from 'pdfjs-dist/webpack';
import { useToast } from "../../hooks/use-toast"
const AddPages = () => {
  const [pdfs, setPdfs] = useState([]);
  const [pages, setPages] = useState([]);
  const [previewPdf, setPreviewPdf] = useState(null);
  const [mergedPdfBytes, setMergedPdfBytes] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editorContent, setEditorContent] = useState('');
  const [previewPdfPages, setPreviewPdfPages] = useState([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const { toast } = useToast();

  const showToastError = useCallback((message) => {
    toast({
      title: message,
      variant: 'destructive',
      className:
        "font-semibold text-[12px] md:text-[16px] text-red-500 gap-3 w-full py-2 bg-red-500 bg-opacity-20 p-2 md:p-4 rounded-lg border-2 border-red-500 border-opacity-50 backdrop-blur-md",
    });
  },[toast]);

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);

    const invalidFiles = files.filter(file => file.type !== 'application/pdf');

    if (invalidFiles.length > 0) {
      showToastError("Invalid PDF Files. Only PDF files are allowed.");
      return;
    }

    const newPdfs = [...pdfs];

    for (const file of files) {
      const reader = new FileReader();
      reader.onload = async (ev) => {
        const pdfData = ev.target.result;
        newPdfs.push(pdfData);
        await extractPages(pdfData, newPdfs.length - 1);
      };

      reader.readAsArrayBuffer(file);
    }

    setPdfs(newPdfs);

    for (const file of files) {
      const reader = new FileReader();
      reader.onload = async (ev) => {
        const pdfData = ev.target.result;
        await setingPreviewPages(pdfData, newPdfs.length - 1);
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
      showToastError(`Error extracting pages: ${error.message}`);
    }
  };

  const mergePdfs = useCallback(async (mergedPdf = null, newPageBlob = null) => {
    if (!mergedPdf) {
      mergedPdf = await PDFDocument.create();
    }
    if (pdfs.length === 0 || pages.length === 0) return;
    try {
      for (const page of pages) {
        const { pdfIndex, index } = page;
        if (pdfIndex < 0 || pdfIndex >= pdfs.length) {
          console.error(`Invalid pdfIndex: ${pdfIndex}`);
          continue;
        }
        const pdfDoc = await PDFDocument.load(pdfs[pdfIndex]);
        const pageCount = pdfDoc.getPageCount();
        if (index < 0 || index >= pageCount) {
          console.error(`Invalid page index: ${index} for pdfIndex: ${pdfIndex} (total pages: ${pageCount})`);
          continue;
        }
        const copiedPages = await mergedPdf.copyPages(pdfDoc, [index]);
        mergedPdf.addPage(copiedPages[0]);
      }
      if (newPageBlob) {
        const newPdfDoc = await PDFDocument.load(newPageBlob);
        const copiedPages = await mergedPdf.copyPages(newPdfDoc, [0]);
        mergedPdf.addPage(copiedPages[0]);
      }
      const pdfBytes = await mergedPdf.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      setPreviewPdf(URL.createObjectURL(blob));
      setMergedPdfBytes(pdfBytes);
    } catch (error) {
      showToastError(`Error merging PDFs: ${error.message}`);
    }
  }, [pdfs, pages, showToastError]);

  const addPageFromEditor = async () => {
    const element = document.createElement('div');
    element.innerHTML = editorContent;
    element.style.lineHeight = '1.5';
    element.style.fontSize = '16pt';
    element.style.margin = '20px';
    var opt = {
      margin: 1,
      filename: 'myfile.pdf',
      image: { type: 'jpeg', quality: 1 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'A4', orientation: 'portrait' },
    };
    try {
      const pdfBlob = await html2pdf().set(opt).from(element).output('blob');
      if (pdfBlob instanceof Blob) {
        const reader = new FileReader();
        reader.onloadend = () => {
          const arrayBuffer = reader.result;
          setPages((prevPages) => [
            ...prevPages,
            { index: 0, pdfIndex: pdfs.length, name: 'Newly Created Page' },
          ]);
          setPdfs((prev) => [...prev, arrayBuffer]);
          mergePdfs(null, arrayBuffer);
          closeDialog();
        };
        const arrayBuffer = await pdfBlob.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        const page = await pdf.getPage(1);
        const viewport = page.getViewport({ scale: 1 });
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        await page.render({ canvasContext: context, viewport }).promise;
        const image = canvas.toDataURL("image/png");
        setPreviewPdfPages((prevPages) => [
          ...prevPages,
          {
            index: 0,
            pdfIndex: pdfs.length,
            name: 'Newly Created Page',
            preview: image,
          },
        ]);
        reader.readAsArrayBuffer(pdfBlob);
      } else {
        console.error('Generated PDF is not a valid Blob:', pdfBlob);
      }
    } catch (error) {
      console.error('Error adding page from editor:', error);
      showToastError('Error adding page from editor.');
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


  useEffect(() => {
    if (pages.length > 0) {
      mergePdfs();
    }
  }, [pages, mergePdfs, previewPdfPages]);

  useEffect(() => {
    mergePdfs();
  }, [mergePdfs, previewPdfPages])

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
  // const handleRemovePage = (index) => {
  //   setPages((prevPages) => prevPages.filter((_, i) => i !== index));
  //   mergePdfs();
  // };
  const openDialog = () => {
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
  };

  return (
    <div className="flex  flex-col w-full ">
      <div className="flex flex-col lg:px-0 lg:flex-row justify-center mt-5 mb-10 items-center w-full">
        <div className="flex flex-col  md:pl-4 w-full text-center lg:text-left">
          <h2 className="text-[30px] font-bold md:text-[38px] leading-[110%] text-p4">Add Pages to PDF</h2>
          <p className="font-normal text-[16px] leading-[140%] mt-4 text-p5">
            Easily add new pages to your PDF with a seamless drag-and-drop interface.
          </p>

        </div>
        <button
          disabled={!pages.length > 0 || isDialogOpen}
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

        {!isDialogOpen && (
          <>
            <div className="w-full pr-0 lg:pr-4 md:mb-4 mb-0">
              <div className="min-h-[200px] rounded-lg p-4 pt-0">
                <div className="flex w-full flex-col justify-center items-center text-center">
                  <div className="flex w-full   min-w-fit px-12 py-6 justify-self-center flex-col">
                    <div className="flex w-full  justify-between items-center pb-4 gap-4 flex-col md:flex-row">
                      <h3 className="text-[30px] justify-center md:justify-normal  flex w-full font-bold md:text-[38px] leading-[110%] text-p5">
                        Upload PDF File
                      </h3>
                      <div className='w-full flex flex-row'>
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
                        { pdfs.length > 0 && (
                          <button
                            disabled={!pages.length > 0 || !previewPdfPages.length > 0}
                            onClick={openDialog}
                            className="flex w-full disabled:opacity-40 disabled:cursor-not-allowed justify-end rounded-2xl group"
                          >
                            <span className="relative px-4  md:px-8 flex justify-around items-center w-fit before:g7 g4 min-h-fit py-2 rounded-2xl before:absolute before:inset-0 before:opacity-0 before:transition-opacity before:duration-500 before:content-[''] group-hover:before:opacity-100 overflow-hidden">
                              <Image
                                src={`/addpages.svg`}
                                alt="logo"
                                width={28}
                                height={28}
                                className="brightness-200"
                              />
                              <span className="font-semibold text-16 flex gap-4 p-4 pr-0 text-p5">
                                Add Page
                              </span>
                            </span>
                          </button>
                        )}
                      </div>
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
          </>)}
      </div>

      {isDialogOpen && (
        <div className=" w-full  h-full flex items-start justify-center">
          <div className="w-full h-full flex flex-col p-3  rounded-xl">
            <div className="flex w-full  justify-between items-center pb-4 gap-4 flex-col md:flex-row">
              <h3 className="text-[30px] flex justify-center md:justify-normal w-full font-bold md:text-[38px] leading-[110%] text-p5">
                Add Page Dialog
              </h3>
              <div className="flex items-center justify-between gap-4">
                <button
                  onClick={closeDialog}
                  className={`flex w-full flex-row  justify-center rounded-2xl group mt-4`}
                >
                  <span className="relative min-w-36 md:min-w-40 before:g7  min-h-fit px-4  overflow-hidden flex  gap-3 w-full justify-center py-2 items-center bg-red-500  bg-opacity-20 p-2  rounded-2xl border-2 border-red-500 border-opacity-50 backdrop-blur-md">
                    <Image
                      src="/images/close.svg"
                      alt="logo"
                      width={28}
                      height={28}
                      style={{ filter: 'hue-rotate(90deg)' }}
                      className="brightness-200 "
                    />

                    <span className="font-semibold text-[18px] flex w-full gap-4 p-3 pr-0 text-red-400">
                      Close
                    </span>
                  </span>
                </button>
                <button
                  onClick={addPageFromEditor}
                  className={`flex w-full disabled:opacity-40 disabled:cursor-not-allowed justify-center lg:justify-center rounded-2xl group mt-4 `}
                >
                  <span className="relative min-w-36 md:min-w-40 before:g7  min-h-fit px-4  overflow-hidden flex  gap-3 w-full justify-center py-2 items-center bg-green-500  bg-opacity-20 p-2  rounded-2xl border-2 border-green-500 border-opacity-50 backdrop-blur-md">
                    <Image
                      src="/images/plus.svg"
                      alt="logo"
                      width={28}
                      height={28}
                      style={{ filter: 'hue-rotate(270deg)' }}
                      className="brightness-200"
                    />
                    <span className="font-semibold text-[18px] flex w-full gap-4 p-3 pr-0 text-green-400">
                      Add
                    </span>
                  </span>
                </button>
              </div>
            </div>
            <div className="h-full  flex  w-full">
              <QuillEditor
                value={editorContent}
                onChange={setEditorContent}
                classes={" h-full w-full bg-opacity-50   overflow-hidden flex flex-col"}
                placeholder="Start typing to create a new page..."
              />
            </div>

          </div>
        </div>
      )}

    </div>

  );
};
export default AddPages;
