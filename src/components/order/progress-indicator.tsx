'use client';

import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ORDER_STEPS } from '@/lib/constants';
import { User, Utensils, Coffee, CreditCard, CheckCircle2, Check } from 'lucide-react';

const stepIcons = {
  'user': User,
  'utensils': Utensils,
  'coffee': Coffee,
  'credit-card': CreditCard,
  'check-circle': CheckCircle2,
};

export function ProgressIndicator() {
  const pathname = usePathname();

  const currentStepIndex = ORDER_STEPS.findIndex((s) => pathname.includes(s.path));
  const currentStep = currentStepIndex >= 0 ? currentStepIndex + 1 : 1;

  return (
    <div className="w-full max-w-2xl mx-auto py-1 sm:py-2 px-1">
      <div className="flex items-center justify-between relative">
        {/* Progress bar background */}
        <div className="absolute top-3.5 sm:top-4 left-[10%] right-[10%] h-[2px] bg-zinc-800" />

        {/* Active progress bar */}
        <motion.div
          className="absolute top-3.5 sm:top-4 left-[10%] h-[2px] bg-orange-500"
          initial={{ width: '0%' }}
          animate={{
            width: `${Math.max(0, ((currentStep - 1) / (ORDER_STEPS.length - 1)) * 80)}%`,
          }}
          transition={{ duration: 0.4, ease: 'easeInOut' }}
        />

        {ORDER_STEPS.map((step, index) => {
          const stepNumber = index + 1;
          const isActive = stepNumber === currentStep;
          const isCompleted = stepNumber < currentStep;
          const IconComponent = stepIcons[step.icon as keyof typeof stepIcons];

          return (
            <div key={step.step} className="relative flex flex-col items-center z-10 shrink-0">
              <div
                className={cn(
                  'flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg sm:rounded-xl border text-xs font-semibold transition-all duration-200',
                  isCompleted && 'bg-orange-500 text-white border-orange-500',
                  isActive && 'bg-[#121215] border-orange-500 text-orange-400 shadow-sm',
                  !isActive && !isCompleted && 'bg-[#121215] border-zinc-800 text-zinc-500'
                )}
              >
                {isCompleted ? (
                  <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4 stroke-[2.5]" />
                ) : (
                  <IconComponent className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                )}
              </div>
              <span
                className={cn(
                  'mt-1.5 text-[9px] sm:text-[11px] font-medium text-center whitespace-nowrap transition-colors duration-200',
                  isActive ? 'text-orange-400 font-semibold' : isCompleted ? 'text-zinc-300' : 'text-zinc-500'
                )}
              >
                <span className="hidden sm:inline">{step.label}</span>
                <span className="sm:hidden">{step.step}</span>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
