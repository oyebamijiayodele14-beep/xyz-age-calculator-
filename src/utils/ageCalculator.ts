import type {
  AgeCalculationInput,
  AgeCalculationResult,
  AgeStatistics,
  CalendarDate,
  ExactAge,
  LeapPolicy,
  NextBirthdayInfo,
  ValidationErrors,
  ValidationResponse,
} from '../types/age.ts';

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const;

const WEEKDAY_NAMES = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
] as const;

const ISO_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

/**
 * Determines whether a given Gregorian calendar year is a leap year.
 * Century years are leap years only when divisible by 400 (e.g. 2000 yes, 1900/2100 no).
 */
export function isLeapYear(year: number): boolean {
  if (!Number.isInteger(year)) {
    return false;
  }
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

/**
 * Returns the number of days in a given month (1-12) of a given Gregorian year.
 */
export function getDaysInMonth(year: number, month: number): number {
  if (month < 1 || month > 12 || !Number.isInteger(month)) {
    return 0;
  }
  switch (month) {
    case 2:
      return isLeapYear(year) ? 29 : 28;
    case 4:
    case 6:
    case 9:
    case 11:
      return 30;
    default:
      return 31;
  }
}

/**
 * Validates that a CalendarDate represents an authentic Gregorian calendar date.
 */
export function isValidCalendarDate(date: CalendarDate): boolean {
  const { year, month, day } = date;
  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) {
    return false;
  }
  if (year < 1 || year > 9999) {
    return false;
  }
  if (month < 1 || month > 12) {
    return false;
  }
  const maxDay = getDaysInMonth(year, month);
  return day >= 1 && day <= maxDay;
}

/**
 * Strictly parses an ISO YYYY-MM-DD string into a CalendarDate without using Date.parse
 * or new Date(str), eliminating UTC/local timezone shifts.
 */
export function parseCalendarDate(value: string): CalendarDate | null {
  if (typeof value !== 'string') {
    return null;
  }
  const trimmed = value.trim();
  const match = ISO_DATE_PATTERN.exec(trimmed);
  if (!match) {
    return null;
  }
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  const candidate: CalendarDate = { year, month, day };
  if (!isValidCalendarDate(candidate)) {
    return null;
  }
  return candidate;
}

/**
 * Returns the user's current local calendar date using local year/month/day getters.
 */
export function getTodayCalendarDate(now: Date = new Date()): CalendarDate {
  return {
    year: now.getFullYear(),
    month: now.getMonth() + 1,
    day: now.getDate(),
  };
}

/**
 * Formats a CalendarDate as YYYY-MM-DD.
 */
export function formatIsoDate(date: CalendarDate): string {
  const y = String(date.year).padStart(4, '0');
  const m = String(date.month).padStart(2, '0');
  const d = String(date.day).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Compares two CalendarDates: returns -1 if a < b, 0 if equal, 1 if a > b.
 */
export function compareCalendarDates(a: CalendarDate, b: CalendarDate): -1 | 0 | 1 {
  if (a.year !== b.year) {
    return a.year < b.year ? -1 : 1;
  }
  if (a.month !== b.month) {
    return a.month < b.month ? -1 : 1;
  }
  if (a.day !== b.day) {
    return a.day < b.day ? -1 : 1;
  }
  return 0;
}

/**
 * Converts a Gregorian CalendarDate to an integer civil day number relative to 1970-01-01.
 * Based on Howard Hinnant's civil-from-days / days-from-civil algorithm.
 * Completely immune to daylight saving time, browser time zones, and floating-point drift.
 */
export function toCivilDayNumber(date: CalendarDate): number {
  let y = date.year;
  const m = date.month;
  const d = date.day;
  if (m <= 2) {
    y -= 1;
  }
  const era = Math.floor(y / 400);
  const yoe = y - era * 400; // [0, 399]
  const doy = Math.floor((153 * (m + (m > 2 ? -3 : 9)) + 2) / 5) + d - 1; // [0, 365]
  const doe = yoe * 365 + Math.floor(yoe / 4) - Math.floor(yoe / 100) + doy; // [0, 146096]
  return era * 146097 + doe - 719468;
}

/**
 * Exact difference in whole calendar days: (end - start).
 */
export function diffCalendarDays(start: CalendarDate, end: CalendarDate): number {
  return toCivilDayNumber(end) - toCivilDayNumber(start);
}

/**
 * Returns the weekday name (Sunday..Saturday) for any valid Gregorian CalendarDate.
 * 1970-01-01 (civil day 0) was a Thursday (index 4).
 */
export function getDayOfWeek(date: CalendarDate): string {
  const dayNum = toCivilDayNumber(date);
  const index = (((dayNum + 4) % 7) + 7) % 7;
  return WEEKDAY_NAMES[index];
}

/**
 * Formats a CalendarDate into an unambiguous, readable string: e.g. "Wednesday, March 15, 2000".
 */
export function formatReadableDate(date: CalendarDate): string {
  const weekday = getDayOfWeek(date);
  const monthName = MONTH_NAMES[date.month - 1];
  return `${weekday}, ${monthName} ${date.day}, ${date.year}`;
}

/**
 * Formats a CalendarDate concisely without weekday: e.g. "March 15, 2000".
 */
export function formatShortReadableDate(date: CalendarDate): string {
  const monthName = MONTH_NAMES[date.month - 1];
  return `${monthName} ${date.day}, ${date.year}`;
}

/**
 * Determines the birthday anniversary CalendarDate in a specific target year,
 * applying the user-selected February 29 convention in non-leap years.
 */
export function getBirthdayAnniversaryInYear(
  birthDate: CalendarDate,
  targetYear: number,
  leapPolicy: LeapPolicy
): CalendarDate {
  if (birthDate.month === 2 && birthDate.day === 29) {
    if (isLeapYear(targetYear)) {
      return { year: targetYear, month: 2, day: 29 };
    }
    return leapPolicy === 'feb28'
      ? { year: targetYear, month: 2, day: 28 }
      : { year: targetYear, month: 3, day: 1 };
  }
  return { year: targetYear, month: birthDate.month, day: birthDate.day };
}

/**
 * Adds a whole number of calendar months to a base CalendarDate, clamping day-of-month
 * to the target month's length (e.g. Jan 31 + 1 month -> Feb 28/29).
 */
function addMonthsClamped(baseDate: CalendarDate, monthsToAdd: number): CalendarDate {
  const totalMonthsFromZero = baseDate.year * 12 + (baseDate.month - 1) + monthsToAdd;
  const targetYear = Math.floor(totalMonthsFromZero / 12);
  const targetMonth = (totalMonthsFromZero % 12) + 1;
  const maxDay = getDaysInMonth(targetYear, targetMonth);
  const targetDay = Math.min(baseDate.day, maxDay);
  return { year: targetYear, month: targetMonth, day: targetDay };
}

/**
 * Computes exact completed calendar years, remaining completed calendar months,
 * and remaining days between birthDate and referenceDate (inclusive of boundary anniversaries).
 * Precondition: compareCalendarDates(referenceDate, birthDate) >= 0.
 */
export function calculateExactAge(
  birthDate: CalendarDate,
  referenceDate: CalendarDate,
  leapPolicy: LeapPolicy
): ExactAge {
  if (compareCalendarDates(referenceDate, birthDate) < 0) {
    throw new Error('Reference date cannot be earlier than birth date.');
  }

  if (compareCalendarDates(referenceDate, birthDate) === 0) {
    return { years: 0, months: 0, days: 0 };
  }

  const anniversaryInRefYear = getBirthdayAnniversaryInYear(
    birthDate,
    referenceDate.year,
    leapPolicy
  );

  let years: number;
  let lastAnniversary: CalendarDate;

  if (compareCalendarDates(referenceDate, anniversaryInRefYear) >= 0) {
    years = referenceDate.year - birthDate.year;
    lastAnniversary = years === 0 ? birthDate : anniversaryInRefYear;
  } else {
    years = referenceDate.year - birthDate.year - 1;
    lastAnniversary =
      years === 0
        ? birthDate
        : getBirthdayAnniversaryInYear(birthDate, referenceDate.year - 1, leapPolicy);
  }

  // For Feb 29 births under the 'feb28' policy in a non-leap year, the annual
  // anniversary is Feb 28 (month=0), while subsequent monthly milestones (months 1..11)
  // remain anchored to day 29 (e.g., Mar 29, ..., Jan 29) so day counts never reach 31
  // just before a leap-year Feb 29 birthday.
  const monthAnchor: CalendarDate =
    birthDate.month === 2 && birthDate.day === 29 && leapPolicy === 'feb28'
      ? { year: lastAnniversary.year, month: 2, day: 29 }
      : lastAnniversary;

  // Find the largest number of completed calendar months (0..11) from lastAnniversary
  // that does not exceed referenceDate.
  let months = 0;
  let anchorAfterMonths = lastAnniversary;

  for (let candidate = 11; candidate >= 1; candidate -= 1) {
    const stepped = addMonthsClamped(monthAnchor, candidate);
    if (compareCalendarDates(stepped, referenceDate) <= 0) {
      months = candidate;
      anchorAfterMonths = stepped;
      break;
    }
  }

  const days = diffCalendarDays(anchorAfterMonths, referenceDate);

  return {
    years,
    months,
    days,
  };
}

/**
 * Calculates next birthday information relative to the selected reference date.
 * If the birthday falls on the reference date, marks isBirthdayToday = true
 * and computes the next birthday one year later.
 */
export function calculateNextBirthday(
  birthDate: CalendarDate,
  referenceDate: CalendarDate,
  leapPolicy: LeapPolicy
): NextBirthdayInfo {
  const isBirthDateToday = compareCalendarDates(birthDate, referenceDate) === 0;
  const anniversaryThisYear = getBirthdayAnniversaryInYear(
    birthDate,
    referenceDate.year,
    leapPolicy
  );
  const cmp = compareCalendarDates(anniversaryThisYear, referenceDate);

  let isBirthdayToday = false;
  let turningAgeToday: number | null = null;
  let nextBirthdayDate: CalendarDate;

  if (cmp === 0) {
    isBirthdayToday = !isBirthDateToday;
    turningAgeToday = referenceDate.year - birthDate.year;
    nextBirthdayDate = getBirthdayAnniversaryInYear(
      birthDate,
      referenceDate.year + 1,
      leapPolicy
    );
  } else if (cmp > 0) {
    nextBirthdayDate = anniversaryThisYear;
  } else {
    nextBirthdayDate = getBirthdayAnniversaryInYear(
      birthDate,
      referenceDate.year + 1,
      leapPolicy
    );
  }

  const daysRemaining = diffCalendarDays(referenceDate, nextBirthdayDate);
  const turningAgeNext = nextBirthdayDate.year - birthDate.year;

  return {
    isBirthdayToday,
    isBirthDateToday,
    turningAgeToday,
    nextBirthdayDate,
    nextBirthdayIso: formatIsoDate(nextBirthdayDate),
    nextBirthdayFormatted: formatShortReadableDate(nextBirthdayDate),
    nextBirthdayDayOfWeek: getDayOfWeek(nextBirthdayDate),
    daysRemaining,
    turningAgeNext,
  };
}

/**
 * Calculates detailed calendar statistics from exact calendar-day differences
 * and completed years/months.
 */
export function calculateAgeStatistics(
  birthDate: CalendarDate,
  referenceDate: CalendarDate,
  exactAge: ExactAge
): AgeStatistics {
  const totalDaysLived = diffCalendarDays(birthDate, referenceDate);
  const totalCompletedYears = exactAge.years;
  const totalCompletedMonths = exactAge.years * 12 + exactAge.months;
  const totalCompletedWeeks = Math.floor(totalDaysLived / 7);
  const remainingDaysAfterWeeks = totalDaysLived % 7;

  // Estimates based strictly on 24-hour calendar days (86,400 seconds/day),
  // since time of birth is not collected.
  const estimatedHoursLived = totalDaysLived * 24;
  const estimatedMinutesLived = totalDaysLived * 1440;
  const estimatedSecondsLived = totalDaysLived * 86400;

  return {
    totalCompletedYears,
    totalCompletedMonths,
    totalDaysLived,
    totalCompletedWeeks,
    remainingDaysAfterWeeks,
    estimatedHoursLived,
    estimatedMinutesLived,
    estimatedSecondsLived,
    birthDayOfWeek: getDayOfWeek(birthDate),
    referenceDayOfWeek: getDayOfWeek(referenceDate),
  };
}

/**
 * Validates raw form inputs without silently mutating user values.
 */
export function validateAgeInputs(input: AgeCalculationInput): ValidationResponse {
  const errors: ValidationErrors = {};
  const today = input.today ?? getTodayCalendarDate();

  let birthDate: CalendarDate | undefined;
  if (input.birthBadInput) {
    errors.birthDate = 'Please enter a valid calendar date.';
  } else if (!input.birthDateStr || !input.birthDateStr.trim()) {
    errors.birthDate = 'Please enter your date of birth.';
  } else {
    const parsed = parseCalendarDate(input.birthDateStr);
    if (!parsed) {
      errors.birthDate = 'Please enter a valid calendar date.';
    } else if (compareCalendarDates(parsed, today) > 0) {
      errors.birthDate = 'Date of birth cannot be in the future.';
    } else {
      birthDate = parsed;
    }
  }

  let referenceDate: CalendarDate | undefined;
  if (input.referenceBadInput) {
    errors.referenceDate = 'Please enter a valid calendar date.';
  } else if (!input.referenceDateStr || !input.referenceDateStr.trim()) {
    errors.referenceDate = 'Please enter a reference date.';
  } else {
    const parsedRef = parseCalendarDate(input.referenceDateStr);
    if (!parsedRef) {
      errors.referenceDate = 'Please enter a valid calendar date.';
    } else {
      referenceDate = parsedRef;
    }
  }

  if (birthDate && referenceDate && compareCalendarDates(referenceDate, birthDate) < 0) {
    errors.referenceDate = 'The reference date cannot be earlier than the date of birth.';
  }

  const isValid = !errors.birthDate && !errors.referenceDate && !!birthDate && !!referenceDate;

  return {
    isValid,
    errors,
    birthDate: isValid ? birthDate : undefined,
    referenceDate: isValid ? referenceDate : undefined,
  };
}

/**
 * Full pipeline: validates inputs and computes exact age, statistics, and next birthday.
 */
export function computeAgeCalculation(
  input: AgeCalculationInput
): { validation: ValidationResponse; result: AgeCalculationResult | null } {
  const validation = validateAgeInputs(input);
  if (!validation.isValid || !validation.birthDate || !validation.referenceDate) {
    return { validation, result: null };
  }

  const { birthDate, referenceDate } = validation;
  const exactAge = calculateExactAge(birthDate, referenceDate, input.leapPolicy);
  const statistics = calculateAgeStatistics(birthDate, referenceDate, exactAge);
  const nextBirthday = calculateNextBirthday(birthDate, referenceDate, input.leapPolicy);

  return {
    validation,
    result: {
      birthDate,
      referenceDate,
      birthDateIso: formatIsoDate(birthDate),
      referenceDateIso: formatIsoDate(referenceDate),
      birthDateFormatted: formatReadableDate(birthDate),
      referenceDateFormatted: formatReadableDate(referenceDate),
      leapPolicy: input.leapPolicy,
      exactAge,
      statistics,
      nextBirthday,
    },
  };
}

export function pluralizeUnit(count: number, singular: string, plural: string): string {
  return `${count.toLocaleString()} ${count === 1 ? singular : plural}`;
}

export function formatAgeSummaryText(result: AgeCalculationResult): string {
  const { exactAge, birthDateFormatted, referenceDateFormatted, statistics, nextBirthday } =
    result;
  const ageLine = `${pluralizeUnit(exactAge.years, 'Year', 'Years')}, ${pluralizeUnit(
    exactAge.months,
    'Month',
    'Months'
  )}, ${pluralizeUnit(exactAge.days, 'Day', 'Days')}`;

  return [
    `Exact Age: ${ageLine}`,
    `Date of Birth: ${birthDateFormatted}`,
    `Calculated As Of: ${referenceDateFormatted}`,
    `Total Days Lived: ${statistics.totalDaysLived.toLocaleString()}`,
    `Next Birthday: ${nextBirthday.nextBirthdayFormatted} (${nextBirthday.nextBirthdayDayOfWeek}) — ${pluralizeUnit(
      nextBirthday.daysRemaining,
      'day',
      'days'
    )} remaining (turning ${nextBirthday.turningAgeNext})`,
  ].join('\n');
}
