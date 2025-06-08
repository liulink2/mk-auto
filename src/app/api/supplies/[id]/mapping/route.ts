import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = Promise<{ id: string }>;

export async function PUT(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const { id } = await params;
    const { mappedNames } = await request.json();

    // Update the supply with mapped names
    const supply = await prisma.supply.update({
      where: { id },
      data: {
        mappedNames: mappedNames,
      },
    });

    return NextResponse.json(supply);
  } catch (error) {
    console.error("Error updating supply mapping:", error);
    return NextResponse.json(
      { error: "Failed to update supply mapping" },
      { status: 500 }
    );
  }
}
