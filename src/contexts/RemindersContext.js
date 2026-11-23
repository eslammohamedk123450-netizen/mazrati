/**
 * MAZRATI - Reminders Context
 * إدارة حالة التذكيرات مع تحديث تلقائي
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as ReminderService from '../services/reminderService';

const RemindersContext = createContext(null);

export function RemindersProvider({ children }) {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    try {
      setError(null);
      const data = await ReminderService.getReminders();
      setReminders(data);
    } catch (err) {
      setError('تعذر تحميل التذكيرات');
      console.error('Reminders load error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const createReminder = useCallback(async (data) => {
    const created = await ReminderService.createReminder(data);
    setReminders((prev) => [...prev, created]);
    return created;
  }, []);

  const updateReminder = useCallback(async (id, updates) => {
    const updated = await ReminderService.updateReminder(id, updates);
    if (updated) {
      setReminders((prev) => prev.map((r) => (r.id === id ? updated : r)));
    }
    return updated;
  }, []);

  const deleteReminder = useCallback(async (id) => {
    await ReminderService.deleteReminder(id);
    setReminders((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const toggleReminderDone = useCallback(async (id) => {
    const updated = await ReminderService.toggleReminderDone(id);
    if (updated) {
      setReminders((prev) => prev.map((r) => (r.id === id ? updated : r)));
    }
    return updated;
  }, []);

  const upcoming = ReminderService.getUpcomingReminders;
  const overdue = ReminderService.getOverdueReminders;

  return (
    <RemindersContext.Provider
      value={{
        reminders,
        loading,
        error,
        refresh,
        createReminder,
        updateReminder,
        deleteReminder,
        toggleReminderDone,
        getUpcomingReminders: upcoming,
        getOverdueReminders: overdue,
      }}
    >
      {children}
    </RemindersContext.Provider>
  );
}

export const useReminders = () => {
  const context = useContext(RemindersContext);
  if (!context) {
    throw new Error('useReminders must be used within RemindersProvider');
  }
  return context;
};

export default RemindersContext;
