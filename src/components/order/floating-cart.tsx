'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, X, Minus, Plus, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/stores/cart-store';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { VegBadge } from '@/components/shared/veg-badge';
import { useState } from 'react';

interface FloatingCartProps {
  nextPath: string;
  nextLabel: string;
}

export function FloatingCart({ nextPath, nextLabel }: FloatingCartProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const {
    dinnerItems,
    breakfastItems,
    getDinnerTotal,
    getBreakfastTotal,
    getGrandTotal,
    getTotalItems,
    updateDinnerQuantity,
    updateBreakfastQuantity,
    removeDinnerItem,
    removeBreakfastItem,
  } = useCartStore();

  const totalItems = getTotalItems();
  const grandTotal = getGrandTotal();

  if (totalItems === 0) return null;

  return (
    <>
      {/* Floating Cart Button */}
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-20 right-6 z-40 sm:bottom-8 sm:right-8"
      >
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger className="gradient-orange text-white font-semibold rounded-2xl shadow-2xl glow-orange px-5 py-3.5 flex items-center gap-3 hover:opacity-90 transition-all relative">
            <ShoppingCart className="h-5 w-5" />
            <span className="font-bold">{formatCurrency(grandTotal)}</span>
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-orange-600 text-xs font-bold shadow-md">
              {totalItems}
            </span>
          </SheetTrigger>

          {/* Wider Drawer (560px on desktop) */}
          <SheetContent
            side="right"
            className="w-full sm:w-[560px] md:w-[600px] max-w-[95vw] bg-zinc-950 border-l border-white/10 flex flex-col p-0 shadow-2xl"
          >
            {/* Drawer Header */}
            <SheetHeader className="p-6 pb-4 border-b border-white/10 flex-shrink-0">
              <SheetTitle className="text-white text-xl font-bold font-[var(--font-heading)] flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-orange-400" /> Your Order Cart
              </SheetTitle>
            </SheetHeader>

            {/* Scrollable Content Container */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
              {/* Dinner Section */}
              {dinnerItems.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-1 border-b border-white/10">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-orange-400 flex items-center gap-2">
                      🍔 Dinner — McDonald&apos;s
                    </h4>
                    <span className="text-xs font-semibold text-white">
                      Subtotal: {formatCurrency(getDinnerTotal())}
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {dinnerItems.map((item) => (
                      <div
                        key={item.id}
                        className="glass-card p-4 rounded-2xl space-y-3 border-white/10 hover:border-white/20 transition-all"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-2.5 min-w-0 flex-1">
                            <VegBadge status={item.veg_status} size="sm" className="flex-shrink-0" />
                            <p className="text-sm font-bold text-white leading-snug">{item.name}</p>
                          </div>
                          <span className="text-sm font-extrabold text-white flex-shrink-0">
                            {formatCurrency(item.price * item.quantity)}
                          </span>
                        </div>

                        <div className="flex items-center justify-between pt-1 border-t border-white/5">
                          <span className="text-xs text-muted-foreground font-mono">
                            {formatCurrency(item.price)} × {item.quantity}
                          </span>

                          <div className="flex items-center gap-2 bg-white/5 rounded-xl p-1 border border-white/10">
                            <button
                              type="button"
                              onClick={() => updateDinnerQuantity(item.id, item.quantity - 1)}
                              className="h-7 w-7 rounded-lg flex items-center justify-center text-white hover:bg-white/10 text-xs font-bold transition-colors"
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </button>
                            <span className="w-6 text-center text-sm font-bold text-orange-400 font-mono">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateDinnerQuantity(item.id, item.quantity + 1)}
                              className="h-7 w-7 rounded-lg flex items-center justify-center text-white hover:bg-white/10 text-xs font-bold transition-colors"
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => removeDinnerItem(item.id)}
                              className="h-7 w-7 rounded-lg flex items-center justify-center text-red-400 hover:bg-red-500/20 text-xs ml-1 transition-colors"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Breakfast Section */}
              {breakfastItems.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-1 border-b border-white/10">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-green-400 flex items-center gap-2">
                      ☕ Breakfast
                    </h4>
                    <span className="text-xs font-semibold text-white">
                      Subtotal: {formatCurrency(getBreakfastTotal())}
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {breakfastItems.map((item) => (
                      <div
                        key={item.id}
                        className="glass-card p-4 rounded-2xl space-y-3 border-white/10 hover:border-white/20 transition-all"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-2.5 min-w-0 flex-1">
                            <VegBadge status={item.veg_status} size="sm" className="flex-shrink-0" />
                            <p className="text-sm font-bold text-white leading-snug">{item.name}</p>
                          </div>
                          <span className="text-sm font-extrabold text-white flex-shrink-0">
                            {formatCurrency(item.price * item.quantity)}
                          </span>
                        </div>

                        <div className="flex items-center justify-between pt-1 border-t border-white/5">
                          <span className="text-xs text-muted-foreground font-mono">
                            {formatCurrency(item.price)} × {item.quantity}
                          </span>

                          <div className="flex items-center gap-2 bg-white/5 rounded-xl p-1 border border-white/10">
                            <button
                              type="button"
                              onClick={() => updateBreakfastQuantity(item.id, item.quantity - 1)}
                              className="h-7 w-7 rounded-lg flex items-center justify-center text-white hover:bg-white/10 text-xs font-bold transition-colors"
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </button>
                            <span className="w-6 text-center text-sm font-bold text-orange-400 font-mono">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateBreakfastQuantity(item.id, item.quantity + 1)}
                              className="h-7 w-7 rounded-lg flex items-center justify-center text-white hover:bg-white/10 text-xs font-bold transition-colors"
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => removeBreakfastItem(item.id)}
                              className="h-7 w-7 rounded-lg flex items-center justify-center text-red-400 hover:bg-red-500/20 text-xs ml-1 transition-colors"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Clean Fixed Drawer Footer */}
            <div className="p-6 bg-zinc-900 border-t border-white/10 flex-shrink-0 space-y-4 shadow-2xl">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Grand Total</p>
                  <p className="text-2xl font-bold text-gradient-orange">
                    {formatCurrency(grandTotal)}
                  </p>
                </div>
                <span className="text-xs font-bold text-white bg-white/10 px-3 py-1.5 rounded-full border border-white/10">
                  {totalItems} item{totalItems !== 1 ? 's' : ''}
                </span>
              </div>
              <Button
                onClick={() => {
                  setOpen(false);
                  router.push(nextPath);
                }}
                size="lg"
                className="w-full gradient-orange text-white font-semibold rounded-2xl py-6 hover:opacity-90 transition-all text-base shadow-xl"
              >
                {nextLabel}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </motion.div>

      {/* Page Sticky Bottom Bar */}
      <AnimatePresence>
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          exit={{ y: 100 }}
          className="fixed bottom-0 left-0 right-0 z-30 bg-zinc-950/95 backdrop-blur-xl border-t border-white/10 p-4 shadow-2xl"
        >
          <div className="container max-w-4xl mx-auto flex items-center justify-between gap-4">
            <div>
              <p className="text-xs text-muted-foreground">{totalItems} items selected</p>
              <p className="text-lg font-bold text-gradient-orange">{formatCurrency(grandTotal)}</p>
            </div>
            <Button
              onClick={() => router.push(nextPath)}
              size="lg"
              className="gradient-orange text-white font-semibold rounded-2xl px-6 hover:opacity-90 shadow-xl text-sm sm:text-base"
            >
              {nextLabel}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </motion.div>
      </AnimatePresence>
    </>
  );
}
