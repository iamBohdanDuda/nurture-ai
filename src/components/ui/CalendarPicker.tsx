import React, { useState, useEffect } from 'react';
import { useTheme } from '@shopify/restyle';
import { Ionicons } from '@expo/vector-icons';
import { Box, Text } from '@/theme/restyleComponents';
import { Touchable } from '@/components/primitives/Touchable';
import { type Theme } from '@/theme/theme';

interface CalendarPickerProps {
  selectedDate: Date | string | null;
  onSelectDate: (date: Date) => void;
  maxDate?: Date;
  minYear?: number;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MIN_YEAR_DEFAULT = 2020;

export function CalendarPicker({
  selectedDate,
  onSelectDate,
  maxDate = new Date(),
  minYear = MIN_YEAR_DEFAULT,
}: CalendarPickerProps) {
  const theme = useTheme<Theme>();

  // Ensure selectedDate is a valid Date instance
  const parseDate = (d: Date | string | null): Date | null => {
    if (!d) return null;
    const parsed = d instanceof Date ? d : new Date(d);
    return isNaN(parsed.getTime()) ? null : parsed;
  };

  const validSelectedDate = parseDate(selectedDate);
  const initialDate = validSelectedDate || new Date();

  const [currentMonth, setCurrentMonth] = useState(initialDate.getMonth());
  const [currentYear, setCurrentYear] = useState(Math.max(minYear, initialDate.getFullYear()));

  // Sync internal month & year if selectedDate changes from props
  useEffect(() => {
    const parsed = parseDate(selectedDate);
    if (parsed) {
      setCurrentMonth(parsed.getMonth());
      setCurrentYear(Math.max(minYear, parsed.getFullYear()));
    }
  }, [selectedDate, minYear]);

  const handlePrevMonth = () => {
    if (currentYear < minYear || (currentYear === minYear && currentMonth === 0)) {
      return; // Cannot go earlier than Jan 2020
    }
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => Math.max(minYear, y - 1));
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    const today = new Date();
    if (currentYear > today.getFullYear() || (currentYear === today.getFullYear() && currentMonth >= today.getMonth())) {
      return;
    }

    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  // Generate days for grid
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handleSelectDay = (day: number) => {
    const picked = new Date(currentYear, currentMonth, day, 12, 0, 0); // Noon to prevent timezone offsets
    if (picked > maxDate || picked.getFullYear() < minYear) return;
    onSelectDate(picked);
  };

  const applyPresetWeeksAgo = (weeks: number) => {
    const date = new Date();
    date.setDate(date.getDate() - weeks * 7);
    if (date.getFullYear() < minYear) {
      date.setFullYear(minYear);
    }
    setCurrentMonth(date.getMonth());
    setCurrentYear(date.getFullYear());
    onSelectDate(date);
  };

  const isSelectedDay = (day: number) => {
    if (!validSelectedDate) return false;
    return (
      validSelectedDate.getDate() === day &&
      validSelectedDate.getMonth() === currentMonth &&
      validSelectedDate.getFullYear() === currentYear
    );
  };

  const isDisabledDay = (day: number) => {
    const date = new Date(currentYear, currentMonth, day);
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    return date > today || currentYear < minYear;
  };

  // Calculate approximate weeks pregnant if selected
  const getWeeksInfo = () => {
    if (!validSelectedDate) return null;
    const diffMs = new Date().getTime() - validSelectedDate.getTime();
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const weeks = Math.max(1, Math.min(42, Math.floor(days / 7) + 1));
    return weeks;
  };

  const weeksPregnant = getWeeksInfo();
  const isPrevDisabled = currentYear <= minYear && currentMonth === 0;

  return (
    <Box
      backgroundColor="primaryBackground"
      borderRadius="l"
      padding="m"
      borderWidth={1}
      borderColor="border"
      width="100%"
    >
      {/* Month & Year Navigation Header */}
      <Box
        flexDirection="row"
        alignItems="center"
        justifyContent="space-between"
        marginBottom="m"
      >
        <Touchable onPress={handlePrevMonth} disabled={isPrevDisabled} hitSlop={8}>
          <Box
            width={36}
            height={36}
            borderRadius="full"
            backgroundColor="inputBackground"
            alignItems="center"
            justifyContent="center"
            opacity={isPrevDisabled ? 0.3 : 1}
          >
            <Ionicons name="chevron-back" size={20} color={theme.colors.textPrimary} />
          </Box>
        </Touchable>

        <Text variant="h3">
          {monthNames[currentMonth]} {currentYear}
        </Text>

        <Touchable onPress={handleNextMonth} hitSlop={8}>
          <Box
            width={36}
            height={36}
            borderRadius="full"
            backgroundColor="inputBackground"
            alignItems="center"
            justifyContent="center"
          >
            <Ionicons name="chevron-forward" size={20} color={theme.colors.textPrimary} />
          </Box>
        </Touchable>
      </Box>

      {/* Weekday Row Header */}
      <Box flexDirection="row" marginBottom="s">
        {WEEKDAYS.map((day) => (
          <Box key={day} flex={1} alignItems="center">
            <Text variant="caption" color="textMuted" fontFamily="Inter_600SemiBold">
              {day}
            </Text>
          </Box>
        ))}
      </Box>

      {/* Days Grid */}
      <Box flexDirection="row" flexWrap="wrap">
        {/* Empty slots before day 1 */}
        {Array.from({ length: firstDayOfWeek }).map((_, i) => (
          <Box key={`empty-${i}`} width="14.28%" height={38} />
        ))}

        {/* Days of current month */}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const selected = isSelectedDay(day);
          const disabled = isDisabledDay(day);

          return (
            <Box key={`day-${day}`} width="14.28%" height={38} alignItems="center" justifyContent="center">
              <Touchable
                disabled={disabled}
                onPress={() => handleSelectDay(day)}
                style={{ width: 34, height: 34, borderRadius: 17, justifyContent: 'center', alignItems: 'center' }}
              >
                <Box
                  width={34}
                  height={34}
                  borderRadius="full"
                  alignItems="center"
                  justifyContent="center"
                  backgroundColor={selected ? 'primary' : 'transparent'}
                  borderWidth={selected ? 2 : 0}
                  borderColor={selected ? 'primaryDark' : 'transparent'}
                >
                  <Text
                    variant="bodySmall"
                    fontFamily={selected ? 'Inter_700Bold' : 'Inter_400Regular'}
                    color={
                      selected
                        ? 'textInverse'
                        : disabled
                        ? 'textMuted'
                        : 'textPrimary'
                    }
                    style={disabled ? { opacity: 0.3 } : undefined}
                  >
                    {day}
                  </Text>
                </Box>
              </Touchable>
            </Box>
          );
        })}
      </Box>

      {/* Quick Preset Shortcuts */}
      <Box marginTop="m" paddingTop="s" borderTopWidth={1} borderColor="border">
        <Text variant="caption" color="textMuted" marginBottom="xs">
          Quick Shortcuts:
        </Text>
        <Box flexDirection="row" flexWrap="wrap" gap="xs">
          {[
            { label: 'Today', weeks: 0 },
            { label: '4 wks ago', weeks: 4 },
            { label: '8 wks ago', weeks: 8 },
            { label: '12 wks ago', weeks: 12 },
          ].map((preset) => (
            <Touchable key={preset.label} onPress={() => applyPresetWeeksAgo(preset.weeks)}>
              <Box
                backgroundColor="primaryLight"
                borderRadius="s"
                paddingHorizontal="s"
                paddingVertical="xs"
              >
                <Text variant="caption" color="primary" fontFamily="Inter_600SemiBold">
                  {preset.label}
                </Text>
              </Box>
            </Touchable>
          ))}
        </Box>
      </Box>

      {/* Selected Date Summary Banner */}
      {validSelectedDate && (
        <Box
          marginTop="m"
          backgroundColor="primaryLight"
          borderRadius="m"
          padding="s"
          alignItems="center"
        >
          <Text variant="bodySmall" color="primaryDark" fontFamily="Inter_600SemiBold">
            📅 {validSelectedDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
            {weeksPregnant ? ` • Approx. Week ${weeksPregnant}` : ''}
          </Text>
        </Box>
      )}
    </Box>
  );
}
