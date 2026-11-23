/**
 * MAZRATI - Event Details Screen
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Audio } from 'expo-av';
import { useTheme } from '../../contexts/ThemeContext';
import { useEvents } from '../../contexts/EventsContext';
import { useItems } from '../../contexts/ItemsContext';
import { EVENT_TYPES } from '../../services/eventService';

const EventDetailsScreen = () => {
  const { theme } = useTheme();
  const { getEventById, deleteEvent, updateEvent } = useEvents();
  const { getItemById } = useItems();
  const router = useRouter();
  const params = useLocalSearchParams();
  const eventId = params.id;

  const [event, setEvent] = useState(null);
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const loadData = useCallback(async () => {
    const ev = await getEventById(eventId);
    setEvent(ev);
    if (ev && ev.itemId) {
      const it = await getItemById(ev.itemId);
      setItem(it);
    }
    setLoading(false);
  }, [eventId, getEventById, getItemById]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleEdit = () => {
    router.push(`/events/add?id=${eventId}`);
  };

  const handleDelete = () => {
    Alert.alert(
      'حذف حدث',
      'هل أنت متأكد من حذف هذا الحدث؟',
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'حذف',
          style: 'destructive',
          onPress: async () => {
            await deleteEvent(eventId);
            router.back();
          },
        },
      ]
    );
  };

  const playAudio = async () => {
    if (!event?.audioUri) return;
    try {
      if (sound) {
        await sound.unloadAsync();
      }
      const { sound: newSound } = await Audio.Sound.createAsync({ uri: event.audioUri });
      setSound(newSound);
      setIsPlaying(true);
      await newSound.playAsync();
      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          setIsPlaying(false);
        }
      });
    } catch (err) {
      Alert.alert('خطأ', 'تعذر تشغيل التسجيل');
    }
  };

  const stopAudio = async () => {
    if (sound) {
      await sound.stopAsync();
      setIsPlaying(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!event) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.errorText, { color: theme.colors.text }]}>الحدث غير موجود</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={[styles.backLink, { color: theme.colors.primary }]}>رجوع</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const typeInfo = EVENT_TYPES.find((t) => t.key === event.type);

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View style={[styles.typeIcon, { backgroundColor: theme.colors.primary + '15' }]}>
          <Text style={styles.typeIconText}>{typeInfo?.icon || '📌'}</Text>
        </View>
        <Text style={[styles.title, { color: theme.colors.text }]}>{event.title}</Text>
        <Text style={[styles.typeLabel, { color: theme.colors.secondaryText }]}>
          {typeInfo?.label || event.type}
          {event.customType ? ` — ${event.customType}` : ''}
        </Text>
      </View>

      {/* Date/Time */}
      <View style={[styles.metaCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
        <View style={styles.metaRow}>
          <Text style={[styles.metaLabel, { color: theme.colors.secondaryText }]}>📅 التاريخ</Text>
          <Text style={[styles.metaValue, { color: theme.colors.text }]}>
            {new Date(event.date).toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </Text>
        </View>
        <View style={styles.metaRow}>
          <Text style={[styles.metaLabel, { color: theme.colors.secondaryText }]}>⏰ الوقت</Text>
          <Text style={[styles.metaValue, { color: theme.colors.text }]}>{event.time}</Text>
        </View>
      </View>

      {/* Related Item */}
      {item ? (
        <TouchableOpacity
          style={[styles.relatedCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
          onPress={() => router.push(`/items/${item.id}`)}
        >
          <Text style={[styles.relatedLabel, { color: theme.colors.secondaryText }]}>العنصر المرتبط</Text>
          <Text style={[styles.relatedName, { color: theme.colors.primary }]}>{item.name} ({item.internalNumber})</Text>
        </TouchableOpacity>
      ) : null}

      {/* Description */}
      {event.description ? (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>الوصف</Text>
          <Text style={[styles.descText, { color: theme.colors.secondaryText }]}>{event.description}</Text>
        </View>
      ) : null}

      {/* Images */}
      {event.images && event.images.length > 0 ? (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>الصور ({event.images.length})</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {event.images.map((uri, idx) => (
              <Image key={idx} source={{ uri }} style={styles.eventImage} />
            ))}
          </ScrollView>
        </View>
      ) : null}

      {/* Audio */}
      {event.audioUri ? (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>تسجيل صوتي</Text>
          <View style={[styles.audioPlayer, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
            <TouchableOpacity
              style={styles.playButton}
              onPress={isPlaying ? stopAudio : playAudio}
            >
              <Text style={styles.playButtonText}>{isPlaying ? '⏹' : '▶️'}</Text>
            </TouchableOpacity>
            <Text style={[styles.audioLabel, { color: theme.colors.text }]}>تشغيل التسجيل</Text>
          </View>
        </View>
      ) : null}

      {/* Actions */}
      <View style={styles.actionsRow}>
        <TouchableOpacity style={[styles.actionButton, { backgroundColor: theme.colors.primary }]} onPress={handleEdit}>
          <Text style={styles.actionButtonText}>✏️ تعديل</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionButton, { backgroundColor: 'rgba(211,47,47,0.1)' }]} onPress={handleDelete}>
          <Text style={[styles.actionButtonText, { color: '#D32F2F' }]}>🗑️ حذف</Text>
        </TouchableOpacity>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  errorText: { fontSize: 16, marginBottom: 12 },
  backLink: { fontSize: 14, fontWeight: '600' },
  header: { alignItems: 'center', padding: 24, gap: 8 },
  typeIcon: { width: 64, height: 64, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  typeIconText: { fontSize: 32 },
  title: { fontSize: 22, fontWeight: '700', textAlign: 'center' },
  typeLabel: { fontSize: 14 },
  metaCard: { marginHorizontal: 16, borderRadius: 14, borderWidth: 1, padding: 16, gap: 8, marginBottom: 16 },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  metaLabel: { fontSize: 13 },
  metaValue: { fontSize: 13, fontWeight: '600' },
  relatedCard: { marginHorizontal: 16, borderRadius: 14, borderWidth: 1, padding: 16, marginBottom: 16 },
  relatedLabel: { fontSize: 12, marginBottom: 4 },
  relatedName: { fontSize: 15, fontWeight: '600' },
  section: { paddingHorizontal: 16, marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 8 },
  descText: { fontSize: 14, lineHeight: 20 },
  eventImage: { width: 120, height: 120, borderRadius: 12, marginRight: 8 },
  audioPlayer: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12, borderWidth: 1, gap: 12 },
  playButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(46,125,70,0.1)', alignItems: 'center', justifyContent: 'center' },
  playButtonText: { fontSize: 20 },
  audioLabel: { flex: 1, fontSize: 14, fontWeight: '600' },
  actionsRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 10, marginTop: 8 },
  actionButton: { flex: 1, paddingVertical: 14, borderRadius: 10, alignItems: 'center' },
  actionButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
});

export default EventDetailsScreen;
