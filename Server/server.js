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

app.use(express.json());
app.use(cookies());
app.use(
  cors({
    credentials: true,
    origin: true
  })
);


// Подключение REST API роутеров для всех 12 сущностей
app.use('/auth', authRouter);
app.use('/user', userRouter);
app.use('/api/equipment', equipmentRouter);
app.use('/api/requests', requestsRouter);
app.use('/api/directory', directoryRouter);
app.use('/api/operations', opsRouter);

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