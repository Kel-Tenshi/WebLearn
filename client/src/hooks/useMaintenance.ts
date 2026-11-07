import { useCallback, useEffect, useState } from 'react';
import { equipmentApi, operationsApi } from '../api';
import { Equipment, MaintenanceLog } from '../types';

export function useMaintenance() {
  const [maintenance, setMaintenance] = useState<MaintenanceLog[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [maintenanceList, equipmentList] = await Promise.all([
        operationsApi.getMaintenance(),
        equipmentApi.getAll(),
      ]);

      setMaintenance(maintenanceList);
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
    maintenance,
    equipment,
    loading,
    error,
    reload,
    create: operationsApi.createMaintenance,
    updateStatus: operationsApi.updateMaintenanceStatus,
  };
}
