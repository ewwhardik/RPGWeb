import { describe, it, expect } from "vitest";
import {
  QUEST_SCROLL_LIBRARY,
  createInitialQuestState,
  applyQuestProgress,
} from "../questEngine";
import {
  getUserDayStart,
  isSameUserDay,
  isDailyDueOnDate,
  getTaskNeglectDetails,
} from "../taskEngine";
import {
  parsePartyBuffs,
  addPartyBuff,
  BUFF_TEMPLATES,
  PartyBuff,
} from "../partyBuffs";
import { SEED_CHALLENGES } from "../challenges";

describe("System 2: Narrative Quest Engine & Multi-Stage Bosses", () => {
  it("should have all sacred quest scrolls registered in the library", () => {
    expect(QUEST_SCROLL_LIBRARY.starlight_pilgrimage).toBeDefined();
    expect(QUEST_SCROLL_LIBRARY.sloth_titan_saga).toBeDefined();
    expect(QUEST_SCROLL_LIBRARY.dread_wyrm_lair).toBeDefined();
    expect(QUEST_SCROLL_LIBRARY.zen_ascension).toBeDefined();
  });

  it("should initialize a new quest state correctly from a scroll", () => {
    const state = createInitialQuestState("starlight_pilgrimage");
    expect(state).not.toBeNull();
    expect(state?.questId).toBe("starlight_pilgrimage");
    expect(state?.currentStageIndex).toBe(0);
    expect(state?.progress).toBe(0);
    expect(state?.target).toBe(12);
    expect(state?.isCompleted).toBe(false);
  });

  it("should advance collection progress when matching category tasks are completed", () => {
    const initialState = createInitialQuestState("starlight_pilgrimage")!;
    const result = applyQuestProgress(initialState, {
      type: "TASK_COMPLETED",
      category: "INTELLECT",
      username: "Astraea",
    });

    expect(result.updatedState.progress).toBe(1);
    expect(result.stageAdvanced).toBe(false);
    expect(result.questFinished).toBe(false);
  });

  it("should transition between stages on episodic multi-stage boss quests", () => {
    const initialState = createInitialQuestState("sloth_titan_saga")!;
    expect(initialState.currentStageIndex).toBe(0);
    expect(initialState.target).toBe(600);

    // Strike down Stage 1 golem
    const stage1Result = applyQuestProgress(initialState, {
      type: "BOSS_DAMAGE",
      amount: 600,
      username: "Valerius",
    });

    expect(stage1Result.stageAdvanced).toBe(true);
    expect(stage1Result.updatedState.currentStageIndex).toBe(1);
    expect(stage1Result.updatedState.progress).toBe(0);
    expect(stage1Result.updatedState.target).toBe(8); // Stage 2 requires 8 tasks
  });
});

describe("System 3: Guild Community Challenges", () => {
  it("should contain default seed challenges with balanced bounties and tasks", () => {
    expect(SEED_CHALLENGES.length).toBeGreaterThanOrEqual(4);
    for (const challenge of SEED_CHALLENGES) {
      expect(challenge.prizePool).toBeGreaterThanOrEqual(100);
      expect(challenge.tasks.length).toBeGreaterThan(0);
      expect(challenge.name).toBeTruthy();
    }
  });
});

describe("System 4: Night Owl Custom Day Start (CDS) Engine", () => {
  it("should adjust day start for hours before the night owl boundary", () => {
    // 2:30 AM with a 3:00 AM CDS should count as previous calendar day
    const lateNightDate = new Date(2026, 8, 15, 2, 30);
    const dayStart = getUserDayStart(lateNightDate, 3);

    expect(dayStart.getHours()).toBe(3);
    expect(dayStart.getDate()).toBe(14); // Rollback to day 14
  });

  it("should treat dates within the same night-owl period as the same user day", () => {
    const eveningDate = new Date(2026, 8, 14, 23, 15);
    const postMidnightDate = new Date(2026, 8, 15, 2, 45);

    // With CDS = 4 (4 AM start), both 11:15 PM and 2:45 AM belong to the same effective day!
    const sameDay = isSameUserDay(eveningDate, postMidnightDate, 4);
    expect(sameDay).toBe(true);
  });

  it("should accurately evaluate daily schedule with CDS", () => {
    // 2:00 AM on Sunday with CDS = 3 belongs to Saturday night (day 6)
    const sundayEarlyMorning = new Date(2026, 8, 13, 2, 0); // Sept 13, 2026 is Sunday
    const repeatSaturdayOnly = "6";
    const isDue = isDailyDueOnDate(repeatSaturdayOnly, sundayEarlyMorning, 3);
    expect(isDue).toBe(true);
  });
});

describe("System 5: Guild Synergistic Party Buffs", () => {
  it("should parse and filter out expired buffs", () => {
    const expiredTime = new Date(Date.now() - 3600000).toISOString();
    const activeTime = new Date(Date.now() + 3600000).toISOString();

    const mockBuffs: PartyBuff[] = [
      {
        id: "b1",
        name: "Old Buff",
        casterName: "Mage",
        icon: "Sparkles",
        effectType: "MANA_REGEN",
        multiplier: 1.3,
        expiresAt: expiredTime,
        description: "Expired",
      },
      {
        id: "b2",
        name: "Fresh Buff",
        casterName: "Paladin",
        icon: "Shield",
        effectType: "DAMAGE_REDUCTION",
        multiplier: 0.5,
        expiresAt: activeTime,
        description: "Active",
      },
    ];

    const parsed = parsePartyBuffs(JSON.stringify(mockBuffs));
    expect(parsed.length).toBe(1);
    expect(parsed[0].id).toBe("b2");
  });

  it("should have registered core party buff templates", () => {
    expect(BUFF_TEMPLATES.VALOROUS_PRESENCE).toBeDefined();
    expect(BUFF_TEMPLATES.ETHEREAL_SURGE).toBeDefined();
    expect(BUFF_TEMPLATES.TOOLS_OF_TRADE).toBeDefined();
    expect(BUFF_TEMPLATES.PROTECTIVE_AURA).toBeDefined();
  });

  it("should add or replace buffs of the same type", () => {
    const buff1: PartyBuff = {
      id: "b1",
      name: "War Cry 1",
      casterName: "Warrior1",
      icon: "Megaphone",
      effectType: "RAID_DAMAGE",
      multiplier: 1.25,
      expiresAt: new Date(Date.now() + 86400000).toISOString(),
      description: "Cry 1",
    };

    const buff2: PartyBuff = {
      id: "b2",
      name: "War Cry 2",
      casterName: "Warrior2",
      icon: "Megaphone",
      effectType: "RAID_DAMAGE",
      multiplier: 1.25,
      expiresAt: new Date(Date.now() + 86400000).toISOString(),
      description: "Cry 2",
    };

    const json1 = addPartyBuff("[]", buff1);
    const json2 = addPartyBuff(json1, buff2);
    const result = parsePartyBuffs(json2);

    expect(result.length).toBe(1);
    expect(result[0].id).toBe("b2");
    expect(result[0].casterName).toBe("Warrior2");
  });
});

describe("System 6: Dynamic Task Neglect Heatmap & Overdue Bounty Math", () => {
  it("should activate Overdue Bounty with 1.5x multiplier for neglected tasks (value <= -5)", () => {
    const deepNeglected = getTaskNeglectDetails(-6.5);
    expect(deepNeglected.tier).toBe("CRITICAL_BOUNTY");
    expect(deepNeglected.isOverdueBounty).toBe(true);
    expect(deepNeglected.bountyMultiplier).toBe(1.5);
    expect(deepNeglected.badgeText).toContain("OVERDUE BOUNTY");
  });

  it("should assign Warning tier for negative tasks not yet critical (-4.9 to -0.1)", () => {
    const warningTask = getTaskNeglectDetails(-3.0);
    expect(warningTask.tier).toBe("WARNING");
    expect(warningTask.isOverdueBounty).toBe(false);
    expect(warningTask.bountyMultiplier).toBe(1.0);
  });

  it("should assign Balanced tier for neutral tasks (0 to 3.9)", () => {
    const balancedTask = getTaskNeglectDetails(1.5);
    expect(balancedTask.tier).toBe("BALANCED");
    expect(balancedTask.isOverdueBounty).toBe(false);
  });

  it("should assign Radiant tier for highly mastered tasks (value >= 4)", () => {
    const radiantTask = getTaskNeglectDetails(5.0);
    expect(radiantTask.tier).toBe("RADIANT");
    expect(radiantTask.badgeText).toContain("RADIANT FOCUS");
  });
});
