'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Search, PackageCheck, AlertTriangle, ArrowLeft, RefreshCw, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { searchOrders, getOrderByOrderId } from '@/actions/orders';
import { formatCurrency, formatDate } from '@/lib/utils';
import { ORDER_STATUS, PAYMENT_STATUS } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/shared/empty-state';
import Link from 'next/link';

function OrderTrackerContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const [query, setQuery] = useState(initialQuery);
  const [isSearching, setIsSearching] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    setHasSearched(true);

    try {
      if (searchQuery.trim().toUpperCase().startsWith('SLP')) {
        const single = await getOrderByOrderId(searchQuery.trim().toUpperCase());
        if (single) {
          setOrders([single]);
          setIsSearching(false);
          return;
        }
      }

      const results = await searchOrders(searchQuery.trim());
      setOrders(results);
    } catch (err) {
      console.error(err);
      setOrders([]);
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    if (initialQuery) {
      handleSearch(initialQuery);
    }
  }, [initialQuery]);

  return (
    <div className="min-h-screen gradient-dark text-foreground py-8 sm:py-12 px-4">
      <div className="max-w-3xl mx-auto space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-xs sm:text-sm text-zinc-400 hover:text-white transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-orange-400">Order Tracking</span>
        </div>

        <div className="text-center space-y-2 sm:space-y-3">
          <h1 className="text-2xl sm:text-4xl font-bold font-[var(--font-heading)] text-white tracking-tight">Track Your Order</h1>
          <p className="text-zinc-400 text-xs sm:text-sm max-w-md mx-auto leading-relaxed">
            Enter your Order ID (e.g. SLP-2026-001) or your Full Name to view status and admin remarks.
          </p>
        </div>

        {/* Search Box */}
        <div className="glass-card p-4 sm:p-6 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch(query)}
              placeholder="Order ID or Student Name..."
              className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-zinc-500 rounded-xl text-xs sm:text-sm h-11"
            />
          </div>
          <Button
            onClick={() => handleSearch(query)}
            disabled={isSearching || !query.trim()}
            className="gradient-orange text-white font-semibold rounded-xl px-6 h-11 hover:opacity-90 text-xs sm:text-sm"
          >
            {isSearching ? <RefreshCw className="h-4 w-4 animate-spin" /> : 'Track Order'}
          </Button>
        </div>

        {/* Results */}
        {hasSearched && (
          <div className="space-y-6">
            {orders.length === 0 ? (
              <EmptyState
                icon={<PackageCheck className="h-8 w-8 text-zinc-500" />}
                title="No orders found"
                description={`We couldn't find any orders matching "${query}". Check your Order ID and try again.`}
              />
            ) : (
              orders.map((order) => {
                const statusInfo = ORDER_STATUS[order.status as keyof typeof ORDER_STATUS] || { label: order.status, color: 'bg-white/10' };
                const paymentInfo = order.payments && order.payments.length > 0
                  ? PAYMENT_STATUS[order.payments[0].status as keyof typeof PAYMENT_STATUS]
                  : PAYMENT_STATUS.pending;

                return (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card p-5 sm:p-6 space-y-6 border-white/10"
                  >
                    {/* Status Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
                      <div>
                        <div className="flex items-center gap-3">
                          <span className="text-lg sm:text-xl font-bold font-mono text-orange-500">{order.order_id}</span>
                          <Badge className={statusInfo.color}>{statusInfo.label}</Badge>
                        </div>
                        <p className="text-xs text-zinc-400 mt-1">
                          Placed on {formatDate(order.created_at)}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs text-zinc-400">Payment:</span>
                        <Badge className={paymentInfo.color}>{paymentInfo.label}</Badge>
                      </div>
                    </div>

                    {/* Timeline */}
                    <div className="py-1">
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 mb-3">Progress Status</p>
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="flex flex-col items-center gap-1.5">
                          <div className="h-8 w-8 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center">
                            <CheckCircle2 className="h-4 w-4" />
                          </div>
                          <span className="text-[11px] font-medium text-white">Submitted</span>
                        </div>

                        <div className="flex flex-col items-center gap-1.5">
                          <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                            order.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                            order.status === 'rejected' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400 animate-pulse'
                          }`}>
                            {order.status === 'approved' ? <CheckCircle2 className="h-4 w-4" /> :
                             order.status === 'rejected' ? <XCircle className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
                          </div>
                          <span className="text-[11px] font-medium text-white">Verification</span>
                        </div>

                        <div className="flex flex-col items-center gap-1.5">
                          <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                            order.status === 'approved' ? 'bg-green-500/20 text-green-400' : 'bg-white/5 text-zinc-500'
                          }`}>
                            <PackageCheck className="h-4 w-4" />
                          </div>
                          <span className="text-[11px] font-medium text-white">Confirmed</span>
                        </div>
                      </div>
                    </div>

                    {/* Student Info */}
                    {order.student && (
                      <div className="bg-white/5 rounded-xl p-3.5 text-xs space-y-1">
                        <p className="font-semibold text-white text-sm">{order.student.full_name}</p>
                        <p className="text-zinc-400">Class {order.student.class} - Section {order.student.section}</p>
                      </div>
                    )}

                    {/* Admin Remarks or Rejection Reason */}
                    {order.rejection_reason && (
                      <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex gap-3 text-red-400 text-xs">
                        <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold">Reason for Rejection:</p>
                          <p className="mt-0.5">{order.rejection_reason}</p>
                        </div>
                      </div>
                    )}

                    {order.admin_remarks && !order.rejection_reason && (
                      <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4 text-xs text-orange-300">
                        <p className="font-semibold">Admin Remarks:</p>
                        <p className="mt-0.5">{order.admin_remarks}</p>
                      </div>
                    )}

                    {/* Financial Summary */}
                    <div className="space-y-2 pt-2 border-t border-white/5 text-xs sm:text-sm">
                      <div className="flex flex-col sm:flex-row sm:justify-between text-zinc-400 gap-1">
                        <span>Dinner ({formatCurrency(Number(order.dinner_total))}) + Breakfast ({formatCurrency(Number(order.breakfast_total))})</span>
                        <span className="font-bold text-white text-base">{formatCurrency(Number(order.grand_total))}</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function OrderTrackerPage() {
  return (
    <Suspense fallback={<div className="min-h-screen gradient-dark flex items-center justify-center"><RefreshCw className="h-8 w-8 animate-spin text-orange-400" /></div>}>
      <OrderTrackerContent />
    </Suspense>
  );
}
