"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSoundFX } from "../../hooks/useSoundFX";

interface Pipe {
  x: number;
  top: number;
  scored: boolean;
}

const BIRD_SIZE = 25;
const PIPE_WIDTH = 60;
const PIPE_GAP = 150;
const GRAVITY = 0.5;
const JUMP_STRENGTH = -9;

export default function FlappyJumpGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [birdY, setBirdY] = useState(250);
  const [birdVelocity, setBirdVelocity] = useState(0);
  const [pipes, setPipes] = useState<Pipe[]>([]);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem("flappyBestScore") : null;
    return saved ? parseInt(saved, 10) : 0;
  });

  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const { playJump, playScore, playHit, playSelect } = useSoundFX();

  const createPipe = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const minTop = 50;
    const maxTop = canvas.height - PIPE_GAP - 50;
    const top = Math.random() * (maxTop - minTop) + minTop;
    setPipes((prev) => [...prev, { x: canvas.width, top, scored: false }]);
  }, []);

  const jump = () => {
    if (isPlaying) {
      setBirdVelocity(JUMP_STRENGTH);
      playJump();
    }
  };

  const startGame = () => {
    setBirdY(250);
    setBirdVelocity(0);
    setPipes([]);
    setScore(0);
    setGameOver(false);
    setIsPlaying(true);
    playSelect();
  };

  // Spawn pipes
  useEffect(() => {
    if (!isPlaying) return;
    const initial = setTimeout(createPipe, 1000);
    const interval = setInterval(createPipe, 2000);
    return () => {
      clearTimeout(initial);
      clearInterval(interval);
    };
  }, [isPlaying, createPipe]);

  // Game loop
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      setBirdVelocity((v) => v + GRAVITY);
      setBirdY((y) => {
        const newY = y + birdVelocity;

        // Ground collision
        if (newY > canvas.height - 30 - BIRD_SIZE) {
          setIsPlaying(false);
          setGameOver(true);
          playHit();
          return y;
        }

        // Ceiling
        if (newY < BIRD_SIZE) {
          setBirdVelocity(0);
          return BIRD_SIZE;
        }

        return newY;
      });

      setPipes((prev) => {
        const updated = prev.map((pipe) => {
          const newPipe = { ...pipe, x: pipe.x - 3 };

          // Collision detection
          if (80 + BIRD_SIZE > newPipe.x && 80 - BIRD_SIZE < newPipe.x + PIPE_WIDTH) {
            if (birdY - BIRD_SIZE < newPipe.top || birdY + BIRD_SIZE > newPipe.top + PIPE_GAP) {
              setIsPlaying(false);
              setGameOver(true);
              playHit();
            }
          }

          // Score
          if (!newPipe.scored && newPipe.x + PIPE_WIDTH < 80) {
            newPipe.scored = true;
            setScore((s) => {
              const newScore = s + 1;
              if (newScore > bestScore) {
                setBestScore(newScore);
                localStorage.setItem("flappyBestScore", newScore.toString());
              }
              return newScore;
            });
            playScore();
          }

          return newPipe;
        });

        return updated.filter((p) => p.x > -PIPE_WIDTH);
      });
    }, 16);

    return () => clearInterval(interval);
  }, [isPlaying, birdVelocity, birdY, bestScore, playHit, playScore]);

  // Controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        jump();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  // Draw
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Sky gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, "#7dd3fc");
    gradient.addColorStop(1, "#38bdf8");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Ground
    ctx.fillStyle = "#84cc16";
    ctx.fillRect(0, canvas.height - 30, canvas.width, 30);
    ctx.fillStyle = "#65a30d";
    ctx.fillRect(0, canvas.height - 30, canvas.width, 5);

    // Pipes
    pipes.forEach((pipe) => {
      ctx.fillStyle = "#22c55e";
      ctx.fillRect(pipe.x, 0, PIPE_WIDTH, pipe.top);
      ctx.fillStyle = "#16a34a";
      ctx.fillRect(pipe.x - 5, pipe.top - 20, PIPE_WIDTH + 10, 20);

      const bottomY = pipe.top + PIPE_GAP;
      ctx.fillStyle = "#22c55e";
      ctx.fillRect(pipe.x, bottomY, PIPE_WIDTH, canvas.height - bottomY - 30);
      ctx.fillStyle = "#16a34a";
      ctx.fillRect(pipe.x - 5, bottomY, PIPE_WIDTH + 10, 20);
    });

    // Bird
    ctx.fillStyle = "#facc15";
    ctx.beginPath();
    ctx.arc(80, birdY, BIRD_SIZE, 0, Math.PI * 2);
    ctx.fill();

    // Eye
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(90, birdY - 5, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#000";
    ctx.beginPath();
    ctx.arc(93, birdY - 5, 4, 0, Math.PI * 2);
    ctx.fill();

    // Beak
    ctx.fillStyle = "#f97316";
    ctx.beginPath();
    ctx.moveTo(100, birdY);
    ctx.lineTo(115, birdY + 5);
    ctx.lineTo(100, birdY + 10);
    ctx.closePath();
    ctx.fill();
  }, [birdY, pipes]);

  return (
    <button
      type="button"
      className="relative flex h-screen w-full items-center justify-center bg-linear-to-b from-sky-400 via-sky-300 to-sky-200"
      onClick={jump}
      onKeyDown={(e) => (e.key === " " || e.key === "Enter") && jump()}
    >
      {/* Score */}
      <div className="absolute right-4 top-4 z-20 text-right">
        <div className="text-4xl font-bold text-white drop-shadow-lg">{score}</div>
        <div className="text-lg text-sky-800">Best: {bestScore}</div>
      </div>

      <div className="text-center">
        <h1 className="mb-6 text-4xl font-black text-white drop-shadow-lg">🐦 Flappy Jump</h1>

        <canvas
          ref={canvasRef}
          width={400}
          height={500}
          className="rounded-2xl border-4 border-white/50 shadow-2xl"
        />

        <p className="mt-4 font-medium text-sky-800">Press SPACE or Click to jump!</p>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            startGame();
          }}
          className="mt-6 rounded-full border-2 border-white/50 bg-linear-to-r from-yellow-400 to-orange-400 px-8 py-3 text-xl font-bold text-white shadow-lg transition-all hover:scale-105 active:scale-95"
        >
          {isPlaying ? "Restart" : "Start Game"}
        </button>
      </div>

      {/* Game Over */}
      {gameOver && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-sky-900/80 backdrop-blur-sm">
          <div className="text-center">
            <h1 className="mb-4 text-6xl font-black text-white">Game Over!</h1>
            <p className="mb-2 text-2xl text-sky-200">Score</p>
            <p className="mb-8 text-6xl font-black text-yellow-400">{score}</p>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                startGame();
              }}
              className="rounded-full border-2 border-white/50 bg-linear-to-r from-yellow-400 to-orange-400 px-12 py-4 text-2xl font-bold text-white shadow-lg transition-all hover:scale-105 active:scale-95"
            >
              Try Again
            </button>
          </div>
        </div>
      )}
    </button>
  );
}
