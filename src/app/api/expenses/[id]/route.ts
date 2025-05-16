import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = Promise<{ id: string }>;

// PUT /api/expenses/:id
export async function PUT(
  request: NextRequest,
  { params }: { params: Params }
) {
  const { id } = await params;
  try {
    const body = await request.json();
    const expense = await prisma.expense.update({
      where: { id },
      data: {
        ...body,
        month: new Date(body.issuedDate).getMonth() + 1,
        year: new Date(body.issuedDate).getFullYear(),
      },
    });
    return NextResponse.json(expense);
  } catch {
    return NextResponse.json(
      { error: "Failed to update expense" },
      { status: 500 }
    );
  }
}

// DELETE /api/expenses/:id
export async function DELETE(
  request: NextRequest,
  { params }: { params: Params }
) {
  const { id } = await params;
  try {
    await prisma.expense.delete({
      where: { id },
    });
    return NextResponse.json({ message: "Expense deleted successfully" });
  } catch {
    return NextResponse.json(
      { error: "Failed to delete expense" },
      { status: 500 }
    );
  }
}
