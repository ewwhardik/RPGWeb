import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { DIFFICULTY_MULTIPLIERS, QuestCategory, QuestDifficulty } from "@/lib/rpgEngine";
import { createQuestSchema } from "@/lib/validations";

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

    const whereClause: {
      userId: string;
      status?: string;
      category?: string;
      OR?: Array<{ title?: { contains: string }; description?: { contains: string } }>;
    } = {
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
    const parseResult = createQuestSchema.safeParse(body);

    if (!parseResult.success) {
      const firstError = parseResult.error.issues[0]?.message || "Invalid quest parameters.";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const { title, description, category, difficulty, dueDate } = parseResult.data;

    const safeCategory = category as QuestCategory;
    const safeDifficulty = difficulty as QuestDifficulty;
    const rewards = DIFFICULTY_MULTIPLIERS[safeDifficulty] || DIFFICULTY_MULTIPLIERS.MEDIUM;

    const task = await prisma.task.create({
      data: {
        userId: user.id,
        title,
        description: description || null,
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
        message: `Posted new quest: "${title}" (${safeDifficulty} / ${safeCategory}).`,
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
