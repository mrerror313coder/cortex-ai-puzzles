"use client";

import React from "react";
import { Play, Sparkles, Brain, Grid, Search, Image as ImageIcon } from "lucide-react";
import { PuzzleType, DifficultyLevel } from "@/lib/types";

interface GameCardProps {
  type: PuzzleType;
  title: string;
  tagline: string;
  description: string;
  icon: "sudoku" | "crossword" | "wordsearch" | "jigsaw";
  gradient: string;
  badge: string;
  onPlay: (type: PuzzleType, difficulty: DifficultyLevel) => void;
}

export const GameCard: React.FC<GameCardProps> = ({
  type,
  title,
  tagline,
  description,
  icon,
  gradient,
  badge,
  onPlay,
}) => {
  const [selectedDifficulty, setSelectedDifficulty] = React.useState<DifficultyLevel>("medium");

  const getIcon = () => {
    switch (icon) {
      case "sudoku":
        return <Grid className="w-6 h-6 text-cyan-400" />;
      case "crossword":
        return <Brain className="w-6 h-6 text-purple-400" />;
      case "wordsearch":
        return <Search className="w-6 h-6 text-emerald-400" />;
      case "jigsaw":
        return <ImageIcon className="w-6 h-6 text-amber-400" />;
    }
  };

  return (
    <div className="glass-panel-interactive rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden group">
      {/* Ambient gradient top glow */}
      <div
        className={`absolute -top-24 -right-24 w-48 h-48 rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity pointer-events-none ${gradient}`}
      />

      <div>
        {/* Top Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shadow-inner">
            {getIcon()}
          </div>
          <span className="text-[11px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-gray-300">
            {badge}
          </span>
        </div>

        {/* Title & Description */}
        <div className="space-y-1 mb-3">
          <h3 className="text-xl font-bold text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-300 transition-colors">
            {title}
          </h3>
          <p className="text-xs font-medium text-cyan-400/90">{tagline}</p>
        </div>
        <p className="text-gray-400 text-xs leading-relaxed mb-6">
          {description}
        </p>
      </div>

      <div className="space-y-4 pt-4 border-t border-white/5">
        {/* Difficulty selector pill */}
        <div>
          <label className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 block mb-2">
            Select Calibration
          </label>
          <div className="grid grid-cols-4 gap-1 p-1 bg-black/40 rounded-xl border border-white/5 text-xs font-medium">
            {(["easy", "medium", "hard", "expert"] as DifficultyLevel[]).map((diff) => (
              <button
                key={diff}
                onClick={() => setSelectedDifficulty(diff)}
                className={`py-1 rounded-lg capitalize transition-all ${
                  selectedDifficulty === diff
                    ? "bg-purple-600 text-white font-semibold shadow-sm"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                {diff}
              </button>
            ))}
          </div>
        </div>

        {/* Play Action */}
        <button
          onClick={() => onPlay(type, selectedDifficulty)}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/15 active:bg-white/5 border border-white/10 text-white font-semibold text-sm transition-all group-hover:border-purple-500/40"
        >
          <Play className="w-4 h-4 fill-white text-white" />
          <span>Launch Puzzle</span>
        </button>
      </div>
    </div>
  );
};
