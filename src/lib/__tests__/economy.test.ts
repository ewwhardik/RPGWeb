import { describe, it, expect } from "vitest";

interface UserStatBlock {
  strength: number;
  intellect: number;
  vitality: number;
  dexterity: number;
  charisma: number;
  sanity: number;
}

interface ItemBlueprint {
  id: string;
  name: string;
  price: number;
  statType: keyof UserStatBlock;
  statBoost: number;
  isCursed?: boolean;
  cursePenalty?: number;
}

function calculateEquippedStats(
  baseStats: UserStatBlock,
  equippedItems: ItemBlueprint[]
): UserStatBlock {
  const result = { ...baseStats };

  for (const item of equippedItems) {
    result[item.statType] += item.statBoost;
    if (item.isCursed && item.cursePenalty) {
      result.sanity = Math.max(1, result.sanity - item.cursePenalty);
    }
  }

  return result;
}

function processPurchase(
  currentGold: number,
  itemPrice: number,
  alreadyOwned: boolean
): { success: boolean; remainingGold: number; error?: string } {
  if (alreadyOwned) {
    return { success: false, remainingGold: currentGold, error: "ALREADY_OWNED" };
  }
  if (currentGold < itemPrice) {
    return { success: false, remainingGold: currentGold, error: "INSUFFICIENT_GOLD" };
  }
  return { success: true, remainingGold: currentGold - itemPrice };
}

describe("In-Game Economy & Equipment Calculations", () => {
  const baseStats: UserStatBlock = {
    strength: 10,
    intellect: 10,
    vitality: 10,
    dexterity: 10,
    charisma: 10,
    sanity: 10,
  };

  it("applies attribute buffs accurately from equipped items", () => {
    const items: ItemBlueprint[] = [
      {
        id: "item_sword",
        name: "Ergonomic Lumbar Greatsword",
        price: 75,
        statType: "strength",
        statBoost: 8,
      },
      {
        id: "item_tome",
        name: "Grimoire of StackOverflow Lore",
        price: 90,
        statType: "intellect",
        statBoost: 12,
      },
    ];

    const effective = calculateEquippedStats(baseStats, items);
    expect(effective.strength).toBe(18);
    expect(effective.intellect).toBe(22);
    expect(effective.vitality).toBe(10);
    expect(effective.sanity).toBe(10);
  });

  it("applies sanity penalty from cursed productivity artifacts", () => {
    const cursedItems: ItemBlueprint[] = [
      {
        id: "cursed_caffeine",
        name: "Ring of Midnight Standups",
        price: 120,
        statType: "strength",
        statBoost: 15,
        isCursed: true,
        cursePenalty: 6,
      },
    ];

    const effective = calculateEquippedStats(baseStats, cursedItems);
    expect(effective.strength).toBe(25);
    expect(effective.sanity).toBe(4);
  });

  it("deducts gold accurately on valid merchant purchase", () => {
    const result = processPurchase(100, 45, false);
    expect(result.success).toBe(true);
    expect(result.remainingGold).toBe(55);
  });

  it("prevents purchases when user has insufficient gold reserves", () => {
    const result = processPurchase(30, 75, false);
    expect(result.success).toBe(false);
    expect(result.error).toBe("INSUFFICIENT_GOLD");
    expect(result.remainingGold).toBe(30);
  });

  it("rejects purchases of already-owned unique relics", () => {
    const result = processPurchase(200, 50, true);
    expect(result.success).toBe(false);
    expect(result.error).toBe("ALREADY_OWNED");
  });
});
