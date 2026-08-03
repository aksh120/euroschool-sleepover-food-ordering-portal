'use client';

import { motion } from 'framer-motion';
import { ShoppingBag, Clock, CheckCircle2, XCircle, IndianRupee, Hourglass } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface StatsProps {
  stats: {
    totalOrders: number;
    pendingOrders: number;
    approvedOrders: number;
    rejectedOrders: number;
    totalRevenue: number;
    pendingRevenue: number;
  };
}

export function DashboardCards({ stats }: StatsProps) {
  const cards = [
    {
      title: 'Total Revenue',
      value: formatCurrency(stats.totalRevenue),
      subtitle: 'Approved orders',
      icon: IndianRupee,
      color: 'text-green-400',
      bg: 'bg-green-500/10',
    },
    {
      title: 'Pending Revenue',
      value: formatCurrency(stats.pendingRevenue),
      subtitle: 'Awaiting approval',
      icon: Hourglass,
      color: 'text-yellow-400',
      bg: 'bg-yellow-500/10',
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders,
      subtitle: 'All submissions',
      icon: ShoppingBag,
      color: 'text-orange-400',
      bg: 'bg-orange-500/10',
    },
    {
      title: 'Pending Verification',
      value: stats.pendingOrders,
      subtitle: 'Action required',
      icon: Clock,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
    },
    {
      title: 'Approved Orders',
      value: stats.approvedOrders,
      subtitle: 'Verified & locked',
      icon: CheckCircle2,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
    },
    {
      title: 'Rejected Orders',
      value: stats.rejectedOrders,
      subtitle: 'Payment issues',
      icon: XCircle,
      color: 'text-red-400',
      bg: 'bg-red-500/10',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {cards.map((card, idx) => (
        <motion.div
          key={card.title}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.05 }}
          className="glass-card p-5 border-white/10 flex items-center justify-between"
        >
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground font-medium">{card.title}</p>
            <p className="text-2xl font-bold font-[var(--font-heading)] text-white">{card.value}</p>
            <p className="text-[11px] text-muted-foreground/70">{card.subtitle}</p>
          </div>
          <div className={`h-12 w-12 rounded-2xl ${card.bg} flex items-center justify-center ${card.color}`}>
            <card.icon className="h-6 w-6" />
          </div>
        </motion.div>
      ))}
    </div>
  );
}
