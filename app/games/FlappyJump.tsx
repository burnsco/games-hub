"use client";

import { useCallback, useEffect, useRef, useState } from "react";

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
  const [bestScore, setBestScore] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("flappyBestScore");
    if (saved) setBestScore(parseInt(saved));
  }, []);

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
    }
  };

  const startGame = () => {
    setBirdY(250);
    setBirdVelocity(0);
    setPipes([]);
    setScore(0);
    setGameOver(false);
    setIsPlaying(true);
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
          }

          return newPipe;
        });

        return updated.filter((p) => p.x > -PIPE_WIDTH);
      });
    }, 16);

    return () => clearInterval(interval);
  }, [isPlaying, birdVelocity, birdY, bestScore]);

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
  }, [isPlaying]);

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
    <div
      className="relative w-full h-screen bg-gradient-to-b from-sky-400 via-sky-300 to-sky-200 flex items-center justify-center"
      onClick={jump}
    >
      {/* Score */}
      <div className="absolute top-4 right-4 text-right z-20">
        <div className="text-4xl font-bold text-white drop-shadow-lg">{score}</div>
        <div className="text-lg text-sky-800">Best: {bestScore}</div>
      </div>

      <div className="text-center">
        <h1 className="text-4xl font-black text-white drop-shadow-lg mb-6">🐦 Flappy Jump</h1>

        <canvas
          ref={canvasRef}
          width={400}
          height={500}
          className="border-4 border-white/50 rounded-2xl shadow-2xl"
        />

        <p className="text-sky-800 mt-4 font-medium">Press SPACE or Click to jump!</p>

        <button
          onClick={(e) => {
            e.stopPropagation();
            startGame();
          }}
          className="mt-6 bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-8 py-3 rounded-full text-xl font-bold hover:scale-105 active:scale-95 transition-all shadow-lg border-2 border-white/50"
        >
          {isPlaying ? "Restart" : "Start Game"}
        </button>
      </div>

      {/* Game Over */}
      {gameOver && (
        <div className="fixed inset-0 flex items-center justify-center z-30 bg-sky-900/80 backdrop-blur-sm">
          <div className="text-center">
            <h1 className="text-6xl font-black text-white mb-4">Game Over!</h1>
            <p className="text-sky-200 text-2xl mb-2">Score</p>
            <p className="text-6xl font-black text-yellow-400 mb-8">{score}</p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                startGame();
              }}
              className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-12 py-4 rounded-full text-2xl font-bold hover:scale-105 active:scale-95 transition-all shadow-lg border-2 border-white/50"
            >
              Try Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
