/**
 * MAZRATI - AppDivider
 * فاصل بصري بين العناصر يدعم الاتجاه (RTL/LTR)
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

const AppDivider = ({ style }) => {
  const { theme } = useTheme();
  return (
    <View
      style={[
        styles.divider,
        { backgroundColor: theme.colors.border },
        style,
      ]}
    />
  );
};

const styles = StyleSheet.create({
  divider: {
    height: 1,
    marginVertical: 12,
    width: '100%',
  },
});

export default AppDivider;
