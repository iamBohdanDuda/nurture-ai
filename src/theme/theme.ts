import { createTheme } from '@shopify/restyle';

const palette = {
  // Primary — Blush Pink
  blushPink50: '#FFF5F7',
  blushPink100: '#FED7E2',
  blushPink200: '#FBB6CE',
  blushPink300: '#F687B3',
  blushPink400: '#ED64A6',
  blushPink500: '#D53F8C',

  // Secondary — Sage Green
  sage50: '#F0FFF4',
  sage100: '#C6F6D5',
  sage200: '#9AE6B4',
  sage300: '#68D391',
  sage400: '#48BB78',
  sage500: '#38A169',

  // Tertiary — Soft Lavender
  lavender50: '#FAF5FF',
  lavender100: '#E9D8FD',
  lavender200: '#D6BCFA',
  lavender300: '#B794F4',
  lavender400: '#9F7AEA',

  // Neutrals
  white: '#FFFFFF',
  gray50: '#FAFAFA',
  gray100: '#F5F5F5',
  gray200: '#E5E5E5',
  gray300: '#D4D4D4',
  gray400: '#A3A3A3',
  gray500: '#737373',
  gray600: '#525252',
  gray700: '#404040',
  gray800: '#262626',
  gray900: '#171717',
  black: '#000000',

  // Functional
  success: '#48BB78',
  warning: '#ECC94B',
  error: '#FC8181',
  errorDark: '#E53E3E',
  info: '#63B3ED',
  transparent: 'transparent',
};

const theme = createTheme({
  colors: {
    // Surface
    primaryBackground: palette.white,
    cardBackground: palette.gray50,
    mainBackground: palette.blushPink50,
    surfaceElevated: palette.white,

    // Brand
    primary: palette.blushPink400,
    primaryLight: palette.blushPink100,
    primaryDark: palette.blushPink500,
    secondary: palette.sage400,
    secondaryLight: palette.sage100,
    accent: palette.lavender300,
    accentLight: palette.lavender100,

    // Text
    textPrimary: palette.gray800,
    textSecondary: palette.gray500,
    textInverse: palette.white,
    textMuted: palette.gray400,
    textLink: palette.blushPink400,

    // Input / Border
    border: palette.gray200,
    borderFocused: palette.blushPink300,
    inputBackground: palette.gray100,
    inputPlaceholder: palette.gray400,

    // Functional
    success: palette.success,
    warning: palette.warning,
    error: palette.error,
    errorDark: palette.errorDark,
    info: palette.info,
    transparent: palette.transparent,

    // Navigation
    tabBarActive: palette.blushPink400,
    tabBarInactive: palette.gray400,
    tabBarBackground: palette.white,

    // Chat
    chatBubbleUser: palette.blushPink100,
    chatBubbleAI: palette.gray100,
    chatBubbleUserText: palette.gray800,
    chatBubbleAIText: palette.gray800,

    // Misc & Aliases
    overlay: 'rgba(0,0,0,0.4)',
    shadow: palette.black,
    white: palette.white,
    black: palette.black,
    card: palette.gray50,
    infoLight: '#EBF8FF',
    textTertiary: palette.gray400,
  },

  spacing: {
    '0': 0,
    xs: 4,
    s: 8,
    m: 16,
    l: 24,
    xl: 32,
    '2xl': 48,
    '3xl': 64,
  },

  borderRadii: {
    none: 0,
    s: 8,
    m: 12,
    l: 16,
    xl: 24,
    full: 9999,
  },

  textVariants: {
    defaults: {
      fontFamily: 'Inter_400Regular',
      fontSize: 16,
      lineHeight: 24,
      color: 'textPrimary',
    },
    h1: {
      fontFamily: 'Inter_700Bold',
      fontSize: 32,
      lineHeight: 40,
      color: 'textPrimary',
    },
    h2: {
      fontFamily: 'Inter_600SemiBold',
      fontSize: 24,
      lineHeight: 32,
      color: 'textPrimary',
    },
    h3: {
      fontFamily: 'Inter_600SemiBold',
      fontSize: 20,
      lineHeight: 28,
      color: 'textPrimary',
    },
    body: {
      fontFamily: 'Inter_400Regular',
      fontSize: 16,
      lineHeight: 24,
      color: 'textPrimary',
    },
    bodySmall: {
      fontFamily: 'Inter_400Regular',
      fontSize: 14,
      lineHeight: 20,
      color: 'textSecondary',
    },
    caption: {
      fontFamily: 'Inter_400Regular',
      fontSize: 12,
      lineHeight: 16,
      color: 'textMuted',
    },
    button: {
      fontFamily: 'Inter_600SemiBold',
      fontSize: 16,
      lineHeight: 24,
      color: 'textInverse',
    },
    buttonSmall: {
      fontFamily: 'Inter_500Medium',
      fontSize: 14,
      lineHeight: 20,
      color: 'textInverse',
    },
    label: {
      fontFamily: 'Inter_500Medium',
      fontSize: 14,
      lineHeight: 20,
      color: 'textPrimary',
    },
  },

  breakpoints: {
    phone: 0,
    tablet: 768,
  },

  cardVariants: {
    defaults: {
      backgroundColor: 'cardBackground',
      borderRadius: 'l',
      padding: 'm',
      shadowColor: 'shadow',
      shadowOpacity: 0.05,
      shadowOffset: { width: 0, height: 2 },
      shadowRadius: 8,
      elevation: 2,
    },
    elevated: {
      backgroundColor: 'surfaceElevated',
      borderRadius: 'l',
      padding: 'm',
      shadowColor: 'shadow',
      shadowOpacity: 0.1,
      shadowOffset: { width: 0, height: 4 },
      shadowRadius: 12,
      elevation: 4,
    },
    outlined: {
      backgroundColor: 'primaryBackground',
      borderRadius: 'l',
      padding: 'm',
      borderWidth: 1,
      borderColor: 'border',
    },
    flat: {
      backgroundColor: 'cardBackground',
      borderRadius: 'l',
      padding: 'm',
    },
  },
});

export type Theme = typeof theme;
export default theme;
