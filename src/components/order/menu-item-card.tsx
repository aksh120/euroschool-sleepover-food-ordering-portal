'use client';

import Image from 'next/image';
import { Plus, Minus, Utensils } from 'lucide-react';
import { VegBadge } from '@/components/shared/veg-badge';
import { PriceTag } from '@/components/shared/price-tag';
import { Button } from '@/components/ui/button';
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
  return (
    <div
      className={cn(
        'bg-[#121215] border rounded-2xl overflow-hidden transition-all duration-200 flex flex-col justify-between',
        quantity > 0 ? 'border-orange-500/50 bg-[#16161a]' : 'border-white/10 hover:border-white/20'
      )}
    >
      {/* Image container */}
      <div className="relative h-44 bg-zinc-900 border-b border-white/5 overflow-hidden">
        {item.image_url ? (
          <Image
            src={item.image_url}
            alt={item.name}
            fill
            className="object-cover"
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
            <h3 className="font-semibold text-sm text-white leading-snug line-clamp-1">{item.name}</h3>
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
              onClick={onAdd}
              size="sm"
              className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold rounded-xl px-4"
            >
              <Plus className="h-3.5 w-3.5 mr-1" />
              Add
            </Button>
          ) : (
            <div className="flex items-center gap-2 bg-zinc-900 border border-white/10 rounded-xl p-1">
              <button
                type="button"
                onClick={() => onUpdateQuantity(quantity - 1)}
                className="h-6 w-6 rounded-lg flex items-center justify-center text-white hover:bg-white/10 text-xs transition-colors"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span className="w-5 text-center text-xs font-bold text-orange-400 font-mono">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => onUpdateQuantity(quantity + 1)}
                className="h-6 w-6 rounded-lg flex items-center justify-center text-white hover:bg-white/10 text-xs transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
