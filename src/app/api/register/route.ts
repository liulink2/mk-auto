import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        username: username,
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "Username already taken" },
        { status: 400 }
      );
    }

    // Check if this is the first user
    const userCount = await prisma.user.count();
    const isFirstUser = userCount === 0;

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user with appropriate role
    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        role: isFirstUser ? "ADMIN" : "MANAGER",
        isActive: isFirstUser ? true : false,
      },
    });

    return NextResponse.json(
      {
        message: "User created successfully",
        role: user.role,
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { message: "Error creating user" },
      { status: 500 }
    );
  }
}
