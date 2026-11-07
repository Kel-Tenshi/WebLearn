import { useCallback, useEffect, useState } from 'react';
import { directoryApi } from '../api';
import { InventoryAudit, LocationItem } from '../types';
import { useAlert } from '../context/AlertContext';

export function useAudits() {
  const { showApiError } = useAlert();

  const [audits, setAudits] = useState<InventoryAudit[]>([]);
  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const [auditList, locationList] = await Promise.all([
        directoryApi.getAudits(),
        directoryApi.getLocations(),
      ]);

      setAudits(auditList);
      setLocations(locationList);
    } catch (error) {
      showApiError(error);
    } finally {
      setLoading(false);
    }
  }, [showApiError]);

  useEffect(() => {
    reload();
  }, [reload]);

  return {
    audits,
    locations,
    loading,
    reload,
    create: directoryApi.createAudit,
    updateStatus: directoryApi.updateAuditStatus,
  };
}
