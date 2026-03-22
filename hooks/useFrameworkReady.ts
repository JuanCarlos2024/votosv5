// hooks/useFrameworkReady.ts
import { useEffect, useState } from 'react';

export function useFrameworkReady() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setTimeout(() => setIsReady(true), 100); // simulación
  }, []);

  return isReady;
}
