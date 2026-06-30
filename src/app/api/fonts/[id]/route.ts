import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { unlink } from "fs/promises";
import { join } from "path";

async function getIdParam(params: Promise<{ id: string }>) {
  const { id } = await params;
  const numericId = parseInt(id, 10);
  if (isNaN(numericId)) {
    throw new Error("Invalid id");
  }
  return numericId;
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = await getIdParam(params);
    const font = await prisma.fontFamily.findUnique({ where: { id } });
    if (!font) {
      return NextResponse.json({ error: "Font not found" }, { status: 404 });
    }

    try {
      await unlink(join(process.cwd(), "public", font.filePath));
    } catch {
      // ignore file not found
    }

    await prisma.fontFamily.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to delete font" }, { status: 500 });
  }
}
