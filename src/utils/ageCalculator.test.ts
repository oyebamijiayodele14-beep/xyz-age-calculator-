import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateExactAge,
  calculateNextBirthday,
  computeAgeCalculation,
  diffCalendarDays,
  formatIsoDate,
  getDayOfWeek,
  isLeapYear,
  parseCalendarDate,
  validateAgeInputs,
} from './ageCalculator.ts';
import type { CalendarDate } from '../types/age.ts';

const TODAY: CalendarDate = { year: 2026, month: 11, day: 18 };

describe('Gregorian Leap Year Rules', () => {
  it('Test 12: treats year 2000 as a leap year (divisible by 400)', () => {
    assert.equal(isLeapYear(2000), true);
    assert.notEqual(parseCalendarDate('2000-02-29'), null);
  });

  it('Test 13: treats year 1900 as a non-leap year (century not divisible by 400)', () => {
    assert.equal(isLeapYear(1900), false);
    assert.equal(parseCalendarDate('1900-02-29'), null);
  });

  it('Test 14: treats year 2100 as a non-leap year (century not divisible by 400)', () => {
    assert.equal(isLeapYear(2100), false);
    assert.equal(parseCalendarDate('2100-02-29'), null);
  });

  it('Test 15: treats year 2024 as a leap year', () => {
    assert.equal(isLeapYear(2024), true);
    assert.notEqual(parseCalendarDate('2024-02-29'), null);
  });
});

describe('Basic Age Calculations', () => {
  it('Test 1: same birth date and reference date yields 0 years, 0 months, 0 days', () => {
    const res = computeAgeCalculation({
      birthDateStr: '2026-11-18',
      referenceDateStr: '2026-11-18',
      leapPolicy: 'feb28',
      today: TODAY,
    });
    assert.equal(res.validation.isValid, true);
    assert.deepEqual(res.result?.exactAge, { years: 0, months: 0, days: 0 });
    assert.equal(res.result?.statistics.totalDaysLived, 0);
  });

  it('Test 2: exactly one calendar year (including across leap year)', () => {
    const nonLeap = calculateExactAge(
      { year: 2021, month: 5, day: 10 },
      { year: 2022, month: 5, day: 10 },
      'feb28'
    );
    assert.deepEqual(nonLeap, { years: 1, months: 0, days: 0 });

    const acrossLeap = calculateExactAge(
      { year: 2023, month: 5, day: 10 },
      { year: 2024, month: 5, day: 10 },
      'feb28'
    );
    assert.deepEqual(acrossLeap, { years: 1, months: 0, days: 0 });
    assert.equal(
      diffCalendarDays({ year: 2023, month: 5, day: 10 }, { year: 2024, month: 5, day: 10 }),
      366
    );
  });

  it('Test 3: exactly one calendar month', () => {
    const janToFeb = calculateExactAge(
      { year: 2023, month: 1, day: 15 },
      { year: 2023, month: 2, day: 15 },
      'feb28'
    );
    assert.deepEqual(janToFeb, { years: 0, months: 1, days: 0 });

    const aprToMay = calculateExactAge(
      { year: 2023, month: 4, day: 15 },
      { year: 2023, month: 5, day: 15 },
      'feb28'
    );
    assert.deepEqual(aprToMay, { years: 0, months: 1, days: 0 });
  });

  it('Test 4: one day before a birthday', () => {
    const res = calculateExactAge(
      { year: 2000, month: 6, day: 15 },
      { year: 2025, month: 6, day: 14 },
      'feb28'
    );
    assert.deepEqual(res, { years: 24, months: 11, days: 30 });
  });

  it('Test 5: one day after a birthday', () => {
    const res = calculateExactAge(
      { year: 2000, month: 6, day: 15 },
      { year: 2025, month: 6, day: 16 },
      'feb28'
    );
    assert.deepEqual(res, { years: 25, months: 0, days: 1 });
  });

  it('Test 6: birth date at the beginning of a month', () => {
    const res = calculateExactAge(
      { year: 1998, month: 3, day: 1 },
      { year: 2026, month: 11, day: 18 },
      'feb28'
    );
    assert.deepEqual(res, { years: 28, months: 8, days: 17 });
  });

  it('Test 7: birth date at the end of a month (Jan 31 -> Feb 28 / Mar 1 / Mar 31)', () => {
    const feb28 = calculateExactAge(
      { year: 2023, month: 1, day: 31 },
      { year: 2023, month: 2, day: 28 },
      'feb28'
    );
    assert.deepEqual(feb28, { years: 0, months: 1, days: 0 });

    const mar1 = calculateExactAge(
      { year: 2023, month: 1, day: 31 },
      { year: 2023, month: 3, day: 1 },
      'feb28'
    );
    assert.deepEqual(mar1, { years: 0, months: 1, days: 1 });

    const mar31 = calculateExactAge(
      { year: 2023, month: 1, day: 31 },
      { year: 2023, month: 3, day: 31 },
      'feb28'
    );
    assert.deepEqual(mar31, { years: 0, months: 2, days: 0 });
  });

  it('Test 8: age spanning different month lengths (30, 31, 28, 29)', () => {
    const res = calculateExactAge(
      { year: 1995, month: 7, day: 30 },
      { year: 2024, month: 3, day: 1 },
      'feb28'
    );
    // Last anniversary: 2023-07-30 -> +7m = 2024-02-29 (leap year) -> +1d = 2024-03-01
    assert.deepEqual(res, { years: 28, months: 7, days: 1 });
  });
});

describe('February 29 Birth Date Policies', () => {
  it('Test 9: Feb 29 birth date evaluated in a leap year', () => {
    const feb28Policy = calculateExactAge(
      { year: 2000, month: 2, day: 29 },
      { year: 2024, month: 2, day: 29 },
      'feb28'
    );
    const mar1Policy = calculateExactAge(
      { year: 2000, month: 2, day: 29 },
      { year: 2024, month: 2, day: 29 },
      'mar1'
    );
    assert.deepEqual(feb28Policy, { years: 24, months: 0, days: 0 });
    assert.deepEqual(mar1Policy, { years: 24, months: 0, days: 0 });
  });

  it('Test 10: Feb 29 birth date in a non-leap year using Feb 28 convention', () => {
    const onFeb28 = calculateExactAge(
      { year: 2000, month: 2, day: 29 },
      { year: 2023, month: 2, day: 28 },
      'feb28'
    );
    assert.deepEqual(onFeb28, { years: 23, months: 0, days: 0 });

    const onMar1 = calculateExactAge(
      { year: 2000, month: 2, day: 29 },
      { year: 2023, month: 3, day: 1 },
      'feb28'
    );
    assert.deepEqual(onMar1, { years: 23, months: 0, days: 1 });

    // Day before leap-year Feb 29 birthday never produces 31 days
    const beforeNextLeap = calculateExactAge(
      { year: 2000, month: 2, day: 29 },
      { year: 2024, month: 2, day: 28 },
      'feb28'
    );
    assert.deepEqual(beforeNextLeap, { years: 23, months: 11, days: 30 });
  });

  it('Test 11: Feb 29 birth date in a non-leap year using March 1 convention', () => {
    // Year 0 (from 2000-02-29 to 2001-02-28): 11m from 2000-02-29 -> 2001-01-29, + 30d -> 2001-02-28
    const yearZeroFeb28 = calculateExactAge(
      { year: 2000, month: 2, day: 29 },
      { year: 2001, month: 2, day: 28 },
      'mar1'
    );
    assert.deepEqual(yearZeroFeb28, { years: 0, months: 11, days: 30 });

    // From 2022-03-01 (22nd anniversary) to 2023-02-28: 11m -> 2023-02-01, + 27d -> 2023-02-28
    const onFeb28 = calculateExactAge(
      { year: 2000, month: 2, day: 29 },
      { year: 2023, month: 2, day: 28 },
      'mar1'
    );
    assert.deepEqual(onFeb28, { years: 22, months: 11, days: 27 });

    const onMar1 = calculateExactAge(
      { year: 2000, month: 2, day: 29 },
      { year: 2023, month: 3, day: 1 },
      'mar1'
    );
    assert.deepEqual(onMar1, { years: 23, months: 0, days: 0 });
  });
});

describe('Validation Tests', () => {
  it('Test 16: empty date of birth', () => {
    const val = validateAgeInputs({
      birthDateStr: '',
      referenceDateStr: '2026-11-18',
      leapPolicy: 'feb28',
      today: TODAY,
    });
    assert.equal(val.isValid, false);
    assert.equal(val.errors.birthDate, 'Please enter your date of birth.');
  });

  it('Test 17: future date of birth', () => {
    const val = validateAgeInputs({
      birthDateStr: '2026-11-19',
      referenceDateStr: '2026-11-20',
      leapPolicy: 'feb28',
      today: TODAY,
    });
    assert.equal(val.isValid, false);
    assert.equal(val.errors.birthDate, 'Date of birth cannot be in the future.');
  });

  it('Test 18: reference date earlier than birth date', () => {
    const val = validateAgeInputs({
      birthDateStr: '2000-05-10',
      referenceDateStr: '2000-05-09',
      leapPolicy: 'feb28',
      today: TODAY,
    });
    assert.equal(val.isValid, false);
    assert.equal(
      val.errors.referenceDate,
      'The reference date cannot be earlier than the date of birth.'
    );
  });

  it('Test 19: invalid day (e.g. April 31 or Day 00)', () => {
    assert.equal(parseCalendarDate('2024-04-31'), null);
    assert.equal(parseCalendarDate('2024-01-00'), null);
    const val = validateAgeInputs({
      birthDateStr: '2024-04-31',
      referenceDateStr: '2026-11-18',
      leapPolicy: 'feb28',
      today: TODAY,
    });
    assert.equal(val.isValid, false);
    assert.equal(val.errors.birthDate, 'Please enter a valid calendar date.');
  });

  it('Test 20: invalid month (e.g. Month 13 or Month 00)', () => {
    assert.equal(parseCalendarDate('2024-13-01'), null);
    assert.equal(parseCalendarDate('2024-00-10'), null);
    const val = validateAgeInputs({
      birthDateStr: '2024-13-01',
      referenceDateStr: '2026-11-18',
      leapPolicy: 'feb28',
      today: TODAY,
    });
    assert.equal(val.isValid, false);
    assert.equal(val.errors.birthDate, 'Please enter a valid calendar date.');
  });

  it('Test 21: February 30 is rejected', () => {
    assert.equal(parseCalendarDate('2024-02-30'), null);
    const val = validateAgeInputs({
      birthDateStr: '2024-02-30',
      referenceDateStr: '2026-11-18',
      leapPolicy: 'feb28',
      today: TODAY,
    });
    assert.equal(val.isValid, false);
    assert.equal(val.errors.birthDate, 'Please enter a valid calendar date.');
  });

  it('Test 22: February 29 in a non-leap year is rejected', () => {
    assert.equal(parseCalendarDate('2023-02-29'), null);
    const val = validateAgeInputs({
      birthDateStr: '2023-02-29',
      referenceDateStr: '2026-11-18',
      leapPolicy: 'feb28',
      today: TODAY,
    });
    assert.equal(val.isValid, false);
    assert.equal(val.errors.birthDate, 'Please enter a valid calendar date.');
  });

  it('Test 23: cleared input after a previous calculation returns null result cleanly', () => {
    const first = computeAgeCalculation({
      birthDateStr: '1995-03-15',
      referenceDateStr: '2026-11-18',
      leapPolicy: 'feb28',
      today: TODAY,
    });
    assert.notEqual(first.result, null);

    const cleared = computeAgeCalculation({
      birthDateStr: '',
      referenceDateStr: '2026-11-18',
      leapPolicy: 'feb28',
      today: TODAY,
    });
    assert.equal(cleared.validation.isValid, false);
    assert.equal(cleared.result, null);
  });
});

describe('Next Birthday Tests', () => {
  it('Test 24: birthday occurring today shows today flag and calculates next year', () => {
    const nb = calculateNextBirthday(
      { year: 1995, month: 11, day: 18 },
      { year: 2026, month: 11, day: 18 },
      'feb28'
    );
    assert.equal(nb.isBirthdayToday, true);
    assert.equal(nb.turningAgeToday, 31);
    assert.equal(nb.nextBirthdayIso, '2027-11-18');
    assert.equal(nb.daysRemaining, 365);
    assert.equal(nb.turningAgeNext, 32);
  });

  it('Test 25: birthday tomorrow', () => {
    const nb = calculateNextBirthday(
      { year: 1995, month: 11, day: 19 },
      { year: 2026, month: 11, day: 18 },
      'feb28'
    );
    assert.equal(nb.isBirthdayToday, false);
    assert.equal(nb.daysRemaining, 1);
    assert.equal(nb.nextBirthdayIso, '2026-11-19');
    assert.equal(nb.turningAgeNext, 31);
  });

  it('Test 26: birthday already passed this year', () => {
    const nb = calculateNextBirthday(
      { year: 1995, month: 3, day: 10 },
      { year: 2026, month: 11, day: 18 },
      'feb28'
    );
    assert.equal(nb.isBirthdayToday, false);
    assert.equal(nb.nextBirthdayIso, '2027-03-10');
    assert.equal(nb.turningAgeNext, 32);
    assert.equal(nb.daysRemaining, 112);
  });

  it('Test 27: birthday yet to occur this year', () => {
    const nb = calculateNextBirthday(
      { year: 1995, month: 12, day: 25 },
      { year: 2026, month: 11, day: 18 },
      'feb28'
    );
    assert.equal(nb.isBirthdayToday, false);
    assert.equal(nb.nextBirthdayIso, '2026-12-25');
    assert.equal(nb.daysRemaining, 37);
    assert.equal(nb.turningAgeNext, 31);
  });

  it('Test 28: Feb 29 birthday respects selected anniversary convention', () => {
    const feb28Policy = calculateNextBirthday(
      { year: 2000, month: 2, day: 29 },
      { year: 2023, month: 2, day: 28 },
      'feb28'
    );
    assert.equal(feb28Policy.isBirthdayToday, true);
    assert.equal(feb28Policy.turningAgeToday, 23);
    assert.equal(feb28Policy.nextBirthdayIso, '2024-02-29');
    assert.equal(feb28Policy.daysRemaining, 366);
    assert.equal(feb28Policy.turningAgeNext, 24);

    const mar1Policy = calculateNextBirthday(
      { year: 2000, month: 2, day: 29 },
      { year: 2023, month: 2, day: 28 },
      'mar1'
    );
    assert.equal(mar1Policy.isBirthdayToday, false);
    assert.equal(mar1Policy.nextBirthdayIso, '2023-03-01');
    assert.equal(mar1Policy.daysRemaining, 1);
    assert.equal(mar1Policy.turningAgeNext, 23);
  });

  it('Test 29: December-to-January year transition', () => {
    const nb = calculateNextBirthday(
      { year: 1990, month: 1, day: 3 },
      { year: 2026, month: 12, day: 29 },
      'feb28'
    );
    assert.equal(nb.isBirthdayToday, false);
    assert.equal(nb.nextBirthdayIso, '2027-01-03');
    assert.equal(nb.daysRemaining, 5);
    assert.equal(nb.turningAgeNext, 37);
  });
});

describe('Additional Invariants: Day of Week, Statistics & Monotonicity', () => {
  it('computes exact weekdays independently of local timezone', () => {
    assert.equal(getDayOfWeek({ year: 1970, month: 1, day: 1 }), 'Thursday');
    assert.equal(getDayOfWeek({ year: 2000, month: 2, day: 29 }), 'Tuesday');
    assert.equal(getDayOfWeek({ year: 2026, month: 11, day: 18 }), 'Wednesday');
  });

  it('Test 40: produces identical results regardless of TZ environment variable', () => {
    const res = computeAgeCalculation({
      birthDateStr: '1999-03-01',
      referenceDateStr: '2026-11-18',
      leapPolicy: 'feb28',
      today: TODAY,
    });
    assert.equal(res.result?.exactAge.years, 27);
    assert.equal(res.result?.exactAge.months, 8);
    assert.equal(res.result?.exactAge.days, 17);
    assert.equal(res.result?.statistics.birthDayOfWeek, 'Monday');
    assert.equal(res.result?.statistics.referenceDayOfWeek, 'Wednesday');
    assert.equal(formatIsoDate(res.result!.referenceDate), '2026-11-18');
  });

  it('computes detailed statistics (weeks, days, 24h estimates) accurately', () => {
    const res = computeAgeCalculation({
      birthDateStr: '2026-11-01',
      referenceDateStr: '2026-11-18',
      leapPolicy: 'feb28',
      today: TODAY,
    });
    assert.ok(res.result);
    const stats = res.result.statistics;
    assert.equal(stats.totalCompletedYears, 0);
    assert.equal(stats.totalCompletedMonths, 0);
    assert.equal(stats.totalDaysLived, 17);
    assert.equal(stats.totalCompletedWeeks, 2);
    assert.equal(stats.remainingDaysAfterWeeks, 3);
    assert.equal(stats.estimatedHoursLived, 17 * 24);
    assert.equal(stats.estimatedMinutesLived, 17 * 1440);
    assert.equal(stats.estimatedSecondsLived, 17 * 86400);
    assert.equal(stats.birthDayOfWeek, 'Sunday');
    assert.equal(stats.referenceDayOfWeek, 'Wednesday');
  });

  it('guarantees non-negative days <= 30 and monotonic progression across leap boundaries', () => {
    const birth: CalendarDate = { year: 2020, month: 2, day: 29 };
    let prevScore = -1;
    const cursor = new Date(Date.UTC(2020, 1, 29));
    for (let i = 0; i < 1500; i += 1) {
      const ref: CalendarDate = {
        year: cursor.getUTCFullYear(),
        month: cursor.getUTCMonth() + 1,
        day: cursor.getUTCDate(),
      };
      for (const policy of ['feb28', 'mar1'] as const) {
        const age = calculateExactAge(birth, ref, policy);
        assert.ok(age.years >= 0);
        assert.ok(age.months >= 0 && age.months <= 11);
        assert.ok(age.days >= 0 && age.days <= 30, `Days=${age.days} on ${formatIsoDate(ref)} (${policy})`);
      }
      const febAge = calculateExactAge(birth, ref, 'feb28');
      const score = febAge.years * 400 + febAge.months * 32 + febAge.days;
      assert.ok(score >= prevScore);
      prevScore = score;
      cursor.setUTCDate(cursor.getUTCDate() + 1);
    }
  });
});
