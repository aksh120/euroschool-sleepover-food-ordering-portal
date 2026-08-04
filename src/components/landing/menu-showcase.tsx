'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Utensils, Sparkles } from 'lucide-react';
import { VegBadge } from '@/components/shared/veg-badge';
import { PriceTag } from '@/components/shared/price-tag';
import { Button } from '@/components/ui/button';
import type { DinnerItem } from '@/types/database';

interface MenuShowcaseProps {
  items: DinnerItem[];
}

export function MenuShowcase({ items }: MenuShowcaseProps) {
  // Take first 6 featured items with images
  const featuredItems = items.filter((item) => item.image_url).slice(0, 6);

  if (featuredItems.length === 0) return null;

  return (
    <section className="w-full max-w-6xl mx-auto px-4 py-12 sm:py-16">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 sm:mb-12 border-b border-white/10 pb-6">
        <div>
          <h2 className="text-2xl sm:text-4xl font-extrabold font-[var(--font-heading)] text-white tracking-tight">
            Popular Sleepover Picks
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-zinc-400">
            Fetched live from Swiggy • Prices include menu items &amp; combos
          </p>
        </div>

        <Link href="/order/student-details">
          <Button
            variant="outline"
            className="border-orange-500/30 text-orange-400 hover:bg-orange-500/10 hover:border-orange-500/50 rounded-xl text-xs font-semibold px-4 py-2"
          >
            Explore Full Menu
            <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {featuredItems.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.08, duration: 0.4 }}
            className="bg-[#121215] border border-white/10 hover:border-orange-500/30 rounded-2xl overflow-hidden transition-all duration-300 flex flex-col justify-between group shadow-lg"
          >
            <div className="relative h-48 bg-zinc-900 overflow-hidden">
              {item.image_url ? (
                <Image
                  src={item.image_url}
                  alt={item.name}
                  fill
                  unoptimized
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-zinc-900 text-zinc-600">
                  <Utensils className="h-10 w-10 opacity-30" />
                </div>
              )}
              <div className="absolute top-3 right-3">
                <VegBadge status={item.veg_status} size="sm" />
              </div>
            </div>

            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
              <div>
                <h3 className="font-bold text-base text-white group-hover:text-orange-400 transition-colors line-clamp-1">
                  {item.name}
                </h3>
                {item.description && (
                  <p className="text-xs text-zinc-400 line-clamp-2 mt-1.5 leading-relaxed">
                    {item.description}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-white/5">
                <PriceTag amount={Number(item.price)} size="md" />
                <Link href="/order/student-details">
                  <Button
                    size="sm"
                    className="bg-orange-500 hover:bg-orange-600 text-white font-semibold text-xs rounded-xl px-4 py-2"
                  >
                    Add Item
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
