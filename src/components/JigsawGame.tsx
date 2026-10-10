"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { JigsawPuzzle, JigsawPiece, HintLevel, HintResponse } from "@/lib/types";
import { JigsawEngine } from "@/lib/engines/jigsaw";
import { Clock, Lightbulb, Image as ImageIcon, Eye, CheckCircle2 } from "lucide-react";

interface JigsawGameProps {
  puzzle: JigsawPuzzle;
  onWin: (timeSeconds: number, hintsUsed: number) => void;
  onRequestHint: (level: HintLevel, boardState: any) => Promise<HintResponse | null>;
}

export const JigsawGame: React.FC<JigsawGameProps> = ({
  puzzle,
  onWin,
  onRequestHint,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  const [pieces, setPieces] = useState<JigsawPiece[]>([]);
  const [activePieceIndex, setActivePieceIndex] = useState<number | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [showPreview, setShowPreview] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  // Dimensions
  const BOARD_WIDTH = 480;
  const BOARD_HEIGHT = 480;
  const CANVAS_WIDTH = 840;
  const CANVAS_HEIGHT = 520;

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

  // Load image & initialize pieces
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = puzzle.imageUrl;
    img.onload = () => {
      imageRef.current = img;
      setIsImageLoaded(true);

      const generatedPieces = JigsawEngine.createPieces(
        puzzle.rows,
        puzzle.cols,
        BOARD_WIDTH,
        BOARD_HEIGHT,
        CANVAS_WIDTH - BOARD_WIDTH
      );
      setPieces(generatedPieces);
    };
  }, [puzzle]);

  // Check victory
  const checkWin = useCallback(
    (currentPieces: JigsawPiece[]) => {
      const allPlaced = currentPieces.every((p) => p.isPlaced);
      if (allPlaced && currentPieces.length > 0) {
        onWin(timerSeconds, hintsUsed);
      }
    },
    [onWin, timerSeconds, hintsUsed]
  );

  // Draw Canvas Loop
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !imageRef.current) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear background
    ctx.fillStyle = "#10111a";
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw board target frame outline
    ctx.strokeStyle = "rgba(139, 92, 246, 0.4)";
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, BOARD_WIDTH, BOARD_HEIGHT);

    // Board background grid placeholder
    ctx.fillStyle = "rgba(255, 255, 255, 0.02)";
    ctx.fillRect(0, 0, BOARD_WIDTH, BOARD_HEIGHT);

    // Separator line between board and piece tray
    ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(BOARD_WIDTH + 15, 0);
    ctx.lineTo(BOARD_WIDTH + 15, CANVAS_HEIGHT);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw placed pieces first
    pieces.forEach((piece) => {
      if (piece.isPlaced) {
        ctx.save();
        JigsawEngine.drawPiecePath(
          ctx,
          piece.targetX,
          piece.targetY,
          piece.width,
          piece.height,
          piece
        );
        ctx.clip();
        ctx.drawImage(
          imageRef.current!,
          0,
          0,
          BOARD_WIDTH,
          BOARD_HEIGHT
        );
        ctx.restore();

        // Stroke piece border
        ctx.save();
        ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
        ctx.lineWidth = 1;
        JigsawEngine.drawPiecePath(
          ctx,
          piece.targetX,
          piece.targetY,
          piece.width,
          piece.height,
          piece
        );
        ctx.stroke();
        ctx.restore();
      }
    });

    // Draw unplaced pieces
    pieces.forEach((piece, index) => {
      if (!piece.isPlaced && index !== activePieceIndex) {
        ctx.save();
        JigsawEngine.drawPiecePath(
          ctx,
          piece.currentX,
          piece.currentY,
          piece.width,
          piece.height,
          piece
        );
        ctx.clip();
        // Translate image slice to current piece coordinate
        ctx.drawImage(
          imageRef.current!,
          piece.targetX - piece.currentX,
          piece.targetY - piece.currentY,
          BOARD_WIDTH,
          BOARD_HEIGHT
        );
        ctx.restore();

        // Stroke
        ctx.save();
        ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
        ctx.lineWidth = 1.5;
        JigsawEngine.drawPiecePath(
          ctx,
          piece.currentX,
          piece.currentY,
          piece.width,
          piece.height,
          piece
        );
        ctx.stroke();
        ctx.restore();
      }
    });

    // Draw active dragged piece on top
    if (activePieceIndex !== null) {
      const piece = pieces[activePieceIndex];
      ctx.save();
      // Drop shadow for floating effect
      ctx.shadowColor = "rgba(139, 92, 246, 0.6)";
      ctx.shadowBlur = 15;
      JigsawEngine.drawPiecePath(
        ctx,
        piece.currentX,
        piece.currentY,
        piece.width,
        piece.height,
        piece
      );
      ctx.clip();
      ctx.drawImage(
        imageRef.current!,
        piece.targetX - piece.currentX,
        piece.targetY - piece.currentY,
        BOARD_WIDTH,
        BOARD_HEIGHT
      );
      ctx.restore();

      ctx.save();
      ctx.strokeStyle = "#8b5cf6";
      ctx.lineWidth = 2.5;
      JigsawEngine.drawPiecePath(
        ctx,
        piece.currentX,
        piece.currentY,
        piece.width,
        piece.height,
        piece
      );
      ctx.stroke();
      ctx.restore();
    }
  }, [pieces, activePieceIndex]);

  useEffect(() => {
    draw();
  }, [draw]);

  // Pointer Handlers
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check pieces in reverse (top-most first)
    for (let i = pieces.length - 1; i >= 0; i--) {
      const p = pieces[i];
      if (
        !p.isPlaced &&
        x >= p.currentX &&
        x <= p.currentX + p.width &&
        y >= p.currentY &&
        y <= p.currentY + p.height
      ) {
        setActivePieceIndex(i);
        setDragOffset({ x: x - p.currentX, y: y - p.currentY });
        break;
      }
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (activePieceIndex === null) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setPieces((prev) => {
      const next = [...prev];
      next[activePieceIndex] = {
        ...next[activePieceIndex],
        currentX: x - dragOffset.x,
        currentY: y - dragOffset.y,
      };
      return next;
    });
  };

  const handlePointerUp = () => {
    if (activePieceIndex === null) return;
    const p = pieces[activePieceIndex];

    // Check magnetic snap threshold (within 35px of target slot)
    const dist = Math.hypot(p.currentX - p.targetX, p.currentY - p.targetY);
    const updated = [...pieces];

    if (dist < 35) {
      // Snap to place
      updated[activePieceIndex] = {
        ...p,
        currentX: p.targetX,
        currentY: p.targetY,
        isPlaced: true,
      };
      setPieces(updated);
      checkWin(updated);
    }

    setActivePieceIndex(null);
  };

  // Request smart hint
  const triggerHint = async (level: HintLevel) => {
    const res = await onRequestHint(level, { pieces });
    if (res) {
      setHintsUsed((h) => h + 1);
      if (level === 3 && typeof res.targetAction?.suggestedValue === "number") {
        const targetId = res.targetAction.suggestedValue;
        const updated = pieces.map((p) =>
          p.id === targetId
            ? { ...p, currentX: p.targetX, currentY: p.targetY, isPlaced: true }
            : p
        );
        setPieces(updated);
        checkWin(updated);
      }
    }
  };

  const placedCount = pieces.filter((p) => p.isPlaced).length;

  return (
    <div className="flex flex-col xl:flex-row gap-8 items-center xl:items-start justify-center max-w-6xl mx-auto py-6">
      {/* Canvas Area */}
      <div className="flex flex-col items-center">
        {/* Header Bar */}
        <div className="w-full flex items-center justify-between px-2 mb-4 text-sm font-semibold text-gray-300">
          <div className="flex items-center gap-2">
            <span className="capitalize px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-amber-400">
              {puzzle.theme} Jigsaw
            </span>
            <div className="flex items-center gap-1.5 text-gray-400">
              <Clock className="w-4 h-4 text-cyan-400" />
              <span className="font-mono-numbers">{formatTime(timerSeconds)}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-gray-300 transition-colors"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Preview</span>
            </button>
            <span className="text-gray-300">
              Placed: <strong className="text-amber-400">{placedCount}</strong> / {pieces.length}
            </span>
            <div className="flex items-center gap-1 text-amber-400">
              <Lightbulb className="w-4 h-4" />
              <span>{hintsUsed}</span>
            </div>
          </div>
        </div>

        {/* HTML5 Canvas with Drag Support */}
        <div className="glass-panel p-3 rounded-2xl shadow-2xl border border-white/10 relative overflow-hidden">
          <canvas
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            className="rounded-xl cursor-grab active:cursor-grabbing max-w-full h-auto touch-none"
          />

          {/* Reference Image Preview Popup */}
          {showPreview && (
            <div className="absolute top-6 left-6 p-2 rounded-xl bg-black/80 backdrop-blur-md border border-white/20 shadow-2xl z-20">
              <div className="text-[10px] font-bold text-gray-300 mb-1">Target Artwork</div>
              <img
                src={puzzle.imageUrl}
                alt="Target preview"
                className="w-44 h-44 object-cover rounded-lg border border-white/10"
              />
            </div>
          )}
        </div>
      </div>

      {/* Control Panel & AI Hints */}
      <div className="w-full xl:w-72 flex flex-col gap-5">
        <div className="glass-panel p-4 rounded-2xl space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">
            Assembly Physics
          </h4>
          <p className="text-xs text-gray-400 leading-relaxed">
            Drag pieces from the tray on the right into the outline frame on the left. Pieces within snap threshold automatically lock into place.
          </p>
        </div>

        {/* 3-Tier AI Hint Buttons */}
        <div className="glass-panel p-4 rounded-2xl space-y-2 border border-purple-500/20 bg-purple-950/20">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-purple-300">
            <ImageIcon className="w-4 h-4 text-amber-400" />
            <span>AI Spatial Hints</span>
          </div>

          <div className="space-y-2 pt-1">
            <button
              onClick={() => triggerHint(1)}
              className="w-full text-left p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-gray-200 transition-all flex items-center justify-between"
            >
              <span><strong>Level 1:</strong> Border / Corner Tip</span>
              <span className="text-[10px] text-cyan-400 font-semibold">Free</span>
            </button>

            <button
              onClick={() => triggerHint(2)}
              className="w-full text-left p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-gray-200 transition-all flex items-center justify-between"
            >
              <span><strong>Level 2:</strong> Coordinate Isolate</span>
              <span className="text-[10px] text-purple-400 font-semibold">10 Sparks</span>
            </button>

            <button
              onClick={() => triggerHint(3)}
              className="w-full text-left p-2.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/40 border border-purple-500/30 text-xs text-white font-medium transition-all flex items-center justify-between"
            >
              <span><strong>Level 3:</strong> Auto-Snap Piece</span>
              <span className="text-[10px] text-amber-400 font-semibold">25 Sparks</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
