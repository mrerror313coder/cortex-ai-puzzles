import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cortex AI Puzzles | Adaptive Generative Puzzle Platform",
  description: "Next-generation AI-powered puzzle platform featuring Sudoku, Crosswords, Word Search, and Jigsaw puzzles with adaptive difficulty and intelligent pedagogical hints.",
  keywords: ["AI puzzle", "Sudoku", "Crossword", "Word Search", "Jigsaw", "Adaptive Gaming", "AI Hints"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="antialiased selection:bg-purple-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
