import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/auth/authOptions";

type Params = Promise<{ supplierId: string }>;

export async function GET(request: Request, { params }: { params: Params }) {
  try {
    const { supplierId } = await params;
    const session = await getServerSession(authOptions);

    if (!session) {
      return new NextResponse("Not authenticated", { status: 401 });
    }

    const supplier = await prisma.supplier.findUnique({
      where: {
        id: supplierId,
      },
      include: {
        parent: true,
        children: true,
      },
    });

    if (!supplier) {
      return new NextResponse("Supplier not found", { status: 404 });
    }

    return NextResponse.json(supplier);
  } catch (error) {
    console.error("Error fetching supplier:", error);
    return new NextResponse(
      JSON.stringify({ error: "Failed to fetch supplier" }),
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request, { params }: { params: Params }) {
  try {
    const { supplierId } = await params;
    const session = await getServerSession(authOptions);

    if (!session) {
      return new NextResponse("Not authenticated", { status: 401 });
    }

    const body = await request.json();
    const { name, parentId } = body;

    const supplier = await prisma.supplier.update({
      where: {
        id: supplierId,
      },
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
    console.error("Error updating supplier:", error);
    return new NextResponse(
      JSON.stringify({ error: "Failed to update supplier" }),
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: { params: Params }) {
  try {
    const { supplierId } = await params;
    const session = await getServerSession(authOptions);

    if (!session) {
      return new NextResponse("Not authenticated", { status: 401 });
    }

    // Check if supplier has children
    const supplier = await prisma.supplier.findUnique({
      where: {
        id: supplierId,
      },
      include: {
        children: true,
      },
    });

    if (!supplier) {
      return new NextResponse("Supplier not found", { status: 404 });
    }

    if (supplier.children.length > 0) {
      return new NextResponse(
        "Cannot delete supplier with children. Please delete or reassign children first.",
        { status: 400 }
      );
    }

    await prisma.supplier.delete({
      where: {
        id: supplierId,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting supplier:", error);
    return new NextResponse(
      JSON.stringify({ error: "Failed to delete supplier" }),
      { status: 500 }
    );
  }
}
