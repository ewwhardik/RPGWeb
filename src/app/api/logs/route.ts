import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ logs: [] });
    }

    const logs = await prisma.activityLog.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 12,
    });

    return NextResponse.json({ logs });
  } catch (error) {
    console.error("Fetch activity logs error:", error);
    return NextResponse.json(
      { error: "Could not unroll the historical chronicle." },
      { status: 500 }
    );
  }
}
