import { useAuthStore } from '@/stores/authStore';
import { getCurrentWeek, getDueDate, getProgress, getDaysRemaining } from '@/utils/date';

/**
 * Hook for pregnancy week calculations.
 * Derives current week, trimester, progress from the auth store's user data.
 */
export function usePregnancyWeek() {
  const user = useAuthStore((s) => s.user);

  if (!user?.pregnancy_start_date) {
    return {
      currentWeek: 0,
      dueDate: null,
      progress: 0,
      daysRemaining: 0,
      trimester: 1 as const,
    };
  }

  const currentWeek = getCurrentWeek(user.pregnancy_start_date);
  const dueDate = getDueDate(user.pregnancy_start_date);
  const progress = getProgress(currentWeek);
  const daysRemaining = getDaysRemaining(user.pregnancy_start_date);
  const trimester = currentWeek <= 12 ? 1 : currentWeek <= 27 ? 2 : 3;

  return {
    currentWeek,
    dueDate,
    progress,
    daysRemaining,
    trimester: trimester as 1 | 2 | 3,
  };
}
