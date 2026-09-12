import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized adventurer." }, { status: 401 });
    }

    const currentStatus = user.isSleeping ?? false;
    const newStatus = !currentStatus;

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { isSleeping: newStatus },
    });

    const message = newStatus
      ? "Checked into the Tavern Inn. Daily damage paused while you rest by the hearth."
      : "Checked out of the Tavern Inn. Daily quests are active once again!";

    await prisma.activityLog.create({
      data: {
        userId: user.id,
        actionType: "INN_REST_TOGGLE",
        message,
      },
    });

    return NextResponse.json({
      success: true,
      isSleeping: updatedUser.isSleeping,
      message,
    });
  } catch (error) {
    console.error("Inn toggle error:", error);
    return NextResponse.json(
      { error: "The innkeeper is currently sleeping. Try again later." },
      { status: 500 }
    );
  }
}
