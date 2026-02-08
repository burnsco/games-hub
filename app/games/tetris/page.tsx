import type { Metadata } from "next";
import TetrisGame from "./component";

export const metadata: Metadata = {
  title: "Tetris",
  description:
    "Play the quintessential block-stacking puzzle game. Clear lines, score points, and challenge your spatial skills in this browser-based Tetris experience.",
  openGraph: {
    title: "Tetris | Games Hub",
    description: "Play Tetris instantly in your browser. No downloads required.",
  },
};

export default function Page() {
  return <TetrisGame />;
}
