'use client';

import { motion } from 'framer-motion';
import { ArrowRight, SearchCheck, Sparkles, User, Utensils, Coffee, CreditCard, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { CountdownTimer } from './countdown-timer';
import { EventInfo } from './event-info';
import { FeaturesGrid } from './features-grid';
import { MenuShowcase } from './menu-showcase';
import { FaqSection } from './faq-section';
import { ORDER_STEPS } from '@/lib/constants';
import type { DinnerItem } from '@/types/database';

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
  menuItems?: DinnerItem[];
}

export function HeroSection({ orderingDeadline, isOrderingOpen, menuItems = [] }: HeroSectionProps) {
  return (
    <div className="min-h-screen bg-[#09090b] text-white flex flex-col justify-between overflow-hidden relative">
      {/* Main Hero Container */}
      <div className="relative z-10 pt-12 sm:pt-20 lg:pt-24 pb-16 px-4">
        <div className="max-w-5xl mx-auto text-center flex flex-col items-center">

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl sm:text-6xl lg:text-7xl font-extrabold font-[var(--font-heading)] tracking-tight text-white max-w-4xl leading-[1.1]"
          >
            Project Cheesecake <br />
            <span className="text-orange-500">
              Senior Sleepover 2026
            </span>
          </motion.h1>

          {/* Subheading */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="mt-4 sm:mt-6 text-base sm:text-lg lg:text-xl text-zinc-400 max-w-2xl leading-relaxed font-normal"
          >
            Order your McDonald&apos;s Wakad dinner &amp; morning breakfast for the EuroSchool Senior Sleepover on 21-22 August 2026.
          </motion.p>

          {/* Countdown Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="mt-8 mb-8 w-full max-w-lg bg-[#121215] border border-white/10 p-5 rounded-3xl"
          >
            <div className="flex items-center justify-center gap-2 mb-3">
              <Sparkles className="w-3.5 h-3.5 text-orange-400" />
              <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-300">
                Ordering Closes In
              </p>
            </div>
            <CountdownTimer deadline={orderingDeadline} />
          </motion.div>

          {/* Call to Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="mb-14 flex flex-col sm:flex-row items-center gap-4 w-full max-w-md justify-center"
          >
            {isOrderingOpen ? (
              <>
                <Link href="/order/student-details" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white font-bold text-base px-8 py-6 rounded-2xl transition-all"
                  >
                    Start Your Order
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>

                <Link href="/track" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full sm:w-auto border-white/10 text-zinc-300 hover:text-white hover:bg-white/5 font-semibold text-sm px-6 py-6 rounded-2xl transition-all"
                  >
                    <SearchCheck className="mr-2 h-4 w-4 text-orange-400" />
                    Track Order
                  </Button>
                </Link>
              </>
            ) : (
              <div className="bg-[#121215] border border-red-500/20 px-6 py-4 rounded-2xl">
                <p className="text-sm font-semibold text-red-400">
                  Ordering is currently closed
                </p>
              </div>
            )}
          </motion.div>

          {/* Event Details Grid */}
          <EventInfo />

        </div>
      </div>

      {/* Featured Menu Showcase */}
      <MenuShowcase items={menuItems} />

      {/* Features Grid Component */}
      <FeaturesGrid />

      {/* 5-Step Process Section */}
      <section className="w-full max-w-4xl mx-auto px-4 py-12 sm:py-16">
        <div className="bg-[#121215] border border-white/10 rounded-3xl p-6 sm:p-10">
          <p className="text-xs font-bold uppercase tracking-wider text-orange-400 mb-6 text-center">
            How It Works • Simple 5-Step Process
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 sm:gap-2 text-center relative">
            {ORDER_STEPS.map((step, idx) => {
              const IconComponent = stepIcons[step.icon as keyof typeof stepIcons];
              return (
                <div key={step.step} className="flex flex-col items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/5">
                  <div className="h-10 w-10 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 font-bold shrink-0">
                    <IconComponent className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-zinc-500 block uppercase">Step 0{idx + 1}</span>
                    <span className="text-xs font-semibold text-white leading-snug">
                      {step.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <FaqSection />
    </div>
  );
}
