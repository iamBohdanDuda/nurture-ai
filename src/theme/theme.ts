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

  // Warm Accents — Peach, Coral, Gold, Mint
  peach50: '#FFF8F0',
  peach100: '#FFECD2',
  peach200: '#FFD8A8',
  peach300: '#FFB87A',
  coral50: '#FFF0ED',
  coral100: '#FFE0D6',
  coral200: '#FFC4B4',
  coral300: '#FFA08E',
  coral400: '#FF7F6E',
  gold50: '#FFFDF0',
  gold100: '#FFF8E1',
  gold200: '#FFECB3',
  gold300: '#FFD54F',
  gold400: '#FFB74D',
  mint50: '#F0FDFA',
  mint100: '#E0F7FA',
  mint200: '#B2EBF2',
  mint300: '#80DEEA',
  mint400: '#4DB6AC',

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

/** Type for expo-linear-gradient colors prop */
export type GradientColors = readonly [string, string, ...string[]];

/** Gradient presets used across the app (expo-linear-gradient `colors` prop) */
export const GRADIENTS: Record<string, GradientColors> = {
  primary: [palette.blushPink400, palette.coral400],
  header: [palette.blushPink300, palette.peach200],
  headerSubtle: [palette.blushPink50, palette.peach50],
  gold: [palette.gold300, palette.gold400],
  sage: [palette.sage300, palette.sage400],
  lavender: [palette.lavender200, palette.lavender400],
  info: [palette.mint300, palette.info],
  coral: [palette.coral300, palette.coral400],
  progress: [palette.blushPink400, palette.coral300],
  warmBackground: [palette.blushPink50, palette.peach50, palette.white],
};

/** Helper to cast inline color arrays to GradientColors for expo-linear-gradient */
export function gc(c1: string, c2: string, ...rest: string[]): GradientColors {
  return [c1, c2, ...rest];
}


const theme = createTheme({
  colors: {
    // Surface
    primaryBackground: palette.white,
    cardBackground: palette.gray50,
    mainBackground: palette.blushPink50,
    surfaceElevated: palette.white,
    surfaceFrosted: 'rgba(255,255,255,0.78)',

    // Brand
    primary: palette.blushPink400,
    primaryLight: palette.blushPink100,
    primaryDark: palette.blushPink500,
    secondary: palette.sage400,
    secondaryLight: palette.sage100,
    accent: palette.lavender300,
    accentLight: palette.lavender100,

    // Warm Accents
    peach: palette.peach200,
    peachLight: palette.peach100,
    peachSubtle: palette.peach50,
    coral: palette.coral400,
    coralLight: palette.coral100,
    gold: palette.gold400,
    goldLight: palette.gold100,
    mint: palette.mint400,
    mintLight: palette.mint100,

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
    '2xl': 32,
    full: 9999,
  },

  textVariants: {
    defaults: {
      fontFamily: 'Inter_400Regular',
      fontSize: 16,
      lineHeight: 24,
      color: 'textPrimary',
    },
    displayLarge: {
      fontFamily: 'Inter_700Bold',
      fontSize: 40,
      lineHeight: 48,
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
    statValue: {
      fontFamily: 'Inter_700Bold',
      fontSize: 28,
      lineHeight: 34,
      color: 'textPrimary',
    },
    statLabel: {
      fontFamily: 'Inter_500Medium',
      fontSize: 11,
      lineHeight: 14,
      letterSpacing: 0.5,
      color: 'textMuted',
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
    glass: {
      backgroundColor: 'surfaceFrosted',
      borderRadius: 'xl',
      padding: 'm',
      borderWidth: 1,
      borderColor: 'border',
      shadowColor: 'shadow',
      shadowOpacity: 0.06,
      shadowOffset: { width: 0, height: 4 },
      shadowRadius: 16,
      elevation: 3,
    },
  },
});

export type Theme = typeof theme;
export default theme;
