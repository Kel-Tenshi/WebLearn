import React from 'react';
import { MaintenanceLog, MaintenanceStatus, User } from '../../types';
import { useMaintenance } from '../../hooks/useMaintenance';
import { useAlert } from '../../context/AlertContext';
import { MaintenanceSection } from './MaintenanceSection';
import { Loading } from '../ui/Loading';

export const MaintenanceTab: React.FC<{ user: User }> = ({ user }) => {
  const { showAlert, showApiError } = useAlert();
  const { maintenance, equipment, loading, reload, create, updateStatus } = useMaintenance();

  const canManage = user.role === 'manager' || user.role === 'admin';

  const handleCreate = async (data: Partial<MaintenanceLog>) => {
    try {
      await create(data);
      showAlert('Запись ТО добавлена в план', 'success');
      await reload();
    } catch (error) {
      showApiError(error);
      throw error;
    }
  };

  const handleStatusChange = async (id: number, status: string) => {
    try {
      await updateStatus(id, status as MaintenanceStatus);
      showAlert('Статус ТО обновлён', 'success');
      await reload();
    } catch (error) {
      showApiError(error);
    }
  };

  if (loading) return <Loading label="Загрузка журнала ТО…" />;

  return (
    <MaintenanceSection
      items={maintenance}
      equipment={equipment}
      canManage={canManage}
      onCreate={handleCreate}
      onStatusChange={handleStatusChange}
    />
  );
};
