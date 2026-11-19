import { ApiError } from '../api/http';
import { describeError, describeStatus } from './apiErrors';

describe('apiErrors', () => {
  test('describeStatus знает распространённые коды', () => {
    expect(describeStatus(401).title).toBe('Требуется авторизация');
    expect(describeStatus(403).tone).toBe('warning');
    expect(describeStatus(404).title).toBe('Не найдено');
    expect(describeStatus(999).status).toBe(999);
  });

  test('4xx показывает сообщение сервера', () => {
    const error = new ApiError(409, 'Заказ с таким номером уже существует');
    const described = describeError(error);

    expect(described.title).toBe('Конфликт данных');
    expect(described.message).toBe('Заказ с таким номером уже существует');
    expect(described.tone).toBe('warning');
  });

  test('5xx прячет детали сервера', () => {
    const error = new ApiError(500, 'SQLITE ошибка');
    const described = describeError(error);

    expect(described.message).not.toContain('SQLITE');
    expect(described.tone).toBe('danger');
  });

  test('неизвестная ошибка и отсутствие ошибки', () => {
    expect(describeError(new Error('boom')).status).toBe(500);
    expect(describeError(null).status).toBe(0);
  });

  test('statusOverride важнее статуса ошибки', () => {
    expect(describeError(new ApiError(500, 'boom'), 404).status).toBe(404);
  });
});
