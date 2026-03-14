import React from "react";
import { Button } from "./components/ui/button";
import { Moon, SunMedium } from "lucide-react";
import { useTheme } from "./components/ThemeProvider";

const DarkMode = () => {
  const { theme, setTheme } = useTheme();
  const isDarkMode = theme === "dark";
  const nextTheme = isDarkMode ? "light" : "dark";
  const themeLabel = isDarkMode ? "Dark" : "Light";

  return (
    <Button
      type="button"
      variant="outline"
      onClick={() => setTheme(nextTheme)}
      className="group relative h-11 min-w-11 rounded-full border-slate-200/80 bg-[linear-gradient(135deg,#ffffff_0%,#f8fafc_100%)] pl-11 pr-3 shadow-sm transition-all duration-300 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-[linear-gradient(135deg,#020617_0%,#0f172a_100%)] dark:hover:border-slate-700 dark:hover:bg-slate-950 sm:pr-4"
    >
      <span className="absolute left-1.5 top-1/2 flex -translate-y-1/2 items-center justify-center">
        <span className="relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border border-white/70 bg-[linear-gradient(135deg,#dbeafe_0%,#bfdbfe_100%)] text-blue-700 shadow-[0_10px_24px_-16px_rgba(37,99,235,0.9)] transition-all duration-300 group-hover:scale-105 dark:border-cyan-400/20 dark:bg-[linear-gradient(135deg,#082f49_0%,#0f766e_100%)] dark:text-cyan-200 dark:shadow-[0_10px_24px_-16px_rgba(34,211,238,0.85)]">
          <SunMedium className="h-4.5 w-4.5 scale-100 rotate-0 transition-all duration-300 dark:scale-0 dark:-rotate-90" />
          <Moon className="absolute h-4.5 w-4.5 scale-0 rotate-90 transition-all duration-300 dark:scale-100 dark:rotate-0" />
        </span>
      </span>
      <span className="flex items-center">
        <span className="hidden text-left sm:block">
          <span className="block text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
            Theme
          </span>
          <span className="block text-sm font-semibold text-slate-900 dark:text-slate-100">
            {themeLabel}
          </span>
        </span>
      </span>
      <span className="sr-only">Switch to {nextTheme} mode</span>
    </Button>
  );
};

export default DarkMode;