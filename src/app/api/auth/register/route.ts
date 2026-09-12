import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import { hashPassword, signToken, AUTH_COOKIE_NAME } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { username, email, password, avatar } = body;

    if (!username || typeof username !== "string" || username.trim().length < 2) {
      return NextResponse.json(
        { error: "Every adventurer needs a name at least 2 characters long. The bards need something to sing." },
        { status: 400 }
      );
    }

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { error: "Provide a valid email scroll so we know where to deliver your royal writs." },
        { status: 400 }
      );
    }

    if (!password || typeof password !== "string" || password.length < 6) {
      return NextResponse.json(
        { error: "Your secret pass-phrase must be at least 6 characters long to deter petty goblins." },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanUsername = username.trim();

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email: cleanEmail }, { username: cleanUsername }],
      },
    });

    if (existingUser) {
      if (existingUser.email === cleanEmail) {
        return NextResponse.json(
          { error: "An adventurer with this email is already registered in the kingdom's archives." },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { error: "That heroic name is already claimed! Pick a distinctive title." },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);

    const newUser = await prisma.user.create({
      data: {
        username: cleanUsername,
        email: cleanEmail,
        passwordHash,
        avatar: avatar || "warrior",
        level: 1,
        xp: 0,
        gold: 50,
        streakCount: 1,
        lastActiveDate: new Date(),
        title: "Novice Procrastinator",
        stats: {
          create: {
            strength: 10,
            intellect: 10,
            vitality: 10,
            dexterity: 10,
            charisma: 10,
            sanity: 10,
          },
        },
        logs: {
          create: {
            actionType: "ACCOUNT_CREATED",
            message: "Enrolled in the Adventurer's Guild. Awarded 50 starter Gold and a blank quest log.",
            goldChange: 50,
          },
        },
      },
      include: {
        stats: true,
      },
    });

    const token = signToken({
      userId: newUser.id,
      email: newUser.email,
      username: newUser.username,
    });

    const cookieStore = await cookies();
    cookieStore.set(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    });

    return NextResponse.json({
      success: true,
      message: "Guild registration approved! Welcome to the realm of productive heroism.",
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        level: newUser.level,
        xp: newUser.xp,
        gold: newUser.gold,
        streakCount: newUser.streakCount,
        title: newUser.title,
        avatar: newUser.avatar,
        stats: newUser.stats,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "The guild bureaucracy encountered a parchment paper jam. Please try again." },
      { status: 500 }
    );
  }
}
