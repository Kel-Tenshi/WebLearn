const express = require('express');
const {
  getUserByLogin,
  addUser,
  getUserById,
  getUserWithPasswordById,
  updateUserPassword,
  updateUserProfile
} = require('../../db/users');
const { getDepartmentById } = require('../../db/departments');
const { deleteByUserId, saveRefreshToken } = require('../../db/tokens');
const { verifyPassword } = require('../../utils/passwords');
const authMiddleware = require('../../middleware/auth');
const { COOKIE_REFRESH_NAME } = require('../../constants');

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

// Обновление собственного профиля: ФИО и подразделение
router.patch('/me', authMiddleware, async (req, res) => {
  try {
    const { fullName, departmentId } = req.body || {};

    const cleanFullName = fullName ? String(fullName).trim() : '';
    if (cleanFullName.length > 120) {
      return res.status(400).json({ message: 'ФИО не должно превышать 120 символов' });
    }

    let cleanDepartmentId = null;
    if (departmentId) {
      cleanDepartmentId = Number(departmentId);
      const department = await getDepartmentById(cleanDepartmentId);
      if (!department) {
        return res.status(400).json({ message: 'Подразделение не найдено' });
      }
    }

    const updated = await updateUserProfile(req.userId, {
      fullName: cleanFullName,
      departmentId: cleanDepartmentId
    });
    if (!updated) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при обновлении профиля' });
  }
});

// Смена собственного пароля. Остальные сессии пользователя отзываются.
router.patch('/me/password', authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body || {};

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Укажите текущий и новый пароль' });
    }

    if (String(newPassword).length < 6) {
      return res.status(400).json({ message: 'Пароль должен содержать не менее 6 символов' });
    }

    const user = await getUserWithPasswordById(req.userId);
    if (!user || !verifyPassword(String(currentPassword), user.password)) {
      return res.status(400).json({ message: 'Текущий пароль указан неверно' });
    }

    await updateUserPassword(req.userId, String(newPassword));

    // Отзываем все refresh-токены, кроме текущего, чтобы сменить пароль
    // на всех остальных устройствах.
    const currentRefresh = req.cookies[COOKIE_REFRESH_NAME];
    await deleteByUserId(req.userId);
    if (currentRefresh) {
      await saveRefreshToken(req.userId, currentRefresh);
    }

    res.json({ ok: true, message: 'Пароль изменён' });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при смене пароля' });
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
