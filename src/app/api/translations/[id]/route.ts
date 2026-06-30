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

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = await getIdParam(params);
    const table = await prisma.translationTable.findUnique({
      where: { id },
      include: { customer: { select: { companyName: true } } },
    });
    if (!table) {
      return NextResponse.json({ success: false, error: "Translation not found" }, { status: 404 });
    }
    return NextResponse.json({
      success: true,
      translation: {
        id: table.id,
        table_name: table.name,
        customer_id: table.customerId,
        customer_name: table.customer?.companyName || null,
        updated_at: table.updatedAt,
        data: JSON.parse(table.data),
      },
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ success: false, error: "Failed to fetch translation table" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = await getIdParam(params);
    await prisma.translationTable.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ success: false, error: "Failed to delete translation table" }, { status: 500 });
  }
}
