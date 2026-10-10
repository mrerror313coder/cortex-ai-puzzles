"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { DailyChallengeBanner } from "@/components/DailyChallengeBanner";
import { GameCard } from "@/components/GameCard";
import { SudokuGame } from "@/components/SudokuGame";
import { CrosswordGame } from "@/components/CrosswordGame";
import { WordSearchGame } from "@/components/WordSearchGame";
import { JigsawGame } from "@/components/JigsawGame";
import { SmartHintModal } from "@/components/SmartHintModal";
import { AiGeneratorModal } from "@/components/AiGeneratorModal";
import { WinModal } from "@/components/WinModal";
import { StatsModal } from "@/components/StatsModal";

import { StorageService, INITIAL_USER_STATS } from "@/lib/storage";
import { AdaptiveDifficultyEngine } from "@/lib/engines/adaptive";
import {
  PuzzleType,
  DifficultyLevel,
  UserStats,
  HintLevel,
  HintResponse,
  Achievement,
  SudokuPuzzle,
  CrosswordPuzzle,
  WordSearchPuzzle,
  JigsawPuzzle,
} from "@/lib/types";
import { Sparkles, ArrowLeft, Bot, Trophy, Flame, Zap, ShieldCheck } from "lucide-react";

export default function Home() {
  const [stats, setStats] = useState<UserStats>(INITIAL_USER_STATS);
  const [activeGameType, setActiveGameType] = useState<PuzzleType | null>(null);
  const [currentPuzzle, setCurrentPuzzle] = useState<any>(null);
  const [loadingGame, setLoadingGame] = useState(false);

  // Modals state
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [showAiGenModal, setShowAiGenModal] = useState(false);
  const [activeHint, setActiveHint] = useState<HintResponse | null>(null);

  // Win Modal state
  const [winState, setWinState] = useState<{
    isOpen: boolean;
    timeSeconds: number;
    hintsUsed: number;
    eloDelta: number;
    newAchievements: Achievement[];
  }>({
    isOpen: false,
    timeSeconds: 0,
    hintsUsed: 0,
    eloDelta: 0,
    newAchievements: [],
  });

  // Load persistent stats
  useEffect(() => {
    const loaded = StorageService.getStats();
    setStats(loaded);
  }, []);

  // Launch a game
  const handleLaunchGame = async (
    type: PuzzleType,
    difficulty: DifficultyLevel,
    theme?: string,
    prompt?: string
  ) => {
    setLoadingGame(true);
    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          difficulty,
          theme: theme || "Challenge",
          prompt,
        }),
      });
      const data = await res.json();
      if (data.success && data.puzzle) {
        setCurrentPuzzle(data.puzzle);
        setActiveGameType(type);
      }
    } catch (e) {
      console.error("Failed to load puzzle", e);
    } finally {
      setLoadingGame(false);
    }
  };

  // Handle Win
  const handleWin = (timeSeconds: number, hintsUsed: number) => {
    if (!activeGameType) return;

    // Calculate ELO gain
    const difficulty: DifficultyLevel = currentPuzzle?.difficulty || "medium";
    const { delta } = AdaptiveDifficultyEngine.calculateElo(
      stats.eloRating,
      difficulty,
      timeSeconds,
      hintsUsed,
      true
    );

    // Save solve stats
    const { updatedStats, newAchievements } = StorageService.recordSolve(
      activeGameType,
      timeSeconds,
      delta
    );

    setStats(updatedStats);
    setWinState({
      isOpen: true,
      timeSeconds,
      hintsUsed,
      eloDelta: delta,
      newAchievements,
    });
  };

  // Request Hint from API
  const handleRequestHint = async (level: HintLevel, boardState: any): Promise<HintResponse | null> => {
    if (!activeGameType) return null;

    // Check spark currency for Level 2 & 3
    const cost = level === 2 ? 10 : level === 3 ? 25 : 0;
    if (cost > 0) {
      const success = StorageService.spendSparks(cost);
      if (!success) {
        alert(`Insufficient Sparks! You need ${cost} Sparks for Level ${level} guidance.`);
        return null;
      }
      setStats(StorageService.getStats());
    }

    try {
      const res = await fetch("/api/ai/hint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          puzzleType: activeGameType,
          difficulty: currentPuzzle?.difficulty || "medium",
          boardState,
          level,
        }),
      });

      const data = await res.json();
      if (data.success && data.hint) {
        setActiveHint(data.hint);
        return data.hint;
      }
    } catch (e) {
      console.error(e);
    }
    return null;
  };

  // Adaptive recommendation
  const adaptiveRec = AdaptiveDifficultyEngine.evaluateNextChallenge(stats);

  return (
    <div className="min-h-screen flex flex-col justify-between">
      {/* Navigation */}
      <Navbar
        stats={stats}
        onOpenStats={() => setShowStatsModal(true)}
        onOpenAiGen={() => setShowAiGenModal(true)}
        onReturnHome={() => {
          setActiveGameType(null);
          setCurrentPuzzle(null);
        }}
        isHome={!activeGameType}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-8 py-8">
        {loadingGame ? (
          <div className="flex flex-col items-center justify-center py-28 space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-600 to-cyan-500 p-[1px] shadow-2xl animate-spin">
              <div className="w-full h-full bg-[#10111a] rounded-[15px]" />
            </div>
            <p className="text-gray-300 font-semibold text-base animate-pulse">
              Synthesizing Neural Puzzle Matrix...
            </p>
          </div>
        ) : activeGameType && currentPuzzle ? (
          // PLAYING ACTIVE PUZZLE VIEW
          <div className="space-y-6 animate-fade-in">
            {/* Top Bar Return Button */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => {
                  setActiveGameType(null);
                  setCurrentPuzzle(null);
                }}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white text-xs font-semibold transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Return to Hub</span>
              </button>

              <div className="text-right">
                <span className="text-xs text-gray-400 capitalize block">Active Session</span>
                <span className="text-sm font-bold text-white capitalize">
                  {currentPuzzle.title || activeGameType}
                </span>
              </div>
            </div>

            {/* Render Specific Game */}
            {activeGameType === "sudoku" && (
              <SudokuGame
                puzzle={currentPuzzle as SudokuPuzzle}
                onWin={handleWin}
                onRequestHint={handleRequestHint}
              />
            )}
            {activeGameType === "crossword" && (
              <CrosswordGame
                puzzle={currentPuzzle as CrosswordPuzzle}
                onWin={handleWin}
                onRequestHint={handleRequestHint}
              />
            )}
            {activeGameType === "wordsearch" && (
              <WordSearchGame
                puzzle={currentPuzzle as WordSearchPuzzle}
                onWin={handleWin}
                onRequestHint={handleRequestHint}
              />
            )}
            {activeGameType === "jigsaw" && (
              <JigsawGame
                puzzle={currentPuzzle as JigsawPuzzle}
                onWin={handleWin}
                onRequestHint={handleRequestHint}
              />
            )}
          </div>
        ) : (
          // DASHBOARD HUB VIEW
          <div className="space-y-10 animate-fade-in">
            {/* Daily Challenge Banner */}
            <DailyChallengeBanner
              onStartDaily={(type) =>
                handleLaunchGame(type, "medium", "Daily Challenge")
              }
            />

            {/* Adaptive Recommendation Card */}
            <div className="glass-panel rounded-2xl p-6 border border-cyan-500/20 bg-gradient-to-r from-cyan-950/20 via-surface-100 to-purple-950/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 flex-shrink-0">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                      AI Adaptive Recommendation
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 font-bold uppercase">
                      Target: {adaptiveRec.recommendedDifficulty}
                    </span>
                  </div>
                  <p className="text-xs text-gray-300 leading-relaxed max-w-2xl">
                    {adaptiveRec.reason}
                  </p>
                </div>
              </div>

              <button
                onClick={() =>
                  handleLaunchGame(
                    adaptiveRec.suggestedPuzzleType,
                    adaptiveRec.recommendedDifficulty,
                    "Adaptive Calibrated"
                  )
                }
                className="whitespace-nowrap px-4 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 hover:text-white text-xs font-bold transition-all"
              >
                Launch Recommended ({adaptiveRec.suggestedPuzzleType})
              </button>
            </div>

            {/* Puzzle Category Matrix */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-extrabold text-white tracking-tight">
                    Explore Puzzle Chambers
                  </h2>
                  <p className="text-xs text-gray-400">
                    Mathematically verified constraint engines paired with generative AI
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Sudoku */}
                <GameCard
                  type="sudoku"
                  title="Quantum Sudoku"
                  tagline="Exact Cover & DLX Engine"
                  description="Classic 9x9 numbers grid with guaranteed unique solution, pedagogical single deduction solver, and notes mode."
                  icon="sudoku"
                  gradient="bg-cyan-500"
                  badge="Pure Logic"
                  onPlay={handleLaunchGame}
                />

                {/* Crossword */}
                <GameCard
                  type="crossword"
                  title="Neural Crossword"
                  tagline="Thematic Graph Synthesis"
                  description="Interlocking word puzzles powered by semantic dictionaries, keyboard auto-advance, and multi-tier clue hints."
                  icon="crossword"
                  gradient="bg-purple-500"
                  badge="Linguistic"
                  onPlay={handleLaunchGame}
                />

                {/* Word Search */}
                <GameCard
                  type="wordsearch"
                  title="Matrix Word Search"
                  tagline="8-Direction Spatial Search"
                  description="High-density vocabulary grid with smooth drag-to-select word tracing, color tagging, and quadrant radar hints."
                  icon="wordsearch"
                  gradient="bg-emerald-500"
                  badge="Perception"
                  onPlay={handleLaunchGame}
                />

                {/* Jigsaw */}
                <GameCard
                  type="jigsaw"
                  title="Generative Jigsaw"
                  tagline="HTML5 Bezier Interlocking"
                  description="Subdivided high-res cosmic and cyber artwork with Bezier tabs, magnetic snap thresholds, and tray piece physics."
                  icon="jigsaw"
                  gradient="bg-amber-500"
                  badge="Spatial Canvas"
                  onPlay={handleLaunchGame}
                />
              </div>
            </div>

            {/* Architecture Highlights & Safety Guarantees */}
            <div className="glass-panel p-6 rounded-2xl border border-white/5 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white mb-1">100% Solvability Guarantee</h4>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Zero unsolvable AI hallucinations. Algorithmic solvers prove single-solution validity before grids are rendered.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white mb-1">3-Tier Pedagogical Hints</h4>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    AI coaches rather than spoils: directional nudges, candidate pruning, and complete deductive explanations.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400">
                  <Flame className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white mb-1">Adaptive ELO Calibration</h4>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Dynamic skill rating analyzes solve velocity, error frequency, and hint usage to tune your difficulty curve.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full glass-panel border-t border-white/5 py-6 px-4 md:px-8 mt-12">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <span className="text-gray-400 font-bold">CORTEX AI</span>
            <span>• Next.js 14 App Router Full-Stack Platform</span>
          </div>
          <div>
            <span>All rights reserved © 2026 AI Puzzle Game Platform</span>
          </div>
        </div>
      </footer>

      {/* Global Interactive Modals */}
      <SmartHintModal
        hint={activeHint}
        onClose={() => setActiveHint(null)}
      />

      <AiGeneratorModal
        isOpen={showAiGenModal}
        onClose={() => setShowAiGenModal(false)}
        onGenerate={async (type, diff, theme, prompt) => {
          await handleLaunchGame(type, diff, theme, prompt);
        }}
        sparks={stats.sparks}
      />

      <WinModal
        isOpen={winState.isOpen}
        puzzleType={activeGameType || "sudoku"}
        timeSeconds={winState.timeSeconds}
        hintsUsed={winState.hintsUsed}
        eloDelta={winState.eloDelta}
        newAchievements={winState.newAchievements}
        onPlayNext={() => {
          setWinState((w) => ({ ...w, isOpen: false }));
          if (activeGameType) {
            handleLaunchGame(activeGameType, currentPuzzle?.difficulty || "medium");
          }
        }}
        onReturnHome={() => {
          setWinState((w) => ({ ...w, isOpen: false }));
          setActiveGameType(null);
          setCurrentPuzzle(null);
        }}
      />

      <StatsModal
        isOpen={showStatsModal}
        onClose={() => setShowStatsModal(false)}
        stats={stats}
      />
    </div>
  );
}
