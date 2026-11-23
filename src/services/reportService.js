/**
 * MAZRATI - Report Service
 * إحصاءات وتقارير مبنية على البيانات الحقيقية (أقسام/عناصر/أحداث/تذكيرات).
 */

import { ITEM_STATUSES, ITEM_TYPES } from './itemService';
import { EVENT_TYPES } from './eventService';

const pad = (n) => String(n).padStart(2, '0');

/** فترات جاهزة للتقارير */
export const getPeriodRange = (period, now = new Date()) => {
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);

  switch (period) {
    case 'week': {
      const day = start.getDay(); // 0 = الأحد
      start.setDate(start.getDate() - day);
      break;
    }
    case 'month':
      start.setDate(1);
      break;
    case 'year':
      start.setMonth(0, 1);
      break;
    case 'all':
      start.setFullYear(2000, 0, 1);
      break;
    case 'today':
    default:
      break;
  }
  return { start, end };
};

const isWithin = (dateStr, timeStr, range) => {
  if (!dateStr) return false;
  const [y, m, d] = String(dateStr).split('-').map(Number);
  if (!y) return false;
  const [hh, mm] = String(timeStr || '00:00').split(':').map(Number);
  const value = new Date(y, (m || 1) - 1, d, hh || 0, mm || 0);
  return value >= range.start && value <= range.end;
};

const countBy = (list, keyFn) => {
  const out = {};
  list.forEach((entry) => {
    const key = keyFn(entry) || 'unknown';
    out[key] = (out[key] || 0) + 1;
  });
  return out;
};

/** تقرير شامل عن البيانات */
export const buildReport = ({ categories, items, events, reminders }, period = 'all') => {
  const range = getPeriodRange(period);
  const periodEvents = events.filter((e) => isWithin(e.date, e.time, range));
  const periodReminders = reminders.filter((r) => isWithin(r.date, r.time, range));

  const itemsByCategory = categories.map((c) => ({
    id: c.id,
    name: c.name,
    color: c.color || '#2E7D46',
    count: items.filter((i) => i.categoryId === c.id).length,
  }));

  const eventsByType = EVENT_TYPES.map((t) => ({
    key: t.key,
    label: t.label,
    icon: t.icon,
    count: periodEvents.filter((e) => e.type === t.key).length,
  })).filter((t) => t.count > 0);

  const itemsByStatus = ITEM_STATUSES.map((s) => ({
    key: s.key,
    label: s.label,
    color: s.color,
    count: items.filter((i) => i.status === s.key).length,
  })).filter((s) => s.count > 0);

  const itemsByType = ITEM_TYPES.map((t) => ({
    key: t.key,
    label: t.label,
    count: items.filter((i) => i.type === t.key).length,
  })).filter((t) => t.count > 0);

  const remindersByStatus = countBy(periodReminders, (r) => r.status || 'pending');

  return {
    period,
    from: `${range.start.getFullYear()}-${pad(range.start.getMonth() + 1)}-${pad(range.start.getDate())}`,
    to: `${range.end.getFullYear()}-${pad(range.end.getMonth() + 1)}-${pad(range.end.getDate())}`,
    totals: {
      categories: categories.length,
      items: items.length,
      events: events.length,
      reminders: reminders.length,
      periodEvents: periodEvents.length,
      periodReminders: periodReminders.length,
    },
    itemsByCategory,
    itemsByStatus,
    itemsByType,
    eventsByType,
    remindersByStatus,
    recentEvents: [...periodEvents]
      .sort((a, b) => new Date(b.date + 'T' + (b.time || '00:00')) - new Date(a.date + 'T' + (a.time || '00:00')))
      .slice(0, 10),
  };
};

/** تصدير التقرير كنص قابل للقراءة/النسخ */
export const reportToText = (report) => {
  const lines = [];
  lines.push('تقرير مزرعتي');
  lines.push(`الفترة: ${report.from} ← ${report.to}`);
  lines.push('--------------------------------');
  lines.push(`الأقسام: ${report.totals.categories}`);
  lines.push(`العناصر: ${report.totals.items}`);
  lines.push(`الأحداث: ${report.totals.events} (خلال الفترة: ${report.totals.periodEvents})`);
  lines.push(`التذكيرات: ${report.totals.reminders} (خلال الفترة: ${report.totals.periodReminders})`);
  lines.push('');
  lines.push('العناصر حسب القسم:');
  report.itemsByCategory.forEach((c) => lines.push(`- ${c.name}: ${c.count}`));
  lines.push('');
  if (report.itemsByStatus.length) {
    lines.push('العناصر حسب الحالة:');
    report.itemsByStatus.forEach((s) => lines.push(`- ${s.label}: ${s.count}`));
    lines.push('');
  }
  if (report.eventsByType.length) {
    lines.push('الأحداث حسب النوع:');
    report.eventsByType.forEach((t) => lines.push(`- ${t.label}: ${t.count}`));
    lines.push('');
  }
  if (report.recentEvents.length) {
    lines.push('أحدث الأحداث:');
    report.recentEvents.forEach((e) => lines.push(`- ${e.date} ${e.time || ''} • ${e.title}`));
  }
  return lines.join('\n');
};

export default { getPeriodRange, buildReport, reportToText };
