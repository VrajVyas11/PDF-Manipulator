/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextResponse } from "next/server";
import mammoth from "mammoth";
import puppeteer from "puppeteer";
import path from "path";
import fs from "fs";
import os from "os";

export async function POST(req: Request): Promise<Response> {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file || file.type !== "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
      console.error("Validation failed: Invalid or missing .docx file");
      return NextResponse.json({ error: "Invalid or missing .docx file" }, { status: 400 });
    }

    // Use os.tmpdir() for cross-platform temp directory
    const tempDir = path.join(os.tmpdir(), "Uploads");
    try {
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
        console.log(`Created temporary directory: ${tempDir}`);
      }

      // Clean up the directory before processing
      fs.readdirSync(tempDir).forEach((file) => {
        const filePath = path.join(tempDir, file);
        fs.unlinkSync(filePath);
        console.log(`Cleaned up file: ${filePath}`);
      });
    } catch (dirError) {
      console.error("Directory error:", dirError);
      return NextResponse.json({ error: "Failed to create or clean temporary directory" }, { status: 500 });
    }

    const docxPath = path.join(tempDir, "upload.docx");
    const pdfPath = path.join(tempDir, "converted.pdf");

    try {
      const buffer = Buffer.from(await file.arrayBuffer());
      fs.writeFileSync(docxPath, buffer);
      console.log(`Wrote .docx file to: ${docxPath}`);
    } catch (writeError) {
      console.error("Write error:", writeError);
      return NextResponse.json({ error: "Failed to write .docx file" }, { status: 500 });
    }

    // Convert .docx to HTML using mammoth with style mapping
    let htmlContent;
    try {
     // const styleMap = [
        // Map common style names
      //  "p[style-name='Heading 1'] => h1:fresh",
      //  "p[style-name='Heading 2'] => h2:fresh",
      //  "p[style-name='Heading 3'] => h3:fresh",
   //   "p[style-name='Normal'] => p.normal:fresh",
        // Preserve inline alignments
       // "p[style*='text-align: center'] => p.center:fresh",
      //  "p[style*='text-align: right'] => p.right:fresh",
      //  "p[style*='text-align: justify'] => p.justify:fresh",
        // Preserve inline font sizes and other styles
      //  "p[style*='font-size'] => p.styled:fresh",
      //  "r[style*='font-size'] => span.styled:fresh",
      //  "r[style*='font-family'] => span.styled:fresh",
        // Bold and italic
      //  "r[style-name='Strong'] => strong:fresh",
     //   "r[style-name='Emphasis'] => em:fresh",
        // Tables
     // "table => table.doc-table:fresh",
      //  "tr => tr.doc-tr:fresh",
     //   "td => td.doc-td:fresh",
     //   "th => th.doc-th:fresh",
     // ];

      const result = await mammoth.convertToHtml({ path: docxPath });
      htmlContent = result.value;
      console.log("Successfully converted .docx to HTML");
    } catch (mammothError) {
      console.error("Mammoth conversion error:", mammothError);
      return NextResponse.json({ error: "Failed to convert .docx to HTML: " + (mammothError as Error).message }, { status: 500 });
    }

    // Enhanced HTML with CSS to preserve styling dynamically
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body {
              margin: 10mm;
              line-height: 1.6;
              font-family: Arial, sans-serif;
            }
            /* Headings (default sizes for fallback) */
            h1 { font-size: 24pt; font-weight: bold; margin: 0.67em 0; }
            h2 { font-size: 18pt; font-weight: bold; margin: 0.83em 0; }
            h3 { font-size: 14pt; font-weight: bold; margin: 1em 0; }
            /* Paragraphs */
            p.normal { margin: 0.5em 0; }
            p.center { text-align: center; }
            p.right { text-align: right; }
            p.justify { text-align: justify; }
            /* Preserve inline styles */
            p.styled, span.styled {
              font-size: inherit !important;
              font-family: inherit !important;
              text-align: inherit !important;
            }
            /* Text styles */
            strong { font-weight: bold; }
            em { font-style: italic; }
            /* Tables */
            table, table.doc-table {
              border-collapse: collapse;
              width: 100%;
              margin: 1em 0;
              border: 1px solid #000;
            }
            table.doc-table tr.doc-tr, table tr {
              border: 1px solid #000;
            }
            table.doc-table tr.doc-tr th.doc-th,
            table.doc-table tr.doc-tr td.doc-td,
            table tr th,
            table tr td {
              border: 1px solid #000;
              padding: 8px;
              vertical-align: top;
              text-align: left;
            }
            table.doc-table tr.doc-tr th.doc-th,
            table tr th {
              background-color: #f2f2f2;
              font-weight: bold;
            }
            /* Constrain images */
            img {
              max-width: 100%;
              height: auto;
            }
          </style>
        </head>
        <body>
          ${htmlContent}
        </body>
      </html>
    `;

    // Convert HTML to PDF using puppeteer
    try {
      const browser = await puppeteer.launch({
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      });
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: "networkidle0" });
      await page.pdf({
        path: pdfPath,
        format: "A4",
        margin: { top: "10mm", right: "10mm", bottom: "10mm", left: "10mm" },
        printBackground: true,
        preferCSSPageSize: true,
      });
      await browser.close();
      console.log(`Generated PDF at: ${pdfPath}`);
    } catch (puppeteerError) {
      console.error("Puppeteer error:", puppeteerError);
      return NextResponse.json({ error: "Failed to convert HTML to PDF: " + (puppeteerError as Error).message }, { status: 500 });
    }

    // Stream the PDF to client
    try {
      const pdfStream = fs.createReadStream(pdfPath);
      const response = new NextResponse(pdfStream, {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": "attachment; filename=converted.pdf",
        },
      });

      // Clean up files after streaming
      pdfStream.on("end", () => {
        try {
          fs.unlinkSync(docxPath);
          fs.unlinkSync(pdfPath);
          console.log("Cleaned up temporary files");
        } catch (cleanupError) {
          console.error("Cleanup error:", cleanupError);
        }
      });

      return response;
    } catch (streamError) {
      console.error("Stream error:", streamError);
      return NextResponse.json({ error: "Failed to stream PDF" }, { status: 500 });
    }
  } catch (error) {
    console.error("General error:", error);
    return NextResponse.json({ error: `Internal server error: ${(error as Error).message}` }, { status: 500 });
  }
}
