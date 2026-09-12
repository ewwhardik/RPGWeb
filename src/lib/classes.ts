import { QuestCategory, QuestRewards } from "@/lib/rpgEngine";

export type CharacterClassType = "WARRIOR" | "MAGE" | "ROGUE" | "PALADIN";

export interface ClassDefinition {
  id: CharacterClassType;
  name: string;
  subtitle: string;
  icon: string;
  perkTitle: string;
  perkDescription: string;
  primaryAttributes: QuestCategory[];
}

export const CHARACTER_CLASSES: Record<CharacterClassType, ClassDefinition> = {
  WARRIOR: {
    id: "WARRIOR",
    name: "Iron Berserker",
    subtitle: "Punisher of Gravity & Sloth",
    icon: "Axe",
    perkTitle: "Ironclad Momentum",
    perkDescription: "+25% bonus Strength points and +10 bonus Gold on Hard/Epic fitness quests.",
    primaryAttributes: ["STRENGTH", "VITALITY"],
  },
  MAGE: {
    id: "MAGE",
    name: "Code Sorcerer",
    subtitle: "Weaver of Syntax & Logic",
    icon: "Wand2",
    perkTitle: "Arcane Hyperfocus",
    perkDescription: "+25% bonus XP on Intellect quests, and 50% mitigation against diminishing returns.",
    primaryAttributes: ["INTELLECT", "SANITY"],
  },
  ROGUE: {
    id: "ROGUE",
    name: "Chore Assassin",
    subtitle: "Speedrunner of Domestic Chaos",
    icon: "Sword",
    perkTitle: "Sleight of Chore",
    perkDescription: "+25% bonus Gold on Dexterity chores, with a 20% Lucky Critical chance for double gold!",
    primaryAttributes: ["DEXTERITY", "CHARISMA"],
  },
  PALADIN: {
    id: "PALADIN",
    name: "Equilibrium Knight",
    subtitle: "Guardian of Grass & Sleep",
    icon: "Shield",
    perkTitle: "Aura of Equilibrium",
    perkDescription: "+20% Sanity and Vitality gains, with immunity to stat decay for 6 days instead of 4.",
    primaryAttributes: ["SANITY", "VITALITY"],
  },
};

/**
 * Calculates diminishing returns factor based on how many tasks of this category
 * were completed on the same day (reference: min_max).
 */
export function calculateDiminishingReturnsMultiplier(
  completedTodayCount: number,
  characterClass: CharacterClassType = "WARRIOR",
  category: QuestCategory = "INTELLECT"
): { multiplier: number; notice: string | null } {
  if (completedTodayCount <= 0) {
    return { multiplier: 1.0, notice: null };
  }

  // Mage perk: 50% mitigation on intellect fatigue
  const isMageIntellect = characterClass === "MAGE" && category === "INTELLECT";

  let rawMultiplier: number;
  if (completedTodayCount === 1) {
    rawMultiplier = isMageIntellect ? 0.92 : 0.85;
  } else if (completedTodayCount === 2) {
    rawMultiplier = isMageIntellect ? 0.82 : 0.70;
  } else {
    const penaltyRate = isMageIntellect ? 0.18 : 0.35;
    rawMultiplier = Math.max(0.35, 1 / (1 + (completedTodayCount - 1) * penaltyRate));
  }

  const roundedMultiplier = Math.round(rawMultiplier * 100) / 100;
  const pct = Math.round(roundedMultiplier * 100);

  return {
    multiplier: roundedMultiplier,
    notice: `Diminishing returns applied (${completedTodayCount + 1}th ${category} quest today): yields ${pct}% normal rewards to discourage spamming.`,
  };
}

/**
 * Applies class passives to base quest rewards (reference: Habitica class mechanics).
 */
export function applyClassPassives(
  characterClass: CharacterClassType,
  category: QuestCategory,
  difficulty: string,
  baseRewards: QuestRewards
): {
  finalRewards: QuestRewards;
  perkMessages: string[];
} {
  let xp = baseRewards.xp;
  let gold = baseRewards.gold;
  let statPoints = baseRewards.statPoints;
  const perkMessages: string[] = [];

  switch (characterClass) {
    case "WARRIOR":
      if (category === "STRENGTH") {
        statPoints = Math.round(statPoints * 1.25);
        if (difficulty === "HARD" || difficulty === "EPIC") {
          gold += 10;
          perkMessages.push("Warrior Ironclad Momentum: +25% Strength points and +10 bonus Gold awarded!");
        } else {
          perkMessages.push("Warrior Ironclad Momentum: +25% bonus Strength points awarded!");
        }
      }
      break;

    case "MAGE":
      if (category === "INTELLECT") {
        xp = Math.round(xp * 1.25);
        perkMessages.push("Mage Arcane Hyperfocus: +25% bonus Intellect XP gained!");
      }
      break;

    case "ROGUE":
      if (category === "DEXTERITY") {
        gold = Math.round(gold * 1.25);
        perkMessages.push("Rogue Sleight of Chore: +25% bonus Gold awarded!");
      }
      // 20% chance for lucky critical strike
      if (Math.random() < 0.2) {
        gold *= 2;
        perkMessages.push("CRITICAL GOLD DROP! Rogue luck doubled your gold coins!");
      }
      break;

    case "PALADIN":
      if (category === "SANITY" || category === "VITALITY") {
        statPoints = Math.round(statPoints * 1.2);
        perkMessages.push("Paladin Aura of Equilibrium: +20% bonus attribute points awarded!");
      }
      break;
  }

  return {
    finalRewards: { xp, gold, statPoints },
    perkMessages,
  };
}
