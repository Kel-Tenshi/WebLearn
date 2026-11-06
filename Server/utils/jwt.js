const jwt = require('jsonwebtoken');
const {
  JWT_ACCESS_SECRET,
  JWT_REFRESH_SECRET,
  ACCESS_TOKEN_EXPIRES_IN,
  REFRESH_TOKEN_EXPIRES_IN
} = require('../constants');

// Генерация короткоживущего токена доступа (15 минут)
function generateAccessToken(user) {
  return jwt.sign(
    {
      id: user.id,
      login: user.login,
      role: user.role
    },
    JWT_ACCESS_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRES_IN }
  );
}

// Генерация долгоживущего refresh-токена (7 дней)
function generateRefreshToken(user) {
  return jwt.sign(
    {
      id: user.id,
      login: user.login
    },
    JWT_REFRESH_SECRET,
    { expiresIn: REFRESH_TOKEN_EXPIRES_IN }
  );
}

// Проверка access-токена
function verifyAccessToken(token) {
  try {
    return { valid: true, decoded: jwt.verify(token, JWT_ACCESS_SECRET) };
  } catch (error) {
    return { valid: false, expired: error.name === 'TokenExpiredError', error };
  }
}

// Проверка refresh-токена
function verifyRefreshToken(token) {
  try {
    return { valid: true, decoded: jwt.verify(token, JWT_REFRESH_SECRET) };
  } catch (error) {
    return { valid: false, expired: error.name === 'TokenExpiredError', error };
  }
}

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken
};