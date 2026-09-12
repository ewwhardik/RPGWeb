import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized tavern customer." }, { status: 401 });
    }

    const body = await req.json();
    const { itemId } = body;

    if (!itemId) {
      return NextResponse.json({ error: "Item ID required." }, { status: 400 });
    }

    const item = await prisma.item.findUnique({
      where: { id: itemId },
    });

    if (!item) {
      return NextResponse.json({ error: "Item does not exist in the merchant catalogs." }, { status: 404 });
    }

    // Check if user already owns it
    const existingOwnership = await prisma.userInventory.findUnique({
      where: {
        userId_itemId: {
          userId: user.id,
          itemId: item.id,
        },
      },
    });

    if (existingOwnership) {
      return NextResponse.json(
        { error: "You already own this relic! Even adventuring greed has practical limits." },
        { status: 400 }
      );
    }

    // Check balance
    if (user.gold < item.price) {
      return NextResponse.json(
        {
          error: `Insufficient Gold! The merchant demands ${item.price} Gold, but your coin purse only holds ${user.gold}. Go slay some quests!`,
        },
        { status: 400 }
      );
    }

    // Deduct gold & grant item in inventory
    const newGold = user.gold - item.price;

    const [updatedUser, inventoryEntry] = await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { gold: newGold },
      }),
      prisma.userInventory.create({
        data: {
          userId: user.id,
          itemId: item.id,
          isEquipped: false,
        },
        include: {
          item: true,
        },
      }),
      prisma.activityLog.create({
        data: {
          userId: user.id,
          actionType: "ITEM_PURCHASED",
          message: `Purchased "${item.name}" for ${item.price} Gold. "${item.humorQuote}"`,
          goldChange: -item.price,
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: `Purchased ${item.name}! Added to your adventurer knapsack.`,
      newGold: updatedUser.gold,
      inventoryItem: inventoryEntry,
    });
  } catch (error) {
    console.error("Purchase error:", error);
    return NextResponse.json(
      { error: "The shopkeeper dropped your coins down a floor grate." },
      { status: 500 }
    );
  }
}
