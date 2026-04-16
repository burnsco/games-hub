import { useCallback, useMemo, useState } from "react";
import { useSoundFX } from "../../hooks/useSoundFX";

interface Card {
  id: number;
  emoji: string;
  flipped: boolean;
  matched: boolean;
}

type Difficulty = "easy" | "medium" | "hard";
type GameState = "selecting" | "playing" | "won" | "lost";

const EMOJIS = [
  "🎮",
  "🎲",
  "🎯",
  "🎪",
  "🎨",
  "🎭",
  "🎬",
  "🎤",
  "🎸",
  "🚀",
  "🧩",
  "⚡",
  "🪐",
  "🎧",
  "🏆",
  "🔥",
];

const DIFFICULTY_CONFIG: Record<
  Difficulty,
  { label: string; pairs: number; cols: number; chances: number }
> = {
  easy: { label: "Easy", pairs: 8, cols: 4, chances: 7 },
  medium: { label: "Medium", pairs: 10, cols: 5, chances: 8 },
  hard: { label: "Hard", pairs: 12, cols: 6, chances: 9 },
};

const shuffle = <T,>(array: T[]): T[] => {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

const generateCards = (pairs: number) => {
  const source = shuffle(EMOJIS).slice(0, pairs);
  const gameEmojis = shuffle([...source, ...source]);
  return gameEmojis.map((emoji, i) => ({
    id: i,
    emoji,
    flipped: false,
    matched: false,
  }));
};

export default function MemoryMatchGame() {
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedIds, setFlippedIds] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [pairs, setPairs] = useState(0);
  const [chancesLeft, setChancesLeft] = useState(DIFFICULTY_CONFIG.easy.chances);
  const [canFlip, setCanFlip] = useState(true);
  const [gameState, setGameState] = useState<GameState>("selecting");

  const { playMatch, playSelect, playError, playGameOver } = useSoundFX();

  const config = DIFFICULTY_CONFIG[difficulty];

  const initGame = useCallback(
    (nextDifficulty: Difficulty = difficulty) => {
      const nextConfig = DIFFICULTY_CONFIG[nextDifficulty];
      setCards(generateCards(nextConfig.pairs));
      setFlippedIds([]);
      setMoves(0);
      setPairs(0);
      setChancesLeft(nextConfig.chances);
      setCanFlip(true);
      setGameState("playing");
      playSelect();
    },
    [difficulty, playSelect],
  );

  const totalCards = config.pairs * 2;
  const rowCount = Math.ceil(totalCards / config.cols);

  const cardFaceClass = useMemo(() => {
    if (config.cols >= 6) return "text-2xl md:text-3xl";
    if (config.cols === 5) return "text-3xl md:text-4xl";
    return "text-4xl md:text-5xl";
  }, [config.cols]);

  const flipCard = (id: number) => {
    if (!canFlip || gameState !== "playing") return;
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
        setCards((prev) =>
          prev.map((c) => (c.id === first || c.id === second ? { ...c, matched: true } : c)),
        );
        setPairs((p) => {
          const nextPairs = p + 1;
          if (nextPairs === config.pairs) {
            setGameState("won");
            playGameOver();
          } else {
            playMatch();
          }
          return nextPairs;
        });
        setFlippedIds([]);
        setCanFlip(true);
      } else {
        setTimeout(() => {
          setCards((prev) =>
            prev.map((c) => (c.id === first || c.id === second ? { ...c, flipped: false } : c)),
          );
          setFlippedIds([]);
          setCanFlip(true);
          setChancesLeft((prev) => {
            const next = prev - 1;
            if (next <= 0) {
              setGameState("lost");
              playGameOver();
              return 0;
            }
            playError();
            return next;
          });
        }, 850);
      }
    }
  };

  return (
    <div className="relative h-[100dvh] w-full overflow-hidden bg-linear-to-br from-purple-900 via-indigo-900 to-slate-900 p-4 md:p-8">
      {gameState !== "selecting" && (
        <div className="absolute right-4 top-4 z-20 text-right">
          <div className="text-2xl font-bold text-white">Moves: {moves}</div>
          <div className="text-lg text-slate-300">
            Pairs: {pairs}/{config.pairs}
          </div>
          <div className="text-lg text-amber-300">Chances: {chancesLeft}</div>
        </div>
      )}

      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          {gameState !== "selecting" && (
            <>
              <div
                className="mx-auto mb-6 grid gap-2"
                style={{
                  gridTemplateColumns: `repeat(${config.cols}, minmax(clamp(46px, 10vw, 82px), clamp(46px, 10vw, 82px)))`,
                  maxWidth: `min(94vw, ${config.cols * 82 + (config.cols - 1) * 8}px)`,
                  maxHeight: `min(76dvh, ${rowCount * 82 + (rowCount - 1) * 8}px)`,
                }}
              >
                {cards.map((card) => (
                  <button
                    type="button"
                    key={card.id}
                    onClick={() => flipCard(card.id)}
                    onKeyDown={(e) => e.key === "Enter" && flipCard(card.id)}
                    className={`aspect-square w-full cursor-pointer transition-all duration-500 ${card.matched ? "opacity-60" : "opacity-100"}`}
                    style={{ perspective: 1000 }}
                  >
                    <div
                      className="relative h-full w-full transition-transform duration-500"
                      style={{
                        transformStyle: "preserve-3d",
                        transform: card.flipped || card.matched ? "rotateY(180deg)" : "rotateY(0)",
                      }}
                    >
                      <div
                        className={`absolute flex h-full w-full items-center justify-center rounded-xl border-2 border-white/20 font-black ${cardFaceClass}`}
                        style={{
                          backfaceVisibility: "hidden",
                          background:
                            "linear-gradient(135deg, rgba(168, 85, 247, 0.3), rgba(236, 72, 153, 0.3))",
                        }}
                      >
                        ?
                      </div>
                      <div
                        className={`absolute flex h-full w-full items-center justify-center rounded-xl border-2 border-white/30 ${cardFaceClass}`}
                        style={{
                          backfaceVisibility: "hidden",
                          transform: "rotateY(180deg)",
                          background: "#ffffff",
                        }}
                      >
                        {card.emoji}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              <div className="mx-auto flex w-full max-w-3xl flex-wrap items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => initGame()}
                  className="rounded-full bg-linear-to-r from-purple-500 to-pink-500 px-4 py-2 text-sm font-bold text-white shadow-lg transition-all hover:scale-105 active:scale-95"
                >
                  Reset
                </button>
                {(["easy", "medium", "hard"] as const).map((level) => (
                  <button
                    type="button"
                    key={level}
                    onClick={() => {
                      setDifficulty(level);
                      initGame(level);
                    }}
                    className={`rounded-full border px-3 py-2 text-sm font-bold transition-all hover:scale-105 active:scale-95 ${
                      difficulty === level
                        ? "border-white/40 bg-white/25 text-white"
                        : "border-white/20 bg-white/10 text-slate-200 hover:bg-white/20"
                    }`}
                  >
                    {DIFFICULTY_CONFIG[level].label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {gameState === "selecting" && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-slate-900/90 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
            <h1 className="mb-3 bg-linear-to-r from-purple-300 to-pink-400 bg-clip-text text-5xl font-black text-transparent">
              🧠 Memory Match
            </h1>
            <p className="mb-6 text-slate-300">Choose your difficulty before starting.</p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {(["easy", "medium", "hard"] as const).map((level) => (
                <button
                  type="button"
                  key={level}
                  onClick={() => {
                    setDifficulty(level);
                    initGame(level);
                  }}
                  className="rounded-xl border border-white/15 bg-white/10 px-4 py-4 text-left transition-all hover:scale-[1.02] hover:bg-white/15"
                >
                  <div className="text-lg font-bold text-white">
                    {DIFFICULTY_CONFIG[level].label}
                  </div>
                  <div className="mt-1 text-xs text-slate-300">
                    {DIFFICULTY_CONFIG[level].pairs} pairs • {DIFFICULTY_CONFIG[level].chances}{" "}
                    chances
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {(gameState === "won" || gameState === "lost") && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-slate-900/90 backdrop-blur-sm">
          <div className="text-center">
            {gameState === "won" ? (
              <>
                <h1 className="mb-4 bg-linear-to-r from-yellow-400 to-orange-500 bg-clip-text text-6xl font-black text-transparent">
                  🎉 You Win!
                </h1>
                <p className="mb-2 text-2xl text-slate-400">Completed in</p>
                <p className="mb-8 text-4xl font-black text-white">{moves} moves</p>
              </>
            ) : (
              <>
                <h1 className="mb-4 bg-linear-to-r from-red-400 to-orange-500 bg-clip-text text-6xl font-black text-transparent">
                  Out of Chances
                </h1>
                <p className="mb-8 text-2xl text-slate-300">Try again or lower the difficulty.</p>
              </>
            )}
            <button
              type="button"
              onClick={() => initGame()}
              className="rounded-full bg-linear-to-r from-purple-500 to-pink-500 px-12 py-4 text-2xl font-bold text-white shadow-lg transition-all hover:scale-105 active:scale-95"
            >
              Play Again
            </button>
            <button
              type="button"
              onClick={() => setGameState("selecting")}
              className="ml-3 rounded-full border border-white/20 bg-white/10 px-8 py-4 text-lg font-bold text-white transition-all hover:bg-white/20"
            >
              Change Difficulty
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
