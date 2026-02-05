"use client";

import { useState } from "react";
import BackButton from "@/app/components/BackButton";

interface CoinStats {
  heads: number;
  tails: number;
  total: number;
}

interface Die {
  id: string;
  value: number | string;
}

interface HistoryItem {
  id: string;
  value: number;
}

interface DiceState {
  count: number;
  sides: number;
  values: Die[];
  total: number | null;
  history: HistoryItem[];
}

export default function CoinDicePage() {
  // Coin State
  const [isFlipping, setIsFlipping] = useState(false);
  const [coinResult, setCoinResult] = useState<string>("");
  const [coinStats, setCoinStats] = useState<CoinStats>({ heads: 0, tails: 0, total: 0 });
  const [flipClass, setFlipClass] = useState<string>("");

  // Dice State
  const [dice, setDice] = useState<DiceState>({
    count: 2,
    sides: 6,
    values: [
      { id: "1", value: "?" },
      { id: "2", value: "?" },
    ],
    total: null,
    history: [],
  });
  const [isRolling, setIsRolling] = useState(false);

  // Coin Logic
  const flipCoin = () => {
    if (isFlipping) return;
    setIsFlipping(true);
    setCoinResult("");
    setFlipClass("");

    const result = Math.random() < 0.5 ? "heads" : "tails";

    // Trigger animation via class change
    setTimeout(() => {
      setFlipClass(result === "heads" ? "animate-flipHeads" : "animate-flipTails");
    }, 10);

    setTimeout(() => {
      if (result === "heads") {
        setCoinStats((prev) => ({ ...prev, heads: prev.heads + 1, total: prev.total + 1 }));
        setCoinResult("Heads!");
      } else {
        setCoinStats((prev) => ({ ...prev, tails: prev.tails + 1, total: prev.total + 1 }));
        setCoinResult("Tails!");
      }
      setIsFlipping(false);
    }, 1500);
  };

  const flipMultiple = async (times: number) => {
    if (isFlipping) return;
    for (let i = 0; i < times; i++) {
      flipCoin();
      await new Promise((resolve) => setTimeout(resolve, 1600));
    }
  };

  // Dice Logic
  const rollDice = () => {
    if (isRolling) return;
    setIsRolling(true);
    setDice((prev) => ({ ...prev, total: null }));

    setTimeout(() => {
      const newValues: Die[] = Array.from({ length: dice.count }, (_, i) => ({
        id: `${Date.now()}-${i}`,
        value: Math.floor(Math.random() * dice.sides) + 1,
      }));

      const sum = newValues.reduce((a, b) => a + (typeof b.value === "number" ? b.value : 0), 0);

      setDice((prev) => ({
        ...prev,
        values: newValues,
        total: sum,
        history: [{ id: `roll-${Date.now()}`, value: sum }, ...prev.history].slice(0, 5),
      }));
      setIsRolling(false);
    }, 800);
  };

  return (
    <>
      <BackButton />
      <div className="container max-w-6xl px-4 py-8 mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="flex items-center justify-center w-16 h-16 text-4xl shadow-xl rounded-2xl bg-linear-to-br from-blue-500 to-violet-500 shadow-blue-500/20">
            🎲
          </div>
          <div>
            <h1 className="mb-2 text-4xl font-bold text-white">Coin & Dice</h1>
            <p className="text-slate-400">Flip a coin or roll dice for your games.</p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Coin Flipper */}
          <div className="p-8 border shadow-2xl rounded-2xl border-slate-700/50 bg-slate-800/50 backdrop-blur-sm">
            <h2 className="flex items-center gap-2 mb-6 text-2xl font-bold text-white">
              <span className="text-3xl">🪙</span>
              Coin Flipper
            </h2>

            <div className="flex flex-col items-center gap-6">
              <div className="relative h-48 w-48 [perspective:1000px]">
                <div
                  className={`relative h-full w-full transition-transform duration-600 [transform-style:preserve-3d] ${flipClass}`}
                >
                  {/* Heads */}
                  <div className="absolute inset-0 h-full w-full [transform:rotateY(0deg)] [backface-visibility:hidden]">
                    <div className="flex items-center justify-center w-full h-full border-4 rounded-full shadow-2xl border-amber-300 bg-linear-to-br from-amber-400 to-amber-600">
                      <span className="text-6xl font-bold text-amber-900">H</span>
                    </div>
                  </div>
                  {/* Tails */}
                  <div className="absolute inset-0 h-full w-full [transform:rotateY(180deg)] [backface-visibility:hidden]">
                    <div className="flex items-center justify-center w-full h-full border-4 rounded-full shadow-2xl border-amber-400 bg-linear-to-br from-amber-500 to-amber-700">
                      <span className="text-6xl font-bold text-amber-950">T</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="min-h-10">
                <p className="text-2xl font-bold text-transparent bg-linear-to-r from-amber-400 to-amber-600 bg-clip-text">
                  {coinResult}
                </p>
              </div>

              <div className="flex flex-col w-full gap-3">
                <button
                  type="button"
                  onClick={flipCoin}
                  disabled={isFlipping}
                  className="w-full px-6 py-4 font-bold text-white transition-all duration-200 transform shadow-lg rounded-xl bg-linear-to-r from-amber-500 to-orange-500 hover:scale-105 hover:from-amber-600 hover:to-orange-600 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
                >
                  Flip Coin
                </button>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => flipMultiple(5)}
                    disabled={isFlipping}
                    className="flex-1 px-4 py-2 font-semibold text-white transition-all duration-200 rounded-lg bg-slate-700 hover:bg-slate-600 disabled:opacity-50"
                  >
                    Flip 5x
                  </button>
                  <button
                    type="button"
                    onClick={() => flipMultiple(10)}
                    disabled={isFlipping}
                    className="flex-1 px-4 py-2 font-semibold text-white transition-all duration-200 rounded-lg bg-slate-700 hover:bg-slate-600 disabled:opacity-50"
                  >
                    Flip 10x
                  </button>
                </div>
              </div>

              <div className="w-full p-4 rounded-lg bg-slate-900/50">
                <div className="flex justify-between text-sm">
                  <div>
                    <p className="text-slate-400">Heads</p>
                    <p className="text-xl font-bold text-amber-400">{coinStats.heads}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-slate-400">Total</p>
                    <p className="text-xl font-bold text-white">{coinStats.total}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-slate-400">Tails</p>
                    <p className="text-xl font-bold text-amber-400">{coinStats.tails}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Dice Roller */}
          <div className="p-8 border shadow-2xl rounded-2xl border-slate-700/50 bg-slate-800/50 backdrop-blur-sm">
            <h2 className="flex items-center gap-2 mb-6 text-2xl font-bold text-white">
              <span className="text-3xl">🎲</span>
              Dice Roller
            </h2>

            <div className="flex flex-col items-center gap-6">
              <div className="grid grid-cols-3 gap-4">
                {dice.values.map((die) => (
                  <div
                    key={die.id}
                    className={`relative flex h-20 w-20 items-center justify-center rounded-xl bg-linear-to-br from-blue-500 to-indigo-600 text-3xl font-bold text-white shadow-xl ${isRolling ? "animate-rollDice" : ""}`}
                  >
                    {die.value}
                    <div className="absolute inset-0 pointer-events-none rounded-xl bg-linear-to-br from-white/20 to-transparent" />
                  </div>
                ))}
              </div>

              <div className="text-center min-h-15">
                <p className="text-3xl font-bold text-transparent bg-linear-to-r from-blue-400 to-violet-600 bg-clip-text">
                  {dice.total !== null ? dice.values.map((d) => d.value).join(" + ") : ""}
                </p>
                <p className="mt-1 text-lg text-slate-400">
                  {dice.total !== null ? `Total: ${dice.total}` : ""}
                </p>
              </div>

              <div className="w-full space-y-3">
                <div className="p-4 rounded-lg bg-slate-900/50">
                  <p className="block mb-2 text-sm text-slate-400">Number of Dice</p>
                  <div className="flex gap-2">
                    {[1, 2, 3, 6].map((num) => (
                      <button
                        type="button"
                        key={num}
                        onClick={() =>
                          setDice((prev) => ({
                            ...prev,
                            count: num,
                            values: Array.from({ length: num }, (_, i) => ({
                              id: `init-${i}`,
                              value: "?",
                            })),
                          }))
                        }
                        className={`flex-1 rounded-lg px-4 py-2 font-semibold text-white transition-all duration-200 ${dice.count === num ? "bg-blue-600" : "bg-slate-700 hover:bg-blue-600"}`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-slate-900/50">
                  <p className="block mb-2 text-sm text-slate-400">Dice Type</p>
                  <div className="grid grid-cols-4 gap-2">
                    {[4, 6, 10, 20].map((sides) => (
                      <button
                        type="button"
                        key={sides}
                        onClick={() => setDice((prev) => ({ ...prev, sides }))}
                        className={`rounded-lg px-3 py-2 font-semibold text-white transition-all duration-200 ${dice.sides === sides ? "bg-violet-600" : "bg-slate-700 hover:bg-violet-600"}`}
                      >
                        D{sides}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={rollDice}
                  disabled={isRolling}
                  className="w-full px-6 py-4 font-bold text-white transition-all duration-200 transform shadow-lg rounded-xl bg-linear-to-r from-blue-500 to-violet-500 hover:scale-105 hover:from-blue-600 hover:to-violet-600 hover:shadow-xl disabled:opacity-50"
                >
                  Roll Dice
                </button>
              </div>

              <div className="w-full p-4 rounded-lg bg-slate-900/50">
                <p className="mb-2 text-sm text-slate-400">Last 5 Rolls</p>
                <div className="flex flex-wrap gap-2 min-h-8">
                  {dice.history.length === 0 ? (
                    <span className="text-sm text-slate-500">No rolls yet</span>
                  ) : (
                    dice.history.map((item) => (
                      <span
                        key={item.id}
                        className="inline-flex items-center justify-center w-8 h-8 text-sm font-bold text-white rounded-lg shadow-md bg-linear-to-br from-indigo-500 to-purple-600"
                      >
                        {item.value}
                      </span>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
