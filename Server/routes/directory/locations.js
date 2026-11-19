const express = require('express');
const requireRole = require('../../middleware/requireRole');
const locationsDb = require('../../db/locations');
const departmentsDb = require('../../db/departments');
const { MANAGER_ROLES } = require('../../constants');
const { isForeignKeyError } = require('../../utils/dbErrors');

const router = express.Router();

function validateBody(body) {
  const { name, building, room, departmentId } = body || {};

  if (!name || !String(name).trim()) return { error: 'Укажите название локации' };
  if (!building || !String(building).trim()) return { error: 'Укажите здание' };

  return {
    data: {
      name: String(name).trim(),
      building: String(building).trim(),
      room: room ? String(room).trim() : null,
      departmentId: departmentId ? Number(departmentId) : null,
    },
  };
}

async function validateDepartment(departmentId) {
  if (!departmentId) return null;
  const department = await departmentsDb.getDepartmentById(departmentId);
  return department ? null : 'Подразделение не найдено';
}

router.get('/', async (req, res) => {
  try {
    const list = await locationsDb.getAllLocations();
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: 'Ошибка при получении локаций' });
  }
});

router.post('/', requireRole(...MANAGER_ROLES), async (req, res) => {
  try {
    const { error, data } = validateBody(req.body);
    if (error) return res.status(400).json({ message: error });

    const departmentError = await validateDepartment(data.departmentId);
    if (departmentError) return res.status(400).json({ message: departmentError });

    const item = await locationsDb.addLocation(data);

    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ message: 'Ошибка при добавлении локации' });
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

    const departmentError = await validateDepartment(data.departmentId);
    if (departmentError) return res.status(400).json({ message: departmentError });

    const item = await locationsDb.updateLocation(id, data);
    if (!item) return res.status(404).json({ message: 'Локация не найдена' });

    res.json(item);
  } catch (err) {
    res.status(500).json({ message: 'Ошибка при обновлении локации' });
  }
});

router.delete('/:id', requireRole(...MANAGER_ROLES), async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ message: 'Некорректный id' });
    }

    const changes = await locationsDb.deleteLocation(id);
    if (!changes) return res.status(404).json({ message: 'Локация не найдена' });

    res.json({ message: 'Локация удалена' });
  } catch (err) {
    if (isForeignKeyError(err)) {
      return res.status(409).json({
        message: 'Нельзя удалить локацию: она используется в оборудовании или перемещениях'
      });
    }
    res.status(500).json({ message: 'Ошибка при удалении локации' });
  }
});

module.exports = router;
