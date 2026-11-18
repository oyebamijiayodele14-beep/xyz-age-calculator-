import { useEffect, useRef, useState } from 'react';
import { Check, Copy, Printer, Share2 } from 'lucide-react';
import type { AgeCalculationResult } from '../types/age.ts';
import { formatAgeSummaryText, pluralizeUnit } from '../utils/ageCalculator.ts';

interface PrimaryAgeResultProps {
  result: AgeCalculationResult;
}

export function PrimaryAgeResult({ result }: PrimaryAgeResultProps) {
  const [actionStatus, setActionStatus] = useState<{
    type: 'success' | 'info' | 'error';
    message: string;
  } | null>(null);
  const [copiedRecently, setCopiedRecently] = useState(false);
  const copyTimerRef = useRef<number | null>(null);

  useEffect(() => {
    setActionStatus(null);
    setCopiedRecently(false);
    if (copyTimerRef.current !== null) {
      window.clearTimeout(copyTimerRef.current);
      copyTimerRef.current = null;
    }
  }, [result.birthDateIso, result.referenceDateIso, result.leapPolicy]);

  useEffect(() => {
    return () => {
      if (copyTimerRef.current !== null) {
        window.clearTimeout(copyTimerRef.current);
      }
    };
  }, []);

  const { exactAge, birthDate, birthDateFormatted, referenceDateFormatted, leapPolicy } = result;
  const isFeb29Birth = birthDate.month === 2 && birthDate.day === 29;

  const summarySentence = `${pluralizeUnit(exactAge.years, 'Year', 'Years')}, ${pluralizeUnit(
    exactAge.months,
    'Month',
    'Months'
  )}, ${pluralizeUnit(exactAge.days, 'Day', 'Days')}`;

  const copyTextWithFallback = async (text: string): Promise<boolean> => {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch {
        // Fall through to execCommand fallback
      }
    }

    try {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.setAttribute('readonly', '');
      textarea.style.position = 'fixed';
      textarea.style.left = '-9999px';
      document.body.appendChild(textarea);
      textarea.select();
      const succeeded = document.execCommand('copy');
      document.body.removeChild(textarea);
      return succeeded;
    } catch {
      return false;
    }
  };

  const handleCopy = async () => {
    const text = formatAgeSummaryText(result);
    const ok = await copyTextWithFallback(text);
    if (ok) {
      setCopiedRecently(true);
      setActionStatus({ type: 'success', message: 'Age summary copied to clipboard.' });
      if (copyTimerRef.current !== null) {
        window.clearTimeout(copyTimerRef.current);
      }
      copyTimerRef.current = window.setTimeout(() => {
        setCopiedRecently(false);
        copyTimerRef.current = null;
      }, 2500);
    } else {
      setActionStatus({
        type: 'error',
        message: 'Clipboard access was denied by your browser. Please select and copy manually.',
      });
    }
  };

  const handleShare = async () => {
    const text = formatAgeSummaryText(result);
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      try {
        await navigator.share({
          title: 'Age Calculation Summary',
          text,
        });
        setActionStatus({ type: 'success', message: 'Age summary shared.' });
        return;
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          return;
        }
        // Fall through to clipboard fallback if share failed
      }
    }

    const copied = await copyTextWithFallback(text);
    if (copied) {
      setActionStatus({
        type: 'info',
        message: 'Native share is unavailable here; summary copied to clipboard instead.',
      });
    } else {
      setActionStatus({
        type: 'error',
        message: 'Sharing and clipboard access are not supported in this browser.',
      });
    }
  };

  const handlePrint = () => {
    try {
      window.print();
    } catch {
      setActionStatus({
        type: 'error',
        message: 'Unable to open the browser print dialog.',
      });
    }
  };

  return (
    <section
      aria-labelledby="exact-age-heading"
      className="print-break-inside-avoid rounded-xl border border-slate-200 bg-white p-5 sm:p-6 dark:border-slate-800 dark:bg-[#111A2E]"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2
          id="exact-age-heading"
          className="font-display text-xs font-semibold tracking-wider text-teal-700 uppercase dark:text-teal-400"
        >
          Your Exact Age
        </h2>
        <p className="text-xs text-slate-600 dark:text-slate-400">
          As of <span className="font-medium text-slate-900 dark:text-slate-200">{referenceDateFormatted}</span>
        </p>
      </div>

      {/* Primary readable sentence */}
      <p
        aria-live="polite"
        className="mt-2 font-display text-2xl font-bold tracking-tight text-[#0F294A] tabular-nums sm:text-3xl dark:text-white"
      >
        {summarySentence}
      </p>

      {/* Structured 3-unit breakdown */}
      <div className="mt-5 grid grid-cols-3 divide-x divide-slate-200 border-y border-slate-200 py-4 dark:divide-slate-800 dark:border-slate-800">
        <div className="pr-3">
          <div className="font-mono text-2xl font-semibold text-slate-900 tabular-nums sm:text-3xl dark:text-slate-100">
            {exactAge.years.toLocaleString()}
          </div>
          <div className="mt-0.5 text-xs font-medium text-slate-600 dark:text-slate-400">
            {exactAge.years === 1 ? 'Completed Year' : 'Completed Years'}
          </div>
        </div>

        <div className="px-3 sm:px-5">
          <div className="font-mono text-2xl font-semibold text-slate-900 tabular-nums sm:text-3xl dark:text-slate-100">
            {exactAge.months.toLocaleString()}
          </div>
          <div className="mt-0.5 text-xs font-medium text-slate-600 dark:text-slate-400">
            {exactAge.months === 1 ? 'Month' : 'Months'}
          </div>
        </div>

        <div className="pl-3 sm:pl-5">
          <div className="font-mono text-2xl font-semibold text-slate-900 tabular-nums sm:text-3xl dark:text-slate-100">
            {exactAge.days.toLocaleString()}
          </div>
          <div className="mt-0.5 text-xs font-medium text-slate-600 dark:text-slate-400">
            {exactAge.days === 1 ? 'Day' : 'Days'}
          </div>
        </div>
      </div>

      {/* Date context metadata (unboxed clean text with separators) */}
      <div className="mt-4 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-slate-600 dark:text-slate-400">
        <span>Born {birthDateFormatted}</span>
        <span aria-hidden="true">·</span>
        <span>Reference {referenceDateFormatted}</span>
        {isFeb29Birth && (
          <>
            <span aria-hidden="true">·</span>
            <span>
              Non-leap anniversary: {leapPolicy === 'feb28' ? 'February 28' : 'March 1'}
            </span>
          </>
        )}
      </div>

      {/* Utility actions */}
      <div className="no-print mt-5 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 dark:hover:text-white dark:focus-visible:outline-teal-400 whitespace-nowrap cursor-pointer"
        >
          {copiedRecently ? (
            <Check className="h-3.5 w-3.5 text-teal-700 dark:text-teal-400" aria-hidden="true" />
          ) : (
            <Copy className="h-3.5 w-3.5" aria-hidden="true" />
          )}
          <span>{copiedRecently ? 'Copied' : 'Copy Result'}</span>
        </button>

        <button
          type="button"
          onClick={handleShare}
          className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 dark:hover:text-white dark:focus-visible:outline-teal-400 whitespace-nowrap cursor-pointer"
        >
          <Share2 className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Share</span>
        </button>

        <button
          type="button"
          onClick={handlePrint}
          className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 dark:hover:text-white dark:focus-visible:outline-teal-400 whitespace-nowrap cursor-pointer"
        >
          <Printer className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Print / Save PDF</span>
        </button>
      </div>

      {actionStatus && (
        <p
          role="status"
          aria-live="polite"
          className={`no-print mt-3 text-xs font-medium ${
            actionStatus.type === 'error'
              ? 'text-red-700 dark:text-red-400'
              : 'text-teal-800 dark:text-teal-300'
          }`}
        >
          {actionStatus.message}
        </p>
      )}
    </section>
  );
}
