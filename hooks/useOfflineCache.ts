import { useEffect, useState } from 'react';
import { getCachedData, setCachedData } from '@/lib/supabase';
import NetInfo from '@react-native-community/netinfo';

export function useOfflineCache<T>(
  key: string,
  fetchFunction: () => Promise<T>,
  options: {
    ttlMinutes?: number;
    enabled?: boolean;
  } = {}
) {
  const { ttlMinutes = 60, enabled = true } = options;
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOnline(state.isConnected ?? true);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!enabled) {
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    async function loadData() {
      try {
        setIsLoading(true);
        setError(null);

        const cachedData = await getCachedData<T>(key);

        if (cachedData && isMounted) {
          setData(cachedData);
          setIsLoading(false);
        }

        if (isOnline) {
          const freshData = await fetchFunction();

          if (isMounted) {
            setData(freshData);
            await setCachedData(key, freshData, ttlMinutes);
          }
        } else if (!cachedData) {
          throw new Error('No internet connection and no cached data available');
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error('Unknown error'));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [key, isOnline, enabled, ttlMinutes]);

  const refetch = async () => {
    if (!isOnline) {
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const freshData = await fetchFunction();
      setData(freshData);
      await setCachedData(key, freshData, ttlMinutes);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };

  return {
    data,
    isLoading,
    error,
    refetch,
    isOnline,
  };
}
