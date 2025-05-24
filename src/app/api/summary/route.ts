import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const month = parseInt(searchParams.get("month") || "0");
    const year = parseInt(searchParams.get("year") || "0");

    if (!year) {
      return NextResponse.json({ error: "Invalid year" }, { status: 400 });
    }

    // If only year is provided (no month), aggregate for the whole year
    if (!month) {
      const carServicesTotal = await prisma.carService.aggregate({
        where: { year },
        _sum: { totalAmount: true },
      });

      const supplies = await prisma.supply.findMany({
        where: { year },
        select: { totalAmount: true },
      });
      const suppliesTotal = supplies.reduce((total, supply) => {
        return total + Number(supply.totalAmount);
      }, 0);

      const expensesTotal = await prisma.expense.aggregate({
        where: { year },
        _sum: { amount: true },
      });

      return NextResponse.json({
        carServicesTotal: carServicesTotal._sum.totalAmount || 0,
        suppliesTotal,
        expensesTotal: expensesTotal._sum.amount || 0,
      });
    }

    // Month + year summary (existing logic)
    const carServicesTotal = await prisma.carService.aggregate({
      where: { month, year },
      _sum: { totalAmount: true },
    });

    const supplies = await prisma.supply.findMany({
      where: { month, year },
      select: { totalAmount: true },
    });
    const suppliesTotal = supplies.reduce((total, supply) => {
      return total + Number(supply.totalAmount);
    }, 0);

    const expensesTotal = await prisma.expense.aggregate({
      where: { month, year },
      _sum: { amount: true },
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
