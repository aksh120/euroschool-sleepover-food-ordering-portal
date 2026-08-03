'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, UtensilsCrossed } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getDinnerMenu } from '@/actions/menu';
import { useCartStore } from '@/stores/cart-store';
import { useDebounce } from '@/hooks/use-debounce';
import { DINNER_CATEGORIES, VEG_FILTERS } from '@/lib/constants';
import { MenuItemCard } from '@/components/order/menu-item-card';
import { FloatingCart } from '@/components/order/floating-cart';
import { MenuGridSkeleton } from '@/components/shared/loading-skeleton';
import { EmptyState } from '@/components/shared/empty-state';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { DinnerItem } from '@/types/database';

export default function DinnerPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [vegFilter, setVegFilter] = useState('all');
  const debouncedSearch = useDebounce(searchQuery, 300);

  const { dinnerItems, addDinnerItem, updateDinnerQuantity } = useCartStore();

  const { data: menuItems = [], isLoading } = useQuery({
    queryKey: ['dinner-menu'],
    queryFn: () => getDinnerMenu(),
  });

  const filteredItems = useMemo(() => {
    return (menuItems as DinnerItem[]).filter((item) => {
      const matchesSearch =
        !debouncedSearch ||
        item.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(debouncedSearch.toLowerCase()));

      const matchesCategory =
        activeCategory === 'All' || item.category === activeCategory;

      const matchesVeg =
        vegFilter === 'all' || item.veg_status === vegFilter;

      return matchesSearch && matchesCategory && matchesVeg;
    });
  }, [menuItems, debouncedSearch, activeCategory, vegFilter]);

  const getItemQuantity = (itemId: string) =>
    dinnerItems.find((i) => i.id === itemId)?.quantity || 0;

  const handleAdd = (item: DinnerItem) => {
    addDinnerItem({
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
        <div className="inline-flex items-center justify-center h-10 w-10 sm:h-12 sm:w-12 rounded-2xl bg-orange-500/10 border border-orange-500/20 mb-3 text-orange-400">
          <UtensilsCrossed className="h-5 w-5 sm:h-6 sm:w-6" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold font-[var(--font-heading)] text-white tracking-tight">
          Dinner Menu
        </h2>
        <p className="mt-1 text-xs sm:text-sm text-zinc-400">
          Select your McDonald&apos;s dinner favorites
        </p>
      </motion.div>

      {/* Search & Filters */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-3 sm:space-y-4 mb-6 sm:mb-8"
      >
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <Input
            placeholder="Search McDonald's menu items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-zinc-500 rounded-xl h-11 text-xs sm:text-sm"
          />
        </div>

        {/* Categories */}
        <div className="flex gap-1.5 sm:gap-2 overflow-x-auto pb-2 scrollbar-none">
          {DINNER_CATEGORIES.map((category) => (
            <Badge
              key={category}
              variant="outline"
              className={cn(
                'cursor-pointer whitespace-nowrap transition-all px-3 py-1.5 sm:px-4 sm:py-1.5 rounded-full border text-xs font-medium shrink-0',
                activeCategory === category
                  ? 'bg-orange-500/20 text-orange-400 border-orange-500/40'
                  : 'border-white/10 text-zinc-400 hover:text-white hover:border-white/20'
              )}
              onClick={() => setActiveCategory(category)}
            >
              {category}
            </Badge>
          ))}
        </div>

        {/* Veg Filters */}
        <div className="flex gap-2">
          {VEG_FILTERS.map((filter) => (
            <Badge
              key={filter.value}
              variant="outline"
              className={cn(
                'cursor-pointer transition-all px-3 py-1 rounded-full border text-xs font-medium',
                vegFilter === filter.value
                  ? filter.value === 'veg'
                    ? 'bg-green-500/20 text-green-400 border-green-500/30'
                    : filter.value === 'non-veg'
                    ? 'bg-red-500/20 text-red-400 border-red-500/30'
                    : 'bg-white/10 text-white border-white/20'
                  : 'border-white/10 text-zinc-400 hover:text-white'
              )}
              onClick={() => setVegFilter(filter.value)}
            >
              {filter.value === 'veg' && '🟢 '}
              {filter.value === 'non-veg' && '🔴 '}
              {filter.label}
            </Badge>
          ))}
        </div>
      </motion.div>

      {/* Menu Grid */}
      {isLoading ? (
        <MenuGridSkeleton count={6} />
      ) : filteredItems.length === 0 ? (
        <EmptyState
          title="No items found"
          description="Try adjusting your search or filter criteria"
        />
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
        >
          {filteredItems.map((item) => (
            <MenuItemCard
              key={item.id}
              item={item}
              quantity={getItemQuantity(item.id)}
              onAdd={() => handleAdd(item)}
              onRemove={() => updateDinnerQuantity(item.id, 0)}
              onUpdateQuantity={(qty) => updateDinnerQuantity(item.id, qty)}
            />
          ))}
        </motion.div>
      )}

      {/* Floating Cart & Bottom Bar */}
      <FloatingCart nextPath="/order/breakfast" nextLabel="Continue to Breakfast" />
    </div>
  );
}
