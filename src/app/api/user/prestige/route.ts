import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

const PRESTIGE_LEVEL_REQUIREMENT = 50;

export async function POST(req: NextRequest) {
  try {
    const userPayload = await requireAuth(req);
    if (!userPayload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userPayload.userId },
      include: { stats: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.level < PRESTIGE_LEVEL_REQUIREMENT) {
      return NextResponse.json(
        { error: `Must be level ${PRESTIGE_LEVEL_REQUIREMENT} to prestige.` },
        { status: 400 }
      );
    }

    // Prestige: Reset level to 1, xp to 0, increment prestigeLevel. Reset stats to 10.
    const updatedUser = await prisma.$transaction(async (tx) => {
      const u = await tx.user.update({
        where: { id: user.id },
        data: {
          level: 1,
          xp: 0,
          prestigeLevel: { increment: 1 },
          title: `Prestige ${user.prestigeLevel + 1} Procrastinator`,
        },
      });

      if (user.stats) {
        await tx.userStats.update({
          where: { userId: user.id },
          data: {
            strength: 10,
            intellect: 10,
            vitality: 10,
            dexterity: 10,
            charisma: 10,
            sanity: 10,
          },
        });
      }

      await tx.activityLog.create({
        data: {
          userId: user.id,
          actionType: "PRESTIGE",
          message: `Rebirthed to Prestige Level ${user.prestigeLevel + 1}!`,
        },
      });

      return u;
    });

    return NextResponse.json({ message: "Prestige successful!", user: updatedUser });
  } catch (error) {
    console.error("Prestige Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
