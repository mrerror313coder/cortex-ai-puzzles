import { DifficultyLevel, UserStats } from "../types";

export interface AdaptiveRecommendation {
  recommendedDifficulty: DifficultyLevel;
  suggestedPuzzleType: "sudoku" | "crossword" | "wordsearch" | "jigsaw";
  reason: string;
  eloChange: number;
}

export class AdaptiveDifficultyEngine {
  // Calculate player's updated ELO based on performance
  static calculateElo(
    currentElo: number,
    difficulty: DifficultyLevel,
    timeSpentSeconds: number,
    hintsUsed: number,
    isWin: boolean
  ): { newElo: number; delta: number } {
    if (!isWin) {
      const delta = -Math.min(25, Math.max(5, Math.floor(currentElo * 0.02)));
      return { newElo: Math.max(400, currentElo + delta), delta };
    }

    // Benchmark times per difficulty in seconds
    const benchmarkTimes: Record<DifficultyLevel, number> = {
      easy: 180,
      medium: 360,
      hard: 600,
      expert: 900,
    };

    const benchmark = benchmarkTimes[difficulty];
    let baseGain = 20;
    if (difficulty === "easy") baseGain = 15;
    if (difficulty === "medium") baseGain = 25;
    if (difficulty === "hard") baseGain = 40;
    if (difficulty === "expert") baseGain = 60;

    // Time efficiency multiplier
    const speedRatio = Math.max(0.5, Math.min(2.0, benchmark / Math.max(30, timeSpentSeconds)));
    // Hint penalty: each hint reduces gain by 15%
    const hintPenalty = Math.max(0.4, 1.0 - hintsUsed * 0.15);

    const delta = Math.round(baseGain * speedRatio * hintPenalty);
    return { newElo: currentElo + delta, delta };
  }

  // Suggest next puzzle parameters based on player track record
  static evaluateNextChallenge(stats: UserStats): AdaptiveRecommendation {
    const elo = stats.eloRating;
    let recommendedDifficulty: DifficultyLevel = "medium";

    if (elo < 800) {
      recommendedDifficulty = "easy";
    } else if (elo >= 800 && elo < 1300) {
      recommendedDifficulty = "medium";
    } else if (elo >= 1300 && elo < 1800) {
      recommendedDifficulty = "hard";
    } else {
      recommendedDifficulty = "expert";
    }

    // Recommend least played puzzle type to balance skill
    const types: ("sudoku" | "crossword" | "wordsearch" | "jigsaw")[] = [
      "sudoku",
      "crossword",
      "wordsearch",
      "jigsaw",
    ];
    let minSolved = Infinity;
    let leastPlayed = types[0];

    for (const t of types) {
      const count = stats.puzzlesSolvedByType[t] || 0;
      if (count < minSolved) {
        minSolved = count;
        leastPlayed = t;
      }
    }

    return {
      recommendedDifficulty,
      suggestedPuzzleType: leastPlayed,
      reason: `Based on your current ELO rating (${elo}) and play diversity, we calibrated your optimal challenge level to ${recommendedDifficulty.toUpperCase()}.`,
      eloChange: 0,
    };
  }
}
