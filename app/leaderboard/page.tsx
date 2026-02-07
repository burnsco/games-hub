export default function LeaderboardPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white p-8 font-sans">
      <h1 className="text-4xl font-bold mb-8 text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
        Global Leaderboard
      </h1>

      <div className="max-w-3xl mx-auto bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="p-12 text-center">
          <div className="text-6xl mb-4">🏆</div>
          <p className="text-slate-400 text-lg">Leaderboard coming soon!</p>
          <p className="text-slate-500 text-sm mt-2">Play games and compete with friends</p>
        </div>
      </div>
    </div>
  );
}
