/**
 * Karmaraj Guild Community Challenges & Bounties
 * Community habit/task challenges with pooled gold prizes,
 * automated task cloning to user registries, and completion badges.
 */

export interface ChallengeTaskTemplate {
  title: string;
  type: "HABIT" | "DAILY" | "TODO";
  category: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  repeatDays?: string;
  description?: string;
}

export interface DefaultChallengeDef {
  id: string;
  name: string;
  description: string;
  category: string;
  prizePool: number;
  tasks: ChallengeTaskTemplate[];
}

export const SEED_CHALLENGES: DefaultChallengeDef[] = [
  {
    id: "challenge_digital_detox",
    name: "30-Day Digital Detox & Clarity",
    description:
      "Tame the dopamine goblins. Replace evening blue light with restorative slumber and scholarly reading.",
    category: "SANITY",
    prizePool: 350,
    tasks: [
      {
        title: "No Screens 1 Hour Before Slumber",
        type: "DAILY",
        category: "SANITY",
        difficulty: "MEDIUM",
        repeatDays: "0,1,2,3,4,5,6",
        description: "Seal all screens away to let melatonin restore brain sanity.",
      },
      {
        title: "Read 15 Pages of Physical Book or Tome",
        type: "DAILY",
        category: "INTELLECT",
        difficulty: "EASY",
        repeatDays: "0,1,2,3,4,5,6",
        description: "Absorb analog wisdom under warm light.",
      },
      {
        title: "Resist Social Doomscroll Impulse",
        type: "HABIT",
        category: "SANITY",
        difficulty: "EASY",
        description: "Strike down impulsive screen checks during idle moments.",
      },
    ],
  },
  {
    id: "challenge_iron_sinew",
    name: "Iron Sinew Physical Protocol",
    description:
      "Transform body into unbreakable armor through morning expeditions, hydration, and bodyweight drills.",
    category: "VITALITY",
    prizePool: 400,
    tasks: [
      {
        title: "Morning Hydration (1L Cold Spring Water)",
        type: "DAILY",
        category: "VITALITY",
        difficulty: "EASY",
        repeatDays: "0,1,2,3,4,5,6",
        description: "Awaken digestive fire immediately after rising.",
      },
      {
        title: "50 Pushups / Pullups / Squats Drill",
        type: "DAILY",
        category: "STRENGTH",
        difficulty: "HARD",
        repeatDays: "1,2,3,4,5",
        description: "Fortify muscle fibers against kingdom threats.",
      },
      {
        title: "Take The Physical Stairs Everywhere",
        type: "HABIT",
        category: "STRENGTH",
        difficulty: "EASY",
        description: "Build endurance on every staircase encounter.",
      },
    ],
  },
  {
    id: "challenge_code_mastery",
    name: "Grand Archmage Deep Work Protocol",
    description:
      "Channel undistracted cognitive mana into technical excellence, algorithmic mastery, and clean codebases.",
    category: "INTELLECT",
    prizePool: 500,
    tasks: [
      {
        title: "2 Hours Unbroken Deep Work Block",
        type: "DAILY",
        category: "INTELLECT",
        difficulty: "HARD",
        repeatDays: "1,2,3,4,5",
        description: "Zero notifications, zero tab distraction. Pure creation.",
      },
      {
        title: "Review Architecture or Learn New Concept",
        type: "DAILY",
        category: "INTELLECT",
        difficulty: "MEDIUM",
        repeatDays: "1,2,3,4,5",
        description: "Deepen understanding of systems and patterns.",
      },
      {
        title: "Document Key Decisions in Repository",
        type: "TODO",
        category: "INTELLECT",
        difficulty: "EASY",
        description: "Maintain transparent architectural records for allies.",
      },
    ],
  },
  {
    id: "challenge_dawn_patrol",
    name: "Dawn Patrol: Master the Morning",
    description:
      "Win the morning before the kingdom awakens. Reclaim peak focus hours and organize your battlefield.",
    category: "DEXTERITY",
    prizePool: 300,
    tasks: [
      {
        title: "Greet the Dawn (Awake by 6:30 AM)",
        type: "DAILY",
        category: "VITALITY",
        difficulty: "MEDIUM",
        repeatDays: "0,1,2,3,4,5,6",
        description: "Rise with the sun without hitting snooze runes.",
      },
      {
        title: "Clear & Polish the Battle Station",
        type: "DAILY",
        category: "DEXTERITY",
        difficulty: "EASY",
        repeatDays: "0,1,2,3,4,5,6",
        description: "Clean desk surface and organize tools before commencing tasks.",
      },
    ],
  },
  {
    id: "challenge_deep_focus_gauntlet",
    name: "The 100-Hour Deep Focus Gauntlet",
    description:
      "Vanquish the distractors. Complete strict Pomodoro intervals with locked tabs and zero communication ping interruptions.",
    category: "INTELLECT",
    prizePool: 650,
    tasks: [
      {
        title: "3x 45-Minute Pure Deep Work Blocks",
        type: "DAILY",
        category: "INTELLECT",
        difficulty: "HARD",
        repeatDays: "1,2,3,4,5",
        description: "Intense uninterrupted flow states on primary project goals.",
      },
      {
        title: "Seal Off Extraneous Browser Tabs & Feeds",
        type: "HABIT",
        category: "SANITY",
        difficulty: "EASY",
        description: "Prune distracting open tabs and close notification gateways.",
      },
      {
        title: "Evening Progress & Code Architecture Log",
        type: "DAILY",
        category: "INTELLECT",
        difficulty: "MEDIUM",
        repeatDays: "1,2,3,4,5",
        description: "Document daily breakthroughs before retiring to the tavern.",
      },
    ],
  },
  {
    id: "challenge_spartan_vanguard",
    name: "Spartan Vanguard: 10,000 Paces",
    description:
      "A physical warrior discipline: forge endurance through daily long-distance foot expeditions and cold therapy.",
    category: "VITALITY",
    prizePool: 550,
    tasks: [
      {
        title: "Trek 10,000 Paces Across the Realm",
        type: "DAILY",
        category: "VITALITY",
        difficulty: "MEDIUM",
        repeatDays: "0,1,2,3,4,5,6",
        description: "Cardiovascular endurance on outdoor roads or kingdom treadmill.",
      },
      {
        title: "3-Minute Cold Recovery Shower",
        type: "DAILY",
        category: "VITALITY",
        difficulty: "HARD",
        repeatDays: "0,1,2,3,4,5,6",
        description: "Shock nervous system with ice water to accelerate regeneration.",
      },
      {
        title: "Reject Processed Sugar & Sweetened Drinks",
        type: "HABIT",
        category: "VITALITY",
        difficulty: "EASY",
        description: "Drink pure mountain spring water instead of sugary potions.",
      },
    ],
  },
  {
    id: "challenge_shadow_monk",
    name: "Shadow Monk: Dopamine Asceticism",
    description:
      "Cleanse mental fog by silencing noise, meditating in solitude, and exercising stoic emotional mastery.",
    category: "SANITY",
    prizePool: 600,
    tasks: [
      {
        title: "20 Minutes Silent Meditation & Breathwork",
        type: "DAILY",
        category: "SANITY",
        difficulty: "MEDIUM",
        repeatDays: "0,1,2,3,4,5,6",
        description: "Calm the inner whirlwind through box breathing drills.",
      },
      {
        title: "Zero Sensational News or Outrage Feeds",
        type: "DAILY",
        category: "SANITY",
        difficulty: "EASY",
        repeatDays: "0,1,2,3,4,5,6",
        description: "Shield consciousness from manufactured chaos.",
      },
      {
        title: "3 Deep Breaths Before Answering Urgency",
        type: "HABIT",
        category: "SANITY",
        difficulty: "EASY",
        description: "Pause between trigger and reaction to preserve inner serenity.",
      },
    ],
  },
  {
    id: "challenge_guild_artisan",
    name: "Guild Artisan: Master Builder Protocol",
    description:
      "Craft tangible value every single day. Code, write, design, and ship heroic artifacts into the kingdom registry.",
    category: "DEXTERITY",
    prizePool: 500,
    tasks: [
      {
        title: "Ship 1 Clean Code Commit or Design Asset",
        type: "DAILY",
        category: "DEXTERITY",
        difficulty: "HARD",
        repeatDays: "1,2,3,4,5",
        description: "Deploy verifiable progress into the repository.",
      },
      {
        title: "Document 1 Complex Bug or Insight",
        type: "TODO",
        category: "INTELLECT",
        difficulty: "MEDIUM",
        description: "Capture technical solutions for guild memory archives.",
      },
      {
        title: "Maintain Upright Spine & Ergonomic Stance",
        type: "HABIT",
        category: "VITALITY",
        difficulty: "EASY",
        description: "Adjust posture and keyboard angle regularly during work.",
      },
    ],
  },
];
