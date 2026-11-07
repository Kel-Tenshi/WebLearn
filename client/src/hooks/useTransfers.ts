import { useCallback, useEffect, useState } from 'react';
import { directoryApi, equipmentApi, operationsApi } from '../api';
import { Equipment, LocationItem, Transfer } from '../types';
import { useAlert } from '../context/AlertContext';

export function useTransfers() {
  const { showApiError } = useAlert();

  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const [transferList, equipmentList, locationList] = await Promise.all([
        operationsApi.getTransfers(),
        equipmentApi.getAll(),
        directoryApi.getLocations(),
      ]);

      setTransfers(transferList);
      setEquipment(equipmentList);
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
    transfers,
    equipment,
    locations,
    loading,
    reload,
    create: operationsApi.createTransfer,
    updateStatus: operationsApi.updateTransferStatus,
  };
}
