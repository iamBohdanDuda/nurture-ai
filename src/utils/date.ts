import { differenceInWeeks, addWeeks, addDays, format, isValid, parseISO } from 'date-fns';
import { PREGNANCY_TOTAL_WEEKS } from '@/core/constants';

/**
 * Calculate current pregnancy week from start date.
 */
export function getCurrentWeek(pregnancyStartDate: string | Date): number {
  const start = typeof pregnancyStartDate === 'string'
    ? parseISO(pregnancyStartDate)
    : pregnancyStartDate;
  if (!isValid(start)) return 0;
  const weeks = differenceInWeeks(new Date(), start);
  return Math.max(0, Math.min(weeks, PREGNANCY_TOTAL_WEEKS));
}

/**
 * Calculate due date from pregnancy start date (40 weeks).
 */
export function getDueDate(pregnancyStartDate: string | Date): Date {
  const start = typeof pregnancyStartDate === 'string'
    ? parseISO(pregnancyStartDate)
    : pregnancyStartDate;
  return addWeeks(start, PREGNANCY_TOTAL_WEEKS);
}

/**
 * Calculate pregnancy start date from due date.
 */
export function getStartFromDueDate(dueDate: Date): Date {
  return addDays(dueDate, -(PREGNANCY_TOTAL_WEEKS * 7));
}

/**
 * Get trimester from week number.
 */
export function getTrimester(week: number): 1 | 2 | 3 {
  if (week <= 12) return 1;
  if (week <= 27) return 2;
  return 3;
}

/**
 * Get progress percentage.
 */
export function getProgress(week: number): number {
  return Math.min((week / PREGNANCY_TOTAL_WEEKS) * 100, 100);
}

/**
 * Format date for display.
 */
export function formatDate(date: Date | string, pattern = 'MMM d, yyyy'): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(d)) return '';
  return format(d, pattern);
}

/**
 * Calculate expected due week range (e.g., "Week of Oct 12 – Oct 18, 2026").
 */
export function getDueDateWeekRange(pregnancyStartDate: string | Date): string {
  const due = getDueDate(pregnancyStartDate);
  if (!isValid(due)) return '';
  const dayOfWeek = due.getDay();
  const startOfWeek = addDays(due, -dayOfWeek);
  const endOfWeek = addDays(startOfWeek, 6);
  
  return `Week of ${format(startOfWeek, 'MMM d')} – ${format(endOfWeek, 'MMM d, yyyy')}`;
}

/**
 * Days until due date.
 */
export function getDaysRemaining(pregnancyStartDate: string | Date): number {
  const due = getDueDate(pregnancyStartDate);
  const now = new Date();
  const diff = due.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

/**
 * Format timestamp for tracking history logs (e.g. kicks, meals, symptoms).
 * Shows only time for today ("19:08"), "Yesterday, 19:08" for yesterday,
 * or date and time for older logs ("Oct 15, 19:08").
 */
export function formatLogTimestamp(dateInput?: string | Date | null): string {
  if (!dateInput) return '';
  const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (!isValid(d) || isNaN(d.getTime())) return '';

  const now = new Date();
  const isToday =
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear();

  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const isYesterday =
    d.getDate() === yesterday.getDate() &&
    d.getMonth() === yesterday.getMonth() &&
    d.getFullYear() === yesterday.getFullYear();

  const timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  if (isToday) {
    return timeStr;
  }
  if (isYesterday) {
    return `Yesterday, ${timeStr}`;
  }
  const isSameYear = d.getFullYear() === now.getFullYear();
  const dateStr = d.toLocaleDateString([], {
    month: 'short',
    day: 'numeric',
    ...(isSameYear ? {} : { year: 'numeric' }),
  });
  return `${dateStr}, ${timeStr}`;
}
