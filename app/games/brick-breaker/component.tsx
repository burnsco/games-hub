"use client";

import Link from "next/link";
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

const BRICK_BREAKER_CONFIG = {
  rows: 13,
  cols: 18,
  canvasWidth: 1260,
  canvasHeight: 760,
  brickPadding: 7,
  brickHeight: 14,
  brickTopOffset: 99,
  brickSideOffset: 178,
};

const PADDLE_WIDTH = 100;
const PADDLE_HEIGHT = 15;
const BALL_RADIUS = 8;
const INITIAL_BALL_SPEED = 4;

export default function BrickBreakerGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [isPlayingVisible, setIsPlayingVisible] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
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
  const isPausedRef = useRef(false);
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
      (canvas.width -
        BRICK_BREAKER_CONFIG.brickSideOffset * 2 -
        (BRICK_BREAKER_CONFIG.cols - 1) * BRICK_BREAKER_CONFIG.brickPadding) /
      BRICK_BREAKER_CONFIG.cols;

    const colors = ["#ef4444", "#f97316", "#facc15", "#84cc16", "#06b6d4"];
    const glowColors = [
      "rgba(239, 68, 68, 0.5)",
      "rgba(249, 115, 22, 0.5)",
      "rgba(250, 204, 21, 0.5)",
      "rgba(132, 204, 22, 0.5)",
      "rgba(6, 182, 212, 0.5)",
    ];

    for (let r = 0; r < BRICK_BREAKER_CONFIG.rows; r++) {
      for (let c = 0; c < BRICK_BREAKER_CONFIG.cols; c++) {
        bricks.push({
          x:
            c * (brickWidth + BRICK_BREAKER_CONFIG.brickPadding) +
            BRICK_BREAKER_CONFIG.brickSideOffset,
          y:
            r * (BRICK_BREAKER_CONFIG.brickHeight + BRICK_BREAKER_CONFIG.brickPadding) +
            BRICK_BREAKER_CONFIG.brickTopOffset,
          width: brickWidth,
          height: BRICK_BREAKER_CONFIG.brickHeight,
          active: true,
          color: colors[r % colors.length],
          glowColor: glowColors[r % glowColors.length],
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
    setIsPaused(false);
    isPausedRef.current = false;
    setIsPlayingVisible(true);
    initGame();
    isPlayingRef.current = true;
    soundFXRef.current.playSelect();
  };

  const pauseGame = () => {
    if (!isPlayingRef.current || gameOver || gameWon) return;
    setIsPaused(true);
    isPausedRef.current = true;
  };

  const resumeGame = () => {
    if (!isPlayingRef.current || gameOver || gameWon) return;
    setIsPaused(false);
    isPausedRef.current = false;
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
      if (isPlayingRef.current && !isPausedRef.current) {
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
                setIsPaused(false);
                isPausedRef.current = false;
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
            setIsPaused(false);
            isPausedRef.current = false;
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
    <div className="relative flex h-[100dvh] w-full items-center justify-center overflow-hidden bg-linear-to-br from-slate-900 via-gray-900 to-slate-950 px-4 py-4">
      <div className="absolute left-[-10%] top-[-10%] h-[50%] w-[50%] rounded-full bg-cyan-600/10 blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] h-[50%] w-[50%] rounded-full bg-blue-600/10 blur-[120px]" />

      <div className="relative z-10 mx-auto flex w-full max-w-[1280px] flex-col items-center gap-4 lg:flex-row lg:items-start lg:gap-6">
        <aside className="grid w-full max-w-[860px] grid-cols-3 gap-3 text-center lg:hidden">
          <div className="rounded-xl border border-white/10 bg-white/5 p-3">
            <div className="text-3xl font-bold text-white">{score}</div>
            <div className="text-xs uppercase tracking-widest text-slate-400">Score</div>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-3">
            <div className="flex justify-center gap-1">
              {[...Array(3)].map((_, i) => (
                <span
                  // biome-ignore lint/suspicious/noArrayIndexKey: fixed size array
                  key={i}
                  className={`text-xl transition-all ${i >= lives ? "scale-75 opacity-20 grayscale" : ""}`}
                >
                  ❤️
                </span>
              ))}
            </div>
            <div className="text-xs uppercase tracking-widest text-slate-400">Lives</div>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-3">
            <div className="text-3xl font-bold text-slate-300">{isClient ? bestScore : 0}</div>
            <div className="text-xs uppercase tracking-widest text-slate-400">Best</div>
          </div>
          <Link
            href="/"
            className="col-span-3 rounded-full border border-white/20 bg-black/40 px-4 py-2 text-center font-semibold text-white backdrop-blur-md transition-all hover:border-white/40 hover:bg-black/60"
          >
            Back to Games
          </Link>
        </aside>

        <aside className="hidden w-52 shrink-0 space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-center backdrop-blur-sm lg:block">
          <div className="rounded-xl border border-white/10 bg-black/20 p-3">
            <div className="text-4xl font-bold text-white">{score}</div>
            <div className="text-xs uppercase tracking-widest text-slate-400">Score</div>
          </div>
          <div className="rounded-xl border border-white/10 bg-black/20 p-3">
            <div className="mb-1 flex justify-center gap-1">
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
          <div className="rounded-xl border border-white/10 bg-black/20 p-3">
            <div className="text-4xl font-bold text-slate-300">{isClient ? bestScore : 0}</div>
            <div className="text-xs uppercase tracking-widest text-slate-400">Best</div>
          </div>
          <p className="text-xs text-slate-400">Use side lanes to arc the ball above the stack.</p>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-full border border-white/20 bg-black/40 px-4 py-2 font-semibold text-white backdrop-blur-md transition-all hover:border-white/40 hover:bg-black/60"
          >
            Back to Games
          </Link>
        </aside>

        <div className="relative w-full max-w-[980px] text-center">
          <canvas
            ref={canvasRef}
            width={BRICK_BREAKER_CONFIG.canvasWidth}
            height={BRICK_BREAKER_CONFIG.canvasHeight}
            className="mx-auto h-auto w-full max-w-[980px] rounded-2xl border-4 border-cyan-500/30 bg-black/40 shadow-2xl"
          />

          <p className="mt-3 text-sm text-slate-500 lg:hidden">
            Use Mouse or Arrows to move paddle
          </p>

          {!gameOver && !gameWon && (
            <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
              {!isPlayingVisible ? (
                <button
                  type="button"
                  onClick={startGame}
                  className="rounded-full bg-linear-to-r from-cyan-500 to-blue-600 px-10 py-3 text-xl font-bold text-white shadow-lg transition-all hover:scale-105 active:scale-95"
                >
                  Start Game
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={startGame}
                    className="rounded-full bg-linear-to-r from-cyan-500 to-blue-600 px-8 py-3 text-lg font-bold text-white shadow-lg transition-all hover:scale-105 active:scale-95"
                  >
                    Reset
                  </button>
                  {isPaused ? (
                    <button
                      type="button"
                      onClick={resumeGame}
                      className="rounded-full border border-white/30 bg-white/10 px-8 py-3 text-lg font-bold text-white shadow-lg backdrop-blur-md transition-all hover:scale-105 hover:bg-white/20 active:scale-95"
                    >
                      Resume
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={pauseGame}
                      className="rounded-full border border-white/30 bg-white/10 px-8 py-3 text-lg font-bold text-white shadow-lg backdrop-blur-md transition-all hover:scale-105 hover:bg-white/20 active:scale-95"
                    >
                      Pause
                    </button>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {(gameOver || gameWon) && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-slate-950/90 backdrop-blur-md">
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
