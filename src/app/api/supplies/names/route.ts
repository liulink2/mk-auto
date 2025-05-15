import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get("search") || "";

    const supplies = await prisma.supply.findMany({
      where: {
        name: {
          contains: search,
          mode: "insensitive",
        },
      },
      select: {
        name: true,
      },
    });

    return NextResponse.json(supplies);
  } catch (error) {
    console.error("Error fetching supply names:", error);
    return NextResponse.json(
      { error: "Failed to fetch supply names" },
      { status: 500 }
    );
  }
}
