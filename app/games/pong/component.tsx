"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSoundFX } from "../../hooks/useSoundFX";

const PADDLE_WIDTH = 10;
const PADDLE_HEIGHT = 80;
const BALL_SIZE = 10;
const WINNING_SCORE = 5;

export default function PongGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [playerY, setPlayerY] = useState(200 - PADDLE_HEIGHT / 2);
  const [aiY, setAiY] = useState(200 - PADDLE_HEIGHT / 2);
  const [ball, setBall] = useState({ x: 300, y: 200, speedX: 5, speedY: 3 });
  const [playerScore, setPlayerScore] = useState(0);
  const [aiScore, setAiScore] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [result, setResult] = useState<"win" | "lose" | null>(null);
  const keysRef = useRef<{ [key: string]: boolean }>({});
  const { playBlip, playScore, playError, playGameOver, playSelect } = useSoundFX();

  const resetBall = useCallback(
    () => ({
      x: 300,
      y: 200,
      speedX: (Math.random() > 0.5 ? 1 : -1) * 5,
      speedY: (Math.random() - 0.5) * 6,
    }),
    [],
  );

  const startGame = () => {
    setPlayerY(200 - PADDLE_HEIGHT / 2);
    setAiY(200 - PADDLE_HEIGHT / 2);
    setBall(resetBall());
    setPlayerScore(0);
    setAiScore(0);
    setResult(null);
    setIsPlaying(true);
    playSelect();
  };

  // Controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current[e.key] = true;
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current[e.key] = false;
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  // Game loop
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      // Player movement
      if (keysRef.current.ArrowUp || keysRef.current.w || keysRef.current.W) {
        setPlayerY((y) => Math.max(0, y - 8));
      }
      if (keysRef.current.ArrowDown || keysRef.current.s || keysRef.current.S) {
        setPlayerY((y) => Math.min(canvas.height - PADDLE_HEIGHT, y + 8));
      }

      setBall((prevBall) => {
        const newBall = { ...prevBall };
        newBall.x += newBall.speedX;
        newBall.y += newBall.speedY;

        // AI movement
        setAiY((y) => {
          const aiCenter = y + PADDLE_HEIGHT / 2;
          if (newBall.x > canvas.width / 2) {
            if (aiCenter < newBall.y - 20) return Math.min(canvas.height - PADDLE_HEIGHT, y + 4);
            if (aiCenter > newBall.y + 20) return Math.max(0, y - 4);
          }
          return y;
        });

        // Top/bottom collision
        if (newBall.y <= BALL_SIZE || newBall.y >= canvas.height - BALL_SIZE) {
          newBall.speedY = -newBall.speedY;
          playBlip(220);
        }

        // Player paddle collision
        if (
          newBall.x - BALL_SIZE <= 30 &&
          newBall.y >= playerY &&
          newBall.y <= playerY + PADDLE_HEIGHT
        ) {
          newBall.speedX = Math.abs(newBall.speedX) * 1.05;
          newBall.speedY += (newBall.y - (playerY + PADDLE_HEIGHT / 2)) * 0.1;
          playBlip(440);
        }

        // AI paddle collision
        if (
          newBall.x + BALL_SIZE >= canvas.width - 30 &&
          newBall.y >= aiY &&
          newBall.y <= aiY + PADDLE_HEIGHT
        ) {
          newBall.speedX = -Math.abs(newBall.speedX) * 1.05;
          newBall.speedY += (newBall.y - (aiY + PADDLE_HEIGHT / 2)) * 0.1;
          playBlip(330);
        }

        // Scoring
        if (newBall.x < 0) {
          setAiScore((s) => {
            const newScore = s + 1;
            if (newScore >= WINNING_SCORE) {
              setIsPlaying(false);
              setResult("lose");
              playGameOver();
            } else {
              playError();
            }
            return newScore;
          });
          return resetBall();
        }
        if (newBall.x > canvas.width) {
          setPlayerScore((s) => {
            const newScore = s + 1;
            if (newScore >= WINNING_SCORE) {
              setIsPlaying(false);
              setResult("win");
              playGameOver();
            } else {
              playScore();
            }
            return newScore;
          });
          return resetBall();
        }

        return newBall;
      });
    }, 16);

    return () => clearInterval(interval);
  }, [isPlaying, playerY, aiY, resetBall, playBlip, playScore, playError, playGameOver]);

  // Draw
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#0f172a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Center line
    ctx.setLineDash([10, 10]);
    ctx.strokeStyle = "rgba(255,255,255,0.2)";
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);

    // Player paddle
    ctx.fillStyle = "#22d3ee";
    ctx.shadowColor = "#22d3ee";
    ctx.shadowBlur = 20;
    ctx.fillRect(20, playerY, PADDLE_WIDTH, PADDLE_HEIGHT);
    ctx.shadowBlur = 0;

    // AI paddle
    ctx.fillStyle = "#f87171";
    ctx.shadowColor = "#f87171";
    ctx.shadowBlur = 20;
    ctx.fillRect(canvas.width - 30, aiY, PADDLE_WIDTH, PADDLE_HEIGHT);
    ctx.shadowBlur = 0;

    // Ball
    ctx.fillStyle = "#fff";
    ctx.shadowColor = "#fff";
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, BALL_SIZE, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }, [playerY, aiY, ball]);

  return (
    <div className="relative flex h-[calc(100dvh-73px)] w-full items-center justify-center overflow-hidden bg-linear-to-br from-slate-900 via-gray-900 to-slate-800">
      {/* Scores */}
      <div className="absolute left-1/2 top-4 z-20 flex -translate-x-1/2 gap-16 text-center">
        <div>
          <div className="text-4xl font-bold text-cyan-400">{playerScore}</div>
          <div className="text-sm text-slate-400">You</div>
        </div>
        <div>
          <div className="text-4xl font-bold text-red-400">{aiScore}</div>
          <div className="text-sm text-slate-400">CPU</div>
        </div>
      </div>

      <div className="text-center">
        <canvas
          ref={canvasRef}
          width={600}
          height={400}
          className="rounded-2xl border-4 border-cyan-500/50 shadow-2xl"
        />

        <p className="mt-4 text-slate-400">Use Arrow Keys ↑↓ or W/S to move your paddle</p>

        <button
          type="button"
          onClick={startGame}
          className="mt-6 rounded-full bg-linear-to-r from-cyan-500 to-blue-500 px-8 py-3 text-xl font-bold text-white shadow-lg transition-all hover:scale-105 active:scale-95"
        >
          {isPlaying ? "Restart" : "Start Game"}
        </button>
      </div>

      {/* Result */}
      {result && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-slate-900/90 backdrop-blur-sm">
          <div className="text-center">
            <h1
              className={`bg-linear-to-r bg-clip-text text-6xl font-black text-transparent ${result === "win" ? "from-green-400 to-emerald-500" : "from-red-400 to-orange-500"} mb-4`}
            >
              {result === "win" ? "🎉 You Win!" : "😔 You Lose!"}
            </h1>
            <p className="mb-8 text-2xl text-slate-400">
              Final Score: {playerScore} - {aiScore}
            </p>
            <button
              type="button"
              onClick={startGame}
              className="rounded-full bg-linear-to-r from-cyan-500 to-blue-500 px-12 py-4 text-2xl font-bold text-white shadow-lg transition-all hover:scale-105 active:scale-95"
            >
              Play Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
