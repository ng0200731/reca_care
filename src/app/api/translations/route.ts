import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const tables = await prisma.translationTable.findMany({
      include: { customer: { select: { companyName: true } }, _count: { select: { entries: true } } },
      orderBy: { updatedAt: "desc" },
    });
    return NextResponse.json(tables);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to fetch translations" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, customerId, headers, rows } = body;

    if (!name || !headers || !Array.isArray(rows)) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    const table = await prisma.translationTable.create({
      data: {
        name,
        customerId: customerId || null,
        headers: JSON.stringify(headers),
        entries: {
          create: rows.map((row: Record<string, string>, idx: number) => ({
            rowIndex: idx,
            values: JSON.stringify(row),
          })),
        },
      },
      include: { entries: true, customer: { select: { companyName: true } } },
    });

    return NextResponse.json(table, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to create translation table" }, { status: 500 });
  }
}
