/**
 * MAZRATI - ملف الثيم الموحد
 * يجمع الألوان والطباعة والمسافات والأحجام في كائن واحد
 */

import Colors from './colors';
import Typography from './typography';
import { Spacing, BorderRadius, Sizes } from './sizes';

const createTheme = (mode) => {
  const palette = mode === 'dark' ? Colors.dark : Colors.light;

  return {
    mode,
    colors: palette,
    spacing: Spacing,
    borderRadius: BorderRadius,
    sizes: Sizes,
    typography: Typography,
  };
};

export const lightTheme = createTheme('light');
export const darkTheme = createTheme('dark');

export default { lightTheme, darkTheme, createTheme };
