import React from 'react';
import { User, UserRole } from '../../types';

interface Props {
  users: User[];
  currentUser: User;
  onRoleChange: (id: number, role: UserRole) => void;
  onDelete: (id: number) => void;
}

export const UsersTable: React.FC<Props> = ({
  users,
  currentUser,
  onRoleChange,
  onDelete,
}) => {
  return (
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
        {users.length === 0 ? (
          <tr>
            <td colSpan={5} align="center">Пользователей пока нет</td>
          </tr>
        ) : users.map((user) => (
          <tr key={user.id}>
            <td>{user.id}</td>
            <td><b>{user.login}</b></td>
            <td>{user.fullName || '—'}</td>
            <td>
              {user.id === currentUser.id ? (
                <span>{user.role} (вы)</span>
              ) : (
                <select
                  value={user.role}
                  onChange={(e) => onRoleChange(user.id, e.target.value as UserRole)}
                >
                  <option value="employee">employee (сотрудник)</option>
                  <option value="manager">manager (руководитель)</option>
                  <option value="admin">admin (администратор)</option>
                </select>
              )}
            </td>
            <td>
              {user.id !== currentUser.id && (
                <button className="danger" onClick={() => onDelete(user.id)}>
                  Удалить
                </button>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
