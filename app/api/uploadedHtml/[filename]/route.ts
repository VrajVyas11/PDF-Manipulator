import { NextResponse } from "next/server";
import path from "path";
import fs from "fs";

export async function GET(req: Request, { params }: { params: { filename: string } }) {
    const filePath = path.join(process.cwd(), "public", "uploads", params.filename);

    if (!fs.existsSync(filePath)) {
        return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const fileBuffer = fs.readFileSync(filePath);
    const ext = path.extname(params.filename);

    const contentType = ext === ".pdf"
        ? "application/pdf"
        : ext === ".html"
            ? "text/html"
            : "application/octet-stream";

    return new NextResponse(fileBuffer, {
        headers: { "Content-Type": contentType }
    });
}
