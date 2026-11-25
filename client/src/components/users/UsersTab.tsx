import React from 'react';
import { User, UserRole } from '../../types';
import { useUsers } from '../../hooks/useUsers';
import { useTableControls } from '../../hooks/useTableControls';
import { useAlert } from '../../context/AlertContext';
import { useConfirm } from '../../context/ConfirmContext';
import { UsersTable } from './UsersTable';
import { ResetDatabaseCard } from './ResetDatabaseCard';
import { ListToolbar } from '../ui/ListToolbar';
import { Pagination } from '../ui/Pagination';
import { Loading } from '../ui/Loading';
import { ErrorView } from '../layout/ErrorView';
import { ROLE_OPTIONS, USER_ROLE_RANK } from '../../config/lists';
import { roleLabel } from '../../utils/roles';

export const UsersTab: React.FC<{ currentUser: User }> = ({ currentUser }) => {
  const { showAlert, showApiError } = useAlert();
  const { confirm } = useConfirm();
  const { users, loading, error, reload, updateRole, deleteUser, resetDb } = useUsers();

  const controls = useTableControls(users, {
    search: (item) => [item.login, item.fullName, roleLabel(item.role)],
    filters: [
      {
        key: 'role',
        label: 'Роль',
        options: ROLE_OPTIONS,
        getValue: (item) => item.role,
      },
    ],
    sorters: {
      id: (item) => item.id,
      login: (item) => item.login,
      fullName: (item) => item.fullName || '',
      role: (item) => USER_ROLE_RANK[item.role] ?? 0,
    },
  });

  const handleRole = async (id: number, role: UserRole) => {
    try {
      await updateRole(id, role);
      showAlert('Роль пользователя изменена', 'success');
      await reload();
    } catch (error) {
      showApiError(error);
    }
  };

  const handleDelete = async (id: number) => {
    const target = users.find((user) => user.id === id);
    const confirmed = await confirm({
      title: 'Удалить пользователя?',
      message: target
        ? `Учётная запись «${target.login}» будет удалена без возможности восстановления.`
        : 'Учётная запись будет удалена без возможности восстановления.',
      confirmLabel: 'Удалить',
      tone: 'danger',
    });
    if (!confirmed) return;

    try {
      await deleteUser(id);
      showAlert('Пользователь удалён', 'success');
      await reload();
    } catch (error) {
      showApiError(error);
    }
  };

  const handleResetDb = async () => {
    try {
      const result = await resetDb();
      showAlert(result.message, 'success');
      window.setTimeout(() => window.location.reload(), 1200);
    } catch (error) {
      showApiError(error);
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="tab-container">
        <h2>Пользователи</h2>
        <Loading label="Загрузка пользователей…" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="tab-container">
        <h2>Пользователи</h2>
        <ErrorView error={error} onRetry={reload} />
      </div>
    );
  }

  return (
    <div className="tab-container">
      <h2>Пользователи</h2>

      <ListToolbar
        search={controls.search}
        onSearchChange={controls.setSearch}
        placeholder="Найти пользователя по логину или ФИО…"
        hasActiveFilters={controls.hasActiveFilters}
        onReset={controls.resetFilters}
        filters={[
          {
            key: 'role',
            label: 'Роль',
            value: controls.filterValues.role || '',
            options: ROLE_OPTIONS,
            onChange: (value) => controls.setFilter('role', value),
          },
        ]}
      />

      <UsersTable
        users={controls.items}
        currentUser={currentUser}
        onRoleChange={handleRole}
        onDelete={handleDelete}
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

      {currentUser.role === 'root' && <ResetDatabaseCard onReset={handleResetDb} />}
    </div>
  );
};
