import { NextResponse } from "next/server";
import puppeteer from "puppeteer";
import path from "path";
import fs from "fs";

export async function POST(req: Request) {
  try {
    console.log("Received request to generate PDF");

    const { html, width, height } = await req.json();

    if (!html) {
      console.error("No HTML content provided");
      return NextResponse.json({ error: "No HTML content provided" }, { status: 400 });
    }

    if (!width || !height) {
      console.error("Width and height not provided");
      return NextResponse.json({ error: "Width and height not provided" }, { status: 400 });
    }

    const pageWidth = `${width * 1.2}px`;
    const pageHeight = `${height * 1.21}px`;

    const uploadDir = "/tmp/uploads";

    try {
      if (!fs.existsSync(uploadDir)) {
        console.log("Creating uploads directory:", uploadDir);
        fs.mkdirSync(uploadDir, { recursive: true });
      }
    } catch (mkdirErr) {
      console.error("Error creating directory:", mkdirErr);
      return NextResponse.json({ error: "Failed to create directory", details: mkdirErr }, { status: 500 });
    }

    const pdfPath = path.join(uploadDir, "download.pdf");
    console.log("PDF will be saved at:", pdfPath);

    const browser = await puppeteer.launch({
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    console.log("Puppeteer launched successfully");

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });
    console.log("HTML content set in Puppeteer");

    await page.pdf({
      path: pdfPath,
      width: pageWidth,
      height: pageHeight,
      scale: 1,
      printBackground: true,
    });

    console.log("PDF generation complete");

    await browser.close();
    console.log("Puppeteer closed");

    if (!fs.existsSync(pdfPath)) {
      console.error("PDF generation failed: File does not exist");
      return NextResponse.json({ error: "PDF generation failed" }, { status: 500 });
    }

    console.log("Returning success response");
    return NextResponse.json({ success: true, pdfUrl: `/uploads/download.pdf` });

  } catch (error) {
    console.error("Error generating PDF:", error);
    return NextResponse.json({ error: "Failed to generate PDF", details: error }, { status: 500 });
  }
}
