'use client';

import Link from 'next/link';
import { Utensils, ShieldCheck, Heart } from 'lucide-react';

export function LandingFooter() {
  return (
    <footer className="w-full border-t border-white/10 bg-[#09090b] py-10 px-4">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 text-white font-bold text-base font-[var(--font-heading)]">
            <Utensils className="w-4 h-4 text-orange-500" />
            <span>EuroSchool Senior Sleepover 2026</span>
          </div>
          <p className="text-xs text-zinc-500">
            Project Cheesecake • Official McDonald&apos;s Wakad Food Ordering Portal
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-zinc-400">
          <Link href="/order/student-details" className="hover:text-white transition-colors">
            Order Food
          </Link>
          <span>•</span>
          <Link href="/track" className="hover:text-white transition-colors">
            Track Order Status
          </Link>
          <span>•</span>
          <Link
            href="/admin/login"
            className="inline-flex items-center gap-1 text-orange-400 hover:text-orange-300 font-medium transition-colors"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Admin Console</span>
          </Link>
        </div>

        <p className="text-xs text-zinc-600 flex items-center justify-center gap-1">
          Made with <Heart className="w-3 h-3 text-red-500 fill-red-500" /> for Class 11 &amp; 12 Seniors
        </p>
      </div>
    </footer>
  );
}
