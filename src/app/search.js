/**
 * MAZRATI - Search Screen
 * بحث شامل في الأقسام، العناصر، الأحداث، والتذكيرات
 */

import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../contexts/ThemeContext';
import { useCategories } from '../contexts/CategoriesContext';
import { useItems } from '../contexts/ItemsContext';
import { useEvents } from '../contexts/EventsContext';
import { useReminders } from '../contexts/RemindersContext';
import AppEmptyState from '../components/AppEmptyState';

const SearchScreen = () => {
  const { theme } = useTheme();
  const { categories } = useCategories();
  const { items } = useItems();
  const { events } = useEvents();
  const { reminders } = useReminders();
  const router = useRouter();

  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [recentSearches, setRecentSearches] = useState([]);
  const [showRecent, setShowRecent] = useState(true);

  const tabs = [
    { key: 'all', label: 'الكل', icon: '🔍' },
    { key: 'categories', label: 'أقسام', icon: '🗂️' },
    { key: 'items', label: 'عناصر', icon: '📦' },
    { key: 'events', label: 'أحداث', icon: '📅' },
    { key: 'reminders', label: 'تذكيرات', icon: '🔔' },
  ];

  // نتائج البحث
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return { categories: [], items: [], events: [], reminders: [] };

    return {
      categories: categories.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          (c.description && c.description.toLowerCase().includes(q)) ||
          (c.nameEn && c.nameEn.toLowerCase().includes(q))
      ),
      items: items.filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          (i.description && i.description.toLowerCase().includes(q)) ||
          (i.customNumber && i.customNumber.toLowerCase().includes(q)) ||
          (i.internalNumber && i.internalNumber.toLowerCase().includes(q)) ||
          (i.nameEn && i.nameEn.toLowerCase().includes(q))
      ),
      events: events.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          (e.description && e.description.toLowerCase().includes(q))
      ),
      reminders: reminders.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          (r.description && r.description.toLowerCase().includes(q)) ||
          (r.category && r.category.toLowerCase().includes(q))
      ),
    };
  }, [query, categories, items, events, reminders]);

  const totalResults = results.categories.length + results.items.length + results.events.length + results.reminders.length;

  const handleSearch = (text) => {
    setQuery(text);
    setShowRecent(text.length === 0);
    if (text.trim()) {
      setRecentSearches((prev) => {
        const filtered = prev.filter((s) => s !== text.trim());
        return [text.trim(), ...filtered].slice(0, 5);
      });
    }
  };

  const clearSearch = () => {
    setQuery('');
    setShowRecent(true);
  };

  const handleResultPress = (type, id) => {
    const routes = {
      categories: `/categories/${id}`,
      items: `/items/${id}`,
      events: `/events/${id}`,
      reminders: `/calendar`, // التقويم
    };
    if (routes[type]) router.push(routes[type]);
  };

  const getCategoryColor = (catId) => {
    const cat = categories.find((c) => c.id === catId);
    return cat?.color || theme.colors.primary;
  };

  if (!query && showRecent && recentSearches.length > 0) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.searchHeader}>
          <TextInput
            style={[styles.searchInput, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, color: theme.colors.text }]}
            placeholder="ابحث في مزرعتي..."
            placeholderTextColor={theme.colors.secondaryText}
            onChangeText={handleSearch}
            value={query}
            autoFocus
          />
          {query && (
            <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
              <Text style={{ color: theme.colors.secondaryText }}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.recentSection}>
          <View style={styles.recentHeader}>
            <Text style={[styles.recentTitle, { color: theme.colors.text }]}>عمليات البحث الأخيرة</Text>
          </View>
          <FlatList
            data={recentSearches}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.recentItem}
                onPress={() => handleSearch(item)}
              >
                <Text style={styles.recentIcon}>🕐</Text>
                <Text style={[styles.recentText, { color: theme.colors.text }]}>{item}</Text>
              </TouchableOpacity>
            )}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* شريط البحث */}
      <View style={styles.searchHeader}>
        <TextInput
          style={[styles.searchInput, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, color: theme.colors.text }]}
          placeholder="ابحث في مزرعتي..."
          placeholderTextColor={theme.colors.secondaryText}
          onChangeText={handleSearch}
          value={query}
          autoFocus
        />
        {query && (
          <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
            <Text style={{ color: theme.colors.secondaryText }}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* علامات التبويب */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsContainer}>
        {tabs.map((tab) => {
          let count = 0;
          if (tab.key === 'all') count = totalResults;
          else if (tab.key === 'categories') count = results.categories.length;
          else if (tab.key === 'items') count = results.items.length;
          else if (tab.key === 'events') count = results.events.length;
          else if (tab.key === 'reminders') count = results.reminders.length;

          return (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.tabButton,
                activeTab === tab.key ? styles.tabButtonActive : styles.tabButtonInactive,
                { backgroundColor: activeTab === tab.key ? theme.colors.primary + '15' : theme.colors.surface },
                { borderColor: activeTab === tab.key ? theme.colors.primary : theme.colors.border },
              ]}
              onPress={() => setActiveTab(tab.key)}
            >
              <Text style={styles.tabIcon}>{tab.icon}</Text>
              <Text style={[styles.tabLabel, { color: activeTab === tab.key ? theme.colors.primary : theme.colors.text }]}>
                {tab.label}
              </Text>
              {count > 0 && (
                <Text style={[
                  styles.tabCount,
                  { backgroundColor: activeTab === tab.key ? theme.colors.primary : theme.colors.border },
                  { color: activeTab === tab.key ? '#FFFFFF' : theme.colors.secondaryText }
                ]}>
                  {count}
                </Text>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* النتائج */}
      <View style={styles.resultsContainer}>
        {!query ? (
          <AppEmptyState
            icon="🔍"
            title="ابدأ البحث"
            description="اكتب للبحث في الأقسام، العناصر، الأحداث، والتذكيرات"
          />
        ) : totalResults === 0 ? (
          <AppEmptyState
            icon="🔍"
            title="لا توجد نتائج"
            description={`لم يتم العثور على نتائج لـ "${query}"`}
          />
        ) : (
          <>
            {activeTab === 'all' && (
              <>
                {results.categories.length > 0 && (
                  <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                      🗂️ أقسام ({results.categories.length})
                    </Text>
                    <FlatList
                      data={results.categories}
                      keyExtractor={(item) => item.id}
                      renderItem={({ item }) => (
                        <TouchableOpacity
                          style={[styles.resultCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
                          onPress={() => handleResultPress('categories', item.id)}
                        >
                          <View style={[styles.categoryColor, { backgroundColor: getCategoryColor(item.id) }]} />
                          <Text style={[styles.resultTitle, { color: theme.colors.text }]}>{item.name}</Text>
                          {item.description && (
                            <Text style={[styles.resultDesc, { color: theme.colors.secondaryText }]}>
                              {item.description}
                            </Text>
                          )}
                        </TouchableOpacity>
                      )}
                      ItemSeparatorComponent={() => <View style={styles.separator} />}
                    />
                  </View>
                )}

                {results.items.length > 0 && (
                  <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                      📦 عناصر ({results.items.length})
                    </Text>
                    <FlatList
                      data={results.items}
                      keyExtractor={(item) => item.id}
                      renderItem={({ item }) => (
                        <TouchableOpacity
                          style={[styles.resultCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
                          onPress={() => handleResultPress('items', item.id)}
                        >
                          <Text style={[styles.resultTitle, { color: theme.colors.text }]}>{item.name}</Text>
                          <Text style={[styles.resultMeta, { color: theme.colors.secondaryText }]}>
                            {item.internalNumber} • {getCategoryColor(item.categoryId)}
                          </Text>
                        </TouchableOpacity>
                      )}
                      ItemSeparatorComponent={() => <View style={styles.separator} />}
                    />
                  </View>
                )}

                {results.events.length > 0 && (
                  <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                      📅 أحداث ({results.events.length})
                    </Text>
                    <FlatList
                      data={results.events}
                      keyExtractor={(item) => item.id}
                      renderItem={({ item }) => (
                        <TouchableOpacity
                          style={[styles.resultCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
                          onPress={() => handleResultPress('events', item.id)}
                        >
                          <Text style={[styles.resultTitle, { color: theme.colors.text }]}>{item.title}</Text>
                          <Text style={[styles.resultMeta, { color: theme.colors.secondaryText }]}>
                            {item.date} {item.time ? '• ' + item.time : ''}
                          </Text>
                        </TouchableOpacity>
                      )}
                      ItemSeparatorComponent={() => <View style={styles.separator} />}
                    />
                  </View>
                )}

                {results.reminders.length > 0 && (
                  <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                      🔔 تذكيرات ({results.reminders.length})
                    </Text>
                    <FlatList
                      data={results.reminders}
                      keyExtractor={(item) => item.id}
                      renderItem={({ item }) => (
                        <TouchableOpacity
                          style={[styles.resultCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
                          onPress={() => handleResultPress('reminders', item.id)}
                        >
                          <Text style={[styles.resultTitle, { color: theme.colors.text }]}>{item.title}</Text>
                          <Text style={[styles.resultMeta, { color: theme.colors.secondaryText }]}>
                            {item.date} {item.time ? '• ' + item.time : ''}
                          </Text>
                        </TouchableOpacity>
                      )}
                      ItemSeparatorComponent={() => <View style={styles.separator} />}
                    />
                  </View>
                )}
              </>
            )}

            {activeTab === 'categories' && results.categories.length > 0 && (
              <View style={styles.section}>
                <FlatList
                  data={results.categories}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={[styles.resultCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
                      onPress={() => handleResultPress('categories', item.id)}
                    >
                      <View style={[styles.categoryColor, { backgroundColor: getCategoryColor(item.id) }]} />
                      <Text style={[styles.resultTitle, { color: theme.colors.text }]}>{item.name}</Text>
                    </TouchableOpacity>
                  )}
                  ItemSeparatorComponent={() => <View style={styles.separator} />}
                />
              </View>
            )}

            {activeTab === 'items' && results.items.length > 0 && (
              <View style={styles.section}>
                <FlatList
                  data={results.items}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={[styles.resultCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
                      onPress={() => handleResultPress('items', item.id)}
                    >
                      <Text style={[styles.resultTitle, { color: theme.colors.text }]}>{item.name}</Text>
                    </TouchableOpacity>
                  )}
                  ItemSeparatorComponent={() => <View style={styles.separator} />}
                />
              </View>
            )}

            {activeTab === 'events' && results.events.length > 0 && (
              <View style={styles.section}>
                <FlatList
                  data={results.events}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={[styles.resultCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
                      onPress={() => handleResultPress('events', item.id)}
                    >
                      <Text style={[styles.resultTitle, { color: theme.colors.text }]}>{item.title}</Text>
                      <Text style={[styles.resultMeta, { color: theme.colors.secondaryText }]}>
                        {item.date} {item.time ? '• ' + item.time : ''}
                      </Text>
                    </TouchableOpacity>
                  )}
                  ItemSeparatorComponent={() => <View style={styles.separator} />}
                />
              </View>
            )}

            {activeTab === 'reminders' && results.reminders.length > 0 && (
              <View style={styles.section}>
                <FlatList
                  data={results.reminders}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={[styles.resultCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
                      onPress={() => handleResultPress('reminders', item.id)}
                    >
                      <Text style={[styles.resultTitle, { color: theme.colors.text }]}>{item.title}</Text>
                      <Text style={[styles.resultMeta, { color: theme.colors.secondaryText }]}>
                        {item.date} {item.time ? '• ' + item.time : ''}
                      </Text>
                    </TouchableOpacity>
                  )}
                  ItemSeparatorComponent={() => <View style={styles.separator} />}
                />
              </View>
            )}
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
  },
  clearButton: { padding: 8 },
  tabsContainer: { flexDirection: 'row', paddingHorizontal: 16, gap: 8 },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  tabButtonActive: {},
  tabButtonInactive: {},
  tabIcon: { fontSize: 16 },
  tabLabel: { fontSize: 14, fontWeight: '600' },
  tabCount: {
    fontSize: 11,
    fontWeight: '700',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 10,
    minWidth: 18,
    textAlign: 'center',
  },
  resultsContainer: { flex: 1, paddingHorizontal: 16 },
  recentSection: { marginTop: 16 },
  recentHeader: { marginBottom: 8 },
  recentTitle: { fontSize: 16, fontWeight: '700' },
  recentItem: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 12 },
  recentIcon: { fontSize: 18 },
  recentText: { fontSize: 15, flex: 1 },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 10 },
  resultCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  categoryColor: { width: 4, height: '100%', borderRadius: 4 },
  resultTitle: { fontSize: 15, fontWeight: '600', flex: 1 },
  resultDesc: { fontSize: 13, marginTop: 2 },
  resultMeta: { fontSize: 12, marginTop: 2 },
  separator: { height: 1, marginTop: 4, marginBottom: 4 },
});

export default SearchScreen;