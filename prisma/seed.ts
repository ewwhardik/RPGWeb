import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const shopItems = [
  {
    name: "Squeaky Boots of Haste",
    description: "Lightweight leather boots with spring soles.",
    humorQuote: "Alerts every goblin within a 3-mile radius of your cardio commitment.",
    category: "ARMOR",
    price: 45,
    statType: "DEXTERITY",
    statBoost: 8,
    icon: "Footprints",
    rarity: "COMMON",
    isCursed: false,
  },
  {
    name: "Cold Brew of Hyperfocus",
    description: "Concentrated roast beans steeped in pure determination.",
    humorQuote: "Tastes like molten battery acid, but your code compiles on the first try.",
    category: "POTION",
    price: 35,
    statType: "INTELLECT",
    statBoost: 10,
    icon: "Coffee",
    rarity: "COMMON",
    isCursed: false,
  },
  {
    name: "The Iron Dumbbell of Atlas",
    description: "Heavy cast iron weight designed to punish gravity.",
    humorQuote: "Forged in the fires of leg day. Drops immediately if you skip stretching.",
    category: "WEAPON",
    price: 60,
    statType: "STRENGTH",
    statBoost: 12,
    icon: "Dumbbell",
    rarity: "UNCOMMON",
    isCursed: false,
  },
  {
    name: "Towel of Ultimate Preparedness",
    description: "Fluffy celestial microfiber that absorbs all moisture.",
    humorQuote: "Dries your sweat after gym workouts and your tears after runtime exceptions.",
    category: "TRINKET",
    price: 40,
    statType: "VITALITY",
    statBoost: 10,
    icon: "Shield",
    rarity: "COMMON",
    isCursed: false,
  },
  {
    name: "Cape of Unearned Confidence",
    description: "A sweeping crimson velvet cape that billows with zero wind.",
    humorQuote: "You still have no idea what you are doing, but everyone in the meeting nods solemnly.",
    category: "ARMOR",
    price: 75,
    statType: "CHARISMA",
    statBoost: 15,
    icon: "Sparkles",
    rarity: "RARE",
    isCursed: false,
  },
  {
    name: "Amulet of Fresh Grass Touching",
    description: "Enchanted green pendant holding actual blade of lawn.",
    humorQuote: "Smells faintly of springtime. Protects against existential doomscrolling.",
    category: "TRINKET",
    price: 50,
    statType: "SANITY",
    statBoost: 15,
    icon: "Sun",
    rarity: "UNCOMMON",
    isCursed: false,
  },
  {
    name: "The Rubber Duck of Supreme Logic",
    description: "A yellow rubber companion that listens without judgment.",
    humorQuote: "Will stare into your soul until you notice the missing closing bracket.",
    category: "TRINKET",
    price: 80,
    statType: "INTELLECT",
    statBoost: 14,
    icon: "MessageSquare",
    rarity: "RARE",
    isCursed: false,
  },
  {
    name: "Cursed Coffee Mug of 3AM Inspiration",
    description: "Dark ceramic mug that stays scalding hot forever.",
    humorQuote: "Whispers seductive lies: 'You can definitely finish the entire project tonight.'",
    category: "TRINKET",
    price: 65,
    statType: "INTELLECT",
    statBoost: 20,
    icon: "Flame",
    rarity: "RARE",
    isCursed: true,
    curseDescription: "-5 Sanity penalty due to caffeine-induced hallucinations.",
  },
  {
    name: "The Bureaucrat Wax Stamp of Divine Authority",
    description: "Heavy brass seal that certifies victories.",
    humorQuote: "Grants the power to decline any meeting that should have been an asynchronous message.",
    category: "WEAPON",
    price: 150,
    statType: "ALL",
    statBoost: 10,
    icon: "Award",
    rarity: "LEGENDARY",
    isCursed: false,
  },
  {
    name: "Goblin Bartholomew Favorite Crumb",
    description: "A mysterious salted cracker crumb wrapped in foil.",
    humorQuote: "Give this to the desk goblin and he might stop judging your life choices for 10 minutes.",
    category: "POTION",
    price: 20,
    statType: "SANITY",
    statBoost: 5,
    icon: "Cookie",
    rarity: "COMMON",
    isCursed: false,
  },
];

async function main() {
  console.log("Seeding database with shop items and realistic demo guild data...");

  // 1. Seed Shop Items
  for (const item of shopItems) {
    const existing = await prisma.item.findFirst({
      where: { name: item.name },
    });
    if (!existing) {
      await prisma.item.create({ data: item });
      console.log(`Created shop item: ${item.name}`);
    }
  }

  // 2. Seed Primary Demo User ("adventurer")
  const passwordHash = await bcrypt.hash("password123", 10);

  const demoUser = await prisma.user.upsert({
    where: { username: "adventurer" },
    update: {},
    create: {
      username: "adventurer",
      email: "adventurer@guild.rpg",
      passwordHash,
      avatar: "warrior",
      characterClass: "WARRIOR",
      level: 3,
      xp: 240,
      gold: 145,
      streakCount: 4,
      title: "Errand Vanquisher",
      stats: {
        create: {
          strength: 18,
          intellect: 14,
          vitality: 16,
          dexterity: 12,
          charisma: 11,
          sanity: 15,
        },
      },
      logs: {
        create: [
          {
            actionType: "ACCOUNT_CREATED",
            message: "Enrolled in the Adventurer's Guild as a Warrior.",
            goldChange: 50,
          },
          {
            actionType: "LEVEL_UP",
            message: "Leveled up to Level 2 (Caffeine Apprentice)!",
            xpChange: 100,
          },
          {
            actionType: "LEVEL_UP",
            message: "Leveled up to Level 3 (Errand Vanquisher)!",
            xpChange: 140,
          },
        ],
      },
    },
    include: { stats: true },
  });

  console.log(`Demo user created/updated: ${demoUser.username}`);

  // 3. Seed Realistic Quests for the Demo User
  const starterQuests = [
    {
      title: "Conquer 45-minute heavy deadlift session",
      description: "Warm up properly, pull 3 heavy working sets, and avoid looking like a cooked prawn.",
      category: "STRENGTH",
      difficulty: "HARD",
      xpReward: 180,
      goldReward: 55,
      status: "TODO",
      dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
    {
      title: "Decipher and refactor authentication middleware",
      description: "Ensure all endpoints have Zod validations and atomic database transaction blocks.",
      category: "INTELLECT",
      difficulty: "HARD",
      xpReward: 180,
      goldReward: 55,
      status: "TODO",
      dueDate: new Date(Date.now() + 48 * 60 * 60 * 1000),
    },
    {
      title: "Drink 2.5 liters of actual water today",
      description: "No monster energy drinks, no quadruple espresso. Just raw elemental hydration.",
      category: "VITALITY",
      difficulty: "EASY",
      xpReward: 45,
      goldReward: 12,
      status: "TODO",
      dueDate: new Date(Date.now() + 12 * 60 * 60 * 1000),
    },
    {
      title: "Speedrun washing the sink mountain of dishes",
      description: "Vanquish the greasy skillet before it evolves into a conscious life form.",
      category: "DEXTERITY",
      difficulty: "MEDIUM",
      xpReward: 90,
      goldReward: 25,
      status: "TODO",
      dueDate: new Date(Date.now() + 6 * 60 * 60 * 1000),
    },
    {
      title: "Deliver project presentation with extreme poise",
      description: "Maintain eye contact and do not apologize for existing.",
      category: "CHARISMA",
      difficulty: "HARD",
      xpReward: 180,
      goldReward: 55,
      status: "TODO",
      dueDate: new Date(Date.now() + 72 * 60 * 60 * 1000),
    },
    {
      title: "Stare at the park oak tree for 10 minutes",
      description: "Step away from all glowing rectangles. Inhale oxygen, exhale existential panic.",
      category: "SANITY",
      difficulty: "TRIVIAL",
      xpReward: 20,
      goldReward: 5,
      status: "TODO",
      dueDate: new Date(Date.now() + 8 * 60 * 60 * 1000),
    },
    // Historical completed quest
    {
      title: "Complete 10,000 brisk steps through the town market",
      description: "Brisk walking in real sunlight.",
      category: "VITALITY",
      difficulty: "MEDIUM",
      xpReward: 90,
      goldReward: 25,
      status: "COMPLETED",
      completedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    },
  ];

  for (const q of starterQuests) {
    const existingQ = await prisma.task.findFirst({
      where: { userId: demoUser.id, title: q.title },
    });
    if (!existingQ) {
      await prisma.task.create({
        data: {
          ...q,
          userId: demoUser.id,
        },
      });
      console.log(`Created starter quest: ${q.title}`);
    }
  }

  // 4. Seed Demo Party (Fellowship of Procrastination Anonymous)
  const demoParty = await prisma.party.upsert({
    where: { code: "PROC-777" },
    update: {},
    create: {
      name: "The Fellowship of Focus",
      code: "PROC-777",
      bossName: "The Dread Procrastination Wyrm",
      bossMaxHp: 2500,
      bossCurrentHp: 1950,
    },
  });

  // Assign demo user to party
  const partyMembership = await prisma.partyMember.findUnique({
    where: { userId: demoUser.id },
  });
  if (!partyMembership) {
    await prisma.partyMember.create({
      data: {
        partyId: demoParty.id,
        userId: demoUser.id,
      },
    });
    console.log(`Enrolled demo user into party: ${demoParty.name}`);
  }

  console.log("Realistic seed completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
