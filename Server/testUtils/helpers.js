// Общая обвязка для серверных тестов: отдельная in-memory БД,
// запуск приложения на свободном порту и cookie-jar на каждого пользователя.

// Важно: переменная должна быть выставлена до require('../db/connection').
process.env.DB_FILE = ':memory:';

const http = require('http');

async function startTestServer() {
  const { initDb } = require('../db/db');
  const app = require('../app');

  await initDb();

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));

  const { port } = server.address();

  return {
    baseUrl: `http://127.0.0.1:${port}`,
    close: () => new Promise((resolve) => server.close(resolve)),
  };
}

function mergeCookies(current, pairs) {
  const jar = new Map(
    current
      .split('; ')
      .filter(Boolean)
      .map((pair) => {
        const index = pair.indexOf('=');
        return [pair.slice(0, index), pair.slice(index + 1)];
      })
  );

  for (const pair of pairs) {
    const index = pair.indexOf('=');
    const name = pair.slice(0, index);
    const value = pair.slice(index + 1);

    if (!value) jar.delete(name);
    else jar.set(name, value);
  }

  return Array.from(jar)
    .map(([name, value]) => `${name}=${value}`)
    .join('; ');
}

function createClient(baseUrl) {
  let cookies = '';

  async function request(method, path, options = {}) {
    const { body, headers = {} } = options;

    const response = await fetch(`${baseUrl}${path}`, {
      method,
      headers: {
        ...(body !== undefined ? { 'content-type': 'application/json' } : {}),
        ...(cookies ? { cookie: cookies } : {}),
        ...headers,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    const setCookie = response.headers.getSetCookie
      ? response.headers.getSetCookie()
      : [];

    if (setCookie.length > 0) {
      cookies = mergeCookies(
        cookies,
        setCookie.map((item) => item.split(';')[0])
      );
    }

    const text = await response.text();
    let data = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = text;
    }

    return { status: response.status, data };
  }

  return {
    request,
    get: (path, options) => request('GET', path, options),
    post: (path, body, options) => request('POST', path, { ...options, body }),
    put: (path, body, options) => request('PUT', path, { ...options, body }),
    patch: (path, body, options) => request('PATCH', path, { ...options, body }),
    delete: (path, options) => request('DELETE', path, options),

    async login(login, password) {
      const response = await request('POST', '/auth/login', {
        body: { login, password },
      });
      return response;
    },

    get cookies() {
      return cookies;
    },
  };
}

// Учётки из демо-сида
const CREDENTIALS = {
  root: ['root', 'root123'],
  admin: ['admin', 'admin123'],
  manager: ['manager', 'manager123'],
  employee: ['user', 'user123'],
};

async function loginAs(baseUrl, role) {
  const client = createClient(baseUrl);
  const [login, password] = CREDENTIALS[role];
  const response = await client.login(login, password);

  if (response.status !== 200) {
    throw new Error(`Не удалось войти как ${role}: ${response.status}`);
  }

  return { client, user: response.data.user };
}

module.exports = {
  startTestServer,
  createClient,
  loginAs,
  CREDENTIALS,
};
