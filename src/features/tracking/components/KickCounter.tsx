import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '@shopify/restyle';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Card, Box, Text } from '@/theme/restyleComponents';
import { Button } from '@/components/ui/Button';
import { Touchable } from '@/components/primitives/Touchable';
import { useTrackingStore } from '@/stores/trackingStore';
import { trackingService } from '../services/trackingService';
import { useAuthStore } from '@/stores/authStore';
import { usePregnancyWeek } from '@/hooks/usePregnancyWeek';
import { type Theme, GRADIENTS } from '@/theme/theme';

export function KickCounter() {
  const theme = useTheme<Theme>();
  const user = useAuthStore((s) => s.user);
  const { currentWeek } = usePregnancyWeek();
  const { kickLogs, addKickLog } = useTrackingStore();

  const [kickCount, setKickCount] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isActive) {
      timerRef.current = setInterval(() => {
        setSeconds((s) => s + 1);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive]);

  const handleTapKick = () => {
    if (!isActive) {
      setIsActive(true);
    }
    setKickCount((c) => c + 1);
  };

  const handleFinishSession = async () => {
    if (kickCount === 0) return;
    setIsActive(false);
    if (timerRef.current) clearInterval(timerRef.current);

    if (user?.id) {
      const log = await trackingService.logKickSession(
        user.id,
        kickCount,
        seconds,
        currentWeek
      );
      addKickLog(log);
    }

    setKickCount(0);
    setSeconds(0);
  };

  const handleResetSession = () => {
    setIsActive(false);
    if (timerRef.current) clearInterval(timerRef.current);
    setKickCount(0);
    setSeconds(0);
  };

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const isGoalReached = kickCount >= 10;

  return (
    <Card
      variant="elevated"
      marginBottom="m"
      style={{ borderRadius: 20, overflow: 'hidden' }}
    >
      {/* Subtle background gradient */}
      <LinearGradient
        colors={[
          theme.colors.surfaceElevated,
          isGoalReached ? theme.colors.secondaryLight : theme.colors.peachSubtle,
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: 20 }}
      />

      <Box flexDirection="row" alignItems="center" justifyContent="space-between" marginBottom="s">
        <Box flexDirection="row" alignItems="center">
          <Text style={{ fontSize: 24, lineHeight: 30, marginRight: 8 }}>🦶</Text>
          <Text variant="h3">Kick Counter</Text>
        </Box>
        <Box
          backgroundColor={isGoalReached ? 'secondaryLight' : 'coralLight'}
          paddingHorizontal="m"
          paddingVertical="xs"
          borderRadius="full"
        >
          <Text
            variant="statLabel"
            color={isGoalReached ? 'secondary' : 'coral'}
            style={{ textTransform: 'uppercase' }}
          >
            TARGET: 10–12
          </Text>
        </Box>
      </Box>

      <Text variant="bodySmall" color="textSecondary" marginBottom="m">
        Count your baby's movements. 10–12 kicks in 2 hours is healthy 🟢
      </Text>

      {/* Large Pulsing Kick Button */}
      <Box alignItems="center" my="m">
        <Touchable onPress={handleTapKick} activeScale={0.88}>
          <Box
            width={130}
            height={130}
            borderRadius="full"
            alignItems="center"
            justifyContent="center"
            style={{ overflow: 'hidden' }}
          >
            <LinearGradient
              colors={
                isGoalReached
                  ? (['#48BB78', '#68D391'])
                  : (GRADIENTS.primary)
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                width: 130,
                height: 130,
                borderRadius: 65,
                alignItems: 'center',
                justifyContent: 'center',
                shadowColor: isGoalReached
                  ? theme.colors.secondary
                  : theme.colors.primary,
                shadowOpacity: 0.3,
                shadowOffset: { width: 0, height: 6 },
                shadowRadius: 16,
                elevation: 8,
              }}
            >
              <Text variant="displayLarge" color="textInverse" style={{ fontSize: 42 }}>
                {kickCount}
              </Text>
              <Text variant="statLabel" color="textInverse" style={{ opacity: 0.85 }}>
                TAP TO COUNT
              </Text>
            </LinearGradient>
          </Box>
        </Touchable>
      </Box>

      {/* Live Session Timer & Controls */}
      {kickCount > 0 && (
        <Box alignItems="center" marginTop="s">
          <Box
            backgroundColor="peachSubtle"
            borderRadius="full"
            paddingHorizontal="l"
            paddingVertical="s"
            marginBottom="m"
          >
            <Text variant="body" fontFamily="Inter_600SemiBold" color="textPrimary">
              ⏱ {formatTimer(seconds)}
            </Text>
          </Box>

          <Box flexDirection="row" gap="s" width="100%">
            <Box flex={1}>
              <Button
                title="Reset"
                onPress={handleResetSession}
                variant="ghost"
                size="sm"
              />
            </Box>
            <Box flex={1}>
              <Button
                title="Save Session 💾"
                onPress={handleFinishSession}
                variant="primary"
                size="sm"
              />
            </Box>
          </Box>
        </Box>
      )}

      {/* Recent Kick Sessions History */}
      {kickLogs.length > 0 && (
        <Box marginTop="m" paddingTop="m" borderTopWidth={1} borderColor="border">
          <Text variant="label" marginBottom="s" color="textSecondary">
            Recent Kick Log History
          </Text>
          <Box gap="xs">
            {kickLogs.slice(0, 3).map((log) => (
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
                  <Ionicons name="sparkles" size={16} color={theme.colors.primary} />
                  <Text variant="bodySmall" marginLeft="xs" fontFamily="Inter_600SemiBold">
                    {log.kick_count} Kicks in {Math.round(log.duration_seconds / 60)} mins
                  </Text>
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
