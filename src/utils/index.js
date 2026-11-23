/**
 * MAZRATi - أدوات مساعدة عامة (Utilities)
 */

/**
 * تنسيق التاريخ إلى صيغة عربية مقروءة
 */
export const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('ar-SA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

/**
 * تنسيق الوقت
 */
export const formatTime = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleTimeString('ar-SA', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * تقطيع النص وإضافة نقاط suspense إذا كان طويلاً
 */
export const truncateText = (text, maxLength = 50) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
};

/**
 * دمج أنماط 스타일 بشكل آمن
 */
export const mergeStyles = (...styles) => {
  return styles.filter(Boolean);
};

/**
 * تأخير تنفيذ دالة (Debounce بسيط)
 */
export const debounce = (func, wait) => {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
};

/**
 * إنشاء معرف فريد بسيط
 */
export const generateId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export default {
  formatDate,
  formatTime,
  truncateText,
  mergeStyles,
  debounce,
  generateId,
};
