import prisma from "@/lib/prisma";
import { QuestCategory } from "@/lib/rpgEngine";
import { Prisma } from "@prisma/client";

export interface DecayResult {
  hasDecayed: boolean;
  decayedStats: Array<{
    category: QuestCategory;
    amount: number;
    currentValue: number;
  }>;
  messages: string[];
}

const DECAY_THRESHOLD_MS = 4 * 24 * 60 * 60 * 1000; // 4 days (96 hours)
const MIN_STAT_FLOOR = 5; // Stats never decay below 5

const STAT_QUOTES: Record<QuestCategory, string> = {
  STRENGTH: "Your muscles felt neglected after 4+ days of no heavy lifting. -1 Strength.",
  INTELLECT: "Brain fog rolled in after prolonged absence from arcane study. -1 Intellect.",
  VITALITY: "Irregular sleep and skipped hydration took a slight physical toll. -1 Vitality.",
  DEXTERITY: "Your nimble hands grew slightly stiff from avoiding chores. -1 Dexterity.",
  CHARISMA: "Conversational agility dulled after avoiding all human interaction. -1 Charisma.",
  SANITY: "Indoor screen confinement caused mental tranquility to waver. -1 Sanity.",
};

/**
 * Checks if any stat has been neglected for > 4 days.
 * If neglected, decrements stat by 1 down to a minimum floor of 5.
 */
export async function checkAndApplyStatDecay(userId: string): Promise<DecayResult> {
  const stats = await prisma.userStats.findUnique({
    where: { userId },
  });

  if (!stats) {
    return { hasDecayed: false, decayedStats: [], messages: [] };
  }

  const now = Date.now();
  const lastCheck = new Date(stats.lastDecayCheck).getTime();

  // Only run check once every 24 hours to prevent spam
  if (now - lastCheck < 24 * 60 * 60 * 1000) {
    return { hasDecayed: false, decayedStats: [], messages: [] };
  }

  const updates: Prisma.UserStatsUpdateInput = {
    lastDecayCheck: new Date(),
  };

  const decayedStats: DecayResult["decayedStats"] = [];
  const messages: string[] = [];

  const categories: Array<{
    category: QuestCategory;
    field: "strength" | "intellect" | "vitality" | "dexterity" | "charisma" | "sanity";
    dateField: "lastStrengthDate" | "lastIntellectDate" | "lastVitalityDate" | "lastDexterityDate" | "lastCharismaDate" | "lastSanityDate";
  }> = [
    { category: "STRENGTH", field: "strength", dateField: "lastStrengthDate" },
    { category: "INTELLECT", field: "intellect", dateField: "lastIntellectDate" },
    { category: "VITALITY", field: "vitality", dateField: "lastVitalityDate" },
    { category: "DEXTERITY", field: "dexterity", dateField: "lastDexterityDate" },
    { category: "CHARISMA", field: "charisma", dateField: "lastCharismaDate" },
    { category: "SANITY", field: "sanity", dateField: "lastSanityDate" },
  ];

  for (const { category, field, dateField } of categories) {
    const lastActive = new Date(stats[dateField]).getTime();
    const currentVal = stats[field];

    if (now - lastActive > DECAY_THRESHOLD_MS && currentVal > MIN_STAT_FLOOR) {
      updates[field] = { decrement: 1 };
      decayedStats.push({
        category,
        amount: 1,
        currentValue: currentVal - 1,
      });
      messages.push(STAT_QUOTES[category]);
    }
  }

  if (decayedStats.length > 0) {
    await prisma.$transaction([
      prisma.userStats.update({
        where: { userId },
        data: updates,
      }),
      prisma.activityLog.create({
        data: {
          userId,
          actionType: "STAT_DECAY",
          message: `Stat decay recorded: ${messages.join(" ")}`,
        },
      }),
    ]);

    return {
      hasDecayed: true,
      decayedStats,
      messages,
    };
  }

  // Update last check timestamp
  await prisma.userStats.update({
    where: { userId },
    data: { lastDecayCheck: new Date() },
  });

  return { hasDecayed: false, decayedStats: [], messages: [] };
}
