import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/auth/authOptions";

type Params = Promise<{ userId: string }>;

export async function DELETE(request: Request, { params }: { params: Params }) {
  try {
    const { userId } = await params;
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Check if user exists and get their role
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!targetUser) {
      return new NextResponse("User not found", { status: 404 });
    }

    // Prevent deleting admin accounts
    if (targetUser.role === "ADMIN") {
      return new NextResponse("Cannot delete admin accounts", { status: 400 });
    }

    // Prevent deleting yourself
    if (userId === session.user.id) {
      return new NextResponse("Cannot delete your own account", {
        status: 400,
      });
    }

    await prisma.user.delete({
      where: {
        id: userId,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch {
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
