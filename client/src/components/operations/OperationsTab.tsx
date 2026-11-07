import React, { useState } from 'react';
import { MaintenanceLog, OrderStatus, PurchaseOrder, User } from '../../types';
import { useOperations } from '../../hooks/useOperations';
import { useAlert } from '../../context/AlertContext';
import { MaintenanceSection } from './MaintenanceSection';
import { TransfersSection } from './TransfersSection';
import { OrdersSection } from './OrdersSection';

type SubTab = 'maintenance' | 'transfers' | 'orders';

export const OperationsTab: React.FC<{ user: User }> = ({ user }) => {
  const { showAlert, showApiError } = useAlert();
  const {
    maintenance,
    transfers,
    orders,
    equipment,
    locations,
    suppliers,
    reload,
    createMaintenance,
    updateMaintenanceStatus,
    createTransfer,
    createOrder,
    updateOrderStatus,
  } = useOperations();

  const [subTab, setSubTab] = useState<SubTab>('maintenance');

  const canManage = user.role === 'manager' || user.role === 'admin';

  const handleCreateMaintenance = async (data: Partial<MaintenanceLog>) => {
    try {
      await createMaintenance(data);
      showAlert('Запись ТО добавлена', 'success');
      await reload();
    } catch (error) {
      showApiError(error);
      throw error;
    }
  };

  const handleFinishMaintenance = async (id: number) => {
    try {
      await updateMaintenanceStatus(id, 'Завершено');
      showAlert('ТО завершено', 'success');
      await reload();
    } catch (error) {
      showApiError(error);
    }
  };

  const handleCreateTransfer = async (data: {
    equipmentId: number;
    toLocationId: number;
    reason?: string;
  }) => {
    try {
      await createTransfer(data);
      showAlert('Перемещение оформлено', 'success');
      await reload();
    } catch (error) {
      showApiError(error);
      throw error;
    }
  };

  const handleCreateOrder = async (data: Partial<PurchaseOrder>) => {
    try {
      await createOrder(data);
      showAlert('Заказ создан', 'success');
      await reload();
    } catch (error) {
      showApiError(error);
      throw error;
    }
  };

  const handleOrderStatus = async (id: number, status: OrderStatus) => {
    try {
      await updateOrderStatus(id, status);
      showAlert('Статус заказа обновлён', 'success');
      await reload();
    } catch (error) {
      showApiError(error);
    }
  };

  return (
    <div className="tab-container">
      <div className="sub-nav">
        <button
          className={subTab === 'maintenance' ? 'active' : ''}
          onClick={() => setSubTab('maintenance')}
        >
          ТО и Ремонт
        </button>
        <button
          className={subTab === 'transfers' ? 'active' : ''}
          onClick={() => setSubTab('transfers')}
        >
          Перемещения
        </button>
        <button
          className={subTab === 'orders' ? 'active' : ''}
          onClick={() => setSubTab('orders')}
        >
          Снабжение и Заказы
        </button>
      </div>

      {subTab === 'maintenance' && (
        <MaintenanceSection
          items={maintenance}
          equipment={equipment}
          canManage={canManage}
          onCreate={handleCreateMaintenance}
          onFinish={handleFinishMaintenance}
        />
      )}

      {subTab === 'transfers' && (
        <TransfersSection
          items={transfers}
          equipment={equipment}
          locations={locations}
          canManage={canManage}
          onCreate={handleCreateTransfer}
        />
      )}

      {subTab === 'orders' && (
        <OrdersSection
          items={orders}
          suppliers={suppliers}
          canManage={canManage}
          onCreate={handleCreateOrder}
          onStatusChange={handleOrderStatus}
        />
      )}
    </div>
  );
};
