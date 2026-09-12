import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { buyItemSchema } from "@/lib/validations";

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized tavern customer." }, { status: 401 });
    }

    const body = await req.json();
    const parseResult = buyItemSchema.safeParse(body);

    if (!parseResult.success) {
      const firstError = parseResult.error.issues[0]?.message || "Invalid purchase request.";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const { itemId } = parseResult.data;

    const item = await prisma.item.findUnique({
      where: { id: itemId },
    });

    if (!item) {
      return NextResponse.json({ error: "Item does not exist in the merchant catalogs." }, { status: 404 });
    }

    // Atomic transaction for purchase to prevent double-spending
    const result = await prisma.$transaction(async (tx) => {
      const existingOwnership = await tx.userInventory.findUnique({
        where: {
          userId_itemId: {
            userId: user.id,
            itemId: item.id,
          },
        },
      });

      if (existingOwnership) {
        throw new Error("ALREADY_OWNED");
      }

      const freshUser = await tx.user.findUnique({
        where: { id: user.id },
      });

      if (!freshUser || freshUser.gold < item.price) {
        throw new Error("INSUFFICIENT_GOLD");
      }

      const newGold = freshUser.gold - item.price;

      const updatedUser = await tx.user.update({
        where: { id: freshUser.id },
        data: { gold: newGold },
      });

      const inventoryEntry = await tx.userInventory.create({
        data: {
          userId: freshUser.id,
          itemId: item.id,
          isEquipped: false,
        },
        include: {
          item: true,
        },
      });

      await tx.activityLog.create({
        data: {
          userId: freshUser.id,
          actionType: "ITEM_PURCHASED",
          message: `Purchased "${item.name}" for ${item.price} Gold. "${item.humorQuote}"`,
          goldChange: -item.price,
        },
      });

      return {
        newGold: updatedUser.gold,
        inventoryItem: inventoryEntry,
      };
    });

    return NextResponse.json({
      success: true,
      message: `Purchased ${item.name}! Added to your adventurer knapsack.`,
      newGold: result.newGold,
      inventoryItem: result.inventoryItem,
    });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "ALREADY_OWNED") {
      return NextResponse.json(
        { error: "You already own this relic! Even adventuring greed has practical limits." },
        { status: 400 }
      );
    }
    if (error instanceof Error && error.message === "INSUFFICIENT_GOLD") {
      return NextResponse.json(
        { error: "Insufficient Gold! Go slay some quests before shopping." },
        { status: 400 }
      );
    }

    console.error("Purchase error:", error);
    return NextResponse.json(
      { error: "The shopkeeper dropped your coins down a floor grate." },
      { status: 500 }
    );
  }
}
