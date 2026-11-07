const crypto = require('crypto');

// Хэширование паролей: SHA-256 со случайной солью.
// Формат хранения: sha256$<salt>$<hash>
const PASSWORD_HASH_PREFIX = 'sha256';

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto
    .createHash('sha256')
    .update(`${salt}:${password}`)
    .digest('hex');

  return `${PASSWORD_HASH_PREFIX}$${salt}$${hash}`;
}

// Сравнение строк без утечки по времени
function safeEqual(a, b) {
  const bufA = Buffer.from(a, 'utf8');
  const bufB = Buffer.from(b, 'utf8');
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

// Проверка пароля. Поддерживает старый формат без соли,
// чтобы уже созданные учётные записи не сломались.
function verifyPassword(password, storedHash) {
  if (!storedHash) return false;

  if (storedHash.startsWith(`${PASSWORD_HASH_PREFIX}$`)) {
    const [, salt, hash] = storedHash.split('$');
    if (!salt || !hash) return false;

    const computed = crypto
      .createHash('sha256')
      .update(`${salt}:${password}`)
      .digest('hex');

    return safeEqual(computed, hash);
  }

  const legacyHash = crypto.createHash('sha256').update(password).digest('hex');
  return safeEqual(legacyHash, storedHash);
}

// Старый формат — 64 hex-символа без префикса и соли
function isLegacyPasswordHash(storedHash) {
  return typeof storedHash === 'string' && !storedHash.startsWith(`${PASSWORD_HASH_PREFIX}$`);
}

module.exports = {
  hashPassword,
  verifyPassword,
  isLegacyPasswordHash
};
