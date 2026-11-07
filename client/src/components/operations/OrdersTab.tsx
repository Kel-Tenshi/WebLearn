import React from 'react';
import { OrderStatus, PurchaseOrder, User } from '../../types';
import { useOrders } from '../../hooks/useOrders';
import { useAlert } from '../../context/AlertContext';
import { OrdersSection } from './OrdersSection';
import { Loading } from '../ui/Loading';
import { ErrorView } from '../layout/ErrorView';

export const OrdersTab: React.FC<{ user: User }> = ({ user }) => {
  const { showAlert, showApiError } = useAlert();
  const { orders, suppliers, loading, error, reload, create, updateStatus } = useOrders();

  const canManage = user.role === 'manager' || user.role === 'admin';

  const handleCreate = async (data: Partial<PurchaseOrder>) => {
    try {
      await create(data);
      showAlert('Заказ создан в статусе «Черновик»', 'success');
      await reload();
    } catch (error) {
      showApiError(error);
      throw error;
    }
  };

  const handleStatusChange = async (id: number, status: string) => {
    try {
      await updateStatus(id, status as OrderStatus);
      showAlert('Статус заказа обновлён', 'success');
      await reload();
    } catch (error) {
      showApiError(error);
    }
  };

  if (loading) return <Loading label="Загрузка заказов…" />;
  if (error) return <ErrorView error={error} onRetry={reload} />;

  return (
    <OrdersSection
      items={orders}
      suppliers={suppliers}
      canManage={canManage}
      onCreate={handleCreate}
      onStatusChange={handleStatusChange}
    />
  );
};
