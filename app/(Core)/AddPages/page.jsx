"use client"
import { useEffect, useState, useCallback } from 'react';
import { PDFDocument } from 'pdf-lib';
import dynamic from 'next/dynamic';
const QuillEditor = dynamic(() => import('../../../components/Core/QuillEditor'), { ssr: false });
// import html2pdf from 'html2pdf.js';
import Image from 'next/image';
import { useToast } from "../../../hooks/use-toast"
import { Layers } from 'lucide-react';

const PDFViewer = dynamic(() => import("../../../components/Core/PDFViewer"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-64 bg-gray-800/50 rounded-lg">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm text-gray-400">Loading PDF viewer...</p>
      </div>
    </div>
  )
});
const AddPages = () => {
  const [pdfjsLib, setPdfjsLib] = useState(null);
  const [html2pdf, setHtml2pdf] = useState(null);
  const [pdfs, setPdfs] = useState([]);
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [previewPdf, setPreviewPdf] = useState(null);
  const [mergedPdfBytes, setMergedPdfBytes] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editorContent, setEditorContent] = useState('');
  const [previewPdfPages, setPreviewPdfPages] = useState([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    import('pdfjs-dist/webpack').then((mod) => {
      setPdfjsLib(mod);
    });

    // load html2pdf defensively
    import('html2pdf.js')
      .then((mod) => {
        const candidate = mod.default || mod.html2pdf || mod;
        if (typeof candidate === 'function') {
          // store factory function
          setHtml2pdf(() => candidate);
        } else {
          console.warn('Unexpected html2pdf shape:', mod);
          setHtml2pdf(() => null);
        }
      })
      .catch((err) => {
        console.warn('Failed to load html2pdf.js', err);
        setHtml2pdf(() => null);
      });
  }, []);
  const showToastError = useCallback((message) => {
    toast({
      variant: "destructive",
      title: (
        <div className="flex items-center w-full gap-3">
          {/* subtle check icon */}
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-red-400 flex-shrink-0" viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true">
            <path fillRule="evenodd" d="M6.99486 7.00636C6.60433 7.39689 6.60433 8.03005 6.99486 8.42058L10.58 12.0057L6.99486 15.5909C6.60433 15.9814 6.60433 16.6146 6.99486 17.0051C7.38538 17.3956 8.01855 17.3956 8.40907 17.0051L11.9942 13.4199L15.5794 17.0051C15.9699 17.3956 16.6031 17.3956 16.9936 17.0051C17.3841 16.6146 17.3841 15.9814 16.9936 15.5909L13.4084 12.0057L16.9936 8.42059C17.3841 8.03007 17.3841 7.3969 16.9936 7.00638C16.603 6.61585 15.9699 6.61585 15.5794 7.00638L11.9942 10.5915L8.40907 7.00636C8.01855 6.61584 7.38538 6.61584 6.99486 7.00636Z" />
          </svg>
          <div className="text-left ">
            <div className="text-sm md:text-base font-semibold text-red-100">
              {message}
            </div>
          </div>
        </div>
      ),
      className:
        "flex items-center justify-between gap-3 w-full max-w-[640px] bg-gradient-to-r from-slate-900/60 to-slate-800/40 border border-red-500/10 p-3 md:p-4 rounded-2xl shadow-lg backdrop-blur-md",
    });
  }, [toast]);


  // Convert ArrayBuffer to base64 string
  const arrayBufferToBase64 = (buffer) => {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  };

  // Convert base64 string back to Uint8Array
  const base64ToUint8Array = (base64) => {
    const binaryString = window.atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  };

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    const invalidFiles = files.filter(file => file.type !== 'application/pdf');
    if (invalidFiles.length > 0) {
      showToastError("Invalid PDF Files. Only PDF files are allowed.");
      return;
    }

    setLoading(true);

    try {
      const pdfjsLib = await import("pdfjs-dist/webpack")

      const newPdfs = [];
      const newPages = [];
      const newPreviewPages = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const arrayBuffer = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = () => reject(reader.error);
          reader.readAsArrayBuffer(file);
        });

        // Convert to base64 string
        const base64String = arrayBufferToBase64(arrayBuffer);
        newPdfs.push(base64String);

        // Convert back to Uint8Array for pdf-lib and pdfjs
        const uint8Array = base64ToUint8Array(base64String);

        // Extract pages info
        const pdfDoc = await PDFDocument.load(uint8Array);
        const pageCount = pdfDoc.getPageCount();
        const extractedPages = Array.from({ length: pageCount }, (_, index) => ({
          index,
          pdfIndex: i,
          name: `PDF ${i + 1} Page ${index + 1}`,
        }));
        newPages.push(...extractedPages);

        // Extract preview pages using pdfjs
        const pdf = await pdfjsLib.getDocument({ data: uint8Array }).promise;
        for (let j = 1; j <= pageCount; j++) {
          const page = await pdf.getPage(j);
          const viewport = page.getViewport({ scale: 1 });
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          await page.render({ canvasContext: context, viewport }).promise;
          const image = canvas.toDataURL('image/png');

          newPreviewPages.push({
            index: j - 1,
            pdfIndex: i,
            name: `PDF ${i + 1} Page ${j}`,
            preview: image,
          });
        }
      }

      setPdfs(newPdfs);
      setPages(newPages);
      setPreviewPdfPages(newPreviewPages);
    } catch (error) {
      showToastError(`Error processing files: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const mergePdfs = useCallback(async () => {
    if (pdfs.length === 0 || pages.length === 0) return;

    try {
      const mergedPdf = await PDFDocument.create();

      for (const page of pages) {
        const { pdfIndex, index } = page;
        const base64String = pdfs[pdfIndex];
        if (!base64String) {
          console.error(`No PDF data for index ${pdfIndex}`);
          continue;
        }
        const uint8Array = base64ToUint8Array(base64String);

        const pdfDoc = await PDFDocument.load(uint8Array);
        const pageCount = pdfDoc.getPageCount();
        if (index < 0 || index >= pageCount) {
          console.error(`Invalid page index ${index} for pdfIndex ${pdfIndex}`);
          continue;
        }
        const [copiedPage] = await mergedPdf.copyPages(pdfDoc, [index]);
        mergedPdf.addPage(copiedPage);
      }

      const pdfBytes = await mergedPdf.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      setPreviewPdf(URL.createObjectURL(blob));
      setMergedPdfBytes(pdfBytes);
    } catch (error) {
      showToastError(`Error merging PDFs: ${error.message}`);
    }
  }, [pdfs, pages, showToastError]);

  // --- MINIMAL CHANGE: ensure addPageFromEditor stores base64 (not ArrayBuffer) ---
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
      // ensure html2pdf is available; load inline if not
      let h2p = html2pdf;
      if (!h2p) {
        const mod = await import('html2pdf.js');
        h2p = mod.default || mod.html2pdf || mod;
        if (typeof h2p !== 'function') {
          throw new Error('html2pdf import did not return a function');
        }
        setHtml2pdf(() => h2p);
      }

      // call the function factory
      const pdfBlob = await h2p().set(opt).from(element).output('blob');

      if (pdfBlob instanceof Blob) {
        // convert blob -> arrayBuffer
        const arrayBuffer = await pdfBlob.arrayBuffer();

        // convert to base64 to keep pdfs array consistent with handleFileChange
        const base64String = arrayBufferToBase64(arrayBuffer);

        // preview image generation using pdfjsLib (if present)
        if (pdfjsLib) {
          try {
            const pdf = await pdfjsLib.getDocument({ data: base64ToUint8Array(base64String) }).promise;
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
          } catch (err) {
            console.warn("Failed to create preview for new page:", err);
          }
        }

        // store base64 string (consistent with handleFileChange)
        setPages((prevPages) => [
          ...prevPages,
          { index: 0, pdfIndex: pdfs.length, name: 'Newly Created Page' },
        ]);
        setPdfs((prev) => [...prev, base64String]);

        // call mergePdfs after state updates via effect that watches pages
        closeDialog();
      } else {
        console.error('Generated PDF is not a valid Blob:', pdfBlob);
      }
    } catch (error) {
      console.error('Error adding page from editor:', error);
      showToastError('Error adding page from editor.');
    }
  };

  const handleDrop = useCallback((event, targetIndex) => {
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
  }, [pages]);


  useEffect(() => {
    if (pages.length > 0) {
      mergePdfs();
    }
  }, [pages, mergePdfs]); // removed duplicate previewPdfPages dependency to avoid double runs

  // removed the duplicated useEffect that called mergePdfs()

  const handleDragStart = (event, index) => {
    event.dataTransfer.setData('text/plain', index);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const downloadPdf = useCallback(async () => {
    if (mergedPdfBytes) {
      try {
        const blob = new Blob([mergedPdfBytes])
        const fileSaver = await import("file-saver");
        fileSaver?.saveAs(blob, `Modified.pdf`);
      } catch (error) {
        console.error("Download failed:", error);
        showToastError("Download failed. Please try again.");
      }
    }
  }, [mergedPdfBytes, showToastError]);

  const openDialog = () => {
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
  };


  useEffect(() => {
    if (pdfs.length > 0) {
      setLoading(true)
    }
    else if (pdfs && pages.length > 0 && previewPdfPages.length > 0) {
      setLoading(false)
    }
  }, [loading, pdfs, pages, previewPdfPages])


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
          className={`flex min-w-fit w-fit md:pr-4 disabled:opacity-40 disabled:cursor-not-allowed justify-center lg:justify-end rounded-2xl group mt-4 lg:mt-0`}
        >
          <span className="relative flex justify-around items-center w-fit before:g7 g4 min-h-fit px-4 py-2 rounded-2xl before:absolute before:inset-0 before:opacity-0 before:transition-opacity before:duration-500 before:content-[''] group-hover:before:opacity-100  overflow-hidden">
            <Image
              src="/images/ButtonUtils/download.svg"
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
             <div className="w-full pr-0  lg:pr-4 md:mb-4 mb-0">
          <div className="min-h-[200px] rounded-lg p-4 pt-0">
            <div className="flex w-full flex-col justify-center items-center text-center">
              <div className="flex w-full   min-w-fit px-3 md:px-12 py-6 justify-self-center flex-col">
                <div className="flex w-full  justify-between items-center pb-4 flex-row">
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
                              src={`${previewOpen ? 'images/ButtonUtils/eye1.svg' : 'images/ButtonUtils/eye2.svg'}`}
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
                        {pdfs.length > 0 && (
                          <button
                            disabled={!pages.length > 0 || !previewPdfPages.length > 0}
                            onClick={openDialog}
                            className="flex w-full disabled:opacity-40 disabled:cursor-not-allowed justify-end rounded-2xl group"
                          >
                            <span className="relative px-4  md:px-8 flex justify-around items-center w-fit before:g7 g4 min-h-fit py-2 rounded-2xl before:absolute before:inset-0 before:opacity-0 before:transition-opacity before:duration-500 before:content-[''] group-hover:before:opacity-100 overflow-hidden">
                              <Image
                                src={`images/options/addpages.svg`}
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
                            src="/images/ButtonUtils/add.svg"
                            alt="Add Image"
                            width={24}
                            height={24}
                            className='brightness-125 '
                          />
                        </div>
                        <p className=" font-normal text-[16px] leading-[140%] brightness-75 text-p5">Click here to upload PDF</p>
                      </div>
                    </div>
                  </div>

                  {previewOpen && (
                    <div className='px-3 w-full md:px-12'>
                      <div className="mt-2 mb-4 w-full text-center  md:px-0 pt-3 bg-gray-900/30 border border-gray-700/50 rounded-xl shadow-2xl backdrop-blur-lg">
                        <div className='flex flex-row pb-4 px-12 justify-between items-center'>
                          <div className="flex-1">
                            <h3 className="text-2xl md:text-3xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-gray-100 to-gray-300 tracking-tight">
                              PDF Preview
                            </h3>
                            <p className="text-sm text-gray-400 mt-1">Review your document before processing</p>
                          </div>
                          <button
                            disabled={!pages.length || !previewPdfPages.length}
                            onClick={() => setPreviewOpen((prev) => !prev)}
                            className="ml-4 disabled:opacity-30 disabled:cursor-not-allowed transition-opacity"
                            aria-label="Close preview"
                          >
                            <span className="flex items-center justify-center w-10 h-10 rounded-full bg-red-600/60 hover:bg-red-600/70 backdrop-blur-lg border border-red-700 text-gray-300 hover:text-white transition-colors">
                              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                              </svg>
                            </span>
                          </button>
                        </div>

                        {pages.length > 0 ? (
                          <div className="overflow-hidden">
                            <PDFViewer file={previewPdf} />
                          </div>
                        ) : (
                          <div className="py-12 text-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto text-gray-500">
                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                              <polyline points="14 2 14 8 20 8"></polyline>
                              <line x1="16" y1="13" x2="8" y2="13"></line>
                              <line x1="16" y1="17" x2="8" y2="17"></line>
                              <polyline points="10 9 9 9 8 9"></polyline>
                            </svg>
                            <p className="mt-4 text-gray-400 font-medium">No files uploaded</p>
                            <p className="text-sm text-gray-500 mt-1">Upload PDFs to preview and merge</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="w-full flex flex-col px-6 md:px-16 pb-8 gap-6 lg:w-full">
              {pages.length > 0 && (
                <h2 className="text-2xl md:text-3xl flex flex-col md:flex-row justify-start items-center md:gap-4  font-extrabold text-center text-p5 mb-4">
                  <span className=' flex items-center gap-4'><Layers className='w-8 h-8' /> Uploaded Pages </span><span className=' text-lg mt-1 tracking-wider  flex items-center'>( Total pages : {previewPdfPages.length} )</span>

                </h2>
              )}
              {pdfs && pages.length > 0 && previewPdfPages.length > 0 ? (
                <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {previewPdfPages.map((page, index) => (
                    <div
                      key={index}
                      draggable
                      onDragStart={(e) => handleDragStart(e, index)}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, index)}
                      className="bg-blue-900/20 border rounded-2xl border-gray-600  p-2 flex flex-col items-center shadow-md hover:bg-gray-700/80 cursor-move transition-colors duration-200"
                    >
                      <Image
                        width={120}
                        height={160}
                        src={page.preview}
                        alt={`Page ${index + 1}`}
                        className="w-full h-auto rounded-xl mb-3 object-cover"
                      />
                      <span className="text-xs md:text-sm text-p5 text-center opacity-90">
                        PDF {page.pdfIndex + 1} - Page {page.index + 1}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                loading && (
                  <div className="flex justify-center">
                    <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )
              )}
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
                      src="/images/ButtonUtils/close.svg"
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
                      src="/images/ButtonUtils/plus.svg"
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