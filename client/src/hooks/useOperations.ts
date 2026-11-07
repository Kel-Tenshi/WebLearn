import { useCallback, useEffect, useState } from 'react';
import { directoryApi, equipmentApi, operationsApi } from '../api';
import {
  Equipment,
  LocationItem,
  MaintenanceLog,
  PurchaseOrder,
  Supplier,
  Transfer,
} from '../types';
import { useAlert } from '../context/AlertContext';

export function useOperations() {
  const { showApiError } = useAlert();

  const [maintenance, setMaintenance] = useState<MaintenanceLog[]>([]);
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    try {
      const [maintenanceList, transferList, orderList, equipmentList, locationList, supplierList] =
        await Promise.all([
          operationsApi.getMaintenance(),
          operationsApi.getTransfers(),
          operationsApi.getOrders(),
          equipmentApi.getAll(),
          directoryApi.getLocations(),
          directoryApi.getSuppliers(),
        ]);

      setMaintenance(maintenanceList);
      setTransfers(transferList);
      setOrders(orderList);
      setEquipment(equipmentList);
      setLocations(locationList);
      setSuppliers(supplierList);
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
    transfers,
    orders,
    equipment,
    locations,
    suppliers,
    loading,
    reload,
    createMaintenance: operationsApi.createMaintenance,
    updateMaintenanceStatus: operationsApi.updateMaintenanceStatus,
    createTransfer: operationsApi.createTransfer,
    createOrder: operationsApi.createOrder,
    updateOrderStatus: operationsApi.updateOrderStatus,
  };
}
