'use client';

import { motion } from 'framer-motion';
import { Zap, Receipt, SlidersHorizontal, SearchCheck } from 'lucide-react';

const features = [
  {
    icon: Zap,
    title: "Live Swiggy Menu Sync",
    description: "Real-time menu items, prices, and high-res food images directly from McDonald's Wakad outlet.",
    color: "text-[#FC8019]",
    badge: "Live DAPI",
  },
  {
    icon: Receipt,
    title: "Transparent GST & Taxes",
    description: "Itemized 5% Restaurant Service Tax + ₹10 Packaging Fee + ₹14 Swiggy Platform Fee calculated automatically.",
    color: "text-emerald-400",
    badge: "GST 5%",
  },
  {
    icon: SlidersHorizontal,
    title: "Smart Sorting & Modals",
    description: "Filter by Veg/Non-Veg, sort by Price or Name, and tap any card to view full item details.",
    color: "text-amber-400",
    badge: "Interactive",
  },
  {
    icon: SearchCheck,
    title: "Instant Order Tracker",
    description: "Track your order status live anytime using your unique SLP-2026 reference ID.",
    color: "text-blue-400",
    badge: "Live Tracking",
  },
];

export function FeaturesGrid() {
  return (
    <section className="w-full max-w-4xl mx-auto mt-16 sm:mt-24 px-2">
      <div className="text-center mb-8 sm:mb-12">
        <h2 className="text-xl sm:text-3xl font-bold font-[var(--font-heading)] text-white tracking-tight">
          Built for Senior Sleepover 2026
        </h2>
        <p className="mt-1.5 text-xs sm:text-sm text-zinc-400 max-w-md mx-auto">
          Official food ordering portal with real-time restaurant synchronization
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {features.map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + index * 0.1, duration: 0.4 }}
            className="bg-[#121215] border border-white/10 rounded-2xl p-5 sm:p-6 hover:border-white/20 transition-all duration-200 flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2.5 rounded-xl bg-white/5 border border-white/10 ${feature.color} group-hover:scale-105 transition-transform`}>
                  <feature.icon className="h-5 w-5" />
                </div>
                <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-zinc-400">
                  {feature.badge}
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-semibold text-white mb-1">
                {feature.title}
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                {feature.description}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
