// ============================================
// Database Types for Supabase
// ============================================

export type VegStatus = 'veg' | 'non-veg';
export type OrderStatus = 'pending' | 'approved' | 'rejected';
export type PaymentStatus = 'pending' | 'verified' | 'rejected' | 'reupload_requested';
export type Platform = 'swiggy' | 'zomato' | 'manual';
export type RestaurantType = 'dinner' | 'breakfast';
export type AdminRole = 'admin' | 'super_admin';

// ============================================
// Table Row Types
// ============================================

export interface Restaurant {
  id: string;
  name: string;
  type: RestaurantType;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DinnerItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  category: string;
  veg_status: VegStatus;
  platform: Platform | null;
  available: boolean;
  restaurant_id: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface BreakfastItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  veg_status: VegStatus;
  available: boolean;
  restaurant_id: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Student {
  id: string;
  full_name: string;
  class: string;
  section: string;
  phone: string;
  email?: string | null;
  roll_number?: string | null;
  house?: string | null;
  created_at: string;
}

export interface Order {
  id: string;
  order_id: string; // SLP-2026-XXX
  student_id: string;
  status: OrderStatus;
  dinner_total: number;
  breakfast_total: number;
  grand_total: number;
  admin_remarks: string | null;
  rejection_reason: string | null;
  is_locked: boolean;
  created_at: string;
  updated_at: string;
}

export interface OrderDinnerItem {
  id: string;
  order_id: string;
  dinner_item_id: string;
  quantity: number;
  unit_price: number;
  item_name: string;
  created_at: string;
}

export interface OrderBreakfastItem {
  id: string;
  order_id: string;
  breakfast_item_id: string;
  quantity: number;
  unit_price: number;
  item_name: string;
  created_at: string;
}

export interface Payment {
  id: string;
  order_id: string;
  screenshot_url: string;
  transaction_id: string | null;
  status: PaymentStatus;
  verified_by: string | null;
  verified_at: string | null;
  remarks: string | null;
  created_at: string;
  updated_at: string;
}

export interface QRCode {
  id: string;
  image_url: string;
  upi_id: string | null;
  account_holder: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Setting {
  key: string;
  value: string;
  description: string | null;
  updated_at: string;
}

export interface AuditLog {
  id: string;
  admin_id: string | null;
  admin_email: string | null;
  action: string;
  entity: string;
  entity_id: string | null;
  details: Record<string, unknown> | null;
  created_at: string;
}

export interface AdminUser {
  id: string;
  email: string;
  role: AdminRole;
  created_at: string;
}

export interface OrderWithStudent extends Order {
  student: Student;
}

export interface OrderWithDetails extends OrderWithStudent {
  dinner_items: (OrderDinnerItem & { dinner_item: DinnerItem })[];
  breakfast_items: (OrderBreakfastItem & { breakfast_item: BreakfastItem })[];
  payment: Payment | null;
}

export interface OrderFull extends OrderWithDetails {}

export type StudentInsert = Omit<Student, 'id' | 'created_at'>;
export type OrderInsert = Omit<Order, 'id' | 'created_at' | 'updated_at'>;
export type DinnerItemInsert = Omit<DinnerItem, 'id' | 'created_at' | 'updated_at'>;
export type BreakfastItemInsert = Omit<BreakfastItem, 'id' | 'created_at' | 'updated_at'>;
export type PaymentInsert = Omit<Payment, 'id' | 'created_at' | 'updated_at'>;

export interface Database {
  public: {
    Tables: {
      restaurants: {
        Row: Restaurant;
        Insert: Omit<Restaurant, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Restaurant, 'id' | 'created_at'>>;
      };
      dinner_items: {
        Row: DinnerItem;
        Insert: DinnerItemInsert;
        Update: Partial<Omit<DinnerItem, 'id' | 'created_at'>>;
      };
      breakfast_items: {
        Row: BreakfastItem;
        Insert: BreakfastItemInsert;
        Update: Partial<Omit<BreakfastItem, 'id' | 'created_at'>>;
      };
      students: {
        Row: Student;
        Insert: StudentInsert;
        Update: Partial<Omit<Student, 'id' | 'created_at'>>;
      };
      orders: {
        Row: Order;
        Insert: OrderInsert;
        Update: Partial<Omit<Order, 'id' | 'created_at'>>;
      };
      order_dinner_items: {
        Row: OrderDinnerItem;
        Insert: Omit<OrderDinnerItem, 'id' | 'created_at'>;
        Update: Partial<Omit<OrderDinnerItem, 'id' | 'created_at'>>;
      };
      order_breakfast_items: {
        Row: OrderBreakfastItem;
        Insert: Omit<OrderBreakfastItem, 'id' | 'created_at'>;
        Update: Partial<Omit<OrderBreakfastItem, 'id' | 'created_at'>>;
      };
      payments: {
        Row: Payment;
        Insert: PaymentInsert;
        Update: Partial<Omit<Payment, 'id' | 'created_at'>>;
      };
      qr_codes: {
        Row: QRCode;
        Insert: Omit<QRCode, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<QRCode, 'id' | 'created_at'>>;
      };
      settings: {
        Row: Setting;
        Insert: Omit<Setting, 'updated_at'>;
        Update: Partial<Omit<Setting, 'updated_at'>>;
      };
      audit_logs: {
        Row: AuditLog;
        Insert: Omit<AuditLog, 'id' | 'created_at'>;
        Update: never;
      };
      admin_users: {
        Row: AdminUser;
        Insert: Omit<AdminUser, 'created_at'>;
        Update: Partial<Omit<AdminUser, 'id' | 'created_at'>>;
      };
    };
  };
}
