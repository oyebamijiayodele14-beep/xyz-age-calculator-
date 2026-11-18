import { CalendarDays } from 'lucide-react';

export function EmptyResultsState() {
  return (
    <section
      aria-labelledby="empty-state-heading"
      className="flex flex-col items-start justify-center rounded-xl border border-dashed border-slate-300 bg-white/92 p-6 backdrop-blur-sm sm:p-8 dark:border-slate-700 dark:bg-[#111A2E]/92"
    >
      <div
        className="flex h-11 w-11 items-center justify-center rounded-lg bg-slate-100 text-[#0F294A] dark:bg-slate-800 dark:text-teal-400"
        aria-hidden="true"
      >
        <CalendarDays className="h-5 w-5" />
      </div>

      <h2
        id="empty-state-heading"
        className="mt-4 font-display text-lg font-semibold text-[#0F294A] dark:text-slate-100"
      >
        Ready to calculate your exact age
      </h2>
      <p className="mt-1.5 max-w-md text-sm leading-relaxed text-slate-600 dark:text-slate-400">
        Enter your date of birth and select <span className="font-semibold">Calculate Age</span> to
        view your calendar-accurate breakdown.
      </p>

      <ul className="mt-5 space-y-2 border-t border-slate-200 pt-4 text-xs text-slate-600 dark:border-slate-800 dark:text-slate-400 w-full">
        <li>Exact completed years, months, and remaining days</li>
        <li>Next birthday date, weekday, and remaining day countdown</li>
        <li>Detailed calendar statistics across weeks, days, and estimated hours</li>
      </ul>
    </section>
  );
}
