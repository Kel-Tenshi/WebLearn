import React from 'react';
import { TransferStatus, User } from '../../types';
import { useTransfers } from '../../hooks/useTransfers';
import { useAlert } from '../../context/AlertContext';
import { TransfersSection } from './TransfersSection';
import { Loading } from '../ui/Loading';

export const TransfersTab: React.FC<{ user: User }> = ({ user }) => {
  const { showAlert, showApiError } = useAlert();
  const { transfers, equipment, locations, loading, reload, create, updateStatus } =
    useTransfers();

  const canManage = user.role === 'manager' || user.role === 'admin';

  const handleCreate = async (data: {
    equipmentId: number;
    toLocationId: number;
    reason?: string;
  }) => {
    try {
      await create(data);
      showAlert('Перемещение оформлено и ожидает приёма', 'success');
      await reload();
    } catch (error) {
      showApiError(error);
      throw error;
    }
  };

  const handleStatusChange = async (id: number, status: string) => {
    try {
      await updateStatus(id, status as TransferStatus);
      showAlert(
        status === 'Принято'
          ? 'Перемещение принято, локация оборудования обновлена'
          : 'Перемещение отклонено',
        'success'
      );
      await reload();
    } catch (error) {
      showApiError(error);
    }
  };

  if (loading) return <Loading label="Загрузка перемещений…" />;

  return (
    <TransfersSection
      items={transfers}
      equipment={equipment}
      locations={locations}
      canManage={canManage}
      onCreate={handleCreate}
      onStatusChange={handleStatusChange}
    />
  );
};
