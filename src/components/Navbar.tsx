"use client";

import React from "react";
import { Sparkles, Trophy, Flame, BarChart3, Bot, Compass } from "lucide-react";
import { UserStats } from "../lib/types";

interface NavbarProps {
  stats: UserStats;
  onOpenStats: () => void;
  onOpenAiGen: () => void;
  onReturnHome: () => void;
  isHome: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  stats,
  onOpenStats,
  onOpenAiGen,
  onReturnHome,
  isHome,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-white/10 px-4 md:px-8 py-3.5 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand */}
        <div
          onClick={onReturnHome}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-400 p-[1px] shadow-lg group-hover:scale-105 transition-transform duration-200">
            <div className="w-full h-full bg-[#10111a] rounded-[11px] flex items-center justify-center">
              <Bot className="w-5 h-5 text-cyan-400 group-hover:text-purple-300 transition-colors" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-indigo-200 to-cyan-400">
                CORTEX AI
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                BETA
              </span>
            </div>
            <p className="text-xs text-gray-400 hidden sm:block">Adaptive Puzzle Platform</p>
          </div>
        </div>

        {/* Center / Stats Badges */}
        <div className="flex items-center gap-2 md:gap-4">
          {/* Daily Streak */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm font-semibold">
            <Flame className="w-4 h-4 fill-amber-500 text-amber-500 animate-pulse" />
            <span>{stats.streakDays}</span>
            <span className="hidden sm:inline text-xs text-amber-300/80">day streak</span>
          </div>

          {/* Sparks / AI Tokens */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-300 text-sm font-semibold">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span>{stats.sparks}</span>
            <span className="hidden sm:inline text-xs text-purple-400/80">sparks</span>
          </div>

          {/* ELO Rating */}
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-sm font-semibold">
            <Trophy className="w-4 h-4 text-cyan-400" />
            <span>{stats.eloRating}</span>
            <span className="text-xs text-cyan-400/80">ELO</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 md:gap-3">
          {!isHome && (
            <button
              onClick={onReturnHome}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 text-sm font-medium transition-all"
            >
              <Compass className="w-4 h-4" />
              <span className="hidden sm:inline">Hub</span>
            </button>
          )}

          <button
            onClick={onOpenAiGen}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-sm font-semibold shadow-md shadow-purple-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Sparkles className="w-4 h-4 text-cyan-300" />
            <span>Prompt AI</span>
          </button>

          <button
            onClick={onOpenStats}
            title="Player Stats"
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white transition-colors"
          >
            <BarChart3 className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};
