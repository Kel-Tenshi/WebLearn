const express = require('express');
const requireRole = require('../../middleware/requireRole');
const departmentsDb = require('../../db/departments');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const list = await departmentsDb.getAllDepartments();
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: 'Ошибка при получении подразделений' });
  }
});

router.post('/', requireRole('manager', 'admin'), async (req, res) => {
  try {
    const { name, code, headName } = req.body || {};

    if (!name || !code) {
      return res.status(400).json({ message: 'Укажите название и код' });
    }

    const item = await departmentsDb.addDepartment({
      name: name.trim(),
      code: code.trim(),
      headName
    });

    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ message: 'Ошибка при добавлении подразделения' });
  }
});

module.exports = router;
