import { useCallback, useEffect, useState } from 'react';
import { userApi } from '../api';
import { User } from '../types';

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await userApi.getUsers();
      setUsers(list);
    } catch (loadError) {
      setError(loadError);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  return {
    users,
    loading,
    error,
    reload,
    updateRole: userApi.updateRole,
    deleteUser: userApi.deleteUser,
    resetDb: userApi.resetDb,
  };
}
