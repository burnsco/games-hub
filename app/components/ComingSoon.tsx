import Link from "next/link";

interface ComingSoonProps {
  title: string;
  emoji: string;
  description: string;
}

export default function ComingSoon({ title, emoji, description }: ComingSoonProps) {
  return (
    <div className="relative flex min-h-screen w-full items-center justify-center">
      <div className="max-w-2xl text-center">
        <div className="mb-6 text-7xl">{emoji}</div>
        <h1 className="mb-4 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-5xl font-black text-transparent">
          {title}
        </h1>
        <p className="mb-10 text-xl text-slate-400">{description}</p>
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/10 px-8 py-4 text-lg font-semibold text-white transition-all hover:bg-white/20"
        >
          Back to Game Hub
        </Link>
      </div>
    </div>
  );
}
