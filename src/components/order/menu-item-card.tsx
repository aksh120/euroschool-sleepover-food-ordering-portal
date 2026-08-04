'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Plus, Minus, Utensils } from 'lucide-react';
import { VegBadge } from '@/components/shared/veg-badge';
import { PriceTag } from '@/components/shared/price-tag';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { DinnerItem, BreakfastItem } from '@/types/database';
import { cn } from '@/lib/utils';

interface MenuItemCardProps {
  item: DinnerItem | BreakfastItem;
  quantity: number;
  onAdd: () => void;
  onRemove: () => void;
  onUpdateQuantity: (quantity: number) => void;
}

export function MenuItemCard({
  item,
  quantity,
  onAdd,
  onRemove,
  onUpdateQuantity,
}: MenuItemCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Card Container */}
      <div
        onClick={() => setIsOpen(true)}
        className={cn(
          'bg-[#121215] border rounded-2xl overflow-hidden transition-all duration-200 flex flex-col justify-between cursor-pointer group',
          quantity > 0 ? 'border-orange-500/50 bg-[#16161a]' : 'border-white/10 hover:border-orange-500/30 hover:bg-[#16161a]'
        )}
      >
        {/* Image container */}
        <div className="relative h-44 bg-zinc-900 border-b border-white/5 overflow-hidden">
          {item.image_url ? (
            <Image
              src={item.image_url}
              alt={item.name}
              fill
              unoptimized
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-zinc-900 text-zinc-600">
              <Utensils className="h-10 w-10 opacity-30" />
            </div>
          )}

          {/* Quantity Badge */}
          {quantity > 0 && (
            <div className="absolute top-2.5 left-2.5 flex h-6 w-6 items-center justify-center rounded-full bg-orange-500 text-white text-xs font-bold shadow-md">
              {quantity}
            </div>
          )}
        </div>

        {/* Item info */}
        <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
          <div className="space-y-1.5">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold text-sm text-white leading-snug line-clamp-1 group-hover:text-orange-400 transition-colors">
                {item.name}
              </h3>
              <VegBadge status={item.veg_status} size="sm" className="shrink-0" />
            </div>

            {item.description && (
              <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                {item.description}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-white/5">
            <PriceTag amount={Number(item.price)} size="md" />

            {quantity === 0 ? (
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  onAdd();
                }}
                size="sm"
                className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold rounded-xl px-4"
              >
                <Plus className="h-3.5 w-3.5 mr-1" />
                Add
              </Button>
            ) : (
              <div
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-2 bg-zinc-900 border border-white/10 rounded-xl p-1"
              >
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onUpdateQuantity(quantity - 1);
                  }}
                  className="h-6 w-6 rounded-lg flex items-center justify-center text-white hover:bg-white/10 text-xs transition-colors"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="w-5 text-center text-xs font-bold text-orange-400 font-mono">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onUpdateQuantity(quantity + 1);
                  }}
                  className="h-6 w-6 rounded-lg flex items-center justify-center text-white hover:bg-white/10 text-xs transition-colors"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Item Full Details Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="glass-strong text-white border-white/10 max-w-md w-[95vw] overflow-hidden p-0 rounded-3xl">
          {/* Header Image */}
          <div className="relative h-56 w-full bg-zinc-900 overflow-hidden">
            {item.image_url ? (
              <Image
                src={item.image_url}
                alt={item.name}
                fill
                unoptimized
                className="object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-zinc-900 text-zinc-600">
                <Utensils className="h-16 w-16 opacity-30" />
              </div>
            )}
          </div>

          {/* Dialog Body */}
          <div className="p-6 space-y-4 relative z-10">
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-xl font-bold text-white font-[var(--font-heading)] leading-snug">
                  {item.name}
                </h2>
                <VegBadge status={item.veg_status} size="md" className="shrink-0 mt-1" />
              </div>

              {'category' in item && item.category && (
                <Badge variant="outline" className="border-white/10 text-zinc-400 text-xs">
                  {item.category}
                </Badge>
              )}
            </div>

            {item.description ? (
              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed bg-white/5 p-3.5 rounded-2xl border border-white/5">
                {item.description}
              </p>
            ) : (
              <p className="text-xs text-zinc-500 italic">No description available for this item.</p>
            )}

            {/* Footer with Price and Quantity Controls */}
            <div className="flex items-center justify-between pt-4 border-t border-white/10">
              <div>
                <span className="text-[10px] text-zinc-400 uppercase tracking-wider block">Price</span>
                <PriceTag amount={Number(item.price)} size="lg" />
              </div>

              {quantity === 0 ? (
                <Button
                  onClick={() => onAdd()}
                  className="bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-2xl px-6 py-5 text-sm shadow-lg shadow-orange-500/20"
                >
                  <Plus className="h-4 w-4 mr-1.5" /> Add to Order
                </Button>
              ) : (
                <div className="flex items-center gap-3 bg-zinc-900 border border-white/10 rounded-2xl p-1.5">
                  <button
                    type="button"
                    onClick={() => onUpdateQuantity(quantity - 1)}
                    className="h-8 w-8 rounded-xl flex items-center justify-center text-white hover:bg-white/10 text-sm transition-colors"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-6 text-center text-sm font-bold text-orange-400 font-mono">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => onUpdateQuantity(quantity + 1)}
                    className="h-8 w-8 rounded-xl flex items-center justify-center text-white hover:bg-white/10 text-sm transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
