import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import { getCurrentUser, verifyPassword, AUTH_COOKIE_NAME } from "@/lib/auth";

export async function DELETE(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in to verify identity." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { password, confirmationText } = body;

    if (!confirmationText || confirmationText.trim().toUpperCase() !== "DELETE") {
      return NextResponse.json(
        { error: "Please type DELETE to confirm permanent account removal." },
        { status: 400 }
      );
    }

    if (!password) {
      return NextResponse.json(
        { error: "Your passcode is required to authorize complete erasure of your legend." },
        { status: 400 }
      );
    }

    const isMatch = await verifyPassword(password, user.passwordHash);
    if (!isMatch) {
      return NextResponse.json(
        { error: "Incorrect passcode. Authorization denied." },
        { status: 401 }
      );
    }

    // Cascade delete user record and all associated relational data
    await prisma.user.delete({
      where: { id: user.id },
    });

    // Wipe session cookie
    const cookieStore = await cookies();
    cookieStore.set(AUTH_COOKIE_NAME, "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0,
      path: "/",
    });

    return NextResponse.json({
      success: true,
      message: "Your guild records, stats, and quests have been permanently dissolved into ether.",
    });
  } catch (error) {
    console.error("Account delete error:", error);
    return NextResponse.json(
      { error: "Failed to dissolve account ledger. Scribe error." },
      { status: 500 }
    );
  }
}
