/**
 * Performance utilities to reduce violations and improve dashboard performance
 */

// Debounce utility to prevent excessive function calls
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Request Animation Frame wrapper for smooth operations
export const scheduleWork = (callback: () => void): void => {
  if (typeof window !== 'undefined' && window.requestAnimationFrame) {
    window.requestAnimationFrame(callback);
  } else {
    setTimeout(callback, 16); // Fallback for 60fps
  }
};

// Batch DOM reads and writes to prevent forced reflows
export const batchDOMOperations = (operations: {
  reads?: Array<() => any>;
  writes?: Array<() => void>;
}): void => {
  scheduleWork(() => {
    // Batch all reads first
    const readResults: any[] = [];
    if (operations.reads) {
      operations.reads.forEach(read => {
        readResults.push(read());
      });
    }
    
    // Then batch all writes
    if (operations.writes) {
      operations.writes.forEach(write => {
        write();
      });
    }
  });
};

// Optimized timeout for large operations
export const optimizedTimeout = (callback: () => void, delay: number): NodeJS.Timeout => {
  return setTimeout(() => {
    scheduleWork(callback);
  }, delay);
};