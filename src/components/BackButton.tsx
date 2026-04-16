import { Link } from "react-router-dom";

export default function BackButton() {
  return (
    <Link
      to="/"
      className="group fixed left-4 top-4 z-50 flex items-center gap-2 rounded-full border border-white/20 bg-black/40 px-4 py-2 backdrop-blur-md transition-all hover:border-white/40 hover:bg-black/60"
    >
      <span className="text-xl transition-transform group-hover:-translate-x-1">←</span>
      <span className="font-semibold text-white">Back to Games</span>
    </Link>
  );
}
