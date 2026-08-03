import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/utils';

interface PriceTagProps {
  amount: number;
  originalAmount?: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function PriceTag({ amount, originalAmount, size = 'md', className }: PriceTagProps) {
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-2xl',
  };

  return (
    <div className={cn('flex items-baseline gap-2', className)}>
      <span
        className={cn(
          'font-bold text-white',
          sizeClasses[size]
        )}
      >
        {formatCurrency(amount)}
      </span>
      {originalAmount && originalAmount > amount && (
        <span className="text-sm text-muted-foreground line-through">
          {formatCurrency(originalAmount)}
        </span>
      )}
    </div>
  );
}
