import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { DIFFICULTY_MULTIPLIERS, QuestCategory, QuestDifficulty } from "@/lib/rpgEngine";

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized guild visitor." }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || undefined;
    const category = searchParams.get("category") || undefined;
    const search = searchParams.get("search") || undefined;

    const whereClause: any = {
      userId: user.id,
    };

    if (status && status !== "ALL") {
      whereClause.status = status;
    }

    if (category && category !== "ALL") {
      whereClause.category = category;
    }

    if (search && search.trim().length > 0) {
      whereClause.OR = [
        { title: { contains: search.trim() } },
        { description: { contains: search.trim() } },
      ];
    }

    const tasks = await prisma.task.findMany({
      where: whereClause,
      orderBy: [
        { status: "asc" },
        { createdAt: "desc" },
      ],
    });

    return NextResponse.json({ tasks });
  } catch (error) {
    console.error("Fetch quests error:", error);
    return NextResponse.json(
      { error: "The parchment records fell off the desk. Try refreshing." },
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

    const body = await req.json();
    const { title, description, category, difficulty, dueDate } = body;

    if (!title || typeof title !== "string" || title.trim().length === 0) {
      return NextResponse.json(
        { error: "You cannot embark on a quest to do literally nothing. Name your endeavor!" },
        { status: 400 }
      );
    }

    const cleanTitle = title.trim();
    if (cleanTitle.length > 150) {
      return NextResponse.json(
        { error: "The quest title is longer than an epic poem. Keep it under 150 characters." },
        { status: 400 }
      );
    }

    const safeCategory = (category || "INTELLECT") as QuestCategory;
    const safeDifficulty = (difficulty || "MEDIUM") as QuestDifficulty;

    const rewards = DIFFICULTY_MULTIPLIERS[safeDifficulty] || DIFFICULTY_MULTIPLIERS.MEDIUM;

    const task = await prisma.task.create({
      data: {
        userId: user.id,
        title: cleanTitle,
        description: description ? String(description).trim() : null,
        category: safeCategory,
        difficulty: safeDifficulty,
        xpReward: rewards.xp,
        goldReward: rewards.gold,
        dueDate: dueDate ? new Date(dueDate) : null,
        status: "TODO",
      },
    });

    await prisma.activityLog.create({
      data: {
        userId: user.id,
        actionType: "QUEST_POSTED",
        message: `Posted new quest: "${cleanTitle}" (${safeDifficulty} / ${safeCategory}).`,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Quest nailed to the town notice board! Go vanquish it.",
      task,
    });
  } catch (error) {
    console.error("Create quest error:", error);
    return NextResponse.json(
      { error: "Could not draft quest. The guild inkwell broke." },
      { status: 500 }
    );
  }
}
