'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { CreditCard, Upload, Copy, Check, AlertCircle } from 'lucide-react';
import { useCartStore } from '@/stores/cart-store';
import { createOrder } from '@/actions/orders';
import { submitPayment } from '@/actions/payments';
import { getActiveQRCode } from '@/actions/settings';
import { formatCurrency } from '@/lib/utils';
import { validateScreenshot } from '@/lib/validators';
import { VegBadge } from '@/components/shared/veg-badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';

export default function PaymentPage() {
  const router = useRouter();
  const {
    studentInfo,
    dinnerItems,
    breakfastItems,
    getDinnerTotal,
    getBreakfastTotal,
    getSubtotal,
    getGstAmount,
    getPackagingFee,
    getGrandTotal,
    setOrderId,
    clearAll,
  } = useCartStore();

  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [transactionId, setTransactionId] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);

  const { data: qrCode } = useQuery({
    queryKey: ['active-qr-code'],
    queryFn: () => getActiveQRCode(),
  });

  const grandTotal = getGrandTotal();
  const dinnerTotal = getDinnerTotal();
  const breakfastTotal = getBreakfastTotal();
  const subtotal = getSubtotal();
  const gstAmount = getGstAmount();
  const packagingFee = getPackagingFee();

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const error = validateScreenshot(file);
    if (error) {
      toast.error(error);
      return;
    }

    setScreenshotFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setScreenshotPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  }, []);

  const handleCopyUPI = useCallback(() => {
    if (qrCode?.upi_id) {
      navigator.clipboard.writeText(qrCode.upi_id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success('UPI ID copied!');
    }
  }, [qrCode?.upi_id]);

  const handleSubmit = async () => {
    if (!studentInfo) {
      toast.error('Student information is missing. Please go back to Step 1.');
      return;
    }
    if (!screenshotFile) {
      toast.error('Please upload a payment screenshot');
      return;
    }
    if (!confirmed) {
      toast.error('Please confirm that you have completed the payment');
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Create the order
      const orderResult = await createOrder({
        student: studentInfo,
        dinnerItems: dinnerItems.map((item) => ({
          id: item.id,
          quantity: item.quantity,
          unit_price: item.price,
          item_name: item.name,
        })),
        breakfastItems: breakfastItems.map((item) => ({
          id: item.id,
          quantity: item.quantity,
          unit_price: item.price,
          item_name: item.name,
        })),
        dinnerTotal,
        breakfastTotal,
        grandTotal,
      });

      if ('error' in orderResult) {
        toast.error(orderResult.error);
        setIsSubmitting(false);
        return;
      }

      // 2. Upload screenshot to Supabase Storage with base64 fallback
      let screenshotUrl = screenshotPreview || '';

      try {
        const supabase = createClient();
        const fileExt = screenshotFile.name.split('.').pop() || 'png';
        const fileName = `${orderResult.orderUuid}_${Date.now()}.${fileExt}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('payment-screenshots')
          .upload(fileName, screenshotFile, { upsert: true });

        if (!uploadError && uploadData) {
          const { data: publicUrlData } = supabase.storage
            .from('payment-screenshots')
            .getPublicUrl(uploadData.path);
          
          if (publicUrlData?.publicUrl) {
            screenshotUrl = publicUrlData.publicUrl;
          }
        }
      } catch (err) {
        console.warn('Storage upload error, using preview fallback:', err);
      }

      // 3. Submit payment record
      await submitPayment(orderResult.orderUuid!, screenshotUrl, transactionId || undefined);

      // 4. Clear cart & redirect
      setOrderId(orderResult.orderId!);
      clearAll();

      toast.success('Order submitted successfully!');
      router.push(`/order/confirmation?orderId=${orderResult.orderId}`);
    } catch (err) {
      toast.error('Something went wrong. Please try again.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!studentInfo) {
    return (
      <div className="max-w-lg mx-auto text-center py-16">
        <AlertCircle className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Missing Information</h2>
        <p className="text-muted-foreground mb-6">Please complete the student details first.</p>
        <Button onClick={() => router.push('/order/student-details')} className="gradient-orange text-white">
          Go to Student Details
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto pb-24 sm:pb-16">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
        <div className="inline-flex items-center justify-center h-12 w-12 rounded-2xl bg-blue-500/10 mb-4">
          <CreditCard className="h-6 w-6 text-blue-400" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold font-[var(--font-heading)]">Payment</h2>
        <p className="mt-2 text-muted-foreground">Scan, pay, and upload your screenshot</p>
      </motion.div>

      <div className="space-y-6">
        {/* Order Summary */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6">
          <h3 className="text-sm font-medium uppercase tracking-widest text-muted-foreground mb-4">Order Summary</h3>

          {dinnerItems.length > 0 && (
            <div className="mb-4">
              <p className="text-xs text-muted-foreground mb-2">🍔 Dinner</p>
              {dinnerItems.map((item) => (
                <div key={item.id} className="flex justify-between items-center py-1">
                  <div className="flex items-center gap-2">
                    <VegBadge status={item.veg_status} size="sm" />
                    <span className="text-sm text-white">{item.name} × {item.quantity}</span>
                  </div>
                  <span className="text-sm font-medium text-white">{formatCurrency(item.price * item.quantity)}</span>
                </div>
              ))}
              <div className="flex justify-between pt-1 mt-1 border-t border-white/5">
                <span className="text-xs text-muted-foreground">Dinner Subtotal</span>
                <span className="text-sm font-semibold">{formatCurrency(dinnerTotal)}</span>
              </div>
            </div>
          )}

          {breakfastItems.length > 0 && (
            <div className="mb-4">
              <p className="text-xs text-muted-foreground mb-2">☕ Breakfast</p>
              {breakfastItems.map((item) => (
                <div key={item.id} className="flex justify-between items-center py-1">
                  <div className="flex items-center gap-2">
                    <VegBadge status={item.veg_status} size="sm" />
                    <span className="text-sm text-white">{item.name} × {item.quantity}</span>
                  </div>
                  <span className="text-sm font-medium text-white">{formatCurrency(item.price * item.quantity)}</span>
                </div>
              ))}
              <div className="flex justify-between pt-1 mt-1 border-t border-white/5">
                <span className="text-xs text-muted-foreground">Breakfast Subtotal</span>
                <span className="text-sm font-semibold">{formatCurrency(breakfastTotal)}</span>
              </div>
            </div>
          )}

          <Separator className="bg-white/10 my-3" />
          <div className="space-y-1.5 text-xs text-zinc-400">
            <div className="flex justify-between">
              <span>Items Subtotal</span>
              <span className="text-white font-medium">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>GST & Service Tax (5%)</span>
              <span className="text-white font-medium">{formatCurrency(gstAmount)}</span>
            </div>
            <div className="flex justify-between">
              <span>Restaurant Packaging Fee</span>
              <span className="text-white font-medium">{formatCurrency(packagingFee)}</span>
            </div>

            <Separator className="bg-white/10 my-2" />

            <div className="flex justify-between items-center pt-1">
              <span className="font-semibold text-white text-base">Grand Total</span>
              <span className="text-2xl font-bold text-orange-500 font-mono">{formatCurrency(grandTotal)}</span>
            </div>
          </div>
        </motion.div>

        {/* QR Code Section */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-6 text-center">
          <h3 className="text-sm font-medium uppercase tracking-widest text-muted-foreground mb-4">Scan & Pay</h3>

          {qrCode?.image_url ? (
            <div className="relative w-64 h-64 mx-auto mb-4 rounded-xl overflow-hidden bg-white p-4">
              <Image src={qrCode.image_url} alt="Payment QR Code" fill className="object-contain" />
            </div>
          ) : (
            <div className="w-64 h-64 mx-auto mb-4 rounded-xl bg-white/5 flex items-center justify-center">
              <p className="text-muted-foreground text-sm">QR Code not configured</p>
            </div>
          )}

          {qrCode?.upi_id && (
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-sm text-muted-foreground">UPI ID:</span>
              <code className="text-sm font-mono text-white bg-white/10 px-2 py-0.5 rounded">{qrCode.upi_id}</code>
              <Button onClick={handleCopyUPI} variant="ghost" size="icon" className="h-7 w-7">
                {copied ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
              </Button>
            </div>
          )}

          {qrCode?.account_holder && (
            <p className="text-xs text-muted-foreground">Account: {qrCode.account_holder}</p>
          )}

          <p className="text-lg font-bold text-gradient-orange mt-3">Pay {formatCurrency(grandTotal)}</p>
        </motion.div>

        {/* Upload Screenshot */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card p-6">
          <h3 className="text-sm font-medium uppercase tracking-widest text-muted-foreground mb-4">Upload Payment Proof</h3>

          <div className="space-y-4">
            <div
              className="border-2 border-dashed border-white/10 rounded-xl p-8 text-center hover:border-orange-500/30 transition-colors cursor-pointer"
              onClick={() => document.getElementById('screenshot-input')?.click()}
            >
              {screenshotPreview ? (
                <div className="relative w-48 h-48 mx-auto rounded-lg overflow-hidden">
                  <Image src={screenshotPreview} alt="Payment screenshot" fill className="object-contain" />
                </div>
              ) : (
                <>
                  <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Click to upload payment screenshot</p>
                  <p className="text-xs text-muted-foreground/50 mt-1">JPEG, PNG, WebP • Max 5MB</p>
                </>
              )}
            </div>
            <input
              id="screenshot-input"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileChange}
              className="hidden"
            />

            <div className="space-y-2">
              <Label htmlFor="transaction-id">Transaction ID (Optional)</Label>
              <Input
                id="transaction-id"
                placeholder="e.g. UPI123456789"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                className="bg-white/5 border-white/10 focus:border-orange-500/50"
              />
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="payment-confirmed"
                checked={confirmed}
                onCheckedChange={(checked) => setConfirmed(checked === true)}
                className="border-white/20 data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
              />
              <Label htmlFor="payment-confirmed" className="text-sm cursor-pointer">
                I have completed the payment of {formatCurrency(grandTotal)}
              </Label>
            </div>
          </div>
        </motion.div>

        {/* Submit Button */}
        <Button
          onClick={handleSubmit}
          size="lg"
          disabled={isSubmitting || !screenshotFile || !confirmed}
          className="w-full gradient-orange text-white font-semibold rounded-2xl py-6 hover:opacity-90 transition-all disabled:opacity-50 text-base shadow-xl"
        >
          {isSubmitting ? 'Submitting Order...' : 'Submit Order'}
        </Button>
      </div>
    </div>
  );
}
