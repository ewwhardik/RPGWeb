import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export interface IncentiveReward {
  day: number;
  title: string;
  description: string;
  type: "GOLD" | "XP" | "FOOD" | "PET" | "TITLE" | "ITEM";
  icon: string;
  isMilestone: boolean;
  value?: number;
}

export const COSMIC_DARSHAN_50_DAYS: IncentiveReward[] = [
  { day: 1, title: "Gilded Initiate Robes & 50G", description: "Starting ceremonial attire (+8 Vitality).", type: "ITEM", icon: "🥋", isMilestone: false, value: 50 },
  { day: 2, title: "3x Roasted Beast Meat & 40 XP", description: "Hearty treats for your bestiary companions.", type: "FOOD", icon: "🍖", isMilestone: false },
  { day: 3, title: "Flask of Celestial Nectar & 20 MP", description: "Restores mana and nourishes companions.", type: "FOOD", icon: "🧪", isMilestone: false },
  { day: 4, title: "75 Gold & 50 XP Cache", description: "Treasury stipend for dedicated seekers.", type: "GOLD", icon: "🪙", isMilestone: false, value: 75 },
  { day: 5, title: "Aether Wolf Companion Egg & Golden Potion", description: "Hatch a radiant Golden Wolf pet companion.", type: "PET", icon: "🐺", isMilestone: true },
  { day: 6, title: "100 Gold Bounty", description: "Citadel coin satchel.", type: "GOLD", icon: "🪙", isMilestone: false, value: 100 },
  { day: 7, title: "Prime Starlight Honeycomb (+20 Food)", description: "Rich nectar harvested from celestial apiaries.", type: "FOOD", icon: "🍯", isMilestone: false },
  { day: 8, title: "100 XP & +20 MP Surge", description: "Enlightenment from the cosmic archives.", type: "XP", icon: "📜", isMilestone: false },
  { day: 9, title: "125 Gold Bounty", description: "Gilded temple offering.", type: "GOLD", icon: "🪙", isMilestone: false, value: 125 },
  { day: 10, title: 'Title: "Cosmic Devotee" & 150G', description: "Equip an exclusive legendary character title.", type: "TITLE", icon: "👑", isMilestone: true, value: 150 },
  { day: 11, title: "150 Gold & 100 XP", description: "Prosperity of steady practice.", type: "GOLD", icon: "🪙", isMilestone: false, value: 150 },
  { day: 12, title: "Dragon Wyrmling Flank (+20 Food)", description: "Sizzling high-protein beast feast.", type: "FOOD", icon: "🥩", isMilestone: false },
  { day: 13, title: "130 XP Cache", description: "Breakthrough insights.", type: "XP", icon: "📜", isMilestone: false },
  { day: 14, title: "175 Gold Bounty", description: "Guild stipend payout.", type: "GOLD", icon: "🪙", isMilestone: false, value: 175 },
  { day: 15, title: "Aegis of the Sunken Citadel (+20 Vit)", description: "Epic shield woven from volcanic obsidian.", type: "ITEM", icon: "🛡️", isMilestone: true },
  { day: 16, title: "200 Gold Bounty", description: "Heavy bullion pouch.", type: "GOLD", icon: "🪙", isMilestone: false, value: 200 },
  { day: 17, title: "Flask of Starlight Milk (+25 Food)", description: "Accelerates pet growth to mature mount form.", type: "FOOD", icon: "🥛", isMilestone: false },
  { day: 18, title: "160 XP Cache", description: "Deep harmonic contemplation.", type: "XP", icon: "📜", isMilestone: false },
  { day: 19, title: "225 Gold Bounty", description: "Merchant guild treasure.", type: "GOLD", icon: "🪙", isMilestone: false, value: 225 },
  { day: 20, title: "Celestial Wings Armor (+24 Vitality)", description: "Radiant glowing wings that refract starlight.", type: "ITEM", icon: "🪽", isMilestone: true },
  { day: 21, title: "250 Gold Bounty", description: "High treasury share.", type: "GOLD", icon: "🪙", isMilestone: false, value: 250 },
  { day: 22, title: "Starlight Feast Pack (+30 Food)", description: "Massive feast for your entire stable.", type: "FOOD", icon: "🍗", isMilestone: false },
  { day: 23, title: "200 XP Cache", description: "Sublime wisdom unlocked.", type: "XP", icon: "📜", isMilestone: false },
  { day: 24, title: "300 Gold Bounty", description: "Golden ingots from the grand vault.", type: "GOLD", icon: "🪙", isMilestone: false, value: 300 },
  { day: 25, title: "Elixir of Perpetual Vitality (+30 HP)", description: "Permanently revives and bolsters your life force.", type: "XP", icon: "🏺", isMilestone: true },
  { day: 26, title: "350 Gold Bounty", description: "Archmage stipend.", type: "GOLD", icon: "🪙", isMilestone: false, value: 350 },
  { day: 27, title: "250 XP Cache", description: "Profound cosmic clarity.", type: "XP", icon: "📜", isMilestone: false },
  { day: 28, title: "400 Gold Bounty", description: "Imperial bullion.", type: "GOLD", icon: "🪙", isMilestone: false, value: 400 },
  { day: 29, title: "450 Gold Bounty", description: "Guildmaster fortune.", type: "GOLD", icon: "🪙", isMilestone: false, value: 450 },
  { day: 30, title: "Codex of the Cosmic Archmage & 300G", description: "Mastery tome (+300 XP, +30 MP, +300 Gold).", type: "XP", icon: "📖", isMilestone: true, value: 300 },
  { day: 31, title: "500 Gold Bounty", description: "Cosmic treasury payout.", type: "GOLD", icon: "🪙", isMilestone: false, value: 500 },
  { day: 32, title: "Starlight Nectar Feast (+35 Food)", description: "Ultimate beast delicacy.", type: "FOOD", icon: "✨", isMilestone: false },
  { day: 33, title: "300 XP Cache", description: "Supreme transcendental knowledge.", type: "XP", icon: "📜", isMilestone: false },
  { day: 34, title: "550 Gold Bounty", description: "Endless golden coins.", type: "GOLD", icon: "🪙", isMilestone: false, value: 550 },
  { day: 35, title: "Crown of the Starlight Sovereign (+26 Charisma)", description: "Fabled headpiece of supreme focus.", type: "ITEM", icon: "👑", isMilestone: true },
  { day: 36, title: "600 Gold Bounty", description: "Sovereign treasury tribute.", type: "GOLD", icon: "🪙", isMilestone: false, value: 600 },
  { day: 37, title: "350 XP Cache", description: "Apex enlightenment.", type: "XP", icon: "📜", isMilestone: false },
  { day: 38, title: "650 Gold Bounty", description: "Guild treasury bounty.", type: "GOLD", icon: "🪙", isMilestone: false, value: 650 },
  { day: 39, title: "700 Gold Bounty", description: "Gilded mountains of coins.", type: "GOLD", icon: "🪙", isMilestone: false, value: 700 },
  { day: 40, title: 'Title: "Ascended Sovereign" & 500 XP', description: "Unlocks the highest tier character title.", type: "TITLE", icon: "🎖️", isMilestone: true },
  { day: 41, title: "750 Gold Bounty", description: "Cosmic empire bullion.", type: "GOLD", icon: "🪙", isMilestone: false, value: 750 },
  { day: 42, title: "Grand Feast of Idunn (+40 Food)", description: "Instantly brings any pet to full mount stature.", type: "FOOD", icon: "🍎", isMilestone: false },
  { day: 43, title: "400 XP Cache", description: "Cosmic consciousness breakthrough.", type: "XP", icon: "📜", isMilestone: false },
  { day: 44, title: "800 Gold Bounty", description: "Endless vault treasures.", type: "GOLD", icon: "🪙", isMilestone: false, value: 800 },
  { day: 45, title: "Blade of the Infinite Cosmos (+28 Strength)", description: "Mythic broadsword glowing with violet stellar flames.", type: "ITEM", icon: "⚔️", isMilestone: true },
  { day: 46, title: "850 Gold Bounty", description: "Immense golden vault share.", type: "GOLD", icon: "🪙", isMilestone: false, value: 850 },
  { day: 47, title: "450 XP Cache", description: "Unrivaled cognitive fortitude.", type: "XP", icon: "📜", isMilestone: false },
  { day: 48, title: "900 Gold Bounty", description: "The Emperor's treasury reward.", type: "GOLD", icon: "🪙", isMilestone: false, value: 900 },
  { day: 49, title: "1000 Gold Bounty", description: "Maximum treasury fortune.", type: "GOLD", icon: "🪙", isMilestone: false, value: 1000 },
  { day: 50, title: "Mythic Solar Dragon Steed Mount", description: "The supreme mount of the universe. Fully mature upon receipt.", type: "PET", icon: "🐉", isMilestone: true },
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
        loginDayCount: true,
        lastLoginDate: true,
        claimedLoginDays: true,
        dayStartHour: true,
      },
    });

    if (!freshUser) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    const claimedDays = (freshUser.claimedLoginDays || "")
      .split(",")
      .filter(Boolean)
      .map((s) => parseInt(s, 10));

    const isTodayClaimed = claimedDays.includes(freshUser.loginDayCount);
    const canClaimToday = !isTodayClaimed;

    return NextResponse.json({
      currentDay: freshUser.loginDayCount,
      canClaimToday,
      claimedDays,
      rewards: COSMIC_DARSHAN_50_DAYS,
    });
  } catch (err) {
    console.error("GET daily-incentives error:", err);
    return NextResponse.json({ error: "Failed to read daily incentives." }, { status: 500 });
  }
}

export async function POST() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const freshUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: { pets: true },
    });

    if (!freshUser) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    const claimedDays = (freshUser.claimedLoginDays || "")
      .split(",")
      .filter(Boolean)
      .map((s) => parseInt(s, 10));

    const currentDay = Math.min(50, Math.max(1, freshUser.loginDayCount));

    if (claimedDays.includes(currentDay)) {
      return NextResponse.json({ error: `Day ${currentDay} has already been claimed today!` }, { status: 400 });
    }

    const reward = COSMIC_DARSHAN_50_DAYS.find((r) => r.day === currentDay) || COSMIC_DARSHAN_50_DAYS[0];

    let goldAdd = reward.value || 0;
    let xpAdd = 0;
    let mpAdd = 0;
    const hpAdd = 0;
    let newTitle = freshUser.title;

    if (reward.type === "GOLD") {
      goldAdd = reward.value || 50;
    } else if (reward.type === "XP") {
      xpAdd = 120;
      mpAdd = 20;
    } else if (reward.type === "TITLE") {
      newTitle = currentDay === 10 ? "Cosmic Devotee" : "Ascended Sovereign";
    } else if (reward.type === "FOOD") {
      if (freshUser.pets.length > 0) {
        const pet = freshUser.pets[0];
        const newFeed = Math.min(50, pet.feedCount + 20);
        await prisma.userPet.update({
          where: { id: pet.id },
          data: { feedCount: newFeed, isMount: newFeed >= 50 },
        });
      }
      xpAdd += 50;
    } else if (reward.type === "PET") {
      if (currentDay === 5) {
        // Golden Wolf
        const existing = await prisma.userPet.findFirst({
          where: { userId: user.id, species: "Wolf", potionType: "Golden" },
        });
        if (!existing) {
          await prisma.userPet.create({
            data: { userId: user.id, species: "Wolf", potionType: "Golden", feedCount: 15 },
          });
        }
      } else if (currentDay === 50) {
        // Solar Dragon Mount
        const existing = await prisma.userPet.findFirst({
          where: { userId: user.id, species: "Dragon", potionType: "Golden" },
        });
        if (!existing) {
          await prisma.userPet.create({
            data: { userId: user.id, species: "Dragon", potionType: "Golden", feedCount: 50, isMount: true },
          });
        }
      }
    } else if (reward.type === "ITEM") {
      const itemName = currentDay === 1 ? "Gilded Initiate Robes" : currentDay === 15 ? "Aegis of the Sunken Citadel" : currentDay === 20 ? "Celestial Wings" : currentDay === 35 ? "Crown of the Starlight Sovereign" : "Blade of the Infinite Cosmos";
      const statBoost = currentDay === 1 ? 8 : currentDay === 15 ? 20 : currentDay === 20 ? 24 : 28;
      let item = await prisma.item.findFirst({ where: { name: itemName } });
      if (!item) {
        item = await prisma.item.create({
          data: {
            name: itemName,
            description: reward.description,
            humorQuote: "Rewarded by the Cosmic Darshan for unbroken discipline.",
            category: "ARMOR",
            price: 400,
            statType: "VITALITY",
            statBoost,
            icon: "Shield",
            rarity: reward.isMilestone ? "EPIC" : "RARE",
          },
        });
      }
      await prisma.userInventory.upsert({
        where: { userId_itemId: { userId: user.id, itemId: item.id } },
        update: {},
        create: { userId: user.id, itemId: item.id, isEquipped: false },
      });
    }

    const updatedClaimedList = [...claimedDays, currentDay].join(",");
    const nextDayCount = Math.min(50, currentDay + 1);

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        gold: freshUser.gold + goldAdd,
        xp: freshUser.xp + xpAdd,
        hp: Math.min(freshUser.maxHp, freshUser.hp + hpAdd),
        mp: Math.min(freshUser.maxMp, freshUser.mp + mpAdd),
        title: newTitle,
        claimedLoginDays: updatedClaimedList,
        loginDayCount: nextDayCount,
        lastLoginDate: new Date(),
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
        loginDayCount: true,
        claimedLoginDays: true,
      },
    });

    await prisma.activityLog.create({
      data: {
        userId: user.id,
        actionType: "COSMIC_DARSHAN_CLAIM",
        message: `Cosmic Darshan Day ${currentDay} claimed: ${reward.title}!`,
        goldChange: goldAdd,
        xpChange: xpAdd,
      },
    });

    return NextResponse.json({
      success: true,
      reward,
      claimedDay: currentDay,
      nextDay: nextDayCount,
      user: updatedUser,
    });
  } catch (err) {
    console.error("POST daily-incentives error:", err);
    return NextResponse.json({ error: "Failed to claim cosmic darshan." }, { status: 500 });
  }
}
