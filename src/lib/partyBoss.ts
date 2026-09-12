import prisma from "@/lib/prisma";

export interface BossTier {
  name: string;
  maxHp: number;
  description: string;
  humorQuote: string;
}

export const BOSS_TIERS: BossTier[] = [
  {
    name: "Kumbhakarna the Sloth Colossus",
    maxHp: 3000,
    description: "Slumbering titan of procrastination. Waking his immense power requires heroic daily momentum.",
    humorQuote: "Wake me when the sprint ends... or after six more months of hibernation.",
  },
  {
    name: "Mahishasura of Chaos & Context-Switching",
    maxHp: 4500,
    description: "Shape-shifting buffalo demon manifesting 47 open browser tabs and fractured focus.",
    humorQuote: "Why finish one epic task when you can open 84 Chrome tabs at once?",
  },
  {
    name: "Rahu the Eclipse Shadow",
    maxHp: 6000,
    description: "Cosmic serpent devouring willpower, focus, and dopamine clarity with phantom feeds.",
    humorQuote: "Your calendar is but a shadow in my jaws. Surrender to the void of doomscrolling.",
  },
  {
    name: "Maya the Illusion Weaver",
    maxHp: 8000,
    description: "Cosmic enchantress of mirages, phantom notifications, and false urgency.",
    humorQuote: "Everything you planned is merely an illusion. Look at this viral meme instead.",
  },
];

export type BossPhase = "STHIRA" | "MAYA_SHIELD" | "KRODHA_ENRAGE";

export interface BossPhaseInfo {
  phase: BossPhase;
  phaseName: string;
  description: string;
  badge: string;
  reductionRatio: number;
}

/**
 * Calculate procedural 3-phase state of the guild boss
 */
export function getBossPhase(currentHp: number, maxHp: number): BossPhaseInfo {
  const ratio = maxHp > 0 ? currentHp / maxHp : 1;
  if (ratio > 0.6) {
    return {
      phase: "STHIRA",
      phaseName: "Sthira (Stable)",
      description: "The boss stands firm. Standard physical & arcane attacks inflict full impact.",
      badge: "🛡️ STHIRA",
      reductionRatio: 0,
    };
  } else if (ratio > 0.25) {
    return {
      phase: "MAYA_SHIELD",
      phaseName: "Maya Shield (Illusion Veil)",
      description: "Maya Shield active! Physical strikes deflect (-35% DMG). Only INTELLECT & SANITY pierce for true damage!",
      badge: "🔮 MAYA SHIELD",
      reductionRatio: 0.35,
    };
  } else {
    return {
      phase: "KRODHA_ENRAGE",
      phaseName: "Krodha Enrage (Wrath)",
      description: "CRITICAL ENRAGE! Missed tasks generate 2x Rage strikes. Radiates furious crimson battle aura!",
      badge: "🔥 KRODHA ENRAGE",
      reductionRatio: 0,
    };
  }
}

/**
 * Real-Time SSE Broadcaster
 * Maintains active client connections per party ID across server-side execution
 */
export interface PartyStreamEvent {
  type: "BOSS_DAMAGE" | "BOSS_RAGE" | "BOSS_DEFEAT" | "RALLY" | "CHAT" | "QUEST_UPDATE";
  partyId: string;
  payload: unknown;
  timestamp: number;
}

const getPartySubscribers = (): Map<string, Set<ReadableStreamDefaultController>> => {
  const g = globalThis as unknown as {
    __karmarajPartySubscribers?: Map<string, Set<ReadableStreamDefaultController>>;
  };
  if (!g.__karmarajPartySubscribers) {
    g.__karmarajPartySubscribers = new Map();
  }
  return g.__karmarajPartySubscribers;
};

export function registerPartyStream(
  partyId: string,
  controller: ReadableStreamDefaultController
): () => void {
  const subscribers = getPartySubscribers();
  if (!subscribers.has(partyId)) {
    subscribers.set(partyId, new Set());
  }
  const partySet = subscribers.get(partyId)!;
  partySet.add(controller);

  return () => {
    partySet.delete(controller);
    if (partySet.size === 0) {
      subscribers.delete(partyId);
    }
  };
}

export function broadcastPartyEvent(partyId: string, event: Omit<PartyStreamEvent, "partyId" | "timestamp">) {
  const subscribers = getPartySubscribers();
  const partySet = subscribers.get(partyId);
  if (!partySet || partySet.size === 0) return;

  const fullEvent: PartyStreamEvent = {
    ...event,
    partyId,
    timestamp: Date.now(),
  };

  const payload = `data: ${JSON.stringify(fullEvent)}\n\n`;
  const encoded = new TextEncoder().encode(payload);

  for (const controller of Array.from(partySet)) {
    try {
      controller.enqueue(encoded);
    } catch {
      partySet.delete(controller);
    }
  }
}

/**
 * Webhook Dispatcher for Discord & Telegram
 */
export interface GuildWebhookEvent {
  type: "CRITICAL_HIT" | "HIGH_RAGE" | "BOSS_DEFEATED" | "RALLY";
  bossName: string;
  username: string;
  damage?: number;
  rage?: number;
  details?: string;
}

export async function dispatchGuildWebhook(partyId: string, event: GuildWebhookEvent) {
  try {
    const party = await prisma.party.findUnique({
      where: { id: partyId },
      select: { activeBuffs: true, name: true },
    });
    if (!party || !party.activeBuffs) return;

    let settings: { discordUrl?: string; telegramBotToken?: string; telegramChatId?: string } = {};
    try {
      const parsed = JSON.parse(party.activeBuffs);
      settings = parsed.__webhookSettings || {};
    } catch {
      return;
    }

    const { discordUrl, telegramBotToken, telegramChatId } = settings;

    // 1. Dispatch Discord Embed
    if (discordUrl && typeof discordUrl === "string" && discordUrl.startsWith("http")) {
      const color =
        event.type === "BOSS_DEFEATED"
          ? 0x10b981 // emerald
          : event.type === "HIGH_RAGE"
          ? 0xef4444 // crimson
          : 0xf59e0b; // amber

      const discordBody = {
        username: "Karmaraj Warboard",
        avatar_url: "https://raw.githubusercontent.com/ewwhardik/RPGWeb/main/public/brand/karmaraj_emblem.png",
        embeds: [
          {
            title:
              event.type === "BOSS_DEFEATED"
                ? `🏆 BOSS SLAIN in Guild ${party.name}!`
                : event.type === "HIGH_RAGE"
                ? `⚠️ BOSS RAGE CRITICAL in Guild ${party.name}!`
                : `⚔️ HEROIC STRIKE in Guild ${party.name}!`,
            description:
              event.type === "BOSS_DEFEATED"
                ? `**${event.username}** conquered **${event.bossName}**! All party members have received Gold and XP spoils!`
                : event.type === "HIGH_RAGE"
                ? `**${event.bossName}** has reached **${event.rage}% Rage**! Complete your tasks to soothe the titan before a retaliatory strike!`
                : `**${event.username}** channeled an immense strike against **${event.bossName}** dealing **${event.damage} DMG**!`,
            color,
            fields: [
              { name: "Adversary", value: event.bossName, inline: true },
              { name: "Warrior", value: event.username, inline: true },
              ...(event.details ? [{ name: "Details", value: event.details, inline: false }] : []),
            ],
            footer: {
              text: "Karmaraj — Gamified Habit RPG by Hardik (Sai Ram Dash)",
            },
            timestamp: new Date().toISOString(),
          },
        ],
      };

      fetch(discordUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(discordBody),
      }).catch((e) => console.error("Discord webhook dispatch error:", e));
    }

    // 2. Dispatch Telegram Notification
    if (telegramBotToken && telegramChatId) {
      const tgText =
        event.type === "BOSS_DEFEATED"
          ? `🏆 *BOSS SLAIN in ${party.name}!*\n\n*${event.username}* conquered *${event.bossName}*! Party rewards unlocked.`
          : event.type === "HIGH_RAGE"
          ? `⚠️ *BOSS RAGE WARNING in ${party.name}!*\n\n*${event.bossName}* has reached *${event.rage}% Rage*! Complete tasks to prevent retaliation.`
          : `⚔️ *HEROIC STRIKE in ${party.name}!*\n\n*${event.username}* dealt *${event.damage} DMG* to *${event.bossName}*!`;

      const tgUrl = `https://api.telegram.org/bot${telegramBotToken}/sendMessage`;
      fetch(tgUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: telegramChatId,
          text: tgText,
          parse_mode: "Markdown",
        }),
      }).catch((e) => console.error("Telegram webhook dispatch error:", e));
    }
  } catch (err) {
    console.error("dispatchGuildWebhook error:", err);
  }
}

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
  rawDamage: number;
  shieldBlockedDamage: number;
  bossName: string;
  bossDefeated: boolean;
  bossCurrentHp: number;
  bossMaxHp: number;
  bossPhase: BossPhase;
  rewardGold?: number;
  rewardXp?: number;
  nextBossName?: string;
}

/**
 * Apply damage from quest completion or party rally to the shared boss.
 * Incorporates 3-Phase Boss AI with Maya Shield mechanics.
 */
export async function applyBossDamage(
  partyId: string,
  damage: number,
  attackerUsername: string,
  taskCategory?: string
): Promise<BossDamageResult | null> {
  if (damage <= 0) return null;

  try {
    const result = await prisma.$transaction(async (tx) => {
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
      const phaseInfo = getBossPhase(currentHp, party.bossMaxHp);

      // Apply Maya Shield logic: physical attacks deflected (-35%), INTELLECT and SANITY pierce
      let effectiveDamage = damage;
      let shieldBlockedDamage = 0;

      if (phaseInfo.phase === "MAYA_SHIELD") {
        const pierces = taskCategory === "INTELLECT" || taskCategory === "SANITY";
        if (!pierces) {
          shieldBlockedDamage = Math.round(damage * phaseInfo.reductionRatio);
          effectiveDamage = Math.max(1, damage - shieldBlockedDamage);
        }
      }

      const newHp = Math.max(0, currentHp - effectiveDamage);

      if (newHp > 0) {
        await tx.party.update({
          where: { id: partyId },
          data: { bossCurrentHp: newHp },
        });

        const currentPhaseAfter = getBossPhase(newHp, party.bossMaxHp).phase;

        return {
          damageDealt: effectiveDamage,
          rawDamage: damage,
          shieldBlockedDamage,
          bossName: party.bossName,
          bossDefeated: false,
          bossCurrentHp: newHp,
          bossMaxHp: party.bossMaxHp,
          bossPhase: currentPhaseAfter,
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
        damageDealt: effectiveDamage,
        rawDamage: damage,
        shieldBlockedDamage,
        bossName: party.bossName,
        bossDefeated: true,
        bossCurrentHp: 0,
        bossMaxHp: party.bossMaxHp,
        bossPhase: "STHIRA" as BossPhase,
        rewardGold,
        rewardXp,
        nextBossName: nextTier.name,
      };
    });

    if (result) {
      // Real-Time SSE Broadcast
      broadcastPartyEvent(partyId, {
        type: result.bossDefeated ? "BOSS_DEFEAT" : "BOSS_DAMAGE",
        payload: {
          attackerUsername,
          damageDealt: result.damageDealt,
          bossCurrentHp: result.bossCurrentHp,
          bossMaxHp: result.bossMaxHp,
          bossName: result.bossName,
          bossDefeated: result.bossDefeated,
          bossPhase: result.bossPhase,
          nextBossName: result.nextBossName,
        },
      });

      // Webhook Trigger
      if (result.bossDefeated) {
        dispatchGuildWebhook(partyId, {
          type: "BOSS_DEFEATED",
          bossName: result.bossName,
          username: attackerUsername,
        });
      } else if (result.damageDealt >= 50) {
        dispatchGuildWebhook(partyId, {
          type: "CRITICAL_HIT",
          bossName: result.bossName,
          username: attackerUsername,
          damage: result.damageDealt,
          details: result.shieldBlockedDamage > 0 ? `(Shield absorbed ${result.shieldBlockedDamage} DMG)` : undefined,
        });
      }
    }

    return result;
  } catch (err) {
    console.error("applyBossDamage error:", err);
    return null;
  }
}

export interface BossRageResult {
  currentRage: number;
  rageStrike: boolean;
  strikeDamage: number;
  bossName: string;
}

/**
 * Increment boss rage due to a missed daily or negative habit.
 * If boss is in KRODHA_ENRAGE phase (<25% HP), rage accumulates 2x faster.
 * If rage reaches 100%, triggers a retaliatory Rage Strike on all party members.
 */
export async function applyBossRage(
  partyId: string,
  rageIncrement: number = 15
): Promise<BossRageResult | null> {
  try {
    const result = await prisma.$transaction(async (tx) => {
      const party = await tx.party.findUnique({
        where: { id: partyId },
        include: { members: true },
      });

      if (!party) return null;

      const phaseInfo = getBossPhase(party.bossCurrentHp, party.bossMaxHp);
      const effectiveIncrement = phaseInfo.phase === "KRODHA_ENRAGE" ? rageIncrement * 2 : rageIncrement;
      const newRage = (party.bossRage ?? 0) + effectiveIncrement;

      if (newRage < 100) {
        await tx.party.update({
          where: { id: partyId },
          data: { bossRage: newRage },
        });

        return {
          currentRage: newRage,
          rageStrike: false,
          strikeDamage: 0,
          bossName: party.bossName,
        };
      }

      // RAGE STRIKE! Boss reaches 100 Rage
      const strikeDamage = phaseInfo.phase === "KRODHA_ENRAGE" ? 22 : 15;

      await tx.party.update({
        where: { id: partyId },
        data: { bossRage: 0 },
      });

      // Inflict damage to all party members (minimum 1 HP)
      for (const member of party.members) {
        const u = await tx.user.findUnique({ where: { id: member.userId } });
        if (u) {
          const nextHp = Math.max(1, u.hp - strikeDamage);
          await tx.user.update({
            where: { id: member.userId },
            data: { hp: nextHp },
          });

          await tx.activityLog.create({
            data: {
              userId: member.userId,
              actionType: "BOSS_RAGE_STRIKE",
              message: `⚠️ BOSS RETALIATION! ${party.bossName} unleashed a 100% Rage Strike for -${strikeDamage} HP across the guild!`,
              xpChange: 0,
              goldChange: 0,
            },
          });
        }
      }

      return {
        currentRage: 0,
        rageStrike: true,
        strikeDamage,
        bossName: party.bossName,
      };
    });

    if (result) {
      // Real-Time SSE Broadcast
      broadcastPartyEvent(partyId, {
        type: "BOSS_RAGE",
        payload: {
          bossName: result.bossName,
          currentRage: result.currentRage,
          rageStrike: result.rageStrike,
          strikeDamage: result.strikeDamage,
        },
      });

      // Webhook Trigger
      if (result.rageStrike) {
        dispatchGuildWebhook(partyId, {
          type: "HIGH_RAGE",
          bossName: result.bossName,
          username: "All Adventurers",
          rage: 100,
          details: `Retaliatory Rage Strike struck the guild for -${result.strikeDamage} HP!`,
        });
      } else if (result.currentRage >= 85) {
        dispatchGuildWebhook(partyId, {
          type: "HIGH_RAGE",
          bossName: result.bossName,
          username: "Guild Alert",
          rage: result.currentRage,
        });
      }
    }

    return result;
  } catch (err) {
    console.error("applyBossRage error:", err);
    return null;
  }
}

