import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const materials = await prisma.material.findMany({
      orderBy: { displayOrder: "asc" },
    });
    return NextResponse.json(materials);
  } catch {
    const fallback = [
      { id: "satin", name: "Satin", imageUrl: "/materials/satin.svg", displayOrder: 1 },
      { id: "cotton", name: "Cotton", imageUrl: "/materials/cotton.svg", displayOrder: 2 },
      { id: "polyester", name: "Polyester", imageUrl: "/materials/polyester.svg", displayOrder: 3 },
    ];
    return NextResponse.json(fallback);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const material = await prisma.material.create({
      data: {
        name: body.name,
        imageUrl: body.imageUrl,
        displayOrder: body.displayOrder,
      },
    });
    return NextResponse.json(material, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create material" }, { status: 500 });
  }
}
