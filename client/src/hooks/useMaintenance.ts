import { useCallback, useEffect, useState } from 'react';
import { equipmentApi, operationsApi } from '../api';
import { Equipment, MaintenanceLog } from '../types';
import { useAlert } from '../context/AlertContext';

export function useMaintenance() {
  const { showApiError } = useAlert();

  const [maintenance, setMaintenance] = useState<MaintenanceLog[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const [maintenanceList, equipmentList] = await Promise.all([
        operationsApi.getMaintenance(),
        equipmentApi.getAll(),
      ]);

      setMaintenance(maintenanceList);
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
    maintenance,
    equipment,
    loading,
    reload,
    create: operationsApi.createMaintenance,
    updateStatus: operationsApi.updateMaintenanceStatus,
  };
}
