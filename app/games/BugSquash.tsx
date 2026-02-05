"use client";

import { useCallback, useEffect, useRef, useState } from "react";

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

export default function BugSquashGame() {
  const [score, setScore] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [bugs, setBugs] = useState<Bug[]>([]);
  const [speedMultiplier, setSpeedMultiplier] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);
  const bugIdRef = useRef(0);

  const bugEmojis = ["🪲", "🐛", "🐜", "🪳", "🦗", "🕷️"];

  const createBug = useCallback(() => {
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
      prev.map((b) =>
        b.id === id ? { ...b, squashed: true, squashedAt: Date.now() } : b,
      ),
    );
    setScore((prev) => prev + 1);
    playSquashSound();
  };

  const startGame = () => {
    setScore(0);
    setBugs([]);
    setSpeedMultiplier(1);
    setIsPlaying(true);
  };

  const stopGame = () => {
    setIsPlaying(false);
    setBugs([]);
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
      if (isPlaying) requestAnimationFrame(loop);
    });

    return () => cancelAnimationFrame(frame);
  }, [isPlaying]);

  // Remove squashed bugs after a short delay
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      const now = Date.now();
      setBugs((prev) =>
        prev.filter((b) => !b.squashedAt || now - b.squashedAt < 450),
      );
    }, 100);
    return () => clearInterval(interval);
  }, [isPlaying]);

  const playSquashSound = () => {
    try {
      const AudioContext =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof window.AudioContext })
          .webkitAudioContext;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sawtooth";
      osc.frequency.value = 180;
      gain.gain.value = 0.08;

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.12);
      osc.stop(ctx.currentTime + 0.12);
      osc.onended = () => ctx.close();
    } catch {
      // Audio not available or blocked
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden"
      style={{ cursor: isPlaying ? "crosshair" : "default" }}
    >
      {/* Background glow */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-violet-600/10 rounded-full blur-[120px] animate-pulse" />

      {/* Score */}
      {isPlaying && (
        <div className="absolute top-8 left-1/2 -translate-x-1/2 text-center z-20">
          <div className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-blue-400 to-violet-600">
            {score}
          </div>
          <div className="text-xl text-slate-400 font-bold tracking-widest uppercase">
            Bugs Smashed
          </div>
        </div>
      )}

      {/* Start Screen */}
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center z-30">
          <div className="text-center">
            <button
              onClick={startGame}
              className="group relative bg-gradient-to-br from-red-500 to-orange-600 text-white w-64 h-64 rounded-full text-3xl font-black border-8 border-white/10 shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300 flex flex-col items-center justify-center"
            >
              <span className="text-6xl mb-2 group-hover:rotate-12 transition-transform">🪲</span>
              <span>
                DEBUG
                <br />
                NOW
              </span>
            </button>
            <p className="text-slate-500 text-lg mt-8 font-mono">
              The system is crawling with bugs.
              <br />
              Only YOU can fix it.
            </p>
          </div>
        </div>
      )}

      {/* Bugs */}
      {bugs.map((bug) => (
        <div
          key={bug.id}
          onClick={() => squashBug(bug.id)}
          className={`absolute cursor-pointer select-none transition-transform ${
            bug.squashed ? "scale-75" : "hover:scale-125"
          }`}
          style={{
            left: bug.x,
            top: bug.y,
            fontSize: bug.size,
            transform: `rotate(${(Math.atan2(bug.targetY - bug.y, bug.targetX - bug.x) * 180) / Math.PI + 90}deg)`,
          }}
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
        </div>
      ))}

      {/* Stop Button */}
      {isPlaying && (
        <button
          onClick={stopGame}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-red-600 hover:bg-red-700 text-white px-12 py-6 rounded-full text-2xl font-black border-4 border-white shadow-2xl hover:scale-105 active:scale-95 transition-all z-20"
        >
          STOP GAME
        </button>
      )}
    </div>
  );
}
