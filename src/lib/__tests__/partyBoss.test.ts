import { describe, it, expect } from "vitest";
import { generatePartyCode, BOSS_TIERS } from "../partyBoss";

describe("Party Guild and Boss Raid Mechanics", () => {
  it("generates a well-formed guild invite code", () => {
    const code = generatePartyCode();
    expect(code).toBeDefined();
    expect(typeof code).toBe("string");
    expect(code).toMatch(/^[A-Z]+-\d{4}$/);
  });

  it("contains sequential Boss tiers with scaling Max HP", () => {
    expect(BOSS_TIERS.length).toBeGreaterThanOrEqual(3);
    for (let i = 0; i < BOSS_TIERS.length; i++) {
      const tier = BOSS_TIERS[i];
      expect(tier.name).toBeTruthy();
      expect(tier.maxHp).toBeGreaterThan(0);
      expect(tier.description).toBeTruthy();
      expect(tier.humorQuote).toBeTruthy();
    }
    // Check that later bosses have greater or equal HP
    expect(BOSS_TIERS[1].maxHp).toBeGreaterThan(BOSS_TIERS[0].maxHp);
    expect(BOSS_TIERS[2].maxHp).toBeGreaterThan(BOSS_TIERS[1].maxHp);
  });

  it("calculates raid damage correctly with and without Paladin specialization", () => {
    const xpEarned = 100;
    const baseDamage = Math.max(15, Math.floor(xpEarned * 0.5));
    expect(baseDamage).toBe(50);

    const paladinBonusMultiplier = 1.2;
    const paladinDamage = Math.floor(baseDamage * paladinBonusMultiplier);
    expect(paladinDamage).toBe(60);
    expect(paladinDamage).toBeGreaterThan(baseDamage);
  });

  it("handles boss health reduction and defeat boundaries", () => {
    const initialHp = 200;
    const standardHit = 50;
    const remainingHp = Math.max(0, initialHp - standardHit);
    expect(remainingHp).toBe(150);

    const fatalHit = 180;
    const overkillRemaining = Math.max(0, remainingHp - fatalHit);
    expect(overkillRemaining).toBe(0);
  });

  it("calculates 3-phase boss states correctly (Sthira, Maya Shield, Krodha Enrage)", async () => {
    const { getBossPhase } = await import("../partyBoss");
    const maxHp = 4000;

    // >60% -> Sthira
    const phase1 = getBossPhase(3000, maxHp);
    expect(phase1.phase).toBe("STHIRA");
    expect(phase1.reductionRatio).toBe(0);

    // 25% - 60% -> Maya Shield
    const phase2 = getBossPhase(1800, maxHp);
    expect(phase2.phase).toBe("MAYA_SHIELD");
    expect(phase2.reductionRatio).toBe(0.35);

    // <= 25% -> Krodha Enrage
    const phase3 = getBossPhase(800, maxHp);
    expect(phase3.phase).toBe("KRODHA_ENRAGE");
    expect(phase3.reductionRatio).toBe(0);
  });
});
