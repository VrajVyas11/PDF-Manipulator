import { NextResponse } from "next/server";
// import fs from 'fs';
import {
  // drawImage,
  // drawRectangle,
  PDFDocumentFactory,
  // PDFDocumentWriter,
  PDFName,
  PDFRawStream,
} from '@/legacy-pdf-lib/node_modules/pdf-lib';

export async function POST(request: Request) {
  try {
    // const originalPdfPath = './public/uploads/drylab.pdf';
    // const pdfBytes = fs.readFileSync(originalPdfPath); // Read the PDF file directly
    // console.log('PDF Bytes:', pdfBytes.slice(0, 20)); // Log first 20 bytes
    const data = await request.formData();
    const pdfFile = data.get('pdf') as File;

    const buffer = await pdfFile.arrayBuffer()
    const pdfDoc = PDFDocumentFactory.load(new Uint8Array(buffer)); // Convert to Uint8Array
;

    const imagesInDoc: any[] = [];
    let objectIdx = 0;

    pdfDoc.index.index.forEach((pdfObject, ref) => {
      objectIdx += 1;

      if (!(pdfObject instanceof PDFRawStream)) return;

      const { lookupMaybe } = pdfDoc.index;
      const { dictionary: dict } = pdfObject;

      const subtype = lookupMaybe(dict.getMaybe('Subtype'));
      const width = lookupMaybe(dict.getMaybe('Width')) as unknown as { number: number };
      const height = lookupMaybe(dict.getMaybe('Height')) as unknown as { number: number };
      const name = lookupMaybe(dict.getMaybe('Name')) as unknown as { key: any };
      const bitsPerComponent = lookupMaybe(dict.getMaybe('BitsPerComponent')) as unknown as { number: number };

      if (subtype === PDFName.from('Image')) {
        imagesInDoc.push({
          ref,
          name: name ? name.key : `Object${objectIdx}`,
          width: width.number,
          height: height.number,
          bitsPerComponent: bitsPerComponent.number,
          data: pdfObject.content,
        });
      }
    });
    
    return NextResponse.json({ images: imagesInDoc });
    
  } catch (error) {
    console.error('Error processing the PDF:', error); // Log the error for debugging
    return NextResponse.json({ error: 'Error processing the PDF.' }, { status: 500 });
  }
}
