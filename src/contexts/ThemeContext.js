/**
 * MAZRATI - Theme Context
 * إدارة وضع العرض (فاتح / داكن / نظام) مع الحفظ في AsyncStorage
 */

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appearance, Platform, StatusBar } from 'react-native';

import { lightTheme, darkTheme } from '../theme';
import {
  STORAGE_KEYS,
  DEFAULT_THEME_MODE,
} from '../constants';

const ThemeContext = createContext(null);

/**
 * مزود الثيم
 * يوفر الدالة setThemeMode وال객ت theme الحالي لجميع المكونات
 */
export function ThemeProvider({ children }) {
  const [mode, setMode] = useState(DEFAULT_THEME_MODE);
  const [resolvedMode, setResolvedMode] = useState('light');
  const [isReady, setIsReady] = useState(false);

  // قراءة الاختيار المحفوظ عند التحميل
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEYS.THEME_MODE);
        if (saved) {
          setMode(saved);
        }
      } catch (error) {
        console.error('Failed to load theme mode:', error);
      } finally {
        setIsReady(true);
      }
    };
    loadTheme();
  }, []);

  // مراقبة تغيير نظام التشغيل (system default)
  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      if (mode === 'system') {
        setResolvedMode(colorScheme === 'dark' ? 'dark' : 'light');
      }
    });
    return () => subscription.remove();
  }, [mode]);

  // حساب وضع العرض الفعلي
  useEffect(() => {
    if (!isReady) return;

    if (mode === 'system') {
      const colorScheme = Appearance.getColorScheme();
      setResolvedMode(colorScheme === 'dark' ? 'dark' : 'light');
    } else {
      setResolvedMode(mode);
    }
  }, [mode, isReady]);

  // تحديث شريط الحالة حسب الوضع
  useEffect(() => {
    if (!isReady) return;
    if (Platform.OS === 'android') {
      StatusBar.setBarStyle(resolvedMode === 'dark' ? 'light-content' : 'dark-content');
    }
  }, [resolvedMode, isReady]);

  // دالة تغيير الوضع مع الحفظ
  const setThemeMode = useCallback(
    async (newMode) => {
      setMode(newMode);
      try {
        await AsyncStorage.setItem(STORAGE_KEYS.THEME_MODE, newMode);
      } catch (error) {
        console.error('Failed to save theme mode:', error);
      }
    },
    []
  );

  const theme = resolvedMode === 'dark' ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ mode, resolvedMode, theme, isReady, setThemeMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme يجب أن يُستخدم داخل ThemeProvider');
  }
  return context;
};

export default ThemeContext;
