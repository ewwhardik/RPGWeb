import { describe, it, expect } from "vitest";
import {
  getXpRequiredForLevel,
  calculateLevelFromTotalXp,
  DIFFICULTY_MULTIPLIERS,
  CATEGORY_DETAILS,
  TITLES_BY_LEVEL,
} from "@/lib/rpgEngine";

describe("RPG Progression Engine - Non-linear Leveling Math", () => {
  it("should require 100 XP for Level 1", () => {
    expect(getXpRequiredForLevel(1)).toBe(100);
  });

  it("should enforce non-linear progression where each level requires more XP than the last", () => {
    const xpL1 = getXpRequiredForLevel(1);
    const xpL2 = getXpRequiredForLevel(2);
    const xpL3 = getXpRequiredForLevel(3);
    const xpL4 = getXpRequiredForLevel(4);
    const xpL5 = getXpRequiredForLevel(5);

    expect(xpL2).toBeGreaterThan(xpL1);
    expect(xpL3).toBeGreaterThan(xpL2);
    expect(xpL4).toBeGreaterThan(xpL3);
    expect(xpL5).toBeGreaterThan(xpL4);

    // Verify rate of increase is accelerating (super-linear)
    const diff1 = xpL2 - xpL1;
    const diff2 = xpL3 - xpL2;
    expect(diff2).toBeGreaterThan(diff1);
  });

  it("should calculate correct level and surplus XP for beginner total XP", () => {
    // 0 XP -> Level 1, 0%
    const zeroXp = calculateLevelFromTotalXp(0);
    expect(zeroXp.level).toBe(1);
    expect(zeroXp.currentXp).toBe(0);
    expect(zeroXp.progressPercent).toBe(0);
    expect(zeroXp.title).toBe("Novice Procrastinator");

    // 50 XP -> Level 1, 50%
    const halfXp = calculateLevelFromTotalXp(50);
    expect(halfXp.level).toBe(1);
    expect(halfXp.currentXp).toBe(50);
    expect(halfXp.progressPercent).toBe(50);

    // Exactly 100 XP -> Promoted to Level 2
    const level2 = calculateLevelFromTotalXp(100);
    expect(level2.level).toBe(2);
    expect(level2.currentXp).toBe(0);
    expect(level2.progressPercent).toBe(0);
    expect(level2.title).toBe("Caffeine Apprentice");
  });

  it("should handle multi-level jumps when completing an epic quest", () => {
    // Large XP dump jumping from level 1 past level 2 into level 3
    const bigXp = calculateLevelFromTotalXp(400); // 100 (lvl 1) + 282 (lvl 2) = 382 needed for lvl 3
    expect(bigXp.level).toBe(3);
    expect(bigXp.currentXp).toBe(18);
    expect(bigXp.title).toBe("Errand Vanquisher");
  });

  it("should assign distinct titles for milestone levels", () => {
    expect(TITLES_BY_LEVEL[1]).toBe("Novice Procrastinator");
    expect(TITLES_BY_LEVEL[4]).toBe("Deadline Duelist");
    expect(TITLES_BY_LEVEL[10]).toBe("Mythic Productivity Demigod");
  });
});

describe("Quest Rewards & Multipliers", () => {
  it("should scale XP, Gold, and Stat Points strictly with difficulty", () => {
    const trivial = DIFFICULTY_MULTIPLIERS.TRIVIAL;
    const easy = DIFFICULTY_MULTIPLIERS.EASY;
    const medium = DIFFICULTY_MULTIPLIERS.MEDIUM;
    const hard = DIFFICULTY_MULTIPLIERS.HARD;
    const epic = DIFFICULTY_MULTIPLIERS.EPIC;

    expect(easy.xp).toBeGreaterThan(trivial.xp);
    expect(medium.xp).toBeGreaterThan(easy.xp);
    expect(hard.xp).toBeGreaterThan(medium.xp);
    expect(epic.xp).toBeGreaterThan(hard.xp);

    expect(easy.gold).toBeGreaterThan(trivial.gold);
    expect(medium.gold).toBeGreaterThan(easy.gold);
    expect(hard.gold).toBeGreaterThan(medium.gold);
    expect(epic.gold).toBeGreaterThan(hard.gold);

    expect(easy.statPoints).toBeGreaterThan(trivial.statPoints);
    expect(medium.statPoints).toBeGreaterThan(easy.statPoints);
    expect(hard.statPoints).toBeGreaterThan(medium.statPoints);
    expect(epic.statPoints).toBeGreaterThan(hard.statPoints);
  });

  it("should define all 6 required character attributes", () => {
    const requiredStats = [
      "STRENGTH",
      "INTELLECT",
      "VITALITY",
      "DEXTERITY",
      "CHARISMA",
      "SANITY",
    ] as const;

    for (const stat of requiredStats) {
      expect(CATEGORY_DETAILS[stat]).toBeDefined();
      expect(CATEGORY_DETAILS[stat].name).toBeTruthy();
      expect(CATEGORY_DETAILS[stat].color).toMatch(/^#[0-9a-f]{6}$/i);
    }
  });
});
