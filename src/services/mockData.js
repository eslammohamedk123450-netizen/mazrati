/**
 * MAZRATI - طبقة البيانات التجريبية (Mock Data)
 * طبقة مستقلة يمكن استبدالها مستقبلًا بقاعدة بيانات حقيقية دون إعادة كتابة الواجهات.
 */

// فئات تجريبية
export const MOCK_CATEGORIES = [
  { id: '1', name: 'حيوانات', nameEn: 'Animals', icon: 'paw', color: '#2E7D46', itemCount: 12 },
  { id: '2', name: 'نباتات', nameEn: 'Plants', icon: 'leaf', color: '#6EBD7D', itemCount: 8 },
  { id: '3', name: 'معدات', nameEn: 'Equipment', icon: 'tools', color: '#174B2A', itemCount: 15 },
  { id: '4', name: 'منتجات', nameEn: 'Products', icon: 'package', color: '#4A9E6B', itemCount: 6 },
];

// عناصر تجريبية
export const MOCK_ITEMS = [
  {
    id: '101',
    categoryId: '1',
    name: 'بقرة هولشتاين',
    nameEn: 'Holstein Cow',
    description: 'بقرة حلوب عالية الإنتاجية',
    image: null,
    createdAt: '2026-01-15T08:00:00Z',
  },
  {
    id: '102',
    categoryId: '1',
    name: 'أغنام محلية',
    nameEn: 'Local Sheep',
    description: 'أغنام للتسمين',
    image: null,
    createdAt: '2026-01-20T10:30:00Z',
  },
  {
    id: '103',
    categoryId: '2',
    name: 'نخيل تمور',
    nameEn: 'Date Palm',
    description: 'نخيل للتمور',
    image: null,
    createdAt: '2026-02-01T14:00:00Z',
  },
  {
    id: '104',
    categoryId: '3',
    name: 'جرار زراعي',
    nameEn: 'Tractor',
    description: 'جرار حراثة',
    image: null,
    createdAt: '2026-02-10T09:00:00Z',
  },
];

// أحداث تجريبية
export const MOCK_EVENTS = [
  {
    id: '201',
    title: 'تسميد النباتات',
    titleEn: 'Fertilizing Plants',
    date: '2026-03-10',
    category: 'نباتات',
    type: 'er',
    description: 'إضافة سماد عضوي للنخيل',
  },
  {
    id: '202',
    title: 'تطعيم الماشية',
    titleEn: 'Vaccinating Livestock',
    date: '2026-03-15',
    category: 'حيوانات',
    type: 'er',
    description: 'التطعيم الموسمي للأبقار',
  },
];

// أنشطة تجريبية (Recent Activities)
export const MOCK_ACTIVITIES = [
  {
    id: 'a1',
    type: 'item_added',
    title: 'إضافة عنصر جديد',
    description: 'تم إضافة "بقرة هولشتاين" إلى قسم الحيوانات',
    icon: '📦',
    time: '2026-03-05T09:30:00Z',
    relatedId: '101',
    relatedType: 'item',
  },
  {
    id: 'a2',
    type: 'category_created',
    title: 'إنشاء قسم جديد',
    description: 'تم إنشاء قسم "نباتات" بنجاح',
    icon: '🗂️',
    time: '2026-03-04T14:15:00Z',
    relatedId: '2',
    relatedType: 'category',
  },
  {
    id: 'a3',
    type: 'event_logged',
    title: 'تسجيل حدث',
    description: 'تم تسجيل حدث "تسميد النباتات" في التقويم',
    icon: '📅',
    time: '2026-03-03T11:00:00Z',
    relatedId: '201',
    relatedType: 'event',
  },
  {
    id: 'a4',
    type: 'item_updated',
    title: 'تعديل بيانات عنصر',
    description: 'تم تحديث معلومات "جرار زراعي"',
    icon: '✏️',
    time: '2026-03-02T16:45:00Z',
    relatedId: '104',
    relatedType: 'item',
  },
  {
    id: 'a5',
    type: 'reminder_set',
    title: 'تعيين تذكير',
    description: 'تم تعيين تذكير "تطعيم الماشية"',
    icon: '🔔',
    time: '2026-03-01T08:20:00Z',
    relatedId: '202',
    relatedType: 'event',
  },
];

// تذكيرات قادمة (Upcoming Reminders)
export const MOCK_REMINDERS = [
  {
    id: 'r1',
    title: 'تطعيم الماشية',
    description: 'التطعيم الموسمي للأبقار',
    date: '2026-03-15',
    time: '09:00',
    category: 'حيوانات',
    relatedItemId: '101',
    urgency: 'soon', // soon | upcoming | later
  },
  {
    id: 'r2',
    title: 'تسميد النباتات',
    description: 'إضافة سماد عضوي للنخيل',
    date: '2026-03-10',
    time: '07:30',
    category: 'نباتات',
    relatedItemId: '103',
    urgency: 'urgent',
  },
  {
    id: 'r3',
    title: 'صيانة الجرار',
    description: 'فحص دوري للجرار الزراعي',
    date: '2026-03-25',
    time: '10:00',
    category: 'معدات',
    relatedItemId: '104',
    urgency: 'later',
  },
];

// إشعارات تجريبية (Notifications)
export const MOCK_NOTIFICATIONS = [
  { id: 'n1', title: 'تذكير: تطعيم الماشية', read: false },
  { id: 'n2', title: 'تم إضافة عنصر جديد', read: false },
];

// دوال مساعدة للوصول إلى البيانات (واجهة يمكن استبدالها)
export const MockDataService = {
  getCategories: () => Promise.resolve([...MOCK_CATEGORIES]),
  getCategoryById: (id) =>
    Promise.resolve(MOCK_CATEGORIES.find((c) => c.id === id) || null),
  getItems: () => Promise.resolve([...MOCK_ITEMS]),
  getItemsByCategory: (categoryId) =>
    Promise.resolve(MOCK_ITEMS.filter((i) => i.categoryId === categoryId)),
  getItemById: (id) =>
    Promise.resolve(MOCK_ITEMS.find((i) => i.id === id) || null),
  getEvents: () => Promise.resolve([...MOCK_EVENTS]),
  getEventById: (id) =>
    Promise.resolve(MOCK_EVENTS.find((e) => e.id === id) || null),
  // Home Screen specific
  getHomeStats: () =>
    Promise.resolve({
      categoriesCount: MOCK_CATEGORIES.length,
      itemsCount: MOCK_ITEMS.length,
      eventsCount: MOCK_EVENTS.length,
      remindersCount: MOCK_REMINDERS.length,
    }),
  getRecentActivities: (limit = 5) =>
    Promise.resolve([...MOCK_ACTIVITIES].slice(0, limit)),
  getUpcomingReminders: (limit = 5) =>
    Promise.resolve([...MOCK_REMINDERS].slice(0, limit)),
  getNotifications: () => Promise.resolve([...MOCK_NOTIFICATIONS]),
  getUnreadNotificationsCount: () =>
    Promise.resolve(MOCK_NOTIFICATIONS.filter((n) => !n.read).length),
};

export default MockDataService;
