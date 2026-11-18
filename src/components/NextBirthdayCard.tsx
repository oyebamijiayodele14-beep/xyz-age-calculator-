import { Cake, CalendarClock } from 'lucide-react';
import type { NextBirthdayInfo } from '../types/age.ts';
import { pluralizeUnit } from '../utils/ageCalculator.ts';

interface NextBirthdayCardProps {
  nextBirthday: NextBirthdayInfo;
}

export function NextBirthdayCard({ nextBirthday }: NextBirthdayCardProps) {
  const {
    isBirthdayToday,
    isBirthDateToday,
    turningAgeToday,
    nextBirthdayFormatted,
    nextBirthdayDayOfWeek,
    daysRemaining,
    turningAgeNext,
  } = nextBirthday;

  return (
    <section
      aria-labelledby="next-birthday-heading"
      className="print-break-inside-avoid rounded-xl border border-slate-200 bg-white p-5 sm:p-6 dark:border-slate-800 dark:bg-[#111A2E]"
    >
      <div className="flex items-center justify-between gap-3">
        <h2
          id="next-birthday-heading"
          className="font-display text-base font-semibold text-[#0F294A] dark:text-slate-100"
        >
          Next Birthday
        </h2>
        <CalendarClock
          className="h-4 w-4 shrink-0 text-teal-700 dark:text-teal-400"
          aria-hidden="true"
        />
      </div>

      {isBirthdayToday && (
        <div
          role="status"
          className="mt-4 flex items-center gap-3 rounded-lg border border-teal-200 bg-teal-50/80 px-4 py-3 text-teal-900 dark:border-teal-800/80 dark:bg-teal-950/40 dark:text-teal-200"
        >
          <Cake className="h-5 w-5 shrink-0 text-teal-700 dark:text-teal-400" aria-hidden="true" />
          <div>
            <p className="text-sm font-semibold">Today is your birthday!</p>
            {turningAgeToday !== null && (
              <p className="text-xs text-teal-800 dark:text-teal-300">
                Celebrating {pluralizeUnit(turningAgeToday, 'year', 'years')} on this reference date.
                Next birthday details shown below.
              </p>
            )}
          </div>
        </div>
      )}

      {isBirthDateToday && (
        <div
          role="status"
          className="mt-4 flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-200"
        >
          <Cake className="h-5 w-5 shrink-0 text-teal-700 dark:text-teal-400" aria-hidden="true" />
          <div>
            <p className="text-sm font-semibold">Selected reference date is the date of birth.</p>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Showing countdown to the 1st birthday anniversary.
            </p>
          </div>
        </div>
      )}

      <dl className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="border-t border-slate-200 pt-3 dark:border-slate-800">
          <dt className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Next Birthday Date
          </dt>
          <dd className="mt-1 font-display text-sm font-semibold text-slate-900 dark:text-slate-100">
            {nextBirthdayFormatted}
          </dd>
        </div>

        <div className="border-t border-slate-200 pt-3 dark:border-slate-800">
          <dt className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Day of the Week
          </dt>
          <dd className="mt-1 font-display text-sm font-semibold text-slate-900 dark:text-slate-100">
            {nextBirthdayDayOfWeek}
          </dd>
        </div>

        <div className="border-t border-slate-200 pt-3 dark:border-slate-800">
          <dt className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Days Remaining
          </dt>
          <dd className="mt-1 font-mono text-sm font-semibold text-teal-800 tabular-nums dark:text-teal-300">
            {daysRemaining === 1 ? '1 day (Tomorrow)' : pluralizeUnit(daysRemaining, 'day', 'days')}
          </dd>
        </div>

        <div className="border-t border-slate-200 pt-3 dark:border-slate-800">
          <dt className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Age Turning
          </dt>
          <dd className="mt-1 font-mono text-sm font-semibold text-slate-900 tabular-nums dark:text-slate-100">
            {pluralizeUnit(turningAgeNext, 'year', 'years')}
          </dd>
        </div>
      </dl>
    </section>
  );
}
