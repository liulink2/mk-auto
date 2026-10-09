import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/auth/authOptions";

// Whitelisted columns; plate matches by prefix, the rest by substring.
// Phone ignores spaces on both sides so "0412 345" matches "0412345678".
const FIELDS = {
  carPlate: {
    column: Prisma.raw(`"carPlate"`),
    prefix: true,
    stripSpaces: false,
  },
  ownerName: {
    column: Prisma.raw(`"ownerName"`),
    prefix: false,
    stripSpaces: false,
  },
  phoneNo: {
    column: Prisma.raw(`replace("phoneNo", ' ', '')`),
    prefix: false,
    stripSpaces: true,
  },
} as const;

type SuggestionField = keyof typeof FIELDS;

const escapeLike = (value: string) => value.replace(/[\\%_]/g, "\\$&");

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const field = searchParams.get("field") as SuggestionField | null;
    const query = searchParams.get("q")?.trim() ?? "";

    if (!field || !Object.hasOwn(FIELDS, field)) {
      return NextResponse.json({ error: "Invalid field" }, { status: 400 });
    }
    if (query.length < 2) {
      return NextResponse.json([]);
    }

    const { column, prefix, stripSpaces } = FIELDS[field];
    const term = stripSpaces ? query.replace(/\s/g, "") : query;
    const pattern = `${prefix ? "" : "%"}${escapeLike(term)}%`;

    // Latest visit per car (plate normalised for case/spaces), most recent first.
    const suggestions = await prisma.$queryRaw`
      SELECT "carPlate", "ownerName", "phoneNo", "carDetails"
      FROM (
        SELECT DISTINCT ON (upper(replace("carPlate", ' ', '')))
          "carPlate", "ownerName", "phoneNo", "carDetails", "carInDateTime"
        FROM "CarService"
        WHERE ${column} ILIKE ${pattern}
        ORDER BY upper(replace("carPlate", ' ', '')), "carInDateTime" DESC
      ) latest
      ORDER BY "carInDateTime" DESC
      LIMIT 10
    `;

    return NextResponse.json(suggestions);
  } catch (error) {
    console.error("Error fetching car suggestions:", error);
    return NextResponse.json(
      { error: "Failed to fetch car suggestions" },
      { status: 500 }
    );
  }
}
