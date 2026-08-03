'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, UtensilsCrossed, ArrowUpDown } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getDinnerMenu } from '@/actions/menu';
import { useCartStore } from '@/stores/cart-store';
import { useDebounce } from '@/hooks/use-debounce';
import { VEG_FILTERS } from '@/lib/constants';
import { MenuItemCard } from '@/components/order/menu-item-card';
import { FloatingCart } from '@/components/order/floating-cart';
import { MenuGridSkeleton } from '@/components/shared/loading-skeleton';
import { EmptyState } from '@/components/shared/empty-state';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import type { DinnerItem } from '@/types/database';

export default function DinnerPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [vegFilter, setVegFilter] = useState('all');
  const [sortBy, setSortBy] = useState('featured');
  const debouncedSearch = useDebounce(searchQuery, 300);

  const { dinnerItems, addDinnerItem, updateDinnerQuantity } = useCartStore();

  const { data: menuItems = [], isLoading } = useQuery({
    queryKey: ['dinner-menu'],
    queryFn: () => getDinnerMenu(),
  });

  // Dynamically compute unique categories from active menu items
  const dynamicCategories = useMemo(() => {
    const cats = new Set<string>();
    (menuItems as DinnerItem[]).forEach((item) => {
      if (item.category) {
        cats.add(item.category);
      }
    });
    return ['All', ...Array.from(cats)];
  }, [menuItems]);

  const filteredItems = useMemo(() => {
    const filtered = (menuItems as DinnerItem[]).filter((item) => {
      const matchesSearch =
        !debouncedSearch ||
        item.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(debouncedSearch.toLowerCase()));

      const matchesCategory =
        activeCategory === 'All' ||
        item.category === activeCategory ||
        (item.category && item.category.toLowerCase().includes(activeCategory.toLowerCase()));

      const matchesVeg =
        vegFilter === 'all' || item.veg_status === vegFilter;

      return matchesSearch && matchesCategory && matchesVeg;
    });

    return filtered.sort((a, b) => {
      if (sortBy === 'price-asc') return Number(a.price) - Number(b.price);
      if (sortBy === 'price-desc') return Number(b.price) - Number(a.price);
      if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
      return (a.sort_order || 0) - (b.sort_order || 0);
    });
  }, [menuItems, debouncedSearch, activeCategory, vegFilter, sortBy]);

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

        {/* Live Swiggy McDonald's Wakad Badge */}
        <div className="inline-flex items-center justify-center gap-2.5 px-4 py-2 rounded-2xl bg-[#FC8019]/10 border border-[#FC8019]/30 text-[#FC8019] text-xs font-medium mt-3 shadow-md backdrop-blur-sm max-w-xl mx-auto">
          <svg className="w-4 h-4 shrink-0 fill-[#FC8019]" viewBox="0 0 24 24">
            <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm1.782 17.502c-1.391.733-3.178.966-4.57.234-1.391-.733-2.175-2.222-2.175-3.801V8.508h2.38v5.427c0 .641.318 1.246.883 1.544.565.297 1.289.202 1.854-.096l1.628-.858v2.977z" />
          </svg>
          <span className="leading-snug text-zinc-200">
            All menu items &amp; prices are fetched live from{' '}
            <strong className="text-[#FC8019] font-semibold">Swiggy (McDonald&apos;s Wakad Outlet)</strong>
          </span>
        </div>
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
          {dynamicCategories.map((category) => (
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

        {/* Veg Filters & Sort Dropdown */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex flex-wrap gap-2">
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

          {/* Sort Dropdown */}
          <Select value={sortBy} onValueChange={(val) => setSortBy(val || 'featured')}>
            <SelectTrigger className="w-[165px] h-8 bg-white/5 border-white/10 text-xs text-zinc-300 rounded-xl focus:ring-0 focus:border-orange-500/50">
              <ArrowUpDown className="h-3.5 w-3.5 mr-1.5 text-orange-400 shrink-0" />
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent className="bg-[#121215] border-white/10 text-white text-xs">
              <SelectItem value="featured">Featured</SelectItem>
              <SelectItem value="price-asc">Price: Low to High</SelectItem>
              <SelectItem value="price-desc">Price: High to Low</SelectItem>
              <SelectItem value="name-asc">Name: A to Z</SelectItem>
            </SelectContent>
          </Select>
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
