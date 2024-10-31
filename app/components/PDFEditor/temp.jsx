import React, { useState } from 'react';

const UploadPdfComponent = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [images, setImages] = useState([]);
  const [error, setError] = useState(null);

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setError(null);
    }
  };

  const handleUpload = () => {
    if (!selectedFile) {
      setError('Please select a PDF file to upload.');
      return;
    }

    const formData = new FormData();
    formData.append('pdf', selectedFile);

    fetch('/api/ExtractImages', {
      method: 'POST',
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          const base64Images = data.images.map((image) => {
            const imageData = image.data;

            // Convert imageData object into an array
            const byteNumbers = Object.values(imageData);
            const byteArray = new Uint8Array(byteNumbers);

            // Convert byteArray to a Base64 string
            const base64String = btoa(Uint8ToString(byteArray));

            return `data:image/jpeg;base64,${base64String}`;
          });

          setImages(base64Images);
          setError(null);
        }
      })
      .catch((err) => {
        console.error('Error uploading file:', err);
        setError('Error uploading file.');
      });
  };

  const Uint8ToString = (u8a) => {
    const CHUNK_SZ = 0x8000;
    let c = [];
    for (let i = 0; i < u8a.length; i += CHUNK_SZ) {
      c.push(String.fromCharCode.apply(null, u8a.subarray(i, i + CHUNK_SZ)));
    }
    return c.join('');
  };

  return (
    <div>
      <input
        type="file"
        accept="application/pdf"
        onChange={handleFileChange}
      />
      <button onClick={handleUpload}>Upload PDF</button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {images.length > 0 && (
        <div>
          {images.map((src, index) => (
            <img
              key={index}
              src={src}
              alt={`Extracted Image ${index}`}
              style={{ width: '75px', height: '75px' }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default UploadPdfComponent;
