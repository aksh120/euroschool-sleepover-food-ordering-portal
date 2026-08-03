// ============================================
// App Constants
// ============================================

export const APP_NAME = 'Project Cheesecake Senior Sleepover';
export const APP_YEAR = 2026;
export const EVENT_DATE_START = '2026-08-21T17:00:00+05:30';
export const EVENT_DATE_END = '2026-08-22T10:00:00+05:30';
export const REPORTING_TIME = '5:00 PM';

// Student form options: 11th & 12th class only, Sections A & B only
export const CLASSES = ['11', '12'] as const;
export const SECTIONS = ['A', 'B'] as const;

// Order status labels and colors
export const ORDER_STATUS = {
  pending: { label: 'Pending', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
  approved: { label: 'Approved', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
  rejected: { label: 'Rejected', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
} as const;

export const PAYMENT_STATUS = {
  pending: { label: 'Payment Pending', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
  verified: { label: 'Payment Verified', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
  rejected: { label: 'Payment Rejected', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
  reupload_requested: { label: 'Re-upload Requested', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
} as const;

// Menu categories
export const DINNER_CATEGORIES = [
  'All',
  'Burgers',
  'Wraps',
  'Sides',
  'Beverages',
  'Desserts',
  'Combos',
] as const;

// Order ID prefix
export const ORDER_ID_PREFIX = 'SLP-2026-';

// File upload limits
export const MAX_SCREENSHOT_SIZE = 5 * 1024 * 1024; // 5MB
export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

// Veg/Non-Veg filter options
export const VEG_FILTERS = [
  { label: 'All', value: 'all' },
  { label: 'Veg Only', value: 'veg' },
  { label: 'Non-Veg Only', value: 'non-veg' },
] as const;

// Order steps
export const ORDER_STEPS = [
  { step: 1 as const, label: 'Student Details', icon: 'user', path: '/order/student-details' },
  { step: 2 as const, label: 'Dinner', icon: 'utensils', path: '/order/dinner' },
  { step: 3 as const, label: 'Breakfast', icon: 'coffee', path: '/order/breakfast' },
  { step: 4 as const, label: 'Payment', icon: 'credit-card', path: '/order/payment' },
  { step: 5 as const, label: 'Confirmation', icon: 'check-circle', path: '/order/confirmation' },
] as const;

// Admin sidebar navigation
export const ADMIN_NAV_ITEMS = [
  { label: 'Dashboard', icon: 'layout-dashboard', path: '/admin/dashboard' },
  { label: 'Orders', icon: 'shopping-bag', path: '/admin/orders' },
  { label: 'Dinner Menu', icon: 'utensils', path: '/admin/menu/dinner' },
  { label: 'Breakfast Menu', icon: 'coffee', path: '/admin/menu/breakfast' },
  { label: 'Payments', icon: 'credit-card', path: '/admin/payments' },
  { label: 'Kitchen', icon: 'chef-hat', path: '/admin/kitchen' },
  { label: 'Reports', icon: 'file-bar-chart', path: '/admin/reports' },
  { label: 'Settings', icon: 'settings', path: '/admin/settings' },
  { label: 'Audit Logs', icon: 'scroll-text', path: '/admin/audit' },
] as const;
