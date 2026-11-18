import { useEffect, useRef, useState, type FormEvent } from 'react';
import { CalculatorForm } from './components/CalculatorForm.tsx';
import { DetailedStatistics } from './components/DetailedStatistics.tsx';
import { EmptyResultsState } from './components/EmptyResultsState.tsx';
import { Header } from './components/Header.tsx';
import { NextBirthdayCard } from './components/NextBirthdayCard.tsx';
import { PrimaryAgeResult } from './components/PrimaryAgeResult.tsx';
import type {
  AgeCalculationResult,
  LeapPolicy,
  ThemeMode,
  ValidationErrors,
} from './types/age.ts';
import {
  computeAgeCalculation,
  formatIsoDate,
  getTodayCalendarDate,
} from './utils/ageCalculator.ts';

function getInitialTheme(): ThemeMode {
  if (typeof document !== 'undefined' && document.documentElement.classList.contains('dark')) {
    return 'dark';
  }
  return 'light';
}

export default function App() {
  const [theme, setTheme] = useState<ThemeMode>(getInitialTheme);
  const [todayIso, setTodayIso] = useState<string>(() => formatIsoDate(getTodayCalendarDate()));
  const [birthDateStr, setBirthDateStr] = useState<string>('');
  const [referenceDateStr, setReferenceDateStr] = useState<string>(() =>
    formatIsoDate(getTodayCalendarDate())
  );
  const [birthBadInput, setBirthBadInput] = useState<boolean>(false);
  const [referenceBadInput, setReferenceBadInput] = useState<boolean>(false);
  const [leapPolicy, setLeapPolicy] = useState<LeapPolicy>('feb28');
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [result, setResult] = useState<AgeCalculationResult | null>(null);

  const resultsRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    try {
      localStorage.setItem('age-calculator-theme', theme);
    } catch {
      // Ignore storage errors in restricted environments
    }
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleBirthDateChange = (value: string, badInput: boolean) => {
    setBirthDateStr(value);
    setBirthBadInput(badInput);
    setResult(null);
    setErrors((prev) => ({ ...prev, birthDate: undefined }));
  };

  const handleReferenceDateChange = (value: string, badInput: boolean) => {
    setReferenceDateStr(value);
    setReferenceBadInput(badInput);
    setResult(null);
    setErrors((prev) => ({ ...prev, referenceDate: undefined }));
  };

  const handleSetReferenceToday = () => {
    const freshToday = formatIsoDate(getTodayCalendarDate());
    setTodayIso(freshToday);
    setReferenceDateStr(freshToday);
    setReferenceBadInput(false);
    setResult(null);
    setErrors((prev) => ({ ...prev, referenceDate: undefined }));
  };

  const handleLeapPolicyChange = (nextPolicy: LeapPolicy) => {
    setLeapPolicy(nextPolicy);
    if (result) {
      const freshToday = getTodayCalendarDate();
      setTodayIso(formatIsoDate(freshToday));
      const { validation, result: updated } = computeAgeCalculation({
        birthDateStr,
        referenceDateStr,
        birthBadInput,
        referenceBadInput,
        leapPolicy: nextPolicy,
        today: freshToday,
      });
      if (validation.isValid && updated) {
        setResult(updated);
      } else {
        setErrors(validation.errors);
        setResult(null);
      }
    }
  };

  const handleCalculate = (e: FormEvent) => {
    e.preventDefault();
    const freshToday = getTodayCalendarDate();
    setTodayIso(formatIsoDate(freshToday));

    const { validation, result: computed } = computeAgeCalculation({
      birthDateStr,
      referenceDateStr,
      birthBadInput,
      referenceBadInput,
      leapPolicy,
      today: freshToday,
    });

    if (!validation.isValid || !computed) {
      setErrors(validation.errors);
      setResult(null);

      if (validation.errors.birthDate) {
        document.getElementById('birth-date-input')?.focus();
      } else if (validation.errors.referenceDate) {
        document.getElementById('reference-date-input')?.focus();
      }
      return;
    }

    setErrors({});
    setResult(computed);

    // Bring results into view smoothly on smaller screens without disorienting desktop users
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      const prefersReducedMotion =
        window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
      window.requestAnimationFrame(() => {
        resultsRef.current?.scrollIntoView({
          behavior: prefersReducedMotion ? 'auto' : 'smooth',
          block: 'start',
        });
      });
    }
  };

  const handleReset = () => {
    const freshToday = formatIsoDate(getTodayCalendarDate());
    setTodayIso(freshToday);
    setBirthDateStr('');
    setReferenceDateStr(freshToday);
    setBirthBadInput(false);
    setReferenceBadInput(false);
    setErrors({});
    setResult(null);
    document.getElementById('birth-date-input')?.focus();
  };

  return (
    <div className="floral-canvas min-h-screen flex flex-col text-slate-900 dark:text-slate-100">
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-white/55 via-white/35 to-white/55 dark:from-[#0B1120]/65 dark:via-[#0B1120]/45 dark:to-[#0B1120]/65">
        <Header theme={theme} onToggleTheme={handleToggleTheme} />

        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        {/* Intro Title & Subtitle */}
        <div className="mb-6 sm:mb-8">
          <div className="hidden print-only mb-2 text-xs font-medium text-slate-500">
            xyz calculator Report
          </div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-[#0F294A] text-balance sm:text-3xl dark:text-white">
            xyz calculator
          </h1>
          <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base dark:text-slate-400">
            Calculate your exact age in years, months and days.
          </p>
        </div>

        {/* Main Workspace */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-start lg:gap-8">
          <div className="lg:col-span-5">
            <CalculatorForm
              birthDateStr={birthDateStr}
              referenceDateStr={referenceDateStr}
              todayIso={todayIso}
              leapPolicy={leapPolicy}
              errors={errors}
              onBirthDateChange={handleBirthDateChange}
              onReferenceDateChange={handleReferenceDateChange}
              onSetReferenceToday={handleSetReferenceToday}
              onLeapPolicyChange={handleLeapPolicyChange}
              onCalculate={handleCalculate}
              onReset={handleReset}
            />
          </div>

          <div ref={resultsRef} className="space-y-6 lg:col-span-7 scroll-mt-6">
            {result ? (
              <>
                <PrimaryAgeResult result={result} />
                <NextBirthdayCard nextBirthday={result.nextBirthday} />
                <DetailedStatistics statistics={result.statistics} />
              </>
            ) : (
              <EmptyResultsState />
            )}
          </div>
        </div>
      </main>

      <footer className="no-print border-t border-slate-200/80 bg-white/80 backdrop-blur-sm dark:border-slate-800/80 dark:bg-[#0F172A]/85">
        <div className="mx-auto flex max-w-5xl flex-col gap-1 px-4 py-4 text-xs text-slate-600 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8 dark:text-slate-400">
          <span>Gregorian calendar arithmetic · Runs offline after load</span>
          <span>No cookies, no analytics, no birth dates stored</span>
        </div>
      </footer>
      </div>
    </div>
  );
}
