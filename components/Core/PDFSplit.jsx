import React, { useState, useCallback, useEffect } from 'react';
import { PDFDocument } from 'pdf-lib';
import { useToast } from "../../hooks/use-toast";
import * as pdfjsLib from 'pdfjs-dist/webpack';
import Image from 'next/image';
import PDFViewer from "./PDFViewer";

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
            title: message,
            variant: 'destructive',
            className: 'font-semibold text-[12px] md:text-[16px] text-red-500 gap-3 w-full py-2 bg-red-500 bg-opacity-20 p-2 md:p-4 rounded-lg border-2 border-red-500 border-opacity-50 backdrop-blur-md',
        });
    }, [toast]);

    const showToastSuccess = useCallback((message) => {
        toast({
            title: message,
            variant: 'success',
            className: 'font-semibold text-[12px] md:text-[16px] text-green-500 gap-3 w-full py-2 bg-green-500 bg-opacity-20 p-2 md:p-4 rounded-lg border-2 border-green-500 border-opacity-50 backdrop-blur-md',
        });
    }, [toast]);

    const handleFileChange = async (e) => {
        const files = Array.from(e.target.files);
        const invalidFiles = files.filter(file => file.type !== 'application/pdf');

        if (invalidFiles.length > 0) {
            showToastError("Invalid PDF Files. Only PDF files are allowed.");
            return;
        }

        setPdfName(files[0].name);
        setPdfs([]);
        setPages([]);
        setPreviewPdfPages([]);

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
        for (const file of files) {
            const reader = new FileReader();
            reader.onload = async (ev) => {
                const pdfData = ev.target.result;
                await setingPreviewPages(pdfData, newPdfs.length - 1);
            };
            reader.readAsArrayBuffer(file);
        }
    };

    const extractPages = async (pdfData, pdfIndex) => {
        try {
            const pdfDoc = await PDFDocument.load(pdfData);
            const pageCount = pdfDoc.getPageCount();
            const extractedPages = Array.from({ length: pageCount }, (_, index) => ({
                index,
                pdfIndex,
                name: `page No :- ${index + 1}`,
            }));
            setPages((prev) => [...prev, ...extractedPages]);
        } catch (error) {
            showToastError(`Error extracting pages: ${error.message}`);
        }
    };

    const setingPreviewPages = async (pdfData, pdfIndex) => {
        const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;
        const pageCount = pdf.numPages;

        const pagesArray = [];

        for (let i = 1; i <= pageCount; i++) {
            const page = await pdf.getPage(i);
            const viewport = page.getViewport({ scale: 1 });

            const canvas = document.createElement("canvas");
            const context = canvas.getContext("2d");
            canvas.width = viewport.width;
            canvas.height = viewport.height;

            await page.render({ canvasContext: context, viewport }).promise;

            const image = canvas.toDataURL("image/png");

            pagesArray.push({
                index: i,
                pdfIndex,
                name: `Page No :- ${i}`,
                preview: image,
            });
        }

        setPreviewPdfPages((prev) => [...prev, ...pagesArray]);
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
            showToastSuccess('PDF Split Successful');
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
                    className={`flex w-full md:pr-4 disabled:opacity-40 disabled:cursor-not-allowed justify-center lg:justify-end rounded-2xl group mt-4 lg:mt-0`}
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
                            <div className="flex w-full   min-w-fit px-12 py-6 justify-self-center flex-col">
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
                        <>
                            <div className="bg-p5/5 w-full font-normal p-1  rounded-lg pt-4 flex  cursor-pointer flex-col text-white text-center  backdrop-blur-[12px]   ">
                                <h2 className="font-bold mb-4 text-center text-[30px] leading-[140%] text-p5">
                                    Full PDF Preview
                                </h2>

                                {pages.length > 0 ? (
                                    <PDFViewer file={splitPdfPreview} />
                                ) : (
                                    <div className="font-normal text-[16px] leading-[140%] flex justify-center text-p5">
                                        No files uploaded. Upload files to preview and merge.
                                    </div>
                                )}
                            </div>
                        </>
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
