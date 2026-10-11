"use client";

import React, { useEffect } from "react";
import confetti from "canvas-confetti";
import { Trophy, Clock, Lightbulb, Sparkles, ArrowRight, RotateCcw } from "lucide-react";
import { Achievement, PuzzleType } from "../lib/types";

interface WinModalProps {
  isOpen: boolean;
  puzzleType: PuzzleType;
  timeSeconds: number;
  hintsUsed: number;
  eloDelta: number;
  newAchievements: Achievement[];
  onPlayNext: () => void;
  onReturnHome: () => void;
}

export const WinModal: React.FC<WinModalProps> = ({
  isOpen,
  puzzleType,
  timeSeconds,
  hintsUsed,
  eloDelta,
  newAchievements,
  onPlayNext,
  onReturnHome,
}) => {
  useEffect(() => {
    if (isOpen) {
      // Fire celebration confetti cannon
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#8b5cf6", "#06b6d4", "#10b981", "#f59e0b"],
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins}m ${s}s`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-md glass-panel rounded-2xl p-6 md:p-8 border border-purple-500/40 shadow-2xl text-center space-y-6 animate-pop">
        {/* Glowing Trophy Icon */}
        <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 via-purple-600 to-cyan-400 p-[1px] shadow-xl glow-amber">
          <div className="w-full h-full bg-[#10111a] rounded-[15px] flex items-center justify-center">
            <Trophy className="w-8 h-8 text-amber-400" />
          </div>
        </div>

        {/* Title */}
        <div className="space-y-1">
          <h2 className="text-2xl font-extrabold text-white tracking-tight">
            Puzzle Conquered!
          </h2>
          <p className="text-xs text-gray-400 capitalize">
            {puzzleType} matrix solved successfully
          </p>
        </div>

        {/* Performance Metrics Grid */}
        <div className="grid grid-cols-3 gap-2 p-3 bg-white/5 rounded-xl border border-white/5">
          <div className="flex flex-col items-center">
            <Clock className="w-4 h-4 text-cyan-400 mb-1" />
            <span className="text-[11px] text-gray-400">Time</span>
            <span className="text-xs font-bold text-white font-mono-numbers">
              {formatTime(timeSeconds)}
            </span>
          </div>

          <div className="flex flex-col items-center border-x border-white/10">
            <Trophy className="w-4 h-4 text-emerald-400 mb-1" />
            <span className="text-[11px] text-gray-400">Skill ELO</span>
            <span className="text-xs font-bold text-emerald-400">
              +{eloDelta}
            </span>
          </div>

          <div className="flex flex-col items-center">
            <Sparkles className="w-4 h-4 text-purple-400 mb-1" />
            <span className="text-[11px] text-gray-400">Sparks</span>
            <span className="text-xs font-bold text-purple-300">
              +25
            </span>
          </div>
        </div>

        {/* Unlocked Achievements Banner */}
        {newAchievements.length > 0 && (
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-left space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block">
              New Achievement Unlocked!
            </span>
            {newAchievements.map((ach) => (
              <div key={ach.id} className="flex items-center gap-2 text-xs font-semibold text-white">
                <span>{ach.icon}</span>
                <span>{ach.title}</span>
              </div>
            ))}
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-2 pt-2">
          <button
            onClick={onPlayNext}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-purple-600/25 transition-all"
          >
            <span>Play Next Challenge</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={onReturnHome}
            className="w-full py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 font-semibold text-xs transition-colors"
          >
            Return to Hub
          </button>
        </div>
      </div>
    </div>
  );
};
