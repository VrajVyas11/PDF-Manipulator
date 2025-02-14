/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextResponse } from "next/server";
import { exec } from "child_process";
import path from "path";
import fs from "fs";

export async function POST(req: Request): Promise<Response> {
    try {
        const formData = await req.formData();
        const file = formData.get("pdf") as File;

        if (!file || file.type !== "application/pdf") {
            return NextResponse.json({ error: "Invalid or missing PDF file" }, { status: 400 });
        }

        const tempDir = path.join("/tmp", "uploads");
        try {
            if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

            // Clean up the directory before processing
            fs.readdirSync(tempDir).forEach(file => {
                fs.unlinkSync(path.join(tempDir, file));
            });
        } catch (dirError) {
            return NextResponse.json({ error: "Failed to create or clean temporary directory" }, { status: 500 });
        }

        const pdfPath = path.join(tempDir, "upload.pdf");
        const htmlPath = path.join(tempDir, "upload.html");

        try {
            const buffer = Buffer.from(await file.arrayBuffer());
            fs.writeFileSync(pdfPath, buffer);
        } catch (writeError) {
            return NextResponse.json({ error: "Failed to write PDF file" }, { status: 500 });
        }

        return new Promise((resolve) => {
            exec(`pdf2htmlEX --zoom 1.3 --dest-dir ${tempDir} ${pdfPath}`, (error) => {
                if (error) {
                    resolve(NextResponse.json({ error: `Conversion failed: Something Went Wrong.... May be File Not Supported` }, { status: 500 }));
                } else {
                    if (fs.existsSync(htmlPath)) {
                        resolve(NextResponse.json({ url: `/api/uploadedHtml/upload.html` }, { status: 200 }));
                    } else {
                        resolve(NextResponse.json({ error: "HTML file not found after conversion" }, { status: 500 }));
                    }
                }
            });
        });
    } catch (error) {
        return NextResponse.json({ error: `Internal server error: ${(error as Error).message}` }, { status: 500 });
    }
}