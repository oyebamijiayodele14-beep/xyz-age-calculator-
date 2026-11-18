import { Moon, Sun } from 'lucide-react';
import type { ThemeMode } from '../types/age.ts';

interface HeaderProps {
  theme: ThemeMode;
  onToggleTheme: () => void;
}

export function Header({ theme, onToggleTheme }: HeaderProps) {
  const isDark = theme === 'dark';

  return (
    <header className="no-print border-b border-slate-200 bg-white/95 backdrop-blur-sm dark:border-slate-800 dark:bg-[#0F172A]/95">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#0F294A] text-white dark:bg-teal-600"
            aria-hidden="true"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="h-5 w-5"
              stroke="currentColor"
              strokeWidth="1.9"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="4" width="18" height="17" rx="2.5" />
              <path d="M8 2v4M16 2v4M3 9.5h18" />
              <circle cx="12" cy="15" r="3.25" />
              <path d="M12 13.5v1.5l1 1" />
            </svg>
          </div>
          <span className="truncate font-display text-lg font-bold tracking-tight text-[#0F294A] dark:text-slate-100 sm:text-xl">
            xyz calculator
          </span>
        </div>

        <button
          type="button"
          onClick={onToggleTheme}
          aria-pressed={isDark}
          aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
          className="inline-flex min-h-[40px] shrink-0 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm font-medium text-slate-700 transition-colors duration-150 hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 dark:hover:text-white dark:focus-visible:outline-teal-400 whitespace-nowrap cursor-pointer"
        >
          {isDark ? (
            <>
              <Sun className="h-4 w-4 text-amber-400" aria-hidden="true" />
              <span>Light Mode</span>
            </>
          ) : (
            <>
              <Moon className="h-4 w-4 text-[#0F294A]" aria-hidden="true" />
              <span>Dark Mode</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
}
