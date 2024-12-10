"use client";
import React, { useState } from 'react';
import Image from 'next/image';

const GetPDFImages = () => {
  const [imageFile, setImageFile] = useState(null);
  const [images, setImages] = useState([]);
  const [error, setError] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

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

  const handleContinue = async () => {
    setIsProcessing(true);
    const formData = new FormData();
    formData.append('pdf', imageFile);
    await fetch('/api/ExtractImages', {
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

            const sizeInMB = (byteArray.length / (1024 * 1024)).toFixed(2);

            return { id: index, url: `data:image/jpeg;base64,${base64String}`, size: sizeInMB };
          });

          setImages(base64Images);
          setError(null);
        }
      })
      .catch((err) => {
        console.error('Error uploading file:', err);
        setError('Error uploading file.');
      });
    setIsProcessing(false);
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
  function downloadAllImages(images) {
    images.forEach((image) => {
      const anchor = document.createElement("a");
      anchor.href = image.url;
      anchor.download = `PDFImage_${image.id}.jpg`;
      anchor.style.display = "none";
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
    });
  }

  return (
    <div className="flex  flex-col w-full ">
      <div className="flex flex-col lg:px-0 lg:flex-row justify-center mt-5 mb-10 items-center w-full">
        <div className="flex flex-col  md:pl-4 w-full text-center lg:text-left">
          <h2 className="text-[30px] font-bold md:text-[38px] leading-[110%] text-p4">Extract Images</h2>
          <p className="font-normal text-[16px] leading-[140%] mt-4 text-p5">
            Effortlessly extract images from your PDFs with just a few clicks, all in a smooth and user-friendly interface!
          </p>

        </div>
        <button
          onClick={downloadAllImages}
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
              Download All Images
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
                    disabled={!imageFile || isProcessing}
                    onClick={handleContinue}
                    className="flex w-full justify-center md:justify-end disabled:opacity-40 disabled:cursor-not-allowed rounded-2xl group"
                  >
                    <span className="relative px-4  md:px-8 flex justify-around items-center w-fit before:g7 g4 min-h-fit py-2 rounded-2xl before:absolute before:inset-0 before:opacity-0 before:transition-opacity before:duration-500 before:content-[''] group-hover:before:opacity-100 overflow-hidden">
                      <Image
                        src={`images/process.svg`}
                        alt="logo"
                        width={28}
                        height={28}
                        className="brightness-200"
                      />
                      <span className="font-semibold text-16 flex gap-4 p-4 pr-0 text-p5">
                        Proccess
                      </span>
                    </span>
                  </button>
                  <div className=' justify-center items-center flex'>
                    {isProcessing && !error && (
                      <div className="w-6 flex justify-self-center sm:w-8 h-6 sm:h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    )}
                  </div>
                  {error && <p className="text-red-500 mt-2">{error}</p>}
                </div>
                <div className=' w-full md:mt-3  justify-around flex flex-row'>
                  <div
                    className="flex-center min-w-72 md:min-w-full flex h-48 cursor-pointer flex-col gap-5 rounded-[16px] border border-dashed bg-[#7986AC] bg-opacity-20 border-p1 border-opacity-40 justify-center items-center text-white text-center  w-full backdrop-blur-lg  brightness-125 overflow-hidden shadow-[inset_0_0_10px_rgba(0,0,0,1)]"
                    onDragOver={handleDrag}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => document.getElementById('fileInput')?.click()}
                  >
                    <div className="rounded-[16px] bg-s0/40 p-5 shadow-sm shadow-purple-200/50">
                      <input
                        id="fileInput"
                        type="file"
                        accept=".pdf"
                        className="hidden"
                        onChange={handleFileChange}
                      />
                      <Image
                        src="/images/add.svg"
                        alt="Add Image"
                        width={24}
                        height={24}
                        className='brightness-125 '
                      />
                    </div>
                    <p className=" font-normal text-[16px] leading-[140%] brightness-75 text-p5">
                      {imageFile ? imageFile.name : 'Click here to upload PDF'}
                    </p>
                  </div>
                </div>
              </div>
              {images.length > 0 ? (<div className="grid  grid-cols-2 mb-6 sm:grid-cols-2 md:grid-cols-4 gap-2 w-full lg:px-12 mt-6 sm:mt-8 lg:mt-9">
                {images.map((image) => (
                  <div
                    key={image.id}
                    className="bg-gray-800 hover:scale-105 items-center justify-center border border-gray-700 p-1 rounded-lg hover:bg-gray-700 flex flex-col shadow transition duration-150 ease-in-out bg-p5/5 w-full font-normal   text-white text-center  backdrop-blur-[12px]  "
                  >
                    <Image
                      src={image.url}
                      alt={`PDF Image ${image.id}`}
                      className="object-cover w-full rounded-lg border-2 border-p1 border-opacity-65 h-full group-hover:scale-105 transition-transform duration-300"
                      onError={() => handleImageError(image.id)}
                      width={500}
                      height={500}
                    />
                    <span className="font-semibold text-16 p-2 text-p5">
                      Size : {image.size} MBs
                    </span>
                    <a
                      href={image.url}
                      download={`PDFImage_${image.id}.jpg`}
                      className={`flex w-full p-3 pt-0 disabled:opacity-40 disabled:cursor-not-allowed justify-center rounded-2xl group mt-4 lg:mt-0`}
                    >
                      <span className="relative flex justify-center items-center w-full before:g7 g4 min-h-fit px-4 py-2 rounded-2xl before:absolute before:inset-0 before:opacity-0 before:transition-opacity before:duration-500 before:content-[''] group-hover:before:opacity-100  overflow-hidden">
                        <Image
                          src="/images/download.svg"
                          alt="logo"
                          width={28}
                          height={28}
                          className="brightness-200"
                        />
                        <span className="font-semibold text-16 flex gap-4 p-2 pr-0 text-p5">
                          Download
                        </span>
                      </span>
                    </a>
                  </div>))}

              </div>) :
                imageFile && images.length <= 0 && (<div className=" w-full md:px-12 flex justify-center items-center ">
                  <div className="font-semibold text-16 flex gap-4 p-4 pr-0 text-p5 bg-sky-400/10 justify-center items-center w-full  rounded-lg   cursor-pointer  text-center  backdrop-blur-[12px] ">
                    No Images Available / Images are Corrupted
                  </div>
                </div>)
              }
            </div>
          </div>
        </div>
      </div>
    </div>

  );
};

export default GetPDFImages;
