const express = require('express');
const { getUsers, updateUserRole, deleteUser } = require('../../db/users');
const { resetDb } = require('../../db/db');
const authMiddleware = require('../../middleware/auth');
const requireRole = require('../../middleware/requireRole');
const {
  USER_ROLES,
  COOKIE_ACCESS_NAME,
  COOKIE_REFRESH_NAME
} = require('../../constants');

const router = express.Router();

// Сброс базы данных к демонстрационному состоянию (только администратор)
router.post('/reset-db', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    await resetDb();

    // После сброса все пользователи и токены пересозданы,
    // поэтому завершаем текущую сессию и просим войти заново.
    res.clearCookie(COOKIE_ACCESS_NAME);
    res.clearCookie(COOKIE_REFRESH_NAME);

    res.json({
      ok: true,
      message: 'База данных сброшена к значениям по умолчанию'
    });
  } catch (error) {
    console.error('reset-db error:', error);
    res.status(500).json({ message: 'Ошибка при сбросе базы данных' });
  }
});

// Список всех пользователей (только администратор)
router.get('/', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const users = await getUsers();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при получении списка пользователей' });
  }
});

// Смена роли пользователя (только администратор)
router.patch('/:id/role', authMiddleware, requireRole('admin'), async (req, res) => {
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
router.delete('/:id', authMiddleware, requireRole('admin'), async (req, res) => {
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

module.exports = router;
