import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { supplyIds, carServiceItemIds } = await request.json();

    // Update supplies
    if (supplyIds && supplyIds.length > 0) {
      await prisma.supply.updateMany({
        where: {
          id: {
            in: supplyIds,
          },
        },
        data: {
          settled: true,
        },
      });
    }

    // Update car service items
    if (carServiceItemIds && carServiceItemIds.length > 0) {
      await prisma.carServiceItem.updateMany({
        where: {
          id: {
            in: carServiceItemIds,
          },
        },
        data: {
          settled: true,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error settling items:", error);
    return NextResponse.json(
      { error: "Failed to settle items" },
      { status: 500 }
    );
  }
}
