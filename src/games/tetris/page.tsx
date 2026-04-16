import { PageMeta } from "../../components/PageMeta";
import TetrisGame from "./component";

export default function TetrisPage() {
  return (
    <>
      <PageMeta
        title="Tetris"
        description="Play the quintessential block-stacking puzzle game. Clear lines, score points, and challenge your spatial skills in this browser-based Tetris experience."
        ogTitle="Tetris | Games Hub"
        ogDescription="Play Tetris instantly in your browser. No downloads required."
      />
      <TetrisGame />
    </>
  );
}
