import { JigsawPuzzle, JigsawPiece, DifficultyLevel, HintResponse } from "../types";

export class JigsawEngine {
  // Generate interlocking pieces
  static createPieces(
    rows: number,
    cols: number,
    boardWidth: number,
    boardHeight: number,
    trayWidth: number
  ): JigsawPiece[] {
    const pieceWidth = boardWidth / cols;
    const pieceHeight = boardHeight / rows;
    const pieces: JigsawPiece[] = [];

    // Store horizontal and vertical edges to ensure perfect mating
    // hEdges[r][c] = bottom tab of piece (r, c)
    const hEdges: number[][] = Array.from({ length: rows - 1 }, () =>
      Array.from({ length: cols }, () => (Math.random() < 0.5 ? 1 : -1))
    );
    // vEdges[r][c] = right tab of piece (r, c)
    const vEdges: number[][] = Array.from({ length: rows }, () =>
      Array.from({ length: cols - 1 }, () => (Math.random() < 0.5 ? 1 : -1))
    );

    let id = 0;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        // Outer borders are flat (0)
        const topTab = r === 0 ? 0 : -hEdges[r - 1][c];
        const bottomTab = r === rows - 1 ? 0 : hEdges[r][c];
        const leftTab = c === 0 ? 0 : -vEdges[r][c - 1];
        const rightTab = c === cols - 1 ? 0 : vEdges[r][c];

        const targetX = c * pieceWidth;
        const targetY = r * pieceHeight;

        // Initial scattered position in tray
        const randomTrayX =
          boardWidth + 30 + Math.random() * Math.max(100, trayWidth - pieceWidth - 50);
        const randomTrayY =
          20 + Math.random() * Math.max(100, boardHeight - pieceHeight - 40);

        pieces.push({
          id: id++,
          row: r,
          col: c,
          currentX: randomTrayX,
          currentY: randomTrayY,
          targetX,
          targetY,
          width: pieceWidth,
          height: pieceHeight,
          isPlaced: false,
          topTab,
          rightTab,
          bottomTab,
          leftTab,
        });
      }
    }

    return pieces;
  }

  // Draw a single jigsaw piece path onto HTML5 Canvas with cubic Bezier curves
  static drawPiecePath(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    piece: { topTab: number; rightTab: number; bottomTab: number; leftTab: number }
  ) {
    const tabSizeX = w * 0.22;
    const tabSizeY = h * 0.22;

    ctx.beginPath();
    ctx.moveTo(x, y);

    // Top Edge
    if (piece.topTab === 0) {
      ctx.lineTo(x + w, y);
    } else {
      const dir = piece.topTab;
      ctx.lineTo(x + w * 0.35, y);
      ctx.bezierCurveTo(
        x + w * 0.35, y - tabSizeY * dir,
        x + w * 0.45, y - tabSizeY * dir * 1.3,
        x + w * 0.5, y - tabSizeY * dir * 1.3
      );
      ctx.bezierCurveTo(
        x + w * 0.55, y - tabSizeY * dir * 1.3,
        x + w * 0.65, y - tabSizeY * dir,
        x + w * 0.65, y
      );
      ctx.lineTo(x + w, y);
    }

    // Right Edge
    if (piece.rightTab === 0) {
      ctx.lineTo(x + w, y + h);
    } else {
      const dir = piece.rightTab;
      ctx.lineTo(x + w, y + h * 0.35);
      ctx.bezierCurveTo(
        x + w + tabSizeX * dir, y + h * 0.35,
        x + w + tabSizeX * dir * 1.3, y + h * 0.45,
        x + w + tabSizeX * dir * 1.3, y + h * 0.5
      );
      ctx.bezierCurveTo(
        x + w + tabSizeX * dir * 1.3, y + h * 0.55,
        x + w + tabSizeX * dir, y + h * 0.65,
        x + w, y + h * 0.65
      );
      ctx.lineTo(x + w, y + h);
    }

    // Bottom Edge
    if (piece.bottomTab === 0) {
      ctx.lineTo(x, y + h);
    } else {
      const dir = piece.bottomTab;
      ctx.lineTo(x + w * 0.65, y + h);
      ctx.bezierCurveTo(
        x + w * 0.65, y + h + tabSizeY * dir,
        x + w * 0.55, y + h + tabSizeY * dir * 1.3,
        x + w * 0.5, y + h + tabSizeY * dir * 1.3
      );
      ctx.bezierCurveTo(
        x + w * 0.45, y + h + tabSizeY * dir * 1.3,
        x + w * 0.35, y + h + tabSizeY * dir,
        x + w * 0.35, y + h
      );
      ctx.lineTo(x, y + h);
    }

    // Left Edge
    if (piece.leftTab === 0) {
      ctx.closePath();
    } else {
      const dir = piece.leftTab;
      ctx.lineTo(x, y + h * 0.65);
      ctx.bezierCurveTo(
        x - tabSizeX * dir, y + h * 0.65,
        x - tabSizeX * dir * 1.3, y + h * 0.55,
        x - tabSizeX * dir * 1.3, y + h * 0.5
      );
      ctx.bezierCurveTo(
        x - tabSizeX * dir * 1.3, y + h * 0.45,
        x - tabSizeX * dir, y + h * 0.35,
        x, y + h * 0.35
      );
      ctx.closePath();
    }
  }

  // Generate Jigsaw metadata
  static generatePuzzle(
    theme: string = "Cosmic Nebula",
    difficulty: DifficultyLevel = "medium"
  ): JigsawPuzzle {
    let rows = 4;
    let cols = 4;
    if (difficulty === "easy") {
      rows = 3;
      cols = 3;
    } else if (difficulty === "hard") {
      rows = 5;
      cols = 5;
    } else if (difficulty === "expert") {
      rows = 6;
      cols = 6;
    }

    // Curated high quality high-res generative landscape & cosmic art
    const artGallery: Record<string, string> = {
      Cosmic: "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?q=80&w=1200&auto=format&fit=crop",
      Cyberpunk: "https://images.unsplash.com/photo-1519501025264-65ba15a82390?q=80&w=1200&auto=format&fit=crop",
      Nature: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=1200&auto=format&fit=crop",
      Abstract: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop",
    };

    const imageUrl = artGallery[theme] || artGallery["Cosmic"];

    return {
      id: `jigsaw-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      title: `${theme} Jigsaw`,
      theme,
      difficulty,
      imageUrl,
      rows,
      cols,
      pieceCount: rows * cols,
      createdAt: new Date().toISOString(),
    };
  }

  // Smart hints for Jigsaw
  static getSmartHint(pieces: JigsawPiece[], level: 1 | 2 | 3): HintResponse {
    const unplaced = pieces.filter((p) => !p.isPlaced);
    if (unplaced.length === 0) {
      return {
        level: 1,
        title: "Puzzle Complete",
        nudge: "All jigsaw pieces are successfully in place!",
      };
    }

    // Try finding a corner piece first (two flat edges)
    const corners = unplaced.filter(
      (p) =>
        (p.topTab === 0 || p.bottomTab === 0) &&
        (p.leftTab === 0 || p.rightTab === 0)
    );

    const target = corners.length > 0 ? corners[0] : unplaced[0];

    if (level === 1) {
      const isCorner =
        (target.topTab === 0 || target.bottomTab === 0) &&
        (target.leftTab === 0 || target.rightTab === 0);
      return {
        level: 1,
        title: isCorner ? "Corner Strategy" : "Border Detection",
        nudge: isCorner
          ? `Focus on the 4 corners of the board. You have an unplaced corner piece waiting in the tray!`
          : `Look for pieces with straight outer edges to establish the border frame first.`,
      };
    } else if (level === 2) {
      return {
        level: 2,
        title: "Piece Identified",
        nudge: `Piece #${target.id + 1} belongs in Row ${target.row + 1}, Column ${target.col + 1}.`,
        details: `Drag this piece near its designated frame slot to trigger the magnetic snap.`,
        targetAction: {
          row: target.row,
          col: target.col,
          suggestedValue: target.id,
        },
      };
    } else {
      return {
        level: 3,
        title: "Auto-Alignment Assist",
        nudge: `Snapping Piece #${target.id + 1} directly into its correct target position at (${target.row + 1}, ${target.col + 1}).`,
        targetAction: {
          row: target.row,
          col: target.col,
          suggestedValue: target.id,
        },
      };
    }
  }
}
