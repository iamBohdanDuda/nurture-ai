import { createTheme } from '@shopify/restyle';

const palette = {
  // Primary — Cashmere Rose & Warm Blush (nurturing, soft, elegant)
  blushPink50: '#FFF7F8',
  blushPink100: '#FCE8ED',
  blushPink200: '#F9D0DC',
  blushPink300: '#F2A4BC',
  blushPink400: '#E06D8C',
  blushPink500: '#C84E70',

  // Secondary — Soothing Herbal Sage (organic, calming, grounding)
  sage50: '#F4F8F5',
  sage100: '#E1EEE5',
  sage200: '#C3DDCB',
  sage300: '#98C2A5',
  sage400: '#5F9973',
  sage500: '#457B57',

  // Tertiary — Delicate Wisteria / Lavender (tranquil, dreamy)
  lavender50: '#FAF7FD',
  lavender100: '#F0EBF9',
  lavender200: '#E0D4F3',
  lavender300: '#C4B2E8',
  lavender400: '#A786DF',

  // Warm Accents — Peach Sunrise, Gentle Terracotta, Warm Honey, Mineral Dew
  peach50: '#FFF9F5',
  peach100: '#FEEBDC',
  peach200: '#FDD6BD',
  peach300: '#F9B792',
  coral50: '#FFF5F2',
  coral100: '#FDDCD1',
  coral200: '#F9B9A6',
  coral300: '#F29980',
  coral400: '#E8825D',
  gold50: '#FFFBF2',
  gold100: '#FEF3D1',
  gold200: '#FDE49E',
  gold300: '#F6CF7A',
  gold400: '#DFA036',
  mint50: '#F2F9FA',
  mint100: '#D6EEF5',
  mint200: '#A8DCED',
  mint300: '#7AC2D8',
  mint400: '#4EA3BE',

  // Warm Neutrals — Oat milk, honey linen, warm stone, espresso charcoal
  white: '#FFFFFF',
  warmCanvas: '#FAF7F2',     // Soothing warm oat milk background
  warmSurface: '#FFFFFF',    // Crisp card surface
  warmSurfaceSoft: '#F6F1EA', // Gentle linen for inputs/chips
  warmBorder: '#EFE7DC',     // Subtle warm stone border
  warmBorderStrong: '#DDD3C4',
  espresso100: '#A39690',    // Soft clay for muted text
  espresso200: '#857771',    // Secondary warm taupe
  espresso300: '#5C4E49',    // Deep warm taupe
  espresso400: '#3D322E',    // Rich dark cocoa
  espresso500: '#261F1C',    // Deep espresso charcoal for primary text

  // Aliases for gray backward compatibility
  gray50: '#FBF9F6',
  gray100: '#F5F0E8',
  gray200: '#EAE2D5',
  gray300: '#DDD3C4',
  gray400: '#A39690',
  gray500: '#7A6E68',
  gray600: '#5C4E49',
  gray700: '#3D322E',
  gray800: '#261F1C',
  gray900: '#1A1412',
  black: '#1A1412',

  // Functional (warm tinted)
  success: '#5F9973',
  warning: '#DFA036',
  error: '#DE5B5B',
  errorDark: '#BD3C3C',
  info: '#4EA3BE',
  transparent: 'transparent',
};

/** Type for expo-linear-gradient colors prop */
export type GradientColors = readonly [string, string, ...string[]];

/** Gradient presets used across the app (expo-linear-gradient `colors` prop) */
export const GRADIENTS: Record<string, GradientColors> = {
  primary: [palette.blushPink400, palette.coral400],
  header: [palette.blushPink200, palette.peach100],
  headerSubtle: [palette.blushPink50, palette.peach50],
  gold: [palette.gold300, palette.gold400],
  sage: [palette.sage300, palette.sage400],
  lavender: [palette.lavender200, palette.lavender400],
  info: [palette.mint300, palette.mint400],
  coral: [palette.coral300, palette.coral400],
  progress: [palette.blushPink400, palette.coral300],
  warmBackground: [palette.blushPink50, palette.peach50, palette.white],
  babyAura: [palette.blushPink100, palette.peach100, palette.gold50],
};

/** Helper to cast inline color arrays to GradientColors for expo-linear-gradient */
export function gc(c1: string, c2: string, ...rest: string[]): GradientColors {
  return [c1, c2, ...rest];
}

const theme = createTheme({
  colors: {
    // Surface
    primaryBackground: palette.white,
    cardBackground: palette.warmSurface,
    mainBackground: palette.warmCanvas,
    warmSurfaceSoft: palette.warmSurfaceSoft,
    surfaceElevated: palette.white,
    surfaceFrosted: 'rgba(255, 255, 255, 0.88)',

    // Brand
    primary: palette.blushPink400,
    primaryLight: palette.blushPink100,
    primaryDark: palette.blushPink500,
    secondary: palette.sage400,
    secondaryLight: palette.sage100,
    accent: palette.lavender400,
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
    textPrimary: palette.espresso500,
    textSecondary: palette.espresso300,
    textInverse: palette.white,
    textMuted: palette.espresso100,
    textLink: palette.blushPink400,

    // Input / Border
    border: palette.warmBorder,
    warmBorder: palette.warmBorder,
    borderFocused: palette.blushPink400,
    inputBackground: palette.warmSurfaceSoft,
    inputPlaceholder: palette.espresso100,

    // Functional
    success: palette.success,
    warning: palette.warning,
    error: palette.error,
    errorDark: palette.errorDark,
    info: palette.info,
    transparent: palette.transparent,

    // Navigation
    tabBarActive: palette.blushPink400,
    tabBarInactive: palette.espresso100,
    tabBarBackground: palette.white,

    // Chat
    chatBubbleUser: palette.blushPink100,
    chatBubbleAI: palette.white,
    chatBubbleUserText: '#3B1F27',
    chatBubbleAIText: palette.espresso500,

    // Misc & Aliases
    overlay: 'rgba(38, 31, 28, 0.45)',
    shadow: '#6B4032', // Warm amber-toned shadow
    white: palette.white,
    black: palette.black,
    card: palette.warmSurface,
    infoLight: palette.mint50,
    textTertiary: palette.espresso100,
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
    xs: 6,
    s: 10,
    m: 16,
    l: 20,
    xl: 28,
    '2xl': 36,
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
      fontSize: 38,
      lineHeight: 46,
      letterSpacing: -0.8,
      color: 'textPrimary',
    },
    h1: {
      fontFamily: 'Inter_700Bold',
      fontSize: 30,
      lineHeight: 38,
      letterSpacing: -0.6,
      color: 'textPrimary',
    },
    h2: {
      fontFamily: 'Inter_600SemiBold',
      fontSize: 23,
      lineHeight: 30,
      letterSpacing: -0.4,
      color: 'textPrimary',
    },
    h3: {
      fontFamily: 'Inter_600SemiBold',
      fontSize: 19,
      lineHeight: 26,
      letterSpacing: -0.2,
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
      lineHeight: 21,
      color: 'textSecondary',
    },
    caption: {
      fontFamily: 'Inter_500Medium',
      fontSize: 12,
      lineHeight: 17,
      color: 'textMuted',
    },
    button: {
      fontFamily: 'Inter_600SemiBold',
      fontSize: 16,
      lineHeight: 24,
      color: 'textInverse',
    },
    buttonSmall: {
      fontFamily: 'Inter_600SemiBold',
      fontSize: 14,
      lineHeight: 20,
      color: 'textInverse',
    },
    label: {
      fontFamily: 'Inter_600SemiBold',
      fontSize: 14,
      lineHeight: 20,
      color: 'textPrimary',
    },
    statValue: {
      fontFamily: 'Inter_700Bold',
      fontSize: 26,
      lineHeight: 32,
      letterSpacing: -0.5,
      color: 'textPrimary',
    },
    statLabel: {
      fontFamily: 'Inter_600SemiBold',
      fontSize: 11,
      lineHeight: 15,
      letterSpacing: 0.8,
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
      borderWidth: 1,
      borderColor: 'border',
      shadowColor: 'shadow',
      shadowOpacity: 0.04,
      shadowOffset: { width: 0, height: 3 },
      shadowRadius: 12,
      elevation: 2,
    },
    elevated: {
      backgroundColor: 'surfaceElevated',
      borderRadius: 'xl',
      padding: 'm',
      borderWidth: 1,
      borderColor: 'border',
      shadowColor: 'shadow',
      shadowOpacity: 0.07,
      shadowOffset: { width: 0, height: 6 },
      shadowRadius: 18,
      elevation: 3,
    },
    outlined: {
      backgroundColor: 'primaryBackground',
      borderRadius: 'l',
      padding: 'm',
      borderWidth: 1,
      borderColor: 'border',
    },
    flat: {
      backgroundColor: 'inputBackground',
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
      shadowOpacity: 0.05,
      shadowOffset: { width: 0, height: 4 },
      shadowRadius: 14,
      elevation: 2,
    },
  },
});

export type Theme = typeof theme;
export default theme;
