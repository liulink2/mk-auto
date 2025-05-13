import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "../auth/[...nextauth]/route";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return new NextResponse("Not authenticated", { status: 401 });
    }

    const suppliers = await prisma.supplier.findMany({
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json(suppliers);
  } catch (error) {
    console.error("Error fetching suppliers:", error);
    return new NextResponse(
      JSON.stringify({ error: "Failed to fetch suppliers" }),
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return new NextResponse("Not authenticated", { status: 401 });
    }

    const body = await request.json();
    const { name, parentId } = body;

    if (!name) {
      return new NextResponse("Name is required", { status: 400 });
    }

    const supplier = await prisma.supplier.create({
      data: {
        name,
        parentId: parentId || null,
      },
      include: {
        parent: true,
        children: true,
      },
    });

    return NextResponse.json(supplier);
  } catch (error) {
    console.error("Error creating supplier:", error);
    return new NextResponse(
      JSON.stringify({ error: "Failed to create supplier" }),
      { status: 500 }
    );
  }
}
