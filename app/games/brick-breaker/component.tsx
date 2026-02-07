"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSoundFX } from "../../hooks/useSoundFX";

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  life: number;
}

interface Brick {
  x: number;
  y: number;
  width: number;
  height: number;
  active: boolean;
  color: string;
  glowColor: string;
}

const BRICK_ROWS = 5;
const BRICK_COLS = 8;
const BRICK_PADDING = 10;
const BRICK_HEIGHT = 20;
const BRICK_TOP_OFFSET = 50;
const BRICK_SIDE_OFFSET = 30;

const PADDLE_WIDTH = 100;
const PADDLE_HEIGHT = 15;
const BALL_RADIUS = 8;
const INITIAL_BALL_SPEED = 4;

export default function BrickBreakerGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [isPlayingVisible, setIsPlayingVisible] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [bestScore, setBestScore] = useState(0);
  const [isClient, setIsClient] = useState(false);

  const soundFX = useSoundFX();
  const soundFXRef = useRef(soundFX);

  // Update soundFXRef whenever soundFX changes to keep it stable for the loop
  useEffect(() => {
    soundFXRef.current = soundFX;
  }, [soundFX]);

  // Handle hydration and load best score
  useEffect(() => {
    setIsClient(true);
    const saved = localStorage.getItem("brickBreakerBestScore");
    if (saved) setBestScore(parseInt(saved, 10));
  }, []);

  // Game state refs for stable loop
  const isPlayingRef = useRef(false);
  const scoreRef = useRef(0);
  const bestScoreRef = useRef(bestScore);
  const livesRef = useRef(3);
  const paddleXRef = useRef(0);
  const ballRef = useRef({ x: 200, y: 350, dx: INITIAL_BALL_SPEED, dy: -INITIAL_BALL_SPEED });
  const bricksRef = useRef<Brick[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const particleIdRef = useRef(0);

  // Sync refs with state when they change
  useEffect(() => {
    bestScoreRef.current = bestScore;
  }, [bestScore]);

  const initGame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    paddleXRef.current = (canvas.width - PADDLE_WIDTH) / 2;
    ballRef.current = {
      x: canvas.width / 2,
      y: canvas.height - 40,
      dx: INITIAL_BALL_SPEED * (Math.random() > 0.5 ? 1 : -1),
      dy: -INITIAL_BALL_SPEED,
    };

    const bricks: Brick[] = [];
    const brickWidth =
      (canvas.width - BRICK_SIDE_OFFSET * 2 - (BRICK_COLS - 1) * BRICK_PADDING) / BRICK_COLS;

    const colors = ["#ef4444", "#f97316", "#facc15", "#84cc16", "#06b6d4"];
    const glowColors = [
      "rgba(239, 68, 68, 0.5)",
      "rgba(249, 115, 22, 0.5)",
      "rgba(250, 204, 21, 0.5)",
      "rgba(132, 204, 22, 0.5)",
      "rgba(6, 182, 212, 0.5)",
    ];

    for (let r = 0; r < BRICK_ROWS; r++) {
      for (let c = 0; c < BRICK_COLS; c++) {
        bricks.push({
          x: c * (brickWidth + BRICK_PADDING) + BRICK_SIDE_OFFSET,
          y: r * (BRICK_HEIGHT + BRICK_PADDING) + BRICK_TOP_OFFSET,
          width: brickWidth,
          height: BRICK_HEIGHT,
          active: true,
          color: colors[r],
          glowColor: glowColors[r],
        });
      }
    }
    bricksRef.current = bricks;
    particlesRef.current = [];
  }, []);

  const startGame = () => {
    setScore(0);
    scoreRef.current = 0;
    setLives(3);
    livesRef.current = 3;
    setGameOver(false);
    setGameWon(false);
    initGame();
    isPlayingRef.current = true;
    soundFXRef.current.playSelect();
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let frameId: number;

    const createExplosion = (x: number, y: number, color: string) => {
      const newParticles: Particle[] = Array.from({ length: 12 }).map(() => ({
        id: particleIdRef.current++,
        x,
        y,
        vx: (Math.random() - 0.5) * 8,
        vy: (Math.random() - 0.5) * 8,
        color,
        size: Math.random() * 6 + 2,
        life: 1.0,
      }));
      particlesRef.current = [...particlesRef.current, ...newParticles];
    };

    const render = () => {
      // 1. CLEAR
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 2. UPDATE PARTICLES
      particlesRef.current = particlesRef.current
        .map((p) => ({
          ...p,
          x: p.x + p.vx,
          y: p.y + p.vy,
          life: p.life - 0.02,
        }))
        .filter((p) => p.life > 0);

      // 3. UPDATE GAME STATE
      if (isPlayingRef.current) {
        const ball = ballRef.current;
        ball.x += ball.dx;
        ball.y += ball.dy;

        // Wall collisions
        if (ball.x + BALL_RADIUS > canvas.width || ball.x - BALL_RADIUS < 0) {
          ball.dx = -ball.dx;
          soundFXRef.current.playBlip(300);
        }
        if (ball.y - BALL_RADIUS < 0) {
          ball.dy = -ball.dy;
          soundFXRef.current.playBlip(300);
        }

        // Paddle collision
        if (
          ball.y + BALL_RADIUS > canvas.height - PADDLE_HEIGHT - 20 &&
          ball.x > paddleXRef.current &&
          ball.x < paddleXRef.current + PADDLE_WIDTH
        ) {
          const hitPos = (ball.x - (paddleXRef.current + PADDLE_WIDTH / 2)) / (PADDLE_WIDTH / 2);
          ball.dx = hitPos * 5;
          ball.dy = -Math.abs(ball.dy);
          soundFXRef.current.playBlip(440);
        }

        // Brick collision
        bricksRef.current.forEach((brick) => {
          if (brick.active) {
            if (
              ball.x + BALL_RADIUS > brick.x &&
              ball.x - BALL_RADIUS < brick.x + brick.width &&
              ball.y + BALL_RADIUS > brick.y &&
              ball.y - BALL_RADIUS < brick.y + brick.height
            ) {
              brick.active = false;
              ball.dy = -ball.dy;

              scoreRef.current += 20;
              const newScore = scoreRef.current;
              setScore(newScore);

              if (newScore > bestScoreRef.current) {
                setBestScore(newScore);
                localStorage.setItem("brickBreakerBestScore", newScore.toString());
              }

              soundFXRef.current.playScore();
              createExplosion(brick.x + brick.width / 2, brick.y + brick.height / 2, brick.color);

              if (bricksRef.current.every((b) => !b.active)) {
                isPlayingRef.current = false;
                setIsPlayingVisible(false);
                setGameWon(true);
                soundFXRef.current.playMatch();
              }
            }
          }
        });

        // Ground collision
        if (ball.y + BALL_RADIUS > canvas.height) {
          livesRef.current -= 1;
          const newLives = livesRef.current;
          setLives(newLives);

          if (newLives <= 0) {
            isPlayingRef.current = false;
            setIsPlayingVisible(false);
            setGameOver(true);
            soundFXRef.current.playGameOver();
          } else {
            ball.x = canvas.width / 2;
            ball.y = canvas.height - 40;
            ball.dx = INITIAL_BALL_SPEED * (Math.random() > 0.5 ? 1 : -1);
            ball.dy = -INITIAL_BALL_SPEED;
            soundFXRef.current.playHit();
          }
        }
      }

      // 4. DRAW
      // Bricks - Optimize by removing shadowBlur from loop
      bricksRef.current.forEach((brick) => {
        if (brick.active) {
          ctx.fillStyle = brick.color;
          ctx.beginPath();
          ctx.roundRect(brick.x, brick.y, brick.width, brick.height, 4);
          ctx.fill();
        }
      });

      // Paddle
      ctx.fillStyle = "#06b6d4";
      ctx.beginPath();
      ctx.roundRect(
        paddleXRef.current,
        canvas.height - PADDLE_HEIGHT - 20,
        PADDLE_WIDTH,
        PADDLE_HEIGHT,
        8,
      );
      ctx.fill();

      // Ball
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.arc(ballRef.current.x, ballRef.current.y, BALL_RADIUS, 0, Math.PI * 2);
      ctx.fill();

      // Particles
      particlesRef.current.forEach((p) => {
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1.0;

      frameId = requestAnimationFrame(render);
    };

    frameId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(frameId);
  }, []);

  // Controls
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const relativeX = e.clientX - rect.left;
      if (relativeX > 0 && relativeX < canvas.width) {
        paddleXRef.current = relativeX - PADDLE_WIDTH / 2;
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" || e.key === "a") paddleXRef.current -= 20;
      if (e.key === "ArrowRight" || e.key === "d") paddleXRef.current += 20;

      const canvas = canvasRef.current;
      if (canvas) {
        paddleXRef.current = Math.max(0, Math.min(canvas.width - PADDLE_WIDTH, paddleXRef.current));
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <div className="relative flex h-screen w-full items-center justify-center bg-linear-to-br from-slate-900 via-gray-900 to-slate-950">
      {/* Background glow - Static (removed pulse to eliminate potential flickering) */}
      <div className="absolute left-[-10%] top-[-10%] h-[50%] w-[50%] rounded-full bg-cyan-600/10 blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] h-[50%] w-[50%] rounded-full bg-blue-600/10 blur-[120px]" />

      {/* Stats */}
      <div className="absolute left-1/2 top-4 z-20 flex -translate-x-1/2 gap-16 text-center">
        <div>
          <div className="text-4xl font-bold text-white drop-shadow-lg">{score}</div>
          <div className="text-xs uppercase tracking-widest text-slate-400">Score</div>
        </div>
        <div>
          <div className="flex gap-1">
            {[...Array(3)].map((_, i) => (
              <span
                // biome-ignore lint/suspicious/noArrayIndexKey: fixed size array
                key={i}
                className={`text-2xl transition-all ${i >= lives ? "scale-75 opacity-20 grayscale" : ""}`}
              >
                ❤️
              </span>
            ))}
          </div>
          <div className="text-xs uppercase tracking-widest text-slate-400">Lives</div>
        </div>
        <div>
          <div className="text-4xl font-bold text-slate-400">{isClient ? bestScore : 0}</div>
          <div className="text-xs uppercase tracking-widest text-slate-400">Best</div>
        </div>
      </div>

      <div className="text-center">
        <h1 className="mb-6 bg-linear-to-r from-cyan-400 to-blue-500 bg-clip-text text-4xl font-black text-transparent">
          🧱 Brick Breaker
        </h1>

        <canvas
          ref={canvasRef}
          width={600}
          height={400}
          className="rounded-2xl border-4 border-cyan-500/30 bg-black/40 shadow-2xl"
        />

        <p className="mt-4 text-slate-500">Use Mouse or Arrows to move paddle</p>

        {!isPlayingVisible && !gameOver && !gameWon && (
          <button
            type="button"
            onClick={startGame}
            className="mt-6 rounded-full bg-linear-to-r from-cyan-500 to-blue-600 px-10 py-3 text-xl font-bold text-white shadow-lg transition-all hover:scale-105 active:scale-95"
          >
            Start Game
          </button>
        )}
      </div>

      {/* Screens */}
      {(gameOver || gameWon) && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-slate-950/90 backdrop-blur-md">
          <div className="text-center">
            <h1
              className={`mb-4 text-6xl font-black ${gameWon ? "bg-linear-to-r from-green-400 to-emerald-500" : "bg-linear-to-r from-red-400 to-orange-500"} bg-clip-text text-transparent`}
            >
              {gameWon ? "Game Clear!" : "Game Over!"}
            </h1>
            <p className="mb-2 text-2xl text-slate-400">Final Score</p>
            <p className="mb-8 text-6xl font-black text-white">{score}</p>
            <button
              type="button"
              onClick={startGame}
              className="rounded-full bg-linear-to-r from-cyan-500 to-blue-600 px-12 py-4 text-2xl font-bold text-white shadow-lg transition-all hover:scale-105 active:scale-95"
            >
              Play Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
