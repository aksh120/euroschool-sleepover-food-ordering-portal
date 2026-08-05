'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle2, XCircle, AlertCircle, ZoomIn, Lock, Trash2, Send } from 'lucide-react';
import { getAdminOrderDetail, updateOrderStatus, deleteOrder } from '@/actions/orders';
import { verifyPayment } from '@/actions/payments';
import { formatCurrency, formatDate } from '@/lib/utils';
import { ORDER_STATUS, PAYMENT_STATUS } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { VegBadge } from '@/components/shared/veg-badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import Image from 'next/image';
import Link from 'next/link';

export default function SingleOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [remarks, setRemarks] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchDetail = async () => {
    setLoading(true);
    const data = await getAdminOrderDetail(id);
    setOrder(data);
    if (data?.admin_remarks) setRemarks(data.admin_remarks);
    if (data?.rejection_reason) setRejectionReason(data.rejection_reason);
    setLoading(false);
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const handleApprove = async () => {
    setIsUpdating(true);
    const res = await updateOrderStatus(id, 'approved', remarks);
    setIsUpdating(false);

    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success('Order approved successfully!');
      fetchDetail();
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast.error('Please state a reason for rejection');
      return;
    }

    setIsUpdating(true);
    const res = await updateOrderStatus(id, 'rejected', remarks, rejectionReason);
    setIsUpdating(false);

    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success('Order rejected');
      fetchDetail();
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this order?')) return;
    const res = await deleteOrder(id);
    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success('Order deleted');
      router.push('/admin/orders');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-20">
        <AlertCircle className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Order Not Found</h2>
        <Link href="/admin/orders">
          <Button variant="outline" className="border-white/10 mt-4">
            Back to Orders
          </Button>
        </Link>
      </div>
    );
  }

  const payment = order.payments?.[0];
  const statusInfo = ORDER_STATUS[order.status as keyof typeof ORDER_STATUS] || { label: order.status, color: '' };
  const paymentInfo = payment ? PAYMENT_STATUS[payment.status as keyof typeof PAYMENT_STATUS] : PAYMENT_STATUS.pending;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Back Button */}
      <div className="flex items-center justify-between">
        <Link href="/admin/orders" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-white transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Orders
        </Link>
        <Button onClick={handleDelete} variant="destructive" size="sm" className="text-xs">
          <Trash2 className="h-3.5 w-3.5 mr-1.5" /> Delete Order
        </Button>
      </div>

      {/* Header Info */}
      <div className="glass-card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold font-mono text-gradient-orange">{order.order_id}</h1>
            <Badge className={statusInfo.color}>{statusInfo.label}</Badge>
            {order.is_locked && (
              <Badge variant="outline" className="border-white/10 text-muted-foreground text-[10px]">
                <Lock className="h-3 w-3 mr-1" /> Locked
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1">Submitted on {formatDate(order.created_at)}</p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={handleApprove}
            disabled={isUpdating || order.status === 'approved'}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold text-xs"
          >
            <CheckCircle2 className="h-4 w-4 mr-1.5" /> Approve
          </Button>
          <Button
            onClick={handleReject}
            disabled={isUpdating || order.status === 'rejected'}
            variant="destructive"
            className="font-semibold text-xs"
          >
            <XCircle className="h-4 w-4 mr-1.5" /> Reject
          </Button>
        </div>
      </div>

      {/* Main Grid: Info + Screenshot */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Student & Payment Summary */}
        <div className="space-y-6">
          <div className="glass-card p-6 space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Student Information</h3>
            {order.student ? (
              <div className="space-y-2 text-xs">
                <div className="flex justify-between"><span className="text-muted-foreground">Full Name:</span><span className="font-semibold text-white">{order.student.full_name}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Class & Section:</span><span className="text-white">Class {order.student.class} - {order.student.section}</span></div>
                {order.student.roll_number && <div className="flex justify-between"><span className="text-muted-foreground">Roll Number:</span><span className="text-white">{order.student.roll_number}</span></div>}
                {order.student.phone && <div className="flex justify-between"><span className="text-muted-foreground">Phone:</span><span className="text-white">{order.student.phone}</span></div>}
                {order.student.house && <div className="flex justify-between"><span className="text-muted-foreground">House:</span><span className="text-white">{order.student.house}</span></div>}
              </div>
            ) : <p className="text-xs text-muted-foreground">No student details attached</p>}
          </div>

          {/* Payment Proof */}
          <div className="glass-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Payment Proof</h3>
              <Badge className={paymentInfo.color}>{paymentInfo.label}</Badge>
            </div>

            {payment ? (
              <div className="space-y-3">
                <Dialog>
                  <DialogTrigger className="w-full">
                    <div className="relative h-48 w-full rounded-xl overflow-hidden bg-black/40 border border-white/10 cursor-pointer group">
                      <Image src={payment.screenshot_url} alt="Payment Screenshot" fill className="object-contain" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <span className="text-xs font-medium text-white flex items-center gap-1.5"><ZoomIn className="h-4 w-4" /> Click to Zoom</span>
                      </div>
                    </div>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl glass-strong border-white/10">
                    <DialogHeader>
                      <DialogTitle className="text-white font-mono">{order.order_id} - Payment Proof</DialogTitle>
                    </DialogHeader>
                    <div className="relative h-[70vh] w-full bg-black rounded-xl overflow-hidden">
                      <Image src={payment.screenshot_url} alt="Full screenshot" fill className="object-contain" />
                    </div>
                  </DialogContent>
                </Dialog>

                {payment.transaction_id && (
                  <div className="flex justify-between text-xs bg-white/5 p-2.5 rounded-lg">
                    <span className="text-muted-foreground">Transaction ID:</span>
                    <span className="font-mono text-white font-semibold">{payment.transaction_id}</span>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">No payment uploaded yet</p>
            )}
          </div>
        </div>

        {/* Ordered Items Breakdown */}
        <div className="space-y-6">
          <div className="glass-card p-6 space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Items Ordered</h3>

            {/* Dinner Items */}
            {order.order_dinner_items && order.order_dinner_items.length > 0 && (
              <div>
                <p className="text-xs font-medium text-orange-400 mb-2">Dinner (McDonald&apos;s)</p>
                <div className="space-y-2">
                  {order.order_dinner_items.map((item: any) => (
                    <div key={item.id} className="flex justify-between text-xs py-1 border-b border-white/5">
                      <span className="text-white">{item.item_name} × {item.quantity}</span>
                      <span className="font-semibold text-white">{formatCurrency(Number(item.unit_price) * item.quantity)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Breakfast Items */}
            {order.order_breakfast_items && order.order_breakfast_items.length > 0 && (
              <div>
                <p className="text-xs font-medium text-green-400 mb-2">Breakfast</p>
                <div className="space-y-2">
                  {order.order_breakfast_items.map((item: any) => (
                    <div key={item.id} className="flex justify-between text-xs py-1 border-b border-white/5">
                      <span className="text-white">{item.item_name} × {item.quantity}</span>
                      <span className="font-semibold text-white">{formatCurrency(Number(item.unit_price) * item.quantity)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Separator className="bg-white/10" />

            <div className="space-y-1.5 text-xs text-zinc-400">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span className="text-white">{formatCurrency(Number(order.dinner_total) + Number(order.breakfast_total))}</span>
              </div>
              <div className="flex justify-between">
                <span>GST & Service Tax (5%)</span>
                <span className="text-white">{formatCurrency(Math.round((Number(order.dinner_total) + Number(order.breakfast_total)) * 0.05 * 100) / 100)}</span>
              </div>
              <div className="flex justify-between">
                <span>Packaging Fee</span>
                <span className="text-white">{formatCurrency(Number(order.dinner_total) + Number(order.breakfast_total) > 0 ? 10 : 0)}</span>
              </div>
              <div className="flex justify-between">
                <span>Swiggy Platform Fee</span>
                <span className="text-white">{formatCurrency(Number(order.dinner_total) + Number(order.breakfast_total) > 0 ? 14 : 0)}</span>
              </div>
            </div>

            <Separator className="bg-white/10" />

            {/* Grand Total */}
            <div className="flex justify-between items-center text-sm font-bold text-white">
              <span>Grand Total</span>
              <span className="text-xl text-orange-500 font-mono">{formatCurrency(Number(order.grand_total))}</span>
            </div>
          </div>

          {/* Admin Remarks & Rejection Reason */}
          <div className="glass-card p-6 space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Admin Notes</h3>

            <div className="space-y-2">
              <Label className="text-xs">Rejection Reason (required if rejecting)</Label>
              <Textarea
                placeholder="e.g. Screenshot blurry, amount mismatched"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="bg-white/5 border-white/10 text-xs h-20"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Internal Remarks</Label>
              <Textarea
                placeholder="Internal note..."
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                className="bg-white/5 border-white/10 text-xs h-20"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
