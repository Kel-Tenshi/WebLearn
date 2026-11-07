import { useCallback, useEffect, useState } from 'react';
import { directoryApi, operationsApi } from '../api';
import { PurchaseOrder, Supplier } from '../types';
import { useAlert } from '../context/AlertContext';

export function useOrders() {
  const { showApiError } = useAlert();

  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const [orderList, supplierList] = await Promise.all([
        operationsApi.getOrders(),
        directoryApi.getSuppliers(),
      ]);

      setOrders(orderList);
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
    orders,
    suppliers,
    loading,
    reload,
    create: operationsApi.createOrder,
    updateStatus: operationsApi.updateOrderStatus,
  };
}
