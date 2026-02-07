"use client";

import { useEffect, useState } from "react";
import { useSoundFX } from "../../hooks/useSoundFX";

interface Card {
  id: number;
  emoji: string;
  flipped: boolean;
  matched: boolean;
}

const EMOJIS = ["🎮", "🎲", "🎯", "🎪", "🎨", "🎭", "🎬", "🎤"];

const shuffle = <T,>(array: T[]): T[] => {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

const generateInitialCards = () => {
  const gameEmojis = shuffle([...EMOJIS, ...EMOJIS]);
  return gameEmojis.map((emoji, i) => ({
    id: i,
    emoji,
    flipped: false,
    matched: false,
  }));
};

export default function MemoryMatchGame() {
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedIds, setFlippedIds] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [pairs, setPairs] = useState(0);
  const [canFlip, setCanFlip] = useState(true);
  const [gameWon, setGameWon] = useState(false);
  const { playMatch, playSelect, playError, playGameOver } = useSoundFX();

  // Generate shuffled cards on client-side only to avoid hydration mismatch
  useEffect(() => {
    setCards(generateInitialCards());
  }, []);

  const initGame = () => {
    setCards(generateInitialCards());
    setFlippedIds([]);
    setMoves(0);
    setPairs(0);
    setCanFlip(true);
    setGameWon(false);
    playSelect();
  };

  const flipCard = (id: number) => {
    if (!canFlip) return;
    const card = cards.find((c) => c.id === id);
    if (!card || card.flipped || card.matched) return;
    if (flippedIds.length >= 2) return;

    setCards((prev) => prev.map((c) => (c.id === id ? { ...c, flipped: true } : c)));
    const newFlipped = [...flippedIds, id];
    setFlippedIds(newFlipped);
    playSelect();

    if (newFlipped.length === 2) {
      setMoves((m) => m + 1);
      setCanFlip(false);

      const [first, second] = newFlipped;
      const card1 = cards.find((c) => c.id === first);
      const card2 = cards.find((c) => c.id === second);

      if (card1 && card2 && card1.emoji === card2.emoji) {
        // Match!
        setCards((prev) =>
          prev.map((c) => (c.id === first || c.id === second ? { ...c, matched: true } : c)),
        );
        setPairs((p) => {
          const newPairs = p + 1;
          if (newPairs === 8) {
            setGameWon(true);
            playGameOver();
          } else {
            playMatch();
          }
          return newPairs;
        });
        setFlippedIds([]);
        setCanFlip(true);
      } else {
        // No match
        setTimeout(() => {
          setCards((prev) =>
            prev.map((c) => (c.id === first || c.id === second ? { ...c, flipped: false } : c)),
          );
          setFlippedIds([]);
          setCanFlip(true);
          playError();
        }, 1000);
      }
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-linear-to-br from-purple-900 via-indigo-900 to-slate-900 p-8">
      {/* Stats */}
      <div className="absolute right-4 top-4 z-20 text-right">
        <div className="text-2xl font-bold text-white">Moves: {moves}</div>
        <div className="text-lg text-slate-400">Pairs: {pairs}/8</div>
      </div>

      {/* Game Container */}
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="mb-8 bg-linear-to-r from-purple-400 to-pink-500 bg-clip-text text-4xl font-black text-transparent">
            🧠 Memory Match
          </h1>

          {/* Game Grid */}
          <div className="mx-auto mb-8 grid max-w-md grid-cols-4 gap-4">
            {cards.map((card) => (
              <button
                type="button"
                key={card.id}
                onClick={() => flipCard(card.id)}
                onKeyDown={(e) => e.key === "Enter" && flipCard(card.id)}
                className={`h-20 w-20 cursor-pointer transition-all duration-500 ${card.matched ? "opacity-60" : ""}`}
                style={{ perspective: 1000 }}
              >
                <div
                  className="relative h-full w-full transition-transform duration-500"
                  style={{
                    transformStyle: "preserve-3d",
                    transform: card.flipped || card.matched ? "rotateY(180deg)" : "rotateY(0)",
                  }}
                >
                  {/* Front */}
                  <div
                    className="absolute flex h-full w-full items-center justify-center rounded-xl border-2 border-white/20 text-4xl"
                    style={{
                      backfaceVisibility: "hidden",
                      background:
                        "linear-gradient(135deg, rgba(168, 85, 247, 0.3), rgba(236, 72, 153, 0.3))",
                    }}
                  >
                    ?
                  </div>
                  {/* Back */}
                  <div
                    className="absolute flex h-full w-full items-center justify-center rounded-xl border-2 border-white/30 text-4xl"
                    style={{
                      backfaceVisibility: "hidden",
                      transform: "rotateY(180deg)",
                      background:
                        "linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))",
                    }}
                  >
                    {card.emoji}
                  </div>
                </div>
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={initGame}
            className="rounded-full bg-linear-to-r from-purple-500 to-pink-500 px-8 py-3 text-xl font-bold text-white shadow-lg transition-all hover:scale-105 active:scale-95"
          >
            New Game
          </button>
        </div>
      </div>

      {/* Win Screen */}
      {gameWon && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-slate-900/90 backdrop-blur-sm">
          <div className="text-center">
            <h1 className="mb-4 bg-linear-to-r from-yellow-400 to-orange-500 bg-clip-text text-6xl font-black text-transparent">
              🎉 You Win!
            </h1>
            <p className="mb-2 text-2xl text-slate-400">Completed in</p>
            <p className="mb-8 text-4xl font-black text-white">{moves} moves</p>
            <button
              type="button"
              onClick={initGame}
              className="rounded-full bg-linear-to-r from-purple-500 to-pink-500 px-12 py-4 text-2xl font-bold text-white shadow-lg transition-all hover:scale-105 active:scale-95"
            >
              Play Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
