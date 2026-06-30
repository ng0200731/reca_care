import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const member = await prisma.member.update({
      where: { id },
      data: {
        name: body.name,
        title: body.title ?? null,
        email: body.email ?? null,
        phone: body.phone ?? null,
      },
    });
    return NextResponse.json(member);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to update member" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.member.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to delete member" }, { status: 500 });
  }
}
