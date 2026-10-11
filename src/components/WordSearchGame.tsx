"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { WordSearchPuzzle, WordSearchWord, HintLevel, HintResponse } from "../lib/types";
import { Clock, Lightbulb, CheckCircle2, Sparkles, Search } from "lucide-react";

interface WordSearchGameProps {
  puzzle: WordSearchPuzzle;
  onWin: (timeSeconds: number, hintsUsed: number) => void;
  onRequestHint: (level: HintLevel, boardState: any) => Promise<HintResponse | null>;
}

export const WordSearchGame: React.FC<WordSearchGameProps> = ({
  puzzle,
  onWin,
  onRequestHint,
}) => {
  const [words, setWords] = useState<WordSearchWord[]>(() =>
    puzzle.words.map((w) => ({ ...w }))
  );
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);

  // Drag selection state
  const [isSelecting, setIsSelecting] = useState(false);
  const [startCell, setStartCell] = useState<[number, number] | null>(null);
  const [currentCell, setCurrentCell] = useState<[number, number] | null>(null);
  const [highlightCoords, setHighlightCoords] = useState<[number, number][]>([]);

  // Found coordinates mapped to word colors
  const [foundCellColors, setFoundCellColors] = useState<Record<string, string>>({});

  // Timer loop
  useEffect(() => {
    const interval = setInterval(() => setTimerSeconds((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // Calculate straight line cells between (r1, c1) and (r2, c2)
  const getLineCells = (
    r1: number,
    c1: number,
    r2: number,
    c2: number
  ): [number, number][] => {
    const dr = r2 - r1;
    const dc = c2 - c1;
    const distR = Math.abs(dr);
    const distC = Math.abs(dc);

    // Only allow horizontal, vertical, or 45-degree diagonal lines
    if (distR !== 0 && distC !== 0 && distR !== distC) {
      return [[r1, c1]];
    }

    const steps = Math.max(distR, distC);
    if (steps === 0) return [[r1, c1]];

    const stepR = dr === 0 ? 0 : dr / steps;
    const stepC = dc === 0 ? 0 : dc / steps;

    const cells: [number, number][] = [];
    for (let i = 0; i <= steps; i++) {
      cells.push([r1 + i * stepR, c1 + i * stepC]);
    }
    return cells;
  };

  // Convert selected line into string
  const getSelectedString = (cells: [number, number][]) => {
    return cells.map(([r, c]) => puzzle.grid[r][c]).join("");
  };

  // Check victory
  const checkWin = useCallback(
    (currentWords: WordSearchWord[]) => {
      const allFound = currentWords.every((w) => w.found);
      if (allFound) {
        onWin(timerSeconds, hintsUsed);
      }
    },
    [onWin, timerSeconds, hintsUsed]
  );

  // Mouse / Touch Handlers
  const handleCellMouseDown = (r: number, c: number) => {
    setIsSelecting(true);
    setStartCell([r, c]);
    setCurrentCell([r, c]);
  };

  const handleCellMouseEnter = (r: number, c: number) => {
    if (isSelecting) {
      setCurrentCell([r, c]);
    }
  };

  const handleMouseUp = useCallback(() => {
    if (!isSelecting || !startCell || !currentCell) {
      setIsSelecting(false);
      setStartCell(null);
      setCurrentCell(null);
      return;
    }

    const cells = getLineCells(startCell[0], startCell[1], currentCell[0], currentCell[1]);
    const selectedText = getSelectedString(cells);
    const reversedText = selectedText.split("").reverse().join("");

    // Check if matches any unfound word
    const matchedWordIndex = words.findIndex(
      (w) => !w.found && (w.word === selectedText || w.word === reversedText)
    );

    if (matchedWordIndex !== -1) {
      const matched = words[matchedWordIndex];
      const updatedWords = [...words];
      updatedWords[matchedWordIndex] = { ...matched, found: true };
      setWords(updatedWords);

      // Save cell colors
      const newColors = { ...foundCellColors };
      cells.forEach(([r, c]) => {
        newColors[`${r}-${c}`] = matched.color || "#8b5cf6";
      });
      setFoundCellColors(newColors);

      // Check overall win
      checkWin(updatedWords);
    }

    setIsSelecting(false);
    setStartCell(null);
    setCurrentCell(null);
  }, [isSelecting, startCell, currentCell, words, foundCellColors, checkWin, puzzle.grid]);

  // Global mouseup to release selection outside grid
  useEffect(() => {
    window.addEventListener("mouseup", handleMouseUp);
    return () => window.removeEventListener("mouseup", handleMouseUp);
  }, [handleMouseUp]);

  // Request smart hint
  const triggerHint = async (level: HintLevel) => {
    const res = await onRequestHint(level, {
      ...puzzle,
      words,
    });
    if (res) {
      setHintsUsed((h) => h + 1);
      if (res.targetAction?.highlightCells) {
        setHighlightCoords(res.targetAction.highlightCells);
        // Clear highlight after 6 seconds
        setTimeout(() => setHighlightCoords([]), 6000);
      }
    }
  };

  // Currently actively dragged line
  const activeSelectionCells =
    isSelecting && startCell && currentCell
      ? getLineCells(startCell[0], startCell[1], currentCell[0], currentCell[1])
      : [];

  const foundCount = words.filter((w) => w.found).length;

  return (
    <div className="flex flex-col xl:flex-row gap-8 items-center xl:items-start justify-center max-w-6xl mx-auto py-6">
      {/* 2D Grid */}
      <div className="flex flex-col items-center">
        {/* Header Bar */}
        <div className="w-full flex items-center justify-between px-2 mb-4 text-sm font-semibold text-gray-300">
          <div className="flex items-center gap-2">
            <span className="capitalize px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-emerald-400">
              {puzzle.theme}
            </span>
            <div className="flex items-center gap-1.5 text-gray-400">
              <Clock className="w-4 h-4 text-cyan-400" />
              <span className="font-mono-numbers">{formatTime(timerSeconds)}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-gray-300">
              Found: <strong className="text-emerald-400">{foundCount}</strong> / {words.length}
            </span>
            <div className="flex items-center gap-1 text-amber-400">
              <Lightbulb className="w-4 h-4" />
              <span>{hintsUsed}</span>
            </div>
          </div>
        </div>

        {/* Word Search Grid */}
        <div className="p-3 glass-panel rounded-2xl shadow-2xl border border-white/10 select-none">
          <div
            className="grid gap-[2px] bg-[#222436] p-[2px] rounded-xl overflow-hidden cursor-pointer"
            style={{
              gridTemplateColumns: `repeat(${puzzle.gridSize}, minmax(0, 1fr))`,
            }}
          >
            {puzzle.grid.map((row, r) =>
              row.map((char, c) => {
                const cellKey = `${r}-${c}`;
                const isSelected = activeSelectionCells.some(
                  ([sr, sc]) => sr === r && sc === c
                );
                const isHinted = highlightCoords.some(
                  ([hr, hc]) => hr === r && hc === c
                );
                const permanentColor = foundCellColors[cellKey];

                let cellBg = "bg-[#141522]";
                let textColor = "text-gray-200";

                if (isSelected) {
                  cellBg = "bg-purple-600";
                  textColor = "text-white font-black scale-105";
                } else if (isHinted) {
                  cellBg = "bg-amber-500/50 ring-2 ring-amber-400 animate-pulse";
                  textColor = "text-white font-extrabold";
                } else if (permanentColor) {
                  cellBg = `${permanentColor}40`;
                  textColor = "text-white font-bold";
                }

                return (
                  <div
                    key={cellKey}
                    onMouseDown={() => handleCellMouseDown(r, c)}
                    onMouseEnter={() => handleCellMouseEnter(r, c)}
                    className={`w-7 h-7 sm:w-10 sm:h-10 flex items-center justify-center text-xs sm:text-base font-bold font-mono-numbers transition-all select-none ${cellBg} ${textColor}`}
                  >
                    {char}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Target Word List & AI Hint Suite */}
      <div className="w-full xl:w-80 flex flex-col gap-5">
        {/* Words to Find */}
        <div className="glass-panel p-4 rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Vocabulary Targets
            </h4>
            <span className="text-xs text-gray-400">
              {foundCount}/{words.length} Solved
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 max-h-[300px] overflow-y-auto">
            {words.map((item) => (
              <div
                key={item.word}
                className={`flex items-center gap-2 p-2 rounded-xl text-xs font-semibold transition-all ${
                  item.found
                    ? "bg-white/5 text-gray-500 line-through border border-white/5"
                    : "bg-white/5 text-gray-200 border border-white/10"
                }`}
              >
                <div
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{
                    backgroundColor: item.found ? item.color : "#4b5563",
                  }}
                />
                <span className="truncate">{item.word}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 3-Tier AI Hint Buttons */}
        <div className="glass-panel p-4 rounded-2xl space-y-2 border border-purple-500/20 bg-purple-950/20">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-purple-300">
            <Search className="w-4 h-4 text-emerald-400" />
            <span>AI Radar Hints</span>
          </div>

          <div className="space-y-2 pt-1">
            <button
              onClick={() => triggerHint(1)}
              className="w-full text-left p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-gray-200 transition-all flex items-center justify-between"
            >
              <span><strong>Level 1:</strong> Quadrant Nudge</span>
              <span className="text-[10px] text-cyan-400 font-semibold">Free</span>
            </button>

            <button
              onClick={() => triggerHint(2)}
              className="w-full text-left p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-gray-200 transition-all flex items-center justify-between"
            >
              <span><strong>Level 2:</strong> Starting Coordinate</span>
              <span className="text-[10px] text-purple-400 font-semibold">10 Sparks</span>
            </button>

            <button
              onClick={() => triggerHint(3)}
              className="w-full text-left p-2.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/40 border border-purple-500/30 text-xs text-white font-medium transition-all flex items-center justify-between"
            >
              <span><strong>Level 3:</strong> Full Path Highlight</span>
              <span className="text-[10px] text-amber-400 font-semibold">25 Sparks</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
