import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const members = await prisma.member.findMany({
      where: { customerId: id },
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
    const { id } = await params;
    const body = await request.json();
    const member = await prisma.member.create({
      data: {
        customerId: id,
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
