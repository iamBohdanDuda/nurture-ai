import { createTheme } from '@shopify/restyle';
import theme, { type Theme } from './theme';

const darkTheme: Theme = createTheme({
  ...theme,
  colors: {
    ...theme.colors,
    primaryBackground: '#191514',
    cardBackground: '#211C1A',
    mainBackground: '#14100F',
    surfaceElevated: '#282220',
    surfaceFrosted: 'rgba(33, 28, 26, 0.88)',

    textPrimary: '#F7F2EE',
    textSecondary: '#C4B8B2',
    textInverse: '#1A1412',
    textMuted: '#8F827B',

    border: '#352D29',
    warmBorder: '#352D29',
    borderFocused: '#E06D8C',
    inputBackground: '#282220',
    warmSurfaceSoft: '#282220',
    inputPlaceholder: '#7A6E68',

    peachLight: '#30221B',
    peachSubtle: '#221915',
    coralLight: '#331F1C',
    goldLight: '#332918',
    mintLight: '#182C30',

    tabBarBackground: '#191514',

    chatBubbleUser: '#3D2028',
    chatBubbleAI: '#26201E',
    chatBubbleUserText: '#FDE8ED',
    chatBubbleAIText: '#F7F2EE',

    overlay: 'rgba(15, 11, 10, 0.65)',
    shadow: '#000000',
  },
});

export default darkTheme;
