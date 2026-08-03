import React, { useState } from 'react';
import { Screen } from '@/components/layout/Screen';
import { Box, Text } from '@/theme/restyleComponents';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Touchable } from '@/components/primitives/Touchable';
import { useAuth } from '../hooks/useAuth';
import { registerSchema } from '@/utils/validation';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@shopify/restyle';
import { type Theme } from '@/theme/theme';

export function RegisterScreen() {
  const theme = useTheme<Theme>();
  const { signUp, loading, error, clearError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  const handleRegister = async () => {
    clearError();
    setInfoMessage(null);
    setFieldErrors({});

    const result = registerSchema.safeParse({ email, password, confirmPassword });
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
      const data = await signUp(email, password);
      if (data?.session) {
        router.replace('/(auth)/onboarding');
      } else if (data?.user) {
        setInfoMessage('Account created successfully! Please check your email to confirm your account before signing in.');
      }
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
            Create Account
          </Text>
          <Text variant="bodySmall" textAlign="center">
            Start your pregnancy journey with AI guidance
          </Text>
        </Box>

        {/* Info / Success banner */}
        {infoMessage && (
          <Box backgroundColor="secondary" borderRadius="m" padding="m" marginBottom="m">
            <Text variant="bodySmall" color="textInverse">
              {infoMessage}
            </Text>
          </Box>
        )}

        {/* Error banner */}
        {error && (
          <Box backgroundColor="error" borderRadius="m" padding="m" marginBottom="m">
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
          placeholder="Min. 6 characters"
          value={password}
          onChangeText={setPassword}
          error={fieldErrors.password}
          secureTextEntry
          leftIcon={
            <Ionicons name="lock-closed-outline" size={20} color={theme.colors.textMuted} />
          }
        />

        <Input
          label="Confirm Password"
          placeholder="Re-enter password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          error={fieldErrors.confirmPassword}
          secureTextEntry
          leftIcon={
            <Ionicons name="lock-closed-outline" size={20} color={theme.colors.textMuted} />
          }
        />

        <Button
          title="Create Account"
          onPress={handleRegister}
          loading={loading}
          variant="primary"
          size="lg"
        />

        {/* Back to login */}
        <Box
          flexDirection="row"
          justifyContent="center"
          alignItems="center"
          marginTop="l"
        >
          <Text variant="bodySmall">Already have an account? </Text>
          <Touchable onPress={() => router.back()}>
            <Text variant="bodySmall" color="primary" fontFamily="Inter_600SemiBold">
              Sign In
            </Text>
          </Touchable>
        </Box>
      </Box>
    </Screen>
  );
}
