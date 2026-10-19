import React, { useState, useMemo } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@shopify/restyle';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  isSameMonth,
  addMonths,
  subMonths,
  differenceInDays,
  differenceInWeeks,
  addDays,
  parseISO,
  isValid,
} from 'date-fns';

import { Box, Text } from '@/theme/restyleComponents';
import { type Theme, GRADIENTS } from '@/theme/theme';
import { usePregnancyWeek } from '@/hooks/usePregnancyWeek';
import { useAuthStore } from '@/stores/authStore';
import { useTrackingStore } from '@/stores/trackingStore';
import { getWeekInfo } from '@/utils/pregnancy';
import { PREGNANCY_TOTAL_WEEKS } from '@/core/constants';

// Trimester styling presets
const TRIMESTER_THEMES = {
  1: {
    name: '1st Trimester',
    weeks: 'Weeks 1–12',
    bg: '#F3E8FF',
    border: '#D8B4FE',
    text: '#6B21A8',
    dot: '#9333EA',
    description: 'Embryo formation & early organ development',
  },
  2: {
    name: '2nd Trimester',
    weeks: 'Weeks 13–27',
    bg: '#FFEDD5',
    border: '#FDBA74',
    text: '#9A3412',
    dot: '#EA580C',
    description: 'Rapid growth, movement & anatomy development',
  },
  3: {
    name: '3rd Trimester',
    weeks: 'Weeks 28–40',
    bg: '#FCE7F3',
    border: '#F472B6',
    text: '#9D174D',
    dot: '#DB2777',
    description: 'Lung maturity, nesting & birth preparation',
  },
  due: {
    name: 'Due Date',
    weeks: 'Week 40',
    bg: '#FEF08A',
    border: '#FACC15',
    text: '#854D0E',
    dot: '#CA8A04',
    description: 'Baby Arrival Goal Day! 🎉',
  },
};

// Medical and clinical prenatal milestones
interface PrenatalMilestone {
  id: string;
  startWeek: number;
  endWeek: number;
  title: string;
  category: 'ultrasound' | 'lab' | 'visit' | 'goal';
  description: string;
  recommendedWeek: string;
}

const PRENATAL_MILESTONES: PrenatalMilestone[] = [
  {
    id: 'm1',
    startWeek: 8,
    endWeek: 10,
    title: 'First Prenatal Visit & Dating Scan',
    category: 'ultrasound',
    description: 'Confirms viable pregnancy, checks fetal heartbeat, and sets official due date.',
    recommendedWeek: 'Weeks 8–10',
  },
  {
    id: 'm2',
    startWeek: 11,
    endWeek: 14,
    title: 'Nuchal Translucency (NT) & Early Screen',
    category: 'lab',
    description: 'Screens for chromosomal conditions (Down syndrome, Trisomy 18) alongside blood screening.',
    recommendedWeek: 'Weeks 11–13',
  },
  {
    id: 'm3',
    startWeek: 18,
    endWeek: 22,
    title: 'Mid-Pregnancy Anatomy Ultrasound',
    category: 'ultrasound',
    description: 'Comprehensive head-to-toe examination of baby organs, brain, heart, spine, and optional gender reveal.',
    recommendedWeek: 'Weeks 18–22',
  },
  {
    id: 'm4',
    startWeek: 24,
    endWeek: 28,
    title: 'Glucose Tolerance Screening',
    category: 'lab',
    description: 'Evaluates blood sugar regulation to screen for gestational diabetes.',
    recommendedWeek: 'Weeks 24–28',
  },
  {
    id: 'm5',
    startWeek: 28,
    endWeek: 28,
    title: 'Rh Antibody Screen & Tdap Booster',
    category: 'lab',
    description: 'Protective antibody checks for Rh-negative moms; whooping cough booster to pass immunity to baby.',
    recommendedWeek: 'Week 28',
  },
  {
    id: 'm6',
    startWeek: 32,
    endWeek: 34,
    title: 'Third Trimester Growth & Position Check',
    category: 'ultrasound',
    description: 'Monitors baby growth velocity, amniotic fluid volume, and head-down positioning.',
    recommendedWeek: 'Weeks 32–34',
  },
  {
    id: 'm7',
    startWeek: 35,
    endWeek: 37,
    title: 'Group B Strep (GBS) Screening & Weekly Care',
    category: 'lab',
    description: 'Routine swab test; prenatal checkups increase to weekly until labor starts.',
    recommendedWeek: 'Weeks 36–37',
  },
  {
    id: 'm8',
    startWeek: 40,
    endWeek: 40,
    title: 'Expected Due Date · Baby Arrival Goal',
    category: 'goal',
    description: 'The big day! Full term pregnancy completion. Monitor labor signs (regular contractions, water release).',
    recommendedWeek: 'Week 40',
  },
];

export function PregnancyCalendarScreen() {
  const theme = useTheme<Theme>();
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);
  const { currentWeek, dueDate, progress, daysRemaining, trimester } = usePregnancyWeek();

  // Tracking data for calendar activity dots
  const hydrationLogs = useTrackingStore((s) => s.hydrationLogs);
  const symptomLogs = useTrackingStore((s) => s.symptomLogs);
  const kickLogs = useTrackingStore((s) => s.kickLogs);

  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // Pregnancy start date
  const startDate = useMemo(() => {
    if (user?.pregnancy_start_date) {
      const parsed = parseISO(user.pregnancy_start_date);
      if (isValid(parsed)) return parsed;
    }
    // Fallback: derive start date from current week
    return addDays(new Date(), -(currentWeek * 7));
  }, [user?.pregnancy_start_date, currentWeek]);

  // Actual or estimated due date
  const calculatedDueDate = useMemo(() => {
    if (dueDate && isValid(dueDate)) return dueDate;
    return addDays(startDate, PREGNANCY_TOTAL_WEEKS * 7);
  }, [dueDate, startDate]);

  // Gestational calculation for any date
  const getGestationalInfoForDate = (date: Date) => {
    const totalDays = differenceInDays(date, startDate);
    if (totalDays < 0) {
      return { isBefore: true, week: 0, day: 0, trimester: null, isDueDate: false };
    }
    const isDue = isSameDay(date, calculatedDueDate);
    const week = Math.floor(totalDays / 7) + 1;
    const day = (totalDays % 7) + 1;
    let t: 1 | 2 | 3 | null = null;
    if (week <= 12) t = 1;
    else if (week <= 27) t = 2;
    else if (week <= 42) t = 3;

    return {
      isBefore: false,
      isAfter: week > 42,
      week: Math.min(week, 42),
      day,
      trimester: t,
      isDueDate: isDue,
      totalDays,
    };
  };

  // Activity check for any date
  const hasActivityOnDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const hasWater = hydrationLogs.some((h) => h.logged_at?.startsWith(dateStr));
    const hasSymptoms = symptomLogs.some((s) => s.logged_at?.startsWith(dateStr));
    const hasKicks = kickLogs.some((k) => k.logged_at?.startsWith(dateStr));
    return hasWater || hasSymptoms || hasKicks;
  };

  // Selected date info
  const selectedInfo = useMemo(() => {
    return getGestationalInfoForDate(selectedDate);
  }, [selectedDate, startDate, calculatedDueDate]);

  const selectedWeekInfo = useMemo(() => {
    const w = selectedInfo.week || currentWeek || 4;
    return getWeekInfo(w);
  }, [selectedInfo.week, currentWeek]);

  // Calendar matrix calculation into rows of 7 days
  const calendarWeeks = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

    // Weekday of monthStart (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
    // We display Mon-Sun (1 = Monday, 7 = Sunday)
    const startDayOfWeek = monthStart.getDay();
    // Convert so Monday = 0, Sunday = 6
    const offset = (startDayOfWeek + 6) % 7;

    const allSlots: (Date | null)[] = [
      ...Array.from({ length: offset }, () => null),
      ...days,
    ];

    // Pad trailing days to complete the 7-day row
    const remainder = allSlots.length % 7;
    if (remainder > 0) {
      const trailingPad = 7 - remainder;
      for (let i = 0; i < trailingPad; i++) {
        allSlots.push(null);
      }
    }

    // Split into arrays of exactly 7 items per week
    const weeks: (Date | null)[][] = [];
    for (let i = 0; i < allSlots.length; i += 7) {
      weeks.push(allSlots.slice(i, i + 7));
    }
    return weeks;
  }, [currentMonth]);

  const currentWeekInfo = getWeekInfo(currentWeek);

  return (
    <Box flex={1} backgroundColor="mainBackground">
      {/* Top Header */}
      <Box
        paddingTop="l"
        paddingHorizontal="m"
        paddingBottom="m"
        backgroundColor="surfaceElevated"
        borderBottomWidth={1}
        borderColor="border"
        style={{ paddingTop: Math.max(insets.top, 16) }}
      >
        <Box flexDirection="row" alignItems="center">
          <TouchableOpacity
            onPress={() => router.back()}
            style={[styles.closeButton, { marginRight: 12 }]}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            accessibilityLabel="Close calendar"
          >
            <Ionicons name="close" size={20} color={theme.colors.textPrimary} />
          </TouchableOpacity>

          <Box
            width={38}
            height={38}
            borderRadius="full"
            backgroundColor="accentLight"
            alignItems="center"
            justifyContent="center"
            marginRight="s"
          >
            <Ionicons name="calendar" size={18} color={theme.colors.accent} />
          </Box>
          <Box flex={1}>
            <Text variant="h2" color="textPrimary">
              Pregnancy Calendar
            </Text>
            <Text variant="caption" color="textMuted">
              Your 40-Week Journey & Milestones
            </Text>
          </Box>
        </Box>
      </Box>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 24) + 32 }}
      >
        {/* Goal Hero Card */}
        <Box paddingHorizontal="m" paddingTop="m">
          <LinearGradient
            colors={GRADIENTS.primary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroCard}
          >
            {/* Goal Row */}
            <Box flexDirection="row" alignItems="center" justifyContent="space-between" marginBottom="s">
              <Box
                flexDirection="row"
                alignItems="center"
                backgroundColor="surfaceFrosted"
                paddingHorizontal="s"
                paddingVertical="xs"
                borderRadius="full"
              >
                <Ionicons name="flag" size={13} color="#9D174D" style={{ marginRight: 5 }} />
                <Text variant="caption" fontFamily="Inter_700Bold" color="primaryDark" style={{ letterSpacing: 0.5 }}>
                  GOAL: BABY ARRIVAL
                </Text>
              </Box>

              <Box
                style={{ backgroundColor: 'rgba(255,255,255,0.25)' }}
                paddingHorizontal="s"
                paddingVertical="xs"
                borderRadius="full"
              >
                <Text variant="caption" fontFamily="Inter_600SemiBold" color="textInverse">
                  {daysRemaining > 0 ? `${daysRemaining} days remaining` : 'Due date reached!'}
                </Text>
              </Box>
            </Box>

            {/* Current Stage */}
            <Text variant="h1" color="textInverse" style={{ fontSize: 26, lineHeight: 32 }}>
              Week {currentWeek} · {currentWeekInfo.fruitName} {currentWeekInfo.fruitEmoji}
            </Text>

            <Text variant="bodySmall" color="textInverse" style={{ opacity: 0.9, marginTop: 4 }}>
              Due Date: {format(calculatedDueDate, 'MMMM d, yyyy')} ({trimester === 1 ? '1st' : trimester === 2 ? '2nd' : '3rd'} Trimester)
            </Text>

            {/* Progress Bar to Goal */}
            <Box marginTop="m">
              <Box flexDirection="row" justifyContent="space-between" alignItems="center" marginBottom="xs">
                <Text variant="caption" color="textInverse" style={{ opacity: 0.85 }}>
                  Journey Progress to Goal
                </Text>
                <Text variant="caption" fontFamily="Inter_700Bold" color="textInverse">
                  {Math.round(progress)}%
                </Text>
              </Box>
              <Box height={8} style={{ backgroundColor: 'rgba(255,255,255,0.3)' }} borderRadius="full" overflow="hidden">
                <Box
                  height="100%"
                  backgroundColor="white"
                  borderRadius="full"
                  style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                />
              </Box>
            </Box>
          </LinearGradient>
        </Box>

        {/* Trimester Period Legend */}
        <Box paddingHorizontal="m" marginTop="m">
          <Text variant="bodySmall" fontFamily="Inter_600SemiBold" color="textSecondary" marginBottom="s">
            Pregnancy Periods & Color Guide
          </Text>
          <Box flexDirection="row" flexWrap="wrap" gap="xs">
            <Box
              flexDirection="row"
              alignItems="center"
              backgroundColor="surfaceElevated"
              paddingHorizontal="s"
              paddingVertical="xs"
              borderRadius="s"
              borderWidth={1}
              borderColor="border"
            >
              <Box width={10} height={10} borderRadius="full" style={{ backgroundColor: TRIMESTER_THEMES[1].dot }} marginRight="xs" />
              <Text variant="caption" color="textPrimary" fontFamily="Inter_600SemiBold">
                1st Trim (W1–12)
              </Text>
            </Box>

            <Box
              flexDirection="row"
              alignItems="center"
              backgroundColor="surfaceElevated"
              paddingHorizontal="s"
              paddingVertical="xs"
              borderRadius="s"
              borderWidth={1}
              borderColor="border"
            >
              <Box width={10} height={10} borderRadius="full" style={{ backgroundColor: TRIMESTER_THEMES[2].dot }} marginRight="xs" />
              <Text variant="caption" color="textPrimary" fontFamily="Inter_600SemiBold">
                2nd Trim (W13–27)
              </Text>
            </Box>

            <Box
              flexDirection="row"
              alignItems="center"
              backgroundColor="surfaceElevated"
              paddingHorizontal="s"
              paddingVertical="xs"
              borderRadius="s"
              borderWidth={1}
              borderColor="border"
            >
              <Box width={10} height={10} borderRadius="full" style={{ backgroundColor: TRIMESTER_THEMES[3].dot }} marginRight="xs" />
              <Text variant="caption" color="textPrimary" fontFamily="Inter_600SemiBold">
                3rd Trim (W28–40)
              </Text>
            </Box>

            <Box
              flexDirection="row"
              alignItems="center"
              backgroundColor="surfaceElevated"
              paddingHorizontal="s"
              paddingVertical="xs"
              borderRadius="s"
              borderWidth={1}
              borderColor="border"
            >
              <Ionicons name="star" size={12} color="#CA8A04" style={{ marginRight: 4 }} />
              <Text variant="caption" color="textPrimary" fontFamily="Inter_600SemiBold">
                Due Date
              </Text>
            </Box>
          </Box>
        </Box>

        {/* Interactive Month Calendar Section */}
        <Box paddingHorizontal="m" marginTop="m">
          <Box
            backgroundColor="surfaceElevated"
            borderRadius="xl"
            padding="m"
            borderWidth={1}
            borderColor="border"
            style={styles.calendarCard}
          >
            {/* Month Switcher Header */}
            <Box flexDirection="row" alignItems="center" justifyContent="space-between" marginBottom="m">
              <TouchableOpacity
                onPress={() => setCurrentMonth(subMonths(currentMonth, 1))}
                style={styles.navButton}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                accessibilityLabel="Previous month"
              >
                <Ionicons name="chevron-back" size={20} color={theme.colors.textPrimary} />
              </TouchableOpacity>

              <Box alignItems="center">
                <Text variant="h3" color="textPrimary" fontFamily="Inter_700Bold">
                  {format(currentMonth, 'MMMM yyyy')}
                </Text>
                {isSameMonth(currentMonth, new Date()) && (
                  <Text variant="caption" color="primary" fontFamily="Inter_600SemiBold">
                    Current Month
                  </Text>
                )}
              </Box>

              <Box flexDirection="row" alignItems="center">
                <TouchableOpacity
                  onPress={() => {
                    const today = new Date();
                    setCurrentMonth(today);
                    setSelectedDate(today);
                  }}
                  style={styles.todayButton}
                  accessibilityLabel="Jump to today"
                >
                  <Text variant="caption" color="primary" fontFamily="Inter_600SemiBold">
                    Today
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setCurrentMonth(addMonths(currentMonth, 1))}
                  style={styles.navButton}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  accessibilityLabel="Next month"
                >
                  <Ionicons name="chevron-forward" size={20} color={theme.colors.textPrimary} />
                </TouchableOpacity>
              </Box>
            </Box>

            {/* Days of Week Header */}
            <View style={styles.weekHeaderRow}>
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, idx) => (
                <View key={`dow-${idx}`} style={styles.weekHeaderCell}>
                  <Text variant="caption" color="textMuted" fontFamily="Inter_600SemiBold">
                    {day}
                  </Text>
                </View>
              ))}
            </View>

            {/* Calendar Weeks Matrix */}
            <View style={styles.weeksContainer}>
              {calendarWeeks.map((week, weekIdx) => (
                <View key={`week-${weekIdx}`} style={styles.weekRow}>
                  {week.map((date, dayIdx) => {
                    if (!date) {
                      return <View key={`empty-${weekIdx}-${dayIdx}`} style={styles.dayCellEmpty} />;
                    }

                    const isSelected = isSameDay(date, selectedDate);
                    const isToday = isSameDay(date, new Date());
                    const gest = getGestationalInfoForDate(date);
                    const hasActivity = hasActivityOnDate(date);

                    // Determine period style
                    let cellBg = theme.colors.mainBackground;
                    let cellTextColor = theme.colors.textPrimary;
                    let borderColor = 'transparent';

                    if (gest.isDueDate) {
                      cellBg = TRIMESTER_THEMES.due.bg;
                      cellTextColor = TRIMESTER_THEMES.due.text;
                      borderColor = TRIMESTER_THEMES.due.border;
                    } else if (gest.trimester === 1) {
                      cellBg = TRIMESTER_THEMES[1].bg;
                      cellTextColor = TRIMESTER_THEMES[1].text;
                    } else if (gest.trimester === 2) {
                      cellBg = TRIMESTER_THEMES[2].bg;
                      cellTextColor = TRIMESTER_THEMES[2].text;
                    } else if (gest.trimester === 3) {
                      cellBg = TRIMESTER_THEMES[3].bg;
                      cellTextColor = TRIMESTER_THEMES[3].text;
                    }

                    return (
                      <TouchableOpacity
                        key={date.toISOString()}
                        onPress={() => setSelectedDate(date)}
                        activeOpacity={0.7}
                        style={[
                          styles.dayCell,
                          {
                            backgroundColor: cellBg,
                            borderColor: isSelected
                              ? theme.colors.primaryDark
                              : isToday
                              ? theme.colors.primary
                              : borderColor,
                            borderWidth: isSelected ? 2 : isToday ? 1.5 : gest.isDueDate ? 1 : 0,
                          },
                        ]}
                      >
                        {/* Due Date Star */}
                        {gest.isDueDate && (
                          <Ionicons
                            name="star"
                            size={10}
                            color="#CA8A04"
                            style={{ position: 'absolute', top: 2, right: 3 }}
                          />
                        )}

                        {/* Date Number */}
                        <Text
                          style={[
                            styles.dayNumber,
                            {
                              color: isToday ? theme.colors.primaryDark : cellTextColor,
                              fontWeight: isToday || isSelected ? '700' : '600',
                            },
                          ]}
                        >
                          {format(date, 'd')}
                        </Text>

                        {/* Gestational Week indicator for Mondays */}
                        {gest.week > 0 && gest.day === 1 && !gest.isDueDate && (
                          <Text style={[styles.weekLabel, { color: cellTextColor }]}>
                            W{gest.week}
                          </Text>
                        )}

                        {/* Today Pill or Dot */}
                        {isToday && (
                          <View style={[styles.todayIndicator, { backgroundColor: theme.colors.primary }]} />
                        )}

                        {/* Logged Health Activity Dot */}
                        {hasActivity && !isToday && (
                          <View style={[styles.activityDot, { backgroundColor: theme.colors.accent }]} />
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ))}
            </View>
          </Box>
        </Box>

        {/* Selected Day Inspector & Milestones */}
        <Box paddingHorizontal="m" marginTop="m">
          <Box
            backgroundColor="surfaceElevated"
            borderRadius="l"
            padding="m"
            borderWidth={1}
            borderColor="border"
            style={styles.inspectorCard}
          >
            {/* Header: Date + Gestational Badge */}
            <Box flexDirection="row" alignItems="center" justifyContent="space-between" marginBottom="s">
              <Box flex={1}>
                <Text variant="caption" color="textMuted">
                  {isSameDay(selectedDate, new Date()) ? 'TODAY' : 'SELECTED DATE'}
                </Text>
                <Text variant="h3" color="textPrimary" fontFamily="Inter_700Bold">
                  {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                </Text>
              </Box>

              {selectedInfo.week > 0 && (
                <Box
                  backgroundColor={
                    selectedInfo.trimester === 1
                      ? 'accentLight'
                      : selectedInfo.trimester === 2
                      ? 'peachSubtle'
                      : 'primaryLight'
                  }
                  paddingHorizontal="s"
                  paddingVertical="xs"
                  borderRadius="m"
                >
                  <Text
                    variant="caption"
                    fontFamily="Inter_700Bold"
                    color={
                      selectedInfo.trimester === 1
                        ? 'accent'
                        : selectedInfo.trimester === 2
                        ? 'coral'
                        : 'primaryDark'
                    }
                  >
                    Week {selectedInfo.week} · D{selectedInfo.day}
                  </Text>
                </Box>
              )}
            </Box>

            {/* Stage Description & Baby Size */}
            {selectedInfo.week > 0 && (
              <Box
                backgroundColor="mainBackground"
                borderRadius="m"
                padding="m"
                marginTop="xs"
                marginBottom="s"
              >
                <Box flexDirection="row" alignItems="center" marginBottom="xs">
                  <Text style={{ fontSize: 22, marginRight: 8 }}>{selectedWeekInfo.fruitEmoji}</Text>
                  <Box flex={1}>
                    <Text variant="body" fontFamily="Inter_600SemiBold" color="textPrimary">
                      Baby is a {selectedWeekInfo.fruitName} ({selectedWeekInfo.babyLength}, {selectedWeekInfo.babyWeight})
                    </Text>
                    <Text variant="caption" color="textSecondary">
                      {selectedWeekInfo.description}
                    </Text>
                  </Box>
                </Box>
              </Box>
            )}

            {/* Distance to Goal */}
            <Box flexDirection="row" alignItems="center" marginTop="xs" marginBottom="m">
              <Ionicons name="flag-outline" size={16} color={theme.colors.primary} style={{ marginRight: 6 }} />
              <Text variant="bodySmall" color="textSecondary">
                {differenceInDays(calculatedDueDate, selectedDate) > 0
                  ? `${differenceInDays(calculatedDueDate, selectedDate)} days until Baby Arrival Goal`
                  : isSameDay(selectedDate, calculatedDueDate)
                  ? '🎉 Due Date reached!'
                  : `${Math.abs(differenceInDays(calculatedDueDate, selectedDate))} days past due date`}
              </Text>
            </Box>

            {/* Ask AI Action Button */}
            <TouchableOpacity
              onPress={() => {
                router.back();
                setTimeout(() => {
                  router.push('/(tabs)/chat');
                }, 150);
              }}
              activeOpacity={0.85}
            >
              <Box
                flexDirection="row"
                alignItems="center"
                justifyContent="center"
                backgroundColor="accentLight"
                paddingVertical="s"
                paddingHorizontal="m"
                borderRadius="m"
              >
                <Ionicons name="sparkles" size={16} color={theme.colors.accent} style={{ marginRight: 6 }} />
                <Text variant="bodySmall" fontFamily="Inter_600SemiBold" color="accent">
                  Ask NurtureAI about Week {selectedInfo.week || currentWeek}
                </Text>
              </Box>
            </TouchableOpacity>
          </Box>
        </Box>

        {/* Milestone Roadmap & Medical Checklist (Our Added Value!) */}
        <Box paddingHorizontal="m" marginTop="l">
          <Box flexDirection="row" alignItems="center" justifyContent="space-between" marginBottom="s">
            <Box>
              <Text variant="h3" color="textPrimary" fontFamily="Inter_700Bold">
                Clinical Milestones & Scans
              </Text>
              <Text variant="caption" color="textMuted">
                Key medical checkups throughout your 40 weeks
              </Text>
            </Box>
          </Box>

          {PRENATAL_MILESTONES.map((item) => {
            const isCompleted = currentWeek > item.endWeek;
            const isCurrent = currentWeek >= item.startWeek && currentWeek <= item.endWeek;

            return (
              <Box
                key={item.id}
                backgroundColor="surfaceElevated"
                borderRadius="m"
                padding="m"
                marginBottom="s"
                borderWidth={1}
                borderColor={isCurrent ? 'primary' : 'border'}
                style={{
                  borderLeftWidth: 4,
                  borderLeftColor: isCompleted
                    ? theme.colors.success
                    : isCurrent
                    ? theme.colors.primary
                    : theme.colors.border,
                }}
              >
                <Box flexDirection="row" alignItems="center" justifyContent="space-between" marginBottom="xs">
                  <Box flexDirection="row" alignItems="center" flex={1} marginRight="s">
                    <Ionicons
                      name={
                        isCompleted
                          ? 'checkmark-circle'
                          : isCurrent
                          ? 'time'
                          : 'radio-button-off'
                      }
                      size={18}
                      color={
                        isCompleted
                          ? theme.colors.success
                          : isCurrent
                          ? theme.colors.primary
                          : theme.colors.textMuted
                      }
                      style={{ marginRight: 6 }}
                    />
                    <Text
                      variant="body"
                      fontFamily="Inter_600SemiBold"
                      color={isCompleted ? 'textSecondary' : 'textPrimary'}
                      style={{ flexShrink: 1 }}
                    >
                      {item.title}
                    </Text>
                  </Box>

                  <Box
                    backgroundColor={
                      isCompleted
                        ? 'secondaryLight'
                        : isCurrent
                        ? 'primaryLight'
                        : 'inputBackground'
                    }
                    paddingHorizontal="xs"
                    paddingVertical="xs"
                    borderRadius="s"
                  >
                    <Text
                      style={{
                        fontSize: 10,
                        fontWeight: '700',
                        color: isCompleted
                          ? theme.colors.success
                          : isCurrent
                          ? theme.colors.primaryDark
                          : theme.colors.textMuted,
                      }}
                    >
                      {isCompleted ? 'Completed' : isCurrent ? 'CURRENT' : item.recommendedWeek}
                    </Text>
                  </Box>
                </Box>

                <Text variant="caption" color="textMuted" marginLeft="l">
                  {item.description}
                </Text>
              </Box>
            );
          })}
        </Box>
      </ScrollView>
    </Box>
  );
}

const styles = StyleSheet.create({
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F5F5',
  },
  heroCard: {
    borderRadius: 20,
    padding: 20,
    shadowColor: '#ED64A6',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 16,
    elevation: 3,
  },
  calendarCard: {
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 10,
    elevation: 2,
  },
  navButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  todayButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    backgroundColor: '#FFF5F7',
    marginRight: 6,
  },
  weekHeaderRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekHeaderCell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2,
  },
  weeksContainer: {
    gap: 4,
  },
  weekRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dayCell: {
    flex: 1,
    height: 48,
    marginHorizontal: 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  dayCellEmpty: {
    flex: 1,
    height: 48,
    marginHorizontal: 2,
  },
  dayNumber: {
    fontSize: 13,
  },
  weekLabel: {
    fontSize: 8,
    fontWeight: '700',
    opacity: 0.75,
  },
  todayIndicator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 2,
  },
  activityDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 2,
  },
  inspectorCard: {
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 10,
    elevation: 2,
  },
});
