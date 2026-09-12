import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { partyActionSchema } from "@/lib/validations";
import { generatePartyCode, applyBossDamage, BOSS_TIERS } from "@/lib/partyBoss";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Guild records require authentication." },
        { status: 401 }
      );
    }

    const membership = await prisma.partyMember.findUnique({
      where: { userId: user.id },
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
                    streakCount: true,
                    characterClass: true,
                    prestigeLevel: true,
                    xp: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!membership || !membership.party) {
      return NextResponse.json({ inParty: false }, { status: 200 });
    }

    const party = membership.party;
    const bossInfo = BOSS_TIERS.find((b) => b.name === party.bossName) || BOSS_TIERS[0];
    
    // Sort members: Prestige > Level > XP
    party.members.sort((a, b) => {
      if (b.user.prestigeLevel !== a.user.prestigeLevel) return b.user.prestigeLevel - a.user.prestigeLevel;
      if (b.user.level !== a.user.level) return b.user.level - a.user.level;
      return b.user.xp - a.user.xp;
    });

    const mvpUserId = party.members.length > 0 ? party.members[0].user.id : null;

    // Fetch recent party battle ticker events
    const memberUserIds = party.members.map((m) => m.user.id);
    const recentLogs = await prisma.activityLog.findMany({
      where: {
        userId: { in: memberUserIds },
      },
      orderBy: { createdAt: "desc" },
      take: 8,
    });

    const battleTicker = recentLogs.map((log) => {
      const member = party.members.find((m) => m.user.id === log.userId);
      return {
        id: log.id,
        username: member?.user.username || "Adventurer",
        message: log.message,
        actionType: log.actionType,
        createdAt: log.createdAt,
      };
    });

    const { parsePartyBuffs } = await import("@/lib/partyBuffs");
    const activeBuffs = parsePartyBuffs(membership.party.activeBuffs);

    let activeQuest = null;
    if (membership.party.activeQuest) {
      try {
        activeQuest = JSON.parse(membership.party.activeQuest);
      } catch {
        activeQuest = null;
      }
    }

    return NextResponse.json({
      inParty: true,
      party: {
        id: membership.party.id,
        name: membership.party.name,
        code: membership.party.code,
        bossName: membership.party.bossName,
        bossMaxHp: membership.party.bossMaxHp,
        bossCurrentHp: membership.party.bossCurrentHp,
        bossRage: membership.party.bossRage ?? 0,
        activeBuffs,
        activeQuest,
        bossInfo,
        mvpUserId,
        battleTicker,
        members: membership.party.members.map((m) => ({
          id: m.id,
          joinedAt: m.joinedAt,
          user: m.user,
        })),
      },
    });
  } catch (error) {
    console.error("Fetch party error:", error);
    return NextResponse.json(
      { error: "Failed to read guild warboard." },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required to commune with the guild." },
        { status: 401 }
      );
    }

    const rawBody = await req.json();
    const parseResult = partyActionSchema.safeParse(rawBody);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.issues[0]?.message || "Invalid party action." },
        { status: 400 }
      );
    }

    const { action, name, code } = parseResult.data;

    // Check existing membership
    const existingMembership = await prisma.partyMember.findUnique({
      where: { userId: user.id },
      include: { party: true },
    });

    if (action === "CREATE") {
      if (existingMembership) {
        return NextResponse.json(
          { error: "You must leave your current guild before chartering a new fellowship." },
          { status: 400 }
        );
      }

      if (!name || name.length < 3) {
        return NextResponse.json(
          { error: "Guild charter requires a noble name of at least 3 characters." },
          { status: 400 }
        );
      }

      // Generate unique code
      let partyCode = generatePartyCode();
      let attempts = 0;
      while (attempts < 5) {
        const found = await prisma.party.findUnique({ where: { code: partyCode } });
        if (!found) break;
        partyCode = generatePartyCode();
        attempts++;
      }

      const initialBoss = BOSS_TIERS[0];

      const newParty = await prisma.$transaction(async (tx) => {
        const party = await tx.party.create({
          data: {
            name,
            code: partyCode,
            bossName: initialBoss.name,
            bossMaxHp: initialBoss.maxHp,
            bossCurrentHp: initialBoss.maxHp,
          },
        });

        await tx.partyMember.create({
          data: {
            partyId: party.id,
            userId: user.id,
          },
        });

        await tx.activityLog.create({
          data: {
            userId: user.id,
            actionType: "PARTY_CREATE",
            message: `${user.username} founded guild "${name}" with invite code ${partyCode}!`,
          },
        });

        return party;
      });

      return NextResponse.json({
        success: true,
        message: `Guild "${newParty.name}" founded! Share code ${newParty.code} with your allies.`,
        partyId: newParty.id,
      });
    }

    if (action === "JOIN") {
      if (existingMembership) {
        return NextResponse.json(
          { error: "You are already sworn to a guild. Renounce your vow before joining another." },
          { status: 400 }
        );
      }

      if (!code) {
        return NextResponse.json(
          { error: "Guild code is required to find your comrades." },
          { status: 400 }
        );
      }

      const targetParty = await prisma.party.findUnique({
        where: { code: code.toUpperCase().trim() },
      });

      if (!targetParty) {
        return NextResponse.json(
          { error: "No guild charter exists with that code. Check for scribe typos!" },
          { status: 404 }
        );
      }

      await prisma.$transaction(async (tx) => {
        await tx.partyMember.create({
          data: {
            partyId: targetParty.id,
            userId: user.id,
          },
        });

        await tx.activityLog.create({
          data: {
            userId: user.id,
            actionType: "PARTY_JOIN",
            message: `${user.username} joined guild "${targetParty.name}"! Raid forces reinforced.`,
          },
        });
      });

      return NextResponse.json({
        success: true,
        message: `Welcome to "${targetParty.name}"! Draw steel alongside your fellows.`,
      });
    }

    if (action === "LEAVE") {
      if (!existingMembership) {
        return NextResponse.json(
          { error: "You are a lone wolf and cannot leave a guild you never joined." },
          { status: 400 }
        );
      }

      const partyId = existingMembership.partyId;

      await prisma.$transaction(async (tx) => {
        await tx.partyMember.delete({
          where: { id: existingMembership.id },
        });

        const remaining = await tx.partyMember.count({
          where: { partyId },
        });

        if (remaining === 0) {
          await tx.party.delete({ where: { id: partyId } });
        }
      });

      return NextResponse.json({
        success: true,
        message: "You have parted ways with your guild. You travel alone once more.",
      });
    }

    if (action === "CHEER") {
      if (!existingMembership) {
        return NextResponse.json(
          { error: "Only enlisted guild members can rally the raid party." },
          { status: 400 }
        );
      }

      const damage = 25; // Rally morale damage
      const result = await applyBossDamage(
        existingMembership.partyId,
        damage,
        user.username
      );

      return NextResponse.json({
        success: true,
        message: `You shouted a fiery battle cry! Dealt ${damage} morale damage to ${result?.bossName || "the Boss"}.`,
        bossResult: result,
      });
    }

    return NextResponse.json({ error: "Unhandled guild action." }, { status: 400 });
  } catch (error: unknown) {
    console.error("Party POST error:", error);
    return NextResponse.json(
      { error: "An arcane mishap disrupted guild operations." },
      { status: 500 }
    );
  }
}
