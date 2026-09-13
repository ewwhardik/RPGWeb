import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

interface LeaderboardEntry {
  rank: number;
  id: string;
  username: string;
  title: string;
  avatar: string;
  characterClass: string;
  level: number;
  xp: number;
  streakCount: number;
  tasksCompletedCount: number;
  prestigeLevel: number;
  isCurrentUser: boolean;
}

// Canonical legendary adventurers to maintain a lively competitive guild hall
const CANONICAL_CHAMPIONS = [
  {
    id: "champ-arjuna",
    username: "Arjuna_Focus",
    title: "Unwavering Archer",
    avatar: "warrior",
    characterClass: "WARRIOR",
    level: 32,
    xp: 48500,
    streakCount: 68,
    tasksCompletedCount: 420,
    prestigeLevel: 3,
  },
  {
    id: "champ-yudhishthira",
    username: "Dharma_Ruler",
    title: "The Truthspeaker",
    avatar: "paladin",
    characterClass: "PALADIN",
    level: 29,
    xp: 41200,
    streakCount: 54,
    tasksCompletedCount: 388,
    prestigeLevel: 2,
  },
  {
    id: "champ-kavacha",
    username: "Karna_Generous",
    title: "Sunborn Titan",
    avatar: "paladin",
    characterClass: "PALADIN",
    level: 27,
    xp: 38900,
    streakCount: 49,
    tasksCompletedCount: 350,
    prestigeLevel: 2,
  },
  {
    id: "champ-bhima",
    username: "Bhima_Colossus",
    title: "Iron Mace Wielder",
    avatar: "warrior",
    characterClass: "WARRIOR",
    level: 25,
    xp: 32400,
    streakCount: 42,
    tasksCompletedCount: 310,
    prestigeLevel: 1,
  },
  {
    id: "champ-vidura",
    username: "Vidura_Neeti",
    title: "Prime Counsellor",
    avatar: "mage",
    characterClass: "MAGE",
    level: 24,
    xp: 30100,
    streakCount: 38,
    tasksCompletedCount: 295,
    prestigeLevel: 1,
  },
  {
    id: "champ-sahadeva",
    username: "Sahadeva_Astro",
    title: "Cosmic Seer",
    avatar: "mage",
    characterClass: "MAGE",
    level: 22,
    xp: 26800,
    streakCount: 31,
    tasksCompletedCount: 240,
    prestigeLevel: 1,
  },
  {
    id: "champ-nakula",
    username: "Nakula_Swordsman",
    title: "Twin Cavalier",
    avatar: "rogue",
    characterClass: "ROGUE",
    level: 20,
    xp: 22500,
    streakCount: 25,
    tasksCompletedCount: 215,
    prestigeLevel: 0,
  },
  {
    id: "champ-drona",
    username: "Guru_Drona",
    title: "Grandmaster of Arms",
    avatar: "warrior",
    characterClass: "WARRIOR",
    level: 19,
    xp: 20500,
    streakCount: 22,
    tasksCompletedCount: 190,
    prestigeLevel: 0,
  },
];

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category") || "streak"; // "streak" | "xp" | "tasks"

    const currentUser = await getCurrentUser();

    // Fetch real users from database
    const dbUsers = await prisma.user.findMany({
      take: 60,
      select: {
        id: true,
        username: true,
        title: true,
        avatar: true,
        characterClass: true,
        level: true,
        xp: true,
        streakCount: true,
        prestigeLevel: true,
        _count: {
          select: {
            tasks: {
              where: { status: "COMPLETED" },
            },
          },
        },
      },
    });

    // Map DB users to leaderboard entries
    const existingUsernames = new Set(dbUsers.map((u) => u.username.toLowerCase()));
    
    const dbEntries = dbUsers.map((u) => ({
      id: u.id,
      username: u.username,
      title: u.title || "Novice Procrastinator",
      avatar: u.avatar || "warrior",
      characterClass: u.characterClass || "WARRIOR",
      level: u.level || 1,
      xp: u.xp || 0,
      streakCount: u.streakCount || 1,
      tasksCompletedCount: u._count?.tasks || 0,
      prestigeLevel: u.prestigeLevel || 0,
      isCurrentUser: currentUser ? u.id === currentUser.id : false,
    }));

    // Add canonical champions that don't collide with existing usernames
    const championsToAdd = CANONICAL_CHAMPIONS.filter(
      (c) => !existingUsernames.has(c.username.toLowerCase())
    ).map((c) => ({
      ...c,
      isCurrentUser: false,
    }));

    const combinedList = [...dbEntries, ...championsToAdd];

    // Sorting algorithm based on active category
    if (category === "streak") {
      // The Consistent: sort by streakCount DESC, then level DESC, then xp DESC
      combinedList.sort((a, b) => {
        if (b.streakCount !== a.streakCount) return b.streakCount - a.streakCount;
        if (b.level !== a.level) return b.level - a.level;
        return b.xp - a.xp;
      });
    } else if (category === "tasks") {
      // Quest Masters: sort by completed tasks count DESC
      combinedList.sort((a, b) => {
        if (b.tasksCompletedCount !== a.tasksCompletedCount) {
          return b.tasksCompletedCount - a.tasksCompletedCount;
        }
        if (b.streakCount !== a.streakCount) return b.streakCount - a.streakCount;
        return b.xp - a.xp;
      });
    } else {
      // Wisdom & Karma: sort by prestige DESC, level DESC, xp DESC
      combinedList.sort((a, b) => {
        if (b.prestigeLevel !== a.prestigeLevel) return b.prestigeLevel - a.prestigeLevel;
        if (b.level !== a.level) return b.level - a.level;
        return b.xp - a.xp;
      });
    }

    // Assign final rank numbers (1-indexed)
    const rankedList: LeaderboardEntry[] = combinedList.map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }));

    const currentUserEntry = rankedList.find((e) => e.isCurrentUser);

    return NextResponse.json({
      success: true,
      category,
      totalContenders: rankedList.length,
      currentUserRank: currentUserEntry ? currentUserEntry.rank : null,
      currentUserStats: currentUserEntry || null,
      leaderboard: rankedList.slice(0, 50),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Leaderboard error:", error);
    return NextResponse.json(
      { error: "Failed to consult the Hall of Masters scroll." },
      { status: 500 }
    );
  }
}
