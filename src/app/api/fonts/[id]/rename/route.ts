import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

async function getIdParam(params: Promise<{ id: string }>) {
  const { id } = await params;
  const numericId = parseInt(id, 10);
  if (isNaN(numericId)) {
    throw new Error("Invalid id");
  }
  return numericId;
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = await getIdParam(params);
    const body = await request.json();
    const newName = body.font_name?.trim();

    if (!newName) {
      return NextResponse.json({ success: false, error: "Font name is required" }, { status: 400 });
    }

    await prisma.fontFamily.update({
      where: { id },
      data: { name: newName },
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ success: false, error: "Failed to rename font" }, { status: 500 });
  }
}
