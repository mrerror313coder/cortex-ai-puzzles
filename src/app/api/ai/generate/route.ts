import { NextRequest, NextResponse } from "next/server";
import { SudokuEngine } from "@/lib/engines/sudoku";
import { WordSearchEngine } from "@/lib/engines/wordsearch";
import { CrosswordEngine } from "@/lib/engines/crossword";
import { JigsawEngine } from "@/lib/engines/jigsaw";
import { THEMATIC_CROSSWORD_BANKS, THEMATIC_WORDSEARCH_BANKS } from "@/lib/sample-puzzles";
import { DifficultyLevel, PuzzleType } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const puzzleType: PuzzleType = body.type || "sudoku";
    const difficulty: DifficultyLevel = body.difficulty || "medium";
    const prompt: string = body.prompt || "";
    const theme: string = body.theme || (prompt ? prompt.slice(0, 30) : "Default");

    // Optional OpenAI integration if OPENAI_API_KEY is configured in environment
    const apiKey = process.env.OPENAI_API_KEY;

    if (puzzleType === "sudoku") {
      const puzzle = SudokuEngine.generatePuzzle(difficulty, `${theme || "Quantum"} Sudoku`);
      return NextResponse.json({ success: true, puzzle });
    }

    if (puzzleType === "wordsearch") {
      let wordList = THEMATIC_WORDSEARCH_BANKS["AI & Machine Learning"];

      // If user provided a specific theme that matches or customized
      const foundTheme = Object.keys(THEMATIC_WORDSEARCH_BANKS).find(
        (k) => k.toLowerCase().includes(theme.toLowerCase())
      );
      if (foundTheme) {
        wordList = THEMATIC_WORDSEARCH_BANKS[foundTheme];
      } else if (prompt) {
        // Generate words from prompt keywords
        const keywords = prompt
          .toUpperCase()
          .replace(/[^A-Z\s]/g, "")
          .split(/\s+/)
          .filter((w) => w.length >= 3 && w.length <= 10);
        if (keywords.length >= 4) {
          wordList = keywords.slice(0, 10);
        }
      }

      const puzzle = WordSearchEngine.generatePuzzle(
        wordList,
        theme || "AI & Tech",
        difficulty
      );
      return NextResponse.json({ success: true, puzzle });
    }

    if (puzzleType === "crossword") {
      let wordPairs = THEMATIC_CROSSWORD_BANKS["AI & Future Tech"];
      const foundTheme = Object.keys(THEMATIC_CROSSWORD_BANKS).find(
        (k) => k.toLowerCase().includes(theme.toLowerCase())
      );
      if (foundTheme) {
        wordPairs = THEMATIC_CROSSWORD_BANKS[foundTheme];
      }

      const puzzle = CrosswordEngine.generatePuzzle(
        wordPairs,
        theme || "AI & Technology",
        difficulty
      );
      return NextResponse.json({ success: true, puzzle });
    }

    if (puzzleType === "jigsaw") {
      const puzzle = JigsawEngine.generatePuzzle(
        theme || "Cosmic",
        difficulty
      );
      return NextResponse.json({ success: true, puzzle });
    }

    return NextResponse.json({ error: "Invalid puzzle type" }, { status: 400 });
  } catch (error: any) {
    console.error("Puzzle generation failed:", error);
    return NextResponse.json(
      { error: "Generation failed", details: error.message },
      { status: 500 }
    );
  }
}
