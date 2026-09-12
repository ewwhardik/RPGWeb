import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { calculateLevelFromTotalXp, DIFFICULTY_MULTIPLIERS, QuestCategory, QuestDifficulty } from "@/lib/rpgEngine";

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized guild visitor." }, { status: 401 });
    }

    const { id } = await context.params;
    const body = await req.json();
    const { action } = body;

    const task = await prisma.task.findFirst({
      where: { id, userId: user.id },
    });

    if (!task) {
      return NextResponse.json({ error: "Quest not found in your log." }, { status: 404 });
    }

    if (action === "COMPLETE") {
      if (task.status === "COMPLETED") {
        return NextResponse.json(
          { error: "This quest has already been certified and slain. No double-dipping in the treasury!" },
          { status: 400 }
        );
      }

      const xpEarned = task.xpReward;
      const goldEarned = task.goldReward;
      const category = task.category as QuestCategory;
      const statBonus = DIFFICULTY_MULTIPLIERS[task.difficulty as QuestDifficulty]?.statPoints || 2;

      // Progression calculation
      const newTotalXp = user.xp + xpEarned;
      const newGold = user.gold + goldEarned;
      const levelResult = calculateLevelFromTotalXp(newTotalXp);
      const didLevelUp = levelResult.level > user.level;

      // Update task status
      const updatedTask = await prisma.task.update({
        where: { id: task.id },
        data: {
          status: "COMPLETED",
          completedAt: new Date(),
        },
      });

      // Update user level, total xp, gold, and title
      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: {
          level: levelResult.level,
          xp: newTotalXp,
          gold: newGold,
          title: levelResult.title,
        },
      });

      // Update specific character stat
      const statField = category.toLowerCase() as
        | "strength"
        | "intellect"
        | "vitality"
        | "dexterity"
        | "charisma"
        | "sanity";

      const updatedStats = await prisma.userStats.upsert({
        where: { userId: user.id },
        create: {
          userId: user.id,
          [statField]: 10 + statBonus,
        },
        update: {
          [statField]: { increment: statBonus },
        },
      });

      // Add activity log
      await prisma.activityLog.create({
        data: {
          userId: user.id,
          actionType: didLevelUp ? "LEVEL_UP" : "QUEST_COMPLETED",
          message: didLevelUp
            ? `Leveled up to Level ${levelResult.level} (${levelResult.title})! Slew "${task.title}".`
            : `Slew "${task.title}". Collected +${xpEarned} XP, +${goldEarned} Gold, +${statBonus} ${category}.`,
          xpChange: xpEarned,
          goldChange: goldEarned,
        },
      });

      return NextResponse.json({
        success: true,
        message: didLevelUp
          ? `GLORIOUS VICTORY! Leveled up to Level ${levelResult.level}: ${levelResult.title}!`
          : `Quest slain! Earned +${xpEarned} XP and +${goldEarned} Gold.`,
        task: updatedTask,
        user: {
          ...updatedUser,
          stats: updatedStats,
        },
        rewards: {
          xp: xpEarned,
          gold: goldEarned,
          statCategory: category,
          statBonus,
        },
        didLevelUp,
        newLevel: levelResult.level,
        newTitle: levelResult.title,
      });
    }

    if (action === "ABANDON") {
      const updatedTask = await prisma.task.update({
        where: { id: task.id },
        data: { status: "ABANDONED" },
      });

      await prisma.activityLog.create({
        data: {
          userId: user.id,
          actionType: "QUEST_ABANDONED",
          message: `Abandoned quest: "${task.title}". The guild archivist filed a formal sigh.`,
        },
      });

      return NextResponse.json({
        success: true,
        message: "Quest retired. Sometimes strategic retreat is the only choice.",
        task: updatedTask,
      });
    }

    if (action === "EDIT") {
      const { title, description, category, difficulty, dueDate } = body;
      const safeCategory = (category || task.category) as QuestCategory;
      const safeDifficulty = (difficulty || task.difficulty) as QuestDifficulty;
      const rewards = DIFFICULTY_MULTIPLIERS[safeDifficulty] || DIFFICULTY_MULTIPLIERS.MEDIUM;

      const updatedTask = await prisma.task.update({
        where: { id: task.id },
        data: {
          title: title ? String(title).trim() : task.title,
          description: description !== undefined ? (description ? String(description).trim() : null) : task.description,
          category: safeCategory,
          difficulty: safeDifficulty,
          xpReward: rewards.xp,
          goldReward: rewards.gold,
          dueDate: dueDate ? new Date(dueDate) : task.dueDate,
        },
      });

      return NextResponse.json({
        success: true,
        message: "Quest terms renegotiated with the guild.",
        task: updatedTask,
      });
    }

    return NextResponse.json({ error: "Invalid guild action specified." }, { status: 400 });
  } catch (error) {
    console.error("Update quest error:", error);
    return NextResponse.json(
      { error: "The quest scribe spilled coffee on your parchment." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized guild visitor." }, { status: 401 });
    }

    const { id } = await context.params;

    const task = await prisma.task.findFirst({
      where: { id, userId: user.id },
    });

    if (!task) {
      return NextResponse.json({ error: "Quest not found." }, { status: 404 });
    }

    await prisma.task.delete({
      where: { id: task.id },
    });

    await prisma.activityLog.create({
      data: {
        userId: user.id,
        actionType: "QUEST_DELETED",
        message: `Shredded quest document for: "${task.title}". Evidence destroyed.`,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Quest scroll fed to the shredder goblin. Gone forever.",
    });
  } catch (error) {
    console.error("Delete quest error:", error);
    return NextResponse.json(
      { error: "Failed to erase quest from existence." },
      { status: 500 }
    );
  }
}
