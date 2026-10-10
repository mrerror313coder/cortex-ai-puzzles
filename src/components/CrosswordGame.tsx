"use client";

import React, { useState, useEffect, useCallback } from "react";
import { CrosswordPuzzle, CrosswordClue, HintLevel, HintResponse } from "@/lib/types";
import { Clock, Lightbulb, CheckCircle2, Brain } from "lucide-react";

interface CrosswordGameProps {
  puzzle: CrosswordPuzzle;
  onWin: (timeSeconds: number, hintsUsed: number) => void;
  onRequestHint: (level: HintLevel, boardState: any) => Promise<HintResponse | null>;
}

export const CrosswordGame: React.FC<CrosswordGameProps> = ({
  puzzle,
  onWin,
  onRequestHint,
}) => {
  // 2D user inputs
  const [userLetters, setUserLetters] = useState<string[][]>(() =>
    Array.from({ length: puzzle.rows }, () => Array(puzzle.cols).fill(""))
  );

  const [selectedCell, setSelectedCell] = useState<[number, number] | null>([
    puzzle.clues.across[0]?.row ?? 0,
    puzzle.clues.across[0]?.col ?? 0,
  ]);
  const [direction, setDirection] = useState<"across" | "down">("across");
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);

  // Timer
  useEffect(() => {
    const interval = setInterval(() => setTimerSeconds((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // Find active clue based on selected cell and direction
  const getActiveClue = useCallback((): CrosswordClue | undefined => {
    if (!selectedCell) return undefined;
    const [r, c] = selectedCell;

    const clueList = direction === "across" ? puzzle.clues.across : puzzle.clues.down;
    // Find clue where (r, c) falls within its span
    const found = clueList.find((clue) => {
      if (clue.direction === "across") {
        return clue.row === r && c >= clue.col && c < clue.col + clue.answer.length;
      } else {
        return clue.col === c && r >= clue.row && r < clue.row + clue.answer.length;
      }
    });

    if (found) return found;

    // Fallback to opposite direction if not found in current direction
    const oppositeList = direction === "across" ? puzzle.clues.down : puzzle.clues.across;
    return oppositeList.find((clue) => {
      if (clue.direction === "across") {
        return clue.row === r && c >= clue.col && c < clue.col + clue.answer.length;
      } else {
        return clue.col === c && r >= clue.row && r < clue.row + clue.answer.length;
      }
    });
  }, [selectedCell, direction, puzzle.clues]);

  // Check victory
  const checkWin = useCallback(
    (letters: string[][]) => {
      for (let r = 0; r < puzzle.rows; r++) {
        for (let c = 0; c < puzzle.cols; c++) {
          const cell = puzzle.grid[r][c];
          if (!cell.isBlocked) {
            if (letters[r][c].toUpperCase() !== cell.letter.toUpperCase()) {
              return false;
            }
          }
        }
      }
      return true;
    },
    [puzzle]
  );

  // Typing input
  const handleKeyInput = useCallback(
    (char: string) => {
      if (!selectedCell) return;
      const [r, c] = selectedCell;
      if (puzzle.grid[r][c].isBlocked) return;

      const updated = userLetters.map((row) => [...row]);
      updated[r][c] = char.toUpperCase();
      setUserLetters(updated);

      if (checkWin(updated)) {
        onWin(timerSeconds, hintsUsed);
        return;
      }

      // Advance cursor
      if (direction === "across") {
        if (c + 1 < puzzle.cols && !puzzle.grid[r][c + 1].isBlocked) {
          setSelectedCell([r, c + 1]);
        }
      } else {
        if (r + 1 < puzzle.rows && !puzzle.grid[r + 1][c].isBlocked) {
          setSelectedCell([r + 1, c]);
        }
      }
    },
    [selectedCell, puzzle, userLetters, checkWin, onWin, timerSeconds, hintsUsed, direction]
  );

  // Backspace input
  const handleBackspace = useCallback(() => {
    if (!selectedCell) return;
    const [r, c] = selectedCell;

    const updated = userLetters.map((row) => [...row]);
    if (updated[r][c] !== "") {
      updated[r][c] = "";
      setUserLetters(updated);
    } else {
      // Step back
      if (direction === "across" && c > 0 && !puzzle.grid[r][c - 1].isBlocked) {
        updated[r][c - 1] = "";
        setUserLetters(updated);
        setSelectedCell([r, c - 1]);
      } else if (direction === "down" && r > 0 && !puzzle.grid[r - 1][c].isBlocked) {
        updated[r - 1][c] = "";
        setUserLetters(updated);
        setSelectedCell([r - 1, c]);
      }
    }
  }, [selectedCell, direction, userLetters, puzzle.grid]);

  // Global keydown handler
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (!selectedCell) return;
      const [r, c] = selectedCell;

      if (/^[a-zA-Z]$/.test(e.key)) {
        handleKeyInput(e.key);
      } else if (e.key === "Backspace") {
        handleBackspace();
      } else if (e.key === " ") {
        e.preventDefault();
        setDirection((d) => (d === "across" ? "down" : "across"));
      } else if (e.key === "ArrowUp") {
        if (r > 0 && !puzzle.grid[r - 1][c].isBlocked) setSelectedCell([r - 1, c]);
      } else if (e.key === "ArrowDown") {
        if (r < puzzle.rows - 1 && !puzzle.grid[r + 1][c].isBlocked) setSelectedCell([r + 1, c]);
      } else if (e.key === "ArrowLeft") {
        if (c > 0 && !puzzle.grid[r][c - 1].isBlocked) setSelectedCell([r, c - 1]);
      } else if (e.key === "ArrowRight") {
        if (c < puzzle.cols - 1 && !puzzle.grid[r][c + 1].isBlocked) setSelectedCell([r, c + 1]);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selectedCell, handleKeyInput, handleBackspace, puzzle]);

  // Request smart hint
  const triggerHint = async (level: HintLevel) => {
    const activeClue = getActiveClue();
    if (!activeClue) return;

    const res = await onRequestHint(level, {
      puzzle,
      activeClue,
    });

    if (res) {
      setHintsUsed((h) => h + 1);
      if (level === 2 && res.targetAction?.suggestedValue && res.targetAction.row !== undefined && res.targetAction.col !== undefined) {
        const updated = userLetters.map((row) => [...row]);
        updated[res.targetAction.row][res.targetAction.col] = res.targetAction.suggestedValue;
        setUserLetters(updated);
      } else if (level === 3 && typeof res.targetAction?.suggestedValue === "string") {
        const updated = userLetters.map((row) => [...row]);
        const wordStr = res.targetAction.suggestedValue;
        const [startR, startC] = [activeClue.row, activeClue.col];
        for (let i = 0; i < wordStr.length; i++) {
          if (activeClue.direction === "across") {
            updated[startR][startC + i] = wordStr[i];
          } else {
            updated[startR + i][startC] = wordStr[i];
          }
        }
        setUserLetters(updated);
        if (checkWin(updated)) {
          onWin(timerSeconds, hintsUsed + 1);
        }
      }
    }
  };

  const activeClue = getActiveClue();

  return (
    <div className="flex flex-col xl:flex-row gap-8 items-center xl:items-start justify-center max-w-6xl mx-auto py-6">
      {/* Board & Active Clue Bar */}
      <div className="flex flex-col items-center">
        {/* Header */}
        <div className="w-full flex items-center justify-between px-2 mb-4 text-sm font-semibold text-gray-300">
          <div className="flex items-center gap-2">
            <span className="capitalize px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-purple-400">
              {puzzle.theme}
            </span>
            <div className="flex items-center gap-1.5 text-gray-400">
              <Clock className="w-4 h-4 text-cyan-400" />
              <span className="font-mono-numbers">{formatTime(timerSeconds)}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-amber-400">
            <Lightbulb className="w-4 h-4" />
            <span>Hints: {hintsUsed}</span>
          </div>
        </div>

        {/* Current Clue Banner */}
        <div className="w-full glass-panel p-3.5 rounded-xl mb-4 border border-purple-500/30 flex items-center gap-3">
          <div className="px-2.5 py-1 rounded-lg bg-purple-600 text-white text-xs font-bold uppercase">
            {activeClue ? `${activeClue.direction} #${activeClue.number}` : "SELECT"}
          </div>
          <div className="text-sm font-medium text-white truncate">
            {activeClue ? activeClue.clue : "Click a cell or clue to begin typing"}
          </div>
        </div>

        {/* Crossword Grid */}
        <div className="p-3 glass-panel rounded-2xl shadow-2xl border border-white/10">
          <div
            className="grid gap-[2px] bg-[#222436] p-[2px] rounded-xl overflow-hidden"
            style={{
              gridTemplateColumns: `repeat(${puzzle.cols}, minmax(0, 1fr))`,
            }}
          >
            {puzzle.grid.map((row, r) =>
              row.map((cell, c) => {
                if (cell.isBlocked) {
                  return (
                    <div
                      key={`${r}-${c}`}
                      className="w-8 h-8 sm:w-11 sm:h-11 bg-[#0a0b12]"
                    />
                  );
                }

                const isSelected = selectedCell?.[0] === r && selectedCell?.[1] === c;
                const isInActiveWord =
                  activeClue &&
                  (activeClue.direction === "across"
                    ? activeClue.row === r &&
                      c >= activeClue.col &&
                      c < activeClue.col + activeClue.answer.length
                    : activeClue.col === c &&
                      r >= activeClue.row &&
                      r < activeClue.row + activeClue.answer.length);

                let cellBg = "bg-[#141522]";
                if (isSelected) cellBg = "bg-purple-600 text-white z-10 ring-2 ring-purple-300";
                else if (isInActiveWord) cellBg = "bg-indigo-950/80 text-cyan-300";

                return (
                  <button
                    key={`${r}-${c}`}
                    onClick={() => {
                      if (selectedCell && selectedCell[0] === r && selectedCell[1] === c) {
                        setDirection((d) => (d === "across" ? "down" : "across"));
                      } else {
                        setSelectedCell([r, c]);
                      }
                    }}
                    className={`w-8 h-8 sm:w-11 sm:h-11 flex items-center justify-center text-sm sm:text-lg font-bold font-mono-numbers relative transition-all select-none ${cellBg}`}
                  >
                    {cell.number && (
                      <span className="absolute top-0.5 left-1 text-[8px] sm:text-[9px] font-sans font-bold text-gray-400 pointer-events-none">
                        {cell.number}
                      </span>
                    )}
                    <span>{userLetters[r][c]}</span>
                  </button>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Clues Column & AI Hint Suite */}
      <div className="w-full xl:w-96 flex flex-col gap-5">
        {/* Across & Down Clues Lists */}
        <div className="glass-panel p-4 rounded-2xl space-y-4 max-h-[380px] overflow-y-auto">
          {/* Across */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-purple-400 mb-2">
              Across Clues
            </h4>
            <div className="space-y-1.5">
              {puzzle.clues.across.map((clue) => {
                const isActive = activeClue === clue;
                return (
                  <div
                    key={`across-${clue.number}`}
                    onClick={() => {
                      setSelectedCell([clue.row, clue.col]);
                      setDirection("across");
                    }}
                    className={`p-2 rounded-xl text-xs cursor-pointer transition-all ${
                      isActive
                        ? "bg-purple-600/30 border border-purple-500/40 text-white font-semibold"
                        : "hover:bg-white/5 text-gray-300"
                    }`}
                  >
                    <span className="font-bold text-purple-300 mr-1.5">
                      {clue.number}.
                    </span>
                    <span>{clue.clue}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Down */}
          <div className="pt-2 border-t border-white/5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 mb-2">
              Down Clues
            </h4>
            <div className="space-y-1.5">
              {puzzle.clues.down.map((clue) => {
                const isActive = activeClue === clue;
                return (
                  <div
                    key={`down-${clue.number}`}
                    onClick={() => {
                      setSelectedCell([clue.row, clue.col]);
                      setDirection("down");
                    }}
                    className={`p-2 rounded-xl text-xs cursor-pointer transition-all ${
                      isActive
                        ? "bg-cyan-600/30 border border-cyan-500/40 text-white font-semibold"
                        : "hover:bg-white/5 text-gray-300"
                    }`}
                  >
                    <span className="font-bold text-cyan-300 mr-1.5">
                      {clue.number}.
                    </span>
                    <span>{clue.clue}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 3-Tier AI Hint Buttons */}
        <div className="glass-panel p-4 rounded-2xl space-y-2 border border-purple-500/20 bg-purple-950/20">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-purple-300">
            <Brain className="w-4 h-4 text-purple-400" />
            <span>AI Clue Coaching</span>
          </div>

          <div className="space-y-2 pt-1">
            <button
              onClick={() => triggerHint(1)}
              className="w-full text-left p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-gray-200 transition-all flex items-center justify-between"
            >
              <span><strong>Level 1:</strong> Thematic Direction</span>
              <span className="text-[10px] text-cyan-400 font-semibold">Free</span>
            </button>

            <button
              onClick={() => triggerHint(2)}
              className="w-full text-left p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-gray-200 transition-all flex items-center justify-between"
            >
              <span><strong>Level 2:</strong> First & Last Letters</span>
              <span className="text-[10px] text-purple-400 font-semibold">10 Sparks</span>
            </button>

            <button
              onClick={() => triggerHint(3)}
              className="w-full text-left p-2.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/40 border border-purple-500/30 text-xs text-white font-medium transition-all flex items-center justify-between"
            >
              <span><strong>Level 3:</strong> Solve Current Clue</span>
              <span className="text-[10px] text-amber-400 font-semibold">25 Sparks</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
