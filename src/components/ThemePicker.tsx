import { useEffect, useRef, useState } from "react";

const themes = [
  { id: "neon", name: "Neon Cyber", color: "#00FFA3" },
  { id: "sunset", name: "Sunset Lux", color: "#FF9A8B" },
  { id: "oceanic", name: "Oceanic", color: "#2193B0" },
  { id: "purple", name: "Royale", color: "#8E2DE2" },
  { id: "forest", name: "Forest", color: "#22c55e" },
  { id: "berry", name: "Berry", color: "#db2777" },
  { id: "midnight", name: "Midnight", color: "#6366f1" },
  { id: "solar", name: "Solar", color: "#f59e0b" },
  { id: "arctic", name: "Arctic", color: "#0ea5e9" },
  { id: "minimal", name: "Frosted", color: "#FFFFFF" },
];

export default function ThemePicker() {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "neon";
    document.documentElement.setAttribute("data-theme", savedTheme);
  }, []);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const target = event.target as Node;

      if (buttonRef.current?.contains(target)) {
        setOpen((prev) => !prev);
        return;
      }

      if (dropdownRef.current?.contains(target)) {
        return;
      }

      setOpen(false);
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  const handleThemeSelect = (themeId: string) => {
    document.documentElement.setAttribute("data-theme", themeId);
    localStorage.setItem("theme", themeId);
    setOpen(false);
  };

  return (
    <div className="relative z-50">
      <button
        ref={buttonRef}
        type="button"
        className="glass hover:glass-hover flex items-center justify-center gap-2 rounded-xl transition-all"
        aria-label="Change theme"
      >
        <span className="text-xl">🎨</span>
      </button>

      <div
        ref={dropdownRef}
        className={`absolute right-0 top-full z-50 mt-2 w-48 origin-top-right transform rounded-xl border border-white/10 bg-slate-950 p-2 shadow-2xl transition-all duration-300 ${
          open ? "visible scale-100 opacity-100" : "invisible scale-95 opacity-0"
        }`}
      >
        <div className="space-y-1">
          {themes.map((theme) => (
            <button
              key={theme.id}
              type="button"
              className="theme-option flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors hover:bg-white/10"
              onClick={() => handleThemeSelect(theme.id)}
            >
              <span
                className="h-4 w-4 rounded-full border border-white/20 shadow-sm"
                style={{ background: theme.color }}
              />
              <span className="text-slate-200">{theme.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
