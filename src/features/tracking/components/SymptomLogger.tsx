import React, { useState } from 'react';
import { useTheme } from '@shopify/restyle';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Card, Box, Text } from '@/theme/restyleComponents';
import { Touchable } from '@/components/primitives/Touchable';
import { Button } from '@/components/ui/Button';
import { useTrackingStore } from '@/stores/trackingStore';
import { trackingService } from '../services/trackingService';
import { useAuthStore } from '@/stores/authStore';
import { usePregnancyWeek } from '@/hooks/usePregnancyWeek';
import { type Theme } from '@/theme/theme';
import { formatLogTimestamp } from '@/utils/date';

const COMMON_SYMPTOMS = [
  { name: 'Nausea 🤢', bg: '#FFF5F7', border: '#FBB6CE' },
  { name: 'Fatigue 😴', bg: '#FAF5FF', border: '#D6BCFA' },
  { name: 'Backache ⚡', bg: '#FFF8F0', border: '#FFD8A8' },
  { name: 'Heartburn 🔥', bg: '#FFF0ED', border: '#FFC4B4' },
  { name: 'Headache 🤕', bg: '#EBF8FF', border: '#90CDF4' },
  { name: 'Cramps 😣', bg: '#F0FFF4', border: '#9AE6B4' },
  { name: 'Swelling 🦶', bg: '#FFFDF0', border: '#FFECB3' },
  { name: 'Cravings 🍫', bg: '#FFF8E1', border: '#FFD54F' },
  { name: 'Mood Swings 🎭', bg: '#E9D8FD', border: '#B794F4' },
  { name: 'Insomnia 🌙', bg: '#E0F7FA', border: '#80DEEA' },
];

const SEVERITY_LEVELS = [
  { level: 1, label: 'Mild', color: '#48BB78' },
  { level: 2, label: 'Moderate', color: '#68D391' },
  { level: 3, label: 'Medium', color: '#ECC94B' },
  { level: 4, label: 'High', color: '#ED8936' },
  { level: 5, label: 'Severe', color: '#E53E3E' },
];

export function SymptomLogger() {
  const theme = useTheme<Theme>();
  const user = useAuthStore((s) => s.user);
  const { currentWeek } = usePregnancyWeek();
  const { symptomLogs, addSymptomLog } = useTrackingStore();

  const [activeSymptom, setActiveSymptom] = useState<string | null>(null);
  const [selectedSeverity, setSelectedSeverity] = useState<number>(2);

  const handleSaveSymptom = async () => {
    if (!activeSymptom) return;
    const symptomNameClean = activeSymptom.split(' ')[0];

    if (user?.id) {
      const log = await trackingService.logSymptom(
        user.id,
        symptomNameClean,
        selectedSeverity,
        currentWeek
      );
      addSymptomLog(log);
    }
    setActiveSymptom(null);
  };

  return (
    <Card
      variant="elevated"
      marginBottom="m"
      style={{ borderRadius: 20, overflow: 'hidden' }}
    >
      <LinearGradient
        colors={[theme.colors.surfaceElevated, theme.colors.secondaryLight]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: 20 }}
      />

      <Box flexDirection="row" alignItems="center" marginBottom="s">
        <Box
          width={36}
          height={36}
          borderRadius="full"
          alignItems="center"
          justifyContent="center"
          style={{ overflow: 'hidden' }}
        >
          <LinearGradient
            colors={['#48BB78', '#38A169']}
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons name="pulse" size={18} color="#FFFFFF" />
          </LinearGradient>
        </Box>
        <Text variant="h3" marginLeft="s">Log Symptoms</Text>
      </Box>
      <Text variant="bodySmall" color="textSecondary" marginBottom="m">
        Select a symptom and log its severity to build your AI health timeline.
      </Text>

      {/* Multi-hue Symptom Pills */}
      <Box flexDirection="row" flexWrap="wrap" gap="s" marginBottom="m">
        {COMMON_SYMPTOMS.map((symp) => {
          const isSelected = activeSymptom === symp.name;
          return (
            <Touchable key={symp.name} onPress={() => setActiveSymptom(symp.name)}>
              <Box
                paddingVertical="s"
                paddingHorizontal="m"
                borderRadius="full"
                borderWidth={isSelected ? 2 : 1}
                style={{
                  backgroundColor: isSelected ? symp.border : symp.bg,
                  borderColor: symp.border,
                }}
              >
                <Text
                  variant="label"
                  style={{
                    color: isSelected ? '#FFFFFF' : theme.colors.textPrimary,
                  }}
                >
                  {symp.name}
                </Text>
              </Box>
            </Touchable>
          );
        })}
      </Box>

      {/* Severity Selector */}
      {activeSymptom && (
        <Box
          backgroundColor="primaryBackground"
          borderRadius="l"
          padding="m"
          borderWidth={1}
          borderColor="border"
          marginBottom="m"
          style={{ borderRadius: 16 }}
        >
          <Text variant="bodySmall" fontFamily="Inter_600SemiBold" marginBottom="s">
            Severity for {activeSymptom}:
          </Text>

          <Box flexDirection="row" justifyContent="space-between" marginBottom="m">
            {SEVERITY_LEVELS.map((item) => {
              const isChosen = selectedSeverity === item.level;
              return (
                <Touchable key={item.level} onPress={() => setSelectedSeverity(item.level)}>
                  <Box
                    alignItems="center"
                    paddingVertical="xs"
                    paddingHorizontal="s"
                    borderRadius="m"
                    style={{
                      backgroundColor: isChosen ? `${item.color}20` : 'transparent',
                    }}
                  >
                    <Box
                      width={isChosen ? 28 : 20}
                      height={isChosen ? 28 : 20}
                      borderRadius="full"
                      style={{
                        backgroundColor: item.color,
                        shadowColor: isChosen ? item.color : 'transparent',
                        shadowOpacity: isChosen ? 0.4 : 0,
                        shadowOffset: { width: 0, height: 2 },
                        shadowRadius: 6,
                      }}
                    />
                    <Text
                      variant="caption"
                      fontFamily={isChosen ? 'Inter_700Bold' : 'Inter_400Regular'}
                      color="textSecondary"
                      marginTop="xs"
                    >
                      {item.level}
                    </Text>
                  </Box>
                </Touchable>
              );
            })}
          </Box>

          <Button
            title={`Log ${activeSymptom.split(' ')[0]} (${selectedSeverity}/5) 📝`}
            onPress={handleSaveSymptom}
            variant="secondary"
            size="sm"
          />
        </Box>
      )}

      {/* Recent Symptom Logs */}
      {symptomLogs.length > 0 && (
        <Box paddingTop="m" borderTopWidth={1} borderColor="border">
          <Text variant="label" marginBottom="s" color="textSecondary">
            Recent Logged Symptoms
          </Text>
          <Box gap="xs">
            {symptomLogs.slice(0, 4).map((log) => (
              <Box
                key={log.id}
                flexDirection="row"
                justifyContent="space-between"
                alignItems="center"
                backgroundColor="peachSubtle"
                borderRadius="m"
                paddingHorizontal="m"
                paddingVertical="s"
              >
                <Box flexDirection="row" alignItems="center">
                  <Text variant="bodySmall" fontFamily="Inter_600SemiBold">
                    {log.symptom_name}
                  </Text>
                  <Box
                    borderRadius="full"
                    paddingHorizontal="s"
                    paddingVertical="xs"
                    marginLeft="s"
                    style={{
                      backgroundColor:
                        SEVERITY_LEVELS[Math.min(log.severity - 1, 4)]?.color + '20',
                    }}
                  >
                    <Text
                      variant="caption"
                      fontFamily="Inter_700Bold"
                      style={{
                        color: SEVERITY_LEVELS[Math.min(log.severity - 1, 4)]?.color,
                      }}
                    >
                      Sev {log.severity}/5
                    </Text>
                  </Box>
                </Box>
                <Text variant="caption" color="textMuted">
                  {formatLogTimestamp(log.logged_at)}
                </Text>
              </Box>
            ))}
          </Box>
        </Box>
      )}
    </Card>
  );
}
