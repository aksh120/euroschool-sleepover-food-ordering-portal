'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, RefreshCw, ZoomIn, ArrowRight, ArrowLeft, RotateCcw, AlertCircle } from 'lucide-react';
import { getPendingPayments, verifyPayment } from '@/actions/payments';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { EmptyState } from '@/components/shared/empty-state';
import { toast } from 'sonner';
import Image from 'next/image';

export default function PaymentVerificationPage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [remarks, setRemarks] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const { data: pendingPayments = [], isLoading, refetch } = useQuery({
    queryKey: ['pending-payments'],
    queryFn: () => getPendingPayments(),
  });

  const currentPayment = pendingPayments[currentIndex];

  const handleAction = async (action: 'verified' | 'rejected' | 'reupload_requested') => {
    if (!currentPayment) return;
    setIsProcessing(true);

    const res = await verifyPayment(currentPayment.id, action, remarks);
    setIsProcessing(false);

    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success(
        action === 'verified'
          ? 'Payment verified & order approved!'
          : action === 'rejected'
          ? 'Payment rejected'
          : 'Re-upload requested'
      );
      setRemarks('');
      refetch();
      if (currentIndex > 0) setCurrentIndex((prev) => prev - 1);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-[var(--font-heading)] text-white">Payment Verification Queue</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Rapidly review uploaded UPI payment screenshots</p>
        </div>
        <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30 text-xs px-3 py-1">
          {pendingPayments.length} Pending Verification
        </Badge>
      </div>

      {isLoading ? (
        <div className="text-center py-20">
          <RefreshCw className="h-8 w-8 animate-spin text-orange-400 mx-auto mb-2" />
          <p className="text-xs text-muted-foreground">Loading queue...</p>
        </div>
      ) : pendingPayments.length === 0 ? (
        <EmptyState
          icon={<CheckCircle2 className="h-10 w-10 text-green-400" />}
          title="Queue is Empty!"
          description="All submitted payment screenshots have been verified."
        />
      ) : (
        <div className="space-y-4">
          {/* Navigation Bar */}
          <div className="glass-card p-3 flex items-center justify-between">
            <Button
              onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
              disabled={currentIndex === 0}
              variant="ghost"
              size="sm"
              className="text-xs"
            >
              <ArrowLeft className="h-4 w-4 mr-1" /> Previous
            </Button>
            <span className="text-xs text-muted-foreground font-mono">
              Item {currentIndex + 1} of {pendingPayments.length}
            </span>
            <Button
              onClick={() => setCurrentIndex((prev) => Math.min(pendingPayments.length - 1, prev + 1))}
              disabled={currentIndex === pendingPayments.length - 1}
              variant="ghost"
              size="sm"
              className="text-xs"
            >
              Next <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>

          {/* Verification Card */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Screenshot Side */}
            <div className="glass-card p-6 flex flex-col items-center justify-center space-y-4">
              <span className="text-xs font-semibold text-muted-foreground uppercase">Payment Screenshot</span>

              <Dialog>
                <DialogTrigger className="w-full">
                  <div className="relative h-72 w-full rounded-xl overflow-hidden bg-black/50 border border-white/10 cursor-pointer group">
                    <Image src={currentPayment.screenshot_url} alt="Screenshot" fill className="object-contain" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <span className="text-xs font-medium text-white flex items-center gap-1.5"><ZoomIn className="h-4 w-4" /> Click to Zoom</span>
                    </div>
                  </div>
                </DialogTrigger>
                <DialogContent className="max-w-4xl glass-strong border-white/10">
                  <DialogHeader>
                    <DialogTitle className="text-white font-mono">{currentPayment.order?.order_id} Proof</DialogTitle>
                  </DialogHeader>
                  <div className="relative h-[75vh] w-full bg-black rounded-xl overflow-hidden">
                    <Image src={currentPayment.screenshot_url} alt="Full screenshot" fill className="object-contain" />
                  </div>
                </DialogContent>
              </Dialog>

              {currentPayment.transaction_id && (
                <div className="bg-white/5 px-3 py-2 rounded-lg text-xs font-mono text-center w-full">
                  Txn ID: <span className="text-white font-bold">{currentPayment.transaction_id}</span>
                </div>
              )}
            </div>

            {/* Order & Action Side */}
            <div className="glass-card p-6 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div>
                    <span className="text-xl font-bold font-mono text-gradient-orange">{currentPayment.order?.order_id}</span>
                    <p className="text-xs text-muted-foreground">{formatDate(currentPayment.created_at)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Amount Claimed</p>
                    <p className="text-xl font-bold text-white">{formatCurrency(Number(currentPayment.order?.grand_total || 0))}</p>
                  </div>
                </div>

                {/* Student Info */}
                {currentPayment.order?.student && (
                  <div className="bg-white/5 p-3 rounded-xl space-y-1 text-xs">
                    <p className="font-semibold text-white">{currentPayment.order.student.full_name}</p>
                    <p className="text-muted-foreground">Class {currentPayment.order.student.class}-{currentPayment.order.student.section} • {currentPayment.order.student.phone || 'No phone'}</p>
                  </div>
                )}

                {/* Items Summary */}
                <div className="text-xs space-y-1 text-muted-foreground">
                  <p className="font-medium text-white">Order Breakdown:</p>
                  <p>Dinner: {formatCurrency(Number(currentPayment.order?.dinner_total || 0))} | Breakfast: {formatCurrency(Number(currentPayment.order?.breakfast_total || 0))}</p>
                </div>

                {/* Remarks Field */}
                <div className="space-y-1.5 pt-2">
                  <label className="text-xs text-muted-foreground font-medium">Verification Remarks (Optional)</label>
                  <Textarea
                    placeholder="e.g. Verified on GPay"
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    className="bg-white/5 border-white/10 text-xs h-20"
                  />
                </div>
              </div>

              {/* Verification Actions */}
              <div className="grid grid-cols-3 gap-2 pt-4 border-t border-white/10">
                <Button
                  onClick={() => handleAction('verified')}
                  disabled={isProcessing}
                  className="bg-green-600 hover:bg-green-700 text-white text-xs font-semibold"
                >
                  <CheckCircle2 className="h-4 w-4 mr-1" /> Approve
                </Button>

                <Button
                  onClick={() => handleAction('reupload_requested')}
                  disabled={isProcessing}
                  variant="outline"
                  className="border-amber-500/30 text-amber-300 hover:bg-amber-500/20 text-xs font-semibold"
                >
                  <RotateCcw className="h-4 w-4 mr-1" /> Re-upload
                </Button>

                <Button
                  onClick={() => handleAction('rejected')}
                  disabled={isProcessing}
                  variant="destructive"
                  className="text-xs font-semibold"
                >
                  <XCircle className="h-4 w-4 mr-1" /> Reject
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
