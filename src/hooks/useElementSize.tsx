import { useCallback, useEffect, useState, RefObject, useRef } from 'react';

interface ElementSize {
  width: number;
  height: number;
}

interface UseElementSizeOptions {
  debounceMs?: number;
}

export const useElementSize = <T extends HTMLElement>(
  ref: RefObject<T>,
  options: UseElementSizeOptions = {}
): ElementSize => {
  const { debounceMs = 0 } = options;
  const [size, setSize] = useState<ElementSize>({ width: 0, height: 0 });
  const timeoutRef = useRef<number>();
  const lastSize = useRef<ElementSize>({ width: 0, height: 0 });

  const updateSize = useCallback(() => {
    const element = ref.current;
    if (element) {
      const { width, height } = element.getBoundingClientRect();
      
      // Csak akkor frissítünk, ha tényleg változott a méret
      if (width !== lastSize.current.width || height !== lastSize.current.height) {
        lastSize.current = { width, height };
        setSize({ width, height });
      }
    }
  }, [ref]);

  const debouncedUpdateSize = useCallback(() => {
    // Ha van aktív timeout, töröljük
    if (timeoutRef.current !== undefined) {
      window.clearTimeout(timeoutRef.current);
    }

    // Ha nincs debounce beállítva, azonnal futtatjuk
    if (debounceMs <= 0) {
      updateSize();
      return;
    }

    // Különben beállítunk egy új timeout-ot
    timeoutRef.current = window.setTimeout(() => {
      updateSize();
    }, debounceMs);
  }, [debounceMs, updateSize]);

  useEffect(() => {
    // Kezdeti mérés
    debouncedUpdateSize();

    const element = ref.current;
    if (element) {
      const resizeObserver = new ResizeObserver(() => {
        debouncedUpdateSize();
      });

      resizeObserver.observe(element);

      // Cleanup
      return () => {
        if (timeoutRef.current !== undefined) {
          window.clearTimeout(timeoutRef.current);
        }
        resizeObserver.disconnect();
      };
    }
  }, [ref, debouncedUpdateSize]);

  return size;
};