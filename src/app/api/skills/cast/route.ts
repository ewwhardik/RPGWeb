import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { CLASS_SKILLS } from "@/lib/taskEngine";
import { calculateLevelFromTotalXp } from "@/lib/rpgEngine";

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized adventurer." }, { status: 401 });
    }

    const body = await req.json();
    const { skillId } = body;

    const skill = CLASS_SKILLS[skillId];
    if (!skill) {
      return NextResponse.json({ error: "Unknown skill spell." }, { status: 400 });
    }

    const freshUser = await prisma.user.findUnique({
      where: { id: user.id },
    });

    if (!freshUser) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    // Check Mana
    if (freshUser.mp < skill.manaCost) {
      return NextResponse.json(
        {
          error: `Insufficient Mana! You need ${skill.manaCost} MP, but only have ${freshUser.mp} MP. Complete tasks to restore Mana.`,
        },
        { status: 400 }
      );
    }

    let hpGain = 0;
    let xpGain = 0;
    let goldGain = 0;
    let mpGain = 0;

    switch (skill.effect) {
      case "SMASH":
        xpGain = 35;
        goldGain = 10;
        break;
      case "DEFENSE":
        hpGain = 15;
        break;
      case "RALLY":
        xpGain = 25;
        goldGain = 20;
        break;
      case "INTIMIDATE":
        xpGain = 20;
        break;
      case "FLAME":
        xpGain = 50;
        break;
      case "SURGE":
        xpGain = 40;
        goldGain = 15;
        break;
      case "SIPHON":
        mpGain = 25;
        xpGain = 15;
        break;
      case "FREEZE":
        xpGain = 30;
        break;
      case "GOLD":
        goldGain = 25;
        break;
      case "CRIT":
        goldGain = 35;
        xpGain = 40;
        break;
      case "PERCEPTION":
        goldGain = 50;
        break;
      case "STEALTH":
        goldGain = 20;
        xpGain = 20;
        break;
      case "HEAL":
        hpGain = 25;
        break;
      case "AURA":
        hpGain = 15;
        xpGain = 30;
        break;
      case "BUFF":
        hpGain = 10;
        xpGain = 30;
        break;
      case "PARTY_HEAL":
        hpGain = 30;
        break;
      default:
        xpGain = 20;
    }

    const newMp = Math.max(0, freshUser.mp - skill.manaCost + mpGain);
    const newHp = Math.min(freshUser.maxHp, freshUser.hp + hpGain);
    const newXp = freshUser.xp + xpGain;
    const newGold = freshUser.gold + goldGain;

    const levelCalc = calculateLevelFromTotalXp(newXp);

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        mp: newMp,
        hp: newHp,
        xp: newXp,
        gold: newGold,
        level: levelCalc.level,
      },
    });

    let actionMessage = `Cast [${skill.name}]: Spent ${skill.manaCost} MP.${
      hpGain > 0 ? ` Restored ${hpGain} HP.` : ""
    }${xpGain > 0 ? ` Gained ${xpGain} XP.` : ""}${goldGain > 0 ? ` Found ${goldGain} Gold.` : ""}`;

    // Apply Guild Synergistic Party Buffs
    let partyBuffNotice = "";
    const membership = await prisma.partyMember.findUnique({
      where: { userId: user.id },
      include: { party: true },
    });

    if (membership && membership.party) {
      let buffKeyToApply: string | null = null;
      if (skill.id === "valorous_presence") buffKeyToApply = "VALOROUS_PRESENCE";
      else if (skill.id === "ethereal_surge") buffKeyToApply = "ETHEREAL_SURGE";
      else if (skill.id === "tools_of_trade") buffKeyToApply = "TOOLS_OF_TRADE";
      else if (skill.id === "protective_aura") buffKeyToApply = "PROTECTIVE_AURA";

      if (buffKeyToApply) {
        const { BUFF_TEMPLATES, addPartyBuff } = await import("@/lib/partyBuffs");
        const template = BUFF_TEMPLATES[buffKeyToApply];
        if (template) {
          const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
          const newBuffJson = addPartyBuff(membership.party.activeBuffs, {
            id: `buff_${Date.now()}`,
            name: template.name,
            casterName: user.username,
            icon: template.icon,
            effectType: template.effectType,
            multiplier: template.multiplier,
            expiresAt,
            description: template.description,
          });

          await prisma.party.update({
            where: { id: membership.party.id },
            data: { activeBuffs: newBuffJson },
          });

          partyBuffNotice = ` 🛡️ Guild Buff Activated: "${template.name}" for all party members (24h)!`;
          actionMessage += partyBuffNotice;
        }
      }
    }


    await prisma.activityLog.create({
      data: {
        userId: user.id,
        actionType: "SKILL_CAST",
        message: actionMessage,
        xpChange: xpGain,
        goldChange: goldGain,
      },
    });

    return NextResponse.json({
      success: true,
      message: actionMessage,
      user: {
        id: updatedUser.id,
        hp: updatedUser.hp,
        maxHp: updatedUser.maxHp,
        mp: updatedUser.mp,
        maxMp: updatedUser.maxMp,
        xp: updatedUser.xp,
        gold: updatedUser.gold,
        level: updatedUser.level,
      },
    });
  } catch (error) {
    console.error("Cast skill error:", error);
    return NextResponse.json(
      { error: "Skill channeling failed due to arcane turbulence." },
      { status: 500 }
    );
  }
}
