/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

export const COLORS = {
  primary: '#2F80ED',
  secondary: '#6389DA',
  success: '#1E8449',
  danger: '#D32F2F',
  warning: '#F57C00',
  info: '#475569',
  background: '#FFFFFF',
  cardBlue: '#F0F7FF',
  borderBlue: '#E1E9F5',
  textDark: '#1A1A1A',
  textGray: '#666',
  white: '#FFF',
};

export const PRIORITY_CONFIG = {
  'Critical': { bg: '#FDECEC', text: COLORS.danger, icon: 'alert-circle' },
  'High': { bg: '#FEF0E6', text: '#E65100', icon: 'arrow-up-circle' },
  'Medium': { bg: '#FFF9E6', text: COLORS.warning, icon: 'remove-circle' },
  'Low': { bg: '#F1F9F1', text: '#388E3C', icon: 'arrow-down-circle' },
};
