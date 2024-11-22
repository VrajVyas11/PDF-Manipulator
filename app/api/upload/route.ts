import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import pdf2json from "pdf2json";

const uploadsDir = path.join(process.cwd(), 'public/uploads');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

export async function POST(request: Request) {
  try {
    const data = await request.formData();
    const pdfFile = data.get('pdf') as File;

    const filePath = path.join(uploadsDir, pdfFile.name);

    const buffer = await pdfFile.arrayBuffer();
    fs.writeFileSync(filePath, Buffer.from(buffer));

    console.log("Received PDF file:", pdfFile.name);

    const pdfParser = new pdf2json();

    return new Promise<Response>((resolve, reject) => {
      pdfParser.on('pdfParser_dataReady', (pdfData) => {
        const extractedDataPath = path.join(uploadsDir, 'extractedData.json');
        fs.writeFileSync(extractedDataPath, JSON.stringify(pdfData));

        fs.unlinkSync(filePath);

        resolve(NextResponse.json({
          ok: "OK",
          message: 'PDF extracted successfully',
          dataUrl: '/uploads/extractedData.json',
        }));
      });

      pdfParser.on('pdfParser_dataError', (err) => {
        console.error('Error during PDF parsing:', err.parserError);
        resolve(NextResponse.json({ error: 'Error occurred while processing the PDF' }, { status: 500 }));
      });

      pdfParser.loadPDF(filePath);
    });

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Error occurred while processing the request' }, { status: 500 });
  }
}
