import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import { verifyPassword, signToken, AUTH_COOKIE_NAME } from "@/lib/auth";
import { loginSchema } from "@/lib/validations";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    const rateLimit = checkRateLimit(`login_${ip}`, 10, 60 * 1000);
    if (!rateLimit.success) {
      return NextResponse.json(
        {
          error: "Too many failed gate attempts! The tavern guards have barred the entrance for 60 seconds.",
        },
        { status: 429 }
      );
    }

    const body = await req.json();
    const parseResult = loginSchema.safeParse(body);

    if (!parseResult.success) {
      const firstError = parseResult.error.issues[0]?.message || "Invalid credentials format.";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const { login, password } = parseResult.data;
    const cleanLogin = login.trim();

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: cleanLogin.toLowerCase() },
          { username: cleanLogin },
        ],
      },
      include: {
        stats: true,
        inventory: {
          include: {
            item: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "No such hero exists in the town directory. Did you misspell your legend?" },
        { status: 401 }
      );
    }

    const isMatch = await verifyPassword(password, user.passwordHash);
    if (!isMatch) {
      return NextResponse.json(
        { error: "Incorrect secret pass-phrase! The castle guard refuses you entry." },
        { status: 401 }
      );
    }

    // Streak and active date calculation
    const now = new Date();
    const lastActive = new Date(user.lastActiveDate);

    const isSameDay =
      now.getFullYear() === lastActive.getFullYear() &&
      now.getMonth() === lastActive.getMonth() &&
      now.getDate() === lastActive.getDate();

    let newStreak = user.streakCount;
    let streakBonusMessage: string | null = null;

    if (!isSameDay) {
      const msPerDay = 1000 * 60 * 60 * 24;
      const daysDifference = Math.floor(
        (Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) -
          Date.UTC(lastActive.getFullYear(), lastActive.getMonth(), lastActive.getDate())) /
          msPerDay
      );

      if (daysDifference === 1) {
        newStreak += 1;
        streakBonusMessage = `Daily streak extended to ${newStreak} consecutive days!`;
      } else if (daysDifference > 1) {
        newStreak = 1;
        streakBonusMessage = "Streak expired due to an unscheduled nap in the tavern. Starting fresh!";
      }

      await prisma.user.update({
        where: { id: user.id },
        data: {
          streakCount: newStreak,
          lastActiveDate: now,
          logs: {
            create: {
              actionType: "LOGIN",
              message: streakBonusMessage || "Checked into the Adventurer's Guild.",
            },
          },
        },
      });
    }

    const token = signToken({
      userId: user.id,
      email: user.email,
      username: user.username,
    });

    const cookieStore = await cookies();
    cookieStore.set(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });

    return NextResponse.json({
      success: true,
      message: "Access granted! Welcome back to the quest registry.",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        level: user.level,
        xp: user.xp,
        gold: user.gold,
        streakCount: newStreak,
        title: user.title,
        avatar: user.avatar,
        stats: user.stats,
        inventory: user.inventory,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "The tavern gates are jammed. Please try knocking again." },
      { status: 500 }
    );
  }
}
