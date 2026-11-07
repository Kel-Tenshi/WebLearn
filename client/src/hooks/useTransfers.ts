import { useCallback, useEffect, useState } from 'react';
import { directoryApi, equipmentApi, operationsApi } from '../api';
import { Equipment, LocationItem, Transfer } from '../types';

export function useTransfers() {
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [transferList, equipmentList, locationList] = await Promise.all([
        operationsApi.getTransfers(),
        equipmentApi.getAll(),
        directoryApi.getLocations(),
      ]);

      setTransfers(transferList);
      setEquipment(equipmentList);
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
    transfers,
    equipment,
    locations,
    loading,
    error,
    reload,
    create: operationsApi.createTransfer,
    updateStatus: operationsApi.updateTransferStatus,
  };
}
