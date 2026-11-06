const { verifyAccessToken, verifyRefreshToken, generateAccessToken } = require('../utils/jwt');
const { getUserIdByToken } = require('../db/tokens');
const { getUserById } = require('../db/users');
const {
  COOKIE_ACCESS_NAME,
  COOKIE_REFRESH_NAME,
  ACCESS_COOKIE_MAX_AGE
} = require('../constants');

async function authMiddleware(req, res, next) {
  try {
    const accessToken = req.cookies[COOKIE_ACCESS_NAME];

    // 1. Быстрый путь: Access Token валиден (без обращения к БД)
    if (accessToken) {
      const { valid, decoded } = verifyAccessToken(accessToken);
      if (valid && decoded) {
        req.userId = decoded.id;
        req.userLogin = decoded.login;
        req.userRole = decoded.role;
        return next();
      }
    }

    // 2. Если Access Token истек или отсутствует — проверяем Refresh Token
    const refreshToken = req.cookies[COOKIE_REFRESH_NAME];
    if (!refreshToken) {
      return res.status(401).json({ message: 'Пользователь не авторизован' });
    }

    const { valid: rfValid, decoded: rfDecoded } = verifyRefreshToken(refreshToken);
    if (!rfValid || !rfDecoded) {
      return res.status(401).json({ message: 'Срок сессии истек. Пожалуйста, выполните вход' });
    }

    // Проверяем наличие refresh-токена в базе (на случай отзыва сессии)
    const tokenUserId = await getUserIdByToken(refreshToken);
    if (!tokenUserId || tokenUserId !== rfDecoded.id) {
      return res.status(401).json({ message: 'Сессия недействительна' });
    }

    const user = await getUserById(tokenUserId);
    if (!user) {
      return res.status(401).json({ message: 'Пользователь не найден' });
    }

    // Автоматически перевыпускаем Access Token в куку
    const newAccessToken = generateAccessToken(user);
    res.cookie(COOKIE_ACCESS_NAME, newAccessToken, {
      maxAge: ACCESS_COOKIE_MAX_AGE,
      httpOnly: true,
      sameSite: 'lax'
    });

    req.userId = user.id;
    req.userLogin = user.login;
    req.userRole = user.role;
    next();
  } catch (error) {
    console.error('authMiddleware error:', error);
    res.status(500).json({ message: 'Ошибка при проверке авторизации' });
  }
}

module.exports = authMiddleware;