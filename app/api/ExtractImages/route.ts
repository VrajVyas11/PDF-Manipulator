import { NextResponse } from "next/server";
import {
  PDFDocumentFactory,
  PDFName,
  PDFRawStream,
} from '@/legacy-pdf-lib/node_modules/pdf-lib';

interface ImageInDoc {
  ref: string;
  name: string;
  width: number;
  height: number;
  bitsPerComponent: number;
  data: Uint8Array;
}

export async function POST(request: Request) {
  try {
    const data = await request.formData();
    const pdfFile = data.get('pdf') as File;

    const buffer = await pdfFile.arrayBuffer();
    const pdfDoc = PDFDocumentFactory.load(new Uint8Array(buffer));
    const imagesInDoc: ImageInDoc[] = [];
    let objectIdx = 0;

    pdfDoc.index.index.forEach((pdfObject, ref) => {
      objectIdx += 1;

      if (!(pdfObject instanceof PDFRawStream)) return;

      const { lookupMaybe } = pdfDoc.index;
      const { dictionary: dict } = pdfObject;

      const subtype = lookupMaybe(dict.getMaybe('Subtype'));
      const width = lookupMaybe(dict.getMaybe('Width')) as unknown as { number: number };
      const height = lookupMaybe(dict.getMaybe('Height')) as unknown as { number: number };
      const name = lookupMaybe(dict.getMaybe('Name')) as unknown as { key: string };
      const bitsPerComponent = lookupMaybe(dict.getMaybe('BitsPerComponent')) as unknown as { number: number };

      if (subtype === PDFName.from('Image')) {
        const imageData = pdfObject.content;

        if (imageData && imageData.length > 0) {
          imagesInDoc.push({
            ref: ref.toString(),
            name: name ? name.key : `Object${objectIdx}`,
            width: width.number,
            height: height.number,
            bitsPerComponent: bitsPerComponent.number,
            data: imageData, 
          });
        }
      }
    });

    return NextResponse.json({ images: imagesInDoc });

  } catch (error) {
    console.error('Error processing the PDF:', error);
    return NextResponse.json({ error: 'Error processing the PDF.' }, { status: 500 });
  }
}
