import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/service-extra-info
export async function GET() {
  try {
    const serviceExtraInfos = await prisma.serviceExtraInfo.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
    return NextResponse.json(serviceExtraInfos);
  } catch (error) {
    console.error("Error fetching service extra info:", error);
    return NextResponse.json(
      { error: "Failed to fetch service extra info" },
      { status: 500 }
    );
  }
}

// POST /api/service-extra-info
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { serviceType, serviceNames, extraInfo } = body;

    if (!serviceType || !serviceNames || !extraInfo) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const serviceExtraInfo = await prisma.serviceExtraInfo.create({
      data: {
        serviceType,
        serviceNames,
        extraInfo,
      },
    });

    return NextResponse.json(serviceExtraInfo);
  } catch (error) {
    console.error("Error creating service extra info:", error);
    return NextResponse.json(
      { error: "Failed to create service extra info" },
      { status: 500 }
    );
  }
}
