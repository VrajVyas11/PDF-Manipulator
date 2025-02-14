/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextResponse } from "next/server";
import { exec } from "child_process";
import path from "path";
import fs from "fs";

export async function POST(req: Request): Promise<Response> {
    try {
        const formData = await req.formData();
        const file = formData.get("pdf") as File;

        if (!file) {
            return NextResponse.json({ error: "No PDF file uploaded" }, { status: 400 });
        }

        const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");

        const tempDir = path.join(process.cwd(), "public/uploads");
        if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

        const pdfPath = path.join(tempDir, sanitizedFileName);
        const htmlPath = pdfPath.replace(".pdf", ".html");

        const buffer = Buffer.from(await file.arrayBuffer());
        fs.writeFileSync(pdfPath, buffer);

        return new Promise((resolve) => {
            exec(`pdf2htmlEX --zoom 1.3 --dest-dir ${tempDir} ${pdfPath}`, 
                (error) => {
                    if (error) {
                        resolve(NextResponse.json({ error: "Conversion failed" }, { status: 500 }));
                    } else {
                        const htmlFile = path.join(tempDir, path.basename(htmlPath));
                        if (fs.existsSync(htmlFile)) {
                            resolve(
                                NextResponse.json(
                                    { url: `/api/uploadedHtml/${path.basename(htmlPath)}` },
                                    { status: 200 }
                                )
                            );
                        } else {
                            resolve(NextResponse.json({ error: "HTML file not found" }, { status: 500 }));
                        }
                    }
                }
            );
        });        
    } catch (error) {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
