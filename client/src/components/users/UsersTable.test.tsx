import React from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UsersTable } from './UsersTable';
import { User } from '../../types';

const users: User[] = [
  { id: 1, login: 'root', role: 'root', fullName: 'Владелец системы' },
  { id: 2, login: 'admin', role: 'admin', fullName: 'Администратор Системы' },
  { id: 3, login: 'manager', role: 'manager', fullName: 'Иванов Иван Иванович' },
  { id: 4, login: 'user', role: 'employee', fullName: 'Петров Алексей Сергеевич' },
];

describe('UsersTable', () => {
  test('root видит всех, защищённый аккаунт нельзя изменить или удалить', () => {
    render(
      <UsersTable
        users={users}
        currentUser={users[0]}
        onRoleChange={jest.fn()}
        onDelete={jest.fn()}
      />
    );

    expect(screen.getByText(/Владелец системы \(вы\) · защищён/)).toBeInTheDocument();

    const adminRow = screen.getByText('admin').closest('tr') as HTMLElement;
    expect(within(adminRow).getByRole('combobox')).toBeInTheDocument();
    expect(within(adminRow).getByRole('button', { name: 'Удалить' })).toBeInTheDocument();

    const options = screen.getAllByRole('option').map((option) => option.textContent);
    expect(options).toContain('Администратор');
  });

  test('admin не может назначать администраторов и трогать admin/root', () => {
    render(
      <UsersTable
        users={users}
        currentUser={users[1]}
        onRoleChange={jest.fn()}
        onDelete={jest.fn()}
      />
    );

    expect(screen.getByText(/Администратор \(вы\)/)).toBeInTheDocument();
    expect(screen.queryByRole('option', { name: 'Администратор' })).not.toBeInTheDocument();

    const adminRow = screen.getByText('admin').closest('tr') as HTMLElement;
    expect(within(adminRow).queryByRole('combobox')).not.toBeInTheDocument();
    expect(within(adminRow).queryByRole('button')).not.toBeInTheDocument();

    // Удалять можно только сотрудников и менеджеров
    expect(screen.getAllByRole('button', { name: 'Удалить' })).toHaveLength(2);
  });

  test('смена роли передаёт id и новую роль', async () => {
    const onRoleChange = jest.fn();
    render(
      <UsersTable
        users={users}
        currentUser={users[1]}
        onRoleChange={onRoleChange}
        onDelete={jest.fn()}
      />
    );

    const selects = screen.getAllByRole('combobox');
    await userEvent.selectOptions(selects[1], 'manager');

    expect(onRoleChange).toHaveBeenCalledWith(4, 'manager');
  });

  test('удаление передаёт id', async () => {
    const onDelete = jest.fn();
    render(
      <UsersTable
        users={users}
        currentUser={users[0]}
        onRoleChange={jest.fn()}
        onDelete={onDelete}
      />
    );

    const managerRow = screen.getByText('manager').closest('tr') as HTMLElement;
    await userEvent.click(within(managerRow).getByRole('button', { name: 'Удалить' }));

    expect(onDelete).toHaveBeenCalledWith(3);
  });
});
