import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    if (!query) {
      return NextResponse.json(
        { error: "Search query is required" },
        { status: 400 }
      );
    }

    const carServices = await prisma.carService.findMany({
      where: {
        OR: [
          { ownerName: { contains: query, mode: "insensitive" } },
          { phoneNo: { contains: query, mode: "insensitive" } },
          { carPlate: { contains: query, mode: "insensitive" } },
        ],
      },
      include: {
        carServiceItems: true,
      },
      orderBy: {
        carInDateTime: "desc",
      },
    });

    return NextResponse.json(carServices);
  } catch (error) {
    console.error("Error searching car services:", error);
    return NextResponse.json(
      { error: "Failed to search car services" },
      { status: 500 }
    );
  }
}
