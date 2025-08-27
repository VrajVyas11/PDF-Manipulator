/* eslint-disable no-unused-vars */
"use client";
import React, { useState, useRef } from "react";
import Toolbar from "./Toolbar";
import Image from "next/image";
import { useToast } from "../../../hooks/use-toast";
import { PDFDocument } from "pdf-lib";

function PDFEditorComplex() {
  const [pdf, setPdf] = useState(null);
  const [content, setContent] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [pdfDimensions, setPdfDimensions] = useState({ width: null, height: null });
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const editorRef = useRef(null);
  const { toast } = useToast();

  const showToastError = (message) => {
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
  };

  const handleUpload = async () => {
    if (!pdf) return showToastError("Please select a PDF file!");

    const fileReader = new FileReader();
    fileReader.onload = async (e) => {
      setIsProcessing(true);
      try {
        const uint8Array = new Uint8Array(e.target.result);
        const pdfDoc = await PDFDocument.load(uint8Array);
        const pages = pdfDoc.getPages();
        const { width, height } = pages[0].getSize();
        setPdfDimensions({ width, height });

        const formData = new FormData();
        formData.append("pdf", pdf);

        const res = await fetch("/api/PdfToHtml", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const errorText = await res.json();
          showToastError(` ${res.status}: ${errorText.error}`);
          return;
        }

        const data = await res.json();
        if (!data.url) {
          showToastError("Invalid response from server. No URL found.");
          return;
        }

        const htmlRes = await fetch(data.url);
        if (!htmlRes.ok) {
          showToastError(`Failed to fetch HTML content: ${htmlRes.status}`);
          return;
        }

        const htmlText = await htmlRes.text();
        setContent(htmlText);
      } catch {
        showToastError("Failed to process PDF. Please try again.");
      } finally {
        setIsProcessing(false);
      }
    };

    fileReader.readAsArrayBuffer(pdf);
  };

  const downloadPdf = async () => {
    const element = editorRef.current;
    if (!element) return showToastError("Editor content not loaded!");

    const htmlContent = element.innerHTML;

    if (!pdfDimensions.width || !pdfDimensions.height) {
      return showToastError("PDF dimensions are not set. Please upload a PDF first.");
    }

    setIsDownloading(true);

    try {
      const response = await fetch("/api/MakePdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          html: htmlContent,
          width: pdfDimensions.width,
          height: pdfDimensions.height,
        }),
      });
      const data = await response.json();
      if (!data.url) {
        showToastError("Invalid response from server. No URL found.");
        return;
      }

      if (data.success) {
        const pdfResponse = await fetch(data.url);
        const blob = await pdfResponse.blob();

        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.setAttribute("download", "download.pdf");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        URL.revokeObjectURL(link.href);
      } else {
        showToastError("Failed to generate PDF: " + data.error);
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      showToastError("Failed to download PDF. Please try again.");
    } finally {
      setIsDownloading(false);
      setContent("");
      setPdf("");
    }
  };

  const applyStyle = (style, value = null) => {
    if (!editorRef.current) return;

    const selection = window.getSelection();
    const range = selection.rangeCount > 0 ? selection.getRangeAt(0) : null;

    switch (style) {
      case "bold":
        document.execCommand("bold", false, null);
        break;
      case "italic":
        document.execCommand("italic", false, null);
        break;
      case "underline":
        document.execCommand("underline", false, null);
        break;
      case "strike":
        document.execCommand("strikethrough", false, null);
        break;
      case "heading":
        document.execCommand("formatBlock", false, `<h${value}>`);
        break;
      case "bulletList":
        if (range) {
          const commonAncestor = range.commonAncestorContainer;
          const parentUl = commonAncestor.nodeType === 1 ? commonAncestor.closest("ul") : commonAncestor.parentElement.closest("ul");
          const parentOl = commonAncestor.nodeType === 1 ? commonAncestor.closest("ol") : commonAncestor.parentElement.closest("ol");
          if (parentUl) {
            // Toggle off: Remove <ul> and extract <li> content
            const li = (range.startContainer.nodeType === 1 ? range.startContainer : range.startContainer.parentElement).closest("li") || parentUl.querySelector("li");
            if (li) {
              const p = document.createElement("p");
              p.appendChild(li.cloneNode(true));
              p.innerHTML = p.innerHTML.replace(/<\/?li>/gi, ""); // Remove <li> tags
              parentUl.parentNode.replaceChild(p, parentUl);
              // Reselect the content
              range.selectNodeContents(p);
              selection.removeAllRanges();
              selection.addRange(range);
            }
          } else if (parentOl) {
            // Switch <ol> to <ul>
            const ul = document.createElement("ul");
            ul.style.listStyleType = "disc";
            const lis = Array.from(parentOl.querySelectorAll("li"));
            lis.forEach((li) => {
              const newLi = document.createElement("li");
              newLi.appendChild(li.cloneNode(true));
              newLi.innerHTML = newLi.innerHTML.replace(/<\/?li>/gi, "");
              ul.appendChild(newLi);
            });
            parentOl.parentNode.replaceChild(ul, parentOl);
            // Reselect the content
            const firstLi = ul.querySelector("li");
            if (firstLi) {
              range.selectNodeContents(firstLi);
              selection.removeAllRanges();
              selection.addRange(range);
            }
          } else {
            // Create new bullet list
            const ul = document.createElement("ul");
            ul.style.listStyleType = "disc"; // Use • (disc) for bullets
            const li = document.createElement("li");
            try {
              // Extract selected content
              const fragment = range.extractContents();
              li.appendChild(fragment);
              ul.appendChild(li);
              range.insertNode(ul);
              // Select the new li for further editing
              range.selectNodeContents(li);
              selection.removeAllRanges();
              selection.addRange(range);
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
            } catch (e) {
              // Fallback to execCommand for complex selections
              document.execCommand("insertUnorderedList", false, null);
            }
          }
        } else {
          // Insert empty list if no selection
          const ul = document.createElement("ul");
          ul.style.listStyleType = "disc";
          const li = document.createElement("li");
          li.innerText = " ";
          ul.appendChild(li);
          editorRef.current.appendChild(ul);
          // Place cursor in the new li
          const range = document.createRange();
          range.selectNodeContents(li);
          selection.removeAllRanges();
          selection.addRange(range);
        }
        break;
      case "orderedList":
        if (range) {
          const commonAncestor = range.commonAncestorContainer;
          const parentOl = commonAncestor.nodeType === 1 ? commonAncestor.closest("ol") : commonAncestor.parentElement.closest("ol");
          const parentUl = commonAncestor.nodeType === 1 ? commonAncestor.closest("ul") : commonAncestor.parentElement.closest("ul");
          if (parentOl) {
            // Toggle off: Remove <ol> and extract <li> content
            const li = (range.startContainer.nodeType === 1 ? range.startContainer : range.startContainer.parentElement).closest("li") || parentOl.querySelector("li");
            if (li) {
              const p = document.createElement("p");
              p.appendChild(li.cloneNode(true));
              p.innerHTML = p.innerHTML.replace(/<\/?li>/gi, ""); // Remove <li> tags
              parentOl.parentNode.replaceChild(p, parentOl);
              // Reselect the content
              range.selectNodeContents(p);
              selection.removeAllRanges();
              selection.addRange(range);
            }
          } else if (parentUl) {
            // Switch <ul> to <ol>
            const ol = document.createElement("ol");
            ol.style.listStyleType = "decimal";
            const lis = Array.from(parentUl.querySelectorAll("li"));
            lis.forEach((li) => {
              const newLi = document.createElement("li");
              newLi.appendChild(li.cloneNode(true));
              newLi.innerHTML = newLi.innerHTML.replace(/<\/?li>/gi, "");
              ol.appendChild(newLi);
            });
            parentUl.parentNode.replaceChild(ol, parentUl);
            // Reselect the content
            const firstLi = ol.querySelector("li");
            if (firstLi) {
              range.selectNodeContents(firstLi);
              selection.removeAllRanges();
              selection.addRange(range);
            }
          } else {
            // Create new numbered list
            const ol = document.createElement("ol");
            ol.style.listStyleType = "decimal"; // Use 1, 2, 3 numbering
            const li = document.createElement("li");
            try {
              // Extract selected content
              const fragment = range.extractContents();
              li.appendChild(fragment);
              ol.appendChild(li);
              range.insertNode(ol);
              // Select the new li for further editing
              range.selectNodeContents(li);
              selection.removeAllRanges();
              selection.addRange(range);
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
            } catch (e) {
              // Fallback to execCommand for complex selections
              document.execCommand("insertOrderedList", false, null);
            }
          }
        } else {
          // Insert empty list if no selection
          const ol = document.createElement("ol");
          ol.style.listStyleType = "decimal";
          const li = document.createElement("li");
          li.innerText = " ";
          ol.appendChild(li);
          editorRef.current.appendChild(ol);
          // Place cursor in the new li
          const range = document.createRange();
          range.selectNodeContents(li);
          selection.removeAllRanges();
          selection.addRange(range);
        }
        break;
      case "indent":
        document.execCommand("indent", false, null);
        break;
      case "outdent":
        document.execCommand("outdent", false, null);
        break;
      case "alignLeft":
        document.execCommand("justifyLeft", false, null);
        break;
      case "alignCenter":
        document.execCommand("justifyCenter", false, null);
        break;
      case "alignRight":
        document.execCommand("justifyRight", false, null);
        break;
      case "alignJustify":
        document.execCommand("justifyFull", false, null);
        break;
      case "fontSize":
        document.execCommand("fontSize", false, "3"); // Reset to default
        if (range) {
          const span = document.createElement("span");
          span.style.fontSize = `${value}px`;
          range.surroundContents(span);
        }
        break;
      case "fontFamily":
        document.execCommand("fontName", false, value);
        break;
      case "textColor":
        document.execCommand("foreColor", false, value);
        break;
      case "backgroundColor":
        document.execCommand("backColor", false, value);
        break;
      case "highlight":
        if (range) {
          const span = document.createElement("span");
          span.style.backgroundColor = "yellow";
          range.surroundContents(span);
        }
        break;
      case "blockquote":
        if (range) {
          document.execCommand("formatBlock", false, "<blockquote>");
        } else {
          const blockquote = document.createElement("blockquote");
          blockquote.innerText = " ";
          editorRef.current.appendChild(blockquote);
          const range = document.createRange();
          range.selectNodeContents(blockquote);
          selection.removeAllRanges();
          selection.addRange(range);
        }
        break;
      case "code":
        document.execCommand("formatBlock", false, "<pre>");
        break;
      case "link":
        const url = prompt("Enter the URL:", "https://");
        if (url && range) {
          document.execCommand("createLink", false, url);
        }
        break;
      case "table":
        const rows = prompt("Enter number of rows (e.g., 3):", "3");
        const cols = prompt("Enter number of columns (e.g., 3):", "3");
        if (rows && cols && !isNaN(Number(rows)) && !isNaN(Number(cols))) {
          const table = document.createElement("table");
          table.style.borderCollapse = "collapse";
          table.style.width = "100%";
          table.style.border = "1px solid #000";
          table.style.margin = "10px 0";
          for (let i = 0; i < Number(rows); i++) {
            const tr = document.createElement("tr");
            for (let j = 0; j < Number(cols); j++) {
              const td = document.createElement("td");
              td.style.border = "1px solid #000";
              td.style.padding = "8px";
              td.innerText = "Cell";
              tr.appendChild(td);
            }
            table.appendChild(tr);
          }
          if (range) {
            range.insertNode(table);
          } else {
            editorRef.current.appendChild(table);
          }
        } else {
          showToastError("Please enter valid numbers for rows and columns.");
        }
        break;
      case "checkbox":
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.style.margin = "0 8px";
        if (range) {
          range.insertNode(checkbox);
        } else {
          editorRef.current.appendChild(checkbox);
        }
        break;
      case "specialCharacter":
        const char = prompt("Enter a special character (e.g., ©, ™, ★):", "©");
        if (char && range) {
          range.insertNode(document.createTextNode(char));
        } else if (char) {
          editorRef.current.appendChild(document.createTextNode(char));
        }
        break;
      case "cut":
        document.execCommand("cut", false, null);
        break;
      case "copy":
        document.execCommand("copy", false, null);
        break;
      case "paste":
        document.execCommand("paste", false, null);
        break;
      default:
        console.warn(`Unsupported style: ${style}`);
    }

    editorRef.current.focus();
  };

  const handleImageUpload = (event) => {
    event.preventDefault();
    event.stopPropagation();
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showToastError("Image size exceeds 5MB limit.");
        return;
      }
      if (!file.type.startsWith("image/")) {
        showToastError("Please upload a valid image file.");
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        const img = document.createElement("img");
        img.src = reader.result;
        img.style.maxWidth = "100%";
        img.style.height = "auto";
        img.style.margin = "10px 0";
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          range.insertNode(img);
        } else {
          editorRef.current.appendChild(img);
        }
        // Reset the input to prevent toolbar button issues
        event.target.value = "";
      };
      reader.readAsDataURL(file);
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
    if (file && file.type === "application/pdf") {
      setPdf(file);
    } else {
      showToastError("Please upload a valid PDF file");
    }
  };

  const handleDragLeave = () => {
    setDragActive(false);
  };

  return (
    <div className="flex w-full justify-center items-center flex-col">
      <div className="w-full pr-0 lg:pr-4 md:mb-4 mb-0">
        <div className="min-h-[200px] rounded-lg p-4 pt-0">
          <div className="flex w-full flex-col justify-center items-center text-center">
            <div className="flex w-full min-w-fit px-3 md:px-12 py-6 justify-self-center flex-col">
              <div className="flex w-full flex-col justify-between items-center pb-4 gap-4 md:flex-row">
                <h3 className="text-[30px] justify-center md:justify-normal flex w-full font-bold md:text-[38px] leading-[110%] text-p5">
                  Upload PDF File
                </h3>
                <div className="w-full flex justify-end items-center flex-row">
                  <button
                    disabled={!pdf || isProcessing || isDownloading}
                    onClick={downloadPdf}
                    className="flex min-w-fit w-fit justify-center md:justify-end disabled:opacity-40 disabled:cursor-not-allowed rounded-2xl group"
                  >
                    <span className="relative px-4 md:px-8 flex justify-end items-center w-fit before:g7 g4 min-h-fit py-2 rounded-2xl before:absolute before:inset-0 before:opacity-0 before:transition-opacity before:duration-500 before:content-[''] group-hover:before:opacity-100 overflow-hidden">
                      <Image
                        src={`/images/ButtonUtils/download.svg`}
                        alt="logo"
                        width={28}
                        height={28}
                        className="brightness-200"
                      />
                      <span className="font-semibold text-16 flex gap-4 p-4 pr-0 text-p5">
                        {isDownloading ? "Downloading..." : "Download"}
                      </span>
                    </span>
                  </button>
                  {pdf && (
                    <button
                      disabled={isProcessing || isDownloading}
                      onClick={handleUpload}
                      className="flex pl-2 min-w-36 md:min-w-44 items-center justify-normal md:justify-end disabled:opacity-40 disabled:cursor-not-allowed rounded-2xl group"
                    >
                      <span className="relative px-4 md:px-8 flex justify-around items-center w-fit before:g7 g4 min-h-fit py-2 rounded-2xl before:absolute before:inset-0 before:opacity-0 before:transition-opacity before:duration-500 before:content-[''] group-hover:before:opacity-100 overflow-hidden">
                        <Image
                          src={`/images/ButtonUtils/process.svg`}
                          alt="logo"
                          width={28}
                          height={28}
                          className="brightness-200"
                        />
                        <span className="font-semibold text-16 flex gap-4 p-4 pr-6 text-p5">
                          {isProcessing ? "Processing..." : "Process"}
                        </span>
                      </span>
                    </button>
                  )}

                  {(isProcessing || isDownloading) && (
                    <div className="h-12 w-12 flex justify-center items-center">
                      <div className="w-6 h-6 ml-2 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                </div>
              </div>

              <div className="w-full md:mt-3 flex flex-col gap-8">
                <div
                  className={`flex-center ${dragActive ? "scale-105" : ""
                    } min-w-72 md:min-w-full flex h-48 cursor-pointer flex-col gap-5 rounded-[16px] border border-dashed bg-[#7986AC] bg-opacity-20 border-p1 border-opacity-40 justify-center items-center text-white text-center w-full backdrop-blur-lg brightness-125 overflow-hidden shadow-[inset_0_0_10px_rgba(0,0,0,1)]`}
                  onDragOver={handleDrag}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById("fileInput")?.click()}
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
                      className="brightness-125"
                    />
                  </div>
                  <p className="font-normal text-[16px] leading-[140%] brightness-75 text-p5">
                    {pdf ? pdf.name : "Click here to upload PDF"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        {content && (
          <div
            className={`mt-72 md:mt-60 lg:mt-48 scale-95 md:scale-100 relative w-full flex flex-col items-center border border-gray-300  rounded-lg shadow-lg`}
          >
            {/* Toolbar Section */}
            <div className="bg-[linear-gradient(#0a1130,#0d1845)] border border-opacity-50 border-p1 rounded-xl rounded-b-none sm-320:-mt-80 sm-374:-mt-72 -mt-96  sm:-mt-80 md:-mt-[227px] lg:-mt-[197px] xl:-mt-[137px] relative z-20 flex w-full flex-wrap justify-center gap-2 p-2 sm:justify-between">
              <Toolbar
                editor={editorRef}
                applyStyle={applyStyle}
                setFontSize={(size) => applyStyle("fontSize", size)}
                setFontFamily={(font) => applyStyle("fontFamily", font)}
                undo={() => document.execCommand("undo", false, null)}
                redo={() => document.execCommand("redo", false, null)}
                setHighlight={() => applyStyle("highlight")}
                handleImageUpload={handleImageUpload}
                setTextColor={(color) => applyStyle("textColor", color)}
                setBackgroundColor={(color) => applyStyle("backgroundColor", color)}
              />
            </div>

            {/* Editable content area */}
            <div
              ref={editorRef}
              id="containerComplexEditor"
              contentEditable
              dangerouslySetInnerHTML={{ __html:content }}
              className={`editor-container h-[${pdfDimensions.height ? pdfDimensions.height + 50 : 500
                }px] w-full max-w-[95%] overflow-auto p-4`}
              style={{
                height: `${pdfDimensions.height}px`,
                outline: "none",
                scrollbarWidth: "thin",
                scrollbarColor: "rgba(0, 0, 0, 0.6) rgba(0, 0, 0, 0.1)",
              }}
            />
          </div>
        )}
      </div>

      {/* Inline CSS for custom bullet style */}
      <style jsx>{`
        ul {
          list-style-type: disc;
          margin: 10px 0;
          padding-left: 20px;
        }
        ul li {
          margin-bottom: 5px;
        }
      `}</style>
    </div>
  );
}

export default PDFEditorComplex;