import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "../../../auth/[...nextauth]/route";

export async function POST(
  request: Request,
  { params }: { params: { supplierId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return new NextResponse("Not authenticated", { status: 401 });
    }

    const { isActive } = await request.json();

    const supplier = await prisma.supplier.update({
      where: {
        id: params.supplierId,
      },
      data: {
        isActive,
      },
      include: {
        parent: true,
        children: true,
      },
    });

    return NextResponse.json(supplier);
  } catch (error) {
    console.error("Error updating supplier status:", error);
    return new NextResponse(
      JSON.stringify({ error: "Failed to update supplier status" }),
      { status: 500 }
    );
  }
}
