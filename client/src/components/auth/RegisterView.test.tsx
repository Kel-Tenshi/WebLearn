import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { RegisterView } from './RegisterView';

jest.mock('../../api', () => ({
  authApi: {
    register: jest.fn(),
    login: jest.fn(),
  },
}));

jest.mock('../../hooks/usePasswordStrength', () => ({
  usePasswordStrength: jest.fn(),
}));

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { usePasswordStrength } = require('../../hooks/usePasswordStrength');

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { authApi } = require('../../api');

function renderRegister(onSuccess = jest.fn()) {
  const utils = render(
    <MemoryRouter initialEntries={['/register']}>
      <Routes>
        <Route path="/register" element={<RegisterView onSuccess={onSuccess} />} />
        <Route path="/" element={<div>Главная страница</div>} />
      </Routes>
    </MemoryRouter>
  );

  return {
    ...utils,
    onSuccess,
    getInputs: () => utils.container.querySelectorAll('input'),
  };
}

describe('RegisterView', () => {
  beforeEach(() => {
    authApi.register.mockReset();
    authApi.login.mockReset();
    usePasswordStrength.mockReturnValue({ strength: null, pending: false });
  });

  test('валидация: пустая форма', async () => {
    renderRegister();

    await userEvent.click(screen.getByRole('button', { name: 'Зарегистрироваться' }));

    expect(await screen.findByText('Введите логин')).toBeInTheDocument();
    expect(screen.getByText('Введите пароль')).toBeInTheDocument();
    expect(authApi.register).not.toHaveBeenCalled();
  });

  test('валидация: короткий пароль и несовпадение подтверждения', async () => {
    const { getInputs } = renderRegister();

    let inputs = getInputs();
    await userEvent.type(inputs[0], 'new_user');
    await userEvent.type(inputs[1], '123');

    await userEvent.click(screen.getByRole('button', { name: 'Зарегистрироваться' }));
    expect(await screen.findByText(/минимум 6 символов/)).toBeInTheDocument();

    // Подтверждение появляется после ввода пароля
    inputs = getInputs();
    expect(inputs.length).toBe(4);

    await userEvent.clear(inputs[1]);
    await userEvent.type(inputs[1], 'secret123');
    await userEvent.type(getInputs()[2], 'secret124');

    await userEvent.click(screen.getByRole('button', { name: 'Зарегистрироваться' }));
    expect(await screen.findByText('Пароли не совпадают')).toBeInTheDocument();
    expect(authApi.register).not.toHaveBeenCalled();
  });

  test('валидация: слишком длинное ФИО', async () => {
    const { getInputs } = renderRegister();
    let inputs = getInputs();

    await userEvent.type(inputs[0], 'long_name');
    await userEvent.type(inputs[1], 'secret123');
    await userEvent.type(getInputs()[2], 'secret123');

    inputs = getInputs();
    fireEvent.change(inputs[3], { target: { value: 'Ф'.repeat(121) } });

    await userEvent.click(screen.getByRole('button', { name: 'Зарегистрироваться' }));
    expect(await screen.findByText(/не должно превышать 120/)).toBeInTheDocument();
    expect(authApi.register).not.toHaveBeenCalled();
  });

  test('успешная регистрация: регистрирует, входит и переходит на главную', async () => {
    authApi.register.mockResolvedValue({
      id: 10,
      login: 'new_user',
      role: 'employee',
      fullName: 'Новый Пользователь',
    });
    authApi.login.mockResolvedValue({
      ok: true,
      user: { id: 10, login: 'new_user', role: 'employee', fullName: 'Новый Пользователь' },
    });

    const { getInputs, onSuccess } = renderRegister();
    const inputs = getInputs();

    await userEvent.type(inputs[0], '  new_user  ');
    await userEvent.type(inputs[1], 'secret123');
    await userEvent.type(getInputs()[2], 'secret123');
    await userEvent.type(getInputs()[3], '  Новый Пользователь  ');

    await userEvent.click(screen.getByRole('button', { name: 'Зарегистрироваться' }));

    await waitFor(() => {
      expect(authApi.register).toHaveBeenCalledWith(
        'new_user',
        'secret123',
        'Новый Пользователь'
      );
      expect(authApi.login).toHaveBeenCalledWith('new_user', 'secret123');
      expect(onSuccess).toHaveBeenCalled();
    });

    expect(await screen.findByText('Главная страница')).toBeInTheDocument();
  });

  test('ошибка регистрации показывается в баннере', async () => {
    authApi.register.mockRejectedValue(new Error('Такой пользователь уже есть'));

    const { getInputs } = renderRegister();
    const inputs = getInputs();

    await userEvent.type(inputs[0], 'admin');
    await userEvent.type(inputs[1], 'secret123');
    await userEvent.type(getInputs()[2], 'secret123');

    await userEvent.click(screen.getByRole('button', { name: 'Зарегистрироваться' }));

    expect(await screen.findByText('Такой пользователь уже есть')).toBeInTheDocument();
    expect(authApi.login).not.toHaveBeenCalled();
  });
});
