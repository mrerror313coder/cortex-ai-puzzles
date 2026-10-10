"use client";

import React from "react";
import { HintResponse } from "@/lib/types";
import { Lightbulb, Sparkles, Check, X } from "lucide-react";

interface SmartHintModalProps {
  hint: HintResponse | null;
  onClose: () => void;
}

export const SmartHintModal: React.FC<SmartHintModalProps> = ({
  hint,
  onClose,
}) => {
  if (!hint) return null;

  const getLevelBadge = () => {
    switch (hint.level) {
      case 1:
        return (
          <span className="px-2.5 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-semibold border border-cyan-500/30">
            Level 1: Directional Nudge
          </span>
        );
      case 2:
        return (
          <span className="px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-semibold border border-purple-500/30">
            Level 2: Strategic Elimination
          </span>
        );
      case 3:
        return (
          <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold border border-amber-500/30">
            Level 3: Step-by-Step Logic
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg glass-panel rounded-2xl p-6 border border-purple-500/30 shadow-2xl space-y-5 animate-pop">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-amber-400">
            <Lightbulb className="w-5 h-5" />
          </div>
          <div>
            <div className="mb-1">{getLevelBadge()}</div>
            <h3 className="text-lg font-bold text-white">{hint.title}</h3>
          </div>
        </div>

        {/* Body content */}
        <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-3">
          <p className="text-gray-200 text-sm md:text-base leading-relaxed">
            {hint.nudge}
          </p>
          {hint.details && (
            <div className="pt-2 border-t border-white/5 text-xs text-purple-300/90 leading-relaxed font-mono">
              {hint.details}
            </div>
          )}
        </div>

        {/* Action */}
        <button
          onClick={onClose}
          className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-sm transition-all"
        >
          Got It, Resume Puzzle
        </button>
      </div>
    </div>
  );
};
