'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { studentFormSchema, type StudentFormValues } from '@/lib/validators';
import { CLASSES, SECTIONS } from '@/lib/constants';
import { useCartStore } from '@/stores/cart-store';
import { checkDuplicateOrder } from '@/actions/orders';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowRight, User, AlertTriangle } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import Link from 'next/link';

export default function StudentDetailsPage() {
  const router = useRouter();
  const { studentInfo, setStudentInfo } = useCartStore();
  const [showDuplicateWarning, setShowDuplicateWarning] = useState(false);
  const [duplicateOrderId, setDuplicateOrderId] = useState<string>('');
  const [isChecking, setIsChecking] = useState(false);

  const form = useForm<StudentFormValues>({
    resolver: zodResolver(studentFormSchema),
    defaultValues: {
      full_name: studentInfo?.full_name || '',
      class: studentInfo?.class || '12',
      section: studentInfo?.section || 'A',
      phone: studentInfo?.phone || '',
      email: studentInfo?.email || '',
      honeypot: '',
    },
  });

  const onSubmit = async (data: StudentFormValues) => {
    setIsChecking(true);

    try {
      const duplicate = await checkDuplicateOrder(data.full_name, data.class, data.section);

      if (duplicate && duplicate.order_id) {
        setDuplicateOrderId(duplicate.order_id);
        setShowDuplicateWarning(true);
        setIsChecking(false);
        return;
      }

      proceedWithOrder(data);
    } catch {
      proceedWithOrder(data);
    }
  };

  const proceedWithOrder = (data: StudentFormValues) => {
    setStudentInfo({
      full_name: data.full_name,
      class: data.class,
      section: data.section,
      phone: data.phone,
      email: data.email,
    });
    setIsChecking(false);
    toast.success('Student details saved!');
    router.push('/order/dinner');
  };

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
  };

  return (
    <>
      <div className="max-w-lg mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-2xl bg-orange-500/10 mb-4">
            <User className="h-6 w-6 text-orange-400" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold font-[var(--font-heading)]">
            Student Details
          </h2>
          <p className="mt-2 text-muted-foreground">
            Please enter your information to proceed with ordering
          </p>
        </motion.div>

        <motion.form
          onSubmit={form.handleSubmit(onSubmit)}
          className="glass-card p-6 sm:p-8 space-y-6"
          {...fadeInUp}
          transition={{ delay: 0.1, duration: 0.4 }}
        >
          {/* Honeypot */}
          <input
            type="text"
            {...form.register('honeypot')}
            className="absolute opacity-0 h-0 w-0 pointer-events-none"
            tabIndex={-1}
            autoComplete="off"
          />

          {/* Full Name */}
          <div className="space-y-2">
            <Label htmlFor="full_name">Full Name *</Label>
            <Input
              id="full_name"
              placeholder="e.g. MS Kohli"
              {...form.register('full_name')}
              className="bg-white/5 border-white/10 focus:border-orange-500/50"
            />
            {form.formState.errors.full_name && (
              <p className="text-xs text-red-400">{form.formState.errors.full_name.message}</p>
            )}
          </div>

          {/* Class & Section */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="class">Class *</Label>
              <Select
                value={form.watch('class') || '12'}
                onValueChange={(value) => form.setValue('class', value || '12', { shouldValidate: true })}
              >
                <SelectTrigger id="class" className="bg-white/5 border-white/10">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {CLASSES.map((c) => (
                    <SelectItem key={c} value={c}>
                      Class {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.class && (
                <p className="text-xs text-red-400">{form.formState.errors.class.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="section">Section *</Label>
              <Select
                value={form.watch('section') || 'A'}
                onValueChange={(value) => form.setValue('section', value || 'A', { shouldValidate: true })}
              >
                <SelectTrigger id="section" className="bg-white/5 border-white/10">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {SECTIONS.map((s) => (
                    <SelectItem key={s} value={s}>
                      Section {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.section && (
                <p className="text-xs text-red-400">{form.formState.errors.section.message}</p>
              )}
            </div>
          </div>

          {/* Phone Number */}
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number *</Label>
            <Input
              id="phone"
              placeholder="e.g. 9876543210"
              {...form.register('phone')}
              className="bg-white/5 border-white/10 focus:border-orange-500/50"
            />
            {form.formState.errors.phone && (
              <p className="text-xs text-red-400">{form.formState.errors.phone.message}</p>
            )}
          </div>

          {/* Email Address */}
          <div className="space-y-2">
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              placeholder="e.g. you@gmail.com"
              {...form.register('email')}
              className="bg-white/5 border-white/10 focus:border-orange-500/50"
            />
            {form.formState.errors.email && (
              <p className="text-xs text-red-400">{form.formState.errors.email.message}</p>
            )}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            size="lg"
            disabled={isChecking}
            className="w-full gradient-orange text-white font-semibold rounded-2xl py-6 hover:opacity-90 transition-all"
          >
            {isChecking ? 'Checking...' : 'Continue to Dinner Menu'}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </motion.form>
      </div>

      {/* Duplicate Warning Dialog */}
      <Dialog open={showDuplicateWarning} onOpenChange={setShowDuplicateWarning}>
        <DialogContent className="glass-strong">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-yellow-400">
              <AlertTriangle className="h-5 w-5" />
              Existing Order Found
            </DialogTitle>
            <DialogDescription>
              A student with this name and class already has an active order
              ({duplicateOrderId}). Would you like to continue placing a new order
              or track the existing one?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 sm:gap-2">
            <Link href={`/track?q=${duplicateOrderId}`}>
              <Button variant="outline" className="border-white/10">
                Track Existing Order
              </Button>
            </Link>
            <Button
              onClick={() => {
                setShowDuplicateWarning(false);
                proceedWithOrder(form.getValues());
              }}
              className="gradient-orange text-white"
            >
              Continue Anyway
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
