import { UserStats, Achievement, PuzzleType } from "./types";

const STATS_STORAGE_KEY = "ai_puzzle_user_stats_v1";

export const INITIAL_USER_STATS: UserStats = {
  eloRating: 1000,
  streakDays: 1,
  lastPlayedDate: new Date().toISOString().split("T")[0],
  totalPuzzlesSolved: 0,
  puzzlesSolvedByType: {
    sudoku: 0,
    crossword: 0,
    wordsearch: 0,
    jigsaw: 0,
  },
  bestTimesByType: {
    sudoku: 0,
    crossword: 0,
    wordsearch: 0,
    jigsaw: 0,
  },
  sparks: 150, // Starter AI sparks
  unlockedAchievements: ["first_login"],
};

export const ACHIEVEMENTS_LIST: Achievement[] = [
  {
    id: "first_login",
    title: "Puzzle Initiate",
    description: "Welcome to the AI Puzzle Universe!",
    icon: "🌟",
    unlocked: true,
  },
  {
    id: "first_solve",
    title: "First Breakthrough",
    description: "Successfully solved your first puzzle.",
    icon: "🏆",
    unlocked: false,
  },
  {
    id: "streak_3",
    title: "Brain on Fire",
    description: "Achieved a 3-day daily challenge streak.",
    icon: "🔥",
    unlocked: false,
  },
  {
    id: "sudoku_master",
    title: "Number Virtuoso",
    description: "Solved a Sudoku puzzle with 0 mistakes.",
    icon: "🔢",
    unlocked: false,
  },
  {
    id: "speed_solver",
    title: "Lightning Logic",
    description: "Completed any puzzle in under 2 minutes.",
    icon: "⚡",
    unlocked: false,
  },
  {
    id: "ai_whisperer",
    title: "Prompt Engineer",
    description: "Generated a custom puzzle with AI prompt.",
    icon: "🤖",
    unlocked: false,
  },
];

export class StorageService {
  static getStats(): UserStats {
    if (typeof window === "undefined") return INITIAL_USER_STATS;
    try {
      const data = localStorage.getItem(STATS_STORAGE_KEY);
      if (!data) return INITIAL_USER_STATS;
      return JSON.parse(data);
    } catch {
      return INITIAL_USER_STATS;
    }
  }

  static saveStats(stats: UserStats): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(stats));
    } catch (e) {
      console.error("Failed to save stats", e);
    }
  }

  static recordSolve(
    puzzleType: PuzzleType,
    timeSpentSeconds: number,
    eloDelta: number
  ): { updatedStats: UserStats; newAchievements: Achievement[] } {
    const stats = this.getStats();
    const today = new Date().toISOString().split("T")[0];

    // Check streak
    let streakDays = stats.streakDays;
    if (stats.lastPlayedDate !== today) {
      const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
      if (stats.lastPlayedDate === yesterday) {
        streakDays += 1;
      } else {
        streakDays = 1;
      }
    }

    const updatedSolved = {
      ...stats.puzzlesSolvedByType,
      [puzzleType]: (stats.puzzlesSolvedByType[puzzleType] || 0) + 1,
    };

    const currentBest = stats.bestTimesByType[puzzleType] || 0;
    const updatedBest = {
      ...stats.bestTimesByType,
      [puzzleType]: currentBest === 0 ? timeSpentSeconds : Math.min(currentBest, timeSpentSeconds),
    };

    const newElo = Math.max(400, stats.eloRating + eloDelta);
    const newSparks = stats.sparks + 25; // Reward sparks for solve

    const newAchievements: Achievement[] = [];
    const unlocked = new Set(stats.unlockedAchievements);

    if (!unlocked.has("first_solve")) {
      unlocked.add("first_solve");
      newAchievements.push(ACHIEVEMENTS_LIST.find((a) => a.id === "first_solve")!);
    }
    if (streakDays >= 3 && !unlocked.has("streak_3")) {
      unlocked.add("streak_3");
      newAchievements.push(ACHIEVEMENTS_LIST.find((a) => a.id === "streak_3")!);
    }
    if (timeSpentSeconds <= 120 && !unlocked.has("speed_solver")) {
      unlocked.add("speed_solver");
      newAchievements.push(ACHIEVEMENTS_LIST.find((a) => a.id === "speed_solver")!);
    }

    const updatedStats: UserStats = {
      ...stats,
      eloRating: newElo,
      streakDays,
      lastPlayedDate: today,
      totalPuzzlesSolved: stats.totalPuzzlesSolved + 1,
      puzzlesSolvedByType: updatedSolved,
      bestTimesByType: updatedBest,
      sparks: newSparks,
      unlockedAchievements: Array.from(unlocked),
    };

    this.saveStats(updatedStats);
    return { updatedStats, newAchievements };
  }

  static spendSparks(amount: number): boolean {
    const stats = this.getStats();
    if (stats.sparks < amount) return false;
    stats.sparks -= amount;
    this.saveStats(stats);
    return true;
  }
}
