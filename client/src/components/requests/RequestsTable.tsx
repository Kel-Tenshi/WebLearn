import React from 'react';
import { RequestItem, RequestStatus } from '../../types';
import { StatusBadge } from '../ui/StatusBadge';
import { StatusActions } from '../ui/StatusActions';
import { getNextStatuses, getStatusActions } from '../../config/statusMachine';
import type { StatusAction } from '../../config/statusMachine';

interface Props {
  requests: RequestItem[];
  canManage: boolean;
  currentUserLogin: string;
  onStatusChange: (id: number, status: RequestStatus) => void;
}

export const RequestsTable: React.FC<Props> = ({
  requests,
  canManage,
  currentUserLogin,
  onStatusChange,
}) => {
  const getActions = (request: RequestItem): StatusAction[] => {
    if (canManage) return getStatusActions('request', request.status);

    // Сотрудник может отменить только свою заявку и только до выполнения.
    if (
      request.applicant === currentUserLogin &&
      getNextStatuses('request', request.status).includes('Отменено')
    ) {
      return [{ to: 'Отменено', label: 'Отменить', tone: 'danger' }];
    }

    return [];
  };

  return (
    <table className="data-table">
      <thead>
        <tr>
          <th>№</th>
          <th>Дата</th>
          <th>Тип</th>
          <th>Тема</th>
          <th>Оборудование</th>
          <th>Заявитель</th>
          <th>Приоритет</th>
          <th>Статус</th>
          <th>Действия</th>
        </tr>
      </thead>
      <tbody>
        {requests.length === 0 ? (
          <tr>
            <td colSpan={9} align="center">Заявок пока нет</td>
          </tr>
        ) : (
          requests.map((request) => (
            <tr key={request.id}>
              <td>{request.id}</td>
              <td>{(request.createdAt || '').slice(0, 16)}</td>
              <td>{request.type}</td>
              <td><b>{request.title}</b></td>
              <td>{request.invNumber ? `${request.invNumber} (${request.equipmentName})` : '—'}</td>
              <td>{request.applicant}</td>
              <td><span className="badge">{request.priority}</span></td>
              <td><StatusBadge status={request.status} /></td>
              <td>
                <StatusActions
                  actions={getActions(request)}
                  onChange={(status) => onStatusChange(request.id, status as RequestStatus)}
                />
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
};
