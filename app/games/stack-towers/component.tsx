"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSoundFX } from "../../hooks/useSoundFX";

interface TowerBlock {
  id: number;
  x: number;
  y: number;
  width: number;
  color: string;
}

interface ActiveBlock {
  x: number;
  y: number;
  width: number;
  speed: number;
  direction: 1 | -1;
  color: string;
}

const STAGE_WIDTH = 520;
const STAGE_HEIGHT = 620;
const BLOCK_HEIGHT = 28;
const BASE_Y = STAGE_HEIGHT - BLOCK_HEIGHT - 16;
const MIN_OVERLAP = 8;
const START_WIDTH = 220;
const STORAGE_KEY = "stackTowersBestScore";

const BLOCK_COLORS = [
  "from-sky-400 to-blue-500",
  "from-cyan-400 to-teal-500",
  "from-indigo-400 to-blue-600",
  "from-emerald-400 to-cyan-500",
  "from-violet-400 to-indigo-500",
  "from-rose-400 to-orange-500",
] as const;

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const getColor = (index: number) => BLOCK_COLORS[index % BLOCK_COLORS.length];

export default function StackTowersGame() {
  const { playSelect, playScore, playHit, playGameOver, playBlip } = useSoundFX();

  const [blocks, setBlocks] = useState<TowerBlock[]>([]);
  const [activeBlock, setActiveBlock] = useState<ActiveBlock | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const blockIdRef = useRef(0);

  const isPlayingRef = useRef(isPlaying);
  const activeBlockRef = useRef<ActiveBlock | null>(activeBlock);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    activeBlockRef.current = activeBlock;
  }, [activeBlock]);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return;
    const parsed = parseInt(saved, 10);
    if (!Number.isNaN(parsed)) {
      setBestScore(parsed);
    }
  }, []);

  const createActiveBlock = useCallback((width: number, y: number, level: number): ActiveBlock => {
    const direction: 1 | -1 = level % 2 === 0 ? 1 : -1;
    const x = direction === 1 ? 0 : STAGE_WIDTH - width;
    return {
      x,
      y,
      width,
      direction,
      speed: clamp(2.4 + level * 0.15, 2.4, 8),
      color: getColor(level),
    };
  }, []);

  const startGame = useCallback(() => {
    const base: TowerBlock = {
      id: blockIdRef.current++,
      width: START_WIDTH,
      x: (STAGE_WIDTH - START_WIDTH) / 2,
      y: BASE_Y,
      color: "from-blue-500 to-cyan-500",
    };

    setBlocks([base]);
    setActiveBlock(createActiveBlock(START_WIDTH, BASE_Y - BLOCK_HEIGHT, 1));
    setScore(0);
    setGameOver(false);
    setIsPlaying(true);
    playSelect();
  }, [createActiveBlock, playSelect]);

  const endGame = useCallback(() => {
    setIsPlaying(false);
    setGameOver(true);
    setActiveBlock(null);
    playHit();
    playGameOver();
  }, [playHit, playGameOver]);

  const placeBlock = useCallback(() => {
    if (!isPlayingRef.current) return;

    setBlocks((currentBlocks) => {
      const currentActive = activeBlockRef.current;
      const topBlock = currentBlocks.at(-1);

      if (!currentActive || !topBlock) {
        return currentBlocks;
      }

      const overlapStart = Math.max(currentActive.x, topBlock.x);
      const overlapEnd = Math.min(
        currentActive.x + currentActive.width,
        topBlock.x + topBlock.width,
      );
      const overlap = overlapEnd - overlapStart;

      if (overlap < MIN_OVERLAP) {
        endGame();
        return currentBlocks;
      }

      const level = currentBlocks.length;
      let nextY = topBlock.y - BLOCK_HEIGHT;
      let shifted = [...currentBlocks];

      if (nextY < 96) {
        shifted = shifted
          .map((block) => ({ ...block, y: block.y + BLOCK_HEIGHT }))
          .filter((block) => block.y < STAGE_HEIGHT - 4);
        nextY += BLOCK_HEIGHT;
      }

      const placedBlock: TowerBlock = {
        id: blockIdRef.current++,
        x: overlapStart,
        y: nextY,
        width: overlap,
        color: currentActive.color,
      };

      setScore((prev) => {
        const newScore = prev + 1;
        if (newScore > bestScore) {
          setBestScore(newScore);
          localStorage.setItem(STORAGE_KEY, String(newScore));
        }
        return newScore;
      });

      playScore();
      playBlip(540);

      setActiveBlock(createActiveBlock(overlap, nextY - BLOCK_HEIGHT, level + 1));
      return [...shifted, placedBlock];
    });
  }, [bestScore, createActiveBlock, endGame, playBlip, playScore]);

  useEffect(() => {
    let frameId: number;

    const animate = () => {
      setActiveBlock((current) => {
        if (!current || !isPlayingRef.current) return current;

        const maxX = STAGE_WIDTH - current.width;
        const nextX = current.x + current.speed * current.direction;

        if (nextX < 0 || nextX > maxX) {
          return {
            ...current,
            x: clamp(nextX, 0, maxX),
            direction: current.direction === 1 ? -1 : 1,
          };
        }

        return { ...current, x: nextX };
      });

      frameId = requestAnimationFrame(animate);
    };

    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, []);

  const placeLabel = useMemo(() => (gameOver ? "Play Again" : "Drop Block"), [gameOver]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.code !== "Space" && event.code !== "Enter") return;
      event.preventDefault();

      if (!isPlayingRef.current) {
        startGame();
        return;
      }

      placeBlock();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [placeBlock, startGame]);

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-linear-to-b from-slate-950 via-slate-900 to-slate-950 px-4 py-10">
      <div className="pointer-events-none absolute left-[-10%] top-[-10%] h-[40%] w-[40%] rounded-full bg-sky-500/15 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-[-10%] right-[-10%] h-[40%] w-[40%] rounded-full bg-blue-600/15 blur-[120px]" />

      <div className="relative z-10 w-full max-w-3xl">
        <div className="mb-6 text-center">
          <h1 className="bg-linear-to-r from-sky-300 to-blue-500 bg-clip-text text-5xl font-black text-transparent">
            Stack Towers
          </h1>
          <p className="mt-2 text-slate-400">
            Time each drop. Perfect alignment builds a taller tower.
          </p>
        </div>

        <div className="mb-5 grid grid-cols-2 gap-3 text-center md:grid-cols-4">
          <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
            <div className="text-xs uppercase tracking-widest text-slate-400">Score</div>
            <div className="text-3xl font-black text-white">{score}</div>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
            <div className="text-xs uppercase tracking-widest text-slate-400">Best</div>
            <div className="text-3xl font-black text-sky-300">{bestScore}</div>
          </div>
          <div className="col-span-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
            <div className="text-xs uppercase tracking-widest text-slate-400">Controls</div>
            <div className="text-sm font-semibold text-slate-100">
              Click stage or press Space / Enter
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            if (!isPlaying) {
              startGame();
              return;
            }
            placeBlock();
          }}
          className="relative mx-auto h-[620px] w-full max-w-[520px] cursor-pointer overflow-hidden rounded-2xl border border-white/15 bg-linear-to-b from-slate-800/80 to-slate-900 shadow-[0_0_40px_rgba(14,165,233,0.2)] outline-hidden"
          style={{ maxWidth: STAGE_WIDTH }}
        >
          <div className="absolute inset-x-0 bottom-0 h-28 bg-linear-to-t from-slate-900/70 to-transparent" />

          {blocks.map((block) => (
            <div
              key={block.id}
              className={`bg-linear-to-r absolute rounded-md border border-white/20 ${block.color}`}
              style={{
                left: block.x,
                top: block.y,
                width: block.width,
                height: BLOCK_HEIGHT,
              }}
            />
          ))}

          {activeBlock && isPlaying && (
            <div
              className={`bg-linear-to-r absolute rounded-md border border-white/20 shadow-[0_0_24px_rgba(56,189,248,0.35)] ${activeBlock.color}`}
              style={{
                left: activeBlock.x,
                top: activeBlock.y,
                width: activeBlock.width,
                height: BLOCK_HEIGHT,
              }}
            />
          )}

          {!isPlaying && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-950/35 backdrop-blur-[2px]">
              <div className="text-center">
                <div className="mb-3 text-6xl">🧱</div>
                <p className="text-2xl font-black text-white">
                  {gameOver ? "Tower Fell" : "Ready to Stack?"}
                </p>
                <p className="mt-2 text-sm text-slate-300">
                  {gameOver
                    ? "Missed alignment ends the run. Try one more tower."
                    : "Start with perfect timing and keep your tower alive."}
                </p>
                <div className="mt-5 rounded-xl border border-sky-300/30 bg-sky-400/15 px-5 py-3 font-semibold text-sky-200">
                  {placeLabel}
                </div>
              </div>
            </div>
          )}
        </button>
      </div>
    </div>
  );
}
