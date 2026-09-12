import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();

    const items = await prisma.item.findMany({
      orderBy: { price: "asc" },
    });

    let ownedItemIds: string[] = [];
    let equippedItemIds: string[] = [];

    if (user) {
      const inventory = await prisma.userInventory.findMany({
        where: { userId: user.id },
      });
      ownedItemIds = inventory.map((inv) => inv.itemId);
      equippedItemIds = inventory.filter((inv) => inv.isEquipped).map((inv) => inv.itemId);
    }

    const itemsWithStatus = items.map((item) => ({
      ...item,
      isOwned: ownedItemIds.includes(item.id),
      isEquipped: equippedItemIds.includes(item.id),
    }));

    return NextResponse.json({ items: itemsWithStatus });
  } catch (error) {
    console.error("Fetch shop items error:", error);
    return NextResponse.json(
      { error: "The shopkeeper locked the front door. Try again." },
      { status: 500 }
    );
  }
}
