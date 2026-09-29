import React from 'react';
import { ScrollView, type ViewStyle, KeyboardAvoidingView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@shopify/restyle';
import { Box } from '@/theme/restyleComponents';
import { type Theme } from '@/theme/theme';

interface ScreenProps {
  children: React.ReactNode;
  scrollable?: boolean;
  padded?: boolean;
  safeTop?: boolean;
  safeBottom?: boolean;
  hasTabBar?: boolean;
  backgroundColor?: keyof Theme['colors'];
  style?: ViewStyle;
}

export function Screen({
  children,
  scrollable = true,
  padded = true,
  safeTop = true,
  safeBottom = true,
  hasTabBar = true,
  backgroundColor = 'mainBackground',
  style,
}: ScreenProps) {
  const insets = useSafeAreaInsets();
  const theme = useTheme<Theme>();

  const containerStyle: ViewStyle = {
    flex: 1,
    backgroundColor: theme.colors[backgroundColor],
    paddingTop: safeTop ? insets.top : 0,
    paddingBottom: (!hasTabBar && safeBottom) ? insets.bottom : 0,
    ...style,
  };

  const extraBottomPadding = hasTabBar ? 100 + insets.bottom : (safeBottom ? insets.bottom : 0);

  const content = (
    <Box flex={1} paddingHorizontal={padded ? 'm' : '0'}>
      {children}
    </Box>
  );

  return (
    <KeyboardAvoidingView
      style={containerStyle}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {scrollable ? (
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, paddingBottom: extraBottomPadding }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {content}
        </ScrollView>
      ) : (
        content
      )}
    </KeyboardAvoidingView>
  );
}
