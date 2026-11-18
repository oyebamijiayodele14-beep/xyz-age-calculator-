import { Info } from 'lucide-react';
import type { AgeStatistics } from '../types/age.ts';
import { pluralizeUnit } from '../utils/ageCalculator.ts';

interface DetailedStatisticsProps {
  statistics: AgeStatistics;
}

export function DetailedStatistics({ statistics }: DetailedStatisticsProps) {
  const rows = [
    {
      label: 'Total completed years',
      value: statistics.totalCompletedYears.toLocaleString(),
      note: 'Full calendar years elapsed',
    },
    {
      label: 'Total completed months',
      value: statistics.totalCompletedMonths.toLocaleString(),
      note: 'Full calendar months elapsed',
    },
    {
      label: 'Total days lived',
      value: statistics.totalDaysLived.toLocaleString(),
      note: 'Exact Gregorian calendar-day difference',
    },
    {
      label: 'Total completed weeks and remaining days',
      value: `${pluralizeUnit(statistics.totalCompletedWeeks, 'week', 'weeks')}, ${pluralizeUnit(
        statistics.remainingDaysAfterWeeks,
        'day',
        'days'
      )}`,
      note: 'Derived directly from exact calendar days',
    },
    {
      label: 'Total hours lived',
      value: statistics.estimatedHoursLived.toLocaleString(),
      note: 'Estimated from 24-hour calendar days',
    },
    {
      label: 'Total minutes lived',
      value: statistics.estimatedMinutesLived.toLocaleString(),
      note: 'Estimated from 24-hour calendar days',
    },
    {
      label: 'Total seconds lived',
      value: statistics.estimatedSecondsLived.toLocaleString(),
      note: 'Estimated from 24-hour calendar days',
    },
    {
      label: 'Day of the week born',
      value: statistics.birthDayOfWeek,
      note: 'Gregorian calendar weekday',
    },
    {
      label: 'Day of the week of reference date',
      value: statistics.referenceDayOfWeek,
      note: 'Gregorian calendar weekday',
    },
  ];

  return (
    <section
      aria-labelledby="detailed-stats-heading"
      className="print-break-inside-avoid rounded-xl border border-slate-200 bg-white p-5 sm:p-6 dark:border-slate-800 dark:bg-[#111A2E]"
    >
      <div>
        <h2
          id="detailed-stats-heading"
          className="font-display text-base font-semibold text-[#0F294A] dark:text-slate-100"
        >
          Detailed Age Statistics
        </h2>
        <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
          Calendar-accurate totals and weekday breakdown between your birth date and reference date.
        </p>
      </div>

      <dl className="mt-4 divide-y divide-slate-200 border-t border-slate-200 dark:divide-slate-800 dark:border-slate-800">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex flex-col justify-between gap-1 py-3 sm:flex-row sm:items-center sm:gap-4"
          >
            <div>
              <dt className="text-sm font-medium text-slate-800 dark:text-slate-200">
                {row.label}
              </dt>
              <dd className="text-xs text-slate-500 dark:text-slate-400">{row.note}</dd>
            </div>
            <dd className="font-mono text-sm font-semibold text-[#0F294A] tabular-nums sm:text-right dark:text-teal-300">
              {row.value}
            </dd>
          </div>
        ))}
      </dl>

      <div className="mt-4 flex items-start gap-2 rounded-lg bg-slate-50 px-3.5 py-2.5 text-xs leading-relaxed text-slate-600 dark:bg-[#0B1120] dark:text-slate-400">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-500 dark:text-slate-400" aria-hidden="true" />
        <p>
          Hours, minutes, and seconds are estimates calculated by multiplying exact calendar days by
          24 hours (86,400 seconds per day) because exact time of birth is not collected.
        </p>
      </div>
    </section>
  );
}
