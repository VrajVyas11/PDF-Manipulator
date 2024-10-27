import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import pdfParse from 'pdf-parse';
import officegen from 'officegen';

const uploadsDir = path.join(process.cwd(), 'public/uploads');

export async function POST(request: Request) {
  try {
    const data = await request.formData();
    const pdfFile = data.get('file') as File;

    if (!pdfFile) {
      return NextResponse.json({ error: 'No file uploaded.' }, { status: 400 });
    }

    const buffer = await pdfFile.arrayBuffer();
    const pdfBuffer = Buffer.from(buffer);
    const dataBuffer = await pdfParse(pdfBuffer);
    const docx = officegen('docx');

    docx.on('error', (err: any) => {
      console.error(err);
      return NextResponse.json({ error: 'Error creating DOCX file.' }, { status: 500 });
    });

    docx.createP().addText(dataBuffer.text);

    const docxPath = path.join(uploadsDir, 'output.docx');
    const out = fs.createWriteStream(docxPath);
    docx.generate(out);

    return new Promise((resolve) => {
      out.on('close', () => {
        console.log('DOCX file created successfully');
        const url = '/uploads/output.docx';
        resolve(NextResponse.json({ message: 'DOCX file created successfully.', url }, { status: 200 }));
      });
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error processing PDF file.' }, { status: 500 });
  }
}
