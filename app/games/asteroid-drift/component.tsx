"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useSoundFX } from "../../hooks/useSoundFX";

interface Point {
  x: number;
  y: number;
}

interface Velocity {
  x: number;
  y: number;
}

interface Entity extends Point {
  id: number;
  velocity: Velocity;
  rotation: number;
  radius: number;
  type: "ship" | "asteroid" | "bullet" | "particle";
  active: boolean;
}

interface Ship extends Entity {
  type: "ship";
  thrusting: boolean;
  invulnerable: number; // frames
}

interface Asteroid extends Entity {
  type: "asteroid";
  size: "large" | "medium" | "small";
  rotationSpeed: number;
}

interface Bullet extends Entity {
  type: "bullet";
  life: number;
}

interface Particle extends Entity {
  type: "particle";
  life: number;
  color: string;
}

const SHIP_SIZE = 20;
const BULLET_SPEED = 10;
const ROTATION_SPEED = 0.1;
const THRUST = 0.1;
const FRICTION = 0.99;
const ASTEROID_SPEED = 2;

export default function AsteroidDriftGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [gameState, setGameState] = useState<"START" | "PLAYING" | "GAME_OVER">("START");
  const [highScore, setHighScore] = useState(0);
  const [isClient, setIsClient] = useState(false);

  const soundFX = useSoundFX();
  const soundFXRef = useRef(soundFX);

  // Refs for game state loop
  const gameStateRef = useRef<"START" | "PLAYING" | "GAME_OVER">("START");
  const shipRef = useRef<Ship | null>(null);
  const asteroidsRef = useRef<Asteroid[]>([]);
  const bulletsRef = useRef<Bullet[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const keysRef = useRef<{ [key: string]: boolean }>({});
  const scoreRef = useRef(0);
  const entityIdRef = useRef(0);
  const lastShotTimeRef = useRef(0);

  useEffect(() => {
    soundFXRef.current = soundFX;
  }, [soundFX]);

  useEffect(() => {
    setIsClient(true);
    const saved = localStorage.getItem("asteroidDriftHighScore");
    if (saved) setHighScore(parseInt(saved, 10));
  }, []);

  const createAsteroid = useCallback(
    (x: number, y: number, size: "large" | "medium" | "small"): Asteroid => {
      const angle = Math.random() * Math.PI * 2;
      const speed = ASTEROID_SPEED * (Math.random() * 0.5 + 0.8);
      const radius = size === "large" ? 40 : size === "medium" ? 20 : 10;

      return {
        id: entityIdRef.current++,
        x,
        y,
        velocity: {
          x: Math.cos(angle) * speed,
          y: Math.sin(angle) * speed,
        },
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.1,
        radius,
        type: "asteroid",
        size,
        active: true,
      };
    },
    [],
  );

  const createExplosion = useCallback((x: number, y: number, color: string, count = 10) => {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 3;
      particlesRef.current.push({
        id: entityIdRef.current++,
        x,
        y,
        velocity: {
          x: Math.cos(angle) * speed,
          y: Math.sin(angle) * speed,
        },
        rotation: 0,
        radius: Math.random() * 2,
        type: "particle",
        life: 1.0,
        color,
        active: true,
      });
    }
  }, []);

  const initGame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    shipRef.current = {
      id: entityIdRef.current++,
      x: canvas.width / 2,
      y: canvas.height / 2,
      velocity: { x: 0, y: 0 },
      rotation: -Math.PI / 2,
      radius: SHIP_SIZE,
      type: "ship",
      thrusting: false,
      active: true,
      invulnerable: 120, // 2 seconds at 60fps
    };

    asteroidsRef.current = [];
    bulletsRef.current = [];
    particlesRef.current = [];
    scoreRef.current = 0;
    setScore(0);
    setLives(3);

    // Spawn initial asteroids away from center
    for (let i = 0; i < 5; i++) {
      let x = 0;
      let y = 0;
      do {
        x = Math.random() * canvas.width;
        y = Math.random() * canvas.height;
      } while (Math.hypot(x - canvas.width / 2, y - canvas.height / 2) < 150);

      asteroidsRef.current.push(createAsteroid(x, y, "large"));
    }
  }, [createAsteroid]);

  const startGame = useCallback(() => {
    setGameState("PLAYING");
    gameStateRef.current = "PLAYING";
    initGame();
    soundFXRef.current.playSelect();
  }, [initGame]);

  const handleResize = useCallback(() => {
    if (canvasRef.current) {
      // Optional: Handle resize logic if needed, currently fixed size
    }
  }, []);

  useEffect(() => {
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [handleResize]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;

      // 1. UPDATE
      if (gameStateRef.current === "PLAYING") {
        const ship = shipRef.current;

        // Ship Controls
        if (ship?.active) {
          if (keysRef.current.ArrowLeft || keysRef.current.a) {
            ship.rotation -= ROTATION_SPEED;
          }
          if (keysRef.current.ArrowRight || keysRef.current.d) {
            ship.rotation += ROTATION_SPEED;
          }
          if (keysRef.current.ArrowUp || keysRef.current.w) {
            ship.thrusting = true;
            ship.velocity.x += Math.cos(ship.rotation) * THRUST;
            ship.velocity.y += Math.sin(ship.rotation) * THRUST;

            // Thrust particles
            if (Math.random() > 0.5) {
              const angle = ship.rotation + Math.PI + (Math.random() - 0.5) * 0.5;
              const speed = Math.random() * 2;
              particlesRef.current.push({
                id: entityIdRef.current++,
                x: ship.x - Math.cos(ship.rotation) * ship.radius,
                y: ship.y - Math.sin(ship.rotation) * ship.radius,
                velocity: {
                  x: Math.cos(angle) * speed + ship.velocity.x,
                  y: Math.sin(angle) * speed + ship.velocity.y,
                },
                rotation: 0,
                radius: Math.random() * 2 + 1,
                type: "particle",
                life: 0.5,
                color: "#fbbf24", // amber
                active: true,
              });
            }
          } else {
            ship.thrusting = false;
          }
          // Friction
          ship.velocity.x *= FRICTION;
          ship.velocity.y *= FRICTION;

          // Move Ship
          ship.x += ship.velocity.x;
          ship.y += ship.velocity.y;

          // Screen Wrap Ship
          if (ship.x < 0) ship.x = width;
          if (ship.x > width) ship.x = 0;
          if (ship.y < 0) ship.y = height;
          if (ship.y > height) ship.y = 0;

          // Shooting
          if (keysRef.current[" "] && Date.now() - lastShotTimeRef.current > 250) {
            bulletsRef.current.push({
              id: entityIdRef.current++,
              x: ship.x + Math.cos(ship.rotation) * ship.radius,
              y: ship.y + Math.sin(ship.rotation) * ship.radius,
              velocity: {
                x: Math.cos(ship.rotation) * BULLET_SPEED,
                y: Math.sin(ship.rotation) * BULLET_SPEED,
              },
              rotation: ship.rotation,
              radius: 2,
              type: "bullet",
              life: 60, // frames
              active: true,
            });
            lastShotTimeRef.current = Date.now();
            soundFXRef.current.playBlip(600);
          }

          if (ship.invulnerable > 0) ship.invulnerable--;
        }

        // Update Asteroids
        asteroidsRef.current.forEach((asteroid) => {
          asteroid.x += asteroid.velocity.x;
          asteroid.y += asteroid.velocity.y;
          asteroid.rotation += asteroid.rotationSpeed;

          if (asteroid.x < -asteroid.radius) asteroid.x = width + asteroid.radius;
          if (asteroid.x > width + asteroid.radius) asteroid.x = -asteroid.radius;
          if (asteroid.y < -asteroid.radius) asteroid.y = height + asteroid.radius;
          if (asteroid.y > height + asteroid.radius) asteroid.y = -asteroid.radius;
        });

        // Update Bullets
        bulletsRef.current.forEach((bullet) => {
          bullet.x += bullet.velocity.x;
          bullet.y += bullet.velocity.y;
          bullet.life--;
          if (bullet.life <= 0) bullet.active = false;

          if (bullet.x < 0) bullet.x = width;
          if (bullet.x > width) bullet.x = 0;
          if (bullet.y < 0) bullet.y = height;
          if (bullet.y > height) bullet.y = 0;
        });
        bulletsRef.current = bulletsRef.current.filter((b) => b.active);

        // Update Particles
        particlesRef.current.forEach((p) => {
          p.x += p.velocity.x;
          p.y += p.velocity.y;
          p.life -= 0.02;
          if (p.life <= 0) p.active = false;
        });
        particlesRef.current = particlesRef.current.filter((p) => p.active);

        // Collisions
        // Bullet - Asteroid
        bulletsRef.current.forEach((bullet) => {
          if (!bullet.active) return;
          asteroidsRef.current.forEach((asteroid) => {
            if (!asteroid.active) return;
            const dist = Math.hypot(bullet.x - asteroid.x, bullet.y - asteroid.y);
            if (dist < asteroid.radius + bullet.radius) {
              bullet.active = false;
              asteroid.active = false;

              // Split asteroid
              if (asteroid.size === "large") {
                asteroidsRef.current.push(createAsteroid(asteroid.x, asteroid.y, "medium"));
                asteroidsRef.current.push(createAsteroid(asteroid.x, asteroid.y, "medium"));
                scoreRef.current += 20;
              } else if (asteroid.size === "medium") {
                asteroidsRef.current.push(createAsteroid(asteroid.x, asteroid.y, "small"));
                asteroidsRef.current.push(createAsteroid(asteroid.x, asteroid.y, "small"));
                scoreRef.current += 50;
              } else {
                scoreRef.current += 100;
              }

              setScore(scoreRef.current);
              soundFXRef.current.playScore();
              createExplosion(asteroid.x, asteroid.y, "#94a3b8"); // slate-400
            }
          });
        });

        asteroidsRef.current = asteroidsRef.current.filter((a) => a.active);

        // Ship - Asteroid
        if (ship?.active && ship.invulnerable === 0) {
          asteroidsRef.current.forEach((asteroid) => {
            if (!asteroid.active) return;
            const dist = Math.hypot(ship.x - asteroid.x, ship.y - asteroid.y);
            if (dist < ship.radius + asteroid.radius) {
              // Ship hit
              createExplosion(ship.x, ship.y, "#ef4444", 20); // red
              soundFXRef.current.playHit();

              // Reset Ship
              setLives((prev) => {
                const newLives = prev - 1;
                if (newLives <= 0) {
                  ship.active = false;
                  setGameState("GAME_OVER");
                  gameStateRef.current = "GAME_OVER";
                  soundFXRef.current.playGameOver();
                  if (scoreRef.current > highScore) {
                    setHighScore(scoreRef.current);
                    localStorage.setItem("asteroidDriftHighScore", scoreRef.current.toString());
                  }
                } else {
                  ship.x = width / 2;
                  ship.y = height / 2;
                  ship.velocity = { x: 0, y: 0 };
                  ship.invulnerable = 120;
                }
                return newLives;
              });
            }
          });
        }

        // Level up / Respawn asteroids
        if (asteroidsRef.current.length === 0) {
          for (let i = 0; i < 5 + Math.floor(scoreRef.current / 1000); i++) {
            let x = 0;
            let y = 0;
            // Spawn away from ship
            const shipX = ship ? ship.x : width / 2;
            const shipY = ship ? ship.y : height / 2;
            do {
              x = Math.random() * width;
              y = Math.random() * height;
            } while (Math.hypot(x - shipX, y - shipY) < 200);
            asteroidsRef.current.push(createAsteroid(x, y, "large"));
          }
        }
      }

      // 2. RENDER
      ctx.clearRect(0, 0, width, height);

      // Draw Ship
      const ship = shipRef.current;
      if (ship?.active && (ship.invulnerable === 0 || Math.floor(Date.now() / 100) % 2 === 0)) {
        ctx.save();
        ctx.translate(ship.x, ship.y);
        ctx.rotate(ship.rotation);
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(15, 0);
        ctx.lineTo(-10, 10);
        ctx.lineTo(-5, 0);
        ctx.lineTo(-10, -10);
        ctx.closePath();
        ctx.stroke();

        if (ship.thrusting) {
          ctx.strokeStyle = "#fbbf24"; // amber
          ctx.beginPath();
          ctx.moveTo(-10, 5);
          ctx.lineTo(-18, 0);
          ctx.lineTo(-10, -5);
          ctx.stroke();
        }
        ctx.restore();
      }

      // Draw Asteroids
      ctx.strokeStyle = "#94a3b8"; // slate-400
      ctx.lineWidth = 2;
      asteroidsRef.current.forEach((asteroid) => {
        ctx.save();
        ctx.translate(asteroid.x, asteroid.y);
        ctx.rotate(asteroid.rotation);
        ctx.beginPath();
        // Draw jagged asteroid shape based on id/random seed simulation
        const sides = 8;
        for (let i = 0; i < sides; i++) {
          const angle = (i / sides) * Math.PI * 2;
          const r = asteroid.radius * (1 + Math.sin(asteroid.id * 13 + i) * 0.2);
          if (i === 0) ctx.moveTo(Math.cos(angle) * r, Math.sin(angle) * r);
          else ctx.lineTo(Math.cos(angle) * r, Math.sin(angle) * r);
        }
        ctx.closePath();
        ctx.stroke();
        ctx.restore();
      });

      // Draw Bullets
      ctx.fillStyle = "#fff";
      bulletsRef.current.forEach((bullet) => {
        ctx.beginPath();
        ctx.arc(bullet.x, bullet.y, 2, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw Particles
      particlesRef.current.forEach((p) => {
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1.0;

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animationFrameId);
  }, [createAsteroid, createExplosion, highScore]);

  // Controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current[e.key] = true;
      if (e.key === " " && gameStateRef.current === "START") {
        startGame();
      }
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
  }, [startGame]);

  return (
    <div className="relative flex h-[100dvh] w-full items-center justify-center overflow-hidden bg-slate-950">
      {/* Background stars (static for performance) */}
      <div
        className="absolute inset-0 opacity-50"
        style={{
          backgroundImage: "radial-gradient(white 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      ></div>

      <div className="absolute left-4 top-4 z-20 w-44 space-y-3">
        <Link
          href="/"
          className="flex items-center justify-center rounded-full border border-white/20 bg-black/40 px-4 py-2 font-semibold text-white backdrop-blur-md transition-all hover:border-white/40 hover:bg-black/60"
        >
          Back to Games
        </Link>

        <div className="rounded-xl border border-white/10 bg-black/35 p-3 text-center">
          <div className="font-mono text-3xl font-bold text-white drop-shadow-lg">{score}</div>
          <div className="text-xs uppercase tracking-widest text-slate-400">Score</div>
        </div>

        <div className="rounded-xl border border-white/10 bg-black/35 p-3 text-center">
          <div className="flex justify-center gap-2 text-2xl">
            {[...Array(lives)].map((_, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: fixed size array
              <span key={i}>🚀</span>
            ))}
          </div>
          <div className="text-xs uppercase tracking-widest text-slate-400">Lives</div>
        </div>

        <div className="rounded-xl border border-white/10 bg-black/35 p-3 text-center">
          <div className="font-mono text-3xl font-bold text-slate-300">
            {isClient ? highScore : 0}
          </div>
          <div className="text-xs uppercase tracking-widest text-slate-400">High Score</div>
        </div>
      </div>

      <div className="relative">
        <canvas
          ref={canvasRef}
          width={800}
          height={600}
          className="rounded-xl border-2 border-slate-700 bg-slate-900/50 shadow-2xl"
        />

        {gameState === "START" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm rounded-xl">
            <h2 className="text-5xl font-black text-white mb-4">ASTEROID DRIFT</h2>
            <p className="text-slate-300 mb-8">Arrows to Move • Space to Shoot</p>
            <button
              type="button"
              onClick={startGame}
              className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-full transition-all hover:scale-105 active:scale-95"
            >
              START MISSION
            </button>
          </div>
        )}

        {gameState === "GAME_OVER" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-md rounded-xl">
            <h2 className="text-5xl font-black text-red-500 mb-2">GAME OVER</h2>
            <p className="text-2xl text-white mb-8">Score: {score}</p>
            <button
              type="button"
              onClick={startGame}
              className="px-8 py-3 bg-white hover:bg-slate-200 text-slate-900 font-bold rounded-full transition-all hover:scale-105 active:scale-95"
            >
              TRY AGAIN
            </button>
          </div>
        )}
      </div>

      <div className="absolute bottom-4 text-slate-500 text-sm">
        Use <b>Arrow Keys</b> to drift and <b>Spacebar</b> to fire
      </div>
    </div>
  );
}
