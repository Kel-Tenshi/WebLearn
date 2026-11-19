import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { LoginView } from './LoginView';

jest.mock('../../api', () => ({
  authApi: {
    login: jest.fn(),
  },
}));

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { authApi } = require('../../api');

function renderLogin(onSuccess = jest.fn()) {
  const utils = render(
    <MemoryRouter initialEntries={['/login']}>
      <Routes>
        <Route path="/login" element={<LoginView onSuccess={onSuccess} />} />
        <Route path="/" element={<div>Главная страница</div>} />
      </Routes>
    </MemoryRouter>
  );

  const inputs = utils.container.querySelectorAll('input');
  return {
    ...utils,
    onSuccess,
    loginInput: inputs[0] as HTMLInputElement,
    passwordInput: inputs[1] as HTMLInputElement,
  };
}

describe('LoginView', () => {
  beforeEach(() => {
    authApi.login.mockReset();
  });

  test('подсказка с тестовыми аккаунтами свёрнута по умолчанию', async () => {
    renderLogin();

    const summary = screen.getByText('Тестовые аккаунты');
    const details = summary.closest('details') as HTMLDetailsElement;

    // jsdom не скрывает содержимое закрытого details, поэтому проверяем флаг open
    expect(details.open).toBe(false);
    expect(screen.getByText(/root123/)).toBeInTheDocument();

    await userEvent.click(summary);

    expect(details.open).toBe(true);
    expect(screen.getByText(/admin123/)).toBeInTheDocument();
  });

  test('валидация: пустые поля не отправляются', async () => {
    renderLogin();

    await userEvent.click(screen.getByRole('button', { name: 'Войти' }));

    expect(await screen.findByText('Введите логин')).toBeInTheDocument();
    expect(screen.getByText('Введите пароль')).toBeInTheDocument();
    expect(authApi.login).not.toHaveBeenCalled();
  });

  test('валидация: короткие логин и пароль', async () => {
    const { loginInput, passwordInput } = renderLogin();

    await userEvent.type(loginInput, 'ab');
    await userEvent.type(passwordInput, '123');
    await userEvent.click(screen.getByRole('button', { name: 'Войти' }));

    expect(await screen.findByText(/минимум 3 символа/)).toBeInTheDocument();
    expect(screen.getByText(/минимум 6 символов/)).toBeInTheDocument();
    expect(authApi.login).not.toHaveBeenCalled();
  });

  test('успешный вход: вызывает API и переходит на главную', async () => {
    authApi.login.mockResolvedValue({
      ok: true,
      user: { id: 1, login: 'user', role: 'employee' },
    });

    const { loginInput, passwordInput, onSuccess } = renderLogin();

    await userEvent.type(loginInput, '  user  ');
    await userEvent.type(passwordInput, 'user123');
    await userEvent.click(screen.getByRole('button', { name: 'Войти' }));

    await waitFor(() => {
      expect(authApi.login).toHaveBeenCalledWith('user', 'user123');
      expect(onSuccess).toHaveBeenCalledWith({
        id: 1,
        login: 'user',
        role: 'employee',
      });
    });

    expect(await screen.findByText('Главная страница')).toBeInTheDocument();
  });

  test('ошибка входа показывается в баннере', async () => {
    authApi.login.mockRejectedValue(new Error('Неверный логин или пароль'));

    const { loginInput, passwordInput } = renderLogin();

    await userEvent.type(loginInput, 'user');
    await userEvent.type(passwordInput, 'wrong123');
    await userEvent.click(screen.getByRole('button', { name: 'Войти' }));

    expect(await screen.findByText('Неверный логин или пароль')).toBeInTheDocument();
  });
});
