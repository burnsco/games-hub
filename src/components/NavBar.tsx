import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { games } from "../data/games";
import ThemePicker from "./ThemePicker";
import { MUTE_KEY } from "../hooks/useSoundFX";

export default function NavBar() {
  const { pathname } = useLocation();
  const isGameRoute = pathname.startsWith("/games/");
  const [muted, setMuted] = useState(() => localStorage.getItem(MUTE_KEY) === "true");

  if (isGameRoute) return null;

  const activeGame = games.find((game) => game.path === pathname);
  const centerTitle = activeGame
    ? `${activeGame.icon} ${activeGame.name}`
    : pathname === "/leaderboard"
      ? "🏆 Leaderboard"
      : pathname === "/"
        ? "🎮 Games"
        : "";

  const toggleMute = () => {
    const next = !muted;
    setMuted(next);
    localStorage.setItem(MUTE_KEY, String(next));
  };

  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between border-b border-slate-800 bg-slate-900/50 p-4 backdrop-blur-sm">
      <Link
        to="/"
        className="z-10 flex items-center gap-2 text-xl font-black tracking-tight text-white"
      >
        <span className="text-2xl">🕹️</span> GAMES HUB
      </Link>

      {centerTitle && (
        <div className="pointer-events-none absolute inset-x-0 flex justify-center">
          <div className="max-w-[48vw] truncate px-4 text-center text-sm font-bold tracking-wide text-slate-100 sm:text-base">
            {centerTitle}
          </div>
        </div>
      )}

      <div className="z-10 flex items-center gap-4">
        <Link
          to="/leaderboard"
          className="text-sm font-medium text-slate-400 transition-colors hover:text-white"
        >
          Leaderboard
        </Link>
        <button
          type="button"
          onClick={toggleMute}
          title={muted ? "Unmute sounds" : "Mute sounds"}
          className="text-xl text-slate-400 transition-colors hover:text-white"
        >
          {muted ? "🔇" : "🔊"}
        </button>
        <ThemePicker />
      </div>
    </nav>
  );
}
