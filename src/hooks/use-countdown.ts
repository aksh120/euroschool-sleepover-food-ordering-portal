'use client';

import { useState, useEffect } from 'react';
import { getTimeRemaining } from '@/lib/utils';

export function useCountdown(deadline: string | Date) {
  const [timeRemaining, setTimeRemaining] = useState(getTimeRemaining(deadline));

  useEffect(() => {
    const timer = setInterval(() => {
      const remaining = getTimeRemaining(deadline);
      setTimeRemaining(remaining);

      if (remaining.isExpired) {
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [deadline]);

  return timeRemaining;
}
