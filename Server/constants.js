// Допустимые значения справочных полей, перечислений и настройки JWT

const { JWT_ACCESS_SECRET, JWT_REFRESH_SECRET } = require('./config/secrets');

module.exports = {
  // Роли пользователей
  USER_ROLES: ['employee', 'manager', 'admin'],

  // Статусы оборудования
  EQUIPMENT_STATUSES: ['Работает', 'В ремонте', 'Простой', 'Списано', 'На консервации'],

  // Заявки
  REQUEST_TYPES: ['Перемещение', 'Списание', 'Закупка', 'Ремонт'],
  REQUEST_PRIORITIES: ['Низкий', 'Средний', 'Высокий', 'Критический'],
  REQUEST_STATUSES: ['На согласовании', 'Одобрено', 'Отклонено', 'Выполнено'],

  // Журнал технического обслуживания (ТО)
  MAINTENANCE_TYPES: ['Плановое ТО', 'Аварийный ремонт', 'Калибровка/Поверка', 'Модернизация'],
  MAINTENANCE_STATUSES: ['Запланировано', 'В процессе', 'Завершено', 'Отменено'],

  // Перемещения оборудования
  TRANSFER_STATUSES: ['В пути', 'Принято', 'Отклонено'],

  // Заказы поставщикам
  ORDER_STATUSES: ['Черновик', 'Согласован', 'В доставке', 'Получен', 'Отменён'],

  // Инвентаризация
  AUDIT_STATUSES: ['В процессе', 'Завершена', 'Выявлены расхождения'],

  // Настройки JWT (Access + Refresh)
  JWT_ACCESS_SECRET,
  JWT_REFRESH_SECRET,
  ACCESS_TOKEN_EXPIRES_IN: '15m', // Короткоживущий токен: 15 минут
  REFRESH_TOKEN_EXPIRES_IN: '7d', // Долгоживущий токен: 7 дней
  ACCESS_COOKIE_MAX_AGE: 15 * 60 * 1000,
  REFRESH_COOKIE_MAX_AGE: 7 * 24 * 60 * 60 * 1000,
  COOKIE_ACCESS_NAME: 'accessToken',
  COOKIE_REFRESH_NAME: 'refreshToken'
};