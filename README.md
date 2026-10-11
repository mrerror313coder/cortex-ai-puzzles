# CORTEX AI: Adaptive Generative Puzzle Platform

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/mrerror313coder/cortex-ai-puzzles)

A full-stack, responsive web application engineered with **Next.js 14+ (App Router), TypeScript, Tailwind CSS, and HTML5 Canvas**. CORTEX AI pairs deterministic constraint solvers with Generative AI to deliver guaranteed-solvable, endlessly replayable, and pedagogically assisted puzzles.

---

## 🎮 Playable Puzzle Chambers

1. **Quantum Sudoku (Exact Cover & DLX Engine)**
   - Backtracking algorithm with unique solution verification.
   - 9x9 grid with 3x3 box borders, selected row/col/box highlighting, candidate matching, and pencil/notes mode.
   - Keyboard controls (`1-9`, `Backspace`/`Delete`, arrow keys, `N` for notes).

2. **Neural Crossword (Thematic Graph Synthesis)**
   - Orthogonal graph layout compiler with dictionary validation.
   - Across & Down synchronized clue lists, cursor auto-advance, and keyboard navigation.

3. **Matrix Word Search (8-Direction Spatial Search)**
   - 2D letter matrix supporting horizontal, vertical, and diagonal directions with frequency-weighted letter fillers.
   - Interactive touch and mouse drag-to-select word tracing with persistent color tags and strike-through vocabulary lists.

4. **Generative Jigsaw (HTML5 Bezier Interlocking Canvas)**
   - Procedural jigsaw decomposition ($3\times3$ to $6\times6$) with complementary cubic Bezier tab/blank curves.
   - Smooth canvas drag-and-drop, tray piece scatter, and magnetic snap-to-slot physics.

---

## 🤖 AI Smart Features

* **3-Tier Pedagogical Hint System:**
  * **Level 1 (Directional Nudge):** Subtle clue without spoiling (e.g. highlighting a 3x3 box or word quadrant).
  * **Level 2 (Candidate Pruning):** Pinpoints conflict coordinates or reveals first/last letters.
  * **Level 3 (Step-by-Step Logic):** Explains the deductive reasoning and executes the solution step.
* **Natural Language Puzzle Synthesis:** Type prompts like *"Give me a hard space crossword"* or *"Cyberpunk word search"*, parsed via `/api/ai/prompt-search` and generated on demand.
* **Adaptive ELO Difficulty Tuning:** Real-time skill rating based on solve speed, mistakes, and hint count, dynamically calibrating future challenges.
* **Daily Challenge & Streaks:** Daily puzzle bonuses with double ELO rewards and persistent fire streak counters.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ (tested on Node v24)
- npm or pnpm

### Running Locally
```bash
# Install dependencies
npm run install

# Start local dev server (default port: 3000)
npm run dev

# Build optimized production bundle
npm run build
npm start
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🏛️ Project Directory Structure

```
├── src/
│   ├── app/
│   │   ├── api/ai/
│   │   │   ├── generate/route.ts      # Puzzle generation endpoint (Sudoku, Crossword, Word Search, Jigsaw)
│   │   │   ├── hint/route.ts          # 3-tier pedagogical hint API
│   │   │   └── prompt-search/route.ts # Natural language NLP prompt parser
│   │   ├── globals.css                # Glassmorphism, animations, custom scrollbars
│   │   ├── layout.tsx                 # SEO metadata, Outfit typography
│   │   └── page.tsx                   # Main Dashboard Hub & Game Chamber View
│   ├── components/
│   │   ├── Navbar.tsx                 # Branding, ELO rating, streaks, and Sparks counter
│   │   ├── DailyChallengeBanner.tsx   # Daily challenge hero section
│   │   ├── GameCard.tsx               # Puzzle category cards with difficulty calibration
│   │   ├── SudokuGame.tsx             # Interactive 9x9 Sudoku board & controls
│   │   ├── CrosswordGame.tsx          # Interactive Crossword board & clue viewers
│   │   ├── WordSearchGame.tsx         # Drag-to-select 2D Word Search
│   │   ├── JigsawGame.tsx             # HTML5 Canvas Jigsaw with Bezier physics
│   │   ├── SmartHintModal.tsx         # 3-Tier AI guidance modal
│   │   ├── AiGeneratorModal.tsx       # On-demand NLP puzzle synthesizer
│   │   ├── WinModal.tsx               # Confetti celebration, ELO gains, achievements
│   │   └── StatsModal.tsx             # Player profile analytics & trophy gallery
│   └── lib/
│       ├── types.ts                   # Core TypeScript domain models
│       ├── storage.ts                 # LocalStorage persistence, streaks, achievements
│       ├── sample-puzzles.ts          # Curated thematic banks (AI, Space, Cyberpunk, Ancient)
│       └── engines/
│           ├── sudoku.ts              # Backtracking DLX generator & deduction analyzer
│           ├── crossword.ts           # Orthogonal graph placement & solver
│           ├── wordsearch.ts          # 8-direction matrix placer & radar locator
│           ├── jigsaw.ts              # Bezier interlocking tab/blank curve cutter
│           └── adaptive.ts            # ELO & skill-based calibration engine
├── PROPOSAL.md                        # Complete project blueprint & economic model
└── package.json
```
