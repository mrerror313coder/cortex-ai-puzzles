"use client";

import React from "react";
import { UserStats, Achievement, PuzzleType } from "@/lib/types";
import { ACHIEVEMENTS_LIST } from "@/lib/storage";
import { Trophy, Flame, Sparkles, Clock, CheckCircle2, Lock, X } from "lucide-react";

interface StatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: UserStats;
}

export const StatsModal: React.FC<StatsModalProps> = ({
  isOpen,
  onClose,
  stats,
}) => {
  if (!isOpen) return null;

  const getRankTitle = (elo: number) => {
    if (elo < 800) return { title: "Novice Analyst", color: "text-gray-300" };
    if (elo < 1200) return { title: "Cognitive Adept", color: "text-cyan-400" };
    if (elo < 1600) return { title: "Logic Master", color: "text-purple-400" };
    return { title: "Grandmaster Intellect", color: "text-amber-400" };
  };

  const rank = getRankTitle(stats.eloRating);

  const formatSeconds = (secs: number) => {
    if (!secs) return "--:--";
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins}m ${s}s`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-2xl glass-panel rounded-2xl p-6 md:p-8 border border-white/10 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto animate-pop">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Profile Card */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-white/5 border border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-500 p-[1px] shadow-lg">
              <div className="w-full h-full bg-[#10111a] rounded-[15px] flex items-center justify-center">
                <Trophy className="w-7 h-7 text-cyan-400" />
              </div>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Player Performance</h3>
              <p className={`text-xs font-semibold ${rank.color}`}>{rank.title}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-center px-3 py-1.5 rounded-lg bg-black/30 border border-white/5">
              <span className="text-[10px] text-gray-400 uppercase block">Rating</span>
              <span className="text-base font-extrabold text-cyan-300 font-mono-numbers">
                {stats.eloRating}
              </span>
            </div>
            <div className="text-center px-3 py-1.5 rounded-lg bg-black/30 border border-white/5">
              <span className="text-[10px] text-gray-400 uppercase block">Streak</span>
              <span className="text-base font-extrabold text-amber-400 font-mono-numbers">
                {stats.streakDays}d
              </span>
            </div>
            <div className="text-center px-3 py-1.5 rounded-lg bg-black/30 border border-white/5">
              <span className="text-[10px] text-gray-400 uppercase block">Sparks</span>
              <span className="text-base font-extrabold text-purple-300 font-mono-numbers">
                {stats.sparks}
              </span>
            </div>
          </div>
        </div>

        {/* Category Breakdown */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
            Puzzles Solved by Category
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {(["sudoku", "crossword", "wordsearch", "jigsaw"] as PuzzleType[]).map((type) => (
              <div
                key={type}
                className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-1 text-center"
              >
                <span className="text-xs font-semibold uppercase text-gray-400 block capitalize">
                  {type}
                </span>
                <span className="text-lg font-bold text-white font-mono-numbers block">
                  {stats.puzzlesSolvedByType[type] || 0}
                </span>
                <span className="text-[10px] text-gray-400 block">
                  Best: {formatSeconds(stats.bestTimesByType[type] || 0)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Achievements Gallery */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
            Achievements Gallery
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {ACHIEVEMENTS_LIST.map((ach) => {
              const isUnlocked = stats.unlockedAchievements.includes(ach.id);
              return (
                <div
                  key={ach.id}
                  className={`p-3 rounded-xl border flex items-center gap-3 transition-all ${
                    isUnlocked
                      ? "bg-purple-950/20 border-purple-500/30 text-white"
                      : "bg-white/5 border-white/5 text-gray-500 opacity-60"
                  }`}
                >
                  <span className="text-2xl">{ach.icon}</span>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-white">{ach.title}</span>
                      {isUnlocked ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Lock className="w-3.5 h-3.5 text-gray-500" />
                      )}
                    </div>
                    <p className="text-[11px] text-gray-400 leading-tight">
                      {ach.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
