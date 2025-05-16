import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { CarServiceItem } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const month = searchParams.get("month");
    const year = searchParams.get("year");

    const where = {
      ...(month && year
        ? {
            month: parseInt(month),
            year: parseInt(year),
          }
        : {}),
    };

    const carServices = await prisma.carService.findMany({
      where,
      orderBy: {
        carInDateTime: "desc",
      },
    });

    return NextResponse.json(carServices);
  } catch (error) {
    console.error("Error fetching car services:", error);
    return NextResponse.json(
      { error: "Failed to fetch car services" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const carInDateTime = new Date(body.carInDateTime);

    // Create the CarService first
    const carService = await prisma.carService.create({
      data: {
        carPlate: body.carPlate,
        carDetails: body.carDetails,
        ownerName: body.ownerName,
        phoneNo: body.phoneNo,
        carInDateTime,
        carOutDateTime: body.carOutDateTime
          ? new Date(body.carOutDateTime)
          : null,
        totalAmount: body.totalAmount,
        paidInCash: body.paidInCash,
        paidInCard: body.paidInCard,
        year: carInDateTime.getFullYear(),
        month: carInDateTime.getMonth() + 1,
      },
    });

    // Create CarServiceItems
    if (body.carServiceItems && body.carServiceItems.length > 0) {
      const carServiceItemsData = body.carServiceItems.map(
        (item: CarServiceItem) => ({
          ...item,
          carServiceId: carService.id,
        })
      );

      await prisma.carServiceItem.createMany({
        data: carServiceItemsData,
      });
    }

    return NextResponse.json(carService);
  } catch (error) {
    console.error("Error creating car service:", error);
    return NextResponse.json(
      { error: "Failed to create car service" },
      { status: 500 }
    );
  }
}
