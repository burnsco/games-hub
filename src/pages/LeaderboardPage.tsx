import { Helmet } from "react-helmet-async";

export default function LeaderboardPage() {
  return (
    <>
      <Helmet>
        <title>Leaderboard | Games Hub</title>
        <meta
          name="description"
          content="Global leaderboard for Games Hub — compete across instant browser games."
        />
        <meta property="og:title" content="Leaderboard | Games Hub" />
      </Helmet>
      <div className="min-h-screen bg-slate-950 p-8 font-sans text-white">
        <h1 className="mb-8 bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-center text-4xl font-bold text-transparent">
          Global Leaderboard
        </h1>

        <div className="mx-auto max-w-3xl overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl">
          <div className="p-12 text-center">
            <div className="mb-4 text-6xl">🏆</div>
            <p className="text-lg text-slate-400">Leaderboard coming soon!</p>
            <p className="mt-2 text-sm text-slate-500">Play games and compete with friends</p>
          </div>
        </div>
      </div>
    </>
  );
}
