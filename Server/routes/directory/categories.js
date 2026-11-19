const express = require('express');
const requireRole = require('../../middleware/requireRole');
const categoriesDb = require('../../db/categories');
const { MANAGER_ROLES } = require('../../constants');
const { isUniqueError, uniqueMessage } = require('../../utils/dbErrors');

const router = express.Router();

function validateBody(body) {
  const { name, code, description } = body || {};

  if (!name || !String(name).trim()) return { error: 'Укажите название категории' };
  if (!code || !String(code).trim()) return { error: 'Укажите код категории' };

  return {
    data: {
      name: String(name).trim(),
      code: String(code).trim(),
      description: description ? String(description).trim() : null,
    },
  };
}

router.get('/', async (req, res) => {
  try {
    const list = await categoriesDb.getAllCategories();
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: 'Ошибка при получении категорий' });
  }
});

router.post('/', requireRole(...MANAGER_ROLES), async (req, res) => {
  try {
    const { error, data } = validateBody(req.body);
    if (error) return res.status(400).json({ message: error });

    const item = await categoriesDb.addCategory(data);

    res.status(201).json(item);
  } catch (err) {
    if (isUniqueError(err)) {
      return res.status(409).json({ message: uniqueMessage(err, 'Категория') });
    }
    res.status(500).json({ message: 'Ошибка при добавлении категории' });
  }
});

router.put('/:id', requireRole(...MANAGER_ROLES), async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ message: 'Некорректный id' });
    }

    const { error, data } = validateBody(req.body);
    if (error) return res.status(400).json({ message: error });

    const item = await categoriesDb.updateCategory(id, data);
    if (!item) return res.status(404).json({ message: 'Категория не найдена' });

    res.json(item);
  } catch (err) {
    if (isUniqueError(err)) {
      return res.status(409).json({ message: uniqueMessage(err, 'Категория') });
    }
    res.status(500).json({ message: 'Ошибка при обновлении категории' });
  }
});

router.delete('/:id', requireRole(...MANAGER_ROLES), async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ message: 'Некорректный id' });
    }

    const changes = await categoriesDb.deleteCategory(id);
    if (!changes) return res.status(404).json({ message: 'Категория не найдена' });

    res.json({ message: 'Категория удалена' });
  } catch (err) {
    res.status(500).json({ message: 'Ошибка при удалении категории' });
  }
});

module.exports = router;
