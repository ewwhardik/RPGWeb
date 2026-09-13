import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import { getCurrentUser, signToken, AUTH_COOKIE_NAME } from "@/lib/auth";

export async function PATCH(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized. Please sign into the guild first." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { username, title, avatar } = body;

    const updateData: {
      username?: string;
      title?: string;
      avatar?: string;
    } = {};

    // Validate username if changing
    if (typeof username === "string") {
      const cleanUsername = username.trim();
      if (cleanUsername.length < 3 || cleanUsername.length > 25) {
        return NextResponse.json(
          { error: "Username must be between 3 and 25 characters long." },
          { status: 400 }
        );
      }
      if (!/^[a-zA-Z0-9_-]+$/.test(cleanUsername)) {
        return NextResponse.json(
          { error: "Username may only contain letters, numbers, hyphens, and underscores." },
          { status: 400 }
        );
      }

      if (cleanUsername !== user.username) {
        const existing = await prisma.user.findFirst({
          where: {
            username: { equals: cleanUsername, mode: "insensitive" },
            NOT: { id: user.id },
          },
        });

        if (existing) {
          return NextResponse.json(
            { error: "This guild handle is already claimed by another hero!" },
            { status: 409 }
          );
        }
        updateData.username = cleanUsername;
      }
    }

    // Validate title if changing
    if (typeof title === "string") {
      const cleanTitle = title.trim();
      if (cleanTitle.length > 40) {
        return NextResponse.json(
          { error: "Title must not exceed 40 characters." },
          { status: 400 }
        );
      }
      updateData.title = cleanTitle || "Novice Procrastinator";
    }

    // Validate avatar if changing
    if (typeof avatar === "string" && avatar.trim()) {
      updateData.avatar = avatar.trim();
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { message: "No changes requested.", user },
        { status: 200 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        ...updateData,
        logs: {
          create: {
            actionType: "PROFILE_UPDATE",
            message: `Updated guild credentials: ${
              updateData.username ? `New name [${updateData.username}] ` : ""
            }${updateData.title ? `Title [${updateData.title}]` : ""}`.trim(),
          },
        },
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

    // Re-issue JWT session token with refreshed username
    const token = signToken({
      userId: updatedUser.id,
      email: updatedUser.email,
      username: updatedUser.username,
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
      message: "Guild identity updated and sealed in parchment!",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Account profile update error:", error);
    return NextResponse.json(
      { error: "Failed to update identity record. Scribe error." },
      { status: 500 }
    );
  }
}
