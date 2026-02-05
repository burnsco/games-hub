"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { wordRainWords } from "@/app/data/wordRain";

interface FallingWord {
  id: number;
  word: string;
  x: number;
  y: number;
  speed: number;
  counted: boolean; // Track if this word has already deducted a life
}

export default function WordRainGame() {
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [words, setWords] = useState<FallingWord[]>([]);
  const [input, setInput] = useState("");
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium");
  const [highScores, setHighScores] = useState<{
    easy: number;
    medium: number;
    hard: number;
  }>({ easy: 0, medium: 0, hard: 0 });
  const [stars, setStars] = useState<
    {
      width: string;
      height: string;
      left: string;
      top: string;
      animationDelay: string;
    }[]
  >([]);
  const wordIdRef = useRef(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const countedWordsRef = useRef<Set<number>>(new Set());

  const difficultySettings = useMemo(
    () =>
      ({
        easy: {
          label: "Easy",
          spawnMs: 2500,
          speedBase: 0.8,
          speedRand: 0.3,
          maxWords: 5,
        },
        medium: {
          label: "Medium",
          spawnMs: 1800,
          speedBase: 0.8,
          speedRand: 0.3,
          maxWords: 8,
        },
        hard: {
          label: "Hard",
          spawnMs: 1200,
          speedBase: 0.8,
          speedRand: 0.3,
          maxWords: 12,
        },
      }) as const,
    [],
  );

  const spawnWord = useCallback(() => {
    const wordList = wordRainWords[difficulty];
    const word = wordList[Math.floor(Math.random() * wordList.length)];
    const newWord: FallingWord = {
      id: wordIdRef.current++,
      word,
      x: Math.random() * (window.innerWidth - 200) + 50,
      y: 100,
      speed:
        difficultySettings[difficulty].speedBase +
        Math.random() * difficultySettings[difficulty].speedRand,
      counted: false,
    };
    setWords((prev) =>
      prev.length >= difficultySettings[difficulty].maxWords ? prev : [...prev, newWord],
    );
  }, [difficulty, difficultySettings]);

  const startGame = () => {
    setScore(0);
    setLives(3);
    setWords([]);
    setInput("");
    setGameOver(false);
    setIsPlaying(true);
    countedWordsRef.current.clear(); // Clear counted words on new game
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);

    // Kickstart with a word so it feels responsive
    setTimeout(() => {
      spawnWord();
    }, 150);
  };

  const handleInput = (value: string) => {
    setInput(value);
    const matchIndex = words.findIndex((w) => w.word.toLowerCase() === value.toLowerCase());
    if (matchIndex !== -1) {
      const matched = words[matchIndex];
      setScore((prev) => prev + matched.word.length * 10);
      setWords((prev) => prev.filter((w) => w.id !== matched.id));
      setInput("");
    }
  };

  // Update words
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setWords((prev) => {
        // First, update positions
        const updated = prev.map((w) => ({ ...w, y: w.y + w.speed }));

        // Find words that have crossed the threshold AND haven't been counted yet (using ref)
        const newlyFallen = updated.filter(
          (w) => w.y > window.innerHeight - 150 && !countedWordsRef.current.has(w.id),
        );

        // Mark these words as counted in the ref (synchronously, no state delay)
        for (const w of newlyFallen) {
          countedWordsRef.current.add(w.id);
        }

        // Deduct one life per newly fallen word
        if (newlyFallen.length > 0) {
          setLives((l) => {
            const newLives = l - newlyFallen.length;
            if (newLives <= 0) {
              setIsPlaying(false);
              setGameOver(true);
            }
            return Math.max(0, newLives);
          });
        }

        // Filter out words that have fallen
        return updated.filter((w) => w.y <= window.innerHeight - 150);
      });
    }, 16);

    return () => clearInterval(interval);
  }, [isPlaying]);

  // Spawn words
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(spawnWord, difficultySettings[difficulty].spawnMs);
    return () => clearInterval(interval);
  }, [isPlaying, spawnWord, difficulty, difficultySettings]);

  // Generate stars on client-side only to avoid hydration mismatch
  useEffect(() => {
    setStars(
      Array.from({ length: 100 }).map(() => ({
        width: `${Math.random() * 3 + 1}px`,
        height: `${Math.random() * 3 + 1}px`,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        animationDelay: `${Math.random() * 2}s`,
      })),
    );
  }, []);

  // Load high scores from localStorage on client-side only to avoid hydration mismatch
  useEffect(() => {
    const saved = localStorage.getItem("wordRainHighScores");
    if (saved) {
      try {
        setHighScores(JSON.parse(saved));
      } catch {
        // ignore
      }
    }
  }, []);

  // Save high score to localStorage when game ends
  useEffect(() => {
    if (!gameOver) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHighScores((prev) => {
      const best = Math.max(prev[difficulty], score);
      const next = { ...prev, [difficulty]: best };
      localStorage.setItem("wordRainHighScores", JSON.stringify(next));
      return next;
    });
  }, [gameOver, score, difficulty]);

  return (
    <div className="relative h-screen w-full overflow-hidden bg-linear-to-b from-slate-900 via-indigo-950 to-slate-900">
      {/* Stars */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {stars.map((star) => (
          <div
            key={`star-${star.left}-${star.top}`}
            className="absolute animate-pulse rounded-full bg-white"
            style={star}
          />
        ))}
      </div>

      {/* Lives */}
      <div className="absolute right-4 top-4 z-20 flex gap-2">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className={`text-3xl transition-all ${
              i >= lives ? "scale-75 opacity-30 grayscale" : ""
            }`}
          >
            ❤️
          </span>
        ))}
      </div>

      {/* Score */}
      <div className="absolute left-1/2 top-4 z-20 -translate-x-1/2 text-center">
        <div className="bg-linear-to-b from-cyan-400 to-blue-600 bg-clip-text text-4xl font-black text-transparent">
          {score}
        </div>
        <div className="text-sm uppercase tracking-widest text-slate-400">Score</div>
      </div>

      {/* Falling Words */}
      {words.map((w) => (
        <div
          key={w.id}
          className="absolute font-mono text-2xl font-bold text-white"
          style={{
            left: w.x,
            top: w.y,
            textShadow: "0 0 20px rgba(56, 189, 248, 0.8), 0 0 40px rgba(56, 189, 248, 0.4)",
          }}
        >
          {w.word}
        </div>
      ))}

      {/* Input */}
      {isPlaying && (
        <div className="absolute bottom-0 left-0 right-0 z-20 p-6">
          <div className="mx-auto max-w-xl">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => handleInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && setInput("")}
              className="w-full rounded-xl border-2 border-cyan-400/50 bg-white/10 px-6 py-4 text-center font-mono text-2xl text-white backdrop-blur-md placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-4 focus:ring-cyan-400/20"
              placeholder="Type here..."
              autoComplete="off"
            />
          </div>
        </div>
      )}

      {/* Start/Game Over Screen */}
      {(!isPlaying || gameOver) && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-slate-900/90 backdrop-blur-sm">
          <div className="w-90 rounded-2xl border border-white/10 bg-white/5 p-8 text-center backdrop-blur-md">
            <h1 className="mb-4 bg-linear-to-r from-cyan-400 to-blue-500 bg-clip-text text-6xl font-black text-transparent">
              {gameOver ? "Game Over!" : "🌧️ WordRain"}
            </h1>
            {gameOver && <p className="mb-8 text-6xl font-black text-white">{score}</p>}
            <p className="mb-6 text-lg text-slate-400">
              {gameOver ? "Final Score" : "Type the words before they fall!"}
            </p>

            <div className="mb-6 flex items-center justify-center gap-2">
              {(["easy", "medium", "hard"] as const).map((level) => {
                const active = difficulty === level;
                return (
                  <button
                    type="button"
                    key={level}
                    onClick={() => setDifficulty(level)}
                    className={`rounded-lg px-3 py-2 text-sm font-semibold transition-all ${
                      active
                        ? "bg-cyan-400 text-slate-900 shadow-md"
                        : "bg-white/10 text-slate-200 hover:bg-white/20"
                    }`}
                  >
                    {difficultySettings[level].label}
                  </button>
                );
              })}
            </div>

            <div className="mb-6 rounded-xl border border-white/10 bg-white/10 p-3 text-left text-sm text-slate-200">
              <div className="mb-2 text-xs uppercase tracking-wider text-slate-400">
                High Scores
              </div>
              <div className="flex justify-between">
                <span>Easy</span>
                <span className="font-semibold">{highScores.easy}</span>
              </div>
              <div className="flex justify-between">
                <span>Medium</span>
                <span className="font-semibold">{highScores.medium}</span>
              </div>
              <div className="flex justify-between">
                <span>Hard</span>
                <span className="font-semibold">{highScores.hard}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={startGame}
              className="rounded-full bg-linear-to-r from-cyan-500 to-blue-600 px-12 py-4 text-2xl font-bold text-white shadow-lg transition-all hover:scale-105 active:scale-95"
            >
              {gameOver ? "Play Again" : "Start Game"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
