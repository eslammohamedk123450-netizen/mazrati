/**
 * MAZRATI - Events Context
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as EventService from '../services/eventService';

const EventsContext = createContext(null);

export function EventsProvider({ children }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await EventService.getEvents();
      setEvents(data);
    } catch (err) {
      setError('تعذر تحميل الأحداث');
      console.error('Events load error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const createEvent = useCallback(async (data) => {
    const newEvent = await EventService.createEvent(data);
    setEvents((prev) => [newEvent, ...prev]);
    return newEvent;
  }, []);

  const updateEvent = useCallback(async (id, updates) => {
    const updated = await EventService.updateEvent(id, updates);
    if (updated) {
      setEvents((prev) => prev.map((e) => (e.id === id ? updated : e)));
    }
    return updated;
  }, []);

  const deleteEvent = useCallback(async (id) => {
    await EventService.deleteEvent(id);
    setEvents((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const getEventById = useCallback(
    (id) => events.find((e) => e.id === id) || null,
    [events]
  );

  const getEventsByItem = useCallback(
    (itemId) => events.filter((e) => e.itemId === itemId).sort((a, b) => new Date(b.date + 'T' + b.time) - new Date(a.date + 'T' + a.time)),
    [events]
  );

  return (
    <EventsContext.Provider
      value={{
        events,
        loading,
        error,
        refresh,
        createEvent,
        updateEvent,
        deleteEvent,
        getEventById,
        getEventsByItem,
      }}
    >
      {children}
    </EventsContext.Provider>
  );
}

export const useEvents = () => {
  const context = useContext(EventsContext);
  if (context === undefined) {
    throw new Error('useEvents must be used within EventsProvider');
  }
  return context;
};

export default EventsContext;
