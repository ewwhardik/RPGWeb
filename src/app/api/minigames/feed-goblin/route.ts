import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

const GOBLIN_FOOD_RESPONSES = [
  "Bartholomew unhinges his jaw, swallows the salted crumb whole, and lets out a tiny burp of contentment.",
  "Bartholomew inspects the offering, sniffs it suspiciously, and devours it with wild goblin glee.",
  "Bartholomew wipes his greasy paws on your virtual desktop. 'Acceptable tribute, mortal. I will spare your keyboard today.'",
  "Bartholomew does a chaotic little victory jig! 'Crunchy! Salty! Excellent! Your tasks are slightly less irritating now!'",
];

export async function POST() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized goblin whisperer." }, { status: 401 });
    }

    if (user.gold < 5) {
      return NextResponse.json(
        { error: "Bartholomew requires at least 5 Gold to purchase high-grade tavern cracker crumbs." },
        { status: 400 }
      );
    }

    const newGold = user.gold - 5;
    const responseQuote =
      GOBLIN_FOOD_RESPONSES[Math.floor(Math.random() * GOBLIN_FOOD_RESPONSES.length)];

    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { gold: newGold },
      }),
      prisma.userStats.update({
        where: { userId: user.id },
        data: { sanity: { increment: 2 } },
      }),
      prisma.activityLog.create({
        data: {
          userId: user.id,
          actionType: "GOBBLIN_FED",
          message: `Fed Bartholomew the Desk Goblin (5 Gold). +2 Sanity gained.`,
          goldChange: -5,
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: responseQuote,
      newGold,
      sanityGain: 2,
    });
  } catch (error) {
    console.error("Feed goblin error:", error);
    return NextResponse.json(
      { error: "The desk goblin ran under the couch with your coins." },
      { status: 500 }
    );
  }
}
