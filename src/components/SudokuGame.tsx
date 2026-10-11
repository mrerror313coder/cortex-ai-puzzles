"use client";

import React, { useState, useEffect, useCallback } from "react";
import { SudokuPuzzle, HintLevel, HintResponse } from "../lib/types";
import { Lightbulb, RotateCcw, Edit3, Trash2, Trophy, Clock, AlertCircle } from "lucide-react";

interface SudokuGameProps {
  puzzle: SudokuPuzzle;
  onWin: (timeSeconds: number, hintsUsed: number) => void;
  onRequestHint: (level: HintLevel, boardState: any) => Promise<HintResponse | null>;
}

export const SudokuGame: React.FC<SudokuGameProps> = ({
  puzzle,
  onWin,
  onRequestHint,
}) => {
  // Current user grid
  const [grid, setGrid] = useState<number[][]>(() =>
    puzzle.initialGrid.map((row) => [...row])
  );
  // Pencil notes: 9x9 set of numbers
  const [notes, setNotes] = useState<Set<number>[][]>(() =>
    Array.from({ length: 9 }, () =>
      Array.from({ length: 9 }, () => new Set<number>())
    )
  );

  const [selectedCell, setSelectedCell] = useState<[number, number] | null>([0, 0]);
  const [notesMode, setNotesMode] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [highlightCells, setHighlightCells] = useState<[number, number][]>([]);
  const [history, setHistory] = useState<{ grid: number[][]; notes: Set<number>[][] }[]>([]);

  // Timer loop
  useEffect(() => {
    const interval = setInterval(() => {
      setTimerSeconds((t) => t + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Format time mm:ss
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // Check board completion
  const checkWin = useCallback(
    (currentGrid: number[][]) => {
      for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
          if (currentGrid[r][c] !== puzzle.solutionGrid[r][c]) {
            return false;
          }
        }
      }
      return true;
    },
    [puzzle.solutionGrid]
  );

  // Apply number input
  const handleInputNumber = useCallback(
    (num: number) => {
      if (!selectedCell) return;
      const [r, c] = selectedCell;

      // Cannot modify initial given numbers
      if (puzzle.initialGrid[r][c] !== 0) return;

      // Save state to history for undo
      setHistory((prev) => [
        ...prev.slice(-10),
        {
          grid: grid.map((row) => [...row]),
          notes: notes.map((row) => row.map((set) => new Set(set))),
        },
      ]);

      if (notesMode) {
        setNotes((prev) => {
          const next = prev.map((row) => row.map((set) => new Set(set)));
          const currentSet = next[r][c];
          if (currentSet.has(num)) {
            currentSet.delete(num);
          } else {
            currentSet.add(num);
          }
          return next;
        });
      } else {
        const nextGrid = grid.map((row) => [...row]);
        nextGrid[r][c] = nextGrid[r][c] === num ? 0 : num;
        setGrid(nextGrid);

        // Check mistake
        if (num !== 0 && num !== puzzle.solutionGrid[r][c]) {
          setMistakes((m) => m + 1);
        }

        // Check victory
        if (checkWin(nextGrid)) {
          onWin(timerSeconds, hintsUsed);
        }
      }
    },
    [selectedCell, puzzle.initialGrid, puzzle.solutionGrid, grid, notes, notesMode, checkWin, onWin, timerSeconds, hintsUsed]
  );

  // Erase cell
  const handleErase = useCallback(() => {
    if (!selectedCell) return;
    const [r, c] = selectedCell;
    if (puzzle.initialGrid[r][c] !== 0) return;

    setGrid((prev) => {
      const next = prev.map((row) => [...row]);
      next[r][c] = 0;
      return next;
    });
    setNotes((prev) => {
      const next = prev.map((row) => row.map((set) => new Set(set)));
      next[r][c].clear();
      return next;
    });
  }, [selectedCell, puzzle.initialGrid]);

  // Undo action
  const handleUndo = () => {
    if (history.length === 0) return;
    const previous = history[history.length - 1];
    setHistory((prev) => prev.slice(0, -1));
    setGrid(previous.grid);
    setNotes(previous.notes);
  };

  // Keyboard navigation & inputs
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedCell) return;
      const [r, c] = selectedCell;

      if (e.key >= "1" && e.key <= "9") {
        handleInputNumber(parseInt(e.key, 10));
      } else if (e.key === "Backspace" || e.key === "Delete") {
        handleErase();
      } else if (e.key.toLowerCase() === "n") {
        setNotesMode((m) => !m);
      } else if (e.key === "ArrowUp") {
        setSelectedCell([Math.max(0, r - 1), c]);
      } else if (e.key === "ArrowDown") {
        setSelectedCell([Math.min(8, r + 1), c]);
      } else if (e.key === "ArrowLeft") {
        setSelectedCell([r, Math.max(0, c - 1)]);
      } else if (e.key === "ArrowRight") {
        setSelectedCell([r, Math.min(8, c + 1)]);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedCell, handleInputNumber, handleErase]);

  // Request smart hint
  const triggerHint = async (level: HintLevel) => {
    const res = await onRequestHint(level, {
      currentGrid: grid,
      solutionGrid: puzzle.solutionGrid,
    });
    if (res) {
      setHintsUsed((h) => h + 1);
      if (res.targetAction?.row !== undefined && res.targetAction?.col !== undefined) {
        setSelectedCell([res.targetAction.row, res.targetAction.col]);
      }
      if (res.targetAction?.highlightCells) {
        setHighlightCells(res.targetAction.highlightCells);
      }
      if (level === 3 && res.targetAction?.suggestedValue && res.targetAction?.row !== undefined && res.targetAction?.col !== undefined) {
        const next = grid.map((row) => [...row]);
        next[res.targetAction.row][res.targetAction.col] = res.targetAction.suggestedValue;
        setGrid(next);
        if (checkWin(next)) {
          onWin(timerSeconds, hintsUsed + 1);
        }
      }
    }
  };

  const selectedValue = selectedCell ? grid[selectedCell[0]][selectedCell[1]] : 0;

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-center lg:items-start justify-center max-w-5xl mx-auto py-6">
      {/* 9x9 Sudoku Board */}
      <div className="flex flex-col items-center">
        {/* Status Bar */}
        <div className="w-full flex items-center justify-between px-2 mb-4 text-sm font-semibold text-gray-300">
          <div className="flex items-center gap-2">
            <span className="capitalize px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-cyan-400">
              {puzzle.difficulty}
            </span>
            <div className="flex items-center gap-1.5 text-gray-400">
              <Clock className="w-4 h-4 text-cyan-400" />
              <span className="font-mono-numbers">{formatTime(timerSeconds)}</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-rose-400">
              <AlertCircle className="w-4 h-4" />
              <span>Mistakes: {mistakes}</span>
            </div>
            <div className="flex items-center gap-1.5 text-amber-400">
              <Lightbulb className="w-4 h-4" />
              <span>Hints: {hintsUsed}</span>
            </div>
          </div>
        </div>

        {/* The Sudoku 9x9 Grid */}
        <div className="p-3 glass-panel rounded-2xl shadow-2xl border border-white/10">
          <div className="grid grid-cols-9 gap-[2px] bg-[#222436] p-[2px] rounded-xl overflow-hidden border border-purple-500/30">
            {grid.map((row, r) =>
              row.map((val, c) => {
                const isSelected = selectedCell?.[0] === r && selectedCell?.[1] === c;
                const isSameRowOrCol =
                  selectedCell && (selectedCell[0] === r || selectedCell[1] === c);
                const isSameBox =
                  selectedCell &&
                  Math.floor(selectedCell[0] / 3) === Math.floor(r / 3) &&
                  Math.floor(selectedCell[1] / 3) === Math.floor(c / 3);
                const isMatchingNumber = selectedValue !== 0 && val === selectedValue;
                const isInitial = puzzle.initialGrid[r][c] !== 0;
                const isHighlighted = highlightCells.some(
                  ([hr, hc]) => hr === r && hc === c
                );

                // 3x3 block borders
                const borderRight = c % 3 === 2 && c !== 8 ? "mr-[2px]" : "";
                const borderBottom = r % 3 === 2 && r !== 8 ? "mb-[2px]" : "";

                let cellBg = "bg-[#141522]";
                if (isSelected) cellBg = "bg-purple-600/60 ring-2 ring-purple-400 z-10";
                else if (isHighlighted) cellBg = "bg-amber-500/40 ring-1 ring-amber-400";
                else if (isMatchingNumber) cellBg = "bg-indigo-700/40";
                else if (isSameRowOrCol || isSameBox) cellBg = "bg-[#1c1e30]";

                return (
                  <button
                    key={`${r}-${c}`}
                    onClick={() => {
                      setSelectedCell([r, c]);
                      setHighlightCells([]);
                    }}
                    className={`w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 flex items-center justify-center text-lg sm:text-xl md:text-2xl font-bold transition-all relative select-none ${cellBg} ${borderRight} ${borderBottom}`}
                  >
                    {val !== 0 ? (
                      <span
                        className={`font-mono-numbers ${
                          isInitial ? "text-gray-100" : "text-cyan-400 font-extrabold"
                        }`}
                      >
                        {val}
                      </span>
                    ) : (
                      // Render Notes (1-9 tiny digits)
                      <div className="grid grid-cols-3 gap-[1px] w-full h-full p-1 pointer-events-none">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                          <span
                            key={n}
                            className={`text-[8px] sm:text-[9px] text-center leading-none ${
                              notes[r][c].has(n) ? "text-purple-300 font-bold" : "opacity-0"
                            }`}
                          >
                            {n}
                          </span>
                        ))}
                      </div>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Control Keypad and AI Tools Panel */}
      <div className="w-full lg:w-72 flex flex-col gap-5">
        {/* Tools Actions */}
        <div className="glass-panel p-4 rounded-2xl space-y-4">
          <div className="text-xs font-bold uppercase tracking-wider text-gray-400">
            Player Controls
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={handleUndo}
              disabled={history.length === 0}
              className="flex flex-col items-center justify-center gap-1.5 py-3 rounded-xl bg-white/5 hover:bg-white/10 active:bg-white/5 border border-white/10 disabled:opacity-40 disabled:pointer-events-none text-xs font-semibold text-gray-300"
            >
              <RotateCcw className="w-4 h-4 text-gray-300" />
              <span>Undo</span>
            </button>

            <button
              onClick={handleErase}
              className="flex flex-col items-center justify-center gap-1.5 py-3 rounded-xl bg-white/5 hover:bg-white/10 active:bg-white/5 border border-white/10 text-xs font-semibold text-gray-300"
            >
              <Trash2 className="w-4 h-4 text-rose-400" />
              <span>Erase</span>
            </button>

            <button
              onClick={() => setNotesMode(!notesMode)}
              className={`flex flex-col items-center justify-center gap-1.5 py-3 rounded-xl border text-xs font-semibold transition-all ${
                notesMode
                  ? "bg-purple-600/30 border-purple-500 text-purple-300 shadow-sm"
                  : "bg-white/5 hover:bg-white/10 border-white/10 text-gray-300"
              }`}
            >
              <Edit3 className="w-4 h-4 text-purple-400" />
              <span>Notes {notesMode ? "ON" : "OFF"}</span>
            </button>
          </div>
        </div>

        {/* 1-9 Number Pad */}
        <div className="glass-panel p-4 rounded-2xl space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-gray-400">
            Number Pad
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <button
                key={num}
                onClick={() => handleInputNumber(num)}
                className="h-12 rounded-xl bg-white/5 hover:bg-purple-600/30 active:scale-95 border border-white/10 hover:border-purple-500/40 text-xl font-bold font-mono-numbers text-white flex items-center justify-center shadow-sm transition-all"
              >
                {num}
              </button>
            ))}
          </div>
        </div>

        {/* 3-Tier AI Hint Buttons */}
        <div className="glass-panel p-4 rounded-2xl space-y-2 border border-purple-500/20 bg-purple-950/20">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-purple-300">
            <Lightbulb className="w-4 h-4 text-amber-400" />
            <span>AI Smart Hints</span>
          </div>
          <p className="text-[11px] text-gray-400">
            Choose how much guidance you need from the AI:
          </p>

          <div className="space-y-2 pt-1">
            <button
              onClick={() => triggerHint(1)}
              className="w-full text-left p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-gray-200 transition-all flex items-center justify-between"
            >
              <span><strong>Level 1:</strong> Directional Nudge</span>
              <span className="text-[10px] text-cyan-400 font-semibold">Free</span>
            </button>

            <button
              onClick={() => triggerHint(2)}
              className="w-full text-left p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-gray-200 transition-all flex items-center justify-between"
            >
              <span><strong>Level 2:</strong> Candidate Pruning</span>
              <span className="text-[10px] text-purple-400 font-semibold">10 Sparks</span>
            </button>

            <button
              onClick={() => triggerHint(3)}
              className="w-full text-left p-2.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/40 border border-purple-500/30 text-xs text-white font-medium transition-all flex items-center justify-between"
            >
              <span><strong>Level 3:</strong> Step-by-Step Logic</span>
              <span className="text-[10px] text-amber-400 font-semibold">25 Sparks</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
