import React from 'react';
import { User, UserRole } from '../../types';
import { roleLabel } from '../../utils/roles';

interface Props {
  users: User[];
  currentUser: User;
  onRoleChange: (id: number, role: UserRole) => void;
  onDelete: (id: number) => void;
}

// Кем может управлять текущий пользователь:
// root — всеми, кроме себя; admin — сотрудниками и менеджерами.
function canManageTarget(actor: User, target: User): boolean {
  if (actor.id === target.id) return false;
  if (target.role === 'root') return false;
  if (target.role === 'admin') return actor.role === 'root';
  return true;
}

function assignableRoles(actor: User): UserRole[] {
  return actor.role === 'root'
    ? ['employee', 'manager', 'admin']
    : ['employee', 'manager'];
}

export const UsersTable: React.FC<Props> = ({
  users,
  currentUser,
  onRoleChange,
  onDelete,
}) => {
  const options = assignableRoles(currentUser);

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
        ) : users.map((user) => {
          const editable = canManageTarget(currentUser, user);
          const isSelf = user.id === currentUser.id;

          return (
            <tr key={user.id}>
              <td className="cell-nowrap">{user.id}</td>
              <td className="cell-nowrap"><b>{user.login}</b></td>
              <td>{user.fullName || '—'}</td>
              <td>
                {editable ? (
                  <select
                    value={user.role}
                    onChange={(e) => onRoleChange(user.id, e.target.value as UserRole)}
                  >
                    {options.map((role) => (
                      <option key={role} value={role}>
                        {roleLabel(role)}
                      </option>
                    ))}
                  </select>
                ) : (
                  <span title={user.role === 'root' ? 'Аккаунт защищён от изменений' : undefined}>
                    {roleLabel(user.role)}
                    {isSelf && ' (вы)'}
                    {user.role === 'root' && ' · защищён'}
                  </span>
                )}
              </td>
              <td>
                {editable && (
                  <button className="danger" onClick={() => onDelete(user.id)}>
                    Удалить
                  </button>
                )}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};
