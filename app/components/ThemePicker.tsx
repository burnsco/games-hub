"use client";

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
        className="flex items-center gap-2 rounded-xl glass hover:glass-hover transition-all justify-center"
        aria-label="Change theme"
      >
        <span className="text-xl">🎨</span>
      </button>

      <div
        ref={dropdownRef}
        className={`absolute top-full right-0 mt-2 w-48 p-2 rounded-xl bg-slate-950 border border-white/10 shadow-2xl transition-all duration-300 transform origin-top-right z-50 ${
          open
            ? "opacity-100 visible scale-100"
            : "opacity-0 invisible scale-95"
        }`}
      >
        <div className="space-y-1">
          {themes.map((theme) => (
            <button
              key={theme.id}
              type="button"
              className="theme-option w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/10 transition-colors text-sm font-medium text-left"
              onClick={() => handleThemeSelect(theme.id)}
            >
              <span
                className="w-4 h-4 rounded-full shadow-sm border border-white/20"
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
