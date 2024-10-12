import React, { useState, useRef } from 'react';
import { PDFDocument } from 'pdf-lib'; 
import { saveAs } from 'file-saver'; 

const PDFCompressor = () => {
  const [pdfFiles, setPdfFiles] = useState([]);
  const [compressionQuality, setCompressionQuality] = useState(0.5);
  const [compressedPdfBlob, setCompressedPdfBlob] = useState(null);
  const pdfInputRef = useRef(null);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const validPdfs = files.filter((file) => file.type === 'application/pdf');
    setPdfFiles(validPdfs);
  };

  const handleCompressionQualityChange = (e) => {
    setCompressionQuality(Number(e.target.value));
  };

  const compressPDF = async () => {
    if (pdfFiles.length === 0) {
      alert('Please select PDF files to compress.');
      return;
    }

    const pdfDoc = await PDFDocument.create();

    for (const file of pdfFiles) {
      const reader = new FileReader();

      reader.onload = async (event) => {
        const existingPdfBytes = new Uint8Array(event.target.result);
        const existingPdfDoc = await PDFDocument.load(existingPdfBytes);

        const pages = await pdfDoc.copyPages(existingPdfDoc, existingPdfDoc.getPageIndices());
        pages.forEach((page) => pdfDoc.addPage(page));
      };

      reader.readAsArrayBuffer(file);
    }

    const compressedPdfBytes = await pdfDoc.save();
    const compressedPdfBlob = new Blob([compressedPdfBytes], { type: 'application/pdf' });
    setCompressedPdfBlob(compressedPdfBlob);
    resetInput();
  };

  const resetInput = () => {
    pdfInputRef.current.value = '';
    setPdfFiles([]);
  };

  const previewPDF = () => {
    if (compressedPdfBlob) {
      const url = URL.createObjectURL(compressedPdfBlob);
      window.open(url, '_blank');
    }
  };

  const downloadPDF = () => {
    if (compressedPdfBlob) {
      saveAs(compressedPdfBlob, `compressed_${compressionQuality}.pdf`);
    }
  };

  return (
    <div style={{ textAlign: 'center', backgroundColor: '#fefefe', padding: '20px' }}>
      <h1>Compress PDF - Smaller PDFs in your browser!</h1>
      <input
        type="file"
        ref={pdfInputRef}
        accept="application/pdf"
        multiple
        onChange={handleFileChange}
        style={{
          margin: '10px',
          padding: '10px',
          borderRadius: '10px',
          border: '1px solid rgba(255, 99, 71, 0.5)',
        }}
      />
      <div>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={compressionQuality}
          onChange={handleCompressionQualityChange}
        />
        <span>{compressionQuality}</span>
      </div>
      <button
        onClick={compressPDF}
        style={{
          margin: '10px',
          padding: '10px',
          borderRadius: '15px',
          background: 'rgba(255, 99, 71, 0.2)',
          border: '1px solid rgba(255, 99, 71, 0.5)',
          cursor: 'pointer',
        }}
      >
        Compress PDF
      </button>
      <button
        onClick={previewPDF}
        style={{
          margin: '10px',
          padding: '10px',
          borderRadius: '15px',
          background: 'rgba(100, 149, 237, 0.2)',
          border: '1px solid rgba(100, 149, 237, 0.5)',
          cursor: 'pointer',
        }}
        disabled={!compressedPdfBlob}
      >
        Preview PDF
      </button>
      <button
        onClick={downloadPDF}
        style={{
          margin: '10px',
          padding: '10px',
          borderRadius: '15px',
          background: 'rgba(34, 139, 34, 0.2)',
          border: '1px solid rgba(34, 139, 34, 0.5)',
          cursor: 'pointer',
        }}
        disabled={!compressedPdfBlob}
      >
        Download PDF
      </button>
      <div>
        {pdfFiles.map((file, index) => (
          <p key={index}>{file.name}</p>
        ))}
      </div>
    </div>
  );
};

export default PDFCompressor;
