'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle } from 'lucide-react';

const faqs = [
  {
    question: "When is the ordering deadline for the Senior Sleepover?",
    answer: "The ordering portal closes strictly before the sleepover date (20th August 2026 at 11:59 PM). Please place and confirm your order before the deadline counter reaches zero.",
  },
  {
    question: "Who can order food through this portal?",
    answer: "This portal is exclusively for EuroSchool Class 11 and Class 12 students attending the Senior Sleepover 2026 (Sections A & B only).",
  },
  {
    question: "How are menu items, prices, and taxes calculated?",
    answer: "All dinner menu items and prices are synced live directly from Swiggy (McDonald's Wakad Outlet). At checkout, standard 5% Restaurant GST and a flat ₹10 packaging fee are added transparently to your order subtotal.",
  },
  {
    question: "How do I pay for my order and upload proof?",
    answer: "After selecting your dinner and breakfast choices, you will be redirected to the Payment page. Scan the official event UPI QR Code using GPay, PhonePe, Paytm, or BHIM, and upload your payment receipt screenshot along with the UTR / Transaction ID.",
  },
  {
    question: "How do I track my order status?",
    answer: "Once submitted, you will receive a unique Order ID (e.g. SLP-2026-X892). You can visit the 'Track Order' page anytime to check whether your order payment has been verified by admins.",
  },
];

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="w-full max-w-4xl mx-auto px-4 py-12 sm:py-16">
      <div className="text-center mb-8 sm:mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-zinc-300 text-xs font-semibold mb-3">
          <HelpCircle className="w-3.5 h-3.5 text-orange-400" />
          <span>Got Questions?</span>
        </div>
        <h2 className="text-2xl sm:text-4xl font-extrabold font-[var(--font-heading)] text-white tracking-tight">
          Frequently Asked Questions
        </h2>
        <p className="mt-1.5 text-xs sm:text-sm text-zinc-400 max-w-md mx-auto">
          Everything you need to know about ordering food for Senior Sleepover 2026
        </p>
      </div>

      <div className="space-y-3">
        {faqs.map((faq, index) => {
          const isOpen = openIndex === index;
          return (
            <div
              key={faq.question}
              className="bg-[#121215] border border-white/10 rounded-2xl overflow-hidden transition-colors hover:border-white/20"
            >
              <button
                type="button"
                onClick={() => toggle(index)}
                className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-semibold text-sm sm:text-base text-white"
              >
                <span>{faq.question}</span>
                <ChevronDown
                  className={`w-4 h-4 text-orange-400 shrink-0 transition-transform duration-200 ${
                    isOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="px-4 pb-5 sm:px-5 sm:pb-5 pt-0 text-xs sm:text-sm text-zinc-400 leading-relaxed border-t border-white/5">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </section>
  );
}
