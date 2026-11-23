/**
 * MAZRATI - AppHeader
 * شريط عنوان (Header) مع زر رجوع واختياري زر إجراء
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, I18nManager } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

const AppHeader = ({
  title,
  subtitle,
  showBack = true,
  onBack,
  rightAction,
  rightIcon,
  onRightAction,
  style,
}) => {
  const { theme } = useTheme();

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: theme.colors.background }]}
    >
      <View style={[styles.container, style]}>
        <View style={styles.side}>
          {showBack ? (
            <TouchableOpacity
              onPress={onBack}
              style={styles.iconButton}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={[styles.backIcon, { color: theme.colors.text }]}>
                {I18nManager.isRTL ? '→' : '←'}
              </Text>
            </TouchableOpacity>
          ) : null}
        </View>

        <View style={styles.center}>
          {title ? (
            <Text style={[styles.title, { color: theme.colors.text }]} numberOfLines={1}>
              {title}
            </Text>
          ) : null}
          {subtitle ? (
            <Text
              style={[styles.subtitle, { color: theme.colors.secondaryText }]}
              numberOfLines={1}
            >
              {subtitle}
            </Text>
          ) : null}
        </View>

        <View style={styles.side}>
          {rightAction || rightIcon ? (
            <TouchableOpacity
              onPress={onRightAction}
              style={styles.iconButton}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              {rightIcon ? (
                <Text style={[styles.rightIcon, { color: theme.colors.text }]}>{rightIcon}</Text>
              ) : (
                <Text style={[styles.rightText, { color: theme.colors.primary }]}>
                  {rightAction}
                </Text>
              )}
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    width: '100%',
  },
  container: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  side: {
    width: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  iconButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    fontSize: 22,
    fontWeight: '600',
  },
  rightIcon: {
    fontSize: 22,
  },
  rightText: {
    fontSize: 15,
    fontWeight: '600',
  },
});

export default AppHeader;
