import React, { useEffect, useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import PDFViewer from "./PDFViewer"
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

  useEffect(() => {
    if (pages.length > 0) {
      mergePdfs();
    }
  }, [pages,mergePdfs]);

  const mergePdfs = async () => {
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
  };


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

  useEffect(() => {
    mergePdfs();
  }, [count]);

  return (
    <div className="flex justify-self-center mb-16 w-full sm:w-[95%] lg:w-[90%] h-fit justify-center items-center flex-col">
      <h2 className="text-white text-2xl sm:text-3xl rounded-b-none border-[1px] border-gray-200 text-center p-4 sm:p-5 h-fit w-full backdrop-blur-lg bg-opacity-90 rounded-3xl bg-[#1a1a1a] overflow-hidden font-extrabold tracking-wider shadow-[inset_0_0_30px_rgba(0,0,0,1)]">
        Merge PDF
      </h2>

      <div className="flex flex-col lg:flex-row border-[1px] border-t-0 border-gray-200 backdrop-blur-lg shadow-black bg-opacity-40 rounded-3xl p-4 sm:p-5 bg-[#292828] overflow-hidden text-center font-extrabold tracking-wider shadow-[inset_0_0_10px_rgba(0,0,0,1)] text-white h-fit w-full rounded-t-none">
        <div className="w-full lg:w-1/3 pr-0 lg:pr-4 mb-4 lg:mb-0">
          <div className="min-h-[200px] shadow-xl rounded-lg p-4 bg-gray-900 border border-gray-800">
            <div
              className={`border-4 border-dashed p-4 sm:p-5 ${pages.length > 0 ? 'h-fit' : 'h-[175px]'
                } rounded-lg w-full bg-gray-800 flex items-center justify-center cursor-pointer transition-transform duration-300 ease-in-out hover:scale-105 hover:border-blue-700`}
              onClick={() => document.getElementById('fileInput').click()}
            >
              <input
                id="fileInput"
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={handleFileChange}
                multiple
              />
              <p className="text-center text-gray-400 text-sm sm:text-base">
                Click to upload
              </p>
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

        <div className="w-full lg:w-2/3">
          <div className="bg-gray-900 font-normal bg-opacity-70 border border-gray-800 min-h-[200px] shadow-2xl rounded-xl p-4 sm:p-6">
            {pages.length > 0 ? (
              <>
                <h2 className="text-sm sm:text-lg font-bold text-gray-300 mb-4">
                  PDF Preview
                </h2>
                <PDFViewer file={previewPdf} />
                <button
                  onClick={downloadPdf}
                  className="px-4 sm:px-6 py-2 sm:py-3 mt-4 w-full bg-blue-600 text-white font-mono shadow-lg tracking-wide rounded-lg hover:bg-blue-700 transition duration-300 font-extrabold ease-in-out disabled:opacity-50"
                >
                  Download Merged PDF
                </button>
              </>
            ) : (
              <div className="flex items-center justify-center text-gray-400 text-sm sm:text-base text-center h-full">
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
