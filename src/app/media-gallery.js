/**
 * MAZRATI - Media Gallery Screen
 * معرض الوسائط (صور وأصوات مرتبطة بالعناصر والأحداث)
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Pressable,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Audio } from 'expo-av';
import { useTheme } from '../contexts/ThemeContext';
import { useItems } from '../contexts/ItemsContext';
import { useEvents } from '../contexts/EventsContext';
import { useReminders } from '../contexts/RemindersContext';

const MediaGalleryScreen = () => {
  const { theme } = useTheme();
  const { items } = useItems();
  const { events } = useEvents();
  const { reminders } = useReminders();
  const router = useRouter();
  const params = useLocalSearchParams();
  const focusedItemId = params.itemId;

  const [selectedMedia, setSelectedMedia] = useState(null);
  const [sound, setSound] = useState(null);
  const [playingUri, setPlayingUri] = useState(null);
  const [loadingMedia, setLoadingMedia] = useState(false);

  // تجميع الوسائط
  const mediaItems = useMemo(() => {
    const result = [];

    items.forEach((item) => {
      (item.images || []).forEach((uri) => {
        result.push({ id: `${item.id}-img`, uri, relatedId: item.id, relatedType: 'item', type: 'image' });
      });
      if (item.primaryImage) {
        result.push({ id: `${item.id}-primary`, uri: item.primaryImage, relatedId: item.id, relatedType: 'item', type: 'image' });
      }
    });

    events.forEach((event) => {
      (event.images || []).forEach((uri) => {
        result.push({ id: `${event.id}-img`, uri, relatedId: event.id, relatedType: 'event', type: 'image' });
      });
      if (event.audioUri) {
        result.push({ id: `${event.id}-audio`, uri: event.audioUri, relatedId: event.id, relatedType: 'event', type: 'audio' });
      }
    });

    reminders.forEach((reminder) => {
      // أي وسائط مخزنة مرتبطة
    });

    return result;
  }, [items, events, reminders]);

  const filteredMedia = useMemo(() => {
    if (!focusedItemId) return mediaItems;
    const filtered = mediaItems.filter((m) => m.relatedId === focusedItemId);
    if (filtered.length === 0 && focusedItemId) {
      const item = items.find((i) => i.id === focusedItemId);
      if (item) {
        const relatedImages = (item.images || []).map((uri) => ({
          id: `${item.id}-img-${uri}`,
          uri,
          relatedId: item.id,
          relatedType: 'item',
          type: 'image',
        }));
        return relatedImages;
      }
    }
    return filtered;
  }, [mediaItems, focusedItemId, items]);

  const playAudio = async (uri) => {
    try {
      if (sound) {
        await sound.unloadAsync();
      }
      const { sound: newSound } = await Audio.Sound.createAsync({ uri });
      setSound(newSound);
      setPlayingUri(uri);
      await newSound.playAsync();
      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          setPlayingUri(null);
        }
      });
    } catch (error) {
      Alert.alert('خطأ', 'تعذر تشغيل الصوت');
      console.error('Audio playback error:', error);
    }
  };

  const handlePlayMedia = async (media) => {
    if (media.type === 'image') {
      setSelectedMedia(media);
      return;
    }
    setLoadingMedia(true);
    await playAudio(media.uri);
    setLoadingMedia(false);
  };

  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  const renderMedia = ({ item }) => {
    if (item.type === 'image') {
      return (
        <Pressable
          style={[styles.mediaCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
          onPress={() => handlePlayMedia(item)}
        >
          <Image source={{ uri: item.uri }} style={styles.mediaImage} />
          <Text style={[styles.mediaTitle, { color: theme.colors.text }]} numberOfLines={1}>
            {item.relatedType === 'item' ? 'عنصر' : 'حدث'}
          </Text>
        </Pressable>
      );
    }

    if (item.type === 'audio') {
      const isPlaying = playingUri === item.uri;
      return (
        <TouchableOpacity
          style={[styles.mediaCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
          onPress={() => handlePlayMedia(item)}
          disabled={loadingMedia}
        >
          <View style={[styles.audioIcon, { backgroundColor: theme.colors.primary + '15' }]}>
            <Text style={styles.audioIconText}>{isPlaying ? '⏹' : '▶️'}</Text>
          </View>
          <View style={styles.audioInfo}>
            <Text style={[styles.mediaTitle, { color: theme.colors.text }]} numberOfLines={1}>
              تسجيل صوتي
            </Text>
            <Text style={[styles.mediaMeta, { color: theme.colors.secondaryText }]}>
              {isPlaying ? 'جارٍ التشغيل...' : 'اضغط للتشغيل'}
            </Text>
          </View>
        </TouchableOpacity>
      );
    }

    return null;
  };

  const keyExtractor = (item) => item.id;

  if (loadingMedia) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <FlatList
        data={filteredMedia}
        keyExtractor={keyExtractor}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🖼️</Text>
            <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>لا توجد وسائط</Text>
            <Text style={[styles.emptyDesc, { color: theme.colors.secondaryText }]}>
              ابحث عن وسائط مرتبطة بالعناصر والأحداث من خلال إضافة صور
            </Text>
          </View>
        }
        renderItem={({ item }) => renderMedia({ item })}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
      />

      {selectedMedia ? (
        <TouchableOpacity
          style={styles.mediaViewer}
          activeOpacity={1}
          onPress={() => setSelectedMedia(null)}
        >
          <Image source={{ uri: selectedMedia.uri }} style={styles.fullScreenImage} />
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContainer: { padding: 16, gap: 12 },
  mediaCard: {
    width: 160,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  mediaImage: { width: 160, height: 120 },
  audioIcon: {
    width: 160,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  audioIconText: { fontSize: 28 },
  audioInfo: { padding: 10 },
  mediaTitle: { fontSize: 13, fontWeight: '600' },
  mediaMeta: { fontSize: 11, marginTop: 2 },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '700', marginBottom: 8 },
  emptyDesc: { fontSize: 14, textAlign: 'center' },
  mediaViewer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenImage: { width: '90%', height: '60%' },
});

export default MediaGalleryScreen;
