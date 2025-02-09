/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import Docker from "dockerode";
import path from "path";
import fs from "fs";

const docker = new Docker({
    socketPath: process.platform === "win32" ? "//./pipe/docker_engine" : "/var/run/docker.sock",
});

docker.pull("bwits/pdf2htmlex-alpine", (err:any, stream:any) => {
    if (err) {
        console.error("🚨 Docker pull error:", err);
        return;
    }
    docker.modem.followProgress(stream, onFinished, onProgress);

    function onFinished(err: any) {
        if (err) console.error("🚨 Docker pull failed:", err);
        else console.log("✅ Docker image pulled successfully");
    }

    function onProgress(event: any) {
        console.log("📥 Pulling image:", event.status);
    }
});

export async function POST(req: Request): Promise<Response> {
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
        const safeHtmlPath = safePdfPath.replace(".pdf", ".html");

        const buffer = Buffer.from(await file.arrayBuffer());
        fs.writeFileSync(safePdfPath, buffer);
        fs.chmodSync(safePdfPath, 0o644);

        console.log("✅ File saved at:", safePdfPath);

        if (!fs.existsSync(safePdfPath)) {
            console.error("❌ PDF file not found at:", safePdfPath);
            return NextResponse.json({ error: "PDF file was not saved correctly" }, { status: 500 });
        }

        const container = await docker.createContainer({
            Image: "bwits/pdf2htmlex-alpine",
            Cmd: ["pdf2htmlEX", "--zoom", "1.3", safeFileName], // Change path
            HostConfig: {
                Binds: [`${tempDir}:/pdf:rw`], // Correct binding
            },
            WorkingDir: "/pdf", // Ensure correct working directory
            User: "root",
        });

        console.log("📦 Container created:", container.id);

        await container.start();
        console.log("🚀 Container started");

        // Capture container logs
        const stream = await container.logs({
            follow: true,
            stdout: true,
            stderr: true,
        });

        stream.on("data", (chunk) => {
            console.log(chunk.toString());
        });

        stream.on("end", () => {
            console.log("📜 Container logs ended");
        });

        await container.wait();
        console.log("✅ Container finished processing");

        // Check for possible output file paths
        const possibleHtmlPaths = [
            safeHtmlPath,
            safePdfPath.replace(".pdf", ".pdf.html"),
        ];

        let convertedHtmlPath: string | undefined;

        for (const possiblePath of possibleHtmlPaths) {
            if (fs.existsSync(possiblePath)) {
                convertedHtmlPath = possiblePath;
                break;
            }
        }

        if (convertedHtmlPath) {
            console.log("🎉 Conversion successful:", convertedHtmlPath);
            await container.remove();
            return NextResponse.json({ url: `/uploads/${path.basename(convertedHtmlPath)}` }, { status: 200 });
        } else {
            console.error("❌ HTML file not found after conversion");
            await container.remove();
            return NextResponse.json({ error: "Conversion failed" }, { status: 500 });
        }
    } catch (error) {
        console.error("🚨 Error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
