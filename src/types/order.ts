// ============================================
// Cart & Order Types
// ============================================

export interface CartItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  veg_status: 'veg' | 'non-veg';
  quantity: number;
  category?: string;
  type: 'dinner' | 'breakfast';
}

export interface CartState {
  dinnerItems: CartItem[];
  breakfastItems: CartItem[];
  studentInfo: StudentFormData | null;
}

export interface StudentFormData {
  full_name: string;
  class: string;
  section: string;
  phone: string;
  email: string;
  roll_number?: string;
  house?: string;
  honeypot?: string; // Anti-bot hidden field
}

export interface OrderSummary {
  orderId: string;
  studentName: string;
  dinnerItems: CartItem[];
  breakfastItems: CartItem[];
  dinnerTotal: number;
  breakfastTotal: number;
  grandTotal: number;
  submissionTime: string;
  paymentStatus: string;
  verificationStatus: string;
}

export interface PaymentFormData {
  screenshotFile: File;
  transactionId?: string;
  confirmed: boolean;
}

export type OrderStep = 1 | 2 | 3 | 4 | 5;

export interface OrderStepInfo {
  step: OrderStep;
  label: string;
  icon: string;
  path: string;
}
