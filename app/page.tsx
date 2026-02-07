import type { CSSProperties } from "react";
import { games } from "./data/games";

export default function Home() {
  return (
    <main className="relative h-[calc(100dvh-73px)] overflow-hidden">
      <div className="relative flex h-full items-center px-4 py-4">
        <div className="pointer-events-none fixed left-0 top-0 -z-10 h-full w-full overflow-hidden">
          <div className="absolute left-[-10%] top-[-10%] h-[50%] w-[50%] animate-pulse rounded-full bg-blue-600/10 blur-[120px]" />
          <div
            className="absolute bottom-[-10%] right-[-10%] h-[50%] w-[50%] animate-pulse rounded-full bg-violet-600/10 blur-[120px]"
            style={{ animationDelay: "2s" }}
          />
        </div>

        <div className="mx-auto w-full max-w-7xl">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {games.map((game) => (
              <a
                key={game.name}
                href={game.path}
                className="game-card group relative overflow-visible rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:border-white/30"
                style={{ "--glow-color": game.bgGlow } as CSSProperties}
              >
                <div className="absolute inset-0 rounded-2xl bg-[radial-gradient(circle_at_50%_50%,var(--glow-color),transparent_70%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                <div className="game-icon rotate-15 pointer-events-none absolute -right-3 -top-3 z-30 origin-center text-5xl transition-all duration-500 ease-out group-hover:rotate-0 group-hover:scale-110">
                  {game.icon}
                </div>

                <div className="relative z-10 min-h-[120px] p-4 md:min-h-[128px]">
                  <h2
                    className={`bg-linear-to-r mb-2 bg-clip-text text-xl font-bold text-transparent md:text-2xl ${game.color}`}
                  >
                    {game.name}
                  </h2>
                  <p className="text-sm leading-snug text-slate-400 md:text-[15px]">{game.desc}</p>
                </div>

                <div className="absolute bottom-2 right-3 z-20 -translate-x-2 transform opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100">
                  <span className="text-2xl">→</span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
