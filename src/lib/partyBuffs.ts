/**
 * Karmaraj Synergistic Guild Buffs & Team Spells
 * Party-wide 24-hour buffs cast by Warriors, Mages, Rogues, and Paladins.
 */

export interface PartyBuff {
  id: string;
  name: string;
  casterName: string;
  icon: string;
  effectType: "RAID_DAMAGE" | "DAMAGE_REDUCTION" | "GOLD_FIND" | "MANA_REGEN";
  multiplier: number;
  expiresAt: string;
  description: string;
}

export function parsePartyBuffs(activeBuffsJson: string | null | undefined): PartyBuff[] {
  if (!activeBuffsJson) return [];
  try {
    const raw = JSON.parse(activeBuffsJson);
    if (!Array.isArray(raw)) return [];
    const now = new Date().getTime();
    // Return only unexpired buffs
    return raw.filter((b: PartyBuff) => new Date(b.expiresAt).getTime() > now);
  } catch {
    return [];
  }
}

export function addPartyBuff(
  currentBuffsJson: string | null | undefined,
  newBuff: PartyBuff
): string {
  const currentBuffs = parsePartyBuffs(currentBuffsJson);
  // Replace same-type buff or append
  const filtered = currentBuffs.filter((b) => b.effectType !== newBuff.effectType);
  filtered.push(newBuff);
  return JSON.stringify(filtered);
}

export const BUFF_TEMPLATES: Record<string, Omit<PartyBuff, "id" | "casterName" | "expiresAt">> = {
  VALOROUS_PRESENCE: {
    name: "Valorous Battle Cry",
    icon: "Megaphone",
    effectType: "RAID_DAMAGE",
    multiplier: 1.25,
    description: "+25% Raid Boss Damage from all party member accomplishments for 24h.",
  },
  ETHEREAL_SURGE: {
    name: "Arcane Leyline Resonance",
    icon: "Sparkles",
    effectType: "MANA_REGEN",
    multiplier: 1.3,
    description: "+30% Mana restored on every task scored across the guild for 24h.",
  },
  TOOLS_OF_TRADE: {
    name: "Thieves' Fortune Aura",
    icon: "Key",
    effectType: "GOLD_FIND",
    multiplier: 1.25,
    description: "+25% Bonus Gold found in all task chests across the party for 24h.",
  },
  PROTECTIVE_AURA: {
    name: "Celestial Aegis",
    icon: "Shield",
    effectType: "DAMAGE_REDUCTION",
    multiplier: 0.5,
    description: "50% Reduction on all boss retaliation and missed daily damage for 24h.",
  },
};
