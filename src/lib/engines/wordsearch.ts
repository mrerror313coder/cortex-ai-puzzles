import { WordSearchPuzzle, DifficultyLevel, WordSearchWord, HintResponse } from "../types";

export class WordSearchEngine {
  private static readonly DIRECTIONS: [number, number][] = [
    [0, 1],   // Right
    [0, -1],  // Left
    [1, 0],   // Down
    [-1, 0],  // Up
    [1, 1],   // Down-Right
    [-1, -1], // Up-Left
    [1, -1],  // Down-Left
    [-1, 1],  // Up-Right
  ];

  // Letter frequency distribution for authentic filler letters
  private static readonly FREQ_LETTERS = "EEEEEEEAAAAAAARRRRRIIIIIOOOOOTTTTTNNNNNSSSSSLLLLCCCCUUUUDDDDPPMMHHGGBFFYYWWKVXZJQ";

  private static getRandomLetter(): string {
    return this.FREQ_LETTERS[Math.floor(Math.random() * this.FREQ_LETTERS.length)];
  }

  // Attempt to place a single word into the 2D grid
  private static placeWord(
    grid: string[][],
    word: string,
    gridSize: number,
    allowedDirections: [number, number][]
  ): { placed: boolean; start?: [number, number]; end?: [number, number] } {
    const cleanWord = word.toUpperCase().replace(/[^A-Z]/g, "");
    if (cleanWord.length === 0 || cleanWord.length > gridSize) return { placed: false };

    // Try multiple random attempts
    const attempts = 150;
    const shuffledDirs = [...allowedDirections].sort(() => Math.random() - 0.5);

    for (let i = 0; i < attempts; i++) {
      const dir = shuffledDirs[Math.floor(Math.random() * shuffledDirs.length)];
      const [dr, dc] = dir;

      // Determine valid start range
      const minRow = dr === -1 ? cleanWord.length - 1 : 0;
      const maxRow = dr === 1 ? gridSize - cleanWord.length : gridSize - 1;
      const minCol = dc === -1 ? cleanWord.length - 1 : 0;
      const maxCol = dc === 1 ? gridSize - cleanWord.length : gridSize - 1;

      if (minRow > maxRow || minCol > maxCol) continue;

      const r = Math.floor(Math.random() * (maxRow - minRow + 1)) + minRow;
      const c = Math.floor(Math.random() * (maxCol - minCol + 1)) + minCol;

      // Check if fit is possible
      let canPlace = true;
      for (let charIdx = 0; charIdx < cleanWord.length; charIdx++) {
        const currR = r + charIdx * dr;
        const currC = c + charIdx * dc;
        const existingChar = grid[currR][currC];
        if (existingChar !== "" && existingChar !== cleanWord[charIdx]) {
          canPlace = false;
          break;
        }
      }

      if (canPlace) {
        // Place word
        for (let charIdx = 0; charIdx < cleanWord.length; charIdx++) {
          grid[r + charIdx * dr][c + charIdx * dc] = cleanWord[charIdx];
        }
        const endR = r + (cleanWord.length - 1) * dr;
        const endC = c + (cleanWord.length - 1) * dc;
        return { placed: true, start: [r, c], end: [endR, endC] };
      }
    }

    return { placed: false };
  }

  // Generate a complete Word Search Puzzle
  static generatePuzzle(
    wordsList: string[],
    theme: string = "AI & Technology",
    difficulty: DifficultyLevel = "medium",
    title = "Word Search"
  ): WordSearchPuzzle {
    let gridSize = 12;
    let allowedDirs = this.DIRECTIONS;

    if (difficulty === "easy") {
      gridSize = 10;
      // Only horizontal right, vertical down, diagonal down-right
      allowedDirs = [[0, 1], [1, 0], [1, 1]];
    } else if (difficulty === "hard") {
      gridSize = 14;
      allowedDirs = this.DIRECTIONS;
    } else if (difficulty === "expert") {
      gridSize = 16;
      allowedDirs = this.DIRECTIONS;
    }

    // Initialize empty grid
    const grid: string[][] = Array.from({ length: gridSize }, () =>
      Array(gridSize).fill("")
    );

    const placedWords: WordSearchWord[] = [];
    const colors = [
      "#8b5cf6", "#06b6d4", "#10b981", "#f59e0b",
      "#f43f5e", "#ec4899", "#3b82f6", "#14b8a6",
      "#a855f7", "#eab308"
    ];

    // Sort words by length descending for better packing
    const sortedWords = [...wordsList].sort((a, b) => b.length - a.length);

    let colorIdx = 0;
    for (const rawWord of sortedWords) {
      const placement = this.placeWord(grid, rawWord, gridSize, allowedDirs);
      if (placement.placed) {
        placedWords.push({
          word: rawWord.toUpperCase(),
          found: false,
          start: placement.start,
          end: placement.end,
          color: colors[colorIdx % colors.length],
        });
        colorIdx++;
      }
    }

    // Fill remaining empty cells with random letters
    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        if (grid[r][c] === "") {
          grid[r][c] = this.getRandomLetter();
        }
      }
    }

    return {
      id: `wordsearch-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      title: `${theme} Word Search`,
      theme,
      difficulty,
      gridSize,
      grid,
      words: placedWords,
      createdAt: new Date().toISOString(),
    };
  }

  // Pedagogical 3-tier smart hint
  static getSmartHint(
    puzzle: WordSearchPuzzle,
    level: 1 | 2 | 3
  ): HintResponse {
    const unFoundWords = puzzle.words.filter((w) => !w.found && w.start);
    if (unFoundWords.length === 0) {
      return {
        level: 1,
        title: "All Words Found",
        nudge: "You have found all target words! Fantastic job.",
      };
    }

    // Pick first unfound word
    const target = unFoundWords[0];
    const [startR, startC] = target.start!;
    const [endR, endC] = target.end!;

    const quadrant =
      startR < puzzle.gridSize / 2
        ? startC < puzzle.gridSize / 2
          ? "Top-Left"
          : "Top-Right"
        : startC < puzzle.gridSize / 2
        ? "Bottom-Left"
        : "Bottom-Right";

    if (level === 1) {
      return {
        level: 1,
        title: `Hint for "${target.word}"`,
        nudge: `Look around the ${quadrant} quadrant of the grid. The first letter "${target.word[0]}" is located there.`,
      };
    } else if (level === 2) {
      return {
        level: 2,
        title: `Starting Letter Located`,
        nudge: `"${target.word}" begins at Row ${startR + 1}, Column ${startC + 1}.`,
        details: `Scan in 8 directions from this starting coordinate to spot the full word.`,
        targetAction: {
          row: startR,
          col: startC,
          highlightCells: [[startR, startC]],
        },
      };
    } else {
      // Level 3 reveals coordinate path
      const dr = Math.sign(endR - startR);
      const dc = Math.sign(endC - startC);
      const path: [number, number][] = [];
      let curR = startR;
      let curC = startC;
      for (let i = 0; i < target.word.length; i++) {
        path.push([curR, curC]);
        curR += dr;
        curC += dc;
      }

      return {
        level: 3,
        title: `Full Solution Path`,
        nudge: `"${target.word}" spans from (${startR + 1}, ${startC + 1}) to (${endR + 1}, ${endC + 1}).`,
        details: `Trace along this line to claim the word!`,
        targetAction: {
          row: startR,
          col: startC,
          highlightCells: path,
        },
      };
    }
  }
}
