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
    const customer = await prisma.customer.findUnique({ where: { id } });
    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }
    const members = await prisma.member.findMany({
      where: { customerId: customer.customerId },
      orderBy: { createdAt: "asc" },
    });
    return NextResponse.json(members);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to fetch members" }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = await getIdParam(params);
    const customer = await prisma.customer.findUnique({ where: { id } });
    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }
    const body = await request.json();
    const member = await prisma.member.create({
      data: {
        memberId: body.memberId || `MEM-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
        customerId: customer.customerId,
        name: body.name,
        title: body.title ?? null,
        email: body.email ?? null,
        phone: body.phone ?? null,
      },
    });
    return NextResponse.json(member, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to add member" }, { status: 500 });
  }
}
