/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextResponse } from "next/server";
import path from "path";
import fs from "fs";

export async function GET(req: Request, { params }: { params: { filename: string } }) {
    const filePath = path.join("/tmp", "uploads", params.filename);
    
    if (!fs.existsSync(filePath)) {
        return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const fileStream = fs.createReadStream(filePath);
    const ext = path.extname(params.filename);

    const contentType = ext === ".pdf" 
        ? "application/pdf" 
        : ext === ".html" 
            ? "text/html" 
            : "application/octet-stream";

    return new NextResponse(fileStream as any, {
        headers: { "Content-Type": contentType }
    });
}
