import { useCallback, useRef } from 'react';
import { useGetList, UseGetListResult } from 'react-admin';

interface UseOptimizedDataFetchOptions {
  resource: string;
  options: any;
  updateInterval?: number;
}

/**
 * Custom hook for optimized data fetching with smart polling
 * Prevents unnecessary re-renders by comparing data with JSON.stringify
 */
export const useOptimizedDataFetch = ({
  resource,
  options,
  updateInterval = 30000, // 30 seconds default
}: UseOptimizedDataFetchOptions): UseGetListResult => {
  const lastDataRef = useRef<string>('');
  
  const result = useGetList(resource, options);
  
  // Smart data comparison to prevent unnecessary re-renders
  const memoizedData = useCallback(() => {
    if (!result.data) return result.data;
    
    const currentDataString = JSON.stringify(result.data);
    
    // If data hasn't changed, return the previous reference to prevent re-renders
    if (currentDataString === lastDataRef.current) {
      return result.data;
    }
    
    lastDataRef.current = currentDataString;
    return result.data;
  }, [result.data]);

  return {
    ...result,
    data: memoizedData(),
  };
};