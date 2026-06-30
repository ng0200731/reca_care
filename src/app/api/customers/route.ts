import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const customers = await prisma.customer.findMany({
      include: { members: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(customers);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to fetch customers" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const customer = await prisma.customer.create({
      data: {
        companyName: body.companyName,
        emailDomain: body.emailDomain ?? null,
        companyType: body.companyType ?? null,
        address: body.address ?? null,
        notes: body.notes ?? null,
      },
      include: { members: true },
    });
    return NextResponse.json(customer, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to create customer" }, { status: 500 });
  }
}
