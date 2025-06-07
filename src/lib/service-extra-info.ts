import { ServiceType } from "@prisma/client";
import { useState, useEffect, useMemo } from "react";

interface ServiceItem {
  name: string;
  serviceType: ServiceType;
}

interface ServiceExtraInfo {
  id: string;
  serviceType: ServiceType;
  serviceNames: string[];
  extraInfo: string;
  createdAt: string;
  updatedAt: string;
}

export function useServiceExtraInfo(serviceItems: ServiceItem[]) {
  const [extraInfoMap, setExtraInfoMap] = useState<Map<string, string>>(
    new Map()
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Memoize the service items to prevent unnecessary re-renders
  const memoizedServiceItems = useMemo(() => {
    return serviceItems.map((item) => ({
      name: item.name,
      serviceType: item.serviceType,
    }));
  }, [serviceItems]);

  useEffect(() => {
    let isMounted = true;

    async function fetchExtraInfo() {
      try {
        setLoading(true);
        const response = await fetch("/api/service-extra-info");
        if (!response.ok) {
          throw new Error("Failed to fetch service extra info");
        }
        const serviceExtraInfos: ServiceExtraInfo[] = await response.json();

        // Create a map to store service name -> extra info
        const newExtraInfoMap = new Map<string, string>();

        // For each service item, find matching extra info
        for (const item of memoizedServiceItems) {
          const matchingExtraInfo = serviceExtraInfos.find(
            (info) =>
              info.serviceType === item.serviceType &&
              info.serviceNames.some((name) =>
                item.name.toLowerCase().includes(name.toLowerCase())
              )
          );

          if (matchingExtraInfo) {
            newExtraInfoMap.set(item.name, matchingExtraInfo.extraInfo);
          }
        }

        if (isMounted) {
          setExtraInfoMap(newExtraInfoMap);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error("An error occurred"));
          console.error("Error fetching service extra info:", err);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    if (memoizedServiceItems.length > 0) {
      fetchExtraInfo();
    }

    return () => {
      isMounted = false;
    };
  }, [memoizedServiceItems]);

  return { extraInfoMap, loading, error };
}
