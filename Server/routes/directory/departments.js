const express = require('express');
const requireRole = require('../../middleware/requireRole');
const departmentsDb = require('../../db/departments');
const { MANAGER_ROLES } = require('../../constants');
const { isUniqueError, isForeignKeyError, uniqueMessage } = require('../../utils/dbErrors');

const router = express.Router();

function validateBody(body) {
  const { name, code, headName } = body || {};

  if (!name || !String(name).trim()) return { error: 'Укажите название подразделения' };
  if (!code || !String(code).trim()) return { error: 'Укажите код подразделения' };

  return {
    data: {
      name: String(name).trim(),
      code: String(code).trim(),
      headName: headName ? String(headName).trim() : null,
    },
  };
}

router.get('/', async (req, res) => {
  try {
    const list = await departmentsDb.getAllDepartments();
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: 'Ошибка при получении подразделений' });
  }
});

router.post('/', requireRole(...MANAGER_ROLES), async (req, res) => {
  try {
    const { error, data } = validateBody(req.body);
    if (error) return res.status(400).json({ message: error });

    const item = await departmentsDb.addDepartment(data);

    res.status(201).json(item);
  } catch (err) {
    if (isUniqueError(err)) {
      return res.status(409).json({ message: uniqueMessage(err, 'Подразделение') });
    }
    res.status(500).json({ message: 'Ошибка при добавлении подразделения' });
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

    const item = await departmentsDb.updateDepartment(id, data);
    if (!item) return res.status(404).json({ message: 'Подразделение не найдено' });

    res.json(item);
  } catch (err) {
    if (isUniqueError(err)) {
      return res.status(409).json({ message: uniqueMessage(err, 'Подразделение') });
    }
    res.status(500).json({ message: 'Ошибка при обновлении подразделения' });
  }
});

router.delete('/:id', requireRole(...MANAGER_ROLES), async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ message: 'Некорректный id' });
    }

    const changes = await departmentsDb.deleteDepartment(id);
    if (!changes) return res.status(404).json({ message: 'Подразделение не найдено' });

    res.json({ message: 'Подразделение удалено' });
  } catch (err) {
    if (isForeignKeyError(err)) {
      return res.status(409).json({ message: 'Нельзя удалить подразделение: оно используется' });
    }
    res.status(500).json({ message: 'Ошибка при удалении подразделения' });
  }
});

module.exports = router;
