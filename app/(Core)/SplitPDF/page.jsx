"use client"
import React, { useState, useCallback, useEffect } from 'react';
import { PDFDocument } from 'pdf-lib';
import { useToast } from "../../../hooks/use-toast";
import * as pdfjsLib from 'pdfjs-dist/webpack';
import Image from 'next/image';
import PDFViewer from "../../../components/Core/PDFViewer";
import { ToastAction } from "@/components/ui/toast";
const PdfSplit = () => {
    const [pdfs, setPdfs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pdfName, setPdfName] = useState("");
    const [pageRanges, setPageRanges] = useState('');
    const [splitPdfPreview, setSplitPdfPreview] = useState(null);
    const { toast } = useToast();
    const [pages, setPages] = useState([]);
    const [previewPdfPages, setPreviewPdfPages] = useState([]);
    const [previewOpen, setPreviewOpen] = useState(false);
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
        // Buffer is Node.js, in browser use btoa with Uint8Array
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
        setPdfName(files[0].name);
        setLoading(true);

        try {
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


    const handlePageRangeChange = (e) => {
        setPageRanges(e.target.value);
    };

    const splitPdf = async () => {
        if (!pageRanges) {
            showToastError('Please provide page ranges.');
            return;
        }

        try {
            const pdfDoc = await PDFDocument.load(pdfs[0]);
            const pageCount = pdfDoc.getPageCount();
            const ranges = pageRanges.split(',').map(range => range.trim());

            const selectedPages = [];

            for (let range of ranges) {
                const [start, end] = range.split('-').map(num => parseInt(num.trim(), 10));
                if (isNaN(start) || (end && isNaN(end))) {
                    showToastError(`Invalid page range: ${range}`);
                    return;
                }
                if (end) {
                    for (let i = start - 1; i <= end - 1; i++) {
                        if (i >= 0 && i < pageCount) selectedPages.push(i);
                    }
                } else {
                    if (start - 1 >= 0 && start - 1 < pageCount) selectedPages.push(start - 1);
                }
            }

            const splitPdfDoc = await PDFDocument.create();
            for (const pageIndex of selectedPages) {
                const [copiedPage] = await splitPdfDoc.copyPages(pdfDoc, [pageIndex]);
                splitPdfDoc.addPage(copiedPage);
            }

            const pdfBytes = await splitPdfDoc.save();
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            const previewUrl = URL.createObjectURL(blob);
            setSplitPdfPreview(previewUrl);
            toast({
                title: (
                    <div className="flex items-center w-full gap-3">
                        {/* subtle check icon */}
                        <svg
                            className="w-5 h-5 text-emerald-400 flex-shrink-0"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            aria-hidden="true"
                        >
                            <path
                                fillRule="evenodd"
                                d="M16.704 5.29a1 1 0 00-1.408-1.418L7.5 11.668 4.704 8.88a1 1 0 10-1.408 1.418l4 4a1 1 0 001.408 0l8-8z"
                                clipRule="evenodd"
                            />
                        </svg>

                        <div className="text-left ">
                            <div className="text-sm md:text-base font-semibold text-emerald-100">
                                PDF ready to download
                            </div>
                            <div className="text-xs md:text-sm text-emerald-200/80">
                                Your compressed PDF is available. Click Download to save it.
                            </div>
                        </div>
                    </div>
                ),
                action: (
                    <ToastAction
                        onClick={downloadPdf}
                        altText="Download PDF"
                        className="ml-3 inline-flex items-center gap-2 rounded-full bg-emerald-500/95 px-4 py-2 min-h-12 text-sm font-semibold text-slate-900 shadow-md hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    >
                        {/* download icon */}
                        <svg
                            className="w-4 h-4"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="7 10 12 15 17 10" />
                            <line x1="12" y1="15" x2="12" y2="3" />
                        </svg>
                        Download
                    </ToastAction>
                ),
                className:
                    "flex items-center justify-between gap-3 w-full max-w-[640px] bg-gradient-to-r from-slate-900/60 to-slate-800/40 border border-emerald-500/10 p-3 md:p-4 rounded-2xl shadow-lg backdrop-blur-md",
            });
        } catch (error) {
            showToastError(`Error splitting PDF: ${error.message}`);
        }
    };

    const downloadPdf = () => {
        if (splitPdfPreview) {
            const link = document.createElement('a');
            link.href = splitPdfPreview;
            link.download = 'split.pdf';
            link.click();
        }
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
                <div className="flex flex-col md:pl-4 w-full text-center lg:text-left">
                    <h2 className="text-[30px] font-bold md:text-[38px] leading-[110%] text-p4">Split PDF</h2>
                    <p className="font-normal text-[16px] leading-[140%] mt-4 text-p5">
                        Quickly and easily split your PDF files into smaller, manageable sections!
                    </p>
                </div>
                <button
                    disabled={!pages.length > 0}
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


                <div className="w-full pr-0 lg:pr-4 md:mb-4 mb-0">
                    <div className="min-h-[200px] rounded-lg p-4 pt-0">
                        <div className="flex w-full flex-col justify-center items-center text-center">
                            <div className="flex w-full   min-w-fit px-3 md:px-12 py-6 justify-self-center flex-col">
                                <div className="flex w-full  justify-between items-center pb-4 gap-4 flex-row">
                                    <h3 className="text-[30px] justify-center md:justify-normal flex w-full font-bold md:text-[38px] leading-[110%] text-p5">
                                        Upload PDF File
                                    </h3>
                                    <button
                                        disabled={!pages.length > 0 || !previewPdfPages.length > 0 || !pdfs || !splitPdfPreview}
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
                                </div>

                                <div className="w-full md:mt-3 flex flex-col gap-8">
                                    <div
                                        className={`flex-center  min-w-72 md:min-w-full flex h-48 cursor-pointer flex-col gap-5 rounded-[16px] border border-dashed bg-[#7986AC] bg-opacity-20 border-p1 border-opacity-40 justify-center items-center text-white text-center w-full backdrop-blur-lg brightness-125 overflow-hidden shadow-[inset_0_0_10px_rgba(0,0,0,1)]`}
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
                                                src="/images/ButtonUtils/add.svg"
                                                alt="Add Image"
                                                width={24}
                                                height={24}
                                                className='brightness-125 '
                                            />
                                        </div>
                                        <p className=" font-normal text-[16px] leading-[140%] brightness-75 text-p5">
                                            {pdfName ? pdfName : 'Click here to upload PDF'}
                                        </p>
                                    </div>
                                </div>

                            </div>
                            {pdfs && pages.length > 0 && previewPdfPages.length > 0 && (<div className='w-full gap-7 flex justify-center items-center flex-col lg:flex-row max-w-72 md:max-w-full md:px-12'>
                                <input
                                    type="text"
                                    value={pageRanges}
                                    onChange={handlePageRangeChange}
                                    placeholder="Enter page ranges (e.g., 1-5, 7, 10-12)"
                                    className="px-4 w-full border-2 border-p1 bg-white bg-opacity-30 py-5 rounded-[9px] text-p5 border-opacity-40 ring-0 focus:border-p1 focus:border-opacity-50 active:border-opacity-50 focus:outline-none focus:ring-0 focus:ring-p1 active:border-p1 hover:border-p1 hover:border-opacity-50"
                                />

                                <button
                                    disabled={!pages.length > 0 || !previewPdfPages.length > 0}
                                    onClick={splitPdf}
                                    className="flex w-1/5 h-full disabled:opacity-40 disabled:cursor-not-allowed justify-center items-center rounded-2xl group "
                                >
                                    <span className=" px-4  min-w-40 md:px-8 flex justify-center items-center w-fit before:g7 g4  h-full  py-2 rounded-2xl   overflow-hidden">
                                        <Image
                                            src={`images/options/split.svg`}
                                            alt="logo"
                                            width={28}
                                            height={28}
                                            className="brightness-200"
                                        />
                                        <span className="font-semibold text-16 flex gap-4 p-4 pr-0 text-p5">
                                            Split
                                        </span>
                                    </span>
                                </button>
                            </div>)}
                        </div>
                    </div>
                    {previewOpen && splitPdfPreview && (
                        <div className="mt-8 w-full px-6 md:px-0 pt-6 bg-gray-900/80 border border-gray-700/50 rounded-xl shadow-2xl backdrop-blur-lg">
                            <div className='flex flex-row w-full pb-8 px-12 justify-center items-center'>
                                <div className="flex items-center flex-col justify-center w-full">
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
                                    <PDFViewer file={splitPdfPreview} />
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
                    )}
                </div>


                <div className="w-full flex flex-col  pt-0 px-4 pb-4  gap-4 lg:w-full">
                    {pages.length > 0 && (
                        <h2 className="text-[24px]  leading-[140%] text-p5 text-center font-bold  mb-2">
                            Uploaded Pages
                        </h2>
                    )}
                    {pdfs && pages.length > 0 && previewPdfPages.length > 0 ? (<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {previewPdfPages.map((page, index) => (
                            <div
                                key={index}
                                draggable
                                className="bg-gray-800 justify-between border border-gray-700 p-1 rounded-md hover:bg-gray-700 flex flex-col items-center shadow transition duration-150 ease-in-out"
                            >
                                <Image
                                    width={111}
                                    height={111}
                                    src={page.preview}
                                    alt={`Page ${index + 1}`}
                                    className="w-full h-auto rounded-md mb-2"
                                />
                                <span className="font-normal text-[12px] leading-[140%] text-p5">
                                    Page No : {page.index}
                                </span>
                            </div>
                        ))}
                    </div>) : (loading && <div>
                        <div className="w-6 ml-4 flex justify-self-center sm:w-8 h-6 sm:h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>)}
                </div>
            </div>
        </div>
    );
};
export default PdfSplit;
