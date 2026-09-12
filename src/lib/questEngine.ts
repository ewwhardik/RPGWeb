/**
 * Karmaraj Narrative Quest Engine
 * Multi-Stage Narrative Questlines, Collection Quests, and Boss Scrolls.
 * High-tier fantasy quest mechanics with party progression and rare spoils.
 */

export interface QuestReward {
  xp: number;
  gold: number;
  chronoShards?: number;
  items?: string[]; // e.g. ["drop_dragon_egg", "drop_golden_potion"]
}

export interface QuestStage {
  stageIndex: number;
  title: string;
  description: string;
  targetType: "BOSS_DAMAGE" | "TASK_COUNT";
  target: number;
  current: number;
  categoryAffinity?: string[]; // e.g. ["INTELLECT", "VITALITY"]
}

export interface QuestScrollDef {
  id: string;
  title: string;
  subtitle: string;
  narrativeStory: string;
  questType: "COLLECTION" | "EPISODIC_BOSS" | "BOSS";
  difficulty: "EASY" | "MEDIUM" | "HARD" | "MYTHIC";
  icon: string;
  bannerGradient: string;
  stages: QuestStage[];
  rewards: QuestReward;
}

export interface ActiveQuestState {
  questId: string;
  currentStageIndex: number;
  progress: number;
  target: number;
  isCompleted: boolean;
  claimedBy: string[]; // User IDs who already claimed spoils
  startedAt: string;
  recentActivity: Array<{
    username: string;
    action: string;
    timestamp: string;
  }>;
}

export const QUEST_SCROLL_LIBRARY: Record<string, QuestScrollDef> = {
  starlight_pilgrimage: {
    id: "starlight_pilgrimage",
    title: "The Starlight Pilgrimage",
    subtitle: "Sacred Collection Quest",
    narrativeStory:
      "Ancient cosmic dust from the Jagannath constellation shattered into celestial fragments. Reclaim the 12 Starlight Shards through focused Intellect and Vitality to rekindle the cosmic altar.",
    questType: "COLLECTION",
    difficulty: "EASY",
    icon: "✨",
    bannerGradient: "from-sky-950/80 via-blue-900/60 to-slate-950",
    stages: [
      {
        stageIndex: 0,
        title: "Gather the 12 Starlight Shards",
        description: "Complete Intellect or Vitality quests to uncover scattered astral crystals.",
        targetType: "TASK_COUNT",
        target: 12,
        current: 0,
        categoryAffinity: ["INTELLECT", "VITALITY"],
      },
    ],
    rewards: {
      xp: 250,
      gold: 120,
      chronoShards: 35,
      items: ["drop_dragon_egg", "drop_golden_potion"],
    },
  },

  sloth_titan_saga: {
    id: "sloth_titan_saga",
    title: "The Sloth Titan Saga",
    subtitle: "3-Stage Episodic Boss Expedition",
    narrativeStory:
      "A primordial colossus of inertia has awakened beneath the obsidian valleys. Break its chains, shatter the core of procrastination, and banish the Sloth Titan before the realm freezes.",
    questType: "EPISODIC_BOSS",
    difficulty: "HARD",
    icon: "🗿",
    bannerGradient: "from-stone-950 via-amber-950/60 to-zinc-950",
    stages: [
      {
        stageIndex: 0,
        title: "Stage I: Awakening of the Slumbering Golem",
        description: "Strike down the guardian golem (600 Boss HP) with heroic task damage.",
        targetType: "BOSS_DAMAGE",
        target: 600,
        current: 0,
      },
      {
        stageIndex: 1,
        title: "Stage II: Shatter the Procrastination Core",
        description: "Complete 8 disciplined Dailies or To-Dos to sever the colossus's power leylines.",
        targetType: "TASK_COUNT",
        target: 8,
        current: 0,
      },
      {
        stageIndex: 2,
        title: "Stage III: The Sloth Titan's Final Stand",
        description: "Unleash all guild firepower to vanquish the Titan's 1400 HP heart.",
        targetType: "BOSS_DAMAGE",
        target: 1400,
        current: 0,
      },
    ],
    rewards: {
      xp: 600,
      gold: 300,
      chronoShards: 75,
      items: ["drop_dragon_egg", "drop_shadow_potion", "drop_xp_codex"],
    },
  },

  dread_wyrm_lair: {
    id: "dread_wyrm_lair",
    title: "Lair of the Dread Wyrm",
    subtitle: "High-Caliber Raid Quest",
    narrativeStory:
      "The Procrastination Wyrm coils deep within the task catacombs, feeding on deferred duties. Muster the party and purge the serpent once and for all.",
    questType: "BOSS",
    difficulty: "MEDIUM",
    icon: "🐉",
    bannerGradient: "from-red-950/80 via-rose-900/50 to-neutral-950",
    stages: [
      {
        stageIndex: 0,
        title: "Slay the Dread Wyrm",
        description: "Deal 1200 damage by completing daily tasks and habits.",
        targetType: "BOSS_DAMAGE",
        target: 1200,
        current: 0,
      },
    ],
    rewards: {
      xp: 350,
      gold: 180,
      chronoShards: 50,
      items: ["drop_wolf_egg", "drop_moss_potion"],
    },
  },

  zen_ascension: {
    id: "zen_ascension",
    title: "Zen Lotus Ascension",
    subtitle: "Spiritual Harmony Collection",
    narrativeStory:
      "Collect 10 sacred Zen Lotus blossoms by nurturing your Sanity and Dexterity habits. Restores peace to the guild sanctuary.",
    questType: "COLLECTION",
    difficulty: "EASY",
    icon: "🪷",
    bannerGradient: "from-emerald-950/80 via-teal-900/50 to-slate-950",
    stages: [
      {
        stageIndex: 0,
        title: "Gather 10 Zen Lotus Petals",
        description: "Perform Sanity or Dexterity tasks to blossom the celestial lotus.",
        targetType: "TASK_COUNT",
        target: 10,
        current: 0,
        categoryAffinity: ["SANITY", "DEXTERITY"],
      },
    ],
    rewards: {
      xp: 220,
      gold: 100,
      chronoShards: 30,
      items: ["drop_fox_egg", "drop_golden_potion"],
    },
  },

  chrono_vanguard_reliquary: {
    id: "chrono_vanguard_reliquary",
    title: "The Chrono-Vanguard's Lost Reliquary",
    subtitle: "4-Stage Mythic Time-Rift Raid",
    narrativeStory:
      "A temporal distortion has cracked the kingdom hourglass. Battle through four escalating paradox phases to seal the rift and reclaim lost centuries.",
    questType: "EPISODIC_BOSS",
    difficulty: "MYTHIC",
    icon: "⏳",
    bannerGradient: "from-violet-950/90 via-purple-900/40 to-slate-950",
    stages: [
      {
        stageIndex: 0,
        title: "Phase I: Scout the Temporal Breach",
        description: "Complete 6 Dexterity or Vitality tasks to map the rift boundaries.",
        targetType: "TASK_COUNT",
        target: 6,
        current: 0,
        categoryAffinity: ["DEXTERITY", "VITALITY"],
      },
      {
        stageIndex: 1,
        title: "Phase II: Slay the Chrono-Wraith",
        description: "Strike down the wandering temporal specter (800 HP).",
        targetType: "BOSS_DAMAGE",
        target: 800,
        current: 0,
      },
      {
        stageIndex: 2,
        title: "Phase III: Reclaim 8 Chrono-Cores",
        description: "Complete 8 focused Intellect tasks to synthesize the stability matrices.",
        targetType: "TASK_COUNT",
        target: 8,
        current: 0,
        categoryAffinity: ["INTELLECT"],
      },
      {
        stageIndex: 3,
        title: "Phase IV: Banish the Singularity Core",
        description: "Direct all guild firepower to crush the 1800 HP singularity.",
        targetType: "BOSS_DAMAGE",
        target: 1800,
        current: 0,
      },
    ],
    rewards: {
      xp: 850,
      gold: 420,
      chronoShards: 120,
      items: ["drop_dragon_egg", "drop_golden_potion"],
    },
  },

  phoenix_hearth_song: {
    id: "phoenix_hearth_song",
    title: "Song of the Phoenix Hearth",
    subtitle: "Sacred Burnout Cleansing Saga",
    narrativeStory:
      "Deep fatigue plagues the adventurers. Gather 16 radiant solar embers to rekindle the celestial phoenix hearth and banish burnout forever.",
    questType: "COLLECTION",
    difficulty: "MEDIUM",
    icon: "🔥",
    bannerGradient: "from-amber-950/90 via-orange-900/50 to-rose-950",
    stages: [
      {
        stageIndex: 0,
        title: "Gather 16 Solar Embers",
        description: "Nurture Vitality and Sanity tasks to harvest pure restorative fire.",
        targetType: "TASK_COUNT",
        target: 16,
        current: 0,
        categoryAffinity: ["VITALITY", "SANITY"],
      },
    ],
    rewards: {
      xp: 400,
      gold: 200,
      chronoShards: 60,
      items: ["drop_fox_egg", "drop_moss_potion"],
    },
  },
};

/**
 * Initializes a new ActiveQuestState object from a QuestScrollDef.
 */
export function createInitialQuestState(questId: string): ActiveQuestState | null {
  const scroll = QUEST_SCROLL_LIBRARY[questId];
  if (!scroll) return null;

  const firstStage = scroll.stages[0];
  return {
    questId,
    currentStageIndex: 0,
    progress: 0,
    target: firstStage.target,
    isCompleted: false,
    claimedBy: [],
    startedAt: new Date().toISOString(),
    recentActivity: [
      {
        username: "Guild Scribe",
        action: `Unsealed quest scroll: "${scroll.title}".`,
        timestamp: new Date().toISOString(),
      },
    ],
  };
}

/**
 * Evaluates progress event (task completion or boss damage) on active quest.
 */
export function applyQuestProgress(
  state: ActiveQuestState,
  event: {
    type: "TASK_COMPLETED" | "BOSS_DAMAGE";
    category?: string;
    amount?: number;
    username: string;
  }
): { updatedState: ActiveQuestState; stageAdvanced: boolean; questFinished: boolean; message: string } {
  const scroll = QUEST_SCROLL_LIBRARY[state.questId];
  if (!scroll || state.isCompleted) {
    return { updatedState: state, stageAdvanced: false, questFinished: false, message: "" };
  }

  const currentStage = scroll.stages[state.currentStageIndex];
  if (!currentStage) {
    return { updatedState: state, stageAdvanced: false, questFinished: false, message: "" };
  }

  let advanceAmount = 0;

  if (currentStage.targetType === "BOSS_DAMAGE" && event.type === "BOSS_DAMAGE") {
    advanceAmount = Math.max(1, event.amount || 15);
  } else if (currentStage.targetType === "TASK_COUNT" && event.type === "TASK_COMPLETED") {
    if (!currentStage.categoryAffinity || currentStage.categoryAffinity.length === 0) {
      advanceAmount = 1;
    } else if (event.category && currentStage.categoryAffinity.includes(event.category.toUpperCase())) {
      advanceAmount = 1;
    }
  }

  if (advanceAmount <= 0) {
    return { updatedState: state, stageAdvanced: false, questFinished: false, message: "" };
  }

  const newProgress = state.progress + advanceAmount;
  let stageAdvanced = false;
  let questFinished = false;
  let nextStageIndex = state.currentStageIndex;
  let nextTarget = state.target;
  let finalProgress = newProgress;
  let notice = `+${advanceAmount} quest progress from ${event.username}!`;

  if (newProgress >= state.target) {
    // Stage completed!
    if (state.currentStageIndex + 1 < scroll.stages.length) {
      // Advance to next stage
      stageAdvanced = true;
      nextStageIndex = state.currentStageIndex + 1;
      const nextStage = scroll.stages[nextStageIndex];
      nextTarget = nextStage.target;
      finalProgress = 0;
      notice = `🎉 Stage completed! Advanced to Stage ${nextStageIndex + 1}: "${nextStage.title}"!`;
    } else {
      // Entire quest completed!
      questFinished = true;
      finalProgress = state.target;
      notice = `🏆 QUEST CONQUERED! "${scroll.title}" has been completed by the party! Claim your spoils!`;
    }
  }

  const updatedRecentActivity = [
    {
      username: event.username,
      action: notice,
      timestamp: new Date().toISOString(),
    },
    ...state.recentActivity.slice(0, 7),
  ];

  const updatedState: ActiveQuestState = {
    ...state,
    currentStageIndex: nextStageIndex,
    progress: finalProgress,
    target: nextTarget,
    isCompleted: questFinished,
    recentActivity: updatedRecentActivity,
  };

  return {
    updatedState,
    stageAdvanced,
    questFinished,
    message: notice,
  };
}
