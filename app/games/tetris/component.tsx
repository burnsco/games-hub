"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSoundFX } from "../../hooks/useSoundFX";

// Types
type Grid = (string | 0)[][];
type TetrominoShape = number[][];
type TetrominoParams = {
  shape: TetrominoShape;
  color: string;
};

// Constants
const ROWS = 20;
const COLS = 10;

const TETROMINOES: { [key: string]: TetrominoParams } = {
  I: { shape: [[1, 1, 1, 1]], color: "bg-cyan-400 border-cyan-500" },
  J: {
    shape: [
      [1, 0, 0],
      [1, 1, 1],
    ],
    color: "bg-blue-500 border-blue-600",
  },
  L: {
    shape: [
      [0, 0, 1],
      [1, 1, 1],
    ],
    color: "bg-orange-500 border-orange-600",
  },
  O: {
    shape: [
      [1, 1],
      [1, 1],
    ],
    color: "bg-yellow-400 border-yellow-500",
  },
  S: {
    shape: [
      [0, 1, 1],
      [1, 1, 0],
    ],
    color: "bg-green-500 border-green-600",
  },
  T: {
    shape: [
      [0, 1, 0],
      [1, 1, 1],
    ],
    color: "bg-purple-500 border-purple-600",
  },
  Z: {
    shape: [
      [1, 1, 0],
      [0, 1, 1],
    ],
    color: "bg-red-500 border-red-600",
  },
};

const RANDOM_TETROMINO = () => {
  const keys = Object.keys(TETROMINOES);
  const randKey = keys[Math.floor(Math.random() * keys.length)];
  return { ...TETROMINOES[randKey], type: randKey };
};

const createGrid = () => Array.from(Array(ROWS), () => Array(COLS).fill(0));

export default function TetrisGame() {
  const [grid, setGrid] = useState<Grid>(createGrid());
  const [activePiece, setActivePiece] = useState({
    pos: { x: 0, y: 0 },
    tetromino: TETROMINOES.I, // Default, will be reset on start
    collided: false,
  });
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [gameOver, setGameOver] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [highScore, setHighScore] = useState(0);
  const [isClient, setIsClient] = useState(false);

  // Refs for muteable state in loop
  const requestRef = useRef<number | undefined>(undefined);
  const lastTimeRef = useRef<number | undefined>(undefined);
  const dropCounterRef = useRef(0);
  const dropIntervalRef = useRef(1000);
  const scoreRef = useRef(0);
  const levelRef = useRef(1);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isMuted, setIsMuted] = useState(false);

  const soundFX = useSoundFX();

  useEffect(() => {
    setIsClient(true);
    const saved = localStorage.getItem("tetrisHighScore");
    if (saved) setHighScore(parseInt(saved, 10));
  }, []);

  const resetGame = useCallback(() => {
    setGrid(createGrid());
    setScore(0);
    scoreRef.current = 0;
    setLevel(1);
    levelRef.current = 1;
    setGameOver(false);
    setIsPlaying(true);
    dropIntervalRef.current = 1000;

    // Start music
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {
        // Auto-play policy might block this if no interaction yet
      });
    }

    // Spawn first piece
    const newPiece = RANDOM_TETROMINO();
    setActivePiece({
      pos: { x: Math.floor(COLS / 2) - 2, y: 0 },
      tetromino: newPiece,
      collided: false,
    });
  }, []);

  // Check for collision using refs to avoid stale state in loop?
  // Actually, for the loop we might need to rely on functional state updates or refs for grid too.
  // For simplicity in this "Lite" version, we'll try to keep it React-driven but optimize the loop.
  // However, to avoid closure staleness in setInterval/requestAnimationFrame, refs for grid are safer.
  const gridRef = useRef(grid);
  const activePieceRef = useRef(activePiece);

  useEffect(() => {
    gridRef.current = grid;
  }, [grid]);
  useEffect(() => {
    activePieceRef.current = activePiece;
  }, [activePiece]);

  const checkCollision = useCallback((x: number, y: number, shape: TetrominoShape) => {
    for (let r = 0; r < shape.length; r += 1) {
      for (let c = 0; c < shape[r].length; c += 1) {
        if (shape[r][c] !== 0) {
          const newY = y + r;
          const newX = x + c;

          if (
            newY >= ROWS ||
            newX < 0 ||
            newX >= COLS ||
            (newY >= 0 && gridRef.current[newY][newX] !== 0)
          ) {
            return true;
          }
        }
      }
    }
    return false;
  }, []);

  const move = useCallback(
    (dir: { x: number; y: number }) => {
      if (
        !checkCollision(
          activePiece.pos.x + dir.x,
          activePiece.pos.y + dir.y,
          activePiece.tetromino.shape,
        )
      ) {
        setActivePiece((prev) => ({
          ...prev,
          pos: { x: prev.pos.x + dir.x, y: prev.pos.y + dir.y },
        }));
        return true;
      }
      return false;
    },
    [activePiece, checkCollision],
  );

  const rotate = useCallback(() => {
    const matrix = activePiece.tetromino.shape;
    const rotatedShape = matrix[0].map((_, index) => matrix.map((col) => col[index]).reverse());

    // Wall kick (basic)
    let offset = 0;
    if (checkCollision(activePiece.pos.x, activePiece.pos.y, rotatedShape)) {
      offset = activePiece.pos.x > COLS / 2 ? -1 : 1;
      if (checkCollision(activePiece.pos.x + offset, activePiece.pos.y, rotatedShape)) {
        return; // Can't rotate
      }
    }

    setActivePiece((prev) => ({
      ...prev,
      pos: { ...prev.pos, x: prev.pos.x + offset },
      tetromino: { ...prev.tetromino, shape: rotatedShape },
    }));
  }, [activePiece, checkCollision]);

  const sweepRows = useCallback(
    (newGrid: Grid) => {
      let rowsCleared = 0;
      const sweptGrid = newGrid.reduce((ack, row) => {
        if (row.findIndex((cell) => cell === 0) === -1) {
          rowsCleared += 1;
          ack.unshift(Array(COLS).fill(0));
          return ack;
        }
        ack.push(row);
        return ack;
      }, [] as Grid);

      if (rowsCleared > 0) {
        const points = [0, 100, 300, 500, 800][rowsCleared] * level;
        setScore((prev) => {
          const newScore = prev + points;
          if (newScore > highScore) {
            setHighScore(newScore);
            localStorage.setItem("tetrisHighScore", newScore.toString());
          }
          scoreRef.current = newScore;
          return newScore;
        });
        setLevel((prev) => {
          const newLevel = prev + Math.floor(rowsCleared * 0.1);
          levelRef.current = newLevel;
          return newLevel;
        }); // Simple leveling
        dropIntervalRef.current = Math.max(100, 1000 - level * 50);
        soundFX.playScore();
      }
      return sweptGrid;
    },
    [level, highScore, soundFX],
  );

  const drop = useCallback(() => {
    // We increase y
    if (
      !checkCollision(
        activePieceRef.current.pos.x,
        activePieceRef.current.pos.y + 1,
        activePieceRef.current.tetromino.shape,
      )
    ) {
      setActivePiece((prev) => ({
        ...prev,
        pos: { ...prev.pos, y: prev.pos.y + 1 },
      }));
    } else {
      // Lock
      if (activePieceRef.current.pos.y < 1) {
        setGameOver(true);
        setIsPlaying(false);
        soundFX.playGameOver();

        // Game over
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
        }

        return;
      }

      // Stop music on game over
      if (activePieceRef.current.pos.y < 1) {
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
        }
      }

      const newGrid = [...gridRef.current];
      const { pos, tetromino } = activePieceRef.current;
      tetromino.shape.forEach((row, y) => {
        row.forEach((value, x) => {
          if (value !== 0) {
            // Fix: Ensure we are writing to valid grid coordinates
            if (newGrid[y + pos.y] && newGrid[y + pos.y][x + pos.x] !== undefined) {
              newGrid[y + pos.y][x + pos.x] = tetromino.color;
            }
          }
        });
      });

      const sweptGrid = sweepRows(newGrid);
      setGrid(sweptGrid);

      // New piece
      const newPiece = RANDOM_TETROMINO();
      setActivePiece({
        pos: { x: Math.floor(COLS / 2) - 2, y: 0 },
        tetromino: newPiece,
        collided: false,
      });
      soundFX.playBlip(200);
    }
  }, [checkCollision, sweepRows, soundFX]); // Refs handle the rest

  // Game Loop
  const update = useCallback(
    (time: number) => {
      if (!isPlaying || gameOver) return;

      if (!lastTimeRef.current) lastTimeRef.current = time;
      const deltaTime = time - lastTimeRef.current;
      lastTimeRef.current = time;

      dropCounterRef.current += deltaTime;
      if (dropCounterRef.current > dropIntervalRef.current) {
        drop();
        dropCounterRef.current = 0;
      }

      requestRef.current = requestAnimationFrame(update);
    },
    [isPlaying, gameOver, drop],
  );

  useEffect(() => {
    if (isPlaying && !gameOver) {
      requestRef.current = requestAnimationFrame(update);
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isPlaying, gameOver, update]);

  // Controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isPlaying || gameOver) return;

      if (e.key === "ArrowLeft" || e.key === "a") {
        move({ x: -1, y: 0 });
      } else if (e.key === "ArrowRight" || e.key === "d") {
        move({ x: 1, y: 0 });
      } else if (e.key === "ArrowDown" || e.key === "s") {
        drop();
      } else if (e.key === "ArrowUp" || e.key === "w") {
        rotate();
      } else if (e.key === " ") {
        // Hard drop loop? For now just one drop
        // Implementing hard drop correctly requires a loop until collision
        let currentY = activePieceRef.current.pos.y;
        while (
          !checkCollision(
            activePieceRef.current.pos.x,
            currentY + 1,
            activePieceRef.current.tetromino.shape,
          )
        ) {
          currentY++;
        }
        // Update position then trigger drop logic (which locks) by calling drop() one last time with correct Y?
        // Easier to just update Y and let next loop lock it, or force lock.
        // Let's just do fast drop:
        setActivePiece((prev) => ({ ...prev, pos: { ...prev.pos, y: currentY } }));
        // Force lock next frame
        dropCounterRef.current = dropIntervalRef.current + 1;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPlaying, gameOver, move, drop, rotate, checkCollision]);

  // Rendering Helpers
  const getCellColor = (r: number, c: number) => {
    // Check active piece
    const { pos, tetromino } = activePiece;
    if (
      r >= pos.y &&
      r < pos.y + tetromino.shape.length &&
      c >= pos.x &&
      c < pos.x + tetromino.shape[0].length &&
      tetromino.shape[r - pos.y][c - pos.x] !== 0
    ) {
      return tetromino.color;
    }
    return grid[r][c] || "bg-slate-800/50 border-slate-700/50";
  };

  return (
    <div className="flex h-[100dvh] w-full flex-col items-center justify-center overflow-hidden bg-slate-950 p-2 font-sans md:p-4">
      <div className="flex gap-8 items-start">
        {/* Left Column: Hold/Stats */}
        <div className="hidden md:flex flex-col gap-4">
          <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 w-32">
            <div className="text-xs text-slate-400 uppercase font-bold mb-1">Score</div>
            <div className="text-xl font-bold text-white">{score}</div>
          </div>
          <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 w-32">
            <div className="text-xs text-slate-400 uppercase font-bold mb-1">Level</div>
            <div className="text-xl font-bold text-white">{level}</div>
          </div>
          <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 w-32">
            <div className="text-xs text-slate-400 uppercase font-bold mb-1">Best</div>
            <div className="text-xl font-bold text-white">{isClient ? highScore : 0}</div>
          </div>
          <button
            type="button"
            onClick={() => setIsMuted(!isMuted)}
            className="bg-slate-900 p-4 rounded-xl border border-slate-800 w-32 flex flex-col items-center justify-center hover:bg-slate-800 transition-colors"
          >
            <div className="text-2xl mb-1">{isMuted ? "🔇" : "🔊"}</div>
            <div className="text-xs text-slate-400 uppercase font-bold">
              {isMuted ? "Unmute" : "Mute"}
            </div>
          </button>
        </div>

        {/* Main Game Area */}
        <div className="relative bg-slate-900 p-1 rounded-sm border-4 border-slate-800 shadow-2xl">
          <div
            className="grid gap-px bg-slate-800/50"
            style={{
              gridTemplateColumns: `repeat(${COLS}, 1.5rem)`,
              gridTemplateRows: `repeat(${ROWS}, 1.5rem)`,
            }}
          >
            {grid.map((row, r) =>
              row.map((_, c) => (
                <div
                  // biome-ignore lint/suspicious/noArrayIndexKey: grid fixed
                  key={`${r}-${c}`}
                  className={`w-6 h-6 border ${getCellColor(r, c)}`}
                />
              )),
            )}
          </div>

          {/* Overlays */}
          {(!isPlaying || gameOver) && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-sm z-10">
              <h2 className="text-4xl font-black text-white mb-2">TETRIS</h2>
              {gameOver && <p className="text-red-500 font-bold text-xl mb-4">GAME OVER</p>}
              <button
                type="button"
                onClick={resetGame}
                className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-full transition-transform hover:scale-105 active:scale-95"
              >
                {gameOver ? "Try Again" : "Start Game"}
              </button>
            </div>
          )}
        </div>

        {/* Mobile Stats (visible only on small screens) */}
        <div className="md:hidden flex flex-col gap-4">
          <div className="text-white text-center">Score: {score}</div>
          <button
            type="button"
            onClick={resetGame}
            className="px-4 py-2 bg-indigo-600 rounded text-white text-sm"
          >
            Reset
          </button>
        </div>
      </div>

      <div className="mt-3 text-xs text-slate-500 md:mt-6 md:text-sm">
        Use <b>Arrows</b> to move/rotate • <b>Space</b> to drop
      </div>

      {/* Audio Element */}
      {/* biome-ignore lint/a11y/useMediaCaption: Music track */}
      <audio ref={audioRef} src="/tetris-music.mp3" loop muted={isMuted} />
    </div>
  );
}
