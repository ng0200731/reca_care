import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { readFile } from "fs/promises";
import { join } from "path";

async function getIdParam(params: Promise<{ id: string }>) {
  const { id } = await params;
  const numericId = parseInt(id, 10);
  if (isNaN(numericId)) {
    throw new Error("Invalid id");
  }
  return numericId;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = await getIdParam(params);
    const font = await prisma.fontFamily.findUnique({ where: { id } });
    if (!font) {
      return NextResponse.json({ success: false, error: "Font not found" }, { status: 404 });
    }

    const filePath = join(process.cwd(), "public", font.filePath);
    const buffer = await readFile(filePath);
    const ext = font.fileName.split(".").pop()?.toLowerCase();
    const mimeType = ext === "otf" ? "font/otf" : "font/ttf";

    return new NextResponse(buffer, {
      headers: { "Content-Type": mimeType },
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ success: false, error: "Failed to serve font" }, { status: 500 });
  }
}
