import Link from "next/link";
import type { CSSProperties } from "react";
import ThemePicker from "./components/ThemePicker";
import { games, navGames } from "./data/games";

export default function Home() {
  return (
    <div className="flex h-screen">
      <aside className="glass z-20 flex h-full w-64 flex-col border-r border-white/5 transition-transform">
        <div className="border-b border-white/5">
          <Link href="/" className="group flex items-center gap-3">
            <div className="bg-linear-to-br flex h-10 w-10 items-center justify-center rounded-xl from-blue-500 to-violet-500 text-xl shadow-lg shadow-blue-500/20 transition-transform group-hover:scale-110">
              🎮
            </div>
            <h1 className="text-gradient flex-1 text-xl font-bold">Game Hub</h1>
          </Link>

          <div className="flex items-center justify-between rounded-xl border border-white/5 bg-white/5">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Theme
            </span>
            <div className="origin-right scale-90">
              <ThemePicker />
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto">
          <div className="text-muted text-xs font-semibold uppercase tracking-wider">Games</div>
          {navGames.map((game) => (
            <a
              key={game.name}
              href={game.path}
              className="text-muted hover:text-main group flex items-center gap-3 rounded-xl transition-all hover:bg-white/5"
            >
              <span className="text-xl transition-transform group-hover:scale-110">
                {game.icon}
              </span>
              <span className="font-medium">{game.name}</span>
            </a>
          ))}
        </nav>

        <div className="border-t border-white/5">
          <div className="glass text-muted rounded-xl text-center text-xs">
            v2.0.0 • PRO Edition
          </div>
        </div>
      </aside>

      <main className="relative flex-1 overflow-y-auto scroll-smooth">
        <div className="relative min-h-screen">
          <div className="pointer-events-none fixed left-0 top-0 -z-10 h-full w-full overflow-hidden">
            <div className="absolute left-[-10%] top-[-10%] h-[50%] w-[50%] animate-pulse rounded-full bg-blue-600/10 blur-[120px]" />
            <div
              className="absolute bottom-[-10%] right-[-10%] h-[50%] w-[50%] animate-pulse rounded-full bg-violet-600/10 blur-[120px]"
              style={{ animationDelay: "2s" }}
            />
          </div>

          <div className="mx-auto max-w-5xl">
            <div className="text-center">
              <h1 className="bg-linear-to-r mb-4 from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-6xl font-black text-transparent">
                🎮 Game Hub
              </h1>
              <p className="text-xl text-slate-400">Pick your challenge!</p>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              {games.map((game) => (
                <a
                  key={game.name}
                  href={game.path}
                  className="game-card group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:border-white/30"
                  style={{ "--glow-color": game.bgGlow } as CSSProperties}
                >
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,var(--glow-color),transparent_70%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                  <div className="game-icon rotate-15 absolute -right-2 -top-2 origin-center text-6xl transition-all duration-500 ease-out group-hover:rotate-0 group-hover:scale-110">
                    {game.icon}
                  </div>

                  <div className="relative z-10">
                    <h2
                      className={`bg-linear-to-r bg-clip-text text-3xl font-bold text-transparent ${game.color} mb-3`}
                    >
                      {game.name}
                    </h2>
                    <p className="text-lg text-slate-400">{game.desc}</p>
                  </div>

                  <div className="absolute bottom-4 right-4 -translate-x-2 transform opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100">
                    <span className="text-3xl">→</span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
