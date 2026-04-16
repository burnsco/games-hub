import type { CSSProperties } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { games } from "../data/games";
import { SITE_URL } from "../site";

export default function HomePage() {
  return (
    <>
      <Helmet>
        <title>Games Hub — Instant Browser Arcade</title>
        <meta
          name="description"
          content="Pick your challenge and play instantly in your browser. No downloads, just pure gaming."
        />
        <meta property="og:title" content="Games Hub — Instant Browser Arcade" />
        <meta
          property="og:description"
          content="Pick your challenge and play instantly in your browser. No downloads, just pure gaming."
        />
        <meta property="og:url" content={SITE_URL} />
        <meta name="twitter:title" content="Games Hub — Instant Browser Arcade" />
        <meta
          name="twitter:description"
          content="Pick your challenge and play instantly in your browser. No downloads, just pure gaming."
        />
      </Helmet>
      <main className="relative h-[calc(100dvh-73px)] overflow-hidden">
        <h1 className="sr-only">Games Hub — Instant Browser Arcade</h1>
        <div className="relative flex h-full items-center px-3 py-3 md:px-4 md:py-4">
          <div className="pointer-events-none fixed left-0 top-0 -z-10 h-full w-full overflow-hidden">
            <div className="absolute left-[-10%] top-[-10%] h-[50%] w-[50%] animate-pulse rounded-full bg-blue-600/10 blur-[120px]" />
            <div
              className="absolute bottom-[-10%] right-[-10%] h-[50%] w-[50%] animate-pulse rounded-full bg-violet-600/10 blur-[120px]"
              style={{ animationDelay: "2s" }}
            />
          </div>

          <div className="mx-auto h-full w-full max-w-360">
            <div className="grid h-full grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 md:grid-cols-4 md:grid-rows-3 md:auto-rows-fr">
              {games.map((game) => (
                <Link
                  key={game.name}
                  to={game.path}
                  aria-label={`Play ${game.name}`}
                  title={`Play ${game.name}`}
                  className="game-card group relative h-full overflow-visible rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:border-white/30"
                  style={{ "--glow-color": game.bgGlow } as CSSProperties}
                >
                  <div className="absolute inset-0 rounded-2xl bg-[radial-gradient(circle_at_50%_50%,var(--glow-color),transparent_70%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                  <div className="game-icon rotate-15 pointer-events-none absolute -right-3 -top-3 z-30 origin-center text-5xl transition-all duration-500 ease-out group-hover:rotate-0 group-hover:scale-110">
                    {game.icon}
                  </div>

                  <div className="relative z-10 flex h-full min-h-27.5 flex-col justify-end p-3 md:min-h-32 md:p-4">
                    <h2
                      className={`bg-linear-to-r mb-2 bg-clip-text text-xl font-bold text-transparent md:text-2xl ${game.color}`}
                    >
                      {game.name}
                    </h2>
                    <p className="text-sm leading-snug text-slate-400 md:text-[15px]">
                      {game.desc}
                    </p>
                  </div>

                  <div className="absolute bottom-2 right-3 z-20 -translate-x-2 transform opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100">
                    <span className="text-2xl">→</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
