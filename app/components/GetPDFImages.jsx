"use client";
import React, { useState, useRef } from 'react';
import Image from 'next/image';

const GetPDFImages = () => {
  const [imageFile, setImageFile] = useState(null);
  const [images, setImages] = useState([]);
  const [error, setError] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const pdfInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      setImageFile(file);
    } else {
      setError('Please upload a PDF file.');
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type === 'application/pdf') {
      setImageFile(file);
    } else {
      setError('Please upload a PDF file.');
    }
  };

  const handleContinue = () => {
    const formData = new FormData();
    formData.append('pdf', imageFile);

    fetch('/api/ExtractImages', {
      method: 'POST',
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          const base64Images = data.images.map((image, index) => {
            const imageData = image.data;
            const byteNumbers = Object.values(imageData);
            const byteArray = new Uint8Array(byteNumbers);
            const base64String = btoa(Uint8ToString(byteArray));

            return { id: index, url: `data:image/jpeg;base64,${base64String}` };
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

  const handleImageError = (id) => {
    setImages((prevImages) => prevImages.filter((image) => image.id !== id));
  };

  return (
    <div className="max-w-2xl flex flex-col justify-center items-center mx-auto p-6">
      <div
        className={`border-4 border-dashed bg-gray-100 p-10 rounded-lg w-full flex items-center justify-center cursor-pointer transition-colors duration-300 ease-in-out ${dragActive ? 'border-blue-400' : 'border-gray-300'}`}
        onDragOver={handleDrag}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => pdfInputRef.current.click()}
      >
        <input
          type="file"
          ref={pdfInputRef}
          accept="application/pdf"
          className="hidden"
          onChange={handleFileChange}
        />
        <p className="text-center text-gray-500">{imageFile ? imageFile.name : 'Drag & Drop a PDF or click to upload'}</p>
      </div>

      <button
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        onClick={handleContinue}
      >
        Extract Images
      </button>

      {error && <p className="text-red-500 mt-2">{error}</p>}

      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-8">
  {images.map((image) => (
    <div
      key={image.id}
      className="relative group border rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300"
    >
      <div className="w-full aspect-square overflow-hidden">
        <Image
          src={image.url}
          alt={`PDF Image ${image.id}`}
          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
          onError={() => handleImageError(image.id)}
          width={400}
          height={400}
        />
      </div>
      <div className="p-2 flex justify-center">
        <a
          href={image.url}
          download={`PDFImage_${image.id}.jpg`}
          className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-semibold shadow-md hover:bg-blue-700 transition-colors duration-300"
        >
          Download
        </a>
      </div>
    </div>
  ))}
</div>



    </div>
  );
};

export default GetPDFImages;
