/**
 * MAZRATI - AppIconButton
 * زر أيقونة (Icon Button) مع حجم مخصص
 */

import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

const AppIconButton = ({
  icon,
  onPress,
  size = 24,
  color,
  disabled = false,
  style,
}) => {
  const { theme } = useTheme();

  return (
    <TouchableOpacity
      style={[styles.button, style]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.6}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
    >
      <Text
        style={[
          styles.icon,
          {
            fontSize: size,
            color: color || theme.colors.text,
            opacity: disabled ? 0.4 : 1,
          },
        ]}
      >
        {icon}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    textAlign: 'center',
  },
});

export default AppIconButton;
