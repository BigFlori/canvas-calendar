import { useCallback, useEffect, useState, RefObject } from 'react';

interface ElementSize {
  width: number;
  height: number;
}

export const useElementSize = <T extends HTMLElement>(ref: RefObject<T>): ElementSize => {
  const [size, setSize] = useState<ElementSize>({ width: 0, height: 0 });

  const updateSize = useCallback(() => {
    const element = ref.current;
    if (element) {
      const { width, height } = element.getBoundingClientRect();
      setSize({ width, height });
    }
  }, [ref]);

  useEffect(() => {
    // Initial measurement
    updateSize();

    // Set up ResizeObserver
    const element = ref.current;
    if (element) {
      const resizeObserver = new ResizeObserver(() => {
        updateSize();
      });

      resizeObserver.observe(element);

      // Cleanup
      return () => {
        resizeObserver.disconnect();
      };
    }
  }, [ref, updateSize]);

  return size;
};