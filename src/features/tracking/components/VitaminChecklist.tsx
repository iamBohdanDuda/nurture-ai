import React, { useState } from 'react';
import { TextInput, Alert } from 'react-native';
import { useTheme } from '@shopify/restyle';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Card, Box, Text } from '@/theme/restyleComponents';
import { Touchable } from '@/components/primitives/Touchable';
import { Button } from '@/components/ui/Button';
import { useTrackingStore } from '@/stores/trackingStore';
import { trackingService } from '../services/trackingService';
import { useAuthStore } from '@/stores/authStore';
import { type Theme } from '@/theme/theme';

const DEFAULT_VITAMINS = [
  { id: 'prenatal', name: 'Prenatal Multivitamin' },
  { id: 'folic_acid', name: 'Folic Acid' },
  { id: 'iron', name: 'Iron Supplement' },
  { id: 'dha', name: 'DHA / Omega-3' },
];

export function VitaminChecklist() {
  const theme = useTheme<Theme>();
  const user = useAuthStore((s) => s.user);
  const { vitaminsTaken, toggleVitamin, customVitamins, addCustomVitamin, removeCustomVitamin } = useTrackingStore();
  const [newVitaminName, setNewVitaminName] = useState('');

  const allVitamins = [...DEFAULT_VITAMINS, ...customVitamins];

  const handleToggle = (vitaminId: string, vitaminName: string) => {
    toggleVitamin(vitaminId);
    const isAdding = !vitaminsTaken.includes(vitaminId);
    
    if (user?.id && isAdding) {
      trackingService.logVitamin(user.id, vitaminName).catch((err) => {
        console.warn('Failed to sync vitamin log', err);
        toggleVitamin(vitaminId); // undo the tick, it wasn't saved
        Alert.alert('Not saved', 'Could not save this vitamin. Check your connection and try again.');
      });
    }
  };

  const handleAddCustom = () => {
    if (!newVitaminName.trim()) return;
    if (customVitamins.length >= 15) {
      Alert.alert('Limit Reached', 'You can add up to 15 custom vitamins.');
      return;
    }
    const success = addCustomVitamin(newVitaminName);
    if (success) {
      setNewVitaminName('');
    }
  };

  return (
    <Card
      variant="elevated"
      marginBottom="m"
      padding="m"
      style={{ borderRadius: 24, backgroundColor: '#FFFFFF' }}
    >
      <Box flexDirection="row" alignItems="center" justifyContent="space-between" marginBottom="m">
        <Box flexDirection="row" alignItems="center">
          <Box
            width={36}
            height={36}
            borderRadius="full"
            backgroundColor="secondaryLight"
            alignItems="center"
            justifyContent="center"
          >
            <Ionicons name="medkit" size={18} color={theme.colors.secondary} />
          </Box>
          <Text variant="h3" marginLeft="s">Daily Vitamins</Text>
        </Box>
        <Text variant="caption" color="textMuted">
          Custom: {customVitamins.length}/15
        </Text>
      </Box>

      {/* Vitamin Checklist Items */}
      <Box marginBottom="m">
        {allVitamins.map((vit) => {
          const isTaken = vitaminsTaken.includes(vit.id);
          const isCustom = vit.id.startsWith('custom_');

          return (
            <Box key={vit.id} flexDirection="row" alignItems="center" marginBottom="s">
              <Touchable
                style={{ flex: 1 }}
                onPress={() => handleToggle(vit.id, vit.name)}
              >
                <Box
                  flexDirection="row"
                  alignItems="center"
                  paddingVertical="s"
                  paddingHorizontal="m"
                  borderRadius="l"
                  borderWidth={1}
                  style={{
                    backgroundColor: isTaken ? theme.colors.accentLight : theme.colors.surfaceFrosted,
                    borderColor: isTaken ? theme.colors.accent : theme.colors.border,
                    borderRadius: 14,
                  }}
                >
                  <Box
                    width={26}
                    height={26}
                    borderRadius="full"
                    borderWidth={2}
                    alignItems="center"
                    justifyContent="center"
                    marginRight="m"
                    style={{
                      borderColor: isTaken ? theme.colors.accent : theme.colors.textMuted,
                      backgroundColor: isTaken ? theme.colors.accent : 'transparent',
                    }}
                  >
                    {isTaken && <Ionicons name="checkmark" size={16} color="white" />}
                  </Box>
                  <Text
                    variant="body"
                    color={isTaken ? 'textPrimary' : 'textSecondary'}
                    textDecorationLine={isTaken ? 'line-through' : 'none'}
                    flex={1}
                  >
                    {vit.name}
                  </Text>
                </Box>
              </Touchable>

              {isCustom && (
                <Touchable onPress={() => removeCustomVitamin(vit.id)} hitSlop={8} style={{ marginLeft: 8 }}>
                  <Box
                    padding="s"
                    backgroundColor="coralLight"
                    borderRadius="full"
                  >
                    <Ionicons name="trash-outline" size={18} color={theme.colors.coral} />
                  </Box>
                </Touchable>
              )}
            </Box>
          );
        })}
      </Box>

      {/* Add Custom Vitamin */}
      {customVitamins.length < 15 && (
        <Box
          flexDirection="row"
          alignItems="center"
          paddingTop="s"
          borderTopWidth={1}
          borderColor="border"
        >
          <Box
            flex={1}
            borderWidth={1}
            borderColor="border"
            borderRadius="m"
            paddingHorizontal="m"
            marginRight="s"
            backgroundColor="surfaceFrosted"
            style={{ borderRadius: 12 }}
          >
            <TextInput
              style={{
                fontFamily: 'Inter_400Regular',
                fontSize: 14,
                color: theme.colors.textPrimary,
                paddingVertical: 8,
              }}
              placeholder="Add custom vitamin (e.g. B12)"
              placeholderTextColor={theme.colors.textMuted}
              value={newVitaminName}
              onChangeText={setNewVitaminName}
              maxLength={30}
            />
          </Box>
          <Button
            title="+ Add"
            onPress={handleAddCustom}
            variant="primary"
            size="sm"
            disabled={!newVitaminName.trim()}
          />
        </Box>
      )}
    </Card>
  );
}
