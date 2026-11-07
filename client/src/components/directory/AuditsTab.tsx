import React from 'react';
import { AuditStatus, User } from '../../types';
import { useAudits } from '../../hooks/useAudits';
import { useAlert } from '../../context/AlertContext';
import { AuditsCard } from './AuditsCard';
import { Loading } from '../ui/Loading';

export const AuditsTab: React.FC<{ user: User }> = ({ user }) => {
  const { showAlert, showApiError } = useAlert();
  const { audits, locations, loading, reload, create, updateStatus } = useAudits();

  const canManage = user.role === 'manager' || user.role === 'admin';

  const handleCreate = async (data: { locationId: number }) => {
    try {
      await create(data);
      showAlert('Акт инвентаризации создан', 'success');
      await reload();
    } catch (error) {
      showApiError(error);
      throw error;
    }
  };

  const handleStatusChange = async (id: number, status: string) => {
    try {
      const notes = status === 'Завершена' ? 'Проверено без замечаний' : undefined;
      await updateStatus(id, status as AuditStatus, notes);
      showAlert('Статус инвентаризации обновлён', 'success');
      await reload();
    } catch (error) {
      showApiError(error);
    }
  };

  if (loading) {
    return (
      <div className="tab-container">
        <h2>Инвентаризация</h2>
        <Loading label="Загрузка актов инвентаризации…" />
      </div>
    );
  }

  return (
    <div className="tab-container">
      <h2>Инвентаризация</h2>
      <AuditsCard
        items={audits}
        locations={locations}
        canManage={canManage}
        onCreate={handleCreate}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
};
