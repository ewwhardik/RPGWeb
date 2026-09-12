import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import {
  QUEST_SCROLL_LIBRARY,
  createInitialQuestState,
  ActiveQuestState,
} from "@/lib/questEngine";
import { calculateLevelFromTotalXp } from "@/lib/rpgEngine";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized guild visitor." }, { status: 401 });
    }

    const membership = await prisma.partyMember.findUnique({
      where: { userId: user.id },
      include: {
        party: true,
      },
    });

    if (!membership || !membership.party) {
      return NextResponse.json({
        inParty: false,
        activeQuest: null,
        activeScrollDef: null,
        availableScrolls: Object.values(QUEST_SCROLL_LIBRARY),
      });
    }

    const party = membership.party;
    let activeQuest: ActiveQuestState | null = null;

    if (party.activeQuest) {
      try {
        activeQuest = JSON.parse(party.activeQuest);
      } catch {
        activeQuest = null;
      }
    }

    const activeScrollDef = activeQuest ? QUEST_SCROLL_LIBRARY[activeQuest.questId] || null : null;
    const hasClaimed = activeQuest ? activeQuest.claimedBy?.includes(user.id) : false;

    return NextResponse.json({
      inParty: true,
      partyId: party.id,
      activeQuest,
      activeScrollDef,
      hasClaimed,
      availableScrolls: Object.values(QUEST_SCROLL_LIBRARY),
    });
  } catch (error) {
    console.error("Fetch party quest error:", error);
    return NextResponse.json(
      { error: "Failed to read guild quest board." },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized guild visitor." }, { status: 401 });
    }

    const membership = await prisma.partyMember.findUnique({
      where: { userId: user.id },
      include: { party: true },
    });

    if (!membership || !membership.party) {
      return NextResponse.json(
        { error: "You must join a guild party before embarking on quest scrolls." },
        { status: 400 }
      );
    }

    const party = membership.party;
    const body = await req.json();
    const { action, questId } = body;

    if (action === "START") {
      if (!questId || !QUEST_SCROLL_LIBRARY[questId]) {
        return NextResponse.json({ error: "Invalid quest scroll selected." }, { status: 400 });
      }

      if (party.activeQuest) {
        try {
          const current = JSON.parse(party.activeQuest);
          if (!current.isCompleted) {
            return NextResponse.json(
              { error: "Your guild already has an active quest expedition in progress!" },
              { status: 400 }
            );
          }
        } catch {
          // ignore corrupted json and overwrite
        }
      }

      const newQuestState = createInitialQuestState(questId);
      if (!newQuestState) {
        return NextResponse.json({ error: "Could not unseal scroll." }, { status: 400 });
      }

      await prisma.party.update({
        where: { id: party.id },
        data: { activeQuest: JSON.stringify(newQuestState) },
      });

      const scrollDef = QUEST_SCROLL_LIBRARY[questId];
      await prisma.activityLog.create({
        data: {
          userId: user.id,
          actionType: "QUEST_STARTED",
          message: `Unsealed Guild Quest Scroll: "${scrollDef.title}"!`,
        },
      });

      return NextResponse.json({
        success: true,
        message: `Guild expedition launched: "${scrollDef.title}"!`,
        activeQuest: newQuestState,
        activeScrollDef: scrollDef,
      });
    }

    if (action === "ABANDON") {
      await prisma.party.update({
        where: { id: party.id },
        data: { activeQuest: null },
      });

      return NextResponse.json({
        success: true,
        message: "Guild quest expedition was abandoned.",
        activeQuest: null,
      });
    }

    if (action === "CLAIM") {
      if (!party.activeQuest) {
        return NextResponse.json({ error: "No active quest to claim." }, { status: 400 });
      }

      const activeState: ActiveQuestState = JSON.parse(party.activeQuest);
      if (!activeState.isCompleted) {
        return NextResponse.json({ error: "Quest objectives are not yet fully achieved!" }, { status: 400 });
      }

      if (activeState.claimedBy?.includes(user.id)) {
        return NextResponse.json({ error: "You have already claimed your spoils from this quest!" }, { status: 400 });
      }

      const scroll = QUEST_SCROLL_LIBRARY[activeState.questId];
      if (!scroll) {
        return NextResponse.json({ error: "Quest data missing." }, { status: 400 });
      }

      const freshUser = await prisma.user.findUnique({ where: { id: user.id } });
      if (!freshUser) {
        return NextResponse.json({ error: "User not found." }, { status: 404 });
      }

      const newXp = freshUser.xp + scroll.rewards.xp;
      const newGold = freshUser.gold + scroll.rewards.gold;
      const newShards = (freshUser.chronoShards ?? 0) + (scroll.rewards.chronoShards ?? 0);
      const levelCalc = calculateLevelFromTotalXp(newXp);

      // Give egg / potion drops if applicable
      if (scroll.rewards.items && scroll.rewards.items.length > 0) {
        for (const itemKey of scroll.rewards.items) {
          if (itemKey === "drop_dragon_egg") {
            await prisma.userPet.upsert({
              where: {
                userId_species_potionType: {
                  userId: user.id,
                  species: "Dragon",
                  potionType: "Base",
                },
              },
              create: {
                userId: user.id,
                species: "Dragon",
                potionType: "Base",
                feedCount: 5,
                isMount: false,
              },
              update: {
                feedCount: { increment: 10 },
              },
            });
          } else if (itemKey === "drop_wolf_egg") {
            await prisma.userPet.upsert({
              where: {
                userId_species_potionType: {
                  userId: user.id,
                  species: "Wolf",
                  potionType: "Base",
                },
              },
              create: {
                userId: user.id,
                species: "Wolf",
                potionType: "Base",
                feedCount: 5,
                isMount: false,
              },
              update: {
                feedCount: { increment: 10 },
              },
            });
          }
        }
      }

      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: {
          xp: newXp,
          gold: newGold,
          level: levelCalc.level,
          chronoShards: newShards,
        },
      });

      // Mark user as claimed
      activeState.claimedBy = [...(activeState.claimedBy || []), user.id];
      await prisma.party.update({
        where: { id: party.id },
        data: { activeQuest: JSON.stringify(activeState) },
      });

      await prisma.activityLog.create({
        data: {
          userId: user.id,
          actionType: "QUEST_CLAIMED",
          message: `Claimed spoils from "${scroll.title}": +${scroll.rewards.xp} XP, +${scroll.rewards.gold} Gold, +${scroll.rewards.chronoShards || 0} Shards!`,
          xpChange: scroll.rewards.xp,
          goldChange: scroll.rewards.gold,
        },
      });

      return NextResponse.json({
        success: true,
        message: `Claimed spoils for "${scroll.title}"! +${scroll.rewards.xp} XP, +${scroll.rewards.gold} Gold!`,
        user: {
          id: updatedUser.id,
          xp: updatedUser.xp,
          gold: updatedUser.gold,
          level: updatedUser.level,
          chronoShards: updatedUser.chronoShards,
        },
        activeQuest: activeState,
      });
    }

    return NextResponse.json({ error: "Unrecognized quest action." }, { status: 400 });
  } catch (error) {
    console.error("Party quest action error:", error);
    return NextResponse.json(
      { error: "Guild quest expedition encountered magic interference." },
      { status: 500 }
    );
  }
}
