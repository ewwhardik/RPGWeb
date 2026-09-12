import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized guild visitor." }, { status: 401 });
    }

    const body = await req.json();
    const { itemId } = body;

    if (!itemId) {
      return NextResponse.json({ error: "Item ID required." }, { status: 400 });
    }

    const inv = await prisma.userInventory.findUnique({
      where: {
        userId_itemId: {
          userId: user.id,
          itemId,
        },
      },
      include: {
        item: true,
      },
    });

    if (!inv) {
      return NextResponse.json({ error: "Item not found in your knapsack." }, { status: 404 });
    }

    const willEquip = !inv.isEquipped;
    const statBoost = inv.item.statBoost;
    const delta = willEquip ? statBoost : -statBoost;
    const statType = inv.item.statType;

    // Determine stat updates
    const statUpdates: any = {};
    if (statType === "ALL") {
      statUpdates.strength = { increment: delta };
      statUpdates.intellect = { increment: delta };
      statUpdates.vitality = { increment: delta };
      statUpdates.dexterity = { increment: delta };
      statUpdates.charisma = { increment: delta };
      statUpdates.sanity = { increment: delta };
    } else {
      const field = statType.toLowerCase();
      statUpdates[field] = { increment: delta };
    }

    const [updatedInv, updatedStats] = await prisma.$transaction([
      prisma.userInventory.update({
        where: { id: inv.id },
        data: { isEquipped: willEquip },
        include: { item: true },
      }),
      prisma.userStats.update({
        where: { userId: user.id },
        data: statUpdates,
      }),
      prisma.activityLog.create({
        data: {
          userId: user.id,
          actionType: willEquip ? "ITEM_EQUIPPED" : "ITEM_UNEQUIPPED",
          message: willEquip
            ? `Equipped "${inv.item.name}" (+${statBoost} ${statType}).`
            : `Unequipped "${inv.item.name}".`,
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: willEquip
        ? `Equipped ${inv.item.name}! Stats bolstered.`
        : `Unequipped ${inv.item.name}.`,
      inventoryItem: updatedInv,
      stats: updatedStats,
    });
  } catch (error) {
    console.error("Equip error:", error);
    return NextResponse.json(
      { error: "Could not fasten buckles on your equipment." },
      { status: 500 }
    );
  }
}
