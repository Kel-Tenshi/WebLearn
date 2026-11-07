const express = require('express');
const requireRole = require('../../middleware/requireRole');
const locationsDb = require('../../db/locations');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const list = await locationsDb.getAllLocations();
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: 'Ошибка при получении локаций' });
  }
});

router.post('/', requireRole('manager', 'admin'), async (req, res) => {
  try {
    const { name, building, room, departmentId } = req.body || {};

    if (!name || !building) {
      return res.status(400).json({ message: 'Укажите название и здание' });
    }

    const item = await locationsDb.addLocation({
      name: name.trim(),
      building: building.trim(),
      room,
      departmentId: departmentId ? Number(departmentId) : null
    });

    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ message: 'Ошибка при добавлении локации' });
  }
});

module.exports = router;
