"use client";

import { useEffect, useMemo, useState } from "react";
import { useSoundFX } from "../../hooks/useSoundFX";

const MAX_WRONG = 6;
const STORAGE_KEY = "hangmanBestStreak";

const WORD_BANK = [
  "javascript",
  "react",
  "typescript",
  "component",
  "function",
  "variable",
  "browser",
  "network",
  "algorithm",
  "debugging",
  "repository",
  "keyboard",
  "interface",
  "database",
  "compiler",
  "framework",
  "terminal",
  "iteration",
  "functionality",
  "deployment",
];

const LETTERS = "abcdefghijklmnopqrstuvwxyz".split("");

const randomWord = () => WORD_BANK[Math.floor(Math.random() * WORD_BANK.length)];

export default function HangmanGame() {
  const { playSelect, playScore, playError, playGameOver } = useSoundFX();
  const [secretWord, setSecretWord] = useState("");
  const [guessedLetters, setGuessedLetters] = useState<string[]>([]);
  const [wrongLetters, setWrongLetters] = useState<string[]>([]);
  const [status, setStatus] = useState<"idle" | "playing" | "won" | "lost">("idle");
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return;
    const parsed = parseInt(saved, 10);
    if (!Number.isNaN(parsed)) setBestStreak(parsed);
  }, []);

  const wrongCount = wrongLetters.length;
  const remaining = MAX_WRONG - wrongCount;

  const maskedWord = useMemo(() => {
    if (!secretWord) return "";
    return secretWord
      .split("")
      .map((char) => (guessedLetters.includes(char) ? char.toUpperCase() : "_"))
      .join(" ");
  }, [secretWord, guessedLetters]);

  const startRound = () => {
    setSecretWord(randomWord());
    setGuessedLetters([]);
    setWrongLetters([]);
    setStatus("playing");
    playSelect();
  };

  const handleGuess = (rawLetter: string) => {
    if (status !== "playing") return;
    const letter = rawLetter.toLowerCase();
    if (!/^[a-z]$/.test(letter)) return;
    if (guessedLetters.includes(letter) || wrongLetters.includes(letter)) return;

    if (secretWord.includes(letter)) {
      const nextGuessed = [...guessedLetters, letter];
      setGuessedLetters(nextGuessed);
      playScore();

      const allFound = secretWord.split("").every((char) => nextGuessed.includes(char));
      if (allFound) {
        setStatus("won");
        setStreak((prev) => {
          const next = prev + 1;
          if (next > bestStreak) {
            setBestStreak(next);
            localStorage.setItem(STORAGE_KEY, String(next));
          }
          return next;
        });
      }
      return;
    }

    const nextWrong = [...wrongLetters, letter];
    setWrongLetters(nextWrong);
    playError();

    if (nextWrong.length >= MAX_WRONG) {
      setStatus("lost");
      setStreak(0);
      playGameOver();
    }
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Enter" && status !== "playing") {
        startRound();
        return;
      }
      handleGuess(event.key);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  const bodyPartsVisible = [
    wrongCount > 0,
    wrongCount > 1,
    wrongCount > 2,
    wrongCount > 3,
    wrongCount > 4,
    wrongCount > 5,
  ];

  return (
    <div className="relative flex h-[100dvh] w-full items-center justify-center overflow-hidden bg-linear-to-b from-slate-950 via-slate-900 to-slate-950 px-3 py-3 md:px-6">
      <div className="pointer-events-none absolute left-[-10%] top-[-10%] h-[40%] w-[40%] rounded-full bg-amber-500/10 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-[-10%] right-[-10%] h-[40%] w-[40%] rounded-full bg-cyan-500/10 blur-[120px]" />

      <div className="relative z-10 grid w-full max-w-6xl grid-cols-1 gap-4 lg:grid-cols-[300px_1fr]">
        <aside className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
          <div className="mb-4 grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-white/10 bg-black/20 p-3 text-center">
              <div className="text-2xl font-black text-white">{streak}</div>
              <div className="text-xs uppercase tracking-wider text-slate-400">Streak</div>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/20 p-3 text-center">
              <div className="text-2xl font-black text-cyan-300">{bestStreak}</div>
              <div className="text-xs uppercase tracking-wider text-slate-400">Best</div>
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-black/20 p-3 text-center">
            <div className="text-3xl font-black text-amber-300">{remaining}</div>
            <div className="text-xs uppercase tracking-wider text-slate-400">Mistakes Left</div>
          </div>

          <div className="mt-4 rounded-xl border border-white/10 bg-black/20 p-3 text-sm text-slate-300">
            <div className="mb-2 text-xs uppercase tracking-wider text-slate-400">
              Wrong Letters
            </div>
            <div className="min-h-6 font-mono uppercase">{wrongLetters.join(" ") || "-"}</div>
          </div>
        </aside>

        <section className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm md:p-6">
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-[280px_1fr]">
            <div className="rounded-xl border border-white/10 bg-black/20 p-4">
              <svg viewBox="0 0 220 260" className="mx-auto h-56 w-full max-w-[220px]">
                <title>Hangman drawing</title>
                <line x1="20" y1="240" x2="140" y2="240" stroke="#94a3b8" strokeWidth="6" />
                <line x1="50" y1="240" x2="50" y2="24" stroke="#94a3b8" strokeWidth="6" />
                <line x1="50" y1="24" x2="150" y2="24" stroke="#94a3b8" strokeWidth="6" />
                <line x1="150" y1="24" x2="150" y2="50" stroke="#94a3b8" strokeWidth="6" />

                {bodyPartsVisible[0] && (
                  <circle cx="150" cy="72" r="22" stroke="#f8fafc" fill="none" strokeWidth="5" />
                )}
                {bodyPartsVisible[1] && (
                  <line x1="150" y1="94" x2="150" y2="158" stroke="#f8fafc" strokeWidth="5" />
                )}
                {bodyPartsVisible[2] && (
                  <line x1="150" y1="112" x2="122" y2="132" stroke="#f8fafc" strokeWidth="5" />
                )}
                {bodyPartsVisible[3] && (
                  <line x1="150" y1="112" x2="178" y2="132" stroke="#f8fafc" strokeWidth="5" />
                )}
                {bodyPartsVisible[4] && (
                  <line x1="150" y1="158" x2="124" y2="194" stroke="#f8fafc" strokeWidth="5" />
                )}
                {bodyPartsVisible[5] && (
                  <line x1="150" y1="158" x2="176" y2="194" stroke="#f8fafc" strokeWidth="5" />
                )}
              </svg>
            </div>

            <div>
              <div className="mb-5 rounded-xl border border-white/10 bg-black/20 px-4 py-6 text-center">
                <div className="break-all font-mono text-3xl font-black tracking-[0.35em] text-white md:text-4xl">
                  {maskedWord || "_ _ _ _ _"}
                </div>
              </div>

              <div className="grid grid-cols-7 gap-2 sm:grid-cols-9 md:grid-cols-13">
                {LETTERS.map((letter) => {
                  const used = guessedLetters.includes(letter) || wrongLetters.includes(letter);
                  const correct = guessedLetters.includes(letter);
                  return (
                    <button
                      type="button"
                      key={letter}
                      onClick={() => handleGuess(letter)}
                      disabled={status !== "playing" || used}
                      className={`rounded-lg border px-2 py-2 text-sm font-bold uppercase transition ${
                        correct
                          ? "border-emerald-400/50 bg-emerald-500/20 text-emerald-200"
                          : used
                            ? "border-red-400/40 bg-red-500/15 text-red-200"
                            : "border-white/15 bg-white/5 text-slate-200 hover:bg-white/10"
                      } disabled:cursor-not-allowed`}
                    >
                      {letter}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      </div>

      {status !== "playing" && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-slate-950/75 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
            <h2 className="mb-3 text-4xl font-black text-white">
              {status === "idle" ? "🔤 Hangman" : status === "won" ? "You Won!" : "You Lost"}
            </h2>
            <p className="mb-6 text-slate-300">
              {status === "lost"
                ? `The word was ${secretWord.toUpperCase()}.`
                : "Guess letters before the drawing is complete."}
            </p>
            <button
              type="button"
              onClick={startRound}
              className="rounded-full bg-linear-to-r from-amber-400 to-orange-500 px-8 py-3 text-xl font-bold text-white shadow-lg transition-all hover:scale-105 active:scale-95"
            >
              {status === "idle" ? "Start Game" : "Next Round"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
