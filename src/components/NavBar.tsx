import { Link, useLocation } from "react-router-dom";
import { games } from "../data/games";
import ThemePicker from "./ThemePicker";

export default function NavBar() {
  const { pathname } = useLocation();
  const isGameRoute = pathname.startsWith("/games/");
  if (isGameRoute) return null;

  const activeGame = games.find((game) => game.path === pathname);
  const centerTitle = activeGame
    ? `${activeGame.icon} ${activeGame.name}`
    : pathname === "/leaderboard"
      ? "🏆 Leaderboard"
      : pathname === "/"
        ? "🎮 Games"
        : "";

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
        <ThemePicker />
      </div>
    </nav>
  );
}
