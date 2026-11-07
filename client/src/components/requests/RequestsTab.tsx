import React from 'react';
import { RequestItem, RequestStatus, User } from '../../types';
import { useRequests } from '../../hooks/useRequests';
import { useAlert } from '../../context/AlertContext';
import { RequestForm } from './RequestForm';
import { RequestsTable } from './RequestsTable';

export const RequestsTab: React.FC<{ user: User }> = ({ user }) => {
  const { showAlert, showApiError } = useAlert();
  const { requests, equipment, reload, create, updateStatus } = useRequests();

  const canManage = user.role === 'manager' || user.role === 'admin';

  const handleCreate = async (data: Partial<RequestItem>) => {
    try {
      await create(data);
      showAlert('Заявка создана', 'success');
      await reload();
    } catch (error) {
      showApiError(error);
      throw error;
    }
  };

  const handleStatusChange = async (id: number, status: RequestStatus) => {
    try {
      await updateStatus(id, status);
      showAlert('Статус заявки обновлён', 'success');
      await reload();
    } catch (error) {
      showApiError(error);
    }
  };

  return (
    <div className="tab-container">
      <h2>Заявки</h2>

      <RequestForm equipment={equipment} onSubmit={handleCreate} />

      <RequestsTable
        requests={requests}
        canManage={canManage}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
};
