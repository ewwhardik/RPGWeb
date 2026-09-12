import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import { hashPassword, signToken, AUTH_COOKIE_NAME } from "@/lib/auth";
import { registerSchema } from "@/lib/validations";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    const rateLimit = checkRateLimit(`register_${ip}`, 8, 60 * 1000);
    if (!rateLimit.success) {
      return NextResponse.json(
        {
          error: "Too many enlistment scrolls submitted. The guild scribe demands a 60-second tea break.",
        },
        { status: 429 }
      );
    }

    const body = await req.json();
    const parseResult = registerSchema.safeParse(body);

    if (!parseResult.success) {
      const firstError = parseResult.error.issues[0]?.message || "Invalid registration data.";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const { username, email, password, avatar } = parseResult.data;
    const cleanEmail = email.toLowerCase();

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email: cleanEmail }, { username }],
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
        username,
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
