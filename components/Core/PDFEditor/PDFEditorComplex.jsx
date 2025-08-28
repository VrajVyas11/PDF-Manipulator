"use client";
import { useState, useRef, useCallback, useEffect } from "react";
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
  const fileInputRef = useRef(null);
  const abortControllerRef = useRef(null);
  const { toast } = useToast();

  // Cleanup function for aborting requests
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const showToastError = useCallback((message) => {
    toast({
      variant: "destructive",
      title: (
        <div className="flex items-center w-full gap-3">
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

  // Enhanced file validation
  const validatePDFFile = useCallback((file) => {
    if (!file) return { valid: false, error: "No file selected" };
    
    if (file.type !== "application/pdf") {
      return { valid: false, error: "Please upload a valid PDF file" };
    }
    
    if (file.size > 100 * 1024 * 1024) { // 100MB limit
      return { valid: false, error: "PDF file size exceeds 100MB limit" };
    }
    
    if (file.size === 0) {
      return { valid: false, error: "PDF file appears to be empty" };
    }
    
    return { valid: true };
  }, []);

  // Enhanced PDF processing with retry logic
  const handleUpload = useCallback(async () => {
    const validation = validatePDFFile(pdf);
    if (!validation.valid) {
      return showToastError(validation.error);
    }

    // Abort previous request if still running
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    setIsProcessing(true);

    try {
      // Validate PDF structure first
      const fileReader = new FileReader();
      const pdfValidation = new Promise((resolve, reject) => {
        fileReader.onload = async (e) => {
          try {
            const uint8Array = new Uint8Array(e.target.result);
            const pdfDoc = await PDFDocument.load(uint8Array);
            const pages = pdfDoc.getPages();
            
            if (pages.length === 0) {
              reject(new Error("PDF contains no pages"));
              return;
            }
            
            const { width, height } = pages[0].getSize();
            setPdfDimensions({ width: Math.round(width), height: Math.round(height) });
            resolve(uint8Array);
          } catch {
            reject(new Error("Invalid or corrupted PDF file"));
          }
        };
        fileReader.onerror = () => reject(new Error("Failed to read PDF file"));
      });

      fileReader.readAsArrayBuffer(pdf);
      await pdfValidation;

      if (signal.aborted) return;


      // Prepare form data with timeout
      const formData = new FormData();
      formData.append("pdf", pdf);


      // Make request with timeout and retry logic
      let attempt = 0;
      const maxAttempts = 2;
      let lastError;

      while (attempt < maxAttempts && !signal.aborted) {
        try {
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error("Request timeout")), 120000) // 2 minutes
          );

          const fetchPromise = fetch("/api/PdfToHtml", {
            method: "POST",
            body: formData,
            signal,
          });

          const res = await Promise.race([fetchPromise, timeoutPromise]);

          if (!res.ok) {
            const errorData = await res.json();
            throw new Error(`Server error ${res.status}: ${errorData.error || 'Unknown error'}`);
          }

          const data = await res.json();
          if (!data.url) {
            throw new Error("Invalid server response: No URL provided");
          }


          // Fetch HTML with timeout
          const htmlTimeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error("HTML fetch timeout")), 60000) // 1 minute
          );

          const htmlFetchPromise = fetch(data.url, { signal });
          const htmlRes = await Promise.race([htmlFetchPromise, htmlTimeoutPromise]);

          if (!htmlRes.ok) {
            throw new Error(`Failed to fetch HTML: ${htmlRes.status} ${htmlRes.statusText}`);
          }

          const htmlText = await htmlRes.text();
          
          if (!htmlText.trim()) {
            throw new Error("Received empty HTML content");
          }

          setContent(htmlText);
          
          // Success - break out of retry loop
          break;

        } catch (error) {
          lastError = error;
          attempt++;
          
          if (signal.aborted) return;
          
          if (attempt < maxAttempts) {
            // Wait before retry with exponential backoff
            await new Promise(resolve => setTimeout(resolve, 2000 * attempt));
          }
        }
      }

      if (attempt >= maxAttempts) {
        throw lastError || new Error("Maximum retry attempts exceeded");
      }

    } catch (error) {
      if (signal.aborted) return;
      
      let errorMessage = "Failed to process PDF. ";
      
      if (error.name === 'AbortError') return;
      if (error.message.includes('timeout')) {
        errorMessage += "Request timed out. Please try again.";
      } else if (error.message.includes('network')) {
        errorMessage += "Network error. Please check your connection.";
      } else if (error.message.includes('Server error 5')) {
        errorMessage += "Server is temporarily unavailable. Please try again.";
      } else {
        errorMessage += error.message || "Please try again.";
      }
      
      showToastError(errorMessage);
    } finally {
      setIsProcessing(false);
      abortControllerRef.current = null;
    }
  }, [pdf, showToastError, validatePDFFile]);

  // Enhanced PDF download with better error handling
  const downloadPdf = useCallback(async () => {
    const element = editorRef.current;
    if (!element?.innerHTML?.trim()) {
      return showToastError("No content available to download. Please process a PDF first.");
    }

    if (!pdfDimensions.width || !pdfDimensions.height) {
      return showToastError("PDF dimensions not available. Please upload and process a PDF first.");
    }

    // Abort previous request if still running
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    setIsDownloading(true);

    try {
      const htmlContent = element.innerHTML;
      
      // Validate HTML content
      if (!htmlContent || htmlContent.length < 10) {
        throw new Error("Content is too short or invalid");
      }

      const requestPayload = {
        html: htmlContent,
        width: Math.round(pdfDimensions.width),
        height: Math.round(pdfDimensions.height),
      };

      // Make request with timeout and retry logic
      let attempt = 0;
      const maxAttempts = 2;
      let lastError;

      while (attempt < maxAttempts && !signal.aborted) {
        try {
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error("Request timeout")), 90000) // 1.5 minutes
          );

          const fetchPromise = fetch("/api/MakePdf", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestPayload),
            signal,
          });

          const response = await Promise.race([fetchPromise, timeoutPromise]);
          
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(`Server error ${response.status}: ${errorData.error || response.statusText}`);
          }

          const data = await response.json();
          
          if (!data.success || !data.url) {
            throw new Error(data.error || "Failed to generate PDF: Invalid response");
          }

          // Download PDF with timeout
          const pdfTimeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error("PDF download timeout")), 60000)
          );

          const pdfFetchPromise = fetch(data.url, { signal });
          const pdfResponse = await Promise.race([pdfFetchPromise, pdfTimeoutPromise]);
          
          if (!pdfResponse.ok) {
            throw new Error(`Failed to download PDF: ${pdfResponse.status} ${pdfResponse.statusText}`);
          }

          const blob = await pdfResponse.blob();
          
          if (blob.size === 0) {
            throw new Error("Generated PDF is empty");
          }

          // Create download link
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = `edited-document-${Date.now()}.pdf`;
          
          // Trigger download
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          
          // Cleanup
          setTimeout(() => URL.revokeObjectURL(url), 1000);
          
          // Success - break out of retry loop
          break;

        } catch (error) {
          lastError = error;
          attempt++;
          
          if (signal.aborted) return;
          
          if (attempt < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 1500 * attempt));
          }
        }
      }

      if (attempt >= maxAttempts) {
        throw lastError || new Error("Maximum retry attempts exceeded");
      }

    } catch (error) {
      if (signal.aborted) return;
      
      let errorMessage = "Failed to download PDF. ";
      
      if (error.message.includes('timeout')) {
        errorMessage += "Request timed out. Please try again.";
      } else if (error.message.includes('network')) {
        errorMessage += "Network error. Please check your connection.";
      } else if (error.message.includes('Server error 5')) {
        errorMessage += "Server is temporarily unavailable. Please try again.";
      } else {
        errorMessage += error.message || "Please try again.";
      }
      
      showToastError(errorMessage);
    } finally {
      setIsDownloading(false);
      abortControllerRef.current = null;
    }
  }, [pdfDimensions.height, pdfDimensions.width, showToastError]);

    // Helper functions for complex operations
  const handleListCommand = useCallback((listType, styleType) => {
    const selection = window.getSelection();
    if (!selection.rangeCount) return;
    
    const range = selection.getRangeAt(0);
    const commonAncestor = range.commonAncestorContainer;
    
    const findParentList = (element, tagName) => {
      let current = element.nodeType === 1 ? element : element.parentElement;
      while (current && current !== editorRef.current) {
        if (current.tagName === tagName.toUpperCase()) {
          return current;
        }
        current = current.parentElement;
      }
      return null;
    };
    
    const parentUl = findParentList(commonAncestor, "ul");
    const parentOl = findParentList(commonAncestor, "ol");
    const targetList = listType === "ul" ? parentUl : parentOl;
    const otherList = listType === "ul" ? parentOl : parentUl;
    
    if (targetList) {
      // Remove list - convert to paragraph
      const li = range.startContainer.nodeType === 1 ? 
        range.startContainer.closest("li") : 
        range.startContainer.parentElement?.closest("li");
      
      if (li) {
        const p = document.createElement("p");
        p.innerHTML = li.innerHTML;
        targetList.parentNode.replaceChild(p, targetList);
        
        const newRange = document.createRange();
        newRange.selectNodeContents(p);
        selection.removeAllRanges();
        selection.addRange(newRange);
      }
    } else if (otherList) {
      // Convert between list types
      const newList = document.createElement(listType);
      newList.style.listStyleType = styleType;
      
      Array.from(otherList.children).forEach(li => {
        const newLi = document.createElement("li");
        newLi.innerHTML = li.innerHTML;
        newList.appendChild(newLi);
      });
      
      otherList.parentNode.replaceChild(newList, otherList);
      
      const firstLi = newList.querySelector("li");
      if (firstLi) {
        const newRange = document.createRange();
        newRange.selectNodeContents(firstLi);
        selection.removeAllRanges();
        selection.addRange(newRange);
      }
    } else {
      // Create new list
      const list = document.createElement(listType);
      list.style.listStyleType = styleType;
      const li = document.createElement("li");
      
      if (range.collapsed) {
        li.innerHTML = "&nbsp;";
        list.appendChild(li);
        
        if (range.startContainer === editorRef.current) {
          editorRef.current.appendChild(list);
        } else {
          range.insertNode(list);
        }
        
        const newRange = document.createRange();
        newRange.selectNodeContents(li);
        selection.removeAllRanges();
        selection.addRange(newRange);
      } else {
        const fragment = range.extractContents();
        li.appendChild(fragment);
        list.appendChild(li);
        range.insertNode(list);
        
        const newRange = document.createRange();
        newRange.selectNodeContents(li);
        selection.removeAllRanges();
        selection.addRange(newRange);
      }
    }
  }, []);

  const applySpanStyle = useCallback((range, property, value) => {
    if (!range || range.collapsed) return;
    
    try {
      const span = document.createElement("span");
      span.style[property] = value;
      
      const contents = range.extractContents();
      span.appendChild(contents);
      range.insertNode(span);
      
      const newRange = document.createRange();
      newRange.selectNodeContents(span);
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(newRange);
    } catch (error) {
      console.error("Error applying span style:", error);
    }
  }, []);

  const insertTable = useCallback(() => {
    const rows = parseInt(prompt("Enter number of rows (1-20):", "3"));
    const cols = parseInt(prompt("Enter number of columns (1-10):", "3"));
    
    if (!rows || !cols || rows < 1 || rows > 20 || cols < 1 || cols > 10) {
      showToastError("Please enter valid numbers (rows: 1-20, columns: 1-10)");
      return;
    }
    
    const table = document.createElement("table");
    table.style.cssText = `
      border-collapse: collapse;
      width: 100%;
      border: 1px solid #000;
      margin: 10px 0;
    `;
    
    for (let i = 0; i < rows; i++) {
      const tr = document.createElement("tr");
      for (let j = 0; j < cols; j++) {
        const td = document.createElement("td");
        td.style.cssText = `
          border: 1px solid #000;
          padding: 8px;
          min-width: 50px;
          min-height: 25px;
        `;
        td.innerHTML = "&nbsp;";
        tr.appendChild(td);
      }
      table.appendChild(tr);
    }
    
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      range.insertNode(table);
    } else {
      editorRef.current.appendChild(table);
    }
  }, [showToastError]);

  const insertCheckbox = useCallback((range) => {
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.style.margin = "0 8px";
    checkbox.addEventListener('change', (e) => e.preventDefault()); // Prevent state change in editor
    
    if (range && !range.collapsed) {
      range.insertNode(checkbox);
    } else {
      editorRef.current.appendChild(checkbox);
    }
  }, []);

  const insertText = useCallback((range, text) => {
    const textNode = document.createTextNode(text);
    if (range) {
      range.insertNode(textNode);
    } else {
      editorRef.current.appendChild(textNode);
    }
  }, []);

  // Enhanced image upload handler
  const handleImageUpload = useCallback((event) => {
    event.preventDefault();
    event.stopPropagation();
    
    const file = event.target.files?.[0];
    if (!file) return;
    
    // Validate file
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      showToastError("Image size exceeds 10MB limit.");
      return;
    }
    
    if (!file.type.startsWith("image/")) {
      showToastError("Please upload a valid image file.");
      return;
    }
    
    // Validate image type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      showToastError("Supported image formats: JPEG, PNG, GIF, WebP");
      return;
    }
    
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const img = document.createElement("img");
        img.src = reader.result;
        img.style.cssText = `
          max-width: 100%;
          height: auto;
          margin: 10px 0;
          border-radius: 4px;
        `;
        
        // Error handling for image loading
        img.onerror = () => {
          showToastError("Failed to load image. Please try a different file.");
        };
        
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          range.insertNode(img);
        } else {
          editorRef.current.appendChild(img);
        }
        
        // Reset input
        event.target.value = "";
      } catch (error) {
        showToastError("Failed to process image. Please try again.");
        console.error("Image upload error:", error);
      }
    };
    
    reader.onerror = () => {
      showToastError("Failed to read image file.");
    };
    
    reader.readAsDataURL(file);
  }, [showToastError]);

  // Enhanced apply style with better selection handling
  const applyStyle = useCallback((style, value = null) => {
    if (!editorRef.current) return;

    const selection = window.getSelection();
    if (!selection) return;
    
    const range = selection.rangeCount > 0 ? selection.getRangeAt(0) : null;

    // Store selection for restoration if needed
    const saveSelection = () => {
      if (range) {
        return {
          startContainer: range.startContainer,
          startOffset: range.startOffset,
          endContainer: range.endContainer,
          endOffset: range.endOffset
        };
      }
      return null;
    };

    const restoreSelection = (savedSelection) => {
      if (savedSelection && selection) {
        try {
          const newRange = document.createRange();
          newRange.setStart(savedSelection.startContainer, savedSelection.startOffset);
          newRange.setEnd(savedSelection.endContainer, savedSelection.endOffset);
          selection.removeAllRanges();
          selection.addRange(newRange);
        } catch (e) {
          console.warn("Failed to restore selection:", e);
        }
      }
    };

    const savedSelection = saveSelection();

    try {
      switch (style) {
        case "bold":
        case "italic":
        case "underline":
        case "strike":
          const commands = {
            bold: "bold",
            italic: "italic", 
            underline: "underline",
            strike: "strikethrough"
          };
          document.execCommand(commands[style], false, null);
          break;

        case "heading":
          if (value >= 1 && value <= 6) {
            document.execCommand("formatBlock", false, `<h${value}>`);
          }
          break;

        case "bulletList":
          handleListCommand("ul", "disc");
          break;

        case "orderedList":
          handleListCommand("ol", "decimal");
          break;

        case "indent":
        case "outdent":
          document.execCommand(style, false, null);
          break;

        case "alignLeft":
        case "alignCenter":
        case "alignRight":
        case "alignJustify":
          const alignCommands = {
            alignLeft: "justifyLeft",
            alignCenter: "justifyCenter",
            alignRight: "justifyRight",
            alignJustify: "justifyFull"
          };
          document.execCommand(alignCommands[style], false, null);
          break;

        case "fontSize":
          if (value && range) {
            applySpanStyle(range, "fontSize", `${value}px`);
          }
          break;

        case "fontFamily":
          if (value) {
            document.execCommand("fontName", false, value);
          }
          break;

        case "textColor":
        case "backgroundColor":
          if (value) {
            const command = style === "textColor" ? "foreColor" : "backColor";
            document.execCommand(command, false, value);
          }
          break;

        case "highlight":
          if (range) {
            applySpanStyle(range, "backgroundColor", "yellow");
          }
          break;

        case "blockquote":
          document.execCommand("formatBlock", false, "<blockquote>");
          break;

        case "code":
          document.execCommand("formatBlock", false, "<pre>");
          break;

        case "link":
          const url = prompt("Enter the URL:", "https://");
          if (url && url.trim() && range) {
            // Validate URL
            try {
              new URL(url);
              document.execCommand("createLink", false, url);
            } catch {
              showToastError("Please enter a valid URL");
            }
          }
          break;

        case "table":
          insertTable();
          break;

        case "checkbox":
          insertCheckbox(range);
          break;

        case "specialCharacter":
          const char = prompt("Enter a special character (e.g., ©, ™, ★):", "©");
          if (char && char.trim()) {
            insertText(range, char);
          }
          break;

        case "cut":
        case "copy":
        case "paste":
          document.execCommand(style, false, null);
          break;

        default:
          console.warn(`Unsupported style: ${style}`);
      }
    } catch (error) {
      console.error("Error applying style:", error);
      restoreSelection(savedSelection);
    }

    editorRef.current.focus();
  }, [applySpanStyle, handleListCommand, insertCheckbox, insertTable, insertText, showToastError]);

  // Enhanced drag and drop handlers
  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    const pdfFile = files.find(file => file.type === "application/pdf");
    
    if (pdfFile) {
      const validation = validatePDFFile(pdfFile);
      if (validation.valid) {
        setPdf(pdfFile);
      } else {
        showToastError(validation.error);
      }
    } else {
      showToastError("Please drop a valid PDF file");
    }
  }, [validatePDFFile, showToastError]);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Only set dragActive to false if we're leaving the drop zone entirely
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setDragActive(false);
    }
  }, []);

  // Enhanced file input handler
  const handleFileInputChange = useCallback((e) => {
    const file = e.target.files?.[0];
    if (file) {
      const validation = validatePDFFile(file);
      if (validation.valid) {
        setPdf(file);
      } else {
        showToastError(validation.error);
        // Reset input
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    }
  }, [validatePDFFile, showToastError]);

  // Reset function for cleanup
  // const resetEditor = useCallback(() => {
  //   setContent("");
  //   setPdf(null);
  //   setPdfDimensions({ width: null, height: null });
  //   setUploadProgress(0);
    
  //   if (fileInputRef.current) {
  //     fileInputRef.current.value = "";
  //   }
    
  //   if (abortControllerRef.current) {
  //     abortControllerRef.current.abort();
  //     abortControllerRef.current = null;
  //   }
  // }, []);

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
                    disabled={!content || isProcessing || isDownloading}
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
                  onDragEnter={handleDrag}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="rounded-[16px] bg-s0/40 p-5 shadow-sm shadow-purple-200/50">
                    <input
                      ref={fileInputRef}
                      id="fileInput"
                      type="file"
                      accept=".pdf,application/pdf"
                      className="hidden"
                      onChange={handleFileInputChange}
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
                    {pdf ? `Selected: ${pdf.name}` : "Click here to upload PDF"}
                  </p>
                  {dragActive && (
                    <p className="font-normal text-[14px] leading-[140%] brightness-90 text-blue-300">
                      Drop your PDF file here
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        {content && (
          <div
            className={`mt-72 md:mt-60 lg:mt-48 scale-95 md:scale-100 relative w-full flex flex-col items-center border border-gray-300 rounded-lg shadow-lg`}
          >
            <div className="bg-[linear-gradient(#0a1130,#0d1845)] border border-opacity-50 border-p1 rounded-xl rounded-b-none sm-320:-mt-80 sm-374:-mt-72 -mt-96 sm:-mt-80 md:-mt-[227px] lg:-mt-[197px] xl:-mt-[137px] relative z-20 flex w-full flex-wrap justify-center gap-2 p-2 sm:justify-between">
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

            <div
              ref={editorRef}
              id="containerComplexEditor"
              contentEditable
              dangerouslySetInnerHTML={{ __html: content }}
              className={`editor-container h-[${pdfDimensions.height ? pdfDimensions.height + 50 : 500
                }px] w-full max-w-[95%] overflow-auto p-4`}
              style={{
                height: `${pdfDimensions.height || 500}px`,
                outline: "none",
                scrollbarWidth: "thin",
                scrollbarColor: "rgba(0, 0, 0, 0.6) rgba(0, 0, 0, 0.1)",
                lineHeight: "1.6",
                fontFamily: "inherit",
              }}
              onInput={(e) => {
                // Auto-save functionality can be added here
                // For now, just ensure content stays clean
                if (e.target.innerHTML.trim() === "<br>" || e.target.innerHTML.trim() === "") {
                  e.target.innerHTML = "&nbsp;";
                }
              }}
              onPaste={(e) => {
                // Enhanced paste handling
                e.preventDefault();
                const text = e.clipboardData.getData('text/plain');
                if (text) {
                  document.execCommand('insertText', false, text);
                }
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default PDFEditorComplex