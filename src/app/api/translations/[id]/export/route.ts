import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import * as XLSX from "xlsx";

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
    const table = await prisma.translationTable.findUnique({ where: { id } });
    if (!table) {
      return NextResponse.json({ success: false, error: "Translation not found" }, { status: 404 });
    }

    const { headers, rows } = JSON.parse(table.data);
    const worksheetData = [headers, ...rows];
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Translations");
    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${encodeURIComponent(table.name)}.xlsx"`,
      },
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ success: false, error: "Failed to export translation table" }, { status: 500 });
  }
}
