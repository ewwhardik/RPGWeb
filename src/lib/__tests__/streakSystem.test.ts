import { describe, it, expect } from "vitest";

function evaluateStreak(
  currentStreak: number,
  lastCompletedDate: Date | null,
  currentDate: Date
): { newStreak: number; streakMaintained: boolean; isNewDay: boolean } {
  if (!lastCompletedDate) {
    return { newStreak: 1, streakMaintained: false, isNewDay: true };
  }

  const msPerDay = 24 * 60 * 60 * 1000;
  const lastMidnight = new Date(lastCompletedDate).setHours(0, 0, 0, 0);
  const currentMidnight = new Date(currentDate).setHours(0, 0, 0, 0);
  const diffDays = Math.round((currentMidnight - lastMidnight) / msPerDay);

  if (diffDays === 0) {
    // Completed on the same calendar day: maintain current streak without double-counting
    return { newStreak: currentStreak, streakMaintained: true, isNewDay: false };
  }

  if (diffDays === 1) {
    // Completed the next consecutive calendar day: increment streak
    return { newStreak: currentStreak + 1, streakMaintained: true, isNewDay: true };
  }

  // Missed one or more days: streak breaks and resets to 1
  return { newStreak: 1, streakMaintained: false, isNewDay: true };
}

function calculateStreakBonusMultiplier(streakDays: number): number {
  if (streakDays >= 30) return 1.5;
  if (streakDays >= 7) return 1.25;
  if (streakDays >= 3) return 1.1;
  return 1.0;
}

describe("Streak Progression & Streak Multipliers", () => {
  it("initializes a streak of 1 on the first ever completed quest", () => {
    const now = new Date("2026-09-12T10:00:00Z");
    const result = evaluateStreak(0, null, now);
    expect(result.newStreak).toBe(1);
    expect(result.isNewDay).toBe(true);
  });

  it("increments streak by 1 when quest completed on the next consecutive day", () => {
    const yesterday = new Date("2026-09-11T15:00:00Z");
    const today = new Date("2026-09-12T09:00:00Z");
    const result = evaluateStreak(3, yesterday, today);
    expect(result.newStreak).toBe(4);
    expect(result.streakMaintained).toBe(true);
    expect(result.isNewDay).toBe(true);
  });

  it("maintains current streak without double incrementing on the same day", () => {
    const earlierToday = new Date("2026-09-12T08:00:00Z");
    const laterToday = new Date("2026-09-12T16:00:00Z");
    const result = evaluateStreak(5, earlierToday, laterToday);
    expect(result.newStreak).toBe(5);
    expect(result.streakMaintained).toBe(true);
    expect(result.isNewDay).toBe(false);
  });

  it("resets streak to 1 when user misses 2 or more days of habit activity", () => {
    const threeDaysAgo = new Date("2026-09-09T12:00:00Z");
    const today = new Date("2026-09-12T12:00:00Z");
    const result = evaluateStreak(12, threeDaysAgo, today);
    expect(result.newStreak).toBe(1);
    expect(result.streakMaintained).toBe(false);
  });

  it("calculates scaling gold reward multipliers based on streak tiers", () => {
    expect(calculateStreakBonusMultiplier(1)).toBe(1.0);
    expect(calculateStreakBonusMultiplier(2)).toBe(1.0);
    expect(calculateStreakBonusMultiplier(3)).toBe(1.1);
    expect(calculateStreakBonusMultiplier(5)).toBe(1.1);
    expect(calculateStreakBonusMultiplier(7)).toBe(1.25);
    expect(calculateStreakBonusMultiplier(14)).toBe(1.25);
    expect(calculateStreakBonusMultiplier(30)).toBe(1.5);
    expect(calculateStreakBonusMultiplier(100)).toBe(1.5);
  });
});
