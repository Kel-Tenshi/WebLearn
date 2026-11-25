import React from 'react';
import { RequestItem, RequestStatus, User } from '../../types';
import { useRequests } from '../../hooks/useRequests';
import { useTableControls } from '../../hooks/useTableControls';
import { useAlert } from '../../context/AlertContext';
import { RequestForm } from './RequestForm';
import { RequestsTable } from './RequestsTable';
import { ListToolbar } from '../ui/ListToolbar';
import { Pagination } from '../ui/Pagination';
import { Loading } from '../ui/Loading';
import { ErrorView } from '../layout/ErrorView';
import { isManagerRole } from '../../utils/roles';
import { displayPerson } from '../../utils/people';
import {
  PRIORITY_RANK,
  REQUEST_PRIORITIES,
  REQUEST_STATUSES,
  REQUEST_STATUS_RANK,
  REQUEST_TYPES,
  toOptions,
} from '../../config/lists';

export const RequestsTab: React.FC<{ user: User }> = ({ user }) => {
  const { showAlert, showApiError } = useAlert();
  const { requests, equipment, loading, error, reload, create, updateStatus } = useRequests();

  const canManage = isManagerRole(user.role);

  const typeOptions = toOptions(REQUEST_TYPES);
  const priorityOptions = toOptions(REQUEST_PRIORITIES);
  const statusOptions = toOptions(REQUEST_STATUSES);

  const controls = useTableControls(requests, {
    search: (item) => [
      item.id,
      item.title,
      item.type,
      item.applicant,
      item.applicantName,
      item.invNumber,
      item.equipmentName,
      item.priority,
      item.status,
      item.createdAt,
    ],
    filters: [
      {
        key: 'type',
        label: 'Тип',
        options: typeOptions,
        getValue: (item) => item.type,
      },
      {
        key: 'priority',
        label: 'Приоритет',
        options: priorityOptions,
        getValue: (item) => item.priority,
      },
      {
        key: 'status',
        label: 'Статус',
        options: statusOptions,
        getValue: (item) => item.status,
      },
    ],
    sorters: {
      id: (item) => item.id,
      createdAt: (item) => item.createdAt,
      type: (item) => item.type,
      title: (item) => item.title,
      equipment: (item) => item.invNumber || '',
      applicant: (item) => displayPerson(item.applicantName, item.applicant),
      priority: (item) => PRIORITY_RANK[item.priority] ?? 0,
      status: (item) => REQUEST_STATUS_RANK[item.status] ?? 0,
    },
  });

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

  if (loading) {
    return (
      <div className="tab-container">
        <h2>Заявки</h2>
        <Loading label="Загрузка заявок…" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="tab-container">
        <h2>Заявки</h2>
        <ErrorView error={error} onRetry={reload} />
      </div>
    );
  }

  return (
    <div className="tab-container">
      <h2>Заявки</h2>

      <RequestForm equipment={equipment} canManage={canManage} onSubmit={handleCreate} />

      <ListToolbar
        search={controls.search}
        onSearchChange={controls.setSearch}
        placeholder="Найти заявку по теме, заявителю, оборудованию…"
        hasActiveFilters={controls.hasActiveFilters}
        onReset={controls.resetFilters}
        filters={[
          {
            key: 'type',
            label: 'Тип',
            value: controls.filterValues.type || '',
            options: typeOptions,
            onChange: (value) => controls.setFilter('type', value),
          },
          {
            key: 'priority',
            label: 'Приоритет',
            value: controls.filterValues.priority || '',
            options: priorityOptions,
            onChange: (value) => controls.setFilter('priority', value),
          },
          {
            key: 'status',
            label: 'Статус',
            value: controls.filterValues.status || '',
            options: statusOptions,
            onChange: (value) => controls.setFilter('status', value),
          },
        ]}
      />

      <RequestsTable
        requests={controls.items}
        canManage={canManage}
        currentUserLogin={user.login}
        onStatusChange={handleStatusChange}
        sortKey={controls.sortKey}
        sortDir={controls.sortDir}
        onSort={controls.toggleSort}
      />

      <Pagination
        page={controls.page}
        pageCount={controls.pageCount}
        pageSize={controls.pageSize}
        total={controls.total}
        filteredTotal={controls.filteredTotal}
        from={controls.from}
        to={controls.to}
        onPageChange={controls.setPage}
        onPageSizeChange={controls.setPageSize}
      />
    </div>
  );
};
