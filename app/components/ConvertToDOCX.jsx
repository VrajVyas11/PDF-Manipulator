import React, { useState } from 'react';

const ConvertToDOCX = () => {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');

  const handleFileChange = (event) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setMessage('');
    } else {
      setMessage('Please upload a valid PDF file.');
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage('Please select a PDF file to upload.');
      return;
    }

    const formData = new FormData();
    // Change 'pdf' to 'file' to match the server's expected key
    formData.append('file', file);

    try {
      const response = await fetch('/api/docx', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to convert PDF.');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'output.docx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      setMessage('DOCX file created successfully!');
    } catch (error) {
      console.error('Error:', error);
      setMessage('Error occurred while converting PDF.');
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold">PDF to DOCX Converter</h2>
      <input
        type="file"
        accept=".pdf"
        onChange={handleFileChange}
        className="mt-2 mb-4 p-2 border rounded"
      />
      <button
        onClick={handleUpload}
        className="bg-blue-500 text-white p-2 rounded"
      >
        Convert to DOCX
      </button>
      {message && <p className="mt-2">{message}</p>}
    </div>
  );
};

export default ConvertToDOCX;
