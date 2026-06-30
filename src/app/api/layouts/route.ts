import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const layouts = await prisma.layout.findMany({
      select: { id: true, name: true },
      orderBy: { updatedAt: "desc" },
    });
    return NextResponse.json(layouts);
  } catch {
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const layout = await prisma.layout.create({
      data: {
        name: body.name,
        details: {
          create: {
            materialId: body.materialId,
            widthMm: body.widthMm,
            heightMm: body.heightMm,
            orientation: body.orientation,
            cuttingType: body.cuttingType,
            loopFoldOrientation: body.loopFoldOrientation ?? null,
            loopMidForm: body.loopMidForm ?? null,
            loopFoldDistanceMm: body.loopFoldDistanceMm ?? null,
            paddingOption: body.paddingOption,
            paddingTop: body.padding.top,
            paddingRight: body.padding.right,
            paddingBottom: body.padding.bottom,
            paddingLeft: body.padding.left,
            paddingR2Top: body.paddingRegion2?.top ?? 0,
            paddingR2Right: body.paddingRegion2?.right ?? 0,
            paddingR2Bottom: body.paddingRegion2?.bottom ?? 0,
            paddingR2Left: body.paddingRegion2?.left ?? 0,
            paddingSyncRegions: body.paddingSyncRegions ?? null,
            viewMode: body.viewMode ?? "side-by-side",
          },
        },
      },
      include: { details: true },
    });

    return NextResponse.json(layout, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to save layout" }, { status: 500 });
  }
}
