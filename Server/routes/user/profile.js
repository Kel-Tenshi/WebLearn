const express = require('express');
const { getUserByLogin, addUser, getUserById } = require('../../db/users');
const authMiddleware = require('../../middleware/auth');

const router = express.Router();

// Профиль текущего пользователя (нужна авторизация)
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await getUserById(req.userId);

    if (!user) {
      return res.status(401).json({ message: 'Пользователь не авторизован' });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при получении профиля' });
  }
});

// Регистрация нового пользователя (открытый эндпоинт).
// Роль выдаётся всегда «employee»: выбрать себе роль при регистрации нельзя.
router.post('/register', async (req, res) => {
  try {
    const { login, password, fullName } = req.body || {};

    if (!login || !password) {
      return res.status(400).json({ message: 'Введите логин и пароль' });
    }

    const cleanLogin = String(login).trim();
    const cleanFullName = fullName ? String(fullName).trim() : '';

    if (cleanLogin.length < 3) {
      return res.status(400).json({ message: 'Логин должен содержать не менее 3 символов' });
    }

    if (String(password).length < 6) {
      return res.status(400).json({ message: 'Пароль должен содержать не менее 6 символов' });
    }

    if (cleanFullName.length > 120) {
      return res.status(400).json({ message: 'ФИО не должно превышать 120 символов' });
    }

    const user = await getUserByLogin(cleanLogin);
    if (user) {
      return res.status(400).json({ message: 'Такой пользователь уже есть' });
    }

    const newUser = await addUser(
      cleanLogin,
      String(password),
      'employee',
      cleanFullName || null
    );

    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при регистрации пользователя' });
  }
});

module.exports = router;
