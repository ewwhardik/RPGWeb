import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { calculateHabitScore, calculateTaskDrop, MysteryDropItem } from "@/lib/taskEngine";
import { calculateLevelFromTotalXp } from "@/lib/rpgEngine";
import { applyBossDamage, applyBossRage } from "@/lib/partyBoss";

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized adventurer." }, { status: 401 });
    }

    const { id } = await context.params;
    const body = await req.json().catch(() => ({}));
    const { direction = "up" } = body; // "up" or "down"

    const task = await prisma.task.findFirst({
      where: { id, userId: user.id },
    });

    if (!task) {
      return NextResponse.json({ error: "Task not found in records." }, { status: 404 });
    }

    // Fresh user snapshot
    const freshUser = await prisma.user.findUnique({
      where: { id: user.id },
    });

    if (!freshUser) {
      return NextResponse.json({ error: "Adventurer record missing." }, { status: 404 });
    }

    let updatedHp = freshUser.hp;
    let updatedXp = freshUser.xp;
    let updatedGold = freshUser.gold;
    let updatedMp = freshUser.mp;
    let fainted = false;
    let message = "";
    let updatedTask = task;
    let dropItem: MysteryDropItem | null = null;
    let isPositiveAction = false;

    // Handle by Task Type
    const isOverdueBounty = task.value <= -5;
    const bountyMult = isOverdueBounty ? 1.5 : 1.0;

    // Check party buffs
    let partyGoldMult = 1.0;
    let partyMpMult = 1.0;
    let partyRaidMult = 1.0;

    const membership = await prisma.partyMember.findUnique({
      where: { userId: user.id },
      include: { party: true },
    });

    if (membership && membership.party?.activeBuffs) {
      const { parsePartyBuffs } = await import("@/lib/partyBuffs");
      const buffs = parsePartyBuffs(membership.party.activeBuffs);
      for (const b of buffs) {
        if (b.effectType === "GOLD_FIND") partyGoldMult *= b.multiplier;
        if (b.effectType === "MANA_REGEN") partyMpMult *= b.multiplier;
        if (b.effectType === "RAID_DAMAGE") partyRaidMult *= b.multiplier;
      }
    }

    if (task.type === "HABIT") {
      const habitResult = calculateHabitScore(
        task.value,
        direction,
        task.difficulty,
        freshUser.hp
      );

      if (habitResult.fainted) {
        fainted = true;
        // Faint penalty: lose 1 level worth of progress and 10% gold, reset HP to full
        const newLevel = Math.max(1, freshUser.level - 1);
        const goldLoss = Math.round(freshUser.gold * 0.1);
        updatedHp = freshUser.maxHp;
        updatedGold = Math.max(0, freshUser.gold - goldLoss);
        updatedXp = (newLevel - 1) * 100;
        message = `You fainted from bad habits! Lost ${goldLoss} gold and vital stamina restored to full.`;
      } else {
        const finalXpGain = Math.round(habitResult.xpGain * bountyMult);
        const finalGoldGain = Math.round(habitResult.goldGain * bountyMult * partyGoldMult);
        const finalMpGain = Math.round(habitResult.mpGain * partyMpMult);

        updatedHp = Math.min(freshUser.maxHp, Math.max(0, freshUser.hp + habitResult.hpChange));
        updatedXp = freshUser.xp + finalXpGain;
        updatedGold = freshUser.gold + finalGoldGain;
        updatedMp = Math.min(freshUser.maxMp, freshUser.mp + finalMpGain);
        message = habitResult.message;
        if (isOverdueBounty && direction === "up") {
          message += " 🔥 Overdue Bounty Conquered! +50% Bonus Loot awarded!";
        }
        if (direction === "up") {
          isPositiveAction = true;
        }
      }

      updatedTask = await prisma.task.update({
        where: { id },
        data: {
          value: isOverdueBounty && direction === "up" ? Math.min(0, habitResult.newValue + 2.5) : habitResult.newValue,
          counterUp: direction === "up" ? task.counterUp + 1 : task.counterUp,
          counterDown: direction === "down" ? task.counterDown + 1 : task.counterDown,
        },
      });
    } else if (task.type === "DAILY") {
      const willComplete = !task.completedToday;
      const weight = task.difficulty === "HARD" ? 2 : task.difficulty === "MEDIUM" ? 1.5 : 1;
      const xpGain = Math.round(25 * weight * bountyMult);
      const goldGain = Math.round(8 * weight * bountyMult * partyGoldMult);
      const mpGain = Math.round(3 * weight * partyMpMult);

      if (willComplete) {
        isPositiveAction = true;
        updatedXp = freshUser.xp + xpGain;
        updatedGold = freshUser.gold + goldGain;
        updatedMp = Math.min(freshUser.maxMp, freshUser.mp + mpGain);
        message = `Daily completed! +${xpGain} XP, +${goldGain} Gold, +${mpGain} MP. Streak increased!`;
        if (isOverdueBounty) {
          message += " 🔥 Overdue Bounty Slayed! +50% Bonus Loot awarded!";
        }

        updatedTask = await prisma.task.update({
          where: { id },
          data: {
            completedToday: true,
            streak: task.streak + 1,
            value: isOverdueBounty ? Math.min(0, task.value + 3.0) : task.value + 1.0,
            completedAt: new Date(),
          },
        });
      } else {
        updatedXp = Math.max(0, freshUser.xp - xpGain);
        updatedGold = Math.max(0, freshUser.gold - goldGain);
        message = `Daily unchecked. Reverted rewards.`;

        updatedTask = await prisma.task.update({
          where: { id },
          data: {
            completedToday: false,
            streak: Math.max(0, task.streak - 1),
            completedAt: null,
          },
        });
      }
    } else if (task.type === "TODO") {
      const willComplete = task.status !== "COMPLETED";
      const weight = task.difficulty === "HARD" ? 2 : task.difficulty === "MEDIUM" ? 1.5 : 1;
      const xpGain = Math.round(30 * weight * bountyMult);
      const goldGain = Math.round(12 * weight * bountyMult * partyGoldMult);
      const mpGain = Math.round(5 * weight * partyMpMult);

      if (willComplete) {
        isPositiveAction = true;
        updatedXp = freshUser.xp + xpGain;
        updatedGold = freshUser.gold + goldGain;
        updatedMp = Math.min(freshUser.maxMp, freshUser.mp + mpGain);
        message = `To-Do vanquished! +${xpGain} XP, +${goldGain} Gold, +${mpGain} MP.`;
        if (isOverdueBounty) {
          message += " 🔥 Overdue Bounty Vanquished! +50% Bonus Loot awarded!";
        }

        updatedTask = await prisma.task.update({
          where: { id },
          data: {
            status: "COMPLETED",
            value: isOverdueBounty ? Math.min(0, task.value + 3.0) : task.value + 1.0,
            completedAt: new Date(),
          },
        });
      } else {
        updatedXp = Math.max(0, freshUser.xp - xpGain);
        updatedGold = Math.max(0, freshUser.gold - goldGain);
        message = `To-Do returned to active registry.`;

        updatedTask = await prisma.task.update({
          where: { id },
          data: {
            status: "TODO",
            completedAt: null,
          },
        });
      }
    } else if (task.type === "REWARD") {
      const cost = task.cost || 20;
      if (freshUser.gold < cost) {
        return NextResponse.json(
          { error: `Insufficient gold coins! You need ${cost} Gold, but only possess ${freshUser.gold}.` },
          { status: 400 }
        );
      }

      updatedGold = freshUser.gold - cost;
      message = `Reward claimed! Spent ${cost} Gold for "${task.title}". Well deserved!`;
    }

    // Check for Mystery Loot Drop on positive accomplishments
    if (isPositiveAction) {
      const userStats = await prisma.userStats.findUnique({
        where: { userId: user.id },
      });
      dropItem = calculateTaskDrop(userStats?.dexterity ?? 10);
      if (dropItem) {
        if (dropItem.id === "drop_gold_satchel" && dropItem.value) {
          updatedGold += dropItem.value;
          message += ` Found a ${dropItem.name} (+${dropItem.value} Gold)!`;
        } else if (dropItem.id === "drop_xp_codex" && dropItem.value) {
          updatedXp += dropItem.value;
          message += ` Found a ${dropItem.name} (+${dropItem.value} XP)!`;
        } else if (dropItem.id === "drop_mana_crystal" && dropItem.value) {
          updatedMp = Math.min(freshUser.maxMp, updatedMp + dropItem.value);
          message += ` Found an ${dropItem.name} (+${dropItem.value} MP)!`;
        } else {
          message += ` Discovered: ${dropItem.name}!`;
        }
      }
    }

    // Calculate Chrono-Shards (Seasonal Battle Pass Currency)
    let shardGain = 0;
    if (isPositiveAction) {
      if (task.type === "HABIT") shardGain = 5;
      else if (task.type === "DAILY") shardGain = 10;
      else if (task.type === "TODO") shardGain = 15;
    }
    const updatedShards = (freshUser.chronoShards ?? 0) + shardGain;

    // Check Party Interactions (Boss Damage or Boss Rage)
    let raidResult = null;
    let rageResult = null;

    if (membership && membership.party) {
      if (isPositiveAction) {
        const xpDiff = Math.max(10, updatedXp - freshUser.xp);
        const baseDamage = Math.max(15, Math.floor(xpDiff * 0.6));
        const finalRaidDamage = Math.round(baseDamage * partyRaidMult);
        raidResult = await applyBossDamage(
          membership.partyId,
          finalRaidDamage,
          user.username,
          task.category
        );
        if (raidResult?.shieldBlockedDamage && raidResult.shieldBlockedDamage > 0) {
          message += ` (🔮 Maya Shield absorbed ${raidResult.shieldBlockedDamage} DMG!)`;
        }
        if (raidResult?.bossDefeated) {
          message += ` ⚔️ Guild Victory! The raid boss was conquered!`;
        }

        // Narrative Quest Progress hook
        if (membership.party.activeQuest) {
          try {
            const { applyQuestProgress } = await import("@/lib/questEngine");
            const currentQuestState = JSON.parse(membership.party.activeQuest);
            if (!currentQuestState.isCompleted) {
              const qResult = applyQuestProgress(currentQuestState, {
                type: "TASK_COMPLETED",
                category: task.category,
                amount: finalRaidDamage,
                username: user.username,
              });
              if (qResult.message) {
                await prisma.party.update({
                  where: { id: membership.partyId },
                  data: { activeQuest: JSON.stringify(qResult.updatedState) },
                });
                message += ` 📜 ${qResult.message}`;
              }
            }
          } catch (e) {
            console.error("Narrative quest progress error:", e);
          }
        }
      } else if (direction === "down") {
        rageResult = await applyBossRage(membership.partyId, 15);
        if (rageResult?.rageStrike) {
          message += ` ⚠️ BOSS RETALIATION! The boss unleashed a 100% Rage Strike for -${rageResult.strikeDamage} HP across the party!`;
          updatedHp = Math.max(1, updatedHp - rageResult.strikeDamage);
        }
      }
    }


    // Check level progression
    const levelCalc = calculateLevelFromTotalXp(updatedXp);
    const didLevelUp = levelCalc.level > freshUser.level;
    const finalLevel = levelCalc.level;

    // Save updated user stats
    const savedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        hp: updatedHp,
        xp: updatedXp,
        gold: updatedGold,
        mp: updatedMp,
        level: finalLevel,
        chronoShards: updatedShards,
      },
    });

    // Record activity log
    await prisma.activityLog.create({
      data: {
        userId: user.id,
        actionType: dropItem ? "LOOT_DISCOVERED" : task.type === "REWARD" ? "REWARD_PURCHASED" : "TASK_SCORED",
        message,
        xpChange: updatedXp - freshUser.xp,
        goldChange: updatedGold - freshUser.gold,
      },
    });

    return NextResponse.json({
      success: true,
      message,
      task: updatedTask,
      user: {
        id: savedUser.id,
        hp: savedUser.hp,
        maxHp: savedUser.maxHp,
        mp: savedUser.mp,
        maxMp: savedUser.maxMp,
        xp: savedUser.xp,
        gold: savedUser.gold,
        level: savedUser.level,
        isSleeping: savedUser.isSleeping,
        chronoShards: savedUser.chronoShards,
      },
      didLevelUp,
      fainted,
      dropItem,
      shardGain,
      raidResult,
      rageResult,
    });
  } catch (error) {
    console.error("Task score error:", error);
    return NextResponse.json(
      { error: "Failed to score task. Magic fluctuations in the guild." },
      { status: 500 }
    );
  }
}
