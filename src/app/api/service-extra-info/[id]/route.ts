import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = Promise<{ id: string }>;

// PUT /api/service-extra-info/:id
export async function PUT(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { serviceType, serviceNames, extraInfo } = body;

    if (!serviceType || !serviceNames || !extraInfo) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const serviceExtraInfo = await prisma.serviceExtraInfo.update({
      where: { id },
      data: {
        serviceType,
        serviceNames,
        extraInfo,
      },
    });

    return NextResponse.json(serviceExtraInfo);
  } catch (error) {
    console.error("Error updating service extra info:", error);
    return NextResponse.json(
      { error: "Failed to update service extra info" },
      { status: 500 }
    );
  }
}

// DELETE /api/service-extra-info/:id
export async function DELETE(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const { id } = await params;
    await prisma.serviceExtraInfo.delete({
      where: { id },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting service extra info:", error);
    return NextResponse.json(
      { error: "Failed to delete service extra info" },
      { status: 500 }
    );
  }
}
