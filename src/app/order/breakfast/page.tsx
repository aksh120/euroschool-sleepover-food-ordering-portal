'use client';

import { motion } from 'framer-motion';
import { Coffee } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getBreakfastMenu } from '@/actions/menu';
import { useCartStore } from '@/stores/cart-store';
import { MenuItemCard } from '@/components/order/menu-item-card';
import { FloatingCart } from '@/components/order/floating-cart';
import { MenuGridSkeleton } from '@/components/shared/loading-skeleton';
import { EmptyState } from '@/components/shared/empty-state';
import type { BreakfastItem } from '@/types/database';

export default function BreakfastPage() {
  const { breakfastItems, addBreakfastItem, updateBreakfastQuantity } = useCartStore();

  const { data: menuItems = [], isLoading } = useQuery({
    queryKey: ['breakfast-menu'],
    queryFn: () => getBreakfastMenu(),
  });

  const getItemQuantity = (itemId: string) =>
    breakfastItems.find((i) => i.id === itemId)?.quantity || 0;

  const handleAdd = (item: BreakfastItem) => {
    addBreakfastItem({
      id: item.id,
      name: item.name,
      description: item.description,
      price: Number(item.price),
      image_url: item.image_url,
      veg_status: item.veg_status,
    });
  };

  return (
    <div className="max-w-5xl mx-auto pb-24 sm:pb-16 px-1">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-6 sm:mb-8"
      >
        <div className="inline-flex items-center justify-center h-10 w-10 sm:h-12 sm:w-12 rounded-2xl bg-green-500/10 border border-green-500/20 mb-3 text-green-400">
          <Coffee className="h-5 w-5 sm:h-6 sm:w-6" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold font-[var(--font-heading)] text-white tracking-tight">
          Breakfast Menu
        </h2>
        <p className="mt-1 text-xs sm:text-sm text-zinc-400">
          Choose your morning meal for the sleepover
        </p>
      </motion.div>

      {/* Menu Grid */}
      {isLoading ? (
        <MenuGridSkeleton count={3} />
      ) : (menuItems as BreakfastItem[]).length === 0 ? (
        <EmptyState
          title="No breakfast items available"
          description="The breakfast menu hasn't been configured yet"
        />
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-4xl mx-auto"
        >
          {(menuItems as BreakfastItem[]).map((item) => (
            <MenuItemCard
              key={item.id}
              item={item}
              quantity={getItemQuantity(item.id)}
              onAdd={() => handleAdd(item)}
              onRemove={() => updateBreakfastQuantity(item.id, 0)}
              onUpdateQuantity={(qty) => updateBreakfastQuantity(item.id, qty)}
            />
          ))}
        </motion.div>
      )}

      {/* Floating Cart & Bottom Bar */}
      <FloatingCart nextPath="/order/payment" nextLabel="Proceed to Payment" />
    </div>
  );
}
