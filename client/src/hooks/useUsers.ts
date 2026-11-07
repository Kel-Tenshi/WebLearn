import { useCallback, useEffect, useState } from 'react';
import { userApi } from '../api';
import { User } from '../types';
import { useAlert } from '../context/AlertContext';

export function useUsers() {
  const { showApiError } = useAlert();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    try {
      const list = await userApi.getUsers();
      setUsers(list);
    } catch (error) {
      showApiError(error);
    } finally {
      setLoading(false);
    }
  }, [showApiError]);

  useEffect(() => {
    reload();
  }, [reload]);

  return {
    users,
    loading,
    reload,
    updateRole: userApi.updateRole,
    deleteUser: userApi.deleteUser,
    resetDb: userApi.resetDb,
  };
}
