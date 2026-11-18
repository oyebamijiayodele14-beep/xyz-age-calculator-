import type { ChangeEvent, FormEvent } from 'react';
import { AlertCircle, Calendar, RotateCcw, ShieldCheck } from 'lucide-react';
import type { LeapPolicy, ValidationErrors } from '../types/age.ts';
import { formatReadableDate, parseCalendarDate } from '../utils/ageCalculator.ts';

interface CalculatorFormProps {
  birthDateStr: string;
  referenceDateStr: string;
  todayIso: string;
  leapPolicy: LeapPolicy;
  errors: ValidationErrors;
  onBirthDateChange: (value: string, badInput: boolean) => void;
  onReferenceDateChange: (value: string, badInput: boolean) => void;
  onSetReferenceToday: () => void;
  onLeapPolicyChange: (policy: LeapPolicy) => void;
  onCalculate: (e: FormEvent) => void;
  onReset: () => void;
}

export function CalculatorForm({
  birthDateStr,
  referenceDateStr,
  todayIso,
  leapPolicy,
  errors,
  onBirthDateChange,
  onReferenceDateChange,
  onSetReferenceToday,
  onLeapPolicyChange,
  onCalculate,
  onReset,
}: CalculatorFormProps) {
  const parsedBirth = parseCalendarDate(birthDateStr);
  const parsedRef = parseCalendarDate(referenceDateStr);
  const isRefToday = referenceDateStr === todayIso;

  const handleBirthInput = (e: ChangeEvent<HTMLInputElement>) => {
    onBirthDateChange(e.target.value, e.target.validity?.badInput ?? false);
  };

  const handleRefInput = (e: ChangeEvent<HTMLInputElement>) => {
    onReferenceDateChange(e.target.value, e.target.validity?.badInput ?? false);
  };

  return (
    <section
      aria-labelledby="calculator-form-heading"
      className="no-print rounded-xl border border-slate-200 bg-white p-5 sm:p-6 dark:border-slate-800 dark:bg-[#111A2E]"
    >
      <div className="mb-5">
        <h2
          id="calculator-form-heading"
          className="font-display text-lg font-semibold text-[#0F294A] dark:text-slate-100"
        >
          Enter Dates
        </h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Select a birth date and any reference date to compute exact calendar age.
        </p>
      </div>

      <form onSubmit={onCalculate} noValidate className="space-y-5">
        {/* Date of Birth */}
        <div>
          <label
            htmlFor="birth-date-input"
            className="block text-sm font-semibold text-slate-800 dark:text-slate-200"
          >
            Date of Birth
          </label>
          <p id="birth-date-hint" className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            Select your date of birth
          </p>
          <div className="relative mt-2">
            <input
              id="birth-date-input"
              name="birthDate"
              type="date"
              value={birthDateStr}
              min="0001-01-01"
              max={todayIso}
              onChange={handleBirthInput}
              aria-invalid={Boolean(errors.birthDate)}
              aria-describedby={
                errors.birthDate ? 'birth-date-hint birth-date-error' : 'birth-date-hint'
              }
              className={`block min-h-[44px] w-full rounded-lg border bg-white px-3.5 py-2.5 font-mono text-sm text-slate-900 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 dark:bg-[#0B1120] dark:text-slate-100 dark:scheme-dark ${
                errors.birthDate
                  ? 'border-red-600 focus-visible:outline-red-600 dark:border-red-500 dark:focus-visible:outline-red-400'
                  : 'border-slate-300 hover:border-slate-400 focus-visible:outline-teal-700 dark:border-slate-700 dark:hover:border-slate-600 dark:focus-visible:outline-teal-400'
              }`}
            />
          </div>

          {parsedBirth && !errors.birthDate && (
            <p className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-teal-800 dark:text-teal-300">
              <Calendar className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span>{formatReadableDate(parsedBirth)}</span>
            </p>
          )}

          {errors.birthDate && (
            <p
              id="birth-date-error"
              role="alert"
              className="mt-1.5 flex items-start gap-1.5 text-xs font-medium text-red-700 dark:text-red-400"
            >
              <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span>{errors.birthDate}</span>
            </p>
          )}
        </div>

        {/* Calculate Age As Of */}
        <div>
          <div className="flex items-center justify-between gap-2">
            <label
              htmlFor="reference-date-input"
              className="block text-sm font-semibold text-slate-800 dark:text-slate-200"
            >
              Calculate Age As Of
            </label>
            {!isRefToday && (
              <button
                type="button"
                onClick={onSetReferenceToday}
                className="text-xs font-semibold text-teal-700 underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 dark:text-teal-400 dark:focus-visible:outline-teal-400 whitespace-nowrap cursor-pointer"
              >
                Use Today
              </button>
            )}
          </div>
          <p id="reference-date-hint" className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            Defaults to today; change to evaluate a past or future date
          </p>
          <div className="relative mt-2">
            <input
              id="reference-date-input"
              name="referenceDate"
              type="date"
              value={referenceDateStr}
              min="0001-01-01"
              max="9999-12-31"
              onChange={handleRefInput}
              aria-invalid={Boolean(errors.referenceDate)}
              aria-describedby={
                errors.referenceDate
                  ? 'reference-date-hint reference-date-error'
                  : 'reference-date-hint'
              }
              className={`block min-h-[44px] w-full rounded-lg border bg-white px-3.5 py-2.5 font-mono text-sm text-slate-900 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 dark:bg-[#0B1120] dark:text-slate-100 dark:scheme-dark ${
                errors.referenceDate
                  ? 'border-red-600 focus-visible:outline-red-600 dark:border-red-500 dark:focus-visible:outline-red-400'
                  : 'border-slate-300 hover:border-slate-400 focus-visible:outline-teal-700 dark:border-slate-700 dark:hover:border-slate-600 dark:focus-visible:outline-teal-400'
              }`}
            />
          </div>

          {parsedRef && !errors.referenceDate && (
            <p className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-400">
              <Calendar className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span>
                {formatReadableDate(parsedRef)}
                {isRefToday ? ' (Today)' : ''}
              </span>
            </p>
          )}

          {errors.referenceDate && (
            <p
              id="reference-date-error"
              role="alert"
              className="mt-1.5 flex items-start gap-1.5 text-xs font-medium text-red-700 dark:text-red-400"
            >
              <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span>{errors.referenceDate}</span>
            </p>
          )}
        </div>

        {/* February 29 Policy */}
        <fieldset className="border-t border-slate-200 pt-4 dark:border-slate-800">
          <legend className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            February 29 Anniversary Convention
          </legend>
          <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
            For leap-day birthdays, legal definitions in non-leap years differ by jurisdiction.
          </p>

          <div className="mt-2.5 grid grid-cols-2 gap-1.5 rounded-lg bg-slate-100 p-1 dark:bg-[#0B1120]">
            <label
              className={`flex min-h-[40px] cursor-pointer items-center justify-center rounded-md px-3 py-2 text-center text-xs font-semibold transition-colors whitespace-nowrap has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-teal-700 dark:has-[:focus-visible]:outline-teal-400 ${
                leapPolicy === 'feb28'
                  ? 'bg-white text-[#0F294A] shadow-sm dark:bg-slate-800 dark:text-teal-300'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              <input
                type="radio"
                name="leapPolicy"
                value="feb28"
                checked={leapPolicy === 'feb28'}
                onChange={() => onLeapPolicyChange('feb28')}
                className="sr-only"
              />
              <span>February 28</span>
            </label>

            <label
              className={`flex min-h-[40px] cursor-pointer items-center justify-center rounded-md px-3 py-2 text-center text-xs font-semibold transition-colors whitespace-nowrap has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-teal-700 dark:has-[:focus-visible]:outline-teal-400 ${
                leapPolicy === 'mar1'
                  ? 'bg-white text-[#0F294A] shadow-sm dark:bg-slate-800 dark:text-teal-300'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              <input
                type="radio"
                name="leapPolicy"
                value="mar1"
                checked={leapPolicy === 'mar1'}
                onChange={() => onLeapPolicyChange('mar1')}
                className="sr-only"
              />
              <span>March 1</span>
            </label>
          </div>
        </fieldset>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2.5 pt-1 sm:flex-row">
          <button
            type="submit"
            className="inline-flex min-h-[44px] flex-1 items-center justify-center rounded-lg bg-[#0F294A] px-5 py-2.5 text-sm font-semibold text-white transition-colors duration-150 hover:bg-[#173A66] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0F294A] dark:bg-teal-600 dark:hover:bg-teal-500 dark:focus-visible:outline-teal-400 whitespace-nowrap cursor-pointer"
          >
            Calculate Age
          </button>

          <button
            type="button"
            onClick={onReset}
            className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors duration-150 hover:bg-slate-50 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-600 dark:border-slate-700 dark:bg-slate-800/70 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-white dark:focus-visible:outline-slate-400 whitespace-nowrap cursor-pointer"
          >
            <RotateCcw className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>Reset</span>
          </button>
        </div>
      </form>

      {/* Privacy Statement */}
      <div className="mt-5 flex items-start gap-2.5 border-t border-slate-200 pt-4 text-xs leading-relaxed text-slate-600 dark:border-slate-800 dark:text-slate-400">
        <ShieldCheck
          className="mt-0.5 h-4 w-4 shrink-0 text-teal-700 dark:text-teal-400"
          aria-hidden="true"
        />
        <p>
          Your date of birth is processed locally in your browser. We do not require an account or
          send your birth date to a server.
        </p>
      </div>
    </section>
  );
}
