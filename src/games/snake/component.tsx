import { useCallback, useEffect, useRef, useState } from "react";
import { useSoundFX } from "../../hooks/useSoundFX";

interface Point {
  x: number;
  y: number;
}

const CELL_SIZE = 20;
const GRID_SIZE = 20;

export default function SnakeGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [snake, setSnake] = useState<Point[]>([
    { x: 10, y: 10 },
    { x: 9, y: 10 },
    { x: 8, y: 10 },
  ]);
  const [food, setFood] = useState<Point>({ x: 15, y: 10 });
  const [direction, setDirection] = useState<Point>({ x: 1, y: 0 });
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(() => {
    if (typeof window === "undefined") return 0;
    const saved = localStorage.getItem("snakeBestScore");
    return saved ? parseInt(saved, 10) : 0;
  });
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [gameSpeed, setGameSpeed] = useState(150);
  const directionRef = useRef(direction);
  const bestScoreRef = useRef(bestScore);
  const { playEat, playHit, playSelect, playGameOver } = useSoundFX();

  useEffect(() => {
    directionRef.current = direction;
  }, [direction]);

  useEffect(() => {
    bestScoreRef.current = bestScore;
  }, [bestScore]);

  const spawnFood = useCallback((currentSnake: Point[]) => {
    let newFood: Point;
    do {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
    } while (currentSnake.some((s) => s.x === newFood.x && s.y === newFood.y));
    return newFood;
  }, []);

  const startGame = () => {
    const initialSnake = [
      { x: 10, y: 10 },
      { x: 9, y: 10 },
      { x: 8, y: 10 },
    ];
    setSnake(initialSnake);
    setDirection({ x: 1, y: 0 });
    directionRef.current = { x: 1, y: 0 };
    setFood(spawnFood(initialSnake));
    setScore(0);
    setGameSpeed(150);
    setGameOver(false);
    setIsPlaying(true);
    playSelect();
  };

  // Game loop
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setSnake((prevSnake) => {
        const head = {
          x: prevSnake[0].x + directionRef.current.x,
          y: prevSnake[0].y + directionRef.current.y,
        };
        const willEat = head.x === food.x && head.y === food.y;

        // Wall collision
        if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
          setIsPlaying(false);
          setGameOver(true);
          playHit();
          playGameOver();
          return prevSnake;
        }

        // Self collision (moving into the current tail cell is valid unless we're growing)
        const collisionBody = willEat ? prevSnake : prevSnake.slice(0, -1);
        if (collisionBody.some((s) => s.x === head.x && s.y === head.y)) {
          setIsPlaying(false);
          setGameOver(true);
          playHit();
          playGameOver();
          return prevSnake;
        }

        const newSnake = [head, ...prevSnake];

        // Food collision
        if (willEat) {
          setScore((s) => {
            const newScore = s + 10;
            if (newScore > bestScoreRef.current) {
              setBestScore(newScore);
              bestScoreRef.current = newScore;
              localStorage.setItem("snakeBestScore", newScore.toString());
            }
            return newScore;
          });
          setFood(spawnFood(newSnake));
          setGameSpeed((s) => Math.max(50, s - 5));
          playEat();
        } else {
          newSnake.pop();
        }

        return newSnake;
      });
    }, gameSpeed);

    return () => clearInterval(interval);
  }, [isPlaying, food, gameSpeed, spawnFood, playEat, playHit, playGameOver]);

  // Controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const dir = directionRef.current;
      switch (e.key) {
        case "ArrowUp":
        case "w":
        case "W":
          if (dir.y !== 1) setDirection({ x: 0, y: -1 });
          break;
        case "ArrowDown":
        case "s":
        case "S":
          if (dir.y !== -1) setDirection({ x: 0, y: 1 });
          break;
        case "ArrowLeft":
        case "a":
        case "A":
          if (dir.x !== 1) setDirection({ x: -1, y: 0 });
          break;
        case "ArrowRight":
        case "d":
        case "D":
          if (dir.x !== -1) setDirection({ x: 1, y: 0 });
          break;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Draw
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Background
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Grid
    ctx.strokeStyle = "rgba(34,197,94,0.1)";
    for (let i = 0; i <= GRID_SIZE; i++) {
      ctx.beginPath();
      ctx.moveTo(i * CELL_SIZE, 0);
      ctx.lineTo(i * CELL_SIZE, canvas.height);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i * CELL_SIZE);
      ctx.lineTo(canvas.width, i * CELL_SIZE);
      ctx.stroke();
    }

    // Snake
    snake.forEach((segment, i) => {
      const gradient = ctx.createRadialGradient(
        segment.x * CELL_SIZE + CELL_SIZE / 2,
        segment.y * CELL_SIZE + CELL_SIZE / 2,
        0,
        segment.x * CELL_SIZE + CELL_SIZE / 2,
        segment.y * CELL_SIZE + CELL_SIZE / 2,
        CELL_SIZE,
      );
      gradient.addColorStop(0, i === 0 ? "#4ade80" : "#22c55e");
      gradient.addColorStop(1, i === 0 ? "#22c55e" : "#16a34a");
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.roundRect(
        segment.x * CELL_SIZE + 1,
        segment.y * CELL_SIZE + 1,
        CELL_SIZE - 2,
        CELL_SIZE - 2,
        4,
      );
      ctx.fill();
    });

    // Food
    ctx.fillStyle = "#ef4444";
    ctx.shadowColor = "#ef4444";
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.arc(
      food.x * CELL_SIZE + CELL_SIZE / 2,
      food.y * CELL_SIZE + CELL_SIZE / 2,
      CELL_SIZE / 2 - 2,
      0,
      Math.PI * 2,
    );
    ctx.fill();
    ctx.shadowBlur = 0;
  }, [snake, food]);

  return (
    <div className="relative flex h-[100dvh] w-full items-center justify-center overflow-hidden bg-linear-to-br from-green-900 via-emerald-900 to-slate-900">
      {/* Score */}
      <div className="absolute right-4 top-4 z-20 text-right">
        <div className="text-3xl font-bold text-white">Score: {score}</div>
        <div className="text-lg text-slate-400">Best: {bestScore}</div>
      </div>

      <div className="text-center">
        <canvas
          ref={canvasRef}
          width={400}
          height={400}
          className="rounded-2xl border-4 border-green-500/50 shadow-2xl"
        />

        <p className="mt-4 text-slate-400">Use Arrow Keys or WASD to move</p>

        <button
          type="button"
          onClick={startGame}
          className="mt-6 rounded-full bg-linear-to-r from-green-500 to-emerald-500 px-8 py-3 text-xl font-bold text-white shadow-lg transition-all hover:scale-105 active:scale-95"
        >
          {isPlaying ? "Restart" : "Start Game"}
        </button>
      </div>

      {/* Game Over */}
      {gameOver && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-slate-900/90 backdrop-blur-sm">
          <div className="text-center">
            <h1 className="mb-4 bg-linear-to-r from-red-400 to-orange-500 bg-clip-text text-6xl font-black text-transparent">
              Game Over!
            </h1>
            <p className="mb-2 text-2xl text-slate-400">Your Score</p>
            <p className="mb-8 text-6xl font-black text-white">{score}</p>
            <button
              type="button"
              onClick={startGame}
              className="rounded-full bg-linear-to-r from-green-500 to-emerald-500 px-12 py-4 text-2xl font-bold text-white shadow-lg transition-all hover:scale-105 active:scale-95"
            >
              Play Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
