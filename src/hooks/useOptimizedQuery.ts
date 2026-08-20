import { useQuery, UseQueryOptions, UseQueryResult } from "@tanstack/react-query";
import { useState, useEffect } from "react";

export interface OptimizedQueryOptions<TData, TError>
  extends Omit<UseQueryOptions<TData, TError, TData, any[]>, "queryKey" | "queryFn"> {
  queryKey: any[];
  queryFn: () => Promise<TData>;
  retryOnReconnect?: boolean;
  offlineData?: TData;
}

export function useOptimizedQuery<TData, TError = Error>({
  queryKey,
  queryFn,
  retryOnReconnect = true,
  offlineData,
  ...options
}: OptimizedQueryOptions<TData, TError>): UseQueryResult<TData, TError> {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  let cachedOfflineData: TData | undefined;
  if (!isOnline && offlineData) {
    try {
      const cachedData = localStorage.getItem(`query-${queryKey.join("-")}`);
      if (cachedData) {
        cachedOfflineData = JSON.parse(cachedData) as TData;
      }
    } catch (error) {
      console.warn("Erreur lors de la récupération des données en cache :", error);
    }
  }

  const effectiveQueryFn = !isOnline && offlineData
    ? () => Promise.resolve(cachedOfflineData ?? offlineData)
    : queryFn;

  const queryResult = useQuery<TData, TError>({
    ...options,
    queryKey,
    queryFn: effectiveQueryFn,
    enabled: options.enabled !== false && (isOnline || !!offlineData),
    retry: retryOnReconnect && isOnline ? options.retry : false,
    gcTime: options.gcTime || 5 * 60 * 1000,
    staleTime: options.staleTime || 60 * 1000,
  });

  useEffect(() => {
    if (queryResult.data && offlineData) {
      try {
        localStorage.setItem(
          `query-${queryKey.join("-")}`,
          JSON.stringify(queryResult.data)
        );
      } catch (error) {
        console.warn("Impossible de mettre en cache les données :", error);
      }
    }
  }, [queryResult.data, queryKey, offlineData]);

  return queryResult;
}
