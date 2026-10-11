"use client";

import React from "react";
import { Calendar, Flame, ArrowRight, Zap } from "lucide-react";
import { PuzzleType } from "../lib/types";

interface DailyChallengeBannerProps {
  onStartDaily: (type: PuzzleType) => void;
}

export const DailyChallengeBanner: React.FC<DailyChallengeBannerProps> = ({
  onStartDaily,
}) => {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-purple-500/20 bg-gradient-to-r from-purple-950/40 via-indigo-950/30 to-surface-100 p-6 md:p-8 backdrop-blur-md shadow-2xl mb-10">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 -mb-20 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="max-w-2xl space-y-2">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold border border-amber-500/30">
              <Calendar className="w-3.5 h-3.5" />
              DAILY AI CHALLENGE
            </span>
            <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30">
              <Zap className="w-3.5 h-3.5" />
              2X ELO REWARD
            </span>
          </div>

          <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Cybernetic Synapse: Quantum Sudoku
          </h2>
          <p className="text-gray-300 text-sm md:text-base leading-relaxed">
            Today&apos;s neural challenge tests spatial symmetry and candidate pruning. Solve without mistakes to keep your daily fire burning and claim +50 Sparks!
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={() => onStartDaily("sudoku")}
            className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 via-indigo-600 to-cyan-500 text-white font-bold text-sm shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <Flame className="w-4 h-4 fill-amber-300 text-amber-300" />
            <span>Accept Challenge</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
