import { useCallback, useEffect, useState } from 'react';
import { equipmentApi, requestsApi } from '../api';
import { Equipment, RequestItem } from '../types';
import { useAlert } from '../context/AlertContext';

export function useRequests() {
  const { showApiError } = useAlert();

  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const [requestList, equipmentList] = await Promise.all([
        requestsApi.getAll(),
        equipmentApi.getAll(),
      ]);

      setRequests(requestList);
      setEquipment(equipmentList);
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
    requests,
    equipment,
    loading,
    reload,
    create: requestsApi.create,
    updateStatus: requestsApi.updateStatus,
  };
}
