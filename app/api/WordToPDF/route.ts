import { NextResponse } from "next/server";
import mammoth from "mammoth";
import puppeteer from "puppeteer";
import path from "path";
import fs from "fs";
import os from "os";

// Utility function to convert Node.js ReadStream to Web ReadableStream
function nodeStreamToWebStream(nodeStream: fs.ReadStream): ReadableStream {
  return new ReadableStream({
    start(controller) {
      nodeStream.on("data", (chunk) => {
        controller.enqueue(chunk);
      });

      nodeStream.on("end", () => {
        controller.close();
      });

      nodeStream.on("error", (err) => {
        controller.error(err);
      });
    },
  });
}

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
      fs.readdirSync(tempDir).forEach((fileName: string) => {
        const filePath = path.join(tempDir, fileName);
        fs.unlinkSync(filePath);
        console.log(`Cleaned up file: ${filePath}`);
      });
    } catch (dirError: unknown) {
      console.error("Directory error:", dirError);
      return NextResponse.json({ error: "Failed to create or clean temporary directory" }, { status: 500 });
    }

    const docxPath = path.join(tempDir, "upload.docx");
    const pdfPath = path.join(tempDir, "converted.pdf");

    try {
      const buffer = Buffer.from(await file.arrayBuffer());
      fs.writeFileSync(docxPath, buffer);
      console.log(`Wrote .docx file to: ${docxPath}`);
    } catch (writeError: unknown) {
      console.error("Write error:", writeError);
      return NextResponse.json({ error: "Failed to write .docx file" }, { status: 500 });
    }

    // Convert .docx to HTML using mammoth
    let htmlContent: string;
    try {
      // Simple styleMap as array of strings to avoid issues
      const styleMap: string[] = [
        "p[style-name='Heading 1'] => h1:fresh",
        "p[style-name='Heading 2'] => h2:fresh",
        "p[style-name='Heading 3'] => h3:fresh",
        "p[style-name='Normal'] => p.normal",
        "p[alignment='center'] => p.center",
        "p[alignment='right'] => p.right",
        "p[alignment='justify'] => p.justify",
        "p[style-name='List Bullet'] => ul > li:fresh",
        "p[style-name='List Number'] => ol > li:fresh",
        "table => table.doc-table",
        "table tr => tr.doc-tr",
        "table th => th.doc-th",
        "table td => td.doc-td",
        "r[b] => strong",
        "r[i] => em",
        "r[u] => u",
        "r[strike] => del",
        "r[font='Calibri'] => span.calibri",
        "r[font='Arial'] => span.arial",
        "r[color='red'] => span.text-red",
        "r[color='blue'] => span.text-blue",
        "p[style-name='Header'] => !",
        "p[style-name='Footer'] => !"
      ];

      const result = await mammoth.convertToHtml({ 
        path: docxPath,
        styleMap 
      } as {path:string});
      htmlContent = result.value;
      console.log("Successfully converted .docx to HTML");
    } catch (mammothError: unknown) {
      console.error("Mammoth conversion error:", mammothError);
      return NextResponse.json(
        { error: "Failed to convert .docx to HTML: " + (mammothError as Error).message },
        { status: 500 }
      );
    }

    // Enhanced HTML with CSS to preserve styling
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Calibri:wght@400;700&family=Arial:wght@400;700&display=swap');
            body {
              margin: 10mm;
              line-height: 1.6;
              font-family: 'Calibri', Arial, sans-serif;
              font-size: 11pt;
              color: #000;
            }
            /* Headings */
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
            /* Fonts and colors */
            span.calibri { font-family: 'Calibri', sans-serif; }
            span.arial { font-family: Arial, sans-serif; }
            span.text-red { color: red; }
            span.text-blue { color: blue; }
            /* Lists */
            ul, ol { margin: 1em 0; padding-left: 40px; }
            /* Constrain images */
            img {
              max-width: 100%;
              height: auto;
            }
            /* Print tweaks */
            @media print { body { -webkit-print-color-adjust: exact; } }
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
    } catch (puppeteerError: unknown) {
      console.error("Puppeteer error:", puppeteerError);
      return NextResponse.json(
        { error: "Failed to convert HTML to PDF: " + (puppeteerError as Error).message },
        { status: 500 }
      );
    }

    // Stream the PDF to client
    try {
      const pdfStream = fs.createReadStream(pdfPath);
      const webStream = nodeStreamToWebStream(pdfStream);

      const response = new NextResponse(webStream, {
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
        } catch (cleanupError: unknown) {
          console.error("Cleanup error:", cleanupError);
        }
      });

      return response;
    } catch (streamError: unknown) {
      console.error("Stream error:", streamError);
      return NextResponse.json({ error: "Failed to stream PDF" }, { status: 500 });
    }
  } catch (error: unknown) {
    console.error("General error:", error);
    return NextResponse.json({ error: `Internal server error: ${(error as Error).message}` }, { status: 500 });
  }
}