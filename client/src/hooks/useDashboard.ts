import { useCallback, useEffect, useState } from 'react';
import { equipmentApi, operationsApi, requestsApi } from '../api';
import {
  Equipment,
  MaintenanceLog,
  PurchaseOrder,
  RequestItem,
  Transfer,
} from '../types';
import { useAlert } from '../context/AlertContext';

export function useDashboard() {
  const { showApiError } = useAlert();

  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [maintenance, setMaintenance] = useState<MaintenanceLog[]>([]);
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
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
    maintenance,
    transfers,
    orders,
    loading,
    reload,
  };
}
