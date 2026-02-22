import { useEffect, useRef } from 'react';
import { useLocation } from '@tanstack/react-router';
import { useActor } from './useActor';

export function useTrafficCounter() {
  const { actor } = useActor();
  const location = useLocation();
  const hasIncrementedRef = useRef(false);
  const lastPathRef = useRef<string>('');

  useEffect(() => {
    // Only increment if:
    // 1. Actor is available
    // 2. Path has changed
    // 3. Haven't already incremented for this path
    if (actor && location.pathname !== lastPathRef.current) {
      lastPathRef.current = location.pathname;
      
      // Reset the flag when path changes
      if (hasIncrementedRef.current) {
        hasIncrementedRef.current = false;
      }

      // Increment counter
      if (!hasIncrementedRef.current) {
        hasIncrementedRef.current = true;
        
        actor.incrementAndGetTrafficCounter().catch((error) => {
          console.error('Failed to increment traffic counter:', error);
        });
      }
    }
  }, [actor, location.pathname]);
}
