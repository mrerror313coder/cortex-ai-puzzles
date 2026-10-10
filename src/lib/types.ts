export type PuzzleType = "sudoku" | "crossword" | "wordsearch" | "jigsaw";

export type DifficultyLevel = "easy" | "medium" | "hard" | "expert";

export interface UserStats {
  eloRating: number;
  streakDays: number;
  lastPlayedDate: string;
  totalPuzzlesSolved: number;
  puzzlesSolvedByType: Record<PuzzleType, number>;
  bestTimesByType: Record<PuzzleType, number>; // in seconds
  sparks: number; // Virtual AI tokens
  unlockedAchievements: string[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
}

// ----------------- SUDOKU -----------------
export interface SudokuPuzzle {
  id: string;
  title: string;
  difficulty: DifficultyLevel;
  initialGrid: number[][]; // 9x9, 0 represents empty
  solutionGrid: number[][]; // 9x9 complete
  createdAt: string;
}

// ----------------- CROSSWORD -----------------
export interface CrosswordClue {
  number: number;
  direction: "across" | "down";
  clue: string;
  answer: string;
  row: number;
  col: number;
}

export interface CrosswordCell {
  row: number;
  col: number;
  letter: string; // The correct answer character
  number?: number; // Clue label if starting cell
  isBlocked: boolean; // Black cell
}

export interface CrosswordPuzzle {
  id: string;
  title: string;
  theme: string;
  difficulty: DifficultyLevel;
  rows: number;
  cols: number;
  grid: CrosswordCell[][];
  clues: {
    across: CrosswordClue[];
    down: CrosswordClue[];
  };
  createdAt: string;
}

// ----------------- WORD SEARCH -----------------
export interface WordSearchWord {
  word: string;
  found: boolean;
  start?: [number, number];
  end?: [number, number];
  color?: string;
}

export interface WordSearchPuzzle {
  id: string;
  title: string;
  theme: string;
  difficulty: DifficultyLevel;
  gridSize: number;
  grid: string[][]; // 2D character matrix
  words: WordSearchWord[];
  createdAt: string;
}

// ----------------- JIGSAW -----------------
export interface JigsawPiece {
  id: number;
  row: number;
  col: number;
  currentX: number;
  currentY: number;
  targetX: number;
  targetY: number;
  width: number;
  height: number;
  isPlaced: boolean;
  // Edge shapes: 0 = flat edge, 1 = tab (outward), -1 = blank (inward hole)
  topTab: number;
  rightTab: number;
  bottomTab: number;
  leftTab: number;
}

export interface JigsawPuzzle {
  id: string;
  title: string;
  theme: string;
  difficulty: DifficultyLevel;
  imageUrl: string;
  rows: number;
  cols: number;
  pieceCount: number;
  createdAt: string;
}

// ----------------- HINTS -----------------
export type HintLevel = 1 | 2 | 3;

export interface HintRequest {
  puzzleType: PuzzleType;
  difficulty: DifficultyLevel;
  boardState: any;
  targetCell?: { row: number; col: number };
  level: HintLevel;
}

export interface HintResponse {
  level: HintLevel;
  title: string;
  nudge: string;
  details?: string;
  targetAction?: {
    row?: number;
    col?: number;
    suggestedValue?: any;
    highlightCells?: [number, number][];
  };
}
