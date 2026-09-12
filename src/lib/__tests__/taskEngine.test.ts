import { describe, it, expect } from "vitest";
import {
  getHabitColorDetails,
  calculateHabitScore,
  calculateMissedDailyDamage,
  CLASS_SKILLS,
  PET_SPECIES,
  HATCHING_POTIONS,
  DEFAULT_STARTER_TASKS,
  STANDARD_SHOP_REWARDS,
} from "../taskEngine";
import { parseChecklistItems } from "@/components/TaskBoardGrid";

describe("Karmaraj Core Task Engine", () => {
  describe("Habit Color Tier Classification", () => {
    it("assigns Deep Crimson for severely negative habits", () => {
      const color = getHabitColorDetails(-15);
      expect(color.colorName).toBe("Deep Crimson");
      expect(color.textClass).toContain("text-red");
    });

    it("assigns Burnt Orange for moderately negative habits", () => {
      const color = getHabitColorDetails(-5);
      expect(color.colorName).toBe("Burnt Orange");
      expect(color.textClass).toContain("text-orange");
    });

    it("assigns Sun Gold for neutral or starter habits", () => {
      const color = getHabitColorDetails(2);
      expect(color.colorName).toBe("Sun Gold");
      expect(color.textClass).toContain("text-amber");
    });

    it("assigns Verdant Green for solid positive habits", () => {
      const color = getHabitColorDetails(8);
      expect(color.colorName).toBe("Verdant Green");
      expect(color.textClass).toContain("text-emerald");
    });

    it("assigns Mystic Cyan for legendary mastered habits", () => {
      const color = getHabitColorDetails(16);
      expect(color.colorName).toBe("Mystic Cyan");
      expect(color.textClass).toContain("text-sky");
    });

    it("strictly avoids purple or violet color classes", () => {
      const testValues = [-20, -10, -3, 0, 4, 10, 20];
      for (const val of testValues) {
        const c = getHabitColorDetails(val);
        expect(c.bgClass).not.toContain("purple");
        expect(c.bgClass).not.toContain("violet");
        expect(c.textClass).not.toContain("purple");
        expect(c.textClass).not.toContain("violet");
        expect(c.borderClass).not.toContain("purple");
        expect(c.colorName.toLowerCase()).not.toContain("purple");
      }
    });
  });

  describe("Habit Scoring Mechanics", () => {
    it("handles positive habit click correctly", () => {
      const result = calculateHabitScore(0, "up", "MEDIUM", 50);
      expect(result.newValue).toBeGreaterThan(0);
      expect(result.xpGain).toBeGreaterThan(0);
      expect(result.goldGain).toBeGreaterThan(0);
      expect(result.mpGain).toBeGreaterThan(0);
      expect(result.hpChange).toBe(0);
      expect(result.fainted).toBe(false);
    });

    it("handles negative habit penalty and damage", () => {
      const result = calculateHabitScore(0, "down", "MEDIUM", 50);
      expect(result.newValue).toBeLessThan(0);
      expect(result.hpChange).toBeLessThan(0);
      expect(result.xpGain).toBe(0);
      expect(result.goldGain).toBe(0);
      expect(result.fainted).toBe(false);
    });

    it("triggers faint when user HP is reduced to 0 or less", () => {
      const result = calculateHabitScore(0, "down", "HARD", 5);
      expect(result.fainted).toBe(true);
      expect(result.message).toContain("fainted");
    });
  });

  describe("Inn Rest Vacation Mode Daily Damage", () => {
    it("prevents daily damage when adventurer is resting at the inn", () => {
      const damage = calculateMissedDailyDamage("HARD", true);
      expect(damage).toBe(0);
    });

    it("inflicts daily damage when not resting at the inn", () => {
      const damage = calculateMissedDailyDamage("HARD", false);
      expect(damage).toBeGreaterThan(0);
    });
  });

  describe("Class Skills Registry", () => {
    it("contains all 4 archetypes with 4 distinct skills each", () => {
      const skills = Object.values(CLASS_SKILLS);
      expect(skills.length).toBe(16);

      const warriors = skills.filter((s) => s.classType === "WARRIOR");
      const mages = skills.filter((s) => s.classType === "MAGE");
      const rogues = skills.filter((s) => s.classType === "ROGUE");
      const paladins = skills.filter((s) => s.classType === "PALADIN");

      expect(warriors.length).toBe(4);
      expect(mages.length).toBe(4);
      expect(rogues.length).toBe(4);
      expect(paladins.length).toBe(4);

      for (const skill of skills) {
        expect(skill.manaCost).toBeGreaterThan(0);
        expect(skill.name.length).toBeGreaterThan(2);
        expect(skill.effect).toBeDefined();
      }
    });
  });

  describe("Companions and Starter Assets", () => {
    it("has diverse pet species and hatching potions", () => {
      expect(PET_SPECIES.length).toBeGreaterThanOrEqual(8);
      expect(HATCHING_POTIONS.length).toBeGreaterThanOrEqual(4);
    });

    it("provides complete starter tasks across all four columns", () => {
      const habitCount = DEFAULT_STARTER_TASKS.filter((t) => t.type === "HABIT").length;
      const dailyCount = DEFAULT_STARTER_TASKS.filter((t) => t.type === "DAILY").length;
      const todoCount = DEFAULT_STARTER_TASKS.filter((t) => t.type === "TODO").length;
      const rewardCount = DEFAULT_STARTER_TASKS.filter((t) => t.type === "REWARD").length;

      expect(habitCount).toBeGreaterThan(0);
      expect(dailyCount).toBeGreaterThan(0);
      expect(todoCount).toBeGreaterThan(0);
      expect(rewardCount).toBeGreaterThan(0);
    });

    it("includes standard shop rewards", () => {
      expect(STANDARD_SHOP_REWARDS.length).toBeGreaterThanOrEqual(3);
      const potion = STANDARD_SHOP_REWARDS.find((r) => r.id === "health_potion");
      expect(potion).toBeDefined();
      expect(potion?.cost).toBe(25);

      const chai = STANDARD_SHOP_REWARDS.find((r) => r.id === "kadak_chai");
      expect(chai).toBeDefined();
      expect(chai?.manaAmount).toBe(30);

      const amrit = STANDARD_SHOP_REWARDS.find((r) => r.id === "amrit_rasayana");
      expect(amrit).toBeDefined();
      expect(amrit?.healAmount).toBe(30);
    });
  });

  describe("Subtask Checklist Resilience", () => {
    it("safely handles malformed, null, or non-array inputs without throwing", () => {
      expect(parseChecklistItems(null)).toEqual([]);
      expect(parseChecklistItems(undefined)).toEqual([]);
      expect(parseChecklistItems("")).toEqual([]);
      expect(parseChecklistItems("{}")).toEqual([]);
      expect(parseChecklistItems("123")).toEqual([]);
      expect(parseChecklistItems("invalid json")).toEqual([]);
      expect(parseChecklistItems({ not: "an array" })).toEqual([]);
      expect(parseChecklistItems("true")).toEqual([]);
    });

    it("correctly parses valid JSON checklist arrays and double-encoded JSON", () => {
      const valid = JSON.stringify([
        { id: "c1", text: "Buy milk", completed: false },
        { id: "c2", text: "Walk dog", completed: true },
      ]);
      const res = parseChecklistItems(valid);
      expect(res).toHaveLength(2);
      expect(res[0].text).toBe("Buy milk");
      expect(res[0].completed).toBe(false);
      expect(res[1].completed).toBe(true);

      // Double encoded JSON
      const doubleEncoded = JSON.stringify(valid);
      const res2 = parseChecklistItems(doubleEncoded);
      expect(res2).toHaveLength(2);
      expect(res2[0].text).toBe("Buy milk");

      // Object with items array
      const objFormat = { items: [{ id: "x1", text: "Task A", completed: true }] };
      expect(parseChecklistItems(objFormat)).toHaveLength(1);
      expect(parseChecklistItems(objFormat)[0].text).toBe("Task A");

      // Object with numeric keys
      const numericObj = { "0": { id: "n1", text: "Numeric Task", completed: false } };
      expect(parseChecklistItems(numericObj)).toHaveLength(1);
      expect(parseChecklistItems(numericObj)[0].text).toBe("Numeric Task");
    });
  });
});
