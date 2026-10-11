import { NextRequest, NextResponse } from "next/server";
import { DifficultyLevel, PuzzleType } from "../../../../lib/types";

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();
    const lower = (prompt || "").toLowerCase();

    let puzzleType: PuzzleType = "sudoku";
    if (lower.includes("crossword") || lower.includes("clue") || lower.includes("cross")) {
      puzzleType = "crossword";
    } else if (lower.includes("word") || lower.includes("search") || lower.includes("letter")) {
      puzzleType = "wordsearch";
    } else if (lower.includes("jigsaw") || lower.includes("piece") || lower.includes("image")) {
      puzzleType = "jigsaw";
    } else if (lower.includes("sudoku") || lower.includes("number") || lower.includes("math")) {
      puzzleType = "sudoku";
    }

    let difficulty: DifficultyLevel = "medium";
    if (lower.includes("easy") || lower.includes("simple") || lower.includes("beginner") || lower.includes("fast")) {
      difficulty = "easy";
    } else if (lower.includes("expert") || lower.includes("extreme") || lower.includes("insane")) {
      difficulty = "expert";
    } else if (lower.includes("hard") || lower.includes("tricky") || lower.includes("complex")) {
      difficulty = "hard";
    }

    let theme = "Custom Challenge";
    if (lower.includes("space") || lower.includes("galaxy") || lower.includes("cosmic")) {
      theme = "Deep Space Exploration";
    } else if (lower.includes("cyberpunk") || lower.includes("future") || lower.includes("matrix") || lower.includes("neon")) {
      theme = "Cyberpunk 2099";
    } else if (lower.includes("ai") || lower.includes("robot") || lower.includes("tech")) {
      theme = "AI & Future Tech";
    } else if (lower.includes("nature") || lower.includes("forest") || lower.includes("wild")) {
      theme = "Nature";
    }

    return NextResponse.json({
      success: true,
      parsed: {
        puzzleType,
        difficulty,
        theme,
        originalPrompt: prompt,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
