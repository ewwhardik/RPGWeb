import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export interface CodexTierReward {
  tier: number;
  shardsRequired: number;
  title: string;
  type: "GOLD" | "XP" | "PET" | "TITLE" | "ITEM" | "FOOD";
  description: string;
  icon: string;
  isMilestone: boolean;
}

export const SEASON_1_TIERS: CodexTierReward[] = [
  { tier: 1, shardsRequired: 100, title: "50 Gold & 30 XP", type: "GOLD", description: "Starter bounty for beginning the seasonal journey.", icon: "🪙", isMilestone: false },
  { tier: 2, shardsRequired: 200, title: "Flask of Healing Rain (+15 HP)", type: "XP", description: "Restores battle wounds instantly.", icon: "🧪", isMilestone: false },
  { tier: 3, shardsRequired: 300, title: "75 Gold Bounty", type: "GOLD", description: "Minted coins bearing the Citadel crest.", icon: "🪙", isMilestone: false },
  { tier: 4, shardsRequired: 400, title: "60 XP & +15 MP", type: "XP", description: "Arcane enlightenment surge.", icon: "🔮", isMilestone: false },
  { tier: 5, shardsRequired: 500, title: "Aether Wolf Pet Egg", type: "PET", description: "Hatch a loyal Shadow Wolf beast companion.", icon: "🐺", isMilestone: true },
  { tier: 6, shardsRequired: 600, title: "100 Gold Bounty", type: "GOLD", description: "Substantial gold pouch.", icon: "🪙", isMilestone: false },
  { tier: 7, shardsRequired: 700, title: "Starlight Honeycomb (+15 Food)", type: "FOOD", description: "Rich celestial food to mature your pets.", icon: "🍯", isMilestone: false },
  { tier: 8, shardsRequired: 800, title: "100 XP Cache", type: "XP", description: "Expedites your next character level.", icon: "📜", isMilestone: false },
  { tier: 9, shardsRequired: 900, title: "125 Gold Bounty", type: "GOLD", description: "Gilded treasury stipend.", icon: "🪙", isMilestone: false },
  { tier: 10, shardsRequired: 1000, title: 'Title: "Voidwalker"', type: "TITLE", description: "Equip an exclusive legendary character title.", icon: "👑", isMilestone: true },
  { tier: 11, shardsRequired: 1100, title: "150 Gold Bounty", type: "GOLD", description: "Heavy coin satchel.", icon: "🪙", isMilestone: false },
  { tier: 12, shardsRequired: 1200, title: "Dragon Wyrmling Flank (+15 Food)", type: "FOOD", description: "Premium protein for beast companions.", icon: "🍖", isMilestone: false },
  { tier: 13, shardsRequired: 1300, title: "120 XP Cache", type: "XP", description: "Expedites character mastery.", icon: "📜", isMilestone: false },
  { tier: 14, shardsRequired: 1400, title: "175 Gold Bounty", type: "GOLD", description: "Citadel merchant credit.", icon: "🪙", isMilestone: false },
  { tier: 15, shardsRequired: 1500, title: "Aegis of Voidlight (+18 Vitality)", type: "ITEM", description: "Rare shield woven from hardened void obsidian.", icon: "🛡️", isMilestone: true },
  { tier: 16, shardsRequired: 1600, title: "200 Gold Bounty", type: "GOLD", description: "Imperial bullion pouch.", icon: "🪙", isMilestone: false },
  { tier: 17, shardsRequired: 1700, title: "Celestial Nectar (+20 Food)", type: "FOOD", description: "Fast-tracks beast maturity toward Mount state.", icon: "✨", isMilestone: false },
  { tier: 18, shardsRequired: 1800, title: "160 XP Cache", type: "XP", description: "Deep astral focus.", icon: "📜", isMilestone: false },
  { tier: 19, shardsRequired: 1900, title: "250 Gold Bounty", type: "GOLD", description: "Noble reward stipend.", icon: "🪙", isMilestone: false },
  { tier: 20, shardsRequired: 2000, title: "Celestial Wings Armor (+22 Vitality)", type: "ITEM", description: "Epic luminous wings that pulse with celestial light.", icon: "🪽", isMilestone: true },
  { tier: 21, shardsRequired: 2100, title: "300 Gold Bounty", type: "GOLD", description: "Abundant royal treasury coins.", icon: "🪙", isMilestone: false },
  { tier: 22, shardsRequired: 2200, title: "Starlight Feast Pack (+25 Food)", type: "FOOD", description: "Massive feast for your bestiary.", icon: "🍗", isMilestone: false },
  { tier: 23, shardsRequired: 2300, title: "220 XP Cache", type: "XP", description: "Profound breakthrough insight.", icon: "📜", isMilestone: false },
  { tier: 24, shardsRequired: 2400, title: "350 Gold Bounty", type: "GOLD", description: "A fortune in sparkling coins.", icon: "🪙", isMilestone: false },
  { tier: 25, shardsRequired: 2500, title: "Codex of the Archmage (+250 XP & +30 MP)", type: "XP", description: "Ancient illuminated spellbook.", icon: "📖", isMilestone: true },
  { tier: 26, shardsRequired: 2600, title: "400 Gold Bounty", type: "GOLD", description: "High magistrate reward.", icon: "🪙", isMilestone: false },
  { tier: 27, shardsRequired: 2700, title: "300 XP Cache", type: "XP", description: "Supreme experience burst.", icon: "📜", isMilestone: false },
  { tier: 28, shardsRequired: 2800, title: "450 Gold Bounty", type: "GOLD", description: "Guildmaster fortune.", icon: "🪙", isMilestone: false },
  { tier: 29, shardsRequired: 2900, title: "500 Gold Bounty", type: "GOLD", description: "Citadel treasury vault share.", icon: "🪙", isMilestone: false },
  { tier: 30, shardsRequired: 3000, title: "Mythic Obsidian Dragon Mount", type: "PET", description: "The supreme season 1 mount. Soar across the realm.", icon: "🐉", isMilestone: true },
];

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const freshUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        chronoShards: true,
        title: true,
      },
    });

    const totalShards = freshUser?.chronoShards ?? 0;
    const currentTier = Math.min(30, Math.floor(totalShards / 100));
    const tierProgress = totalShards >= 3000 ? 100 : totalShards % 100;

    // Fetch claimed tiers from ActivityLog
    const claimedLogs = await prisma.activityLog.findMany({
      where: {
        userId: user.id,
        actionType: "CODEX_TIER_CLAIMED",
      },
      select: { message: true },
    });

    const claimedTiers: number[] = [];
    claimedLogs.forEach((log) => {
      const match = log.message.match(/\[Tier (\d+)\]/);
      if (match && match[1]) {
        claimedTiers.push(parseInt(match[1], 10));
      }
    });

    return NextResponse.json({
      seasonName: "Season 1: Citadel of the Void",
      totalShards,
      currentTier,
      tierProgress,
      claimedTiers,
      tiers: SEASON_1_TIERS,
    });
  } catch (error) {
    console.error("Fetch codex error:", error);
    return NextResponse.json({ error: "Failed to read Chrono-Codex." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const body = await req.json();
    const { tier } = body;

    if (typeof tier !== "number" || tier < 1 || tier > 30) {
      return NextResponse.json({ error: "Invalid tier specified." }, { status: 400 });
    }

    const tierData = SEASON_1_TIERS.find((t) => t.tier === tier);
    if (!tierData) {
      return NextResponse.json({ error: "Tier not recognized." }, { status: 404 });
    }

    const freshUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: { pets: true },
    });

    if (!freshUser) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    const userShards = freshUser.chronoShards ?? 0;
    if (userShards < tierData.shardsRequired) {
      return NextResponse.json(
        { error: `Insufficient Chrono-Shards! You need ${tierData.shardsRequired} shards for Tier ${tier}.` },
        { status: 400 }
      );
    }

    // Check if already claimed
    const existingClaim = await prisma.activityLog.findFirst({
      where: {
        userId: user.id,
        actionType: "CODEX_TIER_CLAIMED",
        message: { contains: `[Tier ${tier}]` },
      },
    });

    if (existingClaim) {
      return NextResponse.json({ error: `Tier ${tier} has already been claimed.` }, { status: 400 });
    }

    let goldAdd = 0;
    let xpAdd = 0;
    let mpAdd = 0;
    let hpAdd = 0;
    let newTitle = freshUser.title;

    if (tierData.type === "GOLD") {
      const match = tierData.title.match(/(\d+) Gold/);
      goldAdd = match ? parseInt(match[1], 10) : 50;
    } else if (tierData.type === "XP") {
      if (tierData.tier === 2) hpAdd = 15;
      else if (tierData.tier === 4) { xpAdd = 60; mpAdd = 15; }
      else if (tierData.tier === 8) xpAdd = 100;
      else if (tierData.tier === 13) xpAdd = 120;
      else if (tierData.tier === 18) xpAdd = 160;
      else if (tierData.tier === 23) xpAdd = 220;
      else if (tierData.tier === 25) { xpAdd = 250; mpAdd = 30; }
      else if (tierData.tier === 27) xpAdd = 300;
    } else if (tierData.type === "TITLE") {
      newTitle = "Voidwalker";
    } else if (tierData.type === "PET") {
      if (tierData.tier === 5) {
        // Hatch Shadow Wolf
        const existingPet = await prisma.userPet.findFirst({
          where: { userId: user.id, species: "Wolf", potionType: "Shadow" },
        });
        if (!existingPet) {
          await prisma.userPet.create({
            data: {
              userId: user.id,
              species: "Wolf",
              potionType: "Shadow",
              feedCount: 10,
              isMount: false,
            },
          });
        }
      } else if (tierData.tier === 30) {
        // Mythic Dragon Mount
        const existingPet = await prisma.userPet.findFirst({
          where: { userId: user.id, species: "Dragon", potionType: "Shadow" },
        });
        if (!existingPet) {
          await prisma.userPet.create({
            data: {
              userId: user.id,
              species: "Dragon",
              potionType: "Shadow",
              feedCount: 50,
              isMount: true,
            },
          });
        }
      }
    } else if (tierData.type === "ITEM") {
      const itemName = tierData.tier === 15 ? "Aegis of Voidlight" : "Celestial Wings";
      const statBoost = tierData.tier === 15 ? 18 : 22;
      let item = await prisma.item.findFirst({ where: { name: itemName } });
      if (!item) {
        item = await prisma.item.create({
          data: {
            name: itemName,
            description: tierData.description,
            humorQuote: "Forged in the seasonal fires of unbroken determination.",
            category: "ARMOR",
            price: 500,
            statType: "VITALITY",
            statBoost,
            icon: tierData.tier === 15 ? "Shield" : "Sparkles",
            rarity: tierData.tier === 15 ? "RARE" : "EPIC",
          },
        });
      }
      await prisma.userInventory.upsert({
        where: {
          userId_itemId: {
            userId: user.id,
            itemId: item.id,
          },
        },
        update: {},
        create: {
          userId: user.id,
          itemId: item.id,
          isEquipped: false,
        },
      });
    } else if (tierData.type === "FOOD") {
      // Feed user's first pet +15 or +20 or +25
      if (freshUser.pets.length > 0) {
        const pet = freshUser.pets[0];
        const foodAmount = tierData.tier === 7 ? 15 : tierData.tier === 12 ? 15 : tierData.tier === 17 ? 20 : 25;
        const newFeed = Math.min(50, pet.feedCount + foodAmount);
        await prisma.userPet.update({
          where: { id: pet.id },
          data: { feedCount: newFeed, isMount: newFeed >= 50 },
        });
      }
      xpAdd += 40;
    }

    // Update user stats
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        gold: freshUser.gold + goldAdd,
        xp: freshUser.xp + xpAdd,
        hp: Math.min(freshUser.maxHp, freshUser.hp + hpAdd),
        mp: Math.min(freshUser.maxMp, freshUser.mp + mpAdd),
        title: newTitle,
      },
      select: {
        id: true,
        gold: true,
        xp: true,
        hp: true,
        maxHp: true,
        mp: true,
        maxMp: true,
        title: true,
        level: true,
        chronoShards: true,
      },
    });

    // Log Activity
    await prisma.activityLog.create({
      data: {
        userId: user.id,
        actionType: "CODEX_TIER_CLAIMED",
        message: `Claimed Chrono-Codex [Tier ${tier}]: ${tierData.title}!`,
        goldChange: goldAdd,
        xpChange: xpAdd,
      },
    });

    return NextResponse.json({
      success: true,
      claimedTier: tier,
      reward: tierData,
      user: updatedUser,
    });
  } catch (error) {
    console.error("Claim codex tier error:", error);
    return NextResponse.json({ error: "Failed to claim tier reward." }, { status: 500 });
  }
}
