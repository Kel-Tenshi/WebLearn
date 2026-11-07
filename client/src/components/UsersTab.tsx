import React, { useState, useEffect } from 'react';
import { userApi } from '../utils/api';
import { User, UserRole } from '../utils/types';
import { useAlert } from '../context/AlertContext';

export const UsersTab: React.FC<{ currentUser: User }> = ({ currentUser }) => {
  const { showAlert, showApiError } = useAlert();
  const [users, setUsers] = useState<User[]>([]);
  const [resetting, setResetting] = useState(false);

  const loadUsers = async () => {
    try {
      const list = await userApi.getUsers();
      setUsers(list);
    } catch (err: any) { showApiError(err); }
  };

  useEffect(() => { loadUsers(); }, []);

  const handleRole = async (id: number, role: UserRole) => {
    try {
      await userApi.updateRole(id, role);
      showAlert('Роль пользователя изменена', 'success');
      loadUsers();
    } catch (err: any) { showApiError(err); }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Удалить пользователя?')) return;
    try {
      await userApi.deleteUser(id);
      showAlert('Пользователь удалён', 'success');
      loadUsers();
    } catch (err: any) { showApiError(err); }
  };

  const handleResetDb = async () => {
    const confirmed = window.confirm(
      'Сбросить базу данных?\n\n' +
      'Все оборудование, заявки, операции, справочники и пользователи будут удалены, ' +
      'после чего база заново заполнится демонстрационными данными.\n\n' +
      'Текущая сессия завершится — потребуется войти заново.'
    );
    if (!confirmed) return;

    setResetting(true);
    try {
      const res = await userApi.resetDb();
      showAlert(res.message, 'success');
      window.setTimeout(() => window.location.reload(), 1200);
    } catch (err: any) {
      showApiError(err);
      setResetting(false);
    }
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

      <div className="card danger-zone">
        <h3>Сброс базы данных</h3>
        <p className="muted">
          Удаляет все текущие данные и заново создаёт стандартный демонстрационный набор:
          оборудование, заявки, операции и учётные записи.
        </p>
        <button className="danger" onClick={handleResetDb} disabled={resetting}>
          {resetting ? 'Сброс...' : 'Сбросить базу данных'}
        </button>
      </div>
    </div>
  );
};