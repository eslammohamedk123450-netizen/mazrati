/**
 * MAZRATI - Hooks Index
 * تصدير جميع Custom Hooks
 */

import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useCategories } from '../contexts/CategoriesContext';
import { useItems } from '../contexts/ItemsContext';
import { useEvents } from '../contexts/EventsContext';

export { useTheme, useLanguage, useCategories, useItems, useEvents };

export default {
  useTheme,
  useLanguage,
  useCategories,
  useItems,
  useEvents,
};
