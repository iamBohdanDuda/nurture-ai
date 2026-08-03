import React, { useState } from 'react';
import { useTheme } from '@shopify/restyle';
import { Ionicons } from '@expo/vector-icons';
import { Card, Box, Text } from '@/theme/restyleComponents';
import { Touchable } from '@/components/primitives/Touchable';
import { Button } from '@/components/ui/Button';
import { useTrackingStore } from '@/stores/trackingStore';
import { trackingService } from '../services/trackingService';
import { useAuthStore } from '@/stores/authStore';
import { usePregnancyWeek } from '@/hooks/usePregnancyWeek';
import { type Theme } from '@/theme/theme';

const COMMON_SYMPTOMS = [
  'Nausea 🤢',
  'Fatigue 😴',
  'Backache ⚡',
  'Heartburn 🔥',
  'Headache 🤕',
  'Cramps 😣',
  'Swelling 🦶',
  'Cravings 🍫',
  'Mood Swings 🎭',
  'Insomnia 🌙',
];

const SEVERITY_LEVELS = [
  { level: 1, label: 'Mild', emoji: '🟢' },
  { level: 2, label: 'Moderate', emoji: '🟡' },
  { level: 3, label: 'Medium', emoji: '🟠' },
  { level: 4, label: 'High', emoji: '🔴' },
  { level: 5, label: 'Severe', emoji: '🚨' },
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
    <Card variant="elevated" marginBottom="m">
      <Box flexDirection="row" alignItems="center" marginBottom="s">
        <Ionicons name="pulse" size={24} color={theme.colors.secondary} />
        <Text variant="h3" marginLeft="s">Log Symptoms & Severity</Text>
      </Box>
      <Text variant="bodySmall" color="textSecondary" marginBottom="m">
        Select a symptom and log its severity (1-5) to build your AI health timeline.
      </Text>

      {/* Symptoms Pills */}
      <Box flexDirection="row" flexWrap="wrap" gap="s" marginBottom="m">
        {COMMON_SYMPTOMS.map((symp) => {
          const isSelected = activeSymptom === symp;
          return (
            <Touchable key={symp} onPress={() => setActiveSymptom(symp)}>
              <Box
                paddingVertical="s"
                paddingHorizontal="m"
                backgroundColor={isSelected ? 'secondary' : 'secondaryLight'}
                borderRadius="full"
                borderWidth={1}
                borderColor="secondary"
              >
                <Text variant="label" color={isSelected ? 'textInverse' : 'textPrimary'}>
                  {symp}
                </Text>
              </Box>
            </Touchable>
          );
        })}
      </Box>

      {/* Severity Selector Drawer */}
      {activeSymptom && (
        <Box
          backgroundColor="primaryBackground"
          borderRadius="m"
          padding="m"
          borderWidth={1}
          borderColor="secondary"
          marginBottom="m"
        >
          <Text variant="bodySmall" fontFamily="Inter_600SemiBold" marginBottom="s">
            Select Severity for {activeSymptom}:
          </Text>

          <Box flexDirection="row" justifyContent="space-between" marginBottom="m">
            {SEVERITY_LEVELS.map((item) => {
              const isChosen = selectedSeverity === item.level;
              return (
                <Touchable key={item.level} onPress={() => setSelectedSeverity(item.level)}>
                  <Box
                    alignItems="center"
                    padding="xs"
                    borderRadius="s"
                    backgroundColor={isChosen ? 'secondaryLight' : 'transparent'}
                  >
                    <Text style={{ fontSize: 20 }}>{item.emoji}</Text>
                    <Text
                      variant="caption"
                      fontFamily={isChosen ? 'Inter_700Bold' : 'Inter_400Regular'}
                      color={isChosen ? 'secondary' : 'textSecondary'}
                    >
                      {item.level}
                    </Text>
                  </Box>
                </Touchable>
              );
            })}
          </Box>

          <Button
            title={`Log ${activeSymptom} (Severity ${selectedSeverity}/5) 📝`}
            onPress={handleSaveSymptom}
            variant="secondary"
            size="sm"
          />
        </Box>
      )}

      {/* Recent Timestamped Symptom Logs */}
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
                backgroundColor="inputBackground"
                borderRadius="s"
                paddingHorizontal="m"
                paddingVertical="s"
              >
                <Box flexDirection="row" alignItems="center">
                  <Text variant="bodySmall" fontFamily="Inter_600SemiBold">
                    {log.symptom_name}
                  </Text>
                  <Box
                    backgroundColor="secondaryLight"
                    borderRadius="s"
                    paddingHorizontal="xs"
                    marginLeft="s"
                  >
                    <Text variant="caption" color="secondary" fontFamily="Inter_700Bold">
                      Sev {log.severity}/5
                    </Text>
                  </Box>
                </Box>
                <Text variant="caption" color="textMuted">
                  {new Date(log.logged_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </Box>
            ))}
          </Box>
        </Box>
      )}
    </Card>
  );
}
