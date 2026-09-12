import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { calculateLevelFromTotalXp, DIFFICULTY_MULTIPLIERS, QuestCategory, QuestDifficulty } from "@/lib/rpgEngine";
import { updateQuestActionSchema } from "@/lib/validations";
import { CharacterClassType, calculateDiminishingReturnsMultiplier, applyClassPassives } from "@/lib/classes";

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
    const parseResult = updateQuestActionSchema.safeParse(body);

    if (!parseResult.success) {
      const firstError = parseResult.error.issues[0]?.message || "Invalid quest update payload.";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const { action, title, description, category, difficulty, dueDate } = parseResult.data;

    // Concurrency-safe atomic transaction for quest completion
    if (action === "COMPLETE") {
      const result = await prisma.$transaction(async (tx) => {
        const task = await tx.task.findFirst({
          where: { id, userId: user.id },
        });

        if (!task) {
          throw new Error("QUEST_NOT_FOUND");
        }

        if (task.status === "COMPLETED") {
          throw new Error("ALREADY_COMPLETED");
        }

        // Fresh user state inside transaction
        const freshUser = await tx.user.findUnique({
          where: { id: user.id },
        });

        if (!freshUser) {
          throw new Error("USER_NOT_FOUND");
        }

        const questCategory = task.category as QuestCategory;
        const charClass = (freshUser.characterClass as CharacterClassType) || "WARRIOR";

        // Count quests completed in this category today for diminishing returns (min_max reference)
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);

        const completedTodayCount = await tx.task.count({
          where: {
            userId: freshUser.id,
            category: task.category,
            status: "COMPLETED",
            completedAt: { gte: startOfToday },
          },
        });

        const diminishing = calculateDiminishingReturnsMultiplier(
          completedTodayCount,
          charClass,
          questCategory
        );

        const baseRewards = {
          xp: Math.max(5, Math.round(task.xpReward * diminishing.multiplier)),
          gold: Math.max(1, Math.round(task.goldReward * diminishing.multiplier)),
          statPoints: DIFFICULTY_MULTIPLIERS[task.difficulty as QuestDifficulty]?.statPoints || 2,
        };

        // Apply class perks (Habitica reference)
        const { finalRewards, perkMessages } = applyClassPassives(
          charClass,
          questCategory,
          task.difficulty,
          baseRewards
        );

        const xpEarned = finalRewards.xp;
        const goldEarned = finalRewards.gold;
        const statBonus = finalRewards.statPoints;

        const newTotalXp = freshUser.xp + xpEarned;
        const newGold = freshUser.gold + goldEarned;
        const levelResult = calculateLevelFromTotalXp(newTotalXp);
        const didLevelUp = levelResult.level > freshUser.level;

        // Update task status atomically
        const updatedTask = await tx.task.update({
          where: { id: task.id },
          data: {
            status: "COMPLETED",
            completedAt: new Date(),
          },
        });

        // Update user state atomically
        const updatedUser = await tx.user.update({
          where: { id: freshUser.id },
          data: {
            level: levelResult.level,
            xp: newTotalXp,
            gold: newGold,
            title: levelResult.title,
          },
        });

        // Update specific character stat and refresh decay cadence timestamp
        const statField = questCategory.toLowerCase() as
          | "strength"
          | "intellect"
          | "vitality"
          | "dexterity"
          | "charisma"
          | "sanity";

        const dateFieldMap: Record<string, string> = {
          strength: "lastStrengthDate",
          intellect: "lastIntellectDate",
          vitality: "lastVitalityDate",
          dexterity: "lastDexterityDate",
          charisma: "lastCharismaDate",
          sanity: "lastSanityDate",
        };

        const dateFieldName = dateFieldMap[statField] || "lastStrengthDate";

        const updatedStats = await tx.userStats.upsert({
          where: { userId: freshUser.id },
          create: {
            userId: freshUser.id,
            [statField]: 10 + statBonus,
            [dateFieldName]: new Date(),
          },
          update: {
            [statField]: { increment: statBonus },
            [dateFieldName]: new Date(),
          },
        });

        // Construct narrative log
        const narrativeParts = [
          `Slew "${task.title}". Collected +${xpEarned} XP, +${goldEarned} Gold, +${statBonus} ${questCategory}.`,
        ];
        if (perkMessages.length > 0) {
          narrativeParts.push(perkMessages.join(" "));
        }
        if (diminishing.notice) {
          narrativeParts.push(diminishing.notice);
        }

        await tx.activityLog.create({
          data: {
            userId: freshUser.id,
            actionType: didLevelUp ? "LEVEL_UP" : "QUEST_COMPLETED",
            message: didLevelUp
              ? `Leveled up to Level ${levelResult.level} (${levelResult.title})! ${narrativeParts.join(" ")}`
              : narrativeParts.join(" "),
            xpChange: xpEarned,
            goldChange: goldEarned,
          },
        });

        return {
          updatedTask,
          updatedUser: {
            ...updatedUser,
            stats: updatedStats,
          },
          rewards: {
            xp: xpEarned,
            gold: goldEarned,
            statCategory: questCategory,
            statBonus,
          },
          perkMessages,
          diminishingNotice: diminishing.notice,
          didLevelUp,
          newLevel: levelResult.level,
          newTitle: levelResult.title,
        };
      });

      return NextResponse.json({
        success: true,
        message: result.didLevelUp
          ? `GLORIOUS VICTORY! Leveled up to Level ${result.newLevel}: ${result.newTitle}!`
          : `Quest slain! Earned +${result.rewards.xp} XP and +${result.rewards.gold} Gold.`,
        task: result.updatedTask,
        user: result.updatedUser,
        rewards: result.rewards,
        perkMessages: result.perkMessages,
        diminishingNotice: result.diminishingNotice,
        didLevelUp: result.didLevelUp,
        newLevel: result.newLevel,
        newTitle: result.newTitle,
      });
    }

    if (action === "ABANDON") {
      const updatedTask = await prisma.task.update({
        where: { id },
        data: { status: "ABANDONED" },
      });

      await prisma.activityLog.create({
        data: {
          userId: user.id,
          actionType: "QUEST_ABANDONED",
          message: `Abandoned quest: "${updatedTask.title}". The guild archivist filed a formal sigh.`,
        },
      });

      return NextResponse.json({
        success: true,
        message: "Quest retired. Sometimes strategic retreat is the only choice.",
        task: updatedTask,
      });
    }

    if (action === "EDIT") {
      const existingTask = await prisma.task.findFirst({
        where: { id, userId: user.id },
      });

      if (!existingTask) {
        return NextResponse.json({ error: "Quest not found." }, { status: 404 });
      }

      const safeCategory = (category || existingTask.category) as QuestCategory;
      const safeDifficulty = (difficulty || existingTask.difficulty) as QuestDifficulty;
      const rewards = DIFFICULTY_MULTIPLIERS[safeDifficulty] || DIFFICULTY_MULTIPLIERS.MEDIUM;

      const updatedTask = await prisma.task.update({
        where: { id: existingTask.id },
        data: {
          title: title !== undefined ? title : existingTask.title,
          description: description !== undefined ? description : existingTask.description,
          category: safeCategory,
          difficulty: safeDifficulty,
          xpReward: rewards.xp,
          goldReward: rewards.gold,
          dueDate: dueDate ? new Date(dueDate) : existingTask.dueDate,
        },
      });

      return NextResponse.json({
        success: true,
        message: "Quest terms renegotiated with the guild.",
        task: updatedTask,
      });
    }

    return NextResponse.json({ error: "Invalid action specified." }, { status: 400 });
  } catch (error: unknown) {
    const err = error as Error;
    if (err.message === "ALREADY_COMPLETED") {
      return NextResponse.json(
        { error: "This quest has already been certified and slain. No double-dipping in the treasury!" },
        { status: 400 }
      );
    }
    if (err.message === "QUEST_NOT_FOUND") {
      return NextResponse.json({ error: "Quest not found in your log." }, { status: 404 });
    }

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
