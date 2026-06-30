import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const table = await prisma.translationTable.findUnique({
      where: { id },
      include: { entries: { orderBy: { rowIndex: "asc" } }, customer: { select: { companyName: true } } },
    });
    if (!table) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(table);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to fetch translation table" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.translationTable.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to delete translation table" }, { status: 500 });
  }
}
