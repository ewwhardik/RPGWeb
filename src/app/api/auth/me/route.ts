import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { checkAndApplyStatDecay } from "@/lib/statDecay";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    // Run stat decay check for neglected attributes
    const decayResult = await checkAndApplyStatDecay(user.id);

    const safeUser = {
      id: user.id,
      email: user.email,
      username: user.username,
      level: user.level,
      xp: user.xp,
      gold: user.gold,
      streakCount: user.streakCount,
      title: user.title,
      avatar: user.avatar,
      characterClass: user.characterClass,
      prestigeLevel: user.prestigeLevel,
      hp: user.hp ?? 50,
      maxHp: user.maxHp ?? 50,
      mp: user.mp ?? 50,
      maxMp: user.maxMp ?? 50,
      isSleeping: user.isSleeping ?? false,
      currentPet: user.currentPet ?? null,
      currentMount: user.currentMount ?? null,
      stats: user.stats,
      inventory: user.inventory,
    };

    return NextResponse.json({
      user: safeUser,
      decayAlerts: decayResult.hasDecayed ? decayResult.messages : [],
    });
  } catch (error) {
    console.error("Fetch current user error:", error);
    return NextResponse.json(
      { error: "Failed to read identity scroll." },
      { status: 500 }
    );
  }
}
