import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

interface VaultPullReward {
  type: "FOOD" | "EQUIPMENT" | "CODEX";
  title: string;
  description: string;
  rarity: "COMMON" | "RARE" | "EPIC" | "LEGENDARY";
  icon: string;
  bonus: string;
  isPity: boolean;
}

const EXCLUSIVE_RELICS = [
  {
    name: "Void-Forged Obsidian Crown",
    description: "An ancient diadem glowing with cold violet starlight.",
    humorQuote: "Prevents mental brain fog and imposes sheer aesthetic dominance in meetings.",
    category: "ARMOR",
    statType: "CHARISMA",
    statBoost: 25,
    icon: "Crown",
    rarity: "LEGENDARY",
  },
  {
    name: "Blade of Unbroken Will",
    description: "A serrated cosmic broadsword that resonates with high focus.",
    humorQuote: "Instantly cleaves through backlog items and 30-minute meetings that could have been emails.",
    category: "WEAPON",
    statType: "STRENGTH",
    statBoost: 22,
    icon: "Swords",
    rarity: "EPIC",
  },
  {
    name: "Chrono-Weaver's Astral Cloak",
    description: "Woven from frozen time fragments. Shimmers under candlelight.",
    humorQuote: "Slows down deadlines and shields your inbox from sudden scope-creeps.",
    category: "ARMOR",
    statType: "INTELLECT",
    statBoost: 20,
    icon: "Sparkles",
    rarity: "EPIC",
  },
  {
    name: "Aegis of the Sunken Citadel",
    description: "A heavy round shield imbued with deep ocean obsidian.",
    humorQuote: "Absorbs critical burnout and redirects motivation straight to your caffeine reserves.",
    category: "ARMOR",
    statType: "VITALITY",
    statBoost: 24,
    icon: "Shield",
    rarity: "EPIC",
  },
];

const RARE_GEAR = [
  {
    name: "Gladiator's Runic Helm",
    description: "Battle-scarred iron visage with glowing runic inscriptions.",
    humorQuote: "Ensures you face Monday mornings with the fury of an immortal gladiator.",
    category: "ARMOR",
    statType: "STRENGTH",
    statBoost: 16,
    icon: "Shield",
    rarity: "RARE",
  },
  {
    name: "Lunar Silk Robes",
    description: "Flowing midnight silk that refracts incoming distractions.",
    humorQuote: "Enchants your code reviews with unshakeable calm and grammatical perfection.",
    category: "ARMOR",
    statType: "INTELLECT",
    statBoost: 15,
    icon: "Sparkles",
    rarity: "RARE",
  },
  {
    name: "Plague Doctor's Beak",
    description: "A leather mask stuffed with dried lavender, sage, and mint.",
    humorQuote: "Filters toxic office politics and negative self-talk effortlessly.",
    category: "ARMOR",
    statType: "SANITY",
    statBoost: 17,
    icon: "Skull",
    rarity: "RARE",
  },
  {
    name: "Gauntlets of the Iron Giant",
    description: "Heavy plate gauntlets humming with hydraulic kinetic force.",
    humorQuote: "Typing speed jumps 40 WPM. Keyboards tremble in absolute terror.",
    category: "ARMOR",
    statType: "DEXTERITY",
    statBoost: 16,
    icon: "Footprints",
    rarity: "RARE",
  },
];

const BEAST_FOODS = [
  {
    title: "Prime Starlight Honeycomb",
    description: "Golden crystalline nectar harvested from celestial bees.",
    fullness: 12,
    icon: "Flame",
  },
  {
    title: "Dragon Wyrmling Flank",
    description: "Nutritious protein cut sizzling with harmless smoke.",
    fullness: 15,
    icon: "Utensils",
  },
  {
    title: "Flask of Celestial Nectar",
    description: "Luminescent tonic that nourishes beasts to rapid maturity.",
    fullness: 10,
    icon: "Coffee",
  },
  {
    title: "Golden Apple of Idunn",
    description: "Crisp mythological orchard fruit restoring vigor.",
    fullness: 14,
    icon: "Sun",
  },
];

export async function POST() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized adventurer." }, { status: 401 });
    }

    const freshUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        pets: true,
      },
    });

    if (!freshUser) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    const COST = 100;
    if (freshUser.gold < COST) {
      return NextResponse.json(
        { error: `Insufficient gold! Opening the Relic Vault requires ${COST} Gold.` },
        { status: 400 }
      );
    }

    const currentPulls = freshUser.vaultPulls ?? 0;
    const nextPulls = currentPulls + 1;
    const isPity = nextPulls % 10 === 0;

    let reward: VaultPullReward;
    let xpGain = 0;
    let mpGain = 0;
    let petFedName: string | null = null;

    if (isPity) {
      // Guaranteed Epic or Legendary Exclusive
      const relicData = EXCLUSIVE_RELICS[Math.floor(Math.random() * EXCLUSIVE_RELICS.length)];
      
      // Ensure Item exists
      let item = await prisma.item.findFirst({
        where: { name: relicData.name },
      });
      if (!item) {
        item = await prisma.item.create({
          data: {
            name: relicData.name,
            description: relicData.description,
            humorQuote: relicData.humorQuote,
            category: relicData.category,
            price: 250,
            statType: relicData.statType,
            statBoost: relicData.statBoost,
            icon: relicData.icon,
            rarity: relicData.rarity,
          },
        });
      }

      // Add to user inventory if not already owned
      const existingInv = await prisma.userInventory.findUnique({
        where: {
          userId_itemId: {
            userId: freshUser.id,
            itemId: item.id,
          },
        },
      });

      if (!existingInv) {
        await prisma.userInventory.create({
          data: {
            userId: freshUser.id,
            itemId: item.id,
            isEquipped: false,
          },
        });
      }

      reward = {
        type: "EQUIPMENT",
        title: relicData.name,
        description: relicData.description,
        rarity: relicData.rarity as "EPIC" | "LEGENDARY",
        icon: relicData.icon,
        bonus: `+${relicData.statBoost} ${relicData.statType}`,
        isPity: true,
      };
    } else {
      const roll = Math.random();

      if (roll < 0.60) {
        // 60% Beast Food
        const food = BEAST_FOODS[Math.floor(Math.random() * BEAST_FOODS.length)];
        xpGain = 35;

        // Feed active pet if any
        if (freshUser.pets.length > 0) {
          const targetPet =
            freshUser.pets.find((p) => p.species === freshUser.currentPet) || freshUser.pets[0];
          const newFeed = Math.min(50, targetPet.feedCount + food.fullness);
          const nowMount = newFeed >= 50;

          await prisma.userPet.update({
            where: { id: targetPet.id },
            data: {
              feedCount: newFeed,
              isMount: nowMount,
            },
          });
          petFedName = `${targetPet.species} (+${food.fullness} Fullness${nowMount ? " - Matured to Mount!" : ""})`;
        }

        reward = {
          type: "FOOD",
          title: food.title,
          description: food.description,
          rarity: "COMMON",
          icon: food.icon,
          bonus: petFedName ? `Fed ${petFedName} & +35 XP` : `+${food.fullness} Beast Feed & +35 XP`,
          isPity: false,
        };
      } else if (roll < 0.80) {
        // 20% Rare Equipment
        const gear = RARE_GEAR[Math.floor(Math.random() * RARE_GEAR.length)];
        
        let item = await prisma.item.findFirst({
          where: { name: gear.name },
        });
        if (!item) {
          item = await prisma.item.create({
            data: {
              name: gear.name,
              description: gear.description,
              humorQuote: gear.humorQuote,
              category: gear.category,
              price: 180,
              statType: gear.statType,
              statBoost: gear.statBoost,
              icon: gear.icon,
              rarity: gear.rarity,
            },
          });
        }

        const existingInv = await prisma.userInventory.findUnique({
          where: {
            userId_itemId: {
              userId: freshUser.id,
              itemId: item.id,
            },
          },
        });

        if (!existingInv) {
          await prisma.userInventory.create({
            data: {
              userId: freshUser.id,
              itemId: item.id,
              isEquipped: false,
            },
          });
        }

        reward = {
          type: "EQUIPMENT",
          title: gear.name,
          description: gear.description,
          rarity: "RARE",
          icon: gear.icon,
          bonus: `+${gear.statBoost} ${gear.statType}`,
          isPity: false,
        };
      } else {
        // 20% Arcane Knowledge Codex (XP Surge)
        xpGain = 160;
        mpGain = 20;

        reward = {
          type: "CODEX",
          title: "Arcane Codex of Lost Wisdom",
          description: "An illuminated tome crackling with unearthly raw insight.",
          rarity: "RARE",
          icon: "Sparkles",
          bonus: "+160 Instant XP & +20 MP",
          isPity: false,
        };
      }
    }

    // Calculate level up from XP gain
    let newXp = freshUser.xp + xpGain;
    let newLevel = freshUser.level;
    let xpForNext = newLevel * 100;
    while (newXp >= xpForNext) {
      newXp -= xpForNext;
      newLevel += 1;
      xpForNext = newLevel * 100;
    }

    const newMp = Math.min(freshUser.maxMp, freshUser.mp + mpGain);
    const newShards = (freshUser.chronoShards ?? 0) + 10;

    // Update User
    const updatedUser = await prisma.user.update({
      where: { id: freshUser.id },
      data: {
        gold: Math.max(0, freshUser.gold - COST),
        vaultPulls: nextPulls,
        xp: newXp,
        level: newLevel,
        mp: newMp,
        chronoShards: newShards,
      },
      select: {
        id: true,
        gold: true,
        xp: true,
        level: true,
        mp: true,
        maxMp: true,
        hp: true,
        maxHp: true,
        vaultPulls: true,
        chronoShards: true,
      },
    });

    // Log Activity
    await prisma.activityLog.create({
      data: {
        userId: freshUser.id,
        actionType: isPity ? "VAULT_PITY_PULL" : "VAULT_PULL",
        message: `Opened Relic Vault: Received [${reward.rarity}] ${reward.title}!`,
        goldChange: -COST,
        xpChange: xpGain,
      },
    });

    return NextResponse.json({
      reward,
      vaultPulls: nextPulls,
      pityProgress: nextPulls % 10,
      pityNeeded: 10,
      user: updatedUser,
      xpGained: xpGain,
    });
  } catch (error) {
    console.error("Relic Vault pull error:", error);
    return NextResponse.json(
      { error: "The vault tumblers locked unexpectedly. Try again." },
      { status: 500 }
    );
  }
}
