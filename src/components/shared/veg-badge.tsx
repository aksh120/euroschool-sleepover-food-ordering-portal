import { cn } from '@/lib/utils';

interface VegBadgeProps {
  status: 'veg' | 'non-veg';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function VegBadge({ status, size = 'md', className }: VegBadgeProps) {
  const isVeg = status === 'veg';

  const sizeClasses = {
    sm: 'h-3.5 w-3.5 text-[9px]',
    md: 'h-4.5 w-4.5 text-[10px]',
    lg: 'h-5.5 w-5.5 text-xs',
  };

  const dotSizes = {
    sm: 'h-1.5 w-1.5',
    md: 'h-2 w-2',
    lg: 'h-2.5 w-2.5',
  };

  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      <div
        className={cn(
          'flex items-center justify-center rounded-sm border-2',
          sizeClasses[size],
          isVeg
            ? 'border-green-500'
            : 'border-red-500'
        )}
      >
        <div
          className={cn(
            'rounded-full',
            dotSizes[size],
            isVeg ? 'bg-green-500' : 'bg-red-500'
          )}
        />
      </div>
      <span
        className={cn(
          'font-medium uppercase tracking-wider',
          size === 'sm' ? 'text-[10px]' : size === 'md' ? 'text-xs' : 'text-sm',
          isVeg ? 'text-green-400' : 'text-red-400'
        )}
      >
        {isVeg ? 'Veg' : 'Non-Veg'}
      </span>
    </div>
  );
}
