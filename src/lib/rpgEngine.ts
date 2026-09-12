/**
 * RPG Progression Engine
 * Non-linear leveling curve, attribute mechanics, and humorous titles.
 */

export interface LevelInfo {
  level: number;
  currentXp: number;
  xpNeededForNextLevel: number;
  progressPercent: number;
  title: string;
  isMaxLevel?: boolean;
}

export const TITLES_BY_LEVEL: Record<number, string> = {
  1: "Novice Procrastinator",
  2: "Caffeine Apprentice",
  3: "Errand Vanquisher",
  4: "Deadline Duelist",
  5: "Master of Modern Tedium",
  6: "Grand Arch-Doer",
  7: "Dread Slayer of Inertia",
  8: "Ascended Focus Titan",
  9: "Legendary Overachiever",
  10: "Mythic Productivity Demigod",
};

/**
 * Calculates XP required to complete a given level.
 * Formula: floor(100 * (level ^ 1.5))
 */
export function getXpRequiredForLevel(level: number): number {
  if (level <= 0) return 100;
  return Math.floor(100 * Math.pow(level, 1.5));
}

/**
 * Calculates user's level, surplus XP, and title based on total XP.
 */
export function calculateLevelFromTotalXp(totalXp: number): LevelInfo {
  let level = 1;
  let remainingXp = Math.max(0, totalXp);

  while (true) {
    const costForCurrent = getXpRequiredForLevel(level);
    if (remainingXp >= costForCurrent) {
      remainingXp -= costForCurrent;
      level += 1;
    } else {
      break;
    }
  }

  const costForNext = getXpRequiredForLevel(level);
  const progressPercent = Math.min(100, Math.round((remainingXp / costForNext) * 100));

  const title = TITLES_BY_LEVEL[level] || (level > 10 ? "Transcendent Being of Efficiency" : "Adventurer");

  return {
    level,
    currentXp: remainingXp,
    xpNeededForNextLevel: costForNext,
    progressPercent,
    title,
  };
}

export type QuestCategory =
  | "STRENGTH"
  | "INTELLECT"
  | "VITALITY"
  | "DEXTERITY"
  | "CHARISMA"
  | "SANITY";

export type QuestDifficulty = "TRIVIAL" | "EASY" | "MEDIUM" | "HARD" | "EPIC";

export interface QuestRewards {
  xp: number;
  gold: number;
  statPoints: number;
}

export const DIFFICULTY_MULTIPLIERS: Record<QuestDifficulty, QuestRewards> = {
  TRIVIAL: { xp: 20, gold: 5, statPoints: 1 },
  EASY: { xp: 45, gold: 12, statPoints: 2 },
  MEDIUM: { xp: 90, gold: 25, statPoints: 4 },
  HARD: { xp: 180, gold: 55, statPoints: 7 },
  EPIC: { xp: 360, gold: 120, statPoints: 12 },
};

export const CATEGORY_DETAILS: Record<
  QuestCategory,
  { name: string; stat: string; color: string; desc: string }
> = {
  STRENGTH: {
    name: "Strength",
    stat: "strength",
    color: "#ef4444",
    desc: "Gym, heavy lifting, sports, and fighting gravity.",
  },
  INTELLECT: {
    name: "Intellect",
    stat: "intellect",
    color: "#38bdf8",
    desc: "Writing code, studying, reading, and deciphering error logs.",
  },
  VITALITY: {
    name: "Vitality",
    stat: "vitality",
    color: "#10b981",
    desc: "Sleep hygiene, balanced meals, hydration, and medical upkeep.",
  },
  DEXTERITY: {
    name: "Dexterity",
    stat: "dexterity",
    color: "#f59e0b",
    desc: "Speed-cleaning, laundry combos, chores, and nimble organization.",
  },
  CHARISMA: {
    name: "Charisma",
    stat: "charisma",
    color: "#fbbf24",
    desc: "Social gatherings, difficult emails, public speaking, and persuasion.",
  },
  SANITY: {
    name: "Sanity",
    stat: "sanity",
    color: "#34d399",
    desc: "Touching grass, meditation, stepping away from screens, and mental calm.",
  },
};
