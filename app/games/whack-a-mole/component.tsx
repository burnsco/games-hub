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

const GRID_SIZE = 3;
const GAME_DURATION = 30; // Seconds

export default function WhackAMoleGame() {
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [activeMole, setActiveMole] = useState<number | null>(null);
  const [bestScore, setBestScore] = useState(0);
  const [isClient, setIsClient] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);

  const particleIdRef = useRef(0);
  const timerRef = useRef<NodeJS.Timeout>(null);
  const moleTimerRef = useRef<NodeJS.Timeout>(null);
  const { playSquash, playSelect, playError, playGameOver } = useSoundFX();

  // Handle hydration and load best score
  useEffect(() => {
    setIsClient(true);
    const saved = localStorage.getItem("whackAMoleBestScore");
    if (saved) setBestScore(parseInt(saved, 10));
  }, []);

  const createExplosion = (x: number, y: number) => {
    const newParticles: Particle[] = Array.from({ length: 12 }).map(() => ({
      id: particleIdRef.current++,
      x,
      y,
      vx: (Math.random() - 0.5) * 10,
      vy: (Math.random() - 0.5) * 10,
      color: ["#06b6d4", "#3b82f6", "#8b5cf6", "#d946ef"][Math.floor(Math.random() * 4)],
      size: Math.random() * 8 + 4,
      life: 1.0,
    }));
    setParticles((prev) => [...prev, ...newParticles]);
  };

  // Particle animation loop
  useEffect(() => {
    if (particles.length === 0) return;
    const frame = requestAnimationFrame(() => {
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
    });
    return () => cancelAnimationFrame(frame);
  }, [particles]);

  const spawnMole = useCallback(() => {
    setActiveMole(null);
    const delay = Math.max(400, 1000 - score * 10); // Faster as score increases

    moleTimerRef.current = setTimeout(() => {
      const nextMole = Math.floor(Math.random() * (GRID_SIZE * GRID_SIZE));
      setActiveMole(nextMole);

      // Auto-hide mole after some time
      const visibleTime = Math.max(600, 1500 - score * 15);
      moleTimerRef.current = setTimeout(() => {
        setActiveMole(null);
        if (isPlaying) spawnMole();
      }, visibleTime);
    }, delay);
  }, [score, isPlaying]);

  const startGame = () => {
    setScore(0);
    setTimeLeft(GAME_DURATION);
    setGameOver(false);
    setIsPlaying(true);
    playSelect();
    spawnMole();

    // Start countdown
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          endGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const endGame = useCallback(() => {
    setIsPlaying(false);
    setGameOver(true);
    setActiveMole(null);
    if (timerRef.current) clearInterval(timerRef.current);
    if (moleTimerRef.current) clearTimeout(moleTimerRef.current);
    playGameOver();

    setScore((currentScore) => {
      if (currentScore > bestScore) {
        setBestScore(currentScore);
        localStorage.setItem("whackAMoleBestScore", currentScore.toString());
      }
      return currentScore;
    });
  }, [bestScore, playGameOver]);

  const handleWhack = (index: number, e: React.MouseEvent | React.TouchEvent) => {
    if (!isPlaying) return;

    if (index === activeMole) {
      setScore((prev) => prev + 10);
      setActiveMole(null);
      playSquash();

      // Get click position for explosion
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      createExplosion(centerX, centerY);

      // Immediately spawn next to keep momentum
      if (moleTimerRef.current) clearTimeout(moleTimerRef.current);
      spawnMole();
    } else {
      playError();
      setScore((prev) => Math.max(0, prev - 5));
    }
  };

  return (
    <div className="relative flex h-screen w-full items-center justify-center bg-linear-to-br from-slate-950 via-gray-900 to-slate-950 overflow-hidden">
      {/* Background glow */}
      <div className="absolute left-[-10%] top-[-10%] h-[50%] w-[50%] rounded-full bg-purple-600/10 blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] h-[50%] w-[50%] rounded-full bg-cyan-600/10 blur-[120px]" />

      {/* Particles Layer */}
      <div className="pointer-events-none fixed inset-0 z-50">
        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute rounded-full"
            style={{
              left: p.x,
              top: p.y,
              width: p.size,
              height: p.size,
              backgroundColor: p.color,
              opacity: p.life,
              transform: `scale(${p.life})`,
              boxShadow: `0 0 10px ${p.color}`,
            }}
          />
        ))}
      </div>

      <div className="z-10 text-center">
        <h1 className="mb-8 bg-linear-to-r from-purple-400 to-cyan-400 bg-clip-text text-5xl font-black text-transparent uppercase tracking-tighter">
          Whack-A-Mole.exe
        </h1>

        <div className="mb-8 flex justify-center gap-12">
          <div className="text-center">
            <div className="text-4xl font-black text-white">{score}</div>
            <div className="text-xs font-bold uppercase tracking-widest text-purple-400">Score</div>
          </div>
          <div className="text-center">
            <div
              className={`text-4xl font-black transition-colors ${timeLeft < 10 ? "text-red-500 animate-pulse" : "text-white"}`}
            >
              {timeLeft}s
            </div>
            <div className="text-xs font-bold uppercase tracking-widest text-cyan-400">Time</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-black text-slate-500">{isClient ? bestScore : 0}</div>
            <div className="text-xs font-bold uppercase tracking-widest text-slate-500">Best</div>
          </div>
        </div>

        {/* The Grid */}
        <div className="grid grid-cols-3 gap-4 p-4 rounded-3xl bg-slate-900/50 border-4 border-slate-800/50 shadow-2xl backdrop-blur-sm">
          {[...Array(9)].map((_, i) => (
            <button
              // biome-ignore lint/suspicious/noArrayIndexKey: fixed size grid
              key={i}
              type="button"
              onClick={(e) => handleWhack(i, e)}
              className="relative h-24 w-24 sm:h-32 sm:w-32 overflow-hidden rounded-2xl bg-slate-950 border-b-8 border-slate-800 cursor-pointer group active:border-b-0 active:translate-y-2 transition-all p-0"
              aria-label={`Whack hole ${i + 1}`}
            >
              {/* Hole depth effect */}
              <div className="absolute inset-0 bg-linear-to-b from-black to-transparent opacity-50" />

              {/* The Mole */}
              <div
                className={`absolute inset-0 flex items-center justify-center text-5xl sm:text-7xl transition-all duration-150 transform ${
                  activeMole === i ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
                }`}
              >
                <span className="drop-shadow-[0_0_15px_rgba(34,211,238,0.8)]">🤖</span>
              </div>

              {/* Grid Lines */}
              <div className="absolute inset-x-0 top-0 h-px bg-cyan-500/10" />
              <div className="absolute inset-y-0 left-0 w-px bg-cyan-500/10" />
            </button>
          ))}
        </div>

        <p className="mt-8 text-slate-500 font-mono text-sm uppercase tracking-widest">
          Eliminate the glitched routines.
        </p>

        {!isPlaying && !gameOver && (
          <button
            type="button"
            onClick={startGame}
            className="mt-8 rounded-full bg-linear-to-r from-purple-600 to-cyan-600 px-12 py-4 text-2xl font-black text-white shadow-[0_0_30px_rgba(147,51,234,0.3)] transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(147,51,234,0.5)] active:scale-95"
          >
            START_MISSION
          </button>
        )}
      </div>

      {/* End Screen */}
      {gameOver && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-slate-950/90 backdrop-blur-xl">
          <div className="text-center p-12 rounded-3xl border-4 border-purple-500/20 bg-slate-900/50 shadow-2xl">
            <h2 className="mb-2 text-6xl font-black text-white uppercase tracking-tighter">
              Mission Over
            </h2>
            <p className="mb-8 text-purple-400 font-bold tracking-[0.2em]">SYSTEM_STABILIZED</p>

            <div className="mb-12">
              <div className="text-8xl font-black text-transparent bg-linear-to-r from-white to-slate-400 bg-clip-text">
                {score}
              </div>
              <p className="text-sm text-slate-500 uppercase tracking-widest">
                Total Integrity Restored
              </p>
            </div>

            <button
              type="button"
              onClick={startGame}
              className="rounded-full bg-white px-12 py-4 text-xl font-black text-black transition-all hover:scale-105 hover:bg-cyan-400 active:scale-95"
            >
              RETRY_BOOT_SEQUENCE
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
