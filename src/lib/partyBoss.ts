import prisma from "@/lib/prisma";

export interface BossTier {
  name: string;
  maxHp: number;
  description: string;
  humorQuote: string;
}

export const BOSS_TIERS: BossTier[] = [
  {
    name: "The Dread Procrastination Wyrm",
    maxHp: 2000,
    description: "Slithers through unchecked notifications and endless doomscrolls.",
    humorQuote: "I will devour your deadlines tomorrow. Or maybe next Tuesday.",
  },
  {
    name: "The Infinite Meeting Hydra",
    maxHp: 3500,
    description: "Cut off one status sync and two more calendar invites sprout in its place.",
    humorQuote: "Could this battle have been an email? We shall debate this for 45 minutes.",
  },
  {
    name: "The Overthinking Behemoth",
    maxHp: 5000,
    description: "Petrifies adventurers by demanding 47 alternate hypothetical edge cases.",
    humorQuote: "Before you strike, consider every consequence across twelve parallel timelines.",
  },
];

/**
 * Generate unique party invite code (e.g. GUILD-4921)
 */
export function generatePartyCode(): string {
  const prefixes = ["GUILD", "RAID", "FOCUS", "QUEST", "PARTY"];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const num = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${num}`;
}

export interface BossDamageResult {
  damageDealt: number;
  bossName: string;
  bossDefeated: boolean;
  bossCurrentHp: number;
  bossMaxHp: number;
  rewardGold?: number;
  rewardXp?: number;
  nextBossName?: string;
}

/**
 * Apply damage from quest completion or party rally to the shared boss.
 */
export async function applyBossDamage(
  partyId: string,
  damage: number,
  attackerUsername: string
): Promise<BossDamageResult | null> {
  if (damage <= 0) return null;

  return await prisma.$transaction(async (tx) => {
    const party = await tx.party.findUnique({
      where: { id: partyId },
      include: {
        members: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!party) return null;

    const currentHp = party.bossCurrentHp;
    const newHp = Math.max(0, currentHp - damage);

    if (newHp > 0) {
      await tx.party.update({
        where: { id: partyId },
        data: { bossCurrentHp: newHp },
      });

      return {
        damageDealt: damage,
        bossName: party.bossName,
        bossDefeated: false,
        bossCurrentHp: newHp,
        bossMaxHp: party.bossMaxHp,
      };
    }

    // Boss Defeated!
    const rewardGold = 100;
    const rewardXp = 150;

    // Find next boss tier
    const currentIndex = BOSS_TIERS.findIndex((b) => b.name === party.bossName);
    const nextTier =
      currentIndex >= 0 && currentIndex < BOSS_TIERS.length - 1
        ? BOSS_TIERS[currentIndex + 1]
        : BOSS_TIERS[0];

    await tx.party.update({
      where: { id: partyId },
      data: {
        bossName: nextTier.name,
        bossMaxHp: nextTier.maxHp,
        bossCurrentHp: nextTier.maxHp,
      },
    });

    // Reward all party members
    for (const member of party.members) {
      await tx.user.update({
        where: { id: member.userId },
        data: {
          gold: { increment: rewardGold },
          xp: { increment: rewardXp },
        },
      });

      await tx.activityLog.create({
        data: {
          userId: member.userId,
          actionType: "PARTY_BOSS_DEFEAT",
          message: `Guild Raid Victory! ${attackerUsername} struck the final blow against ${party.bossName}. Earned +${rewardGold} Gold and +${rewardXp} XP!`,
          goldChange: rewardGold,
          xpChange: rewardXp,
        },
      });
    }

    return {
      damageDealt: damage,
      bossName: party.bossName,
      bossDefeated: true,
      bossCurrentHp: 0,
      bossMaxHp: party.bossMaxHp,
      rewardGold,
      rewardXp,
      nextBossName: nextTier.name,
    };
  });
}
