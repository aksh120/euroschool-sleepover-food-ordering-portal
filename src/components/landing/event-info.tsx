'use client';

import { motion } from 'framer-motion';
import { Calendar, Clock, Utensils, Coffee } from 'lucide-react';

const cards = [
  {
    icon: Calendar,
    title: '21-22 Aug 2026',
    description: 'Event Dates',
  },
  {
    icon: Clock,
    title: '5:00 PM',
    description: 'Reporting Time',
  },
  {
    icon: Utensils,
    title: "McDonald's",
    description: 'Wakad Dinner',
  },
  {
    icon: Coffee,
    title: 'Breakfast',
    description: 'Morning Meal',
  },
];

export function EventInfo() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 max-w-3xl mx-auto w-full">
      {cards.map((card, index) => (
        <motion.div
          key={card.title}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 + index * 0.08, duration: 0.4 }}
          className="bg-[#121215] border border-white/10 rounded-2xl p-4 text-center hover:border-orange-500/30 hover:bg-[#16161a] transition-all duration-200 group"
        >
          <card.icon className="mx-auto h-5 w-5 text-orange-400 mb-2 group-hover:scale-110 transition-transform duration-200" />
          <p className="text-sm font-semibold text-white tracking-tight">{card.title}</p>
          <p className="mt-0.5 text-[11px] text-zinc-400">{card.description}</p>
        </motion.div>
      ))}
    </div>
  );
}
