import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = Promise<{ id: string }>;

// GET /api/supplies
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    console.log("searchParams", searchParams);
    const month = searchParams.get("month");
    const year = searchParams.get("year");

    const supplies = await prisma.supply.findMany({
      where: {
        AND: [
          month && year
            ? {
                month: parseInt(month),
                year: parseInt(year),
              }
            : {},
        ],
      },
      include: {
        supplier: {
          include: {
            parent: true,
          },
        },
      },
      orderBy: {
        suppliedDate: "desc",
      },
    });
    return NextResponse.json(supplies);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch supplies" },
      { status: 500 }
    );
  }
}

// POST /api/supplies
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const supply = await prisma.supply.create({
      data: body,
    });
    return NextResponse.json(supply);
  } catch {
    return NextResponse.json(
      { error: "Failed to create supply" },
      { status: 500 }
    );
  }
}

// PUT /api/supplies/:id
export async function PUT(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const supply = await prisma.supply.update({
      where: { id },
      data: body,
    });
    return NextResponse.json(supply);
  } catch {
    return NextResponse.json(
      { error: "Failed to update supply" },
      { status: 500 }
    );
  }
}
