"use client";

import Link from "next/link";
import ThemePicker from "./ThemePicker";

export default function NavBar() {
  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between border-b border-slate-800 bg-slate-900/50 p-4 backdrop-blur-sm">
      <Link
        href="/"
        className="flex items-center gap-2 text-xl font-black tracking-tight text-white"
      >
        <span className="text-2xl">🕹️</span> GAMES HUB
      </Link>

      <div className="flex items-center gap-4">
        <Link
          href="/leaderboard"
          className="text-sm font-medium text-slate-400 transition-colors hover:text-white"
        >
          Leaderboard
        </Link>
        <ThemePicker />
      </div>
    </nav>
  );
}
