/**
 * MAZRATI - Contexts Index
 * تصدير جميع Context providers
 */

import { ThemeProvider, useTheme } from './ThemeContext';
import { LanguageProvider, useLanguage } from './LanguageContext';
import { CategoriesProvider, useCategories } from './CategoriesContext';
import { ItemsProvider, useItems } from './ItemsContext';
import { EventsProvider, useEvents } from './EventsContext';

export { ThemeProvider, useTheme, LanguageProvider, useLanguage, CategoriesProvider, useCategories, ItemsProvider, useItems, EventsProvider, useEvents };

export default {
  ThemeProvider,
  useTheme,
  LanguageProvider,
  useLanguage,
  CategoriesProvider,
  useCategories,
  ItemsProvider,
  useItems,
  EventsProvider,
  useEvents,
};
