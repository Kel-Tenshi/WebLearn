const express = require('express');
const { getUsers, getUserById, updateUserRole, deleteUser } = require('../../db/users');
const { resetDb } = require('../../db/db');
const authMiddleware = require('../../middleware/auth');
const requireRole = require('../../middleware/requireRole');
const {
  ASSIGNABLE_ROLES,
  ADMIN_ROLES,
  COOKIE_ACCESS_NAME,
  COOKIE_REFRESH_NAME
} = require('../../constants');

const router = express.Router();

// Сброс базы данных к демонстрационному состоянию (только владелец системы)
router.post('/reset-db', authMiddleware, requireRole('root'), async (req, res) => {
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

// Список всех пользователей (администратор и владелец системы)
router.get('/', authMiddleware, requireRole(...ADMIN_ROLES), async (req, res) => {
  try {
    const users = await getUsers();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при получении списка пользователей' });
  }
});

// Смена роли пользователя.
// admin управляет только сотрудниками и менеджерами, root — ещё и админами.
router.patch('/:id/role', authMiddleware, requireRole(...ADMIN_ROLES), async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ message: 'Некорректный id' });
    }

    const { role } = req.body || {};
    if (!ASSIGNABLE_ROLES.includes(role)) {
      return res
        .status(400)
        .json({ message: `Недопустимая роль. Допустимо: ${ASSIGNABLE_ROLES.join(', ')}` });
    }

    // Чтобы администратор случайно не лишил себя прав и не оставил систему без админа
    if (id === req.userId) {
      return res.status(400).json({ message: 'Нельзя изменить собственную роль' });
    }

    const target = await getUserById(id);
    if (!target) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    if (target.role === 'root') {
      return res.status(403).json({ message: 'Аккаунт владельца системы защищён от изменений' });
    }

    // Обычный администратор не может ни выдать admin, ни понизить администратора
    if (req.userRole !== 'root' && (target.role === 'admin' || role === 'admin')) {
      return res.status(403).json({
        message: 'Управлять администраторами может только владелец системы'
      });
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

// Удаление пользователя.
// admin удаляет только сотрудников и менеджеров, root — ещё и админов.
router.delete('/:id', authMiddleware, requireRole(...ADMIN_ROLES), async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ message: 'Некорректный id' });
    }

    // Запрет на удаление собственного аккаунта
    if (id === req.userId) {
      return res.status(400).json({ message: 'Нельзя удалить собственный аккаунт' });
    }

    const target = await getUserById(id);
    if (!target) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    if (target.role === 'root') {
      return res.status(403).json({ message: 'Аккаунт владельца системы защищён от удаления' });
    }

    if (req.userRole !== 'root' && target.role === 'admin') {
      return res.status(403).json({
        message: 'Удалять администраторов может только владелец системы'
      });
    }

    await deleteUser(id);

    res.json({ message: 'Пользователь успешно удалён' });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при удалении пользователя' });
  }
});

module.exports = router;
