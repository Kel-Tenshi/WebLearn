import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';
import { ApiError, userApi } from './api';

jest.mock('./api', () => {
  const actual = jest.requireActual('./api');

  return {
    ...actual,
    userApi: {
      ...actual.userApi,
      getMe: jest.fn(),
    },
  };
});

describe('App', () => {
  test('показывает экран входа для неавторизованного пользователя', async () => {
    (userApi.getMe as jest.Mock).mockRejectedValue(new ApiError(401, 'Не авторизован'));

    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByText(/Загрузка сессии/i)).toBeInTheDocument();
    expect(await screen.findByText('Авторизация')).toBeInTheDocument();
  });

  test('показывает ошибку, если сессию не удалось проверить', async () => {
    (userApi.getMe as jest.Mock).mockRejectedValue(new ApiError(500, 'Сервер упал'));

    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );

    expect(await screen.findByText('Ошибка сервера')).toBeInTheDocument();
  });
});
