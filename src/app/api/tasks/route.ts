import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { DEFAULT_STARTER_TASKS } from "@/lib/taskEngine";

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized adventurer." }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.toLowerCase().trim() || "";
    const tag = searchParams.get("tag") || "ALL";

    // Check if user has zero tasks, seed starter tasks if brand new
    const totalCount = await prisma.task.count({
      where: { userId: user.id },
    });

    if (totalCount === 0) {
      for (const t of DEFAULT_STARTER_TASKS) {
        await prisma.task.create({
          data: {
            userId: user.id,
            type: t.type,
            title: t.title,
            description: t.description || null,
            category: t.category,
            difficulty: t.difficulty,
            up: t.up ?? true,
            down: t.down ?? false,
            value: t.value ?? 0,
            repeatDays: t.repeatDays ?? "0,1,2,3,4,5,6",
            checklist: t.checklist ?? null,
            cost: t.cost ?? null,
            status: "TODO",
          },
        });
      }

      // Seed starter pet if none exists
      const existingPet = await prisma.userPet.findFirst({
        where: { userId: user.id },
      });
      if (!existingPet) {
        await prisma.userPet.create({
          data: {
            userId: user.id,
            species: "Wolf",
            potionType: "Base",
            feedCount: 5,
            isMount: false,
          },
        });
        await prisma.user.update({
          where: { id: user.id },
          data: { currentPet: "Wolf-Base" },
        });
      }
    }

    const whereClause: {
      userId: string;
      category?: string;
      OR?: Array<{ title: { contains: string }; description?: { contains: string } }>;
    } = {
      userId: user.id,
    };

    if (tag && tag !== "ALL") {
      whereClause.category = tag;
    }

    const allTasks = await prisma.task.findMany({
      where: whereClause,
      orderBy: [{ createdAt: "desc" }],
    });

    const filteredTasks = search
      ? allTasks.filter(
          (t) =>
            t.title.toLowerCase().includes(search) ||
            (t.description && t.description.toLowerCase().includes(search))
        )
      : allTasks;

    const habits = filteredTasks.filter((t) => t.type === "HABIT");
    const dailies = filteredTasks.filter((t) => t.type === "DAILY");
    const todos = filteredTasks.filter((t) => t.type === "TODO" || !t.type);
    const rewards = filteredTasks.filter((t) => t.type === "REWARD");

    return NextResponse.json({
      habits,
      dailies,
      todos,
      rewards,
    });
  } catch (error) {
    console.error("Fetch tasks error:", error);
    return NextResponse.json(
      { error: "The parchment records fell off the tavern table." },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized adventurer." }, { status: 401 });
    }

    const body = await req.json();
    const {
      type = "TODO",
      title,
      description,
      category = "INTELLECT",
      difficulty = "MEDIUM",
      up = true,
      down = false,
      repeatDays = "0,1,2,3,4,5,6",
      checklist,
      dueDate,
      cost,
    } = body;

    if (!title || typeof title !== "string" || title.trim().length === 0) {
      return NextResponse.json(
        { error: "Every task needs a heroic title. Do not leave it blank." },
        { status: 400 }
      );
    }

    const validTypes = ["HABIT", "DAILY", "TODO", "REWARD"];
    const taskType = validTypes.includes(type) ? type : "TODO";

    const newTask = await prisma.task.create({
      data: {
        userId: user.id,
        type: taskType,
        title: title.trim(),
        description: description ? description.trim() : null,
        category,
        difficulty,
        up: Boolean(up),
        down: Boolean(down),
        value: 0,
        repeatDays: taskType === "DAILY" ? repeatDays : null,
        completedToday: false,
        streak: 0,
        checklist: checklist ? JSON.stringify(checklist) : null,
        dueDate: dueDate ? new Date(dueDate) : null,
        cost: taskType === "REWARD" ? Number(cost || 20) : null,
        status: "TODO",
      },
    });

    await prisma.activityLog.create({
      data: {
        userId: user.id,
        actionType: "TASK_CREATED",
        message: `Inscribed new ${taskType.toLowerCase()}: "${title.trim()}".`,
      },
    });

    return NextResponse.json({ task: newTask }, { status: 201 });
  } catch (error) {
    console.error("Create task error:", error);
    return NextResponse.json(
      { error: "Failed to carve task into the registry." },
      { status: 500 }
    );
  }
}
