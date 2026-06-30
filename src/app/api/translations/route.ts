import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const tables = await prisma.translationTable.findMany({
      include: { customer: { select: { companyName: true } } },
      orderBy: { updatedAt: "desc" },
    });
    const result = tables.map((t) => ({
      id: t.id,
      table_name: t.name,
      customer_id: t.customerId,
      customer_name: t.customer?.companyName || null,
      updated_at: t.updatedAt,
    }));
    return NextResponse.json({ success: true, translations: result });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ success: false, error: "Failed to fetch translations" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { table_name, customer_id, data } = body;

    if (!table_name || !data) {
      return NextResponse.json({ success: false, error: "Invalid data" }, { status: 400 });
    }

    const table = await prisma.translationTable.create({
      data: {
        name: table_name,
        customerId: customer_id || null,
        data: typeof data === "string" ? data : JSON.stringify(data),
      },
      include: { customer: { select: { companyName: true } } },
    });

    return NextResponse.json(
      {
        success: true,
        translation_id: table.id,
        translation: {
          id: table.id,
          table_name: table.name,
          customer_id: table.customerId,
          customer_name: table.customer?.companyName || null,
          updated_at: table.updatedAt,
        },
      },
      { status: 201 }
    );
  } catch (e) {
    console.error(e);
    return NextResponse.json({ success: false, error: "Failed to save translation table" }, { status: 500 });
  }
}
