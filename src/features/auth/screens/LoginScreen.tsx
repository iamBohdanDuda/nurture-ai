import React, { useState } from 'react';
import { Screen } from '@/components/layout/Screen';
import { Box, Text } from '@/theme/restyleComponents';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Touchable } from '@/components/primitives/Touchable';
import { useAuth } from '../hooks/useAuth';
import { loginSchema } from '@/utils/validation';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@shopify/restyle';
import { type Theme } from '@/theme/theme';

export function LoginScreen() {
  const theme = useTheme<Theme>();
  const { signIn, loading, error, clearError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleLogin = async () => {
    clearError();
    setFieldErrors({});

    const result = loginSchema.safeParse({ email, password });
    if (!result.success) {
      const errors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as string;
        errors[field] = issue.message;
      });
      setFieldErrors(errors);
      return;
    }

    try {
      await signIn(email, password);
      router.replace('/(tabs)/home');
    } catch {
      // Error is set in the hook
    }
  };

  return (
    <Screen scrollable safeTop backgroundColor="mainBackground">
      <Box flex={1} justifyContent="center" paddingHorizontal="m">
        {/* Header */}
        <Box alignItems="center" marginBottom="2xl">
          <Text variant="h1" color="primary" marginBottom="xs">
            NurtureAI
          </Text>
          <Text variant="bodySmall" textAlign="center">
            Your AI-powered pregnancy companion
          </Text>
        </Box>

        {/* Error banner */}
        {error && (
          <Box
            backgroundColor="error"
            borderRadius="m"
            padding="m"
            marginBottom="m"
          >
            <Text variant="bodySmall" color="textInverse">
              {error}
            </Text>
          </Box>
        )}

        {/* Form */}
        <Input
          label="Email"
          placeholder="you@example.com"
          value={email}
          onChangeText={setEmail}
          error={fieldErrors.email}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          leftIcon={
            <Ionicons name="mail-outline" size={20} color={theme.colors.textMuted} />
          }
        />

        <Input
          label="Password"
          placeholder="••••••••"
          value={password}
          onChangeText={setPassword}
          error={fieldErrors.password}
          secureTextEntry={!showPassword}
          leftIcon={
            <Ionicons name="lock-closed-outline" size={20} color={theme.colors.textMuted} />
          }
        />

        <Button
          title="Sign In"
          onPress={handleLogin}
          loading={loading}
          variant="primary"
          size="lg"
        />

        {/* Register link */}
        <Box
          flexDirection="row"
          justifyContent="center"
          alignItems="center"
          marginTop="l"
        >
          <Text variant="bodySmall">Don't have an account? </Text>
          <Touchable onPress={() => router.push('/(auth)/register')}>
            <Text variant="bodySmall" color="primary" fontFamily="Inter_600SemiBold">
              Sign Up
            </Text>
          </Touchable>
        </Box>
      </Box>
    </Screen>
  );
}
