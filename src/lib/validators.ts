import { z } from 'zod';
import { ACCEPTED_IMAGE_TYPES, MAX_SCREENSHOT_SIZE } from './constants';

// ============================================
// Student Form Schema
// ============================================
export const studentFormSchema = z.object({
  full_name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be at most 100 characters')
    .trim(),
  class: z.string().min(1, 'Please select a class'),
  section: z.string().min(1, 'Please select a section'),
  phone: z
    .string()
    .min(1, 'Phone number is required')
    .regex(/^[6-9]\d{9}$/, 'Please enter a valid 10-digit Indian phone number'),
  email: z
    .string()
    .min(1, 'Email address is required')
    .email('Please enter a valid email address'),
  roll_number: z.string().optional(),
  house: z.string().optional(),
  honeypot: z.string().max(0, 'Bot detected').optional(), // Anti-bot
});

export type StudentFormValues = z.infer<typeof studentFormSchema>;

// ============================================
// Order Item Schema
// ============================================
export const orderItemSchema = z.object({
  id: z.string().uuid(),
  quantity: z.number().int().min(1).max(20),
  unit_price: z.number().positive(),
  item_name: z.string(),
});

// ============================================
// Order Submission Schema
// ============================================
export const orderSubmissionSchema = z.object({
  student: studentFormSchema,
  dinnerItems: z.array(orderItemSchema).max(50, 'Cannot order more than 50 dinner items'),
  breakfastItems: z.array(orderItemSchema).max(50, 'Cannot order more than 50 breakfast items'),
  dinnerTotal: z.number().min(0),
  breakfastTotal: z.number().min(0),
  grandTotal: z.number().min(0),
});

export type OrderSubmissionValues = z.infer<typeof orderSubmissionSchema>;

// ============================================
// Payment Schema
// ============================================
export const paymentSchema = z.object({
  transactionId: z.string().optional(),
  confirmed: z.literal(true, {
    message: 'You must confirm that you have completed the payment',
  }),
});

export type PaymentFormValues = z.infer<typeof paymentSchema>;

// Screenshot validation (client-side only, since File isn't available on server)
export function validateScreenshot(file: File): string | null {
  if (!file) return 'Payment screenshot is required';
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    return 'File must be a JPEG, PNG, or WebP image';
  }
  if (file.size > MAX_SCREENSHOT_SIZE) {
    return 'File must be less than 5MB';
  }
  return null;
}

// ============================================
// Admin Login Schema
// ============================================
export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

// ============================================
// Menu Item Schema (Admin)
// ============================================
export const menuItemSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  description: z.string().max(500).optional(),
  price: z.number().positive('Price must be greater than 0'),
  category: z.string().min(1, 'Category is required'),
  veg_status: z.enum(['veg', 'non-veg']),
  platform: z.enum(['swiggy', 'zomato', 'manual']).optional(),
  available: z.boolean(),
});

export type MenuItemFormValues = z.infer<typeof menuItemSchema>;

// ============================================
// Settings Schema (Admin)
// ============================================
export const settingsSchema = z.object({
  ordering_deadline: z.string().min(1, 'Ordering deadline is required'),
  ordering_open: z.enum(['true', 'false']),
  dinner_restaurant: z.string().min(1, 'Dinner restaurant is required'),
  breakfast_restaurant: z.string().min(1, 'Breakfast restaurant is required'),
  upi_id: z.string().optional(),
  account_holder: z.string().optional(),
});

export type SettingsFormValues = z.infer<typeof settingsSchema>;

// ============================================
// Admin Order Action Schema
// ============================================
export const orderActionSchema = z.object({
  orderId: z.string().uuid(),
  action: z.enum(['approve', 'reject', 'request_reupload', 'mark_paid']),
  remarks: z.string().max(500).optional(),
  rejectionReason: z.string().max(500).optional(),
});

export type OrderActionValues = z.infer<typeof orderActionSchema>;

// ============================================
// Bulk Action Schema
// ============================================
export const bulkActionSchema = z.object({
  orderIds: z.array(z.string().uuid()).min(1, 'Select at least one order'),
  action: z.enum(['approve', 'reject']),
  remarks: z.string().max(500).optional(),
});

export type BulkActionValues = z.infer<typeof bulkActionSchema>;

// ============================================
// Order Search Schema
// ============================================
export const orderSearchSchema = z.object({
  query: z.string().min(1, 'Enter an order ID or student name'),
});

export type OrderSearchValues = z.infer<typeof orderSearchSchema>;
