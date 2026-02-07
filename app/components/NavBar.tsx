"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export default function NavBar() {
  const session = authClient.useSession();
  const router = useRouter();

  const handleSignIn = async () => {
    // For now, we'll just use a dummy sign in or redirect to a login page
    // Since we haven't built a full login form, let's create an anonymous user or ask for email
    // For this demo, let's assume we have a /login page or just use the primitive signIn

    // Simplest: Redirect to a login page we will build
    router.push("/login");
  };

  const handleSignOut = async () => {
    await authClient.signOut();
    router.refresh();
  };

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

        {session.data ? (
          <>
            <Link href="/home" className="hover:text-white transition-colors text-indigo-400">
              My Home
            </Link>
            <div className="flex items-center gap-3 pl-4 border-l border-slate-700">
              <span className="text-slate-200">{session.data.user.name}</span>
              <button
                type="button"
                onClick={handleSignOut}
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded-md transition-colors"
              >
                Logout
              </button>
            </div>
          </>
        ) : (
          <button
            type="button"
            onClick={handleSignIn}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full transition-colors font-bold shadow-lg shadow-indigo-500/20"
          >
            Login
          </button>
        )}
      </div>
    </nav>
  );
}
