const express = require('express');
const cors = require('cors');
const cookies = require('cookie-parser');
const path = require('path');
const { initDb } = require('./db/db');

const authRouter = require('./routes/auth');
const userRouter = require('./routes/user');
const equipmentRouter = require('./routes/equipment');
const requestsRouter = require('./routes/requests');
const directoryRouter = require('./routes/directory');
const opsRouter = require('./routes/operations');

const app = express();

app.use(express.json({ limit: '1mb' }));
app.use(cookies());
app.use(
  cors({
    credentials: true,
    origin: true
  })
);

// Подключение REST API роутеров
app.use('/auth', authRouter);
app.use('/user', userRouter);
app.use('/api/equipment', equipmentRouter);
app.use('/api/requests', requestsRouter);
app.use('/api/directory', directoryRouter);
app.use('/api/operations', opsRouter);

// Перехват неизвестных маршрутов (404)
app.use((req, res) => {
  res.status(404).json({
    message: `Маршрут ${req.method} ${req.originalUrl} не найден на сервере`
  });
});

// Глобальный перехватчик ошибок: 400 для битого JSON, 413 для больших тел, 500 для остального
app.use((err, req, res, next) => {
  console.error('SERVER EXCEPTION:', err);

  if (res.headersSent) {
    return next(err);
  }

  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'Некорректный JSON в теле запроса' });
  }

  if (err.type === 'entity.too.large') {
    return res.status(413).json({ message: 'Слишком большой размер запроса' });
  }

  const status = Number(err.status) || 500;
  const message =
    status >= 500 ? 'Внутренняя ошибка сервера' : err.message || 'Ошибка запроса';

  res.status(status).json({ message });
});

const port = process.env.PORT || 5000;

(async () => {
  try {
    await initDb();
    app.listen(port, () => {
      console.log(`Сервер запущен на http://localhost:${port}`);
    });
  } catch (error) {
    console.error('Ошибка при запуске сервера:', error);
  }
})();