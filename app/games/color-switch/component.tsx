"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSoundFX } from "../../hooks/useSoundFX";

interface Ball {
  x: number;
  y: number;
  vy: number;
  radius: number;
  color: string;
}

interface RingObstacle {
  id: number;
  y: number;
  radius: number;
  thickness: number;
  rotation: number;
  speed: number;
  passed: boolean;
}

interface ColorPickup {
  id: number;
  y: number;
  used: boolean;
}

const GAME_WIDTH = 420;
const GAME_HEIGHT = 700;
const GRAVITY = 0.28;
const JUMP_FORCE = -6.4;
const SCROLL_TRIGGER_Y = GAME_HEIGHT * 0.42;
const OBSTACLE_SPACING = 260;
const STORAGE_KEY = "colorSwitchBestScore";
const COLORS = ["#f472b6", "#60a5fa", "#34d399", "#fbbf24"] as const;

const randomColor = (exclude?: string) => {
  const options = exclude ? COLORS.filter((color) => color !== exclude) : [...COLORS];
  return options[Math.floor(Math.random() * options.length)];
};

const normalizeAngle = (angle: number) => {
  const cycle = Math.PI * 2;
  return ((angle % cycle) + cycle) % cycle;
};

const segmentColorAtAngle = (angle: number) => {
  const quarterTurn = Math.PI / 2;
  const index = Math.floor(normalizeAngle(angle) / quarterTurn) % 4;
  return COLORS[index];
};

export default function ColorSwitchGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const obstacleIdRef = useRef(0);
  const pickupIdRef = useRef(0);

  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);

  const scoreRef = useRef(0);
  const isPlayingRef = useRef(false);
  const gameOverRef = useRef(false);
  const ballRef = useRef<Ball>({
    x: GAME_WIDTH / 2,
    y: GAME_HEIGHT - 160,
    vy: 0,
    radius: 11,
    color: COLORS[0],
  });
  const obstaclesRef = useRef<RingObstacle[]>([]);
  const pickupsRef = useRef<ColorPickup[]>([]);

  const { playJump, playScore, playSelect, playHit, playGameOver, playBlip } = useSoundFX();

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    gameOverRef.current = gameOver;
  }, [gameOver]);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return;

    const parsed = parseInt(saved, 10);
    if (!Number.isNaN(parsed)) {
      setBestScore(parsed);
    }
  }, []);

  const updateBestScore = useCallback((newScore: number) => {
    setBestScore((currentBest) => {
      if (newScore <= currentBest) return currentBest;
      localStorage.setItem(STORAGE_KEY, String(newScore));
      return newScore;
    });
  }, []);

  const createRun = useCallback(() => {
    obstacleIdRef.current = 0;
    pickupIdRef.current = 0;

    ballRef.current = {
      x: GAME_WIDTH / 2,
      y: GAME_HEIGHT - 160,
      vy: 0,
      radius: 11,
      color: randomColor(),
    };

    const firstObstacleY = GAME_HEIGHT - 260;

    obstaclesRef.current = Array.from({ length: 6 }).map((_, index) => ({
      id: obstacleIdRef.current++,
      y: firstObstacleY - index * OBSTACLE_SPACING,
      radius: 78,
      thickness: 15,
      rotation: Math.random() * Math.PI * 2,
      speed: (index % 2 === 0 ? 1 : -1) * (0.012 + index * 0.0012),
      passed: false,
    }));

    pickupsRef.current = obstaclesRef.current.map((obstacle) => ({
      id: pickupIdRef.current++,
      y: obstacle.y - OBSTACLE_SPACING / 2,
      used: false,
    }));
  }, []);

  const startGame = useCallback(() => {
    createRun();
    setScore(0);
    scoreRef.current = 0;
    setGameOver(false);
    setIsPlaying(true);
    playSelect();
  }, [createRun, playSelect]);

  const endGame = useCallback(() => {
    if (gameOverRef.current) return;
    setIsPlaying(false);
    setGameOver(true);
    playHit();
    playGameOver();
  }, [playGameOver, playHit]);

  const jump = useCallback(() => {
    if (!isPlayingRef.current) {
      startGame();
      return;
    }

    ballRef.current.vy = JUMP_FORCE;
    playJump();
  }, [playJump, startGame]);

  const ensureUpcomingObstacles = useCallback(() => {
    const highestObstacleY = Math.min(...obstaclesRef.current.map((obstacle) => obstacle.y));

    while (obstaclesRef.current.length < 7) {
      const nextY = highestObstacleY - OBSTACLE_SPACING;
      obstaclesRef.current.push({
        id: obstacleIdRef.current++,
        y: nextY,
        radius: 78,
        thickness: 15,
        rotation: Math.random() * Math.PI * 2,
        speed: (Math.random() > 0.5 ? 1 : -1) * (0.012 + Math.random() * 0.01),
        passed: false,
      });

      pickupsRef.current.push({
        id: pickupIdRef.current++,
        y: nextY - OBSTACLE_SPACING / 2,
        used: false,
      });
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const drawRing = (obstacle: RingObstacle) => {
      const quarterTurn = Math.PI / 2;

      COLORS.forEach((color, segmentIndex) => {
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = obstacle.thickness;
        ctx.lineCap = "round";
        ctx.arc(
          GAME_WIDTH / 2,
          obstacle.y,
          obstacle.radius,
          obstacle.rotation + segmentIndex * quarterTurn,
          obstacle.rotation + (segmentIndex + 1) * quarterTurn,
        );
        ctx.stroke();
      });
    };

    const drawPickup = (pickup: ColorPickup) => {
      if (pickup.used) return;

      const x = GAME_WIDTH / 2;
      const y = pickup.y;
      const size = 11;

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(Date.now() * 0.002);

      ctx.beginPath();
      ctx.moveTo(0, -size);
      ctx.lineTo(size * 0.35, -size * 0.35);
      ctx.lineTo(size, 0);
      ctx.lineTo(size * 0.35, size * 0.35);
      ctx.lineTo(0, size);
      ctx.lineTo(-size * 0.35, size * 0.35);
      ctx.lineTo(-size, 0);
      ctx.lineTo(-size * 0.35, -size * 0.35);
      ctx.closePath();
      ctx.fillStyle = "#ffffff";
      ctx.shadowColor = "rgba(255,255,255,0.8)";
      ctx.shadowBlur = 14;
      ctx.fill();
      ctx.restore();
    };

    const drawBall = () => {
      const ball = ballRef.current;
      ctx.beginPath();
      ctx.fillStyle = ball.color;
      ctx.shadowColor = ball.color;
      ctx.shadowBlur = 20;
      ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
      ctx.fill();
    };

    const checkObstacleCollision = (obstacle: RingObstacle) => {
      const ball = ballRef.current;
      const dx = ball.x - GAME_WIDTH / 2;
      const dy = ball.y - obstacle.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      const ringInner = obstacle.radius - obstacle.thickness / 2;
      const ringOuter = obstacle.radius + obstacle.thickness / 2;
      const touchingRing = dist + ball.radius > ringInner && dist - ball.radius < ringOuter;

      if (!touchingRing) return false;

      const angleToBall = Math.atan2(dy, dx);
      const relativeAngle = angleToBall - obstacle.rotation;
      const requiredColor = segmentColorAtAngle(relativeAngle);
      return requiredColor !== ball.color;
    };

    const checkPickupCollection = (pickup: ColorPickup) => {
      if (pickup.used) return;

      const ball = ballRef.current;
      const distance = Math.abs(ball.y - pickup.y);

      if (distance < ball.radius + 12) {
        pickup.used = true;
        ball.color = randomColor(ball.color);
        playBlip(720);
      }
    };

    const update = () => {
      ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

      const gradient = ctx.createLinearGradient(0, 0, 0, GAME_HEIGHT);
      gradient.addColorStop(0, "#020617");
      gradient.addColorStop(1, "#0f172a");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

      if (isPlayingRef.current) {
        const ball = ballRef.current;

        ball.vy += GRAVITY;
        ball.y += ball.vy;

        if (ball.y < SCROLL_TRIGGER_Y) {
          const scrollDelta = SCROLL_TRIGGER_Y - ball.y;
          ball.y = SCROLL_TRIGGER_Y;
          obstaclesRef.current.forEach((obstacle) => {
            obstacle.y += scrollDelta;
          });
          pickupsRef.current.forEach((pickup) => {
            pickup.y += scrollDelta;
          });
        }

        if (ball.y - ball.radius > GAME_HEIGHT + 30) {
          endGame();
        }

        obstaclesRef.current.forEach((obstacle) => {
          obstacle.rotation += obstacle.speed;

          if (!obstacle.passed && ball.y + ball.radius < obstacle.y) {
            obstacle.passed = true;
            scoreRef.current += 1;
            setScore(scoreRef.current);
            updateBestScore(scoreRef.current);
            playScore();
          }

          if (checkObstacleCollision(obstacle)) {
            endGame();
          }
        });

        pickupsRef.current.forEach((pickup) => {
          checkPickupCollection(pickup);
        });

        obstaclesRef.current = obstaclesRef.current.filter(
          (obstacle) => obstacle.y < GAME_HEIGHT + 120,
        );
        pickupsRef.current = pickupsRef.current.filter((pickup) => pickup.y < GAME_HEIGHT + 120);
        ensureUpcomingObstacles();
      }

      obstaclesRef.current.forEach(drawRing);
      pickupsRef.current.forEach(drawPickup);
      drawBall();

      animationFrameRef.current = requestAnimationFrame(update);
    };

    animationFrameRef.current = requestAnimationFrame(update);

    return () => {
      if (animationFrameRef.current !== undefined) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [endGame, ensureUpcomingObstacles, playBlip, playScore, updateBestScore]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.code !== "Space" && event.code !== "Enter") return;
      event.preventDefault();
      jump();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [jump]);

  return (
    <div className="relative flex h-[100dvh] items-center justify-center overflow-hidden bg-linear-to-b from-slate-950 via-indigo-950 to-slate-950 px-4 py-4">
      <div className="pointer-events-none absolute left-[-10%] top-[-10%] h-[45%] w-[45%] rounded-full bg-fuchsia-500/10 blur-[140px]" />
      <div className="pointer-events-none absolute bottom-[-10%] right-[-10%] h-[45%] w-[45%] rounded-full bg-cyan-500/10 blur-[140px]" />

      <div className="relative z-10 w-full max-w-2xl">
        <div className="mb-6 text-center">
          <p className="mt-2 text-slate-300">
            Jump through matching segments and survive as long as possible.
          </p>
        </div>

        <div className="mb-4 grid grid-cols-2 gap-3 text-center">
          <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
            <div className="text-xs uppercase tracking-widest text-slate-400">Score</div>
            <div className="text-3xl font-black text-white">{score}</div>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
            <div className="text-xs uppercase tracking-widest text-slate-400">Best</div>
            <div className="text-3xl font-black text-cyan-300">{bestScore}</div>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-[420px] overflow-hidden rounded-2xl border border-white/15 shadow-[0_0_40px_rgba(56,189,248,0.18)]">
          <canvas
            ref={canvasRef}
            width={GAME_WIDTH}
            height={GAME_HEIGHT}
            className="block h-auto max-h-[72dvh] w-full cursor-pointer"
            onClick={jump}
          />

          {!isPlaying && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-950/35 backdrop-blur-[2px]">
              <button
                type="button"
                onClick={startGame}
                className="rounded-2xl border border-white/20 bg-white/10 px-8 py-6 text-center transition hover:scale-105 hover:bg-white/15"
              >
                <div className="text-5xl">🟣</div>
                <div className="mt-2 text-2xl font-black text-white">
                  {gameOver ? "Try Again" : "Start"}
                </div>
                <div className="mt-1 text-sm text-slate-300">Click, Space, or Enter to jump</div>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
