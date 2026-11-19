const app = require('./app');
const { initDb } = require('./db/db');

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
