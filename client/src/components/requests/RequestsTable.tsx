import React from 'react';
import { RequestItem, RequestStatus } from '../../types';

interface Props {
  requests: RequestItem[];
  canManage: boolean;
  onStatusChange: (id: number, status: RequestStatus) => void;
}

const STATUSES: RequestStatus[] = ['На согласовании', 'Одобрено', 'Отклонено', 'Выполнено'];

export const RequestsTable: React.FC<Props> = ({ requests, canManage, onStatusChange }) => {
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
        </tr>
      </thead>
      <tbody>
        {requests.length === 0 ? (
          <tr>
            <td colSpan={8} align="center">Заявок пока нет</td>
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
              <td>
                {canManage ? (
                  <select
                    value={request.status}
                    onChange={(e) => onStatusChange(request.id, e.target.value as RequestStatus)}
                  >
                    {STATUSES.map((status) => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                ) : (
                  <span className="badge">{request.status}</span>
                )}
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
};
