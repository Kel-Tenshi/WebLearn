import React from 'react';
import { User, UserRole } from '../../types';
import { useUsers } from '../../hooks/useUsers';
import { useAlert } from '../../context/AlertContext';
import { useConfirm } from '../../context/ConfirmContext';
import { UsersTable } from './UsersTable';
import { ResetDatabaseCard } from './ResetDatabaseCard';
import { Loading } from '../ui/Loading';
import { ErrorView } from '../layout/ErrorView';

export const UsersTab: React.FC<{ currentUser: User }> = ({ currentUser }) => {
  const { showAlert, showApiError } = useAlert();
  const { confirm } = useConfirm();
  const { users, loading, error, reload, updateRole, deleteUser, resetDb } = useUsers();

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

      <UsersTable
        users={users}
        currentUser={currentUser}
        onRoleChange={handleRole}
        onDelete={handleDelete}
      />

      <ResetDatabaseCard onReset={handleResetDb} />
    </div>
  );
};
