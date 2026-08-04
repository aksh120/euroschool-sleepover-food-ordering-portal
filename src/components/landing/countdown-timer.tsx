'use client';

import { useState, useEffect } from 'react';
import { useCountdown } from '@/hooks/use-countdown';

interface CountdownTimerProps {
  deadline: string;
}

export function CountdownTimer({ deadline }: CountdownTimerProps) {
  const [isMounted, setIsMounted] = useState(false);
  const { days, hours, minutes, seconds, isExpired } = useCountdown(deadline);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="flex items-center justify-center gap-1.5 sm:gap-3 max-w-full overflow-x-auto py-1">
        {['Days', 'Hours', 'Minutes', 'Seconds'].map((label, index) => (
          <div key={label} className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            <div className="bg-[#121215] border border-white/10 rounded-xl sm:rounded-2xl flex flex-col items-center px-2.5 py-2 sm:px-4 sm:py-3 min-w-[58px] sm:min-w-[80px] shadow-sm">
              <span className="text-xl sm:text-3xl font-bold font-mono text-white tracking-tight">
                00
              </span>
              <span className="mt-0.5 text-[9px] sm:text-[11px] font-medium uppercase tracking-wider text-zinc-400">
                {label}
              </span>
            </div>
            {index < 3 && (
              <span className="text-zinc-600 font-bold text-base sm:text-lg select-none shrink-0">:</span>
            )}
          </div>
        ))}
      </div>
    );
  }

  if (isExpired) {
    return (
      <div className="glass-card px-4 py-3 sm:px-6 sm:py-4 text-center border-red-500/20 bg-red-500/5">
        <p className="text-xs sm:text-sm font-semibold text-red-400">
          Ordering is currently closed
        </p>
      </div>
    );
  }

  const units = [
    { label: 'Days', value: days },
    { label: 'Hours', value: hours },
    { label: 'Minutes', value: minutes },
    { label: 'Seconds', value: seconds },
  ];

  return (
    <div className="flex items-center justify-center gap-1.5 sm:gap-3 max-w-full overflow-x-auto py-1">
      {units.map((unit, index) => (
        <div key={unit.label} className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          <div className="bg-[#121215] border border-white/10 rounded-xl sm:rounded-2xl flex flex-col items-center px-2.5 py-2 sm:px-4 sm:py-3 min-w-[58px] sm:min-w-[80px] shadow-sm">
            <span className="text-xl sm:text-3xl font-bold font-mono text-white tracking-tight">
              {String(unit.value).padStart(2, '0')}
            </span>
            <span className="mt-0.5 text-[9px] sm:text-[11px] font-medium uppercase tracking-wider text-zinc-400">
              {unit.label}
            </span>
          </div>
          {index < units.length - 1 && (
            <span className="text-zinc-600 font-bold text-base sm:text-lg select-none shrink-0">:</span>
          )}
        </div>
      ))}
    </div>
  );
}
