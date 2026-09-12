import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const userData = await prisma.user.findUnique({
      where: { id: user.id },
      select: { dayStartHour: true },
    });

    return NextResponse.json({
      dayStartHour: userData?.dayStartHour ?? 0,
    });
  } catch (error) {
    console.error("Fetch day start error:", error);
    return NextResponse.json({ error: "Failed to read CDS." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const body = await req.json();
    const { dayStartHour } = body;

    const hour = Number(dayStartHour);
    if (isNaN(hour) || hour < 0 || hour > 6) {
      return NextResponse.json(
        { error: "Day start hour must be between 0 (midnight) and 6 AM." },
        { status: 400 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { dayStartHour: hour },
      select: { id: true, dayStartHour: true },
    });

    await prisma.activityLog.create({
      data: {
        userId: user.id,
        actionType: "SETTINGS_UPDATED",
        message: `Calibrated Night Owl Custom Day Start to ${hour === 0 ? "Midnight (12:00 AM)" : `${hour}:00 AM`}.`,
      },
    });

    return NextResponse.json({
      success: true,
      dayStartHour: updatedUser.dayStartHour,
      message: `Night Owl CDS calibrated to ${hour === 0 ? "Midnight" : `${hour}:00 AM`}.`,
    });
  } catch (error) {
    console.error("Update day start error:", error);
    return NextResponse.json({ error: "Failed to update CDS." }, { status: 500 });
  }
}
