'use client';

import { useEffect, useState, Suspense } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, Copy, Check, ExternalLink } from 'lucide-react';
import { getOrderByOrderId } from '@/actions/orders';
import { formatCurrency, formatDate } from '@/lib/utils';
import { ORDER_STATUS, PAYMENT_STATUS } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import { toast } from 'sonner';

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const [order, setOrder] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderId) {
      getOrderByOrderId(orderId).then((data) => {
        setOrder(data);
        setLoading(false);
      });
    }
  }, [orderId]);

  const handleCopy = () => {
    if (orderId) {
      navigator.clipboard.writeText(orderId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success('Order ID copied!');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-7 w-7 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-center mb-8"
      >
        <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-orange-500/10 border border-orange-500/20 mb-4 text-orange-400">
          <CheckCircle2 className="h-8 w-8" />
        </div>

        <h2 className="text-2xl sm:text-3xl font-bold font-[var(--font-heading)] text-white tracking-tight">
          Order Submitted Successfully
        </h2>
        <p className="mt-1.5 text-sm text-zinc-400">
          Your sleepover meal order has been registered
        </p>
      </motion.div>

      {/* Order ID Card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-[#121215] border border-white/10 rounded-2xl p-6 text-center mb-6"
      >
        <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 mb-2">
          Your Order Reference ID
        </p>
        <div className="flex items-center justify-center gap-2">
          <span className="text-3xl font-bold font-mono text-orange-500 tracking-tight">
            {orderId}
          </span>
          <button
            type="button"
            onClick={handleCopy}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            {copied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
          </button>
        </div>
        <p className="text-xs text-zinc-500 mt-2">Keep this ID to track your payment status</p>
      </motion.div>

<motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-6 mb-6 flex flex-col gap-3"
      >
        <Link href={`/track?q=${orderId}`}>
          <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-2xl py-6">
            <ExternalLink className="mr-2 h-4 w-4" />
            Track Order Status
          </Button>
        </Link>
      </motion.div>

      {/* Details Card */}
      {order && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-[#121215] border border-white/10 rounded-2xl p-6 space-y-4"
        >
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 mb-1">Student</p>
            <p className="text-white font-semibold text-sm">
              {order.student?.full_name || 'N/A'} (Class {order.student?.class}-{order.student?.section})
            </p>
          </div>

          <Separator className="bg-white/5" />

          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-400">Order Status</span>
            <Badge className={ORDER_STATUS[order.status as keyof typeof ORDER_STATUS]?.color || ''}>
              {ORDER_STATUS[order.status as keyof typeof ORDER_STATUS]?.label || order.status}
            </Badge>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-400">Payment Proof</span>
            {Array.isArray(order.payments) && order.payments.length > 0 ? (
              <Badge className={PAYMENT_STATUS[order.payments[0].status as keyof typeof PAYMENT_STATUS]?.color || ''}>
                {PAYMENT_STATUS[order.payments[0].status as keyof typeof PAYMENT_STATUS]?.label || 'Pending'}
              </Badge>
            ) : (
              <Badge className="bg-yellow-500/10 text-yellow-400 border-yellow-500/20">Uploaded</Badge>
            )}
          </div>

          <Separator className="bg-white/5" />

          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-zinc-400">Dinner Subtotal</span>
              <span className="text-white font-medium">{formatCurrency(Number(order.dinner_total))}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Breakfast Subtotal</span>
              <span className="text-white font-medium">{formatCurrency(Number(order.breakfast_total))}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">GST & Service Tax (5%)</span>
              <span className="text-white font-medium">
                {formatCurrency(Math.round((Number(order.dinner_total) + Number(order.breakfast_total)) * 0.05 * 100) / 100)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Packaging & Handling Fee</span>
              <span className="text-white font-medium">
                {formatCurrency(Number(order.dinner_total) + Number(order.breakfast_total) > 0 ? 10 : 0)}
              </span>
            </div>
            <Separator className="bg-white/5 my-2" />
            <div className="flex justify-between items-center pt-1 text-sm">
              <span className="font-semibold text-white">Grand Total</span>
              <span className="text-xl font-bold text-orange-500 font-mono">
                {formatCurrency(Number(order.grand_total))}
              </span>
            </div>
          </div>

          <Separator className="bg-white/5" />

          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>Submitted</span>
            <span>{formatDate(order.created_at)}</span>
          </div>
        </motion.div>
      )}

      {/* Navigation Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-6 flex flex-col gap-3"
      >
        <Link href="/">
          <Button variant="outline" className="w-full border-white/10 rounded-2xl text-zinc-300 hover:text-white">
            Return to Home
          </Button>
        </Link>
      </motion.div>
    </div>
  );
}

export default function ConfirmationPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-20">
        <div className="h-7 w-7 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
      </div>
    }>
      <ConfirmationContent />
    </Suspense>
  );
}
