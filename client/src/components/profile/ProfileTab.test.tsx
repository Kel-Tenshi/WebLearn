import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProfileTab } from './ProfileTab';

jest.mock('../../api', () => ({
  userApi: {
    updateProfile: jest.fn(),
    changePassword: jest.fn(),
  },
  directoryApi: {
    getDepartments: jest.fn(),
  },
}));

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { userApi, directoryApi } = require('../../api');

const user = {
  id: 5,
  login: 'qa_visual',
  role: 'employee' as const,
  fullName: 'Старое Имя',
  departmentId: 0,
};

async function renderProfile(onUserUpdated = jest.fn()) {
  render(<ProfileTab user={user} onUserUpdated={onUserUpdated} />);

  // Ждём загрузку подразделений, чтобы состояние React обновилось внутри act
  await screen.findByRole('option', { name: /Цех №1/ });

  return { onUserUpdated };
}

describe('ProfileTab', () => {
  beforeEach(() => {
    userApi.updateProfile.mockReset();
    userApi.changePassword.mockReset();
    directoryApi.getDepartments.mockReset();
    directoryApi.getDepartments.mockResolvedValue([
      { id: 1, code: 'DEP-1', name: 'Цех №1' },
    ]);
  });

  test('показывает логин и роль', async () => {
    await renderProfile();

    expect(screen.getByText('qa_visual')).toBeInTheDocument();
    expect(screen.getByText('Сотрудник')).toBeInTheDocument();
  });

  test('сохраняет профиль и обновляет пользователя в приложении', async () => {
    const updated = { ...user, fullName: 'Новое Имя', departmentId: 1 };
    userApi.updateProfile.mockResolvedValue(updated);

    const { onUserUpdated } = await renderProfile();

    const nameInput = screen.getByPlaceholderText('Иванов Иван Иванович');
    await userEvent.clear(nameInput);
    await userEvent.type(nameInput, 'Новое Имя');
    await userEvent.selectOptions(screen.getByRole('combobox'), '1');
    await userEvent.click(screen.getByRole('button', { name: 'Сохранить профиль' }));

    await waitFor(() => {
      expect(userApi.updateProfile).toHaveBeenCalledWith({
        fullName: 'Новое Имя',
        departmentId: 1,
      });
      expect(onUserUpdated).toHaveBeenCalledWith(updated);
    });
  });

  test('валидация: слишком длинное ФИО', async () => {
    await renderProfile();

    const nameInput = screen.getByPlaceholderText('Иванов Иван Иванович');
    await userEvent.clear(nameInput);
    await userEvent.type(nameInput, 'Ф'.repeat(121));
    await userEvent.click(screen.getByRole('button', { name: 'Сохранить профиль' }));

    expect(await screen.findByText(/не должно превышать 120/)).toBeInTheDocument();
    expect(userApi.updateProfile).not.toHaveBeenCalled();
  });

  test('валидация пароля: несовпадение', async () => {
    await renderProfile();

    await userEvent.type(screen.getByLabelText('Текущий пароль'), 'secret123');
    await userEvent.type(screen.getByLabelText('Новый пароль'), 'newsecret123');
    await userEvent.type(screen.getByLabelText('Повторите новый пароль'), 'other123');
    await userEvent.click(screen.getByRole('button', { name: 'Сменить пароль' }));

    expect(await screen.findByText('Пароли не совпадают')).toBeInTheDocument();
    expect(userApi.changePassword).not.toHaveBeenCalled();
  });

  test('успешная смена пароля', async () => {
    userApi.changePassword.mockResolvedValue({ ok: true, message: 'Пароль изменён' });

    await renderProfile();

    await userEvent.type(screen.getByLabelText('Текущий пароль'), 'secret123');
    await userEvent.type(screen.getByLabelText('Новый пароль'), 'newsecret123');
    await userEvent.type(screen.getByLabelText('Повторите новый пароль'), 'newsecret123');
    await userEvent.click(screen.getByRole('button', { name: 'Сменить пароль' }));

    await waitFor(() => {
      expect(userApi.changePassword).toHaveBeenCalledWith({
        currentPassword: 'secret123',
        newPassword: 'newsecret123',
      });
    });
  });
});
