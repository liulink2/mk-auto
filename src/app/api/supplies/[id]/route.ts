import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json();
    const updatedSupply = await prisma.supply.update({
      where: {
        id: params.id,
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
  } catch (error) {
    console.error("Failed to update supply:", error);
    return NextResponse.json(
      { error: "Failed to update supply" },
      { status: 500 }
    );
  }
}
