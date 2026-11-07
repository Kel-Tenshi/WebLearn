import { useCallback, useEffect, useState } from 'react';
import { equipmentApi, operationsApi, requestsApi } from '../api';
import {
  Equipment,
  MaintenanceLog,
  PurchaseOrder,
  RequestItem,
  Transfer,
} from '../types';

export function useDashboard() {
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [maintenance, setMaintenance] = useState<MaintenanceLog[]>([]);
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [requestList, equipmentList, maintenanceList, transferList, orderList] =
        await Promise.all([
          requestsApi.getAll(),
          equipmentApi.getAll(),
          operationsApi.getMaintenance(),
          operationsApi.getTransfers(),
          operationsApi.getOrders(),
        ]);

      setRequests(requestList);
      setEquipment(equipmentList);
      setMaintenance(maintenanceList);
      setTransfers(transferList);
      setOrders(orderList);
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
    maintenance,
    transfers,
    orders,
    loading,
    error,
    reload,
  };
}
