import { CrosswordPuzzle, CrosswordCell, CrosswordClue, DifficultyLevel, HintResponse } from "../types";

export interface WordDefinition {
  word: string;
  clue: string;
}

export class CrosswordEngine {
  // Generates a clean interconnected crossword grid
  static generatePuzzle(
    wordPairs: WordDefinition[],
    theme: string = "Technology & Science",
    difficulty: DifficultyLevel = "medium",
    title = "AI Crossword"
  ): CrosswordPuzzle {
    const rows = 11;
    const cols = 11;

    // Initialize blank grid with isBlocked = true
    const grid: CrosswordCell[][] = Array.from({ length: rows }, (_, r) =>
      Array.from({ length: cols }, (_, c) => ({
        row: r,
        col: c,
        letter: "",
        isBlocked: true,
      }))
    );

    const acrossClues: CrosswordClue[] = [];
    const downClues: CrosswordClue[] = [];

    // Filter valid words (length 3 to 10)
    const validWords = wordPairs
      .map((w) => ({
        word: w.word.toUpperCase().replace(/[^A-Z]/g, ""),
        clue: w.clue,
      }))
      .filter((w) => w.word.length >= 3 && w.word.length <= 10);

    // Layout algorithm: place first long word across center
    if (validWords.length > 0) {
      const first = validWords[0];
      const startCol = Math.max(0, Math.floor((cols - first.word.length) / 2));
      const startRow = Math.floor(rows / 2);

      for (let i = 0; i < first.word.length; i++) {
        grid[startRow][startCol + i].letter = first.word[i];
        grid[startRow][startCol + i].isBlocked = false;
      }
      acrossClues.push({
        number: 1,
        direction: "across",
        clue: first.clue,
        answer: first.word,
        row: startRow,
        col: startCol,
      });

      // Try placing other words intersecting existing letters
      let clueNumberCounter = 2;

      for (let wIdx = 1; wIdx < validWords.length; wIdx++) {
        const item = validWords[wIdx];
        let placed = false;

        // Try intersecting with already placed letters
        for (let charPos = 0; charPos < item.word.length; charPos++) {
          if (placed) break;
          const targetChar = item.word[charPos];

          for (let r = 0; r < rows; r++) {
            if (placed) break;
            for (let c = 0; c < cols; c++) {
              if (placed) break;
              if (!grid[r][c].isBlocked && grid[r][c].letter === targetChar) {
                // Test vertical placement through (r, c)
                const startR = r - charPos;
                const endR = startR + item.word.length - 1;

                if (startR >= 0 && endR < rows) {
                  let canPlaceDown = true;
                  // Check adjacent cell collisions
                  for (let step = 0; step < item.word.length; step++) {
                    const curR = startR + step;
                    const curChar = item.word[step];

                    if (!grid[curR][c].isBlocked && grid[curR][c].letter !== curChar) {
                      canPlaceDown = false;
                      break;
                    }

                    // Check horizontal neighbors if this cell is currently blocked
                    if (grid[curR][c].isBlocked) {
                      if (c > 0 && !grid[curR][c - 1].isBlocked) canPlaceDown = false;
                      if (c < cols - 1 && !grid[curR][c + 1].isBlocked) canPlaceDown = false;
                    }
                  }

                  // Check ends
                  if (startR > 0 && !grid[startR - 1][c].isBlocked) canPlaceDown = false;
                  if (endR < rows - 1 && !grid[endR + 1][c].isBlocked) canPlaceDown = false;

                  if (canPlaceDown) {
                    for (let step = 0; step < item.word.length; step++) {
                      grid[startR + step][c].letter = item.word[step];
                      grid[startR + step][c].isBlocked = false;
                    }
                    downClues.push({
                      number: clueNumberCounter++,
                      direction: "down",
                      clue: item.clue,
                      answer: item.word,
                      row: startR,
                      col: c,
                    });
                    placed = true;
                  }
                }
              }
            }
          }
        }
      }
    }

    // Assign visible numbers to cells that start clues
    for (const clue of acrossClues) {
      grid[clue.row][clue.col].number = clue.number;
    }
    for (const clue of downClues) {
      if (!grid[clue.row][clue.col].number) {
        grid[clue.row][clue.col].number = clue.number;
      }
    }

    return {
      id: `crossword-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      title: `${theme} Crossword`,
      theme,
      difficulty,
      rows,
      cols,
      grid,
      clues: {
        across: acrossClues,
        down: downClues,
      },
      createdAt: new Date().toISOString(),
    };
  }

  // Smart hints for crossword
  static getSmartHint(
    puzzle: CrosswordPuzzle,
    clue: CrosswordClue,
    level: 1 | 2 | 3
  ): HintResponse {
    const len = clue.answer.length;
    if (level === 1) {
      return {
        level: 1,
        title: `Clue Analysis: ${clue.direction.toUpperCase()} #${clue.number}`,
        nudge: `The answer has ${len} letters. Definition hint: focus on key concepts related to "${puzzle.theme}".`,
      };
    } else if (level === 2) {
      // Partial reveal: reveals first and last letters
      const firstChar = clue.answer[0];
      const lastChar = clue.answer[clue.answer.length - 1];
      return {
        level: 2,
        title: `Letter Reveal: ${clue.direction.toUpperCase()} #${clue.number}`,
        nudge: `The word starts with "${firstChar}" and ends with "${lastChar}" (${len} letters total).`,
        details: `Think of words fitting: ${firstChar}${"_".repeat(len - 2)}${lastChar}.`,
        targetAction: {
          row: clue.row,
          col: clue.col,
          suggestedValue: firstChar,
        },
      };
    } else {
      return {
        level: 3,
        title: `Complete Answer Reveal`,
        nudge: `The answer to "${clue.clue}" is "${clue.answer}".`,
        details: `Fill in "${clue.answer}" across ${clue.direction} from (${clue.row + 1}, ${clue.col + 1}).`,
        targetAction: {
          row: clue.row,
          col: clue.col,
          suggestedValue: clue.answer,
        },
      };
    }
  }
}
