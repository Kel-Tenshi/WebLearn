const express = require('express');
const authRouter = express.Router();
const { hashPassword } = require('../db/db');
const { getUserByLogin, getUserById } = require('../db/users');
const { saveRefreshToken, deleteByToken, getUserIdByToken } = require('../db/tokens');
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken
} = require('../utils/jwt');
const {
  COOKIE_ACCESS_NAME,
  COOKIE_REFRESH_NAME,
  ACCESS_COOKIE_MAX_AGE,
  REFRESH_COOKIE_MAX_AGE
} = require('../constants');

// Вход в систему: формируем пару Access + Refresh токенов
authRouter.post('/login', async (req, res) => {
  try {
    const { login, password } = req.body || {};

    if (!login || !password) {
      return res.status(400).json({ message: 'Введите логин и пароль' });
    }

    const user = await getUserByLogin(String(login).trim());

    if (!user || user.password !== hashPassword(String(password))) {
      return res.status(401).json({ message: 'Неверный логин или пароль' });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Сохраняем refresh-токен в базу данных
    await saveRefreshToken(user.id, refreshToken);

    // Устанавливаем HTTP-only куки
    res.cookie(COOKIE_ACCESS_NAME, accessToken, {
      maxAge: ACCESS_COOKIE_MAX_AGE,
      httpOnly: true,
      sameSite: 'lax'
    });

    res.cookie(COOKIE_REFRESH_NAME, refreshToken, {
      maxAge: REFRESH_COOKIE_MAX_AGE,
      httpOnly: true,
      sameSite: 'lax'
    });

    res.status(200).json({
      ok: true,
      user: { id: user.id, login: user.login, role: user.role }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Ошибка при входе в систему' });
  }
});

// Ручное или повторное обновление пары токенов по refresh-токену
authRouter.post('/refresh', async (req, res) => {
  try {
    const refreshToken = req.cookies[COOKIE_REFRESH_NAME];

    if (!refreshToken) {
      return res.status(401).json({ message: 'Refresh-токен отсутствует' });
    }

    const { valid, decoded } = verifyRefreshToken(refreshToken);
    if (!valid || !decoded) {
      return res.status(401).json({ message: 'Срок действия сессии истек' });
    }

    const userId = await getUserIdByToken(refreshToken);
    if (!userId || userId !== decoded.id) {
      return res.status(401).json({ message: 'Сессия отозвана' });
    }

    const user = await getUserById(userId);
    if (!user) {
      return res.status(401).json({ message: 'Пользователь не найден' });
    }

    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    await saveRefreshToken(user.id, newRefreshToken);

    res.cookie(COOKIE_ACCESS_NAME, newAccessToken, {
      maxAge: ACCESS_COOKIE_MAX_AGE,
      httpOnly: true,
      sameSite: 'lax'
    });

    res.cookie(COOKIE_REFRESH_NAME, newRefreshToken, {
      maxAge: REFRESH_COOKIE_MAX_AGE,
      httpOnly: true,
      sameSite: 'lax'
    });

    res.status(200).json({
      ok: true,
      user: { id: user.id, login: user.login, role: user.role }
    });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при обновлении токена' });
  }
});

// Выход: удаление refresh-токена из базы и очистка кук в браузере
authRouter.delete('/logout', async (req, res) => {
  try {
    const refreshToken = req.cookies[COOKIE_REFRESH_NAME];
    if (refreshToken) {
      await deleteByToken(refreshToken);
    }
    res.clearCookie(COOKIE_ACCESS_NAME);
    res.clearCookie(COOKIE_REFRESH_NAME);
    res.status(200).json({ ok: true });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при выходе из системы' });
  }
});

module.exports = authRouter;