import React, { useState } from 'react';
import { TextInput, Keyboard, Alert } from 'react-native';
import { useTheme } from '@shopify/restyle';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Card, Box, Text } from '@/theme/restyleComponents';
import { Button } from '@/components/ui/Button';
import { useTrackingStore } from '@/stores/trackingStore';
import { trackingService } from '../services/trackingService';
import { useAuthStore } from '@/stores/authStore';
import { type Theme, GRADIENTS } from '@/theme/theme';

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

    if (user?.id) {
      try {
        await trackingService.logWeight(user.id, w, currentWeek);
        logWeight(w);
      } catch (err) {
        console.warn('Failed to save weight log', err);
        Alert.alert('Not saved', 'Could not save your weight. Check your connection and try again.');
      }
    }
    setIsSaving(false);
  };

  return (
    <Card
      variant="elevated"
      marginBottom="m"
      style={{ borderRadius: 20, overflow: 'hidden' }}
    >
      <LinearGradient
        colors={[theme.colors.surfaceElevated, theme.colors.coralLight]}
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
            colors={GRADIENTS.coral}
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons name="scale" size={18} color="#FFFFFF" />
          </LinearGradient>
        </Box>
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
          backgroundColor="surfaceFrosted"
          style={{ borderRadius: 14 }}
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
        <Box
          flexDirection="row"
          alignItems="center"
          marginTop="s"
          backgroundColor="secondaryLight"
          borderRadius="full"
          paddingHorizontal="m"
          paddingVertical="xs"
          alignSelf="flex-start"
        >
          <Ionicons name="checkmark-circle" size={16} color={theme.colors.secondary} />
          <Text variant="caption" color="secondary" fontFamily="Inter_600SemiBold" marginLeft="xs">
            Logged today: {todayWeight} kg
          </Text>
        </Box>
      )}
    </Card>
  );
}
