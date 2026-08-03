'use client';

import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { CountdownTimer } from './countdown-timer';
import { EventInfo } from './event-info';
import { ORDER_STEPS } from '@/lib/constants';
import { User, Utensils, Coffee, CreditCard, CheckCircle2 } from 'lucide-react';

const stepIcons = {
  'user': User,
  'utensils': Utensils,
  'coffee': Coffee,
  'credit-card': CreditCard,
  'check-circle': CheckCircle2,
};

interface HeroSectionProps {
  orderingDeadline: string;
  isOrderingOpen: boolean;
}

export function HeroSection({ orderingDeadline, isOrderingOpen }: HeroSectionProps) {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden px-4 py-12 sm:py-20 lg:py-24 bg-[#09090b]">
      {/* Background Radial Highlight */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[90vw] max-w-[800px] h-[350px] bg-gradient-to-b from-orange-500/10 via-orange-500/5 to-transparent blur-3xl pointer-events-none" />

      {/* Hero Content */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-4xl mx-auto w-full">
        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-3xl sm:text-5xl lg:text-6xl font-extrabold font-[var(--font-heading)] tracking-tight text-white max-w-3xl leading-tight sm:leading-none"
        >
          Project Cheesecake <br className="hidden sm:inline" />
          <span className="text-orange-500">Senior Sleepover 2026</span>
        </motion.h1>

        {/* Subheading */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="mt-3 sm:mt-4 text-sm sm:text-base lg:text-lg text-zinc-400 max-w-lg leading-relaxed px-2"
        >
          Order your McDonald&apos;s dinner and breakfast for the Senior Sleepover on 21-22 August 2026.
        </motion.p>

        {/* Countdown */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="mt-6 sm:mt-8 mb-6 sm:mb-8 w-full max-w-md px-2"
        >
          <p className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-zinc-400 mb-2.5">
            Ordering Deadline Counter
          </p>
          <CountdownTimer deadline={orderingDeadline} />
        </motion.div>

        {/* Call to Action Button */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="mb-10 sm:mb-12 w-full max-w-xs sm:max-w-none"
        >
          {isOrderingOpen ? (
            <Link href="/order/student-details">
              <Button
                size="lg"
                className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white font-semibold text-base px-8 py-6 rounded-2xl shadow-lg transition-all"
              >
                Start Your Order
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          ) : (
            <div className="bg-[#121215] border border-red-500/20 px-6 py-3.5 rounded-2xl">
              <p className="text-xs sm:text-sm font-semibold text-red-400">
                Ordering is currently closed
              </p>
            </div>
          )}
        </motion.div>

        {/* Event Details Grid */}
        <EventInfo />

        {/* Process Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="mt-12 sm:mt-16 w-full max-w-2xl border-t border-white/10 pt-6 sm:pt-8"
        >
          <p className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-zinc-400 mb-4 sm:mb-6 text-center">
            Simple 5-Step Process
          </p>
          <div className="grid grid-cols-5 gap-1.5 sm:gap-3 text-center">
            {ORDER_STEPS.map((step) => {
              const IconComponent = stepIcons[step.icon as keyof typeof stepIcons];
              return (
                <div key={step.step} className="flex flex-col items-center gap-1.5 min-w-0">
                  <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 shrink-0">
                    <IconComponent className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </div>
                  <span className="text-[9px] sm:text-[11px] font-medium text-zinc-400 truncate w-full">
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
