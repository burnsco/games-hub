"use client";

import { useEffect, useState } from "react";

interface Card {
  id: number;
  emoji: string;
  flipped: boolean;
  matched: boolean;
}

const EMOJIS = ["🎮", "🎲", "🎯", "🎪", "🎨", "🎭", "🎬", "🎤"];

export default function MemoryMatchGame() {
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedIds, setFlippedIds] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [pairs, setPairs] = useState(0);
  const [canFlip, setCanFlip] = useState(true);
  const [gameWon, setGameWon] = useState(false);

  const shuffle = <T,>(array: T[]): T[] => {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };

  const initGame = () => {
    const gameEmojis = shuffle([...EMOJIS, ...EMOJIS]);
    setCards(
      gameEmojis.map((emoji, i) => ({
        id: i,
        emoji,
        flipped: false,
        matched: false,
      })),
    );
    setFlippedIds([]);
    setMoves(0);
    setPairs(0);
    setCanFlip(true);
    setGameWon(false);
  };

  useEffect(() => {
    initGame();
  }, []);

  const flipCard = (id: number) => {
    if (!canFlip) return;
    const card = cards.find((c) => c.id === id);
    if (!card || card.flipped || card.matched) return;
    if (flippedIds.length >= 2) return;

    setCards((prev) => prev.map((c) => (c.id === id ? { ...c, flipped: true } : c)));
    const newFlipped = [...flippedIds, id];
    setFlippedIds(newFlipped);

    if (newFlipped.length === 2) {
      setMoves((m) => m + 1);
      setCanFlip(false);

      const [first, second] = newFlipped;
      const card1 = cards.find((c) => c.id === first)!;
      const card2 = cards.find((c) => c.id === second)!;

      if (card1.emoji === card2.emoji) {
        // Match!
        setCards((prev) =>
          prev.map((c) => (c.id === first || c.id === second ? { ...c, matched: true } : c)),
        );
        setPairs((p) => {
          const newPairs = p + 1;
          if (newPairs === 8) setGameWon(true);
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
        }, 1000);
      }
    }
  };

  return (
    <div className="relative w-full min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-slate-900 p-8">
      {/* Stats */}
      <div className="absolute top-4 right-4 text-right z-20">
        <div className="text-2xl font-bold text-white">Moves: {moves}</div>
        <div className="text-lg text-slate-400">Pairs: {pairs}/8</div>
      </div>

      {/* Game Container */}
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500 mb-8">
            🧠 Memory Match
          </h1>

          {/* Game Grid */}
          <div className="grid grid-cols-4 gap-4 max-w-md mx-auto mb-8">
            {cards.map((card) => (
              <div
                key={card.id}
                onClick={() => flipCard(card.id)}
                className={`w-20 h-20 cursor-pointer transition-all duration-500 ${card.matched ? "opacity-60" : ""}`}
                style={{ perspective: 1000 }}
              >
                <div
                  className="relative w-full h-full transition-transform duration-500"
                  style={{
                    transformStyle: "preserve-3d",
                    transform: card.flipped || card.matched ? "rotateY(180deg)" : "rotateY(0)",
                  }}
                >
                  {/* Front */}
                  <div
                    className="absolute w-full h-full rounded-xl flex items-center justify-center text-4xl border-2 border-white/20"
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
                    className="absolute w-full h-full rounded-xl flex items-center justify-center text-4xl border-2 border-white/30"
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
              </div>
            ))}
          </div>

          <button
            onClick={initGame}
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-3 rounded-full text-xl font-bold hover:scale-105 active:scale-95 transition-all shadow-lg"
          >
            New Game
          </button>
        </div>
      </div>

      {/* Win Screen */}
      {gameWon && (
        <div className="fixed inset-0 flex items-center justify-center z-30 bg-slate-900/90 backdrop-blur-sm">
          <div className="text-center">
            <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 mb-4">
              🎉 You Win!
            </h1>
            <p className="text-slate-400 text-2xl mb-2">Completed in</p>
            <p className="text-4xl font-black text-white mb-8">{moves} moves</p>
            <button
              onClick={initGame}
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-12 py-4 rounded-full text-2xl font-bold hover:scale-105 active:scale-95 transition-all shadow-lg"
            >
              Play Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
