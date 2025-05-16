import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = Promise<{ id: string }>;

export async function PUT(request: Request, { params }: { params: Params }) {
  try {
    const data = await request.json();
    const { id } = await params;
    const updatedSupply = await prisma.supply.update({
      where: {
        id,
      },
      data: {
        invoiceNumber: data.invoiceNumber,
        supplierId: data.supplierId,
        suppliedDate: new Date(data.suppliedDate),
        month: new Date(data.suppliedDate).getMonth() + 1,
        year: new Date(data.suppliedDate).getFullYear(),
        paymentType: data.paymentType,
        remarks: data.remarks,
        name: data.name,
        description: data.description,
        quantity: data.quantity,
        price: data.price,
      },
      include: {
        supplier: true,
      },
    });

    return NextResponse.json(updatedSupply);
  } catch {
    return NextResponse.json(
      { error: "Failed to update supply" },
      { status: 500 }
    );
  }
}

// DELETE /api/supplies/:id
export async function DELETE(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const { id } = await params;
    await prisma.supply.delete({
      where: { id },
    });
    return NextResponse.json({ message: "Supply deleted successfully" });
  } catch {
    return NextResponse.json(
      { error: "Failed to delete supply" },
      { status: 500 }
    );
  }
}
