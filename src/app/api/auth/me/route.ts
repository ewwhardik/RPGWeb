import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    const { passwordHash: _, ...safeUser } = user;

    return NextResponse.json({
      user: safeUser,
    });
  } catch (error) {
    console.error("Fetch current user error:", error);
    return NextResponse.json(
      { error: "Failed to read identity scroll." },
      { status: 500 }
    );
  }
}
