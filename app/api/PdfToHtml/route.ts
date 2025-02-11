import { NextResponse } from 'next/server';
import Docker from 'dockerode';
import path from 'path';
import fs from "fs";

export async function POST(req: Request): Promise<Response> {
    const docker = new Docker({ socketPath: "/var/run/docker.sock" });

    try {
        console.log("🚀 Start PDF to HTML conversion");

        const formData = await req.formData();
        const file = formData.get("pdf") as File;
        if (!file) {
            return NextResponse.json({ error: "❌ No PDF file uploaded" }, { status: 400 });
        }

        const tempDir = path.join(process.cwd(), "public/uploads");
        console.log("📂 Temp directory:", tempDir);

        if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

        const safeFileName = file.name.replace(/\s+/g, "_").replace(/\(|\)/g, "");
        const safePdfPath = path.join(tempDir, safeFileName);
        const containerPdfPath = `/pdf/${safeFileName}`;
        const safeHtmlPath = safePdfPath.replace(".pdf", ".html");

        const buffer = Buffer.from(await file.arrayBuffer());
        fs.writeFileSync(safePdfPath, buffer);
        fs.chmodSync(safePdfPath, 0o644);

        console.log("✅ File saved at:", safePdfPath);

        if (!fs.existsSync(safePdfPath)) {
            console.error("❌ PDF file not found at:", safePdfPath);
            return NextResponse.json({ error: "PDF file was not saved correctly" }, { status: 500 });
        }

        const container = docker.getContainer("pdf2html");

        // Execute pdf2htmlEX inside the container
        const exec = await container.exec({
            AttachStdout: true,
            AttachStderr: true,
            Tty: false,
            Cmd: ["pdf2htmlEX", "--zoom", "1.3", containerPdfPath]
        });

        // Start execution and capture output
        const stream = await exec.start({});
        let output = "";

        await new Promise((resolve, reject) => {
            stream.on("data", (data: { toString: () => string; }) => {
                output += data.toString();
            });

            stream.on("end", resolve);
            stream.on("error", reject);
        });

        console.log("📜 PDF Conversion Output:", output);

        // Ensure the converted HTML file exists
        if (!fs.existsSync(safeHtmlPath)) {
            console.error("❌ HTML file not found at:", safeHtmlPath);
            return NextResponse.json({ error: "Conversion failed" }, { status: 500 });
        }

        console.log("🎉 Conversion successful:", safeHtmlPath);

        return NextResponse.json({ url: `/uploads/${path.basename(safeHtmlPath)}` }, { status: 200 });

    } catch (error) {
        console.error("🚨 Error running pdf2htmlEX:", error);
        return NextResponse.json({ error: "PDF conversion failed" }, { status: 500 });
    }
}
