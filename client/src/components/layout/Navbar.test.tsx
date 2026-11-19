import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { Navbar } from './Navbar';
import { User } from '../../types';

const rootUser: User = {
  id: 1,
  login: 'root',
  role: 'root',
  fullName: 'Иван Владелец',
};

const employeeUser: User = {
  id: 4,
  login: 'user',
  role: 'employee',
  fullName: 'Петров Алексей Сергеевич',
};

function renderNavbar(user: User) {
  const onLogout = jest.fn();
  const utils = render(
    <MemoryRouter initialEntries={['/']}>
      <Navbar user={user} onLogout={onLogout} />
    </MemoryRouter>
  );

  return { ...utils, onLogout };
}

describe('Navbar', () => {
  test('показывает ФИО и роль вместо логина', () => {
    renderNavbar(rootUser);

    const profile = screen.getByRole('button', { name: 'Открыть профиль' });
    expect(profile).toHaveTextContent('Иван Владелец');
    expect(profile).toHaveTextContent(/\(владелец системы\)/);
    expect(profile).not.toHaveTextContent(/\(root\)/);
  });

  test('раздел «Пользователи» виден admin и root, но не сотруднику', () => {
    const { unmount } = renderNavbar(rootUser);
    expect(screen.getByRole('button', { name: 'Пользователи' })).toBeInTheDocument();
    unmount();

    renderNavbar(employeeUser);
    expect(screen.queryByRole('button', { name: 'Пользователи' })).not.toBeInTheDocument();
  });

  test('выход вызывает обработчик', async () => {
    const { onLogout } = renderNavbar(employeeUser);

    await userEvent.click(screen.getByRole('button', { name: /Выйти/ }));
    expect(onLogout).toHaveBeenCalledTimes(1);
  });

  test('активный раздел подсвечен', () => {
    render(
      <MemoryRouter initialEntries={['/equipment']}>
        <Navbar user={employeeUser} onLogout={jest.fn()} />
      </MemoryRouter>
    );

    expect(screen.getByRole('button', { name: 'Оборудование' })).toHaveClass('active');
    expect(screen.getByRole('button', { name: 'Главная' })).not.toHaveClass('active');
  });
});
