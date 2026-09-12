import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const userPayload = await requireAuth(req);
    if (!userPayload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { inventoryId } = await req.json();

    const inventoryItem = await prisma.userInventory.findUnique({
      where: { id: inventoryId },
      include: { item: true, user: true },
    });

    if (!inventoryItem || inventoryItem.userId !== userPayload.userId) {
      return NextResponse.json({ error: "Item not found in inventory." }, { status: 404 });
    }

    if (inventoryItem.durability >= 100) {
      return NextResponse.json({ error: "Item is already at max durability." }, { status: 400 });
    }

    // Cost to repair based on rarity
    const repairCost = inventoryItem.item.rarity === "EPIC" ? 50 : inventoryItem.item.rarity === "RARE" ? 25 : 10;

    if (inventoryItem.user.gold < repairCost) {
      return NextResponse.json({ error: `Not enough gold. Repair costs ${repairCost}g.` }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      const u = await tx.user.update({
        where: { id: userPayload.userId },
        data: { gold: { decrement: repairCost } },
      });

      const updatedInv = await tx.userInventory.update({
        where: { id: inventoryId },
        data: { durability: 100 },
      });

      await tx.activityLog.create({
        data: {
          userId: userPayload.userId,
          actionType: "ITEM_REPAIR",
          message: `Paid the blacksmith ${repairCost}g to repair ${inventoryItem.item.name}.`,
          goldChange: -repairCost,
        },
      });

      return { user: u, inventory: updatedInv };
    });

    return NextResponse.json({ success: true, message: "Item repaired!", ...result });
  } catch (error) {
    console.error("Repair error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
