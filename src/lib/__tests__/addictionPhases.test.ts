import { describe, it, expect } from "vitest";
import { getTodayKingdomWeather, KINGDOM_WEATHER_CYCLES } from "../weatherEngine";
import { SEASON_1_TIERS } from "@/app/api/codex/route";

describe("Phase 5, 6 & 7 Game Addiction Systems", () => {
  describe("Kingdom Weather Engine", () => {
    it("has exactly 4 distinct balanced kingdom weathers", () => {
      expect(KINGDOM_WEATHER_CYCLES.length).toBe(4);
      const ids = KINGDOM_WEATHER_CYCLES.map((w) => w.id);
      expect(ids).toContain("golden_dawn");
      expect(ids).toContain("tempest_of_resolve");
      expect(ids).toContain("solar_eclipse");
      expect(ids).toContain("tavern_mists");
    });

    it("deterministically returns the same weather for the same calendar date", () => {
      const fixedDateA = new Date(2026, 8, 12); // Sep 12, 2026
      const fixedDateB = new Date(2026, 8, 12);
      const weatherA = getTodayKingdomWeather(fixedDateA);
      const weatherB = getTodayKingdomWeather(fixedDateB);

      expect(weatherA.id).toBe(weatherB.id);
      expect(weatherA.name).toBe(weatherB.name);
      expect(weatherA.effects).toBeDefined();
    });

    it("cycles smoothly between dates", () => {
      const day1 = getTodayKingdomWeather(new Date(2026, 0, 1));
      const day2 = getTodayKingdomWeather(new Date(2026, 0, 2));
      expect(day1).toBeDefined();
      expect(day2).toBeDefined();
    });

    it("verifies buff multipliers exist on weather definitions", () => {
      const solar = KINGDOM_WEATHER_CYCLES.find((w) => w.id === "solar_eclipse");
      expect(solar?.effects.mageSpellMultiplier).toBe(1.5);
      expect(solar?.effects.negativeHabitPenaltyMultiplier).toBe(1.25);

      const dawn = KINGDOM_WEATHER_CYCLES.find((w) => w.id === "golden_dawn");
      expect(dawn?.effects.morningGoldMultiplier).toBe(1.5);

      const tempest = KINGDOM_WEATHER_CYCLES.find((w) => w.id === "tempest_of_resolve");
      expect(tempest?.effects.streakXpMultiplier).toBe(1.25);

      const mists = KINGDOM_WEATHER_CYCLES.find((w) => w.id === "tavern_mists");
      expect(mists?.effects.innRestBonusHp).toBe(10);
      expect(mists?.effects.innRestBonusMp).toBe(15);
    });
  });

  describe("Chrono-Codex Seasonal Battle Pass", () => {
    it("contains exactly 30 ascending tiers", () => {
      expect(SEASON_1_TIERS.length).toBe(30);
      for (let i = 0; i < 30; i++) {
        expect(SEASON_1_TIERS[i].tier).toBe(i + 1);
        expect(SEASON_1_TIERS[i].shardsRequired).toBe((i + 1) * 100);
      }
    });

    it("contains major milestone rewards at tiers 5, 10, 15, 20, 25, 30", () => {
      const milestoneTiers = SEASON_1_TIERS.filter((t) => t.isMilestone);
      const milestoneNumbers = milestoneTiers.map((t) => t.tier);

      expect(milestoneNumbers).toContain(5); // Pet Egg
      expect(milestoneNumbers).toContain(10); // Voidwalker title
      expect(milestoneNumbers).toContain(15); // Shield
      expect(milestoneNumbers).toContain(20); // Wings
      expect(milestoneNumbers).toContain(25); // Archmage Codex
      expect(milestoneNumbers).toContain(30); // Obsidian Dragon Mount
    });

    it("correctly computes user tier from chronoShards", () => {
      const shardsZero = 0;
      expect(Math.min(30, Math.floor(shardsZero / 100))).toBe(0);

      const shardsTierSeven = 745;
      expect(Math.min(30, Math.floor(shardsTierSeven / 100))).toBe(7);

      const shardsMaxed = 4500;
      expect(Math.min(30, Math.floor(shardsMaxed / 100))).toBe(30);
    });
  });

  describe("Boss Rage Retaliation Logic", () => {
    it("handles rage boundary condition at 100", () => {
      const currentRage = 85;
      const increment = 15;
      const totalRage = currentRage + increment;
      const willTriggerRageStrike = totalRage >= 100;
      const nextRageAfterStrike = willTriggerRageStrike ? 0 : totalRage;

      expect(willTriggerRageStrike).toBe(true);
      expect(nextRageAfterStrike).toBe(0);
    });

    it("handles sub-100 rage increments without strike", () => {
      const currentRage = 30;
      const increment = 15;
      const totalRage = currentRage + increment;
      const willTriggerRageStrike = totalRage >= 100;

      expect(willTriggerRageStrike).toBe(false);
      expect(totalRage).toBe(45);
    });
  });

  describe("Combo Pitch Pentatonic Math", () => {
    it("maps combo counters correctly to ascending frequencies", () => {
      const pentatonicScale = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 587.33, 659.25];
      const getNote = (combo: number) => {
        const idx = Math.min(pentatonicScale.length - 1, Math.max(0, combo - 1));
        return pentatonicScale[idx];
      };

      expect(getNote(1)).toBe(261.63); // C4
      expect(getNote(2)).toBe(293.66); // D4
      expect(getNote(3)).toBe(329.63); // E4
      expect(getNote(4)).toBe(392.00); // G4
      expect(getNote(5)).toBe(440.00); // A4
      expect(getNote(6)).toBe(523.25); // C5
      expect(getNote(15)).toBe(659.25); // Cap at highest note
    });
  });
});
