import React, { useState, useRef } from 'react';
import { Modal, StyleSheet, Alert, ScrollView } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
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

  const takePicture = async () => {
    if (!cameraRef.current) return;
    
    setIsAnalyzing(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({
        base64: true,
        quality: 0.5,
      });
      
      if (!photo?.base64 || !user?.id) throw new Error('Failed to take photo');

      // Call AI Edge Function for Meal Nutrition & Description
      const { calories, description, meal_name, macros } = await trackingService.extractMealNutrition(
        user.id,
        photo.base64
      );

      const log = await trackingService.logMeal(
        user.id,
        meal_name,
        description,
        calories,
        macros,
        true,
        'Safe & nutritious during pregnancy.'
      );

      addMealLog(log);
      closeCamera();
    } catch (err: any) {
      console.warn('Failed to scan meal:', err);
      Alert.alert('Analysis Failed', err.message || 'Could not analyze the meal. Please try again.');
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
        const base64 = result.assets[0].base64;
        
        const { calories, description, meal_name, macros } = await trackingService.extractMealNutrition(
          user.id,
          base64
        );

        const log = await trackingService.logMeal(
          user.id,
          meal_name,
          description,
          calories,
          macros,
          true,
          'Safe & nutritious during pregnancy.'
        );

        addMealLog(log);
      }
    } catch (err: any) {
      console.warn('Failed to scan meal from gallery:', err);
      Alert.alert('Analysis Failed', err.message || 'Could not analyze the meal. Please try again.');
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
              </Box>
            ))}
          </Box>
        </Box>
      )}

      {/* Full History Modal */}
      <Modal visible={isHistoryModalOpen} animationType="slide" presentationStyle="pageSheet">
        <Box flex={1} backgroundColor="mainBackground">
          <Box padding="m" borderBottomWidth={1} borderColor="border" flexDirection="row" justifyContent="space-between" alignItems="center" paddingTop="2xl">
            <Text variant="h3">Meal History</Text>
            <Touchable onPress={() => setIsHistoryModalOpen(false)}>
              <Ionicons name="close-circle" size={28} color={theme.colors.textMuted} />
            </Touchable>
          </Box>
          <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
            {mealLogs.map((meal) => (
              <Box
                key={meal.id}
                backgroundColor="surfaceElevated"
                borderRadius="m"
                padding="m"
                borderWidth={1}
                borderColor="border"
              >
                <Box flexDirection="row" justifyContent="space-between" alignItems="flex-start" marginBottom="xs">
                  <Box flex={1} marginRight="s">
                    <Text variant="body" fontFamily="Inter_700Bold">
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
                  <Text variant="caption" color="secondary" fontFamily="Inter_600SemiBold">
                    {meal.calories} kcal
                  </Text>
                </Box>
                {meal.description && (
                  <Text variant="bodySmall" color="textSecondary" marginBottom="s">
                    {meal.description}
                  </Text>
                )}
                {(meal.protein_g !== undefined && meal.protein_g !== null) && (
                  <Box flexDirection="row" gap="m" borderTopWidth={1} borderColor="border" paddingTop="s">
                    <Text variant="caption" color="primary">Protein: {meal.protein_g}g</Text>
                    <Text variant="caption" color="accent">Carbs: {meal.carbs_g}g</Text>
                    <Text variant="caption" color="gold">Fat: {meal.fat_g}g</Text>
                  </Box>
                )}
              </Box>
            ))}
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
