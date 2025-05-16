import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Supply } from "@prisma/client";

export async function POST(request: Request) {
  try {
    const supplies = await request.json();

    // Validate that all supplies have the same invoice number
    const invoiceNumber = supplies[0]?.invoiceNumber;
    if (
      !invoiceNumber ||
      !supplies.every((s: Supply) => s.invoiceNumber === invoiceNumber)
    ) {
      return NextResponse.json(
        { error: "All supplies must have the same invoice number" },
        { status: 400 }
      );
    }

    // Create all supplies in a transaction
    const createdSupplies = await prisma.$transaction(
      supplies.map((supply: Supply) =>
        prisma.supply.create({
          data: {
            invoiceNumber: supply.invoiceNumber,
            supplierId: supply.supplierId,
            suppliedDate: new Date(supply.suppliedDate),
            month: new Date(supply.suppliedDate).getMonth() + 1,
            year: new Date(supply.suppliedDate).getFullYear(),
            paymentType: supply.paymentType,
            remarks: supply.remarks,
            name: supply.name,
            description: supply.description || null,
            quantity: supply.quantity,
            price: supply.price,
          },
          include: {
            supplier: true,
          },
        })
      )
    );

    return NextResponse.json(createdSupplies);
  } catch {
    return NextResponse.json(
      { error: "Failed to create supplies" },
      { status: 500 }
    );
  }
}
