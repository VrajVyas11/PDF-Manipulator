import React, { useEffect, useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import dynamic from 'next/dynamic';

const QuillEditor = dynamic(() => import('../utils/QuillEditor'), { ssr: false });
const html2pdf = dynamic(() => import('html2pdf.js'), { ssr: false });

const AddPages = () => {
  const [pdfs, setPdfs] = useState([]);
  const [pages, setPages] = useState([]);
  const [previewPdf, setPreviewPdf] = useState(null);
  const [mergedPdfBytes, setMergedPdfBytes] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editorContent, setEditorContent] = useState('');

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
console.log(pdfIndex, index )
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
    <div className="flex p-6 bg-emerald-100 bg-opacity-50 min-h-fit">
      <div className="w-1/3 pr-4">
        <div className="min-h-[200px] shadow-xl rounded-lg p-4">
          <div
            className={`border-4 border-dashed p-5 rounded-lg w-full max-w-md bg-emerald-200 flex items-center justify-center cursor-pointer transition-transform duration-1000 ease-in-out hover:scale-105 border-emerald-500`}
            onClick={() => document.getElementById('fileInput').click()}
          >
            <input
              id="fileInput"
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={handleFileChange}
            />
            <p className="text-center text-gray-800"> Click to upload</p>
          </div>
          <h2 className="text-lg font-bold text-gray-800 mb-2 mt-10">Uploaded Pages</h2>
          <div className="grid grid-cols-1 gap-4">
            {pages.map((page, index) => (
              <div
                key={index}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, index)}
                className="bg-emerald-300 border border-emerald-400 rounded-md p-3 hover:bg-emerald-200 cursor-move flex justify-between items-center shadow transition duration-150 ease-in-out"
              >
                <span className="text-gray-800">{page.name}</span>
                <button onClick={() => handleRemovePage(index)} className="text-red-400 hover:text-red-300 transition">
                  &times;
                </button>
              </div>
            ))}
          </div>
          <button
            onClick={openDialog}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
          >
            Add Page
          </button>
        </div>
      </div>

      
      <div className="w-2/3">
        <div className="bg-emerald-300 bg-opacity-50 border-double border-emerald-500 border-2 min-h-[200px] shadow-xl rounded-lg p-4 ">
          {pages.length > 0 && (
            <>
              <h2 className="text-lg font-bold text-gray-800 mb-2">PDF Preview</h2>
              <iframe
                src={previewPdf}
                width="100%"
                height="500px"
                title="Preview PDF"
                className="border border-emerald-400 rounded mb-4 shadow-lg"
              />
              <button
                onClick={downloadPdf}
                className="px-6 py-4 w-full bg-blue-500 text-white font-mono shadow-lg tracking-wide rounded-lg hover:bg-blue-600 transition duration-300 font-extrabold ease-in-out disabled:opacity-50"
              >
                Download Page Added PDF
              </button>
            </>
          )}
        </div>
      </div>


   
      {isDialogOpen && (
       <div className="fixed w-screen h-screen inset-0 bg-black bg-opacity-50 flex justify-center items-center">
       <div className="bg-white w-fit h-fit rounded-lg p-6 shadow-lg border border-emerald-400">
         <h2 className="text-xl text-center font-bold mb-4 text-emerald-500">Add Page from Editor</h2>
         <QuillEditor value={editorContent} onChange={setEditorContent} placeholder={"hehe"} />
         <div className="flex justify-end mt-4">
           <button
             onClick={closeDialog}
             className="mr-2 px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition"
           >
             Cancel
           </button>
           <button
             onClick={addPageFromEditor}
             className="px-4 py-2 bg-emerald-500 text-white rounded hover:bg-emerald-600 transition shadow"
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
