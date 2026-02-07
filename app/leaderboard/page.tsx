import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { matches, user } from "@/db/schema";
// import { unstable_cache } from "next/cache";

export const revalidate = 60; // Revalidate every 60 seconds

async function getLeaderboard() {
  // Using a raw query or specialized join for performance
  // For now, simple Drizzle query
  return await db
    .select({
      id: matches.id,
      score: matches.score,
      gameId: matches.gameId,
      createdAt: matches.createdAt,
      username: user.name,
      avatar: user.image,
    })
    .from(matches)
    .leftJoin(user, eq(matches.userId, user.id))
    .where(eq(matches.gameId, "tetris"))
    .orderBy(desc(matches.score))
    .limit(50);
}

export default async function LeaderboardPage() {
  const scores = await getLeaderboard();

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8 font-sans">
      <h1 className="text-4xl font-bold mb-8 text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
        Global Leaderboard
      </h1>

      <div className="max-w-3xl mx-auto bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-800/50 text-slate-400 uppercase text-xs tracking-wider">
              <th className="p-4 font-semibold">Rank</th>
              <th className="p-4 font-semibold">Player</th>
              <th className="p-4 font-semibold">Score</th>
              <th className="p-4 font-semibold hidden md:table-cell">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {scores.map((match, index) => (
              <tr key={match.id} className="hover:bg-slate-800/30 transition-colors">
                <td className="p-4 font-mono text-slate-500">#{index + 1}</td>
                <td className="p-4 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-xs font-bold ring-2 ring-slate-800">
                    {match.avatar ? (
                      <img
                        src={match.avatar}
                        alt={match.username || "User"}
                        className="w-full h-full rounded-full"
                      />
                    ) : (
                      (match.username?.[0] || "?").toUpperCase()
                    )}
                  </div>
                  <span className="font-semibold text-slate-200">
                    {match.username || "Anonymous"}
                  </span>
                </td>
                <td className="p-4 font-mono text-emerald-400 font-bold">
                  {match.score.toLocaleString()}
                </td>
                <td className="p-4 text-slate-500 text-sm hidden md:table-cell">
                  {new Date(match.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
            {scores.length === 0 && (
              <tr>
                <td colSpan={4} className="p-8 text-center text-slate-500">
                  No scores yet. Be the first!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
