"use client";

import React, { useState } from "react";
import { Sparkles, Bot, Loader2, X, Wand2 } from "lucide-react";
import { PuzzleType, DifficultyLevel } from "../lib/types";

interface AiGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (type: PuzzleType, difficulty: DifficultyLevel, theme: string, prompt: string) => Promise<void>;
  sparks: number;
}

export const AiGeneratorModal: React.FC<AiGeneratorModalProps> = ({
  isOpen,
  onClose,
  onGenerate,
  sparks,
}) => {
  const [prompt, setPrompt] = useState("");
  const [type, setType] = useState<PuzzleType>("sudoku");
  const [difficulty, setDifficulty] = useState<DifficultyLevel>("medium");
  const [isGenerating, setIsGenerating] = useState(false);

  if (!isOpen) return null;

  const handleNlpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isGenerating) return;

    setIsGenerating(true);
    try {
      // Analyze prompt with NLP route
      let selectedType = type;
      let selectedDifficulty = difficulty;
      let theme = "Custom Synthesis";

      if (prompt.trim()) {
        const nlpRes = await fetch("/api/ai/prompt-search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt }),
        });
        const nlpData = await nlpRes.json();
        if (nlpData.success) {
          selectedType = nlpData.parsed.puzzleType;
          selectedDifficulty = nlpData.parsed.difficulty;
          theme = nlpData.parsed.theme;
        }
      }

      await onGenerate(selectedType, selectedDifficulty, theme, prompt);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const samplePrompts = [
    "Hard crossword about Quantum Physics",
    "Cyberpunk 2099 high-density word search",
    "Deep space nebula jigsaw puzzle",
    "Expert Sudoku challenge with symmetry",
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="relative w-full max-w-xl glass-panel rounded-2xl p-6 md:p-8 border border-purple-500/30 shadow-2xl space-y-6 animate-pop">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-purple-600 to-cyan-500 p-[1px] shadow-lg">
            <div className="w-full h-full bg-[#10111a] rounded-[11px] flex items-center justify-center">
              <Bot className="w-6 h-6 text-cyan-400" />
            </div>
          </div>
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <span>AI Puzzle Synthesis</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                GPT Engine
              </span>
            </h3>
            <p className="text-xs text-gray-400">
              Generate custom puzzles on demand using natural language prompts
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleNlpSubmit} className="space-y-5">
          {/* Natural Language Prompt */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-300 block mb-2">
              Natural Language Prompt (Optional)
            </label>
            <div className="relative">
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g. Give me a tricky space crossword..."
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-purple-500 focus:outline-none text-sm text-white placeholder-gray-500 transition-colors"
              />
              <Wand2 className="absolute right-3.5 top-3.5 w-4 h-4 text-purple-400 pointer-events-none" />
            </div>

            {/* Quick Inspiration Pills */}
            <div className="flex flex-wrap gap-1.5 mt-2.5">
              {samplePrompts.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPrompt(p)}
                  className="text-[11px] px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-gray-400 hover:text-white transition-colors"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Puzzle Type Selector */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-300 block mb-2">
              Select Puzzle Engine
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(["sudoku", "crossword", "wordsearch", "jigsaw"] as PuzzleType[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={`py-2 px-3 rounded-xl capitalize text-xs font-semibold border transition-all ${
                    type === t
                      ? "bg-purple-600/30 border-purple-500 text-white shadow-sm"
                      : "bg-white/5 hover:bg-white/10 border-white/10 text-gray-400"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty Selector */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-300 block mb-2">
              Difficulty Calibration
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(["easy", "medium", "hard", "expert"] as DifficultyLevel[]).map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDifficulty(d)}
                  className={`py-2 px-3 rounded-xl capitalize text-xs font-semibold border transition-all ${
                    difficulty === d
                      ? "bg-cyan-600/30 border-cyan-500 text-white shadow-sm"
                      : "bg-white/5 hover:bg-white/10 border-white/10 text-gray-400"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isGenerating}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 text-white font-bold text-sm shadow-lg shadow-purple-600/25 hover:shadow-purple-600/40 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 transition-all"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Generating Neural Grid...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-cyan-300" />
                <span>Synthesize & Launch</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
