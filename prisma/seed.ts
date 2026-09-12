import { PrismaClient } from "@prisma/client";

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
  console.log("Seeding shop inventory items...");
  for (const item of shopItems) {
    const existing = await prisma.item.findFirst({
      where: { name: item.name },
    });
    if (!existing) {
      await prisma.item.create({
        data: item,
      });
      console.log(`Created shop item: ${item.name}`);
    }
  }
  console.log("Seed complete! All items ready for the adventurer's economy.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
