import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/expenses
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const month = searchParams.get("month");
    const year = searchParams.get("year");

    const expenses = await prisma.expense.findMany({
      where: {
        AND: [
          month && year
            ? {
                month: parseInt(month),
                year: parseInt(year),
              }
            : {},
        ],
      },
      orderBy: {
        issuedDate: "desc",
      },
    });
    return NextResponse.json(expenses);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch expenses" },
      { status: 500 }
    );
  }
}

// POST /api/expenses
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const expense = await prisma.expense.create({
      data: {
        ...body,
        month: new Date(body.issuedDate).getMonth() + 1,
        year: new Date(body.issuedDate).getFullYear(),
      },
    });
    return NextResponse.json(expense);
  } catch {
    return NextResponse.json(
      { error: "Failed to create expense" },
      { status: 500 }
    );
  }
}
