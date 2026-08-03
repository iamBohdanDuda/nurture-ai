import { createTheme } from '@shopify/restyle';
import theme, { type Theme } from './theme';

const darkTheme: Theme = createTheme({
  ...theme,
  colors: {
    ...theme.colors,
    primaryBackground: '#0F0F0F',
    cardBackground: '#1A1A1A',
    mainBackground: '#0A0A0A',
    surfaceElevated: '#1E1E1E',

    textPrimary: '#F5F5F5',
    textSecondary: '#A3A3A3',
    textInverse: '#171717',
    textMuted: '#525252',

    border: '#333333',
    borderFocused: '#F687B3',
    inputBackground: '#262626',
    inputPlaceholder: '#525252',

    tabBarBackground: '#0F0F0F',

    chatBubbleUser: '#3D1F2E',
    chatBubbleAI: '#1A1A1A',
    chatBubbleUserText: '#F5F5F5',
    chatBubbleAIText: '#F5F5F5',

    overlay: 'rgba(0,0,0,0.6)',
  },
});

export default darkTheme;
