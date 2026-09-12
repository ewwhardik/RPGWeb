import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized adventurer." }, { status: 401 });
    }

    const { id } = await context.params;
    const body = await req.json();

    const existingTask = await prisma.task.findFirst({
      where: { id, userId: user.id },
    });

    if (!existingTask) {
      return NextResponse.json({ error: "Task not found." }, { status: 404 });
    }

    const updated = await prisma.task.update({
      where: { id },
      data: {
        title: body.title !== undefined ? body.title : existingTask.title,
        description: body.description !== undefined ? body.description : existingTask.description,
        difficulty: body.difficulty !== undefined ? body.difficulty : existingTask.difficulty,
        category: body.category !== undefined ? body.category : existingTask.category,
        repeatDays: body.repeatDays !== undefined ? body.repeatDays : existingTask.repeatDays,
        checklist: body.checklist !== undefined ? (typeof body.checklist === "string" ? body.checklist : JSON.stringify(body.checklist)) : existingTask.checklist,
        cost: body.cost !== undefined ? Number(body.cost) : existingTask.cost,
        up: body.up !== undefined ? Boolean(body.up) : existingTask.up,
        down: body.down !== undefined ? Boolean(body.down) : existingTask.down,
      },
    });

    return NextResponse.json({ task: updated });
  } catch (error) {
    console.error("Task update error:", error);
    return NextResponse.json(
      { error: "Failed to update task records." },
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
      return NextResponse.json({ error: "Unauthorized adventurer." }, { status: 401 });
    }

    const { id } = await context.params;

    const existingTask = await prisma.task.findFirst({
      where: { id, userId: user.id },
    });

    if (!existingTask) {
      return NextResponse.json({ error: "Task not found." }, { status: 404 });
    }

    await prisma.task.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Task erased from parchment." });
  } catch (error) {
    console.error("Task delete error:", error);
    return NextResponse.json(
      { error: "Failed to delete task." },
      { status: 500 }
    );
  }
}
