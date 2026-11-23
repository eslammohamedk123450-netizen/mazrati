/**
 * MAZRATI - AppButton
 * زر متعدد الاستخدامات (primary/secondary/outline/ghost) مع حالة تحميل
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

const AppButton = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  icon,
  style,
  textStyle,
}) => {
  const { theme } = useTheme();

  const variants = {
    primary: {
      backgroundColor: theme.colors.primary,
      textColor: '#FFFFFF',
      borderWidth: 0,
    },
    secondary: {
      backgroundColor: theme.colors.surface,
      textColor: theme.colors.primary,
      borderWidth: 1,
      borderColor: theme.colors.primary,
    },
    outline: {
      backgroundColor: 'transparent',
      textColor: theme.colors.primary,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    ghost: {
      backgroundColor: 'transparent',
      textColor: theme.colors.primary,
      borderWidth: 0,
    },
  };

  const sizes = {
    small: { paddingVertical: 8, paddingHorizontal: 14, fontSize: 13 },
    medium: { paddingVertical: 12, paddingHorizontal: 20, fontSize: 15 },
    large: { paddingVertical: 16, paddingHorizontal: 28, fontSize: 17 },
  };

  const v = variants[variant] || variants.primary;
  const s = sizes[size] || sizes.medium;

  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          backgroundColor: v.backgroundColor,
          borderWidth: v.borderWidth,
          borderColor: v.borderColor,
          paddingVertical: s.paddingVertical,
          paddingHorizontal: s.paddingHorizontal,
          opacity: isDisabled ? 0.5 : 1,
        },
        style,
      ]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color={v.textColor} size="small" />
      ) : (
        <>
          {icon ? <Text style={[styles.icon, { color: v.textColor }]}>{icon}</Text> : null}
          {title ? (
            <Text
              style={[
                styles.text,
                {
                  color: v.textColor,
                  fontSize: s.fontSize,
                },
                textStyle,
              ]}
            >
              {title}
            </Text>
          ) : null}
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    gap: 8,
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
  icon: {
    fontSize: 18,
  },
});

export default AppButton;
