import React from 'react';
import { User, UserRole } from '../../types';
import { useUsers } from '../../hooks/useUsers';
import { useAlert } from '../../context/AlertContext';
import { UsersTable } from './UsersTable';
import { ResetDatabaseCard } from './ResetDatabaseCard';

export const UsersTab: React.FC<{ currentUser: User }> = ({ currentUser }) => {
  const { showAlert, showApiError } = useAlert();
  const { users, reload, updateRole, deleteUser, resetDb } = useUsers();

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
    if (!window.confirm('Удалить пользователя?')) return;

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

  return (
    <div className="tab-container">
      <h2>Управление пользователями (Администратор)</h2>

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
