/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { exec } from "child_process";
import path from "path";
import fs from "fs";

export async function POST(req: Request) {
    try {
      console.log("start")
        const formData = await req.formData();
        const file = formData.get("pdf") as File;

        if (!file) {
            return NextResponse.json({ error: "No PDF file uploaded" }, { status: 400 });
        }

        const tempDir = path.join(process.cwd(), "public/uploads");
        if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

        const pdfPath = path.join(tempDir, file.name);
        const htmlPath = pdfPath.replace(".pdf", ".html");

        const buffer = Buffer.from(await file.arrayBuffer());
        fs.writeFileSync(pdfPath, buffer);

        return new Promise((resolve) => {
          exec(
              `docker run --rm -v ${tempDir}:/pdf bwits/pdf2htmlex-alpine pdf2htmlEX --zoom 1.3 ${file.name}`,
              (error, stdout, stderr) => {
                  if (error) {
                      console.error("Exec Error:", error);
                      console.error("STDERR:", stderr);
                      resolve(NextResponse.json({ error: "Conversion failed" }, { status: 500 }));
                  } else {
                      console.log("Conversion Success:", stdout);
                      resolve(NextResponse.json({ url: `/uploads/${path.basename(htmlPath)}` }, { status: 200 }));
                  }
              }
          );
      });
      

    } catch (error:any) {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
