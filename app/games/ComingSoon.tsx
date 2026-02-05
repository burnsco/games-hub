import Link from "next/link";

interface ComingSoonProps {
  title: string;
  emoji: string;
  description: string;
}

export default function ComingSoon({ title, emoji, description }: ComingSoonProps) {
  return (
    <div className="relative w-full min-h-screen flex items-center justify-center">
      <div className="text-center max-w-2xl">
        <div className="text-7xl mb-6">{emoji}</div>
        <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 mb-4">
          {title}
        </h1>
        <p className="text-slate-400 text-xl mb-10">{description}</p>
        <Link
          href="/"
          className="inline-flex items-center justify-center bg-white/10 hover:bg-white/20 border border-white/20 text-white px-8 py-4 rounded-full text-lg font-semibold transition-all"
        >
          Back to Game Hub
        </Link>
      </div>
    </div>
  );
}
