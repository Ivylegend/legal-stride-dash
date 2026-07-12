import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type ColorTheme = "default" | "navy" | "charcoal-gold" | "emerald" | "burgundy" | "slate";
export type Mode = "light" | "dark";

export const THEME_OPTIONS: { value: ColorTheme; label: string; swatch: string }[] = [
  { value: "default", label: "Default", swatch: "#3b4a63" },
  { value: "navy", label: "Professional Navy", swatch: "#1e3a8a" },
  { value: "charcoal-gold", label: "Charcoal Gold", swatch: "#b08a3e" },
  { value: "emerald", label: "Emerald", swatch: "#047857" },
  { value: "burgundy", label: "Burgundy", swatch: "#7f1d1d" },
  { value: "slate", label: "Slate", swatch: "#475569" },
];

interface ThemeCtx {
  theme: ColorTheme;
  mode: Mode;
  setTheme: (t: ColorTheme) => void;
  setMode: (m: Mode) => void;
  toggleMode: () => void;
}

const Ctx = createContext<ThemeCtx | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ColorTheme>("default");
  const [mode, setModeState] = useState<Mode>("light");

  useEffect(() => {
    const t = (localStorage.getItem("gt_theme") as ColorTheme | null) || "default";
    const m = (localStorage.getItem("gt_mode") as Mode | null) || "light";
    setThemeState(t);
    setModeState(m);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "default") root.removeAttribute("data-theme");
    else root.setAttribute("data-theme", theme);
    localStorage.setItem("gt_theme", theme);
  }, [theme]);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", mode === "dark");
    localStorage.setItem("gt_mode", mode);
  }, [mode]);

  return (
    <Ctx.Provider
      value={{
        theme,
        mode,
        setTheme: setThemeState,
        setMode: setModeState,
        toggleMode: () => setModeState((m) => (m === "light" ? "dark" : "light")),
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useTheme(): ThemeCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useTheme outside ThemeProvider");
  return ctx;
}