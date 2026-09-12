import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const userPayload = await requireAuth(req);
    if (!userPayload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const partyMember = await prisma.partyMember.findUnique({
      where: { userId: userPayload.userId },
      include: {
        party: {
          include: {
            members: {
              include: {
                user: {
                  select: {
                    id: true,
                    username: true,
                    level: true,
                    xp: true,
                    title: true,
                    avatar: true,
                    prestigeLevel: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!partyMember || !partyMember.party) {
      return NextResponse.json({ error: "Not in a party" }, { status: 404 });
    }

    const members = partyMember.party.members.map((m) => m.user);
    
    // Sort by prestige first, then level, then xp
    members.sort((a, b) => {
      if (b.prestigeLevel !== a.prestigeLevel) return b.prestigeLevel - a.prestigeLevel;
      if (b.level !== a.level) return b.level - a.level;
      return b.xp - a.xp;
    });

    return NextResponse.json({ success: true, leaderboard: members });
  } catch (error) {
    console.error("Leaderboard error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
