import React, { useState, useRef } from 'react';
import { Modal, StyleSheet, Alert, ScrollView } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useTheme } from '@shopify/restyle';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Card, Box, Text } from '@/theme/restyleComponents';
import { Touchable } from '@/components/primitives/Touchable';
import { GradientButton } from '@/components/ui/GradientComponents';
import { useTrackingStore } from '@/stores/trackingStore';
import { trackingService } from '../services/trackingService';
import { useAuthStore } from '@/stores/authStore';
import { type Theme, GRADIENTS } from '@/theme/theme';
import { formatLogTimestamp } from '@/utils/date';
import { FREE_PHOTO_LIMIT } from '@/core/constants';

function showScanError(err: any) {
  if (err?.message === 'free_limit_reached') {
    Alert.alert('Free scans used', `You've used this week's ${FREE_PHOTO_LIMIT} free meal scans. Nurture Pro scans without limits.`, [
      { text: 'Not now', style: 'cancel' },
      { text: 'Upgrade', onPress: () => router.push('/(modals)/paywall') },
    ]);
    return;
  }
  Alert.alert('Analysis Failed', err?.message || 'Could not analyze the meal. Please try again.');
}

export function MealScanner() {
  const theme = useTheme<Theme>();
  const user = useAuthStore((s) => s.user);
  const { todayCalories, mealLogs, addMealLog } = useTrackingStore();
  
  const [permission, requestPermission] = useCameraPermissions();
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const cameraRef = useRef<CameraView>(null);

  const openCamera = async () => {
    if (!permission?.granted) {
      const { granted } = await requestPermission();
      if (!granted) return;
    }
    setIsCameraActive(true);
  };

  const closeCamera = () => {
    setIsCameraActive(false);
    setIsAnalyzing(false);
  };

  const analyzeAndLog = async (base64: string) => {
    if (!user?.id) return;
    const meal = await trackingService.extractMealNutrition(base64);
    const log = await trackingService.logMeal(
      user.id,
      meal.meal_name,
      meal.description,
      meal.calories,
      meal.macros,
      meal.is_pregnancy_safe,
      meal.safety_analysis
    );
    addMealLog(log);
    if (!meal.is_pregnancy_safe) {
      Alert.alert('Pregnancy safety concern', meal.safety_analysis);
    }
  };

  const takePicture = async () => {
    if (!cameraRef.current) return;
    
    setIsAnalyzing(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({
        base64: true,
        quality: 0.5,
      });
      
      if (!photo?.base64 || !user?.id) throw new Error('Failed to take photo');

      await analyzeAndLog(photo.base64);
      closeCamera();
    } catch (err: any) {
      console.warn('Failed to scan meal:', err);
      showScanError(err);
      setIsAnalyzing(false);
    }
  };

  const pickImage = async () => {
    setIsAnalyzing(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.5,
        base64: true,
      });

      if (!result.canceled && result.assets[0].base64 && user?.id) {
        await analyzeAndLog(result.assets[0].base64);
      }
    } catch (err: any) {
      console.warn('Failed to scan meal from gallery:', err);
      showScanError(err);
    } finally {
      setIsAnalyzing(false);
    }
  };


  return (
    <Card
      variant="elevated"
      marginBottom="l"
      style={{ borderRadius: 20, overflow: 'hidden' }}
    >
      {/* Subtle lavender gradient */}
      <LinearGradient
        colors={[theme.colors.surfaceElevated, theme.colors.accentLight]}
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
            colors={['#B794F4', '#9F7AEA']}
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons name="camera" size={18} color="#FFFFFF" />
          </LinearGradient>
        </Box>
        <Text variant="h3" marginLeft="s">Meal Scanner</Text>
      </Box>
      <Text variant="bodySmall" color="textSecondary" marginBottom="m">
        Take a photo to analyze calories, macros, and pregnancy safety.
      </Text>

      <Box flexDirection="row" justifyContent="space-between" alignItems="center" marginBottom="m">
        <Box>
          <Text variant="statValue" color="accent">
            {todayCalories}
          </Text>
          <Text variant="statLabel">
            KCAL LOGGED TODAY
          </Text>
        </Box>
        <Box flexDirection="row" gap="s">
          <Touchable onPress={pickImage} activeScale={0.95} disabled={isAnalyzing}>
            <Box style={{ overflow: 'hidden', borderRadius: 16 }}>
              <GradientButton preset="coral" height={48} borderRadius={16} style={{ paddingHorizontal: 16 }}>
                <Ionicons name="images" size={20} color="#FFFFFF" />
              </GradientButton>
            </Box>
          </Touchable>
          <Touchable onPress={openCamera} activeScale={0.95} disabled={isAnalyzing}>
            <Box style={{ overflow: 'hidden', borderRadius: 16 }}>
              <GradientButton preset="lavender" height={48} borderRadius={16} style={{ paddingHorizontal: 16 }}>
                <Box flexDirection="row" alignItems="center">
                  <Ionicons name="camera" size={20} color="#FFFFFF" />
                  <Text variant="buttonSmall" color="textInverse" marginLeft="s">
                    {isAnalyzing ? "Scanning..." : "Scan Meal"}
                  </Text>
                </Box>
              </GradientButton>
            </Box>
          </Touchable>
        </Box>
      </Box>

      {/* Recent Meal History */}
      {mealLogs.length > 0 && (
        <Box paddingTop="m" borderTopWidth={1} borderColor="border">
          <Box flexDirection="row" justifyContent="space-between" alignItems="center" marginBottom="s">
            <Text variant="label" color="textSecondary">
              Recent Logged Meals
            </Text>
            <Touchable onPress={() => setIsHistoryModalOpen(true)}>
              <Text variant="caption" color="primary" fontFamily="Inter_600SemiBold">
                See All
              </Text>
            </Touchable>
          </Box>
          <Box gap="s">
            {mealLogs.slice(0, 3).map((meal) => (
              <Box
                key={meal.id}
                backgroundColor="peachSubtle"
                borderRadius="m"
                padding="m"
                style={{ borderRadius: 14 }}
              >
                <Box flexDirection="row" justifyContent="space-between" alignItems="flex-start" marginBottom="xs">
                  <Box flexDirection="row" alignItems="center" flex={1} marginRight="s">
                    <Box flexShrink={1}>
                      <Text variant="bodySmall" fontFamily="Inter_700Bold" numberOfLines={1}>
                        {meal.meal_name}
                      </Text>
                    </Box>
                    <Box
                      backgroundColor="secondaryLight"
                      borderRadius="full"
                      paddingHorizontal="s"
                      paddingVertical="xs"
                      marginLeft="s"
                    >
                      <Text variant="caption" color="secondary" fontFamily="Inter_600SemiBold">
                        {meal.calories} kcal
                      </Text>
                    </Box>
                  </Box>
                  <Text variant="caption" color="textMuted">
                    {formatLogTimestamp(meal.logged_at)}
                  </Text>
                </Box>
                {meal.description && (
                  <Text variant="caption" color="textSecondary" numberOfLines={2}>
                    {meal.description}
                  </Text>
                )}
                {meal.is_pregnancy_safe === false && (
                  <Text variant="caption" color="error" fontFamily="Inter_600SemiBold" marginTop="xs" numberOfLines={2}>
                    ⚠️ {meal.safety_analysis}
                  </Text>
                )}
              </Box>
            ))}
          </Box>
        </Box>
      )}

      {/* Full History Modal */}
      <Modal visible={isHistoryModalOpen} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setIsHistoryModalOpen(false)}>
        <Box flex={1} backgroundColor="mainBackground">
          {/* Modal Header */}
          <Box
            paddingHorizontal="m"
            paddingVertical="m"
            borderBottomWidth={1}
            borderColor="border"
            flexDirection="row"
            justifyContent="space-between"
            alignItems="center"
            backgroundColor="surfaceElevated"
          >
            <Box flexDirection="row" alignItems="center">
              <Box
                width={36}
                height={36}
                borderRadius="full"
                backgroundColor="warmSurfaceSoft"
                alignItems="center"
                justifyContent="center"
                marginRight="s"
              >
                <Ionicons name="restaurant" size={18} color={theme.colors.primary} />
              </Box>
              <Box>
                <Text variant="h3" color="textPrimary">Meal History</Text>
                <Text variant="caption" color="textMuted">Logged meals & nutrition scans</Text>
              </Box>
            </Box>

            <Touchable onPress={() => setIsHistoryModalOpen(false)} hitSlop={10} accessibilityLabel="Close meal history">
              <Box
                width={32}
                height={32}
                borderRadius="full"
                backgroundColor="warmSurfaceSoft"
                alignItems="center"
                justifyContent="center"
              >
                <Ionicons name="close" size={18} color={theme.colors.textPrimary} />
              </Box>
            </Touchable>
          </Box>

          <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
            {mealLogs.length === 0 ? (
              <Box alignItems="center" justifyContent="center" paddingVertical="2xl">
                <Box
                  width={56}
                  height={56}
                  borderRadius="full"
                  backgroundColor="warmSurfaceSoft"
                  alignItems="center"
                  justifyContent="center"
                  marginBottom="m"
                >
                  <Ionicons name="nutrition-outline" size={28} color={theme.colors.textMuted} />
                </Box>
                <Text variant="body" fontFamily="Inter_600SemiBold" color="textPrimary">
                  No Meals Logged Yet
                </Text>
                <Text variant="caption" color="textMuted" textAlign="center" marginTop="xs" style={{ maxWidth: 240 }}>
                  Snap a photo of your meal or log nutrition to see your daily breakdown here.
                </Text>
              </Box>
            ) : (
              mealLogs.map((meal) => (
                <Box
                  key={meal.id}
                  backgroundColor="surfaceElevated"
                  borderRadius="xl"
                  padding="m"
                  borderWidth={1}
                  borderColor="border"
                  style={{
                    shadowColor: '#000',
                    shadowOpacity: 0.03,
                    shadowOffset: { width: 0, height: 2 },
                    shadowRadius: 6,
                    elevation: 1,
                  }}
                >
                  <Box flexDirection="row" justifyContent="space-between" alignItems="flex-start" marginBottom="xs">
                    <Box flex={1} marginRight="s">
                      <Text variant="body" fontFamily="Inter_700Bold" color="textPrimary">
                        {meal.meal_name}
                      </Text>
                    </Box>
                    <Text variant="caption" color="textMuted">
                      {formatLogTimestamp(meal.logged_at)}
                    </Text>
                  </Box>

                  <Box
                    backgroundColor="secondaryLight"
                    alignSelf="flex-start"
                    borderRadius="full"
                    paddingHorizontal="s"
                    paddingVertical="xs"
                    marginBottom="s"
                  >
                    <Text variant="caption" color="secondary" fontFamily="Inter_700Bold">
                      {meal.calories} kcal
                    </Text>
                  </Box>

                  {meal.description && (
                    <Text variant="bodySmall" color="textSecondary" marginBottom="s">
                      {meal.description}
                    </Text>
                  )}

                  {meal.is_pregnancy_safe === false && (
                    <Text variant="bodySmall" color="error" fontFamily="Inter_600SemiBold" marginBottom="s">
                      ⚠️ {meal.safety_analysis}
                    </Text>
                  )}

                  {(meal.protein_g !== undefined && meal.protein_g !== null) && (
                    <Box flexDirection="row" gap="m" borderTopWidth={1} borderColor="border" paddingTop="s">
                      <Text variant="caption" color="primary" fontFamily="Inter_600SemiBold">Protein: {meal.protein_g}g</Text>
                      <Text variant="caption" color="accent" fontFamily="Inter_600SemiBold">Carbs: {meal.carbs_g}g</Text>
                      <Text variant="caption" color="gold" fontFamily="Inter_600SemiBold">Fat: {meal.fat_g}g</Text>
                    </Box>
                  )}
                </Box>
              ))
            )}
          </ScrollView>
        </Box>
      </Modal>

      {/* Camera Modal */}
      <Modal visible={isCameraActive} animationType="slide" presentationStyle="fullScreen">
        <Box flex={1} backgroundColor="overlay">
          {isCameraActive && (
            <CameraView
              ref={cameraRef}
              style={StyleSheet.absoluteFillObject}
              facing="back"
            >
              <Box flex={1} justifyContent="space-between" padding="l" paddingVertical="2xl">
                {/* Header Actions */}
                <Box flexDirection="row" justifyContent="flex-end">
                  <Touchable onPress={closeCamera}>
                    <Box
                      backgroundColor="surfaceFrosted"
                      padding="s"
                      borderRadius="full"
                    >
                      <Ionicons name="close" size={32} color={theme.colors.textPrimary} />
                    </Box>
                  </Touchable>
                </Box>

                {/* Shutter / Analyzing */}
                <Box alignItems="center" marginBottom="xl">
                  {isAnalyzing ? (
                    <Box
                      backgroundColor="surfaceFrosted"
                      padding="l"
                      borderRadius="xl"
                    >
                      <Text variant="h3">Analyzing nutrition & safety...</Text>
                    </Box>
                  ) : (
                    <Touchable onPress={takePicture}>
                      <Box
                        width={80}
                        height={80}
                        borderRadius="full"
                        borderWidth={6}
                        borderColor="white"
                        backgroundColor="surfaceFrosted"
                      />
                    </Touchable>
                  )}
                </Box>
              </Box>
            </CameraView>
          )}
        </Box>
      </Modal>
    </Card>
  );
}
