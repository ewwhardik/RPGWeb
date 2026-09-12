/**
 * Karmaraj Task Engine
 * Comprehensive mechanics for Habits, Dailies, To-Dos, and Rewards.
 * Vitals management, active class spells, and companion stable systems.
 */

export { calculateLevelFromTotalXp } from "./rpgEngine";

export type TaskType = "HABIT" | "DAILY" | "TODO" | "REWARD";

export interface MysteryDropItem {
  id: string;
  type: "EGG" | "POTION" | "FOOD" | "RELIC";
  name: string;
  description: string;
  icon: string;
  value?: number;
  rarity: "COMMON" | "UNCOMMON" | "RARE" | "LEGENDARY";
}

export interface HabitScoreResult {
  newValue: number;
  hpChange: number;
  xpGain: number;
  goldGain: number;
  mpGain: number;
  fainted: boolean;
  message: string;
  dropItem?: MysteryDropItem | null;
}

export interface ClassSkill {
  id: string;
  name: string;
  manaCost: number;
  description: string;
  classType: "WARRIOR" | "MAGE" | "ROGUE" | "PALADIN";
  icon: string;
  effect: string;
}

export const CLASS_SKILLS: Record<string, ClassSkill> = {
  // Warrior Skills
  brutal_smash: {
    id: "brutal_smash",
    name: "Brutal Smash",
    manaCost: 10,
    description: "Strikes task with immense force for 35 bonus XP and 50 boss raid damage.",
    classType: "WARRIOR",
    icon: "Axe",
    effect: "SMASH",
  },
  defensive_stance: {
    id: "defensive_stance",
    name: "Defensive Stance",
    manaCost: 25,
    description: "Raises heavy guard, reducing next daily damage by 50%.",
    classType: "WARRIOR",
    icon: "Shield",
    effect: "DEFENSE",
  },
  valorous_presence: {
    id: "valorous_presence",
    name: "Valorous Presence",
    manaCost: 20,
    description: "Rallies allies with war cries, granting party members 20 morale boss damage.",
    classType: "WARRIOR",
    icon: "Megaphone",
    effect: "RALLY",
  },
  intimidating_gaze: {
    id: "intimidating_gaze",
    name: "Intimidating Gaze",
    manaCost: 15,
    description: "Freezes daily neglect, preventing streak resets for today.",
    classType: "WARRIOR",
    icon: "Eye",
    effect: "INTIMIDATE",
  },

  // Mage Skills
  burst_of_flames: {
    id: "burst_of_flames",
    name: "Burst of Flames",
    manaCost: 10,
    description: "Incinerates procrastination, granting 45 instant XP.",
    classType: "MAGE",
    icon: "Flame",
    effect: "FLAME",
  },
  ethereal_surge: {
    id: "ethereal_surge",
    name: "Ethereal Surge",
    manaCost: 30,
    description: "Channels leyline energy, granting all party members 25 Mana.",
    classType: "MAGE",
    icon: "Sparkles",
    effect: "SURGE",
  },
  mp_siphon: {
    id: "mp_siphon",
    name: "MP Siphon",
    manaCost: 15,
    description: "Draws arcane vapor from finished tasks, restoring 25 Mana.",
    classType: "MAGE",
    icon: "Zap",
    effect: "SIPHON",
  },
  chilling_frost: {
    id: "chilling_frost",
    name: "Chilling Frost",
    manaCost: 25,
    description: "Freezes time itself so uncompleted dailies do not drop streaks.",
    classType: "MAGE",
    icon: "Snowflake",
    effect: "FREEZE",
  },

  // Rogue Skills
  pickpocket: {
    id: "pickpocket",
    name: "Pickpocket",
    manaCost: 10,
    description: "Siphons loose coins from the task archives, granting 20 Gold.",
    classType: "ROGUE",
    icon: "Coins",
    effect: "GOLD",
  },
  backstab: {
    id: "backstab",
    name: "Backstab",
    manaCost: 15,
    description: "Strikes an unsuspecting task from shadows for 30 Gold and 40 XP.",
    classType: "ROGUE",
    icon: "Sword",
    effect: "CRIT",
  },
  tools_of_trade: {
    id: "tools_of_trade",
    name: "Tools of the Trade",
    manaCost: 25,
    description: "Sharpen lockpicks, increasing party gold find by 20%.",
    classType: "ROGUE",
    icon: "Key",
    effect: "PERCEPTION",
  },
  stealth: {
    id: "stealth",
    name: "Stealth",
    manaCost: 20,
    description: "Cloaks in shadows to evade all damage from missed dailies tonight.",
    classType: "ROGUE",
    icon: "Ghost",
    effect: "STEALTH",
  },

  // Paladin Skills
  healing_light: {
    id: "healing_light",
    name: "Healing Light",
    manaCost: 15,
    description: "Bathes wounds in pure sunlight, restoring 20 Health points immediately.",
    classType: "PALADIN",
    icon: "Heart",
    effect: "HEAL",
  },
  protective_aura: {
    id: "protective_aura",
    name: "Protective Aura",
    manaCost: 30,
    description: "Places blessed aegis over party, cutting all raid and daily damage in half.",
    classType: "PALADIN",
    icon: "Shield",
    effect: "AURA",
  },
  brightness: {
    id: "brightness",
    name: "Brightness",
    manaCost: 15,
    description: "Illuminates mind and body, temporarily expanding vitality ceiling.",
    classType: "PALADIN",
    icon: "Sun",
    effect: "BUFF",
  },
  blessing: {
    id: "blessing",
    name: "Blessing",
    manaCost: 25,
    description: "Calls down celestial mercy, restoring 15 Health to every guild member.",
    classType: "PALADIN",
    icon: "Sparkles",
    effect: "PARTY_HEAL",
  },
};

/**
 * Returns color classes and badges for Habit cards based on mastery rating.
 * 5 color tiers: Deep Crimson, Burnt Orange, Sun Gold, Verdant Green, Mystic Cyan.
 * Strictly NO purple colors!
 */
export function getHabitColorDetails(value: number): {
  bgClass: string;
  borderClass: string;
  textClass: string;
  badgeBg: string;
  colorName: string;
} {
  if (value < -10) {
    return {
      bgClass: "bg-red-950/50",
      borderClass: "border-red-600/70",
      textClass: "text-red-400",
      badgeBg: "bg-red-900/60",
      colorName: "Deep Crimson",
    };
  }
  if (value < -1) {
    return {
      bgClass: "bg-orange-950/50",
      borderClass: "border-orange-600/70",
      textClass: "text-orange-400",
      badgeBg: "bg-orange-900/60",
      colorName: "Burnt Orange",
    };
  }
  if (value <= 5) {
    return {
      bgClass: "bg-amber-950/50",
      borderClass: "border-amber-600/70",
      textClass: "text-amber-300",
      badgeBg: "bg-amber-900/60",
      colorName: "Sun Gold",
    };
  }
  if (value <= 12) {
    return {
      bgClass: "bg-emerald-950/50",
      borderClass: "border-emerald-600/70",
      textClass: "text-emerald-400",
      badgeBg: "bg-emerald-900/60",
      colorName: "Verdant Green",
    };
  }
  return {
    bgClass: "bg-sky-950/50",
    borderClass: "border-sky-500/70",
    textClass: "text-sky-300",
    badgeBg: "bg-sky-900/60",
    colorName: "Mystic Cyan",
  };
}

export function getDifficultyWeight(difficulty: string): number {
  switch (difficulty ? difficulty.toUpperCase() : "") {
    case "TRIVIAL":
      return 0.5;
    case "EASY":
      return 1.0;
    case "MEDIUM":
      return 1.5;
    case "HARD":
      return 2.0;
    case "EPIC":
      return 2.5;
    default:
      return 1.0;
  }
}

export function calculateHabitScore(
  currentVal: number,
  direction: "up" | "down",
  difficulty: string,
  userHp: number
): HabitScoreResult {
  const weight = getDifficultyWeight(difficulty);

  if (direction === "up") {
    const newValue = Math.min(25, Number((currentVal + 1.2 * weight).toFixed(2)));
    const xpGain = Math.round(20 * weight);
    const goldGain = Math.round(6 * weight);
    const mpGain = Math.round(2 * weight);

    return {
      newValue,
      hpChange: 0,
      xpGain,
      goldGain,
      mpGain,
      fainted: false,
      message: `Habit reinforced! +${xpGain} XP, +${goldGain} Gold, +${mpGain} MP.`,
    };
  }

  const newValue = Math.max(-25, Number((currentVal - 1.5 * weight).toFixed(2)));
  const hpLoss = Math.round(7 * weight);
  const remainingHp = userHp - hpLoss;
  const fainted = remainingHp <= 0;

  return {
    newValue,
    hpChange: -hpLoss,
    xpGain: 0,
    goldGain: 0,
    mpGain: 0,
    fainted,
    message: fainted
      ? "Bad habit drained your last spark of life! You fainted."
      : `Bad habit penalty! -${hpLoss} Health lost.`,
  };
}

export function calculateMissedDailyDamage(difficulty: string, isSleeping: boolean): number {
  if (isSleeping) return 0;
  const weight = getDifficultyWeight(difficulty);
  return Math.round(8 * weight);
}

export const POSSIBLE_DROPS: MysteryDropItem[] = [
  { id: "drop_wolf_egg", type: "EGG", name: "Dire Wolf Egg", description: "A speckled stone-grey egg radiating primal loyalty.", icon: "🐺", rarity: "COMMON" },
  { id: "drop_tiger_egg", type: "EGG", name: "Saber Tiger Cub Egg", description: "Warm to the touch with striped amber veins.", icon: "🐯", rarity: "UNCOMMON" },
  { id: "drop_dragon_egg", type: "EGG", name: "Ember Dragon Egg", description: "Smolders with eternal draconic fire.", icon: "🐲", rarity: "LEGENDARY" },
  { id: "drop_fox_egg", type: "EGG", name: "Shadow Fox Egg", description: "Shimmers with elusive twilight essence.", icon: "🦊", rarity: "RARE" },
  { id: "drop_owl_egg", type: "EGG", name: "Grand Owl Egg", description: "Quietly hums with ancient scholarly focus.", icon: "🦉", rarity: "UNCOMMON" },
  { id: "drop_base_potion", type: "POTION", name: "Standard Hatching Potion", description: "A balanced catalyst for hatching companion eggs.", icon: "🧪", rarity: "COMMON" },
  { id: "drop_golden_potion", type: "POTION", name: "Gilded Potion", description: "Infuses the beast with lustrous golden armor.", icon: "✨", rarity: "RARE" },
  { id: "drop_shadow_potion", type: "POTION", name: "Shadow Potion", description: "Veils the companion in deep obsidian mist.", icon: "🌑", rarity: "RARE" },
  { id: "drop_moss_potion", type: "POTION", name: "Verdant Potion", description: "Nature's bloom grants untamed resilience.", icon: "🌿", rarity: "UNCOMMON" },
  { id: "drop_meat", type: "FOOD", name: "Roasted Beast Meat", description: "Savory meal that increases companion fullness by +5.", icon: "🥩", value: 5, rarity: "COMMON" },
  { id: "drop_honey", type: "FOOD", name: "Golden Honeycomb", description: "Sweet delicacy that delights any companion (+10 fullness).", icon: "🍯", value: 10, rarity: "UNCOMMON" },
  { id: "drop_milk", type: "FOOD", name: "Starlight Milk", description: "Nourishing elixir that rapidly matures beasts (+15 fullness).", icon: "🥛", value: 15, rarity: "RARE" },
  { id: "drop_gold_satchel", type: "RELIC", name: "Bandit's Gold Satchel", description: "Found hidden among tasks. Instant +30 Gold!", icon: "💰", value: 30, rarity: "COMMON" },
  { id: "drop_xp_codex", type: "RELIC", name: "Scroll of Ancient Insights", description: "Unlocks sudden clarity. Instant +45 XP!", icon: "📜", value: 45, rarity: "UNCOMMON" },
  { id: "drop_mana_crystal", type: "RELIC", name: "Arcane Mana Crystal", description: "Pure crystallised magic. Instant +25 MP!", icon: "💎", value: 25, rarity: "COMMON" },
];

export function calculateTaskDrop(dexterity: number = 10): MysteryDropItem | null {
  const chance = 0.35 + Math.min(0.25, (dexterity - 10) * 0.015);
  if (Math.random() > chance) {
    return null;
  }
  const idx = Math.floor(Math.random() * POSSIBLE_DROPS.length);
  return POSSIBLE_DROPS[idx];
}

export const PET_SPECIES = [
  { id: "Wolf", name: "Dire Wolf", icon: "🐺" },
  { id: "TigerCub", name: "Saber Tiger", icon: "🐯" },
  { id: "BearCub", name: "Grizzly Cub", icon: "🐻" },
  { id: "Dragon", name: "Ember Dragon", icon: "🐲" },
  { id: "Fox", name: "Red Fox", icon: "🦊" },
  { id: "Owl", name: "Grand Owl", icon: "🦉" },
  { id: "LionCub", name: "Golden Lion", icon: "🦁" },
  { id: "PandaCub", name: "Shadow Panda", icon: "🐼" },
];

export const HATCHING_POTIONS = [
  { id: "Base", name: "Standard Potion", color: "#d97706" },
  { id: "Golden", name: "Gilded Potion", color: "#f59e0b" },
  { id: "Shadow", name: "Shadow Potion", color: "#334155" },
  { id: "Moss", name: "Verdant Potion", color: "#10b981" },
];

export interface StarterTaskDef {
  type: "HABIT" | "DAILY" | "TODO" | "REWARD";
  title: string;
  description?: string;
  category: "STRENGTH" | "INTELLECT" | "VITALITY" | "DEXTERITY" | "CHARISMA" | "SANITY";
  difficulty: "TRIVIAL" | "EASY" | "MEDIUM" | "HARD";
  up?: boolean;
  down?: boolean;
  value?: number;
  repeatDays?: string;
  checklist?: string;
  cost?: number;
}

export const DEFAULT_STARTER_TASKS: StarterTaskDef[] = [
  {
    type: "HABIT",
    title: "1h Focused Deep Work",
    description: "Undistracted spellcraft and quest development without tab switching.",
    category: "INTELLECT",
    difficulty: "MEDIUM",
    up: true,
    down: false,
    value: 2.5,
  },
  {
    type: "HABIT",
    title: "Take The Stairs",
    description: "Build leg stamina on physical kingdom stairwells.",
    category: "STRENGTH",
    difficulty: "EASY",
    up: true,
    down: false,
    value: 1.0,
  },
  {
    type: "HABIT",
    title: "Mindless Social Doomscrolling",
    description: "Goblin distraction drains precious vitality and daylight.",
    category: "SANITY",
    difficulty: "EASY",
    up: false,
    down: true,
    value: -2.0,
  },
  {
    type: "DAILY",
    title: "Morning Expedition & Stretch",
    description: "Greet the sun and activate vital sinews before morning patrol.",
    category: "VITALITY",
    difficulty: "EASY",
    repeatDays: "0,1,2,3,4,5,6",
  },
  {
    type: "DAILY",
    title: "Read 10 Pages of Wisdom",
    description: "Absorb ancient scrolls or technical tomes before candle extinguishes.",
    category: "INTELLECT",
    difficulty: "MEDIUM",
    repeatDays: "0,1,2,3,4,5,6",
  },
  {
    type: "DAILY",
    title: "Maintain Water Flask Hydration",
    description: "Drink at least 2 liters of clean spring water.",
    category: "VITALITY",
    difficulty: "TRIVIAL",
    repeatDays: "0,1,2,3,4,5,6",
  },
  {
    type: "TODO",
    title: "Organize Adventurer Backpack",
    description: "Clear loose parchment, arrange tools, sharpen writing instruments.",
    category: "DEXTERITY",
    difficulty: "EASY",
    checklist: JSON.stringify([
      { id: "c1", text: "Sort inventory and empty scrap papers", completed: false },
      { id: "c2", text: "Clean battle station / desk surface", completed: false },
      { id: "c3", text: "Refill flask and ration pouch", completed: false },
    ]),
  },
  {
    type: "TODO",
    title: "Establish Weekly Quest Objectives",
    description: "Define three primary dragons to slay before Sunday evening.",
    category: "INTELLECT",
    difficulty: "MEDIUM",
  },
  {
    type: "REWARD",
    title: "Watch 1 Episode of Tavern Drama",
    description: "Relax at the hearth with an engaging story.",
    category: "SANITY",
    difficulty: "EASY",
    cost: 15,
  },
  {
    type: "REWARD",
    title: "1 Hour of Guild Gaming",
    description: "Play recreation games with a clear conscience.",
    category: "CHARISMA",
    difficulty: "MEDIUM",
    cost: 25,
  },
];

export const STANDARD_SHOP_REWARDS = [
  {
    id: "health_potion",
    title: "Health Potion",
    description: "Restores 15 Health points instantly. Essential for clumsy warriors.",
    cost: 25,
    icon: "Heart",
    type: "POTION",
    healAmount: 15,
  },
  {
    id: "mana_potion",
    title: "Mana Potion",
    description: "Restores 25 Mana points immediately to cast heroic spells.",
    cost: 30,
    icon: "Zap",
    type: "MANA",
    manaAmount: 25,
  },
  {
    id: "enchanted_armoire",
    title: "Enchanted Armoire",
    description: "Unlock mystery chest for random rare equipment, pet food, or 35 XP.",
    cost: 100,
    icon: "PackageOpen",
    type: "ARMOIRE",
  },
];

/**
 * Night Owl Custom Day Start (CDS) Engine
 * Normalizes timestamps based on user's designated rollover hour (0 to 6 AM).
 * Prevents false streak breaks or premature daily resets for night owls.
 */
export function getUserDayStart(date: Date, dayStartHour: number = 0): Date {
  const adjusted = new Date(date);
  if (adjusted.getHours() < dayStartHour) {
    adjusted.setDate(adjusted.getDate() - 1);
  }
  adjusted.setHours(dayStartHour, 0, 0, 0);
  return adjusted;
}

export function isSameUserDay(d1: Date, d2: Date, dayStartHour: number = 0): boolean {
  const start1 = getUserDayStart(d1, dayStartHour);
  const start2 = getUserDayStart(d2, dayStartHour);
  return start1.toDateString() === start2.toDateString();
}

export function isDailyDueOnDate(
  repeatDays: string | null | undefined,
  date: Date,
  dayStartHour: number = 0
): boolean {
  if (!repeatDays) return true;
  const userDate = getUserDayStart(date, dayStartHour);
  const dayOfWeek = userDate.getDay().toString();
  const activeDays = repeatDays.split(",").map((s) => s.trim());
  return activeDays.includes(dayOfWeek);
}

/**
 * Dynamic Task Neglect Heatmap & Overdue Bounty Engine
 * Calculates visual states and bonus loot multipliers based on task value (-10 to +10).
 * Deep red tasks (value <= -5) become Fiery Overdue Bounties granting +50% Gold and XP.
 */
export interface TaskNeglectDetails {
  tier: "RADIANT" | "BALANCED" | "WARNING" | "CRITICAL_BOUNTY";
  borderClass: string;
  bgClass: string;
  glowClass: string;
  isOverdueBounty: boolean;
  bountyMultiplier: number;
  badgeText?: string;
}

export function getTaskNeglectDetails(value: number): TaskNeglectDetails {
  if (value <= -5) {
    return {
      tier: "CRITICAL_BOUNTY",
      borderClass: "border-red-500/80 hover:border-red-400",
      bgClass: "bg-red-950/30",
      glowClass: "shadow-[0_0_20px_rgba(239,68,68,0.25)] ring-1 ring-red-500/50",
      isOverdueBounty: true,
      bountyMultiplier: 1.5,
      badgeText: "🔥 OVERDUE BOUNTY (+50% REWARD)",
    };
  }

  if (value < 0) {
    return {
      tier: "WARNING",
      borderClass: "border-amber-600/60 hover:border-amber-500",
      bgClass: "bg-amber-950/20",
      glowClass: "shadow-none",
      isOverdueBounty: false,
      bountyMultiplier: 1.0,
    };
  }

  if (value >= 4) {
    return {
      tier: "RADIANT",
      borderClass: "border-emerald-600/60 hover:border-emerald-400",
      bgClass: "bg-emerald-950/20",
      glowClass: "shadow-[0_0_12px_rgba(16,185,129,0.15)]",
      isOverdueBounty: false,
      bountyMultiplier: 1.0,
      badgeText: "✨ RADIANT FOCUS",
    };
  }

  return {
    tier: "BALANCED",
    borderClass: "border-stone-700/70 hover:border-stone-600",
    bgClass: "bg-[#212730]",
    glowClass: "shadow-none",
    isOverdueBounty: false,
    bountyMultiplier: 1.0,
  };
}

