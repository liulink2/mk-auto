import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const month = parseInt(searchParams.get("month") || "0");
    const year = parseInt(searchParams.get("year") || "0");

    if (!month || !year) {
      return NextResponse.json(
        { error: "Invalid month or year" },
        { status: 400 }
      );
    }

    const carServicesTotal = await prisma.carService.aggregate({
      where: {
        month,
        year,
      },
      _sum: {
        totalAmount: true,
      },
    });

    const supplies = await prisma.supply.findMany({
      where: {
        month,
        year,
      },
      select: {
        quantity: true,
        price: true,
      },
    });

    const suppliesTotal = supplies.reduce((total, supply) => {
      return total + Number(supply.quantity) * Number(supply.price);
    }, 0);

    const expensesTotal = await prisma.expense.aggregate({
      where: {
        month,
        year,
      },
      _sum: {
        amount: true,
      },
    });

    return NextResponse.json({
      carServicesTotal: carServicesTotal._sum.totalAmount || 0,
      suppliesTotal,
      expensesTotal: expensesTotal._sum.amount || 0,
    });
  } catch (error) {
    console.error("Error fetching summary:", error);
    return NextResponse.json(
      { error: "Failed to fetch summary" },
      { status: 500 }
    );
  }
}
