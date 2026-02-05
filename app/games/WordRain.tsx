"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface FallingWord {
  id: number;
  word: string;
  x: number;
  y: number;
  speed: number;
}

const WORDS = [
  "code",
  "debug",
  "type",
  "rain",
  "cloud",
  "storm",
  "thunder",
  "lightning",
  "keyboard",
  "screen",
  "mouse",
  "click",
  "scroll",
  "page",
  "web",
  "site",
  "javascript",
  "python",
  "html",
  "css",
  "react",
  "node",
  "server",
  "client",
  "function",
  "variable",
  "loop",
  "array",
  "object",
  "string",
  "number",
  "hello",
  "world",
  "game",
  "play",
  "score",
  "level",
  "life",
  "heart",
];

export default function WordRainGame() {
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [words, setWords] = useState<FallingWord[]>([]);
  const [input, setInput] = useState("");
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium");
  const [highScores, setHighScores] = useState({
    easy: 0,
    medium: 0,
    hard: 0,
  });
  const [stars, setStars] = useState<
    { width: string; height: string; left: string; top: string; animationDelay: string }[]
  >([]);
  const wordIdRef = useRef(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const difficultySettings = {
    easy: { label: "Easy", spawnMs: 2200, speedBase: 0.4, speedRand: 0.4, maxWords: 6 },
    medium: { label: "Medium", spawnMs: 1400, speedBase: 0.7, speedRand: 0.7, maxWords: 10 },
    hard: { label: "Hard", spawnMs: 900, speedBase: 1.1, speedRand: 1.0, maxWords: 16 },
  } as const;

  const spawnWord = useCallback(() => {
    const word = WORDS[Math.floor(Math.random() * WORDS.length)];
    const newWord: FallingWord = {
      id: wordIdRef.current++,
      word,
      x: Math.random() * (window.innerWidth - 200) + 50,
      y: 100,
      speed:
        difficultySettings[difficulty].speedBase +
        Math.random() * difficultySettings[difficulty].speedRand,
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
        const updated = prev.map((w) => ({ ...w, y: w.y + w.speed }));
        const fallen = updated.filter((w) => w.y > window.innerHeight - 150);

        if (fallen.length > 0) {
          setLives((l) => {
            const newLives = l - fallen.length;
            if (newLives <= 0) {
              setIsPlaying(false);
              setGameOver(true);
            }
            return Math.max(0, newLives);
          });
        }

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

  // Generate stars on client only to avoid hydration mismatch
  useEffect(() => {
    const nextStars = Array.from({ length: 100 }).map(() => ({
      width: `${Math.random() * 3 + 1}px`,
      height: `${Math.random() * 3 + 1}px`,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      animationDelay: `${Math.random() * 2}s`,
    }));
    setStars(nextStars);
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem("wordRainHighScores");
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as { easy: number; medium: number; hard: number };
        setHighScores((prev) => ({ ...prev, ...parsed }));
      } catch {
        // ignore
      }
    }
  }, []);

  useEffect(() => {
    if (!gameOver) return;
    setHighScores((prev) => {
      const best = Math.max(prev[difficulty], score);
      const next = { ...prev, [difficulty]: best };
      localStorage.setItem("wordRainHighScores", JSON.stringify(next));
      return next;
    });
  }, [gameOver, score, difficulty]);

  return (
    <div className="relative w-full h-screen bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900 overflow-hidden">
      {/* Stars */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {stars.map((star, i) => (
          <div
            key={i}
            className="absolute bg-white rounded-full animate-pulse"
            style={star}
          />
        ))}
      </div>

      {/* Lives */}
      <div className="absolute top-4 right-4 flex gap-2 z-20">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className={`text-3xl transition-all ${i >= lives ? "grayscale opacity-30 scale-75" : ""}`}
          >
            ❤️
          </span>
        ))}
      </div>

      {/* Score */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 text-center">
        <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-b from-cyan-400 to-blue-600">
          {score}
        </div>
        <div className="text-sm text-slate-400 uppercase tracking-widest">Score</div>
      </div>

      {/* Falling Words */}
      {words.map((w) => (
        <div
          key={w.id}
          className="absolute text-2xl font-bold text-white font-mono"
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
        <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
          <div className="max-w-xl mx-auto">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => handleInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && setInput("")}
              className="w-full bg-white/10 backdrop-blur-md border-2 border-cyan-400/50 rounded-xl px-6 py-4 text-2xl text-white text-center font-mono focus:outline-none focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/20 placeholder:text-slate-500"
              placeholder="Type here..."
              autoComplete="off"
            />
          </div>
        </div>
      )}

      {/* Start/Game Over Screen */}
      {(!isPlaying || gameOver) && (
        <div className="absolute inset-0 flex items-center justify-center z-30 bg-slate-900/90 backdrop-blur-sm">
          <div className="text-center bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-md w-[360px]">
            <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 mb-4">
              {gameOver ? "Game Over!" : "🌧️ WordRain"}
            </h1>
            {gameOver && <p className="text-6xl font-black text-white mb-8">{score}</p>}
            <p className="text-slate-400 text-lg mb-6">
              {gameOver ? "Final Score" : "Type the words before they fall!"}
            </p>

            <div className="flex items-center justify-center gap-2 mb-6">
              {(["easy", "medium", "hard"] as const).map((level) => {
                const active = difficulty === level;
                return (
                  <button
                    key={level}
                    onClick={() => setDifficulty(level)}
                    className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
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

            <div className="bg-white/10 border border-white/10 rounded-xl p-3 text-sm text-slate-200 mb-6 text-left">
              <div className="text-xs uppercase tracking-wider text-slate-400 mb-2">
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
              onClick={startGame}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-12 py-4 rounded-full text-2xl font-bold hover:scale-105 active:scale-95 transition-all shadow-lg"
            >
              {gameOver ? "Play Again" : "Start Game"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
