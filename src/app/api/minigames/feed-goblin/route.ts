import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

const TREAT_CONFIG = {
  samosa: {
    name: "Garam Samosa & Mint Chutney",
    cost: 5,
    sanityGain: 2,
    quotes: [
      "CRUNCH! Bartholomew devours the crispy Garam Samosa with spicy mint chutney! 'Wah! That spices up my goblin soul!'",
      "Bartholomew dips the samosa crust in tangy imli chutney. 'Now THIS is authentic goblin nourishment! May your code compile without bugs.'",
      "Bartholomew wipes samosa crumbs on your desk blotter. 'A spiced pastry worthy of the royal guild! I spare your router today!'",
    ],
  },
  chai: {
    name: "Kadak Cutting Chai",
    cost: 8,
    sanityGain: 4,
    quotes: [
      "SLURP! Bartholomew sips boiling adrak cutting chai from a glass tumbler. 'Aha! Pure cosmic ginger energy coursing through my goblin blood!'",
      "Bartholomew balances the cutting chai glass with goblin dexterity. 'Kadak chai fuels dharma! Go conquer that overdue daily now!'",
      "Bartholomew blows on the steaming chai foam. 'Double ginger, cardamom essence... I feel my goblin IQ doubling already!'",
    ],
  },
  kaju_katli: {
    name: "Kaju Katli of Supreme Focus",
    cost: 15,
    sanityGain: 8,
    quotes: [
      "Bartholomew's eyes shine like emeralds seeing the silver foil on pure cashew diamond paste! 'A royal offering! I bless your RNG forever!'",
      "Bartholomew savors the sweet kaju katli in blissful silence. 'Divine sweetness. Your karma is immaculate today, hero.'",
      "Bartholomew nibbles the cashew diamond delicately. 'Only the finest adventurers provide kaju katli. Procrastination has been banished!'",
    ],
  },
};

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized goblin whisperer." }, { status: 401 });
    }

    let treatKey: keyof typeof TREAT_CONFIG = "samosa";
    try {
      const body = await req.json();
      if (body && body.treatType && TREAT_CONFIG[body.treatType as keyof typeof TREAT_CONFIG]) {
        treatKey = body.treatType as keyof typeof TREAT_CONFIG;
      }
    } catch {}

    const treat = TREAT_CONFIG[treatKey];

    if (user.gold < treat.cost) {
      return NextResponse.json(
        { error: `Bartholomew requires at least ${treat.cost} Gold to prepare ${treat.name}.` },
        { status: 400 }
      );
    }

    const newGold = user.gold - treat.cost;
    const responseQuote =
      treat.quotes[Math.floor(Math.random() * treat.quotes.length)];

    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { gold: newGold },
      }),
      prisma.userStats.update({
        where: { userId: user.id },
        data: { sanity: { increment: treat.sanityGain } },
      }),
      prisma.activityLog.create({
        data: {
          userId: user.id,
          actionType: "GOBBLIN_FED",
          message: `Fed Bartholomew ${treat.name} (${treat.cost} Gold). +${treat.sanityGain} Sanity gained.`,
          goldChange: -treat.cost,
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: responseQuote,
      treatName: treat.name,
      newGold,
      sanityGain: treat.sanityGain,
    });
  } catch (error) {
    console.error("Feed goblin error:", error);
    return NextResponse.json(
      { error: "The desk goblin ran under the couch with your coins." },
      { status: 500 }
    );
  }
}
