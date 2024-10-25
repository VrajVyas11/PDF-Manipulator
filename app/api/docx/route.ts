import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import pdfParse from 'pdf-parse';
import officegen from 'officegen';

const uploadsDir = path.join(process.cwd(), 'public/uploads');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

export async function POST(request: Request) {
  try {
    const data = await request.formData();
    const pdfFile = data.get('file') as File; // Ensure you are using 'file' key

    if (!pdfFile) {
      return NextResponse.json({ error: 'No file uploaded.' }, { status: 400 });
    }

    const filePath = path.join(uploadsDir, pdfFile.name);
    const buffer = await pdfFile.arrayBuffer();
    fs.writeFileSync(filePath, Buffer.from(buffer));

    const pdfBuffer = Buffer.from(buffer);
    const dataBuffer = await pdfParse(pdfBuffer);
    const docx = officegen('docx');

    return new Promise((resolve, reject) => {
      docx.on('error', (err: any) => {
        console.error(err);
        resolve(NextResponse.json({ error: 'Error creating DOCX file.' }, { status: 500 }));
      });

      docx.createP().addText(dataBuffer.text);

      const docxPath = path.join(uploadsDir, 'output.docx'); // Save to a specific file
      const out = fs.createWriteStream(docxPath);
      docx.generate(out);

      out.on('close', () => {
        console.log('DOCX file created successfully');
        const res = NextResponse.json({ message: 'DOCX file created successfully.', url: '/uploads/output.docx' }, { status: 200 });
        resolve(res);
      });
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error processing PDF file.' }, { status: 500 });
  }
}
