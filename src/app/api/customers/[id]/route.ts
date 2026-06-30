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
    const customer = await prisma.customer.findUnique({
      where: { id },
      include: { members: true },
    });
    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }
    return NextResponse.json(customer);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to fetch customer" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = await getIdParam(params);
    const body = await request.json();
    const customer = await prisma.customer.update({
      where: { id },
      data: {
        companyName: body.companyName,
        emailDomain: body.emailDomain ?? null,
        email: body.email ?? null,
        phone: body.phone ?? null,
        companyType: body.companyType ?? null,
        address: body.address ?? null,
        notes: body.notes ?? null,
        memberName: body.memberName ?? null,
        memberTitle: body.memberTitle ?? null,
      },
      include: { members: true },
    });
    return NextResponse.json(customer);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to update customer" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = await getIdParam(params);
    await prisma.customer.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to delete customer" }, { status: 500 });
  }
}
