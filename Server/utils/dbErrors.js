// Распознавание нарушения UNIQUE-ограничений SQLite,
// чтобы отдавать клиенту 409 вместо общей 500.

function isUniqueError(error) {
  return Boolean(error && /UNIQUE constraint failed/i.test(String(error.message)));
}

function isForeignKeyError(error) {
  return Boolean(error && /FOREIGN KEY constraint failed/i.test(String(error.message)));
}

function uniqueMessage(error, entity) {
  const message = String(error?.message || '');
  const field = message.split('.').pop();

  if (field === 'code') return `${entity} с таким кодом уже существует`;
  if (field === 'name') return `${entity} с таким названием уже существует`;
  if (field === 'inn') return 'Поставщик с таким ИНН уже существует';
  if (field === 'login') return 'Такой пользователь уже есть';

  return `${entity} с такими данными уже существует`;
}

module.exports = {
  isUniqueError,
  isForeignKeyError,
  uniqueMessage
};
