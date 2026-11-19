import { ApiError, request } from './http';

function jsonResponse(status: number, body: unknown) {
  return {
    status,
    ok: status >= 200 && status < 300,
    json: jest.fn().mockResolvedValue(body),
  } as unknown as Response;
}

describe('http request', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  test('возвращает JSON успешного ответа', async () => {
    global.fetch = jest.fn().mockResolvedValue(jsonResponse(200, { ok: true }));

    await expect(request('/api/test')).resolves.toEqual({ ok: true });
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  test('204 возвращает undefined', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      status: 204,
      ok: true,
      json: jest.fn(),
    } as unknown as Response);

    await expect(request('/api/test', { method: 'DELETE' })).resolves.toBeUndefined();
  });

  test('4xx превращается в ApiError с сообщением сервера', async () => {
    global.fetch = jest.fn().mockResolvedValue(
      jsonResponse(409, { message: 'Заказ уже существует' })
    );

    await expect(request('/api/orders')).rejects.toMatchObject({
      name: 'ApiError',
      status: 409,
      message: 'Заказ уже существует',
    });
  });

  test('битый JSON ошибки заменяется запасным сообщением', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      status: 500,
      ok: false,
      json: jest.fn().mockRejectedValue(new Error('not json')),
    } as unknown as Response);

    await expect(request('/api/test')).rejects.toMatchObject({
      status: 500,
      message: 'Внутренняя ошибка сервера (500)',
    });
  });

  test('401 обновляет токен и повторяет запрос', async () => {
    const fetchMock = jest
      .fn()
      .mockResolvedValueOnce(jsonResponse(401, { message: 'Нет доступа' }))
      .mockResolvedValueOnce(jsonResponse(200, { ok: true }))
      .mockResolvedValueOnce(jsonResponse(200, { items: [1, 2] }));

    global.fetch = fetchMock as unknown as typeof fetch;

    await expect(request('/api/equipment')).resolves.toEqual({ items: [1, 2] });

    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(String(fetchMock.mock.calls[1][0])).toBe('/auth/refresh');
    expect(String(fetchMock.mock.calls[2][0])).toBe('/api/equipment');
  });

  test('неудачный refresh сообщает приложению об истечении сессии', async () => {
    const expired = jest.fn();
    window.addEventListener('auth:expired', expired);

    global.fetch = jest
      .fn()
      .mockResolvedValueOnce(jsonResponse(401, { message: 'Нет доступа' }))
      .mockResolvedValueOnce(jsonResponse(401, { message: 'Истекла' })) as unknown as typeof fetch;

    await expect(request('/api/equipment')).rejects.toBeInstanceOf(ApiError);
    expect(expired).toHaveBeenCalledTimes(1);

    window.removeEventListener('auth:expired', expired);
  });

  test('сетевая ошибка превращается в ApiError(0)', async () => {
    global.fetch = jest.fn().mockRejectedValue(new TypeError('Failed to fetch'));

    await expect(request('/api/test')).rejects.toMatchObject({
      status: 0,
      message: 'Сервер недоступен. Проверьте соединение с сетью',
    });
  });

  test('таймаут распознаётся отдельно', async () => {
    const abortError = Object.assign(new Error('aborted'), { name: 'AbortError' });
    global.fetch = jest.fn().mockRejectedValue(abortError);

    await expect(request('/api/test')).rejects.toMatchObject({
      status: 0,
      message: 'Сервер не отвечает. Превышено время ожидания',
    });
  });
});
