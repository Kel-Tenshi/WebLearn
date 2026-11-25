import React from 'react';
import { RequestItem, RequestStatus } from '../../types';
import { StatusBadge } from '../ui/StatusBadge';
import { StatusActions } from '../ui/StatusActions';
import { SortHeader } from '../ui/SortHeader';
import { getNextStatuses, getStatusActions } from '../../config/statusMachine';
import type { StatusAction } from '../../config/statusMachine';
import { displayPerson } from '../../utils/people';
import type { SortDir } from '../../hooks/useTableControls';

interface Props {
  requests: RequestItem[];
  canManage: boolean;
  currentUserLogin: string;
  onStatusChange: (id: number, status: RequestStatus) => void;
  sortKey?: string | null;
  sortDir?: SortDir;
  onSort?: (key: string) => void;
}

export const RequestsTable: React.FC<Props> = ({
  requests,
  canManage,
  currentUserLogin,
  onStatusChange,
  sortKey,
  sortDir,
  onSort,
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
    <div className="table-scroll">
      <table className="data-table">
        <thead>
          <tr>
            <SortHeader label="№" sortKey="id" activeKey={sortKey} dir={sortDir} onSort={onSort} />
            <SortHeader label="Дата" sortKey="createdAt" activeKey={sortKey} dir={sortDir} onSort={onSort} />
            <SortHeader label="Тип" sortKey="type" activeKey={sortKey} dir={sortDir} onSort={onSort} />
            <SortHeader label="Тема" sortKey="title" activeKey={sortKey} dir={sortDir} onSort={onSort} />
            <SortHeader label="Оборудование" sortKey="equipment" activeKey={sortKey} dir={sortDir} onSort={onSort} />
            <SortHeader label="Заявитель" sortKey="applicant" activeKey={sortKey} dir={sortDir} onSort={onSort} />
            <SortHeader label="Приоритет" sortKey="priority" activeKey={sortKey} dir={sortDir} onSort={onSort} />
            <SortHeader label="Статус" sortKey="status" activeKey={sortKey} dir={sortDir} onSort={onSort} />
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          {requests.length === 0 ? (
            <tr>
              <td colSpan={9} align="center">Заявок не найдено</td>
            </tr>
          ) : (
            requests.map((request) => (
              <tr key={request.id}>
                <td className="cell-nowrap">{request.id}</td>
                <td className="cell-nowrap">{(request.createdAt || '').slice(0, 16)}</td>
                <td>{request.type}</td>
                <td><b>{request.title}</b></td>
                <td>{request.invNumber ? `${request.invNumber} (${request.equipmentName})` : '—'}</td>
                <td>{displayPerson(request.applicantName, request.applicant)}</td>
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
    </div>
  );
};
