const express = require('express');
const {
  getUserByLogin,
  addUser,
  getUserById,
  getUsers,
  updateUserRole,
  deleteUser
} = require('../db/users');
const authMiddleware = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');
const { USER_ROLES } = require('../constants');

const userRouter = express.Router();

// Профиль текущего пользователя (нужна авторизация)
userRouter.get('/me', authMiddleware, async (req, res) => {
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
userRouter.post('/register', async (req, res) => {
  try {
    const { login, password } = req.body || {};

    if (!login || !password) {
      return res.status(400).json({ message: 'Введите логин и пароль' });
    }

    const cleanLogin = String(login).trim();

    if (cleanLogin.length < 3) {
      return res.status(400).json({ message: 'Логин должен содержать не менее 3 символов' });
    }

    if (String(password).length < 6) {
      return res.status(400).json({ message: 'Пароль должен содержать не менее 6 символов' });
    }

    const user = await getUserByLogin(cleanLogin);
    if (user) {
      return res.status(400).json({ message: 'Такой пользователь уже есть' });
    }

    const newUser = await addUser(cleanLogin, String(password), 'employee');
    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при регистрации пользователя' });
  }
});

// Список всех пользователей (только администратор)
userRouter.get('/', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const users = await getUsers();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при получении списка пользователей' });
  }
});

// Смена роли пользователя (только администратор)
userRouter.patch('/:id/role', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ message: 'Некорректный id' });
    }

    const { role } = req.body || {};
    if (!USER_ROLES.includes(role)) {
      return res
        .status(400)
        .json({ message: `Недопустимая роль. Допустимо: ${USER_ROLES.join(', ')}` });
    }

    // Чтобы администратор случайно не лишил себя прав и не оставил систему без админа
    if (id === req.userId) {
      return res.status(400).json({ message: 'Нельзя изменить собственную роль' });
    }

    const changes = await updateUserRole(id, role);
    if (changes === 0) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    res.json({ id, role });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при смене роли' });
  }
});

// Удаление пользователя (только администратор)
userRouter.delete('/:id', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ message: 'Некорректный id' });
    }

    // Запрет на удаление собственного аккаунта
    if (id === req.userId) {
      return res.status(400).json({ message: 'Нельзя удалить собственный аккаунт' });
    }

    const changes = await deleteUser(id);
    if (changes === 0) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    res.json({ message: 'Пользователь успешно удалён' });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при удалении пользователя' });
  }
});

module.exports = userRouter;
