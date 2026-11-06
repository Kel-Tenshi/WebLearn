import React, { useState, useEffect } from 'react';
import { userApi } from '../utils/api';
import { User, UserRole } from '../utils/types';

export const UsersTab: React.FC<{ currentUser: User }> = ({ currentUser }) => {
  const [users, setUsers] = useState<User[]>([]);

  const loadUsers = async () => {
    try {
      const list = await userApi.getUsers();
      setUsers(list);
    } catch (err: any) { alert(err.message); }
  };

  useEffect(() => { loadUsers(); }, []);

  const handleRole = async (id: number, role: UserRole) => {
    try {
      await userApi.updateRole(id, role);
      loadUsers();
    } catch (err: any) { alert(err.message); }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Удалить пользователя?')) return;
    try {
      await userApi.deleteUser(id);
      loadUsers();
    } catch (err: any) { alert(err.message); }
  };

  return (
    <div className="tab-container">
      <h2>Управление пользователями (Администратор)</h2>
      <table className="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Логин</th>
            <th>ФИО</th>
            <th>Роль</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td>{u.id}</td>
              <td><b>{u.login}</b></td>
              <td>{u.fullName || '—'}</td>
              <td>
                {u.id === currentUser.id ? (
                  <span>{u.role} (вы)</span>
                ) : (
                  <select value={u.role} onChange={(e) => handleRole(u.id, e.target.value as UserRole)}>
                    <option value="employee">employee (сотрудник)</option>
                    <option value="manager">manager (руководитель)</option>
                    <option value="admin">admin (администратор)</option>
                  </select>
                )}
              </td>
              <td>
                {u.id !== currentUser.id && (
                  <button className="danger" onClick={() => handleDelete(u.id)}>Удалить</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};