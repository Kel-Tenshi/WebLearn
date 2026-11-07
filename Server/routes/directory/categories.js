const express = require('express');
const requireRole = require('../../middleware/requireRole');
const categoriesDb = require('../../db/categories');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const list = await categoriesDb.getAllCategories();
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: 'Ошибка при получении категорий' });
  }
});

router.post('/', requireRole('manager', 'admin'), async (req, res) => {
  try {
    const { name, code, description } = req.body || {};

    if (!name || !code) {
      return res.status(400).json({ message: 'Укажите название и шифр категории' });
    }

    const item = await categoriesDb.addCategory({
      name: name.trim(),
      code: code.trim(),
      description
    });

    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ message: 'Ошибка при добавлении категории' });
  }
});

module.exports = router;
