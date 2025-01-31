"use client";
import React, { useState, useRef } from 'react';
import html2pdf from "html2pdf.js";
import Toolbar from "../Toolbar";
import Image from 'next/image';
import { useToast } from '../../../hooks/use-toast';

function PDFToHTML() {
  const [pdf, setPdf] = useState(null);
  const [content, setContent] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [isContinueClicked, setIsContinueClicked] = useState(false);
  const editorRef = useRef(null);
  const { toast } = useToast();

  const showToastError = (message) => {
    toast({
      title: message,
      variant: 'destructive',
      className: "font-semibold text-[12px] md:text-[16px] text-red-500 gap-3 w-full py-2 bg-red-500 bg-opacity-20 p-2 md:p-4 rounded-lg border-2 border-red-500 border-opacity-50 backdrop-blur-md",
    });
  };

  const handleUpload = async () => {
    if (!pdf) return alert("Please select a PDF file!");
    setIsContinueClicked(true);
    const formData = new FormData();
    formData.append("pdf", pdf);

    const res = await fetch("/api/PdfToHtml", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    if (data.url) {
      const htmlRes = await fetch(data.url);
      let htmlText = await htmlRes.text();
      setContent(htmlText);
      setIsContinueClicked(false);
    }
  };

  const handleCommand = (command, value = null) => {
    if (editorRef.current) {
      document.execCommand(command, false, value);
    }
  };

  const applyStyle = (style, value = null) => {
    if (style === "bold" || style === "italic" || style === "underline" || style === "strike" || style === "heading") {
      handleCommand(style);
    } else if (style === "fontSize") {
      editorRef.current.style.fontSize = `${value}px`;
    } else if (style === "fontFamily") {
      editorRef.current.style.fontFamily = value;
    } else if (style === "textColor") {
      document.execCommand('foreColor', false, value);  // Text color
    } else if (style === "backgroundColor") {
      document.execCommand('backColor', false, value); // Background color
    } else if (style === "highlight") {
      const selection = window.getSelection();
      if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const span = document.createElement("span");
        span.style.backgroundColor = "yellow";  // Highlight color
        range.surroundContents(span);
      }
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type === 'application/pdf') {
      setPdf(file);
    } else {
      showToastError('Please upload a valid PDF file');
    }
  };

  const handleDragLeave = () => {
    setDragActive(false);
  };

  const downloadPdf = () => {
    const element = editorRef.current; // Get the editor content
    if (!element) return alert("Editor content not loaded!");

    const A4Width = 210;
    const A4Height = 297;

    const options = {
      margin: 0,
      filename: 'download.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: {
        scale: 4,
        useCORS: true,
        width: A4Width * 3.7795275591,
        height: A4Height * 3.7795275591,
        x: 0,
        y: 0,
      },
      jsPDF: {
        unit: 'mm',
        format: [A4Width, A4Height],
        orientation: 'portrait',
      },
    };

    element.style.overflow = "auto";
    element.style.height = "auto";

    html2pdf()
      .from(element)
      .set(options)
      .save()
      .catch((err) => alert("An error occurred during PDF generation: " + err));
  };

  return (
    <div className="flex w-full justify-center items-center flex-col">
      <div className="w-full pr-0 lg:pr-4 md:mb-4 mb-0">
        <div className="min-h-[200px] rounded-lg p-4 pt-0">
          <div className="flex w-full flex-col justify-center items-center text-center">
            <div className="flex w-full min-w-fit px-12 py-6 justify-self-center flex-col">
              <div className="flex w-full flex-col justify-between items-center pb-4 gap-4 md:flex-row">
                <h3 className="text-[30px] justify-center md:justify-normal flex w-full font-bold md:text-[38px] leading-[110%] text-p5">
                  Upload PDF File
                </h3>
                <div className='w-full flex justify-center items-center flex-row'>
                  <button
                    disabled={!pdf}
                    onClick={downloadPdf}
                    className="flex w-full justify-center md:justify-end disabled:opacity-40 disabled:cursor-not-allowed rounded-2xl group"
                  >
                    <span className="relative px-4 md:px-8 flex justify-end items-center w-fit before:g7 g4 min-h-fit py-2 rounded-2xl before:absolute before:inset-0 before:opacity-0 before:transition-opacity before:duration-500 before:content-[''] group-hover:before:opacity-100 overflow-hidden">
                      <Image
                        src={`images/ButtonUtils/download.svg`}
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
                  {pdf && (
                    <button
                      disabled={!pdf}
                      onClick={handleUpload}
                      className="flex pl-2 min-w-36 md:min-w-44 items-center justify-normal md:justify-end disabled:opacity-40 disabled:cursor-not-allowed rounded-2xl group"
                    >
                      <span className="relative px-4 md:px-8 flex justify-around items-center w-fit before:g7 g4 min-h-fit py-2 rounded-2xl before:absolute before:inset-0 before:opacity-0 before:transition-opacity before:duration-500 before:content-[''] group-hover:before:opacity-100 overflow-hidden">
                        <Image
                          src={`images/ButtonUtils/process.svg`}
                          alt="logo"
                          width={28}
                          height={28}
                          className="brightness-200"
                        />
                        <span className="font-semibold text-16 flex gap-4 p-4 pr-6 text-p5">
                          Process
                        </span>
                      </span>
                    </button>
                  )}
                  {isContinueClicked && pdf && (
                    <div className="w-6 ml-4 flex justify-self-center sm:w-8 h-6 sm:h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
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
                      accept=".pdf"
                      className="hidden"
                      onChange={(e) => setPdf(e.target.files[0])}
                    />
                    <Image
                      src="/images/ButtonUtils/add.svg"
                      alt="Add Image"
                      width={24}
                      height={24}
                      className='brightness-125 '
                    />
                  </div>
                  <p className="font-normal text-[16px] leading-[140%] brightness-75 text-p5">
                    {pdf ? pdf.name : 'Click here to upload PDF'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {content && (
        <div className="mt-32 relative w-full flex justify-between flex-col items-center border border-gray-300 rounded-lg shadow-lg">
          {/* Toolbar Section */}
          <div className="bg-[linear-gradient(#0a1130c1,#0d1845a4)] -mt-28 relative z-20 flex w-full">
            <Toolbar
              editor={editorRef}
              applyStyle={applyStyle}
              setFontSize={(size) => applyStyle("fontSize", size)}
              setFontFamily={(font) => applyStyle("fontFamily", font)}
              undo={() => handleCommand("undo")}
              setHighlight={() => applyStyle("highlight", "yellow")}
              handleImageUpload={() => {}}
              setTextColor={(color) => applyStyle("textColor", color)}
              setBackgroundColor={(color) => applyStyle("backgroundColor", color)}
            />
          </div>

          {/* Editable content area */}
          <div
            ref={editorRef}
            contentEditable
            dangerouslySetInnerHTML={{ __html: content }}
            className="editor-container border border-gray-400 rounded-lg min-h-[1000px] w-full overflow-auto"
            style={{ background: "white", color: "black" }}
          />
        </div>
      )}
      </div>
    </div>
  );
}

export default PDFToHTML;
