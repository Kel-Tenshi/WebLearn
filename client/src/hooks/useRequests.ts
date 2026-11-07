import { useCallback, useEffect, useState } from 'react';
import { equipmentApi, requestsApi } from '../api';
import { Equipment, RequestItem } from '../types';

export function useRequests() {
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [requestList, equipmentList] = await Promise.all([
        requestsApi.getAll(),
        equipmentApi.getAll(),
      ]);

      setRequests(requestList);
      setEquipment(equipmentList);
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
    requests,
    equipment,
    loading,
    error,
    reload,
    create: requestsApi.create,
    updateStatus: requestsApi.updateStatus,
  };
}
