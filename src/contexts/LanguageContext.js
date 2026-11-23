/**
 * MAZRATI - Language Context
 * إدارة اللغة واتجاه النص (RTL / LTR) مع الحفظ في AsyncStorage
 */

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { I18nManager } from 'react-native';

import { STORAGE_KEYS, DEFAULT_LANGUAGE, DIRECTIONS } from '../constants';

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(DEFAULT_LANGUAGE);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const loadLanguage = async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEYS.LANGUAGE);
        if (saved) {
          setLanguage(saved);
        }
      } catch (error) {
        console.error('Failed to load language:', error);
      } finally {
        setIsReady(true);
      }
    };
    loadLanguage();
  }, []);

  // تطبيق اتجاه النص عند تغيير اللغة
  useEffect(() => {
    if (!isReady) return;

    const isRTL = language === 'ar';
    try {
      if (I18nManager.getConstants().isRTL !== isRTL) {
        I18nManager.forceRTL(isRTL);
      }
    } catch (error) {
      console.error('Failed to set RTL direction:', error);
    }
  }, [language, isReady]);

  const direction = DIRECTIONS[language] || DIRECTIONS.ar;

  const setLanguageCode = useCallback(
    async (newLanguage) => {
      setLanguage(newLanguage);
      try {
        await AsyncStorage.setItem(STORAGE_KEYS.LANGUAGE, newLanguage);
      } catch (error) {
        console.error('Failed to save language:', error);
      }
    },
    []
  );

  return (
    <LanguageContext.Provider
      value={{ language, direction, isRTL: direction === 'rtl', isReady, setLanguage: setLanguageCode }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage يجب أن يُستخدم داخل LanguageProvider');
  }
  return context;
};

export default LanguageContext;
