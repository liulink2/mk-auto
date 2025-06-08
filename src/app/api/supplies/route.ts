import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = Promise<{ id: string }>;

// GET /api/supplies
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const month = searchParams.get("month");
    const year = searchParams.get("year");
    const includeSettled = searchParams.get("includeSettled") === "true";

    const where = {
      ...(month && year
        ? {
            month: parseInt(month),
            year: parseInt(year),
          }
        : {}),
      ...(includeSettled ? {} : { settled: false }),
    };

    const supplies = await prisma.supply.findMany({
      where,
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
  } catch (error) {
    console.error("Error fetching supplies:", error);
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
