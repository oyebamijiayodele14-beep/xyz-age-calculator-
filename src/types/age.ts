export interface CalendarDate {
  year: number;
  month: number; // 1-12
  day: number;   // 1-31
}

export type LeapPolicy = 'feb28' | 'mar1';

export type ThemeMode = 'light' | 'dark';

export interface AgeCalculationInput {
  birthDateStr: string;
  referenceDateStr: string;
  birthBadInput?: boolean;
  referenceBadInput?: boolean;
  leapPolicy: LeapPolicy;
  today?: CalendarDate;
}

export interface ValidationErrors {
  birthDate?: string;
  referenceDate?: string;
}

export interface ExactAge {
  years: number;
  months: number;
  days: number;
}

export interface AgeStatistics {
  totalCompletedYears: number;
  totalCompletedMonths: number;
  totalDaysLived: number;
  totalCompletedWeeks: number;
  remainingDaysAfterWeeks: number;
  estimatedHoursLived: number;
  estimatedMinutesLived: number;
  estimatedSecondsLived: number;
  birthDayOfWeek: string;
  referenceDayOfWeek: string;
}

export interface NextBirthdayInfo {
  isBirthdayToday: boolean;
  isBirthDateToday: boolean;
  turningAgeToday: number | null;
  nextBirthdayDate: CalendarDate;
  nextBirthdayIso: string;
  nextBirthdayFormatted: string;
  nextBirthdayDayOfWeek: string;
  daysRemaining: number;
  turningAgeNext: number;
}

export interface AgeCalculationResult {
  birthDate: CalendarDate;
  referenceDate: CalendarDate;
  birthDateIso: string;
  referenceDateIso: string;
  birthDateFormatted: string;
  referenceDateFormatted: string;
  leapPolicy: LeapPolicy;
  exactAge: ExactAge;
  statistics: AgeStatistics;
  nextBirthday: NextBirthdayInfo;
}

export interface ValidationResponse {
  isValid: boolean;
  errors: ValidationErrors;
  birthDate?: CalendarDate;
  referenceDate?: CalendarDate;
}
