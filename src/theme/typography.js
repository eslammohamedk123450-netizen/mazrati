/**
 * MAZRATI - نظام الطباعة والخطوط
 * يدعم الخط العربي Tajawal والخط الإنجليزي
 */

export const Typography = {
  // أحجام الخطوط
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    md: 18,
    lg: 20,
    xl: 24,
    xxl: 32,
  },
  // سمك الخطوط
  fontWeight: {
    thin: '300',
    light: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },
  //families
  fontFamily: {
    regular: 'Tajawal-Regular',
    medium: 'Tajawal-Medium',
    bold: 'Tajawal-Bold',
  },
  // ارتفاع السطر
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
};

export default Typography;
