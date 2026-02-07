import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { inventory, items, user } from "@/db/schema";
import { auth } from "@/lib/auth";

export default async function HomePage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/"); // Or show login
  }

  const userData = await db.query.user.findFirst({
    where: eq(user.id, session.user.id),
  });

  const userInventory = await db
    .select({
      id: inventory.id,
      name: items.name,
      type: items.type,
      rarity: items.rarity,
      assetUrl: items.assetUrl,
      isEquipped: inventory.isEquipped,
    })
    .from(inventory)
    .leftJoin(items, eq(inventory.itemId, items.id))
    .where(eq(inventory.userId, session.user.id));

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8 font-sans">
      <header className="flex justify-between items-center mb-12 max-w-5xl mx-auto">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400">
            Welcome Home, {session.user.name}
          </h1>
          <div className="flex gap-4 mt-2 text-slate-400 text-sm font-mono">
            <span>LVL {Math.floor((userData?.experience || 0) / 1000) + 1}</span>
            <span>XP {userData?.experience || 0}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-slate-900 px-4 py-2 rounded-full border border-slate-800">
          <span className="text-xl">🪙</span>
          <span className="font-bold text-amber-400 font-mono">{userData?.currency || 0}</span>
        </div>
      </header>

      <main className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Avatar / Status */}
        <div className="lg:col-span-1 bg-slate-900 rounded-2xl border border-slate-800 p-6 flex flex-col items-center">
          <div className="w-32 h-32 rounded-full bg-slate-800 mb-4 ring-4 ring-slate-700/50 relative overflow-hidden">
            {/* Avatar Placeholder */}
            {userData?.image ? (
              <img src={userData.image} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <div className="flex items-center justify-center w-full h-full text-4xl">👽</div>
            )}
          </div>
          <h2 className="text-xl font-bold mb-1">{userData?.name}</h2>
          <p className="text-slate-500 text-sm mb-6">Gamer for Life</p>

          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full w-[45%]"></div>
          </div>
          <div className="w-full flex justify-between text-xs text-slate-500 mt-1 mb-8">
            <span>Next Level</span>
            <span>45%</span>
          </div>

          <button
            type="button"
            className="w-full py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm font-medium transition-colors"
          >
            Edit Profile
          </button>
        </div>

        {/* Right: Room / Inventory */}
        <div className="lg:col-span-2 space-y-8">
          {/* The "Room" Visualizer Placeholder */}
          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 h-64 flex items-center justify-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
            <p className="text-slate-500 font-mono z-10 group-hover:text-slate-300 transition-colors">
              [ Your Room Visualizer Here ]
            </p>
          </div>

          {/* Inventory Grid */}
          <div>
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <span>🎒</span> Inventory
            </h3>
            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-3">
              {userInventory.map((item) => (
                <div
                  key={item.id}
                  className="aspect-square bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-center relative hover:border-slate-600 transition-colors cursor-pointer group tooltip"
                >
                  <span className="text-2xl">{item.assetUrl || "📦"}</span>
                  {item.isEquipped && (
                    <div className="absolute top-1 right-1 w-2 h-2 bg-green-500 rounded-full"></div>
                  )}
                </div>
              ))}
              {/* Empty Slots */}
              {Array.from({ length: Math.max(0, 12 - userInventory.length) }).map((_, i) => (
                <div
                  // biome-ignore lint/suspicious/noArrayIndexKey: Empty slots are static placeholders
                  key={`empty-${i}`}
                  className="aspect-square bg-slate-900/50 border border-slate-800/50 rounded-xl border-dashed"
                ></div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
