import { NextResponse } from "next/server";
import puppeteer from "puppeteer";
import path from "path";

export async function POST(req: Request) {
  try {
    const { html, width, height } = await req.json();

    if (!html) return NextResponse.json({ error: "No HTML content provided" }, { status: 400 });

    if (width && height) {
      const pageWidth = `${width*1.20}px`;
      const pageHeight = `${height*1.21}px`;

      const browser = await puppeteer.launch();
      const page = await browser.newPage();

      await page.setContent(html, { waitUntil: "networkidle0" });


      const pdfPath = path.join(process.cwd(), "public", "uploads", "download.pdf");

      await page.pdf({
        path: pdfPath,
        width: pageWidth,
        height: pageHeight,
        scale:1,
        printBackground: true,
      });

      await browser.close();

      return NextResponse.json({ success: true, pdfUrl: `/uploads/download.pdf` });
    } else {
      return NextResponse.json({ error: "Width and height not provided" }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({ error: "Failed to generate PDF", details: error }, { status: 500 });
  }
}
