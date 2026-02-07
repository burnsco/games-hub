"use client";

import Link from "next/link";

export default function NavBar() {
  return (
    <nav className="flex items-center justify-between p-4 bg-slate-900/50 backdrop-blur-sm border-b border-slate-800 sticky top-0 z-50">
      <Link
        href="/"
        className="text-xl font-black tracking-tight text-white flex items-center gap-2"
      >
        <span className="text-2xl">🕹️</span> GAMES HUB
      </Link>

      <div className="flex items-center gap-6 text-sm font-medium text-slate-400">
        <Link href="/games" className="hover:text-white transition-colors">
          Games
        </Link>
        <Link href="/leaderboard" className="hover:text-white transition-colors">
          Leaderboard
        </Link>
      </div>
    </nav>
  );
}
