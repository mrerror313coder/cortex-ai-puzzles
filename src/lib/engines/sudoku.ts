import { SudokuPuzzle, DifficultyLevel, HintResponse } from "../types";

export class SudokuEngine {
  // Check if placing num at (row, col) is valid according to classic rules
  static isValid(grid: number[][], row: number, col: number, num: number): boolean {
    for (let c = 0; c < 9; c++) {
      if (grid[row][c] === num) return false;
    }
    for (let r = 0; r < 9; r++) {
      if (grid[r][col] === num) return false;
    }
    const boxRow = Math.floor(row / 3) * 3;
    const boxCol = Math.floor(col / 3) * 3;
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        if (grid[boxRow + r][boxCol + c] === num) return false;
      }
    }
    return true;
  }

  // Solves the grid using randomized backtracking (in-place)
  static solve(grid: number[][], randomize: boolean = false): boolean {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (grid[row][col] === 0) {
          let numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
          if (randomize) {
            numbers = numbers.sort(() => Math.random() - 0.5);
          }
          for (const num of numbers) {
            if (this.isValid(grid, row, col, num)) {
              grid[row][col] = num;
              if (this.solve(grid, randomize)) return true;
              grid[row][col] = 0;
            }
          }
          return false;
        }
      }
    }
    return true;
  }

  // Count number of solutions (stops after 2 for uniqueness check)
  static countSolutions(grid: number[][], count = { val: 0 }): number {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (grid[row][col] === 0) {
          for (let num = 1; num <= 9; num++) {
            if (this.isValid(grid, row, col, num)) {
              grid[row][col] = num;
              this.countSolutions(grid, count);
              grid[row][col] = 0;
              if (count.val >= 2) return count.val;
            }
          }
          return count.val;
        }
      }
    }
    count.val += 1;
    return count.val;
  }

  // Generate a complete valid board
  static generateFullBoard(): number[][] {
    const grid: number[][] = Array.from({ length: 9 }, () => Array(9).fill(0));
    this.solve(grid, true);
    return grid;
  }

  // Generate a puzzle with guaranteed unique solution and target difficulty
  static generatePuzzle(difficulty: DifficultyLevel = "medium", title = "AI Sudoku Challenge"): SudokuPuzzle {
    const full = this.generateFullBoard();
    const puzzleGrid = full.map((row) => [...row]);

    // Target clue count based on difficulty
    let targetClues = 34; // medium
    if (difficulty === "easy") targetClues = 40;
    else if (difficulty === "hard") targetClues = 28;
    else if (difficulty === "expert") targetClues = 24;

    const positions: [number, number][] = [];
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        positions.push([r, c]);
      }
    }
    // Shuffle positions
    positions.sort(() => Math.random() - 0.5);

    let cluesRemaining = 81;
    for (const [r, c] of positions) {
      if (cluesRemaining <= targetClues) break;
      const backup = puzzleGrid[r][c];
      puzzleGrid[r][c] = 0;

      // Copy to test uniqueness
      const testCopy = puzzleGrid.map((row) => [...row]);
      const count = { val: 0 };
      this.countSolutions(testCopy, count);

      if (count.val !== 1) {
        // Revert if removal creates multiple solutions
        puzzleGrid[r][c] = backup;
      } else {
        cluesRemaining--;
      }
    }

    return {
      id: `sudoku-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      title,
      difficulty,
      initialGrid: puzzleGrid,
      solutionGrid: full,
      createdAt: new Date().toISOString(),
    };
  }

  // Get pedagogical hints for current board state
  static getSmartHint(currentGrid: number[][], solutionGrid: number[][], level: 1 | 2 | 3): HintResponse {
    // 1. Look for obvious mistakes first
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (currentGrid[r][c] !== 0 && currentGrid[r][c] !== solutionGrid[r][c]) {
          if (level === 1) {
            return {
              level: 1,
              title: "Discrepancy Detected",
              nudge: `Take a closer look at Row ${r + 1}, Column ${c + 1}. A recently placed number conflicts with the rules.`,
              targetAction: { row: r, col: c },
            };
          } else if (level === 2) {
            return {
              level: 2,
              title: "Candidate Conflict",
              nudge: `Cell at (${r + 1}, ${c + 1}) contains an incorrect digit: ${currentGrid[r][c]}.`,
              details: `Erase this number to restore a viable solution path.`,
              targetAction: { row: r, col: c, highlightCells: [[r, c]] },
            };
          } else {
            return {
              level: 3,
              title: "Step-by-Step Correction",
              nudge: `Cell (${r + 1}, ${c + 1}) currently has ${currentGrid[r][c]}, but the true value is ${solutionGrid[r][c]}.`,
              details: `Because of column and 3x3 block constraints, this cell cannot hold ${currentGrid[r][c]}.`,
              targetAction: { row: r, col: c, suggestedValue: solutionGrid[r][c] },
            };
          }
        }
      }
    }

    // 2. Find Naked Singles (cells with only one legal candidate)
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (currentGrid[r][c] === 0) {
          const candidates: number[] = [];
          for (let n = 1; n <= 9; n++) {
            if (this.isValid(currentGrid, r, c, n)) {
              candidates.push(n);
            }
          }

          if (candidates.length === 1) {
            const singleVal = candidates[0];
            const boxIndex = Math.floor(r / 3) * 3 + Math.floor(c / 3) + 1;
            if (level === 1) {
              return {
                level: 1,
                title: "Naked Single Available",
                nudge: `Check 3x3 Box ${boxIndex} (near Row ${r + 1}, Col ${c + 1}). One of these empty cells has only ONE possible legal candidate!`,
                targetAction: { row: r, col: c },
              };
            } else if (level === 2) {
              return {
                level: 2,
                title: "Single Candidate Isolated",
                nudge: `Cell (${r + 1}, ${c + 1}) has all other numbers (1-9) blocked by its row, column, and box.`,
                details: `Only digit ${singleVal} is valid here.`,
                targetAction: { row: r, col: c, highlightCells: [[r, c]] },
              };
            } else {
              return {
                level: 3,
                title: "Definitive Placement",
                nudge: `Place ${singleVal} into Row ${r + 1}, Column ${c + 1}.`,
                details: `Every other digit from 1 to 9 is already present in Row ${r + 1}, Column ${c + 1}, or Box ${boxIndex}.`,
                targetAction: { row: r, col: c, suggestedValue: singleVal },
              };
            }
          }
        }
      }
    }

    // 3. Fallback to any empty cell guided by solution
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (currentGrid[r][c] === 0) {
          const correctVal = solutionGrid[r][c];
          if (level === 1) {
            return {
              level: 1,
              title: "Strategic Focus",
              nudge: `Inspect Row ${r + 1}. Try eliminating candidates for empty squares starting at Column ${c + 1}.`,
              targetAction: { row: r, col: c },
            };
          } else if (level === 2) {
            return {
              level: 2,
              title: "Candidate Elimination",
              nudge: `In Row ${r + 1}, Column ${c + 1}, the valid candidate is narrowed down.`,
              details: `Look at the remaining digits needed for this row.`,
              targetAction: { row: r, col: c },
            };
          } else {
            return {
              level: 3,
              title: "Logical Solution",
              nudge: `Cell (${r + 1}, ${c + 1}) must be ${correctVal}.`,
              details: `Placing ${correctVal} here unlocks the remaining constraints in this sector.`,
              targetAction: { row: r, col: c, suggestedValue: correctVal },
            };
          }
        }
      }
    }

    return {
      level: 1,
      title: "Board Completed",
      nudge: "The puzzle appears to be completely solved! Check your score.",
    };
  }
}
