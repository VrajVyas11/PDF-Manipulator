import React, { useEffect, useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import dynamic from 'next/dynamic';
const QuillEditor = dynamic(() => import('../utils/QuillEditor'), { ssr: false });
import html2pdf from 'html2pdf.js';
const AddPages = () => {
  const [pdfs, setPdfs] = useState([]);
  const [pages, setPages] = useState([]);
  const [previewPdf, setPreviewPdf] = useState(null);
  const [mergedPdfBytes, setMergedPdfBytes] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editorContent, setEditorContent] = useState('');
  const [isContinueClicked, setIsContinueClicked] = useState(false);
  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    const newPdfs = [];
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
    setIsContinueClicked(true);
  };
  const extractPages = async (pdfData, pdfIndex) => {
    try {
      const pdfDoc = await PDFDocument.load(pdfData);
      const pageCount = pdfDoc.getPageCount();
      console.log(`PDF Index: ${pdfIndex}, Page Count: ${pageCount}`); // Log page count for each PDF
      const extractedPages = Array.from({ length: pageCount }, (_, index) => ({
        index,
        pdfIndex,
        name: `Uploaded PDF page: ${index + 1}`,
      }));
      setPages((prevPages) => [...prevPages, ...extractedPages]);
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
  }, [pages]);
  const mergePdfs = async (mergedPdf = null, newPageBlob = null) => {
    if (!mergedPdf) {
      mergedPdf = await PDFDocument.create();
    }
    if (pdfs.length === 0 || pages.length === 0) return;
    try {
      for (const page of pages) {
        const { pdfIndex, index } = page;
        console.log(pdfIndex, index)
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
        console.log(copiedPages)
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
  const handleRemovePage = (index) => {
    setPages((prevPages) => prevPages.filter((_, i) => i !== index));
    mergePdfs();
  };
  const openDialog = () => {
    setIsDialogOpen(true);
  };
  const closeDialog = () => {
    setIsDialogOpen(false);
  };
  const addPageFromEditor = async () => {
    const element = document.createElement('div');
    element.innerHTML = editorContent;
    // Apply styles directly to the element
    element.style.lineHeight = '1.5'; // Adjust this value as needed
    element.style.fontSize = '12pt'; // Example font size, adjust as necessary
    element.style.margin = '20px'; // Optional margin to ensure content isn't too close to the edges
    console.log(editorContent);
    var opt = {
      margin: 1,
      filename: 'myfile.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' },
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
        reader.readAsArrayBuffer(pdfBlob);
      } else {
        console.error('Generated PDF is not a valid Blob:', pdfBlob);
      }
    } catch (error) {
      console.error('Error adding page from editor:', error);
    }
  };
  return (
    <div className=" flex justify-self-center mb-16 w-[95%] h-fit justify-center items-center flex-col">
      <h2 className="text-white text-3xl  rounded-b-none border-[1px] border-gray-200   text-center  p-5  h-fit w-full backdrop-blur-lg  bg-opacity-90  rounded-3xl bg-[#1a1a1a]  overflow-hidden  font-extrabold  tracking-wider  shadow-[inset_0_0_30px_rgba(0,0,0,1)]">Add New Pages</h2>

      <div className="flex border-[1px] border-t-0 border-gray-200  backdrop-blur-lg shadow-black bg-opacity-40 rounded-3xl  p-5  bg-[#292828]   overflow-hidden   text-center font-extrabold  tracking-wider shadow-[inset_0_0_10px_rgba(0,0,0,1)] text-white h-fit w-full  rounded-t-none     ">

        <div className="w-1/3 pr-4">
          <div className="min-h-[200px] shadow-xl rounded-lg p-4 bg-gray-900 border border-gray-800">
            <div
              className={`border-4 border-dashed p-5 ${pages.length < 0 ? "h-fit" : "h-[175px]"} rounded-lg w-full max-w-md bg-gray-800 flex items-center justify-center cursor-pointer transition-transform duration-300 ease-in-out hover:scale-105 hover:border-blue-700`}
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
              <p className="text-center text-gray-400">Click to upload</p>
            </div>
            {pages.length > 0 && <h2 className="text-lg font-bold text-gray-400 mb-2 mt-10">Uploaded Pages</h2>}
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
                  <span className="text-gray-400">{page.name}</span>
                </div>
              ))}
            </div>

            {/* {isContinueClicked && pdfs.length>0 && ( */}
              <button
              onClick={openDialog}
              className="px-6 py-4 w-fit mt-4 bg-blue-500 text-white font-mono shadow-lg tracking-wide rounded-lg hover:bg-blue-600 transition duration-300 font-extrabold ease-in-out disabled:opacity-50"
            >
              Add Page
            </button>
            {/* )
} */}
          </div>
        </div>


        <div className="w-full md:w-2/3">
          <div className="bg-gray-900 bg-opacity-70 border border-gray-800 min-h-[200px] shadow-2xl rounded-xl p-6">
            {pages.length > 0 ? (
              <>
                <h2 className="text-lg font-bold text-gray-300 mb-4">PDF Preview</h2>
                <iframe
                  src={previewPdf}
                  width="100%"
                  height="400px"
                  title="Preview PDF"
                  className="border border-gray-700 rounded-lg mb-6 shadow-lg"
                />
                <button
                  onClick={downloadPdf}
                  className="px-6 py-3 w-full bg-blue-600 text-white font-mono shadow-lg tracking-wide rounded-lg hover:bg-blue-700 transition duration-300 font-extrabold ease-in-out disabled:opacity-50"
                >
                  Download PDF with added pages
                </button>
              </>
            ) : (
              <div className="flex items-center justify-center text-gray-400 text-center h-full">
                No files uploaded. Upload files to preview and merge.
              </div>
            )}
          </div>
        </div>
      </div>
      {isDialogOpen && (
  <div className="fixed top-0 left-0 flex justify-center items-center w-screen h-screen bg-black bg-opacity-90">
  <div className="text-white border-[1px] px-6 py-8 border-gray-800 text-center h-fit w-[90%] md:w-[60%] backdrop-blur-xl bg-opacity-95 rounded-2xl bg-[#121212] overflow-hidden shadow-[0px_8px_30px_rgba(0,0,0,0.8)]">
    <h1 className="text-3xl text-blue-400 border-b-[1px] border-gray-700 w-full pb-4 font-bold uppercase tracking-widest mb-8 text-center">
      Add Content to Page
    </h1>
    <div className="px-4">
      <QuillEditor
        value={editorContent}
        onChange={setEditorContent}
        placeholder={"Start writing..."}
        className="bg-[#1f1f1f] text-white rounded-lg shadow-[0_0_10px_rgba(0,0,0,0.5)]"
      />
    </div>
    <div className="flex justify-between items-center px-6 mt-8">
      <button
        onClick={closeDialog}
        className="px-10 py-5 w-fit border-2 border-blue-500 text-white font-mono shadow-lg tracking-wide rounded-lg hover:bg-gray-500 hover:text-black hover:border-black transition duration-300 font-bold ease-in-out disabled:opacity-50"
      >
        Cancel
      </button>
      <button
        onClick={addPageFromEditor}
        className="px-8 py-5 w-fit bg-blue-600 text-white font-mono shadow-lg tracking-wide rounded-lg hover:bg-blue-700 transition duration-300 font-bold ease-in-out disabled:opacity-50"
      >
        Add Page
      </button>
    </div>
  </div>
</div>


)}
    </div>
  );
};
export default AddPages;
