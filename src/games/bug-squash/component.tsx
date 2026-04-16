import { useCallback, useEffect, useRef, useState } from "react";
import { useSoundFX } from "../../hooks/useSoundFX";

interface Bug {
  id: number;
  emoji: string;
  type: string;
  points: number;
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

type GameLength = "short" | "medium" | "long";

const GAME_LENGTHS: Record<GameLength, { label: string; ms: number }> = {
  short: { label: "Short (2m)", ms: 120000 },
  medium: { label: "Medium (4m)", ms: 240000 },
  long: { label: "Long (6m)", ms: 360000 },
};

const BUG_TYPES = [
  {
    type: "Crawler",
    emoji: "🐛",
    points: 50,
    speedMin: 0.8,
    speedMax: 1.3,
    sizeMin: 40,
    sizeMax: 56,
  },
  { type: "Ant", emoji: "🐜", points: 100, speedMin: 1.3, speedMax: 1.9, sizeMin: 34, sizeMax: 48 },
  {
    type: "Beetle",
    emoji: "🪲",
    points: 150,
    speedMin: 1.9,
    speedMax: 2.5,
    sizeMin: 32,
    sizeMax: 46,
  },
  {
    type: "Cockroach",
    emoji: "🪳",
    points: 220,
    speedMin: 2.5,
    speedMax: 3.2,
    sizeMin: 30,
    sizeMax: 44,
  },
  {
    type: "Cricket",
    emoji: "🦗",
    points: 320,
    speedMin: 2.8,
    speedMax: 3.4,
    sizeMin: 28,
    sizeMax: 42,
  },
  {
    type: "Spider",
    emoji: "🕷️",
    points: 450,
    speedMin: 3.2,
    speedMax: 4.0,
    sizeMin: 26,
    sizeMax: 40,
  },
] as const;

export default function BugSquashGame() {
  const [score, setScore] = useState(0);
  const [smashedCount, setSmashedCount] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [bugs, setBugs] = useState<Bug[]>([]);
  const [speedMultiplier, setSpeedMultiplier] = useState(1);
  const [gameLength, setGameLength] = useState<GameLength>("short");
  const [timeLeftMs, setTimeLeftMs] = useState(GAME_LENGTHS.short.ms);
  const [lastGameReason, setLastGameReason] = useState<"timeup" | "stopped" | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const bugIdRef = useRef(0);
  const scoreRef = useRef(0);
  const smashedCountRef = useRef(0);
  const endTimeRef = useRef(0);
  const [particles, setParticles] = useState<Particle[]>([]);
  const particleIdRef = useRef(0);
  const { playSquash, playSelect, playGameOver } = useSoundFX();

  useEffect(() => {
    scoreRef.current = score;
  }, [score]);

  useEffect(() => {
    smashedCountRef.current = smashedCount;
  }, [smashedCount]);

  const createBug = useCallback(() => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const bugType = BUG_TYPES[Math.floor(Math.random() * BUG_TYPES.length)];

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
      emoji: bugType.emoji,
      type: bugType.type,
      points: bugType.points,
      x,
      y,
      targetX: Math.random() * rect.width,
      targetY: Math.random() * rect.height,
      speed:
        (bugType.speedMin + Math.random() * (bugType.speedMax - bugType.speedMin)) *
        speedMultiplier,
      size: Math.random() * (bugType.sizeMax - bugType.sizeMin) + bugType.sizeMin,
      squashed: false,
    };

    setBugs((prev) => [...prev, newBug]);
  }, [speedMultiplier]);

  const squashBug = (id: number) => {
    const hitBug = bugs.find((b) => b.id === id);
    if (!hitBug || hitBug.squashed) return;

    setBugs((prev) =>
      prev.map((b) => (b.id === id ? { ...b, squashed: true, squashedAt: Date.now() } : b)),
    );

    setSmashedCount((prev) => prev + 1);
    setScore((prev) => prev + hitBug.points);
    playSquash();

    const newParticles: Particle[] = Array.from({ length: 8 }).map(() => ({
      id: particleIdRef.current++,
      x: hitBug.x + hitBug.size / 2,
      y: hitBug.y + hitBug.size / 2,
      vx: (Math.random() - 0.5) * 10,
      vy: (Math.random() - 0.5) * 10,
      color: ["#ef4444", "#f97316", "#facc15", "#84cc16"][Math.floor(Math.random() * 4)],
      size: Math.random() * 10 + 5,
      life: 1.0,
    }));
    setParticles((prev) => [...prev, ...newParticles]);
  };

  const startGame = () => {
    setScore(0);
    setSmashedCount(0);
    setBugs([]);
    setSpeedMultiplier(1);
    setLastGameReason(null);
    const selectedLengthMs = GAME_LENGTHS[gameLength].ms;
    setTimeLeftMs(selectedLengthMs);
    endTimeRef.current = Date.now() + selectedLengthMs;
    setIsPlaying(true);
    playSelect();
  };

  const stopGame = useCallback(
    (reason: "timeup" | "stopped" = "stopped") => {
      setIsPlaying(false);
      setBugs([]);
      setLastGameReason(reason);
      playGameOver();
    },
    [playGameOver],
  );

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
      setSpeedMultiplier((prev) => prev + 0.12);
    }, 12000);
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Game timer
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      const nextTimeLeft = Math.max(0, endTimeRef.current - Date.now());
      setTimeLeftMs(nextTimeLeft);

      if (nextTimeLeft <= 0) {
        stopGame("timeup");
      }
    }, 100);

    return () => clearInterval(interval);
  }, [isPlaying, stopGame]);

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

              // When a bug reaches its current target, retarget instead of removing it.
              if (dist < 5) {
                const viewportWidth = window.innerWidth;
                const viewportHeight = window.innerHeight;
                return {
                  ...bug,
                  targetX: Math.random() * Math.max(100, viewportWidth - 100),
                  targetY: Math.random() * Math.max(100, viewportHeight - 180) + 80,
                };
              }

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

  const totalSecondsLeft = Math.ceil(timeLeftMs / 1000);
  const displayMinutes = Math.floor(totalSecondsLeft / 60)
    .toString()
    .padStart(2, "0");
  const displaySeconds = (totalSecondsLeft % 60).toString().padStart(2, "0");

  return (
    <div
      ref={containerRef}
      className="bg-linear-to-br relative h-[100dvh] w-full overflow-hidden from-slate-900 via-slate-800 to-slate-900"
      style={{ cursor: isPlaying ? "crosshair" : "default" }}
    >
      {/* Background glow */}
      <div className="absolute left-[-10%] top-[-10%] h-[50%] w-[50%] animate-pulse rounded-full bg-blue-600/10 blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] h-[50%] w-[50%] animate-pulse rounded-full bg-violet-600/10 blur-[120px]" />

      {/* Score */}
      {isPlaying && (
        <div className="pointer-events-none absolute left-1/2 top-8 z-0 -translate-x-1/2 text-center">
          <div className="bg-linear-to-b from-blue-400 to-violet-600 bg-clip-text text-7xl font-black text-transparent">
            {score}
          </div>
          <div className="text-xl font-bold uppercase tracking-widest text-slate-400">Score</div>
          <div className="text-lg font-semibold text-slate-300">Bugs Smashed: {smashedCount}</div>
        </div>
      )}

      {isPlaying && (
        <div className="pointer-events-none absolute left-4 top-20 z-10 rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-left backdrop-blur-sm">
          <div className="text-xs uppercase tracking-wider text-slate-400">Time Left</div>
          <div className="font-mono text-3xl font-black text-cyan-300">
            {displayMinutes}:{displaySeconds}
          </div>
        </div>
      )}

      {isPlaying && (
        <div className="pointer-events-none absolute right-4 top-20 z-10 rounded-xl border border-white/10 bg-black/30 p-3 text-right backdrop-blur-sm">
          <div className="mb-1 text-xs uppercase tracking-wider text-slate-400">Bug Values</div>
          {BUG_TYPES.map((bug) => (
            <div
              key={bug.type}
              className="flex items-center justify-end gap-2 text-sm text-slate-200"
            >
              <span>{bug.emoji}</span>
              <span>{bug.points} pts</span>
            </div>
          ))}
        </div>
      )}

      {/* Start Screen */}
      {!isPlaying && (
        <div className="absolute inset-0 z-30 flex items-center justify-center">
          <div className="text-center">
            <div className="mb-4 flex items-center justify-center gap-2">
              {(["short", "medium", "long"] as const).map((length) => {
                const active = gameLength === length;
                return (
                  <button
                    key={length}
                    type="button"
                    onClick={() => setGameLength(length)}
                    className={`rounded-lg px-3 py-2 text-sm font-semibold transition-all ${
                      active
                        ? "bg-cyan-400 text-slate-900 shadow-md"
                        : "bg-white/10 text-slate-200 hover:bg-white/20"
                    }`}
                  >
                    {GAME_LENGTHS[length].label}
                  </button>
                );
              })}
            </div>
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
            {lastGameReason && (
              <p className="mt-4 text-base text-slate-300">
                {lastGameReason === "timeup" ? "Time Up!" : "Game Stopped"} Score:{" "}
                <span className="font-bold text-white">{scoreRef.current}</span> | Smashed:{" "}
                <span className="font-bold text-white">{smashedCountRef.current}</span>
              </p>
            )}
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
          aria-label={`${bug.type} bug worth ${bug.points} points`}
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
          onClick={() => stopGame("stopped")}
          className="fixed left-4 top-18 z-50 flex items-center gap-2 rounded-full border border-white/20 bg-red-700/80 px-4 py-2 font-semibold text-white backdrop-blur-md transition-all hover:border-white/40 hover:bg-red-700/95"
        >
          <span className="text-base leading-none">■</span>
          <span>Stop Game</span>
        </button>
      )}
    </div>
  );
}
