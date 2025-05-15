import React, { useState } from 'react';
import { saveAs } from 'file-saver';
import Image from 'next/image';
import { useToast } from '../../hooks/use-toast';
import { ToastAction } from '@/components/ui/toast';
import PDFViewer from "./PDFViewer";

const WordDocxToPdf = () => {
    const [docxFile, setDocxFile] = useState(null);
    const [dragActive, setDragActive] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [convertedPdfBlob, setConvertedPdfBlob] = useState(null);
    const [previewOpen, setPreviewOpen] = useState(false);
    const [pdfUrl, setPdfUrl] = useState(null);
    const { toast } = useToast();

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
        validateFile(file);
    };

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (file) validateFile(file);
    };

    const validateFile = (file) => {
        if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
            setDocxFile(file);
            setConvertedPdfBlob(null);
            setPdfUrl(null);
        } else {
            showToastError('Please upload a valid .docx file.');
        }
    };

    const showToastError = (message) => {
        toast({
            title: message,
            variant: 'destructive',
            className: "font-semibold text-[12px] md:text-[16px] text-red-500 gap-3 w-full py-2 bg-red-500 bg-opacity-20 p-2 md:p-4 rounded-lg border-2 border-red-500 border-opacity-50 backdrop-blur-md",
        });
    };

    const handleConvert = async () => {
        if (!docxFile) {
            showToastError('No .docx file selected.');
            return;
        }

        setIsProcessing(true);

        const formData = new FormData();
        formData.append('file', docxFile);

        try {
            const response = await fetch('/api/WordToPDF', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Conversion failed');
            }

            const blob = await response.blob();

            setConvertedPdfBlob(blob);
            setPdfUrl(URL.createObjectURL(blob));

            toast({
                title: 'Your PDF is ready to be downloaded. Click below to download it.',
                action: (
                    <ToastAction
                        className="bg-green-500 hover:bg-green-800 text-p5 bg-opacity-10 border-green-500"
                        onClick={downloadPDF}
                        altText="Download PDF"
                    >
                        Download
                    </ToastAction>
                ),
                className: "flex gap-3 font-bold text-[12px] md:text-[16px] text-green-500 w-full justify-center items-center bg-green-500 bg-opacity-20 p-2 md:p-4 py-2 rounded-lg border-2 border-green-500 backdrop-blur-md",
            });
        } catch (err) {
            console.error('Error converting .docx to PDF:', err);
            showToastError('Failed to convert the .docx file.');
        } finally {
            setIsProcessing(false);
        }
    };

    const downloadPDF = () => {
        if (convertedPdfBlob) {
            saveAs(convertedPdfBlob, 'converted.pdf');
        }
    };

    return (
        <div
            style={{
                scrollbarWidth: "none",
                scrollbarColor: "rgba(155, 89, 182, 0.6) rgba(0, 0, 0, 0.1)",
            }}
            className="flex flex-col w-full">
            <div className="flex flex-col lg:px-0 lg:flex-row justify-center mt-5 mb-10 items-center w-full">
                <div className="flex flex-col md:pl-4 w-full text-center lg:text-left">
                    <h2 className="text-[30px] font-bold md:text-[38px] leading-[110%] text-p4">Convert Word to PDF</h2>
                    <p className="font-normal text-[16px] leading-[140%] mt-4 text-p5">
                        Easily convert your Word (.docx) files to PDF with just a few clicks.
                    </p>
                </div>
                <button
                    disabled={isProcessing || !docxFile || !convertedPdfBlob}
                    onClick={downloadPDF}
                    className="flex w-full md:pr-4 disabled:opacity-40 disabled:cursor-not-allowed justify-center lg:justify-end rounded-2xl group mt-4 lg:mt-0"
                >
                    <span className="relative flex justify-around items-center w-fit before:g7 g4 min-h-fit px-4 py-2 rounded-2xl before:absolute before:inset-0 before:opacity-0 before:transition-opacity before:duration-500 before:content-[''] group-hover:before:opacity-100 overflow-hidden">
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
            <hr className="border-s3 border-2" />
            <div style={{
                scrollbarWidth: "none",
                scrollbarColor: "rgba(155, 89, 182, 0.6) rgba(0, 0, 0, 0.1)",
            }} className="flex flex-col overflow-hidden text-white rounded-2xl h-fit w-full">
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
                            <div className="flex w-full min-w-fit px-12 py-6 justify-self-center flex-col">
                                <div className="flex w-full flex-col justify-between items-center pb-4 gap-4 md:flex-row">
                                    <h3 className="text-[30px] justify-center md:justify-normal flex w-full font-bold md:text-[38px] leading-[110%] text-p5">
                                        Upload Word File
                                    </h3>
                                    <div className="w-full flex justify-center items-center flex-row">
                                        <button
                                            disabled={isProcessing || !docxFile || !convertedPdfBlob}
                                            onClick={() => setPreviewOpen((prev) => !prev)}
                                            className="flex w-full justify-center md:justify-end disabled:opacity-40 disabled:cursor-not-allowed rounded-2xl group"
                                        >
                                            <span className="relative px-4 md:px-8 flex justify-end items-center w-fit before:g7 g4 min-h-fit py-2 rounded-2xl before:absolute before:inset-0 before:opacity-0 before:transition-opacity before:duration-500 before:content-[''] group-hover:before:opacity-100 overflow-hidden">
                                                <Image
                                                    src={`${previewOpen ? '/images/ButtonUtils/eye1.svg' : '/images/ButtonUtils/eye2.svg'}`}
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
                                        {!isProcessing && docxFile && (
                                            <button
                                                disabled={!docxFile || isProcessing}
                                                onClick={handleConvert}
                                                className="flex pl-2 min-w-32 md:min-w-44 items-center justify-normal md:justify-end disabled:opacity-40 disabled:cursor-not-allowed rounded-2xl group"
                                            >
                                                <span className="relative px-4 md:px-8 flex justify-around items-center w-fit before:g7 g4 min-h-fit py-2 rounded-2xl before:absolute before:inset-0 before:opacity-0 before:transition-opacity before:duration-500 before:content-[''] group-hover:before:opacity-100 overflow-hidden">
                                                    <Image
                                                        src="/images/ButtonUtils/process.svg"
                                                        alt="logo"
                                                        width={28}
                                                        height={28}
                                                        className="brightness-200"
                                                    />
                                                    <span className="font-semibold text-16 flex gap-4 p-4 pr-6 text-p5">
                                                        Convert
                                                    </span>
                                                </span>
                                            </button>
                                        )}
                                        {isProcessing && (
                                            <div>
                                            <div className="w-6 ml-4 flex justify-self-center sm:w-8 h-6 sm:h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                        </div>
                                        )}
                                    </div>
                                </div>

                                <div className="w-full md:mt-3 flex flex-col gap-8">
                                    <div
                                        className={`flex-center ${dragActive ? "scale-105" : ""} min-w-72 md:min-w-full flex h-48 cursor-pointer flex-col gap-5 rounded-[16px] border border-dashed bg-[#7986AC] bg-opacity-20 border-p1 border-opacity-40 justify-center items-center text-white text-center w-full backdrop-blur-lg brightness-125 overflow-hidden shadow-[inset_0_0_10px_rgba(0,0,0,1)]`}
                                        onDragOver={handleDrag}
                                        onDragLeave={handleDragLeave}
                                        onDrop={handleDrop}
                                        onClick={() => document.getElementById('fileInput')?.click()}
                                    >
                                        <div className="rounded-[16px] bg-s0/40 p-5 shadow-sm shadow-purple-200/50">
                                            <input
                                                id="fileInput"
                                                type="file"
                                                accept=".docx"
                                                className="hidden"
                                                onChange={handleFileChange}
                                            />
                                            <Image
                                                src="/images/ButtonUtils/add.svg"
                                                alt="Add File"
                                                width={24}
                                                height={24}
                                                className="brightness-125"
                                            />
                                        </div>
                                        <p className="font-normal text-[16px] leading-[140%] brightness-75 text-p5">
                                            {docxFile ? docxFile.name : 'Click here to upload .docx file'}
                                        </p>
                                    </div>

                                </div>
                            </div>

                            {previewOpen && (
                                <div className="bg-p5/5 w-full font-normal p-1 rounded-lg pt-4 flex cursor-pointer flex-col text-white text-center backdrop-blur-[12px]">
                                    <h2 className="font-bold mb-4 text-center text-[30px] leading-[140%] text-p5">
                                        PDF Preview
                                    </h2>
                                    {pdfUrl ? (
                                        <PDFViewer file={pdfUrl} />
                                    ) : (
                                        <div className="font-normal text-[16px] leading-[140%] flex justify-center text-p5">
                                            Convert the .docx file to preview the PDF.
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WordDocxToPdf;