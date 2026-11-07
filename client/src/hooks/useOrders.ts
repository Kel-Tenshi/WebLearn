import { useCallback, useEffect, useState } from 'react';
import { directoryApi, operationsApi } from '../api';
import { PurchaseOrder, Supplier } from '../types';

export function useOrders() {
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [orderList, supplierList] = await Promise.all([
        operationsApi.getOrders(),
        directoryApi.getSuppliers(),
      ]);

      setOrders(orderList);
      setSuppliers(supplierList);
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
    orders,
    suppliers,
    loading,
    error,
    reload,
    create: operationsApi.createOrder,
    updateStatus: operationsApi.updateOrderStatus,
  };
}
