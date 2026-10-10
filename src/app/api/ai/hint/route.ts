import { NextRequest, NextResponse } from "next/server";
import { SudokuEngine } from "@/lib/engines/sudoku";
import { WordSearchEngine } from "@/lib/engines/wordsearch";
import { CrosswordEngine } from "@/lib/engines/crossword";
import { JigsawEngine } from "@/lib/engines/jigsaw";
import { HintRequest, HintResponse } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const body: HintRequest = await req.json();
    const { puzzleType, boardState, level } = body;

    let hint: HintResponse;

    if (puzzleType === "sudoku") {
      const { currentGrid, solutionGrid } = boardState;
      hint = SudokuEngine.getSmartHint(currentGrid, solutionGrid, level);
    } else if (puzzleType === "wordsearch") {
      hint = WordSearchEngine.getSmartHint(boardState, level);
    } else if (puzzleType === "crossword") {
      const { puzzle, activeClue } = boardState;
      hint = CrosswordEngine.getSmartHint(puzzle, activeClue, level);
    } else if (puzzleType === "jigsaw") {
      const { pieces } = boardState;
      hint = JigsawEngine.getSmartHint(pieces, level);
    } else {
      return NextResponse.json({ error: "Unknown puzzle type" }, { status: 400 });
    }

    return NextResponse.json({ success: true, hint });
  } catch (error: any) {
    console.error("Hint generation failed:", error);
    return NextResponse.json(
      { error: "Hint calculation failed", details: error.message },
      { status: 500 }
    );
  }
}
