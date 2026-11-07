const express = require('express');
const requireRole = require('../../middleware/requireRole');
const suppliersDb = require('../../db/suppliers');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const list = await suppliersDb.getAllSuppliers();
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: 'Ошибка при получении поставщиков' });
  }
});

router.post('/', requireRole('manager', 'admin'), async (req, res) => {
  try {
    const { name, inn, contactPerson, phone, email } = req.body || {};

    if (!name) {
      return res.status(400).json({ message: 'Укажите название организации' });
    }

    const item = await suppliersDb.addSupplier({
      name: name.trim(),
      inn,
      contactPerson,
      phone,
      email
    });

    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ message: 'Ошибка при добавлении поставщика' });
  }
});

module.exports = router;
