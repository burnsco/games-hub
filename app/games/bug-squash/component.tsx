"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSoundFX } from "../../hooks/useSoundFX";

interface Bug {
  id: number;
  emoji: string;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  speed: number;
  size: number;
  squashed: boolean;
  squashedAt?: number;
}

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

export default function BugSquashGame() {
  const [score, setScore] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [bugs, setBugs] = useState<Bug[]>([]);
  const [speedMultiplier, setSpeedMultiplier] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);
  const bugIdRef = useRef(0);
  const [particles, setParticles] = useState<Particle[]>([]);
  const particleIdRef = useRef(0);
  const { playSquash, playSelect, playGameOver } = useSoundFX();

  const createBug = useCallback(() => {
    const bugEmojis = ["🪲", "🐛", "🐜", "🪳", "🦗", "🕷️"];

    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();

    const edge = Math.floor(Math.random() * 4);
    let x = 0,
      y = 0;

    switch (edge) {
      case 0:
        x = Math.random() * rect.width;
        y = -50;
        break;
      case 1:
        x = Math.random() * rect.width;
        y = rect.height + 50;
        break;
      case 2:
        x = -50;
        y = Math.random() * rect.height;
        break;
      case 3:
        x = rect.width + 50;
        y = Math.random() * rect.height;
        break;
    }

    const newBug: Bug = {
      id: bugIdRef.current++,
      emoji: bugEmojis[Math.floor(Math.random() * bugEmojis.length)],
      x,
      y,
      targetX: Math.random() * rect.width,
      targetY: Math.random() * rect.height,
      speed: (1 + Math.random() * 2) * speedMultiplier,
      size: Math.random() * 40 + 30,
      squashed: false,
    };

    setBugs((prev) => [...prev, newBug]);
  }, [speedMultiplier]);

  const squashBug = (id: number) => {
    setBugs((prev) =>
      prev.map((b) => (b.id === id ? { ...b, squashed: true, squashedAt: Date.now() } : b)),
    );
    setScore((prev) => prev + 1);
    playSquash();

    // Create explosion particles
    const bug = bugs.find((b) => b.id === id);
    if (bug) {
      const newParticles: Particle[] = Array.from({ length: 8 }).map(() => ({
        id: particleIdRef.current++,
        x: bug.x + bug.size / 2,
        y: bug.y + bug.size / 2,
        vx: (Math.random() - 0.5) * 10,
        vy: (Math.random() - 0.5) * 10,
        color: ["#ef4444", "#f97316", "#facc15", "#84cc16"][Math.floor(Math.random() * 4)],
        size: Math.random() * 10 + 5,
        life: 1.0,
      }));
      setParticles((prev) => [...prev, ...newParticles]);
    }
  };

  const startGame = () => {
    setScore(0);
    setBugs([]);
    setSpeedMultiplier(1);
    setIsPlaying(true);
    playSelect();
  };

  const stopGame = () => {
    setIsPlaying(false);
    setBugs([]);
    playGameOver();
  };

  // Spawn bugs
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(createBug, 500);
    return () => clearInterval(interval);
  }, [isPlaying, createBug]);

  // Increase difficulty
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setSpeedMultiplier((prev) => prev + 0.2);
    }, 10000);
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Animate bugs
  useEffect(() => {
    if (!isPlaying) return;
    const animate = () => {
      setBugs(
        (prev) =>
          prev
            .map((bug) => {
              if (bug.squashed) return bug;
              const dx = bug.targetX - bug.x;
              const dy = bug.targetY - bug.y;
              const dist = Math.sqrt(dx * dx + dy * dy);

              if (dist < 5) return null;

              return {
                ...bug,
                x: bug.x + (dx / dist) * bug.speed,
                y: bug.y + (dy / dist) * bug.speed,
              };
            })
            .filter(Boolean) as Bug[],
      );
    };

    const frame = requestAnimationFrame(function loop() {
      animate();
      setParticles((prev) =>
        prev
          .map((p) => ({
            ...p,
            x: p.x + p.vx,
            y: p.y + p.vy,
            life: p.life - 0.05,
          }))
          .filter((p) => p.life > 0),
      );
      if (isPlaying) requestAnimationFrame(loop);
    });

    return () => cancelAnimationFrame(frame);
  }, [isPlaying]);

  // Remove squashed bugs after a short delay
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      const now = Date.now();
      setBugs((prev) => prev.filter((b) => !b.squashedAt || now - b.squashedAt < 450));
    }, 100);
    return () => clearInterval(interval);
  }, [isPlaying]);

  return (
    <div
      ref={containerRef}
      className="bg-linear-to-br relative h-screen w-full overflow-hidden from-slate-900 via-slate-800 to-slate-900"
      style={{ cursor: isPlaying ? "crosshair" : "default" }}
    >
      {/* Background glow */}
      <div className="absolute left-[-10%] top-[-10%] h-[50%] w-[50%] animate-pulse rounded-full bg-blue-600/10 blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] h-[50%] w-[50%] animate-pulse rounded-full bg-violet-600/10 blur-[120px]" />

      {/* Score */}
      {isPlaying && (
        <div className="absolute left-1/2 top-8 z-20 -translate-x-1/2 text-center">
          <div className="bg-linear-to-b from-blue-400 to-violet-600 bg-clip-text text-8xl font-black text-transparent">
            {score}
          </div>
          <div className="text-xl font-bold uppercase tracking-widest text-slate-400">
            Bugs Smashed
          </div>
        </div>
      )}

      {/* Start Screen */}
      {!isPlaying && (
        <div className="absolute inset-0 z-30 flex items-center justify-center">
          <div className="text-center">
            <button
              type="button"
              onClick={startGame}
              className="bg-linear-to-br group relative flex h-64 w-64 flex-col items-center justify-center rounded-full border-8 border-white/10 from-red-500 to-orange-600 text-3xl font-black text-white shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95"
            >
              <span className="mb-2 text-6xl transition-transform group-hover:rotate-12">🪲</span>
              <span>
                DEBUG
                <br />
                NOW
              </span>
            </button>
            <p className="mt-8 font-mono text-lg text-slate-500">
              The system is crawling with bugs.
              <br />
              Only YOU can fix it.
            </p>
          </div>
        </div>
      )}

      {/* Particles */}
      {particles.map((p) => (
        <div
          key={p.id}
          className="pointer-events-none absolute rounded-full"
          style={{
            left: p.x,
            top: p.y,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            opacity: p.life,
            transform: `scale(${p.life})`,
          }}
        />
      ))}

      {/* Bugs */}
      {bugs.map((bug) => (
        <button
          type="button"
          key={bug.id}
          onClick={() => squashBug(bug.id)}
          className={`absolute cursor-pointer select-none border-0 bg-transparent p-0 transition-transform ${
            bug.squashed ? "scale-75" : "hover:scale-125"
          }`}
          style={{
            left: bug.x,
            top: bug.y,
            fontSize: bug.size,
            transform: `rotate(${(Math.atan2(bug.targetY - bug.y, bug.targetX - bug.x) * 180) / Math.PI + 90}deg)`,
          }}
          aria-label={`Bug ${bug.id}`}
        >
          <span
            className={`block transition-all duration-200 ${
              bug.squashed ? "opacity-70" : "opacity-100"
            }`}
            style={{
              transform: bug.squashed ? "scaleY(0.5)" : "scaleY(1)",
              filter: bug.squashed
                ? "drop-shadow(0 2px 2px rgba(0,0,0,0.4))"
                : "drop-shadow(0 4px 8px rgba(0,0,0,0.3))",
            }}
          >
            {bug.squashed ? "💥" : bug.emoji}
          </span>
        </button>
      ))}

      {/* Stop Button */}
      {isPlaying && (
        <button
          type="button"
          onClick={stopGame}
          className="absolute bottom-8 left-1/2 z-20 -translate-x-1/2 rounded-full border-4 border-white bg-red-600 px-12 py-6 text-2xl font-black text-white shadow-2xl transition-all hover:scale-105 hover:bg-red-700 active:scale-95"
        >
          STOP GAME
        </button>
      )}
    </div>
  );
}
