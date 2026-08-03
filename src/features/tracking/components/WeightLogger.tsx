import React, { useState } from 'react';
import { TextInput, Keyboard } from 'react-native';
import { useTheme } from '@shopify/restyle';
import { Ionicons } from '@expo/vector-icons';
import { Card, Box, Text } from '@/theme/restyleComponents';
import { Button } from '@/components/ui/Button';
import { useTrackingStore } from '@/stores/trackingStore';
import { trackingService } from '../services/trackingService';
import { useAuthStore } from '@/stores/authStore';
import { type Theme } from '@/theme/theme';

import { usePregnancyWeek } from '@/hooks/usePregnancyWeek';

export function WeightLogger() {
  const theme = useTheme<Theme>();
  const user = useAuthStore((s) => s.user);
  const { currentWeek } = usePregnancyWeek();
  const { todayWeight, logWeight } = useTrackingStore();
  const [weightInput, setWeightInput] = useState(todayWeight?.toString() ?? '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    const w = parseFloat(weightInput);
    if (isNaN(w) || w <= 0) return;

    setIsSaving(true);
    Keyboard.dismiss();
    logWeight(w);

    if (user?.id) {
      try {
        await trackingService.logWeight(user.id, w, currentWeek);
      } catch (err) {
        console.warn('Failed to sync weight log', err);
      }
    }
    setIsSaving(false);
  };

  return (
    <Card variant="elevated" marginBottom="m">
      <Box flexDirection="row" alignItems="center" marginBottom="s">
        <Ionicons name="scale" size={24} color={theme.colors.primary} />
        <Text variant="h3" marginLeft="s">Weight Log</Text>
      </Box>
      <Text variant="bodySmall" color="textSecondary" marginBottom="m">
        Track your healthy weight gain.
      </Text>

      <Box flexDirection="row" alignItems="center">
        <Box
          flex={1}
          flexDirection="row"
          alignItems="center"
          borderWidth={1}
          borderColor="border"
          borderRadius="m"
          paddingHorizontal="m"
          marginRight="s"
        >
          <TextInput
            style={{
              flex: 1,
              fontFamily: 'Inter_400Regular',
              fontSize: 16,
              color: theme.colors.textPrimary,
              paddingVertical: 12,
            }}
            placeholder="e.g. 68.5"
            placeholderTextColor={theme.colors.textMuted}
            keyboardType="numeric"
            value={weightInput}
            onChangeText={setWeightInput}
            maxLength={5}
          />
          <Text variant="label" color="textSecondary">kg</Text>
        </Box>
        <Button
          variant="primary"
          title="Save"
          onPress={handleSave}
          loading={isSaving}
          disabled={!weightInput || isSaving}
        />
      </Box>

      {todayWeight !== null && (
        <Text variant="caption" color="success" marginTop="s">
          ✓ Logged today: {todayWeight} kg
        </Text>
      )}
    </Card>
  );
}
