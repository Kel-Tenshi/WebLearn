import { useCallback, useEffect, useState } from 'react';
import { directoryApi } from '../api';
import { InventoryAudit, LocationItem } from '../types';

export function useAudits() {
  const [audits, setAudits] = useState<InventoryAudit[]>([]);
  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [auditList, locationList] = await Promise.all([
        directoryApi.getAudits(),
        directoryApi.getLocations(),
      ]);

      setAudits(auditList);
      setLocations(locationList);
    } catch (loadError) {
      setError(loadError);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  return {
    audits,
    locations,
    loading,
    error,
    reload,
    create: directoryApi.createAudit,
    updateStatus: directoryApi.updateAuditStatus,
  };
}
