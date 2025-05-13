import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET /api/supplies
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const supplies = await prisma.supply.findMany({
      where: {
        suppliedDate: {
          gte: startDate ? new Date(startDate) : undefined,
          lte: endDate ? new Date(endDate) : undefined,
        },
      },
      include: { supplier: true },
      orderBy: {
        suppliedDate: "desc",
      },
    });
    return NextResponse.json(supplies);
  } catch (error) {
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
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create supply" },
      { status: 500 }
    );
  }
}

// PUT /api/supplies/:id
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const supply = await prisma.supply.update({
      where: { id: params.id },
      data: body,
    });
    return NextResponse.json(supply);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update supply" },
      { status: 500 }
    );
  }
}

// DELETE /api/supplies/:id
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.supply.delete({
      where: { id: params.id },
    });
    return NextResponse.json({ message: "Supply deleted successfully" });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete supply" },
      { status: 500 }
    );
  }
}
