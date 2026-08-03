'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem, StudentFormData } from '@/types/order';

interface CartStore {
  // Student info
  studentInfo: StudentFormData | null;
  setStudentInfo: (info: StudentFormData) => void;

  // Dinner items
  dinnerItems: CartItem[];
  addDinnerItem: (item: Omit<CartItem, 'quantity' | 'type'>) => void;
  removeDinnerItem: (id: string) => void;
  updateDinnerQuantity: (id: string, quantity: number) => void;

  // Breakfast items
  breakfastItems: CartItem[];
  addBreakfastItem: (item: Omit<CartItem, 'quantity' | 'type'>) => void;
  removeBreakfastItem: (id: string) => void;
  updateBreakfastQuantity: (id: string, quantity: number) => void;

  // Totals
  getDinnerTotal: () => number;
  getBreakfastTotal: () => number;
  getGrandTotal: () => number;
  getTotalItems: () => number;

  // Order data
  orderId: string | null;
  setOrderId: (id: string) => void;

  // Actions
  clearCart: () => void;
  clearAll: () => void;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      // Student info
      studentInfo: null,
      setStudentInfo: (info) => set({ studentInfo: info }),

      // Dinner items
      dinnerItems: [],
      addDinnerItem: (item) => {
        const existing = get().dinnerItems.find((i) => i.id === item.id);
        if (existing) {
          set({
            dinnerItems: get().dinnerItems.map((i) =>
              i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
            ),
          });
        } else {
          set({
            dinnerItems: [...get().dinnerItems, { ...item, quantity: 1, type: 'dinner' }],
          });
        }
      },
      removeDinnerItem: (id) => {
        set({
          dinnerItems: get().dinnerItems.filter((i) => i.id !== id),
        });
      },
      updateDinnerQuantity: (id, quantity) => {
        if (quantity <= 0) {
          set({ dinnerItems: get().dinnerItems.filter((i) => i.id !== id) });
        } else {
          set({
            dinnerItems: get().dinnerItems.map((i) =>
              i.id === id ? { ...i, quantity } : i
            ),
          });
        }
      },

      // Breakfast items
      breakfastItems: [],
      addBreakfastItem: (item) => {
        const existing = get().breakfastItems.find((i) => i.id === item.id);
        if (existing) {
          set({
            breakfastItems: get().breakfastItems.map((i) =>
              i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
            ),
          });
        } else {
          set({
            breakfastItems: [...get().breakfastItems, { ...item, quantity: 1, type: 'breakfast' }],
          });
        }
      },
      removeBreakfastItem: (id) => {
        set({
          breakfastItems: get().breakfastItems.filter((i) => i.id !== id),
        });
      },
      updateBreakfastQuantity: (id, quantity) => {
        if (quantity <= 0) {
          set({ breakfastItems: get().breakfastItems.filter((i) => i.id !== id) });
        } else {
          set({
            breakfastItems: get().breakfastItems.map((i) =>
              i.id === id ? { ...i, quantity } : i
            ),
          });
        }
      },

      // Totals
      getDinnerTotal: () =>
        get().dinnerItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
      getBreakfastTotal: () =>
        get().breakfastItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
      getGrandTotal: () => get().getDinnerTotal() + get().getBreakfastTotal(),
      getTotalItems: () =>
        get().dinnerItems.reduce((sum, item) => sum + item.quantity, 0) +
        get().breakfastItems.reduce((sum, item) => sum + item.quantity, 0),

      // Order data
      orderId: null,
      setOrderId: (id) => set({ orderId: id }),

      // Actions
      clearCart: () => set({ dinnerItems: [], breakfastItems: [] }),
      clearAll: () =>
        set({
          studentInfo: null,
          dinnerItems: [],
          breakfastItems: [],
          orderId: null,
        }),
    }),
    {
      name: 'euroschool-sleepover-cart',
    }
  )
);
