import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { PET_SPECIES, HATCHING_POTIONS } from "@/lib/taskEngine";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized adventurer." }, { status: 401 });
    }

    const pets = await prisma.userPet.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({
      pets,
      availableSpecies: PET_SPECIES,
      availablePotions: HATCHING_POTIONS,
      currentPet: user.currentPet,
      currentMount: user.currentMount,
    });
  } catch (error) {
    console.error("Fetch stable error:", error);
    return NextResponse.json(
      { error: "The stable master is currently wrangling an escapee." },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized adventurer." }, { status: 401 });
    }

    const body = await req.json();
    const { action, species, potionType = "Base", petId } = body;

    const freshUser = await prisma.user.findUnique({
      where: { id: user.id },
    });
    if (!freshUser) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    if (action === "HATCH") {
      if (!species) {
        return NextResponse.json({ error: "Species egg is required." }, { status: 400 });
      }

      const existing = await prisma.userPet.findFirst({
        where: {
          userId: user.id,
          species,
          potionType,
        },
      });

      if (existing) {
        return NextResponse.json(
          { error: `You already hatched a ${potionType} ${species} companion.` },
          { status: 400 }
        );
      }

      const newPet = await prisma.userPet.create({
        data: {
          userId: user.id,
          species,
          potionType,
          feedCount: 5,
          isMount: false,
        },
      });

      // Auto-equip if no pet equipped
      if (!freshUser.currentPet) {
        await prisma.user.update({
          where: { id: user.id },
          data: { currentPet: `${species}-${potionType}` },
        });
      }

      await prisma.activityLog.create({
        data: {
          userId: user.id,
          actionType: "PET_HATCHED",
          message: `Hatched a loyal new companion: ${potionType} ${species}!`,
        },
      });

      return NextResponse.json({
        success: true,
        message: `Hatched a loyal ${potionType} ${species}!`,
        pet: newPet,
      });
    }

    if (action === "FEED") {
      if (!petId) {
        return NextResponse.json({ error: "Pet ID is required." }, { status: 400 });
      }

      const pet = await prisma.userPet.findFirst({
        where: { id: petId, userId: user.id },
      });

      if (!pet) {
        return NextResponse.json({ error: "Pet not found in your stable." }, { status: 404 });
      }

      const FOOD_COST = 5;
      if (freshUser.gold < FOOD_COST) {
        return NextResponse.json(
          { error: `You need ${FOOD_COST} Gold to buy companion treats.` },
          { status: 400 }
        );
      }

      const newFeedCount = pet.feedCount + 5;
      const evolvedToMount = newFeedCount >= 50 && !pet.isMount;

      const updatedPet = await prisma.userPet.update({
        where: { id: pet.id },
        data: {
          feedCount: newFeedCount,
          isMount: pet.isMount || evolvedToMount,
        },
      });

      await prisma.user.update({
        where: { id: user.id },
        data: { gold: freshUser.gold - FOOD_COST },
      });

      const message = evolvedToMount
        ? `Magnificent! Your ${pet.species} has matured into a rideable mount!`
        : `Fed ${pet.species} a treat. Progress: ${newFeedCount}/50 towards mount maturity.`;

      await prisma.activityLog.create({
        data: {
          userId: user.id,
          actionType: evolvedToMount ? "MOUNT_EVOLVED" : "PET_FED",
          message,
          goldChange: -FOOD_COST,
        },
      });

      return NextResponse.json({
        success: true,
        message,
        pet: updatedPet,
        remainingGold: freshUser.gold - FOOD_COST,
      });
    }

    if (action === "EQUIP_PET") {
      const petKey = species ? `${species}-${potionType}` : null;
      await prisma.user.update({
        where: { id: user.id },
        data: { currentPet: petKey },
      });
      return NextResponse.json({
        success: true,
        currentPet: petKey,
        message: petKey ? `Companion ${petKey} marches by your side.` : "Companion dismissed to stable.",
      });
    }

    if (action === "EQUIP_MOUNT") {
      const mountKey = species ? `${species}-${potionType}` : null;
      await prisma.user.update({
        where: { id: user.id },
        data: { currentMount: mountKey },
      });
      return NextResponse.json({
        success: true,
        currentMount: mountKey,
        message: mountKey ? `Mounted upon ${mountKey}!` : "Dismounted.",
      });
    }

    return NextResponse.json({ error: "Unknown stable action." }, { status: 400 });
  } catch (error) {
    console.error("Stable action error:", error);
    return NextResponse.json(
      { error: "Stable operation failed." },
      { status: 500 }
    );
  }
}
