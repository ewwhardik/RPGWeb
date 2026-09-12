import { describe, it, expect } from "vitest";
import {
  CHARACTER_CLASSES,
  calculateDiminishingReturnsMultiplier,
  applyClassPassives,
} from "@/lib/classes";

describe("Depth Mechanics - Character Classes & Passives (Habitica reference)", () => {
  it("should have all 4 distinct playable character classes configured", () => {
    expect(CHARACTER_CLASSES.WARRIOR).toBeDefined();
    expect(CHARACTER_CLASSES.MAGE).toBeDefined();
    expect(CHARACTER_CLASSES.ROGUE).toBeDefined();
    expect(CHARACTER_CLASSES.PALADIN).toBeDefined();

    expect(CHARACTER_CLASSES.WARRIOR.primaryAttributes).toContain("STRENGTH");
    expect(CHARACTER_CLASSES.MAGE.primaryAttributes).toContain("INTELLECT");
    expect(CHARACTER_CLASSES.ROGUE.primaryAttributes).toContain("DEXTERITY");
    expect(CHARACTER_CLASSES.PALADIN.primaryAttributes).toContain("SANITY");
  });

  it("should apply Warrior Ironclad Momentum perk on Strength quests", () => {
    const base = { xp: 100, gold: 30, statPoints: 4 };
    const { finalRewards, perkMessages } = applyClassPassives(
      "WARRIOR",
      "STRENGTH",
      "HARD",
      base
    );

    expect(finalRewards.statPoints).toBeGreaterThan(base.statPoints);
    expect(finalRewards.gold).toBeGreaterThan(base.gold);
    expect(perkMessages.length).toBeGreaterThan(0);
  });

  it("should apply Mage Arcane Hyperfocus perk on Intellect quests", () => {
    const base = { xp: 100, gold: 30, statPoints: 4 };
    const { finalRewards } = applyClassPassives(
      "MAGE",
      "INTELLECT",
      "MEDIUM",
      base
    );

    expect(finalRewards.xp).toBeGreaterThan(base.xp);
  });

  it("should apply Rogue Sleight of Chore bonus on Dexterity quests", () => {
    const base = { xp: 100, gold: 40, statPoints: 4 };
    const { finalRewards } = applyClassPassives(
      "ROGUE",
      "DEXTERITY",
      "MEDIUM",
      base
    );

    expect(finalRewards.gold).toBeGreaterThanOrEqual(50);
  });
});

describe("Depth Mechanics - Diminishing Returns Math (min_max reference)", () => {
  it("should yield 100% rewards on the first quest of a category", () => {
    const result = calculateDiminishingReturnsMultiplier(0, "WARRIOR", "STRENGTH");
    expect(result.multiplier).toBe(1.0);
    expect(result.notice).toBeNull();
  });

  it("should progressively diminish rewards as the user spams the same category in one day", () => {
    const first = calculateDiminishingReturnsMultiplier(0, "WARRIOR", "INTELLECT");
    const second = calculateDiminishingReturnsMultiplier(1, "WARRIOR", "INTELLECT");
    const third = calculateDiminishingReturnsMultiplier(2, "WARRIOR", "INTELLECT");
    const fifth = calculateDiminishingReturnsMultiplier(4, "WARRIOR", "INTELLECT");

    expect(second.multiplier).toBeLessThan(first.multiplier);
    expect(third.multiplier).toBeLessThan(second.multiplier);
    expect(fifth.multiplier).toBeLessThan(third.multiplier);

    expect(second.notice).toBeTruthy();
    expect(second.notice).toContain("Diminishing returns");
  });

  it("should grant Mage class mitigation on Intellect fatigue", () => {
    const warriorFatigue = calculateDiminishingReturnsMultiplier(1, "WARRIOR", "INTELLECT");
    const mageFatigue = calculateDiminishingReturnsMultiplier(1, "MAGE", "INTELLECT");

    expect(mageFatigue.multiplier).toBeGreaterThan(warriorFatigue.multiplier);
  });
});
