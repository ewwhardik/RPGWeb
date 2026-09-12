import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

const SILLY_TITLES = [
  "Certified Overthinker",
  "Slayer of Inconvenience",
  "Sofa Sovereign",
  "Master of 47 Open Browser Tabs",
  "The Accidental Hero",
  "Lord of Postponed Decisions",
];

export async function POST() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized tavern gambler." }, { status: 401 });
    }

    if (user.gold < 10) {
      return NextResponse.json(
        { error: "The Wheel of Unreasonable Fate requires an ante of 10 Gold. You cannot afford destiny." },
        { status: 400 }
      );
    }

    // Deduct 10 gold ante
    let newGold = user.gold - 10;
    let newTitle = user.title;
    let sanityBoost = 0;
    let outcomeType = "NOTHING";
    let message = "";

    const roll = Math.floor(Math.random() * 6);

    switch (roll) {
      case 0:
        // Jack-pot: 35 Gold payout (net +25)
        newGold += 35;
        outcomeType = "GOLD_JACKPOT";
        message = "JACKPOT! A tipsy dwarf mistook you for royalty and handed you 35 Gold!";
        break;
      case 1:
        // Win strange title
        newTitle = SILLY_TITLES[Math.floor(Math.random() * SILLY_TITLES.length)];
        outcomeType = "TITLE_WON";
        message = `A herald trumpeted your new official title: "${newTitle}"!`;
        break;
      case 2:
        // Goose attack
        const gooseLoss = Math.min(newGold, 5);
        newGold -= gooseLoss;
        outcomeType = "GOOSE_ATTACK";
        message = `A rogue tavern goose honked aggressively and stole ${gooseLoss} Gold from your pocket.`;
        break;
      case 3:
        // Finding a smooth pebble
        sanityBoost = 3;
        outcomeType = "SANITY_BOOST";
        message = "You found a surprisingly smooth pebble on the floor. +3 Sanity acquired.";
        break;
      case 4:
        // Small coin find
        newGold += 15;
        outcomeType = "SMALL_WIN";
        message = "The wheel landed on lucky clover! You retrieved your ante plus 5 extra Gold.";
        break;
      case 5:
      default:
        outcomeType = "NOTHING";
        message = "The wheel spun with great dramatic fanfare and landed on... absolutely nothing. The barkeep smirked.";
        break;
    }

    // Save updates
    await prisma.user.update({
      where: { id: user.id },
      data: {
        gold: newGold,
        title: newTitle,
      },
    });

    if (sanityBoost > 0) {
      await prisma.userStats.update({
        where: { userId: user.id },
        data: { sanity: { increment: sanityBoost } },
      });
    }

    await prisma.activityLog.create({
      data: {
        userId: user.id,
        actionType: "WHEEL_OF_FATE",
        message: `Wheel of Fate: ${message}`,
        goldChange: newGold - user.gold,
      },
    });

    return NextResponse.json({
      success: true,
      message,
      outcomeType,
      newGold,
      newTitle,
      sanityBoost,
    });
  } catch (error) {
    console.error("Wheel of fate error:", error);
    return NextResponse.json(
      { error: "The wheel jammed mid-spin." },
      { status: 500 }
    );
  }
}
