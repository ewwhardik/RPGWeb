import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { SEED_CHALLENGES, ChallengeTaskTemplate } from "@/lib/challenges";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized guild visitor." }, { status: 401 });
    }

    let challenges = await prisma.challenge.findMany({
      include: {
        participants: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // Auto-seed default challenges if empty
    if (challenges.length === 0) {
      for (const def of SEED_CHALLENGES) {
        await prisma.challenge.create({
          data: {
            id: def.id,
            name: def.name,
            description: def.description,
            category: def.category,
            prizePool: def.prizePool,
            creatorId: user.id,
            tasksJson: JSON.stringify(def.tasks),
          },
        });
      }

      challenges = await prisma.challenge.findMany({
        include: { participants: true },
        orderBy: { createdAt: "desc" },
      });
    }

    const formattedChallenges = challenges.map((c) => {
      const isJoined = c.participants.some((p) => p.userId === user.id);
      let tasks: ChallengeTaskTemplate[] = [];
      try {
        tasks = JSON.parse(c.tasksJson);
      } catch {
        tasks = [];
      }

      return {
        id: c.id,
        name: c.name,
        description: c.description,
        category: c.category,
        prizePool: c.prizePool,
        creatorId: c.creatorId,
        participantCount: c.participants.length,
        isJoined,
        tasks,
        createdAt: c.createdAt,
      };
    });

    return NextResponse.json({
      challenges: formattedChallenges,
    });
  } catch (error) {
    console.error("Fetch challenges error:", error);
    return NextResponse.json(
      { error: "Failed to read guild challenge boards." },
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
    const { action, challengeId, name, description, category, prizePool, tasks } = body;

    if (action === "JOIN") {
      if (!challengeId) {
        return NextResponse.json({ error: "Missing challenge ID." }, { status: 400 });
      }

      const challenge = await prisma.challenge.findUnique({
        where: { id: challengeId },
        include: { participants: true },
      });

      if (!challenge) {
        return NextResponse.json({ error: "Challenge not found." }, { status: 404 });
      }

      const existing = challenge.participants.find((p) => p.userId === user.id);
      if (existing) {
        return NextResponse.json({ error: "You are already competing in this challenge!" }, { status: 400 });
      }

      // Add participant
      await prisma.challengeParticipant.create({
        data: {
          challengeId: challenge.id,
          userId: user.id,
        },
      });

      // Clone challenge tasks into user's task board
      let taskTemplates: ChallengeTaskTemplate[] = [];
      try {
        taskTemplates = JSON.parse(challenge.tasksJson);
      } catch {
        taskTemplates = [];
      }

      for (const t of taskTemplates) {
        await prisma.task.create({
          data: {
            userId: user.id,
            type: t.type,
            title: `⚔️ [${challenge.name.split(" ")[0]}] ${t.title}`,
            description: t.description || `Part of the "${challenge.name}" guild challenge.`,
            category: t.category || challenge.category,
            difficulty: t.difficulty || "MEDIUM",
            repeatDays: t.type === "DAILY" ? t.repeatDays || "0,1,2,3,4,5,6" : null,
            status: "TODO",
          },
        });
      }

      await prisma.activityLog.create({
        data: {
          userId: user.id,
          actionType: "CHALLENGE_JOINED",
          message: `Enlisted in Guild Challenge: "${challenge.name}"! Cloned ${taskTemplates.length} challenge tasks.`,
        },
      });

      return NextResponse.json({
        success: true,
        message: `Accepted the challenge: "${challenge.name}"! Added tasks to your board.`,
      });
    }

    if (action === "LEAVE") {
      if (!challengeId) {
        return NextResponse.json({ error: "Missing challenge ID." }, { status: 400 });
      }

      await prisma.challengeParticipant.deleteMany({
        where: {
          challengeId,
          userId: user.id,
        },
      });

      return NextResponse.json({
        success: true,
        message: "Withdrew from guild challenge.",
      });
    }

    if (action === "CREATE") {
      if (!name || !name.trim()) {
        return NextResponse.json({ error: "Challenge name is required." }, { status: 400 });
      }

      const newChallenge = await prisma.challenge.create({
        data: {
          name: name.trim(),
          description: description?.trim() || "A noble guild community challenge.",
          category: category || "GENERAL",
          prizePool: Number(prizePool || 200),
          creatorId: user.id,
          tasksJson: JSON.stringify(tasks || []),
        },
      });

      // Creator automatically joins
      await prisma.challengeParticipant.create({
        data: {
          challengeId: newChallenge.id,
          userId: user.id,
        },
      });

      return NextResponse.json({
        success: true,
        message: `Inscribed new guild challenge: "${newChallenge.name}"!`,
        challenge: newChallenge,
      });
    }

    return NextResponse.json({ error: "Unrecognized action." }, { status: 400 });
  } catch (error) {
    console.error("Challenge action error:", error);
    return NextResponse.json(
      { error: "Guild challenge herald failed to process request." },
      { status: 500 }
    );
  }
}
