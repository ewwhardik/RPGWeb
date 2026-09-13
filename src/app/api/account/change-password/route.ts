import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser, verifyPassword, hashPassword } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized. Please sign into the guild first." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "Both current passcode and new passcode are required." },
        { status: 400 }
      );
    }

    // Verify current passcode
    const isMatch = await verifyPassword(currentPassword, user.passwordHash);
    if (!isMatch) {
      return NextResponse.json(
        { error: "Current passcode does not match guild records. Verification failed." },
        { status: 401 }
      );
    }

    // Validate new passcode strength
    if (typeof newPassword !== "string" || newPassword.length < 6) {
      return NextResponse.json(
        { error: "New passcode must be at least 6 characters in length." },
        { status: 400 }
      );
    }

    if (currentPassword === newPassword) {
      return NextResponse.json(
        { error: "New passcode cannot be identical to your existing passcode." },
        { status: 400 }
      );
    }

    const newHash = await hashPassword(newPassword);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: newHash,
        logs: {
          create: {
            actionType: "PASSWORD_CHANGE",
            message: "Sanctuary passcode re-forged with arcane seals.",
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Passcode updated successfully! Keep your secret safe from dungeon rogues.",
    });
  } catch (error) {
    console.error("Change password error:", error);
    return NextResponse.json(
      { error: "Arcane failure while resetting cipher seal. Try again." },
      { status: 500 }
    );
  }
}
