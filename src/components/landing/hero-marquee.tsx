'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import type { DinnerItem } from '@/types/database';

interface HeroMarqueeProps {
  items: DinnerItem[];
}

export function HeroMarquee({ items }: HeroMarqueeProps) {
  // Filter only items with images
  const itemsWithImages = items.filter((item) => item.image_url);
  
  if (itemsWithImages.length === 0) return null;

  // Duplicate items to ensure a seamless infinite scroll
  const marqueeItems = [...itemsWithImages, ...itemsWithImages, ...itemsWithImages];

  return (
    <div className="w-full max-w-[100vw] overflow-hidden py-12 relative flex items-center justify-center -mt-6 sm:-mt-10 mb-8 sm:mb-12 pointer-events-none">
      {/* Edge Gradients for smooth fade out */}
      <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-32 bg-gradient-to-r from-[#09090b] to-transparent z-10" />
      <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-32 bg-gradient-to-l from-[#09090b] to-transparent z-10" />

      <motion.div
        animate={{ x: [0, -1035] }} // Adjust based on item width to create seamless loop
        transition={{
          x: {
            repeat: Infinity,
            repeatType: 'loop',
            duration: 35,
            ease: 'linear',
          },
        }}
        className="flex gap-4 sm:gap-6 w-max"
      >
        {marqueeItems.map((item, index) => (
          <div
            key={`${item.id}-${index}`}
            className="relative h-24 w-24 sm:h-32 sm:w-32 rounded-full overflow-hidden border-2 border-white/10 shadow-[0_0_15px_rgba(252,128,25,0.1)] shrink-0 bg-[#121215]"
          >
            <Image
              src={item.image_url!}
              alt={item.name}
              fill
              unoptimized
              className="object-cover opacity-90 scale-110"
              sizes="(max-width: 640px) 96px, 128px"
            />
          </div>
        ))}
      </motion.div>
    </div>
  );
}
