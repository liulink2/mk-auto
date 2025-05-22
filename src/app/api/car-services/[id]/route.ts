import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { CarServiceItem } from "@prisma/client";

type Params = Promise<{ id: string }>;

// PUT /api/car-services/:id
export async function PUT(
  request: NextRequest,
  { params }: { params: Params }
) {
  const { id } = await params;
  try {
    const body = await request.json();
    const carInDateTime = new Date(body.carInDateTime);

    // Update the CarService
    const carService = await prisma.carService.update({
      where: { id },
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

    // Update CarServiceItems
    if (body.carServiceItems && body.carServiceItems.length > 0) {
      // Delete existing items
      await prisma.carServiceItem.deleteMany({
        where: { carServiceId: id },
      });

      // Create new items
      const carServiceItemsData = body.carServiceItems.map(
        (item: CarServiceItem) => ({
          ...item,
          carServiceId: id,
        })
      );

      await prisma.carServiceItem.createMany({
        data: carServiceItemsData,
      });
    }

    return NextResponse.json(carService);
  } catch (error) {
    console.error("Error updating car service:", error);
    return NextResponse.json(
      { error: "Failed to update car service" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Params }
) {
  const { id } = await params;
  try {
    // First delete all related car service items
    await prisma.carServiceItem.deleteMany({
      where: { carServiceId: id },
    });

    // Then delete the car service
    await prisma.carService.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting car service:", error);
    return NextResponse.json(
      { error: "Failed to delete car service" },
      { status: 500 }
    );
  }
}
