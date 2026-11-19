const express = require('express');
const requireRole = require('../../middleware/requireRole');
const suppliersDb = require('../../db/suppliers');
const { MANAGER_ROLES } = require('../../constants');
const { isUniqueError, uniqueMessage } = require('../../utils/dbErrors');

const router = express.Router();

function validateBody(body) {
  const { name, inn, contactPerson, phone, email } = body || {};

  if (!name || !String(name).trim()) return { error: 'Укажите название организации' };

  return {
    data: {
      name: String(name).trim(),
      inn: inn ? String(inn).trim() : null,
      contactPerson: contactPerson ? String(contactPerson).trim() : null,
      phone: phone ? String(phone).trim() : null,
      email: email ? String(email).trim() : null,
    },
  };
}

router.get('/', async (req, res) => {
  try {
    const list = await suppliersDb.getAllSuppliers();
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: 'Ошибка при получении поставщиков' });
  }
});

router.post('/', requireRole(...MANAGER_ROLES), async (req, res) => {
  try {
    const { error, data } = validateBody(req.body);
    if (error) return res.status(400).json({ message: error });

    const item = await suppliersDb.addSupplier(data);

    res.status(201).json(item);
  } catch (err) {
    if (isUniqueError(err)) {
      return res.status(409).json({ message: uniqueMessage(err, 'Поставщик') });
    }
    res.status(500).json({ message: 'Ошибка при добавлении поставщика' });
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

    const item = await suppliersDb.updateSupplier(id, data);
    if (!item) return res.status(404).json({ message: 'Поставщик не найден' });

    res.json(item);
  } catch (err) {
    if (isUniqueError(err)) {
      return res.status(409).json({ message: uniqueMessage(err, 'Поставщик') });
    }
    res.status(500).json({ message: 'Ошибка при обновлении поставщика' });
  }
});

router.delete('/:id', requireRole(...MANAGER_ROLES), async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ message: 'Некорректный id' });
    }

    const changes = await suppliersDb.deleteSupplier(id);
    if (!changes) return res.status(404).json({ message: 'Поставщик не найден' });

    res.json({ message: 'Поставщик удалён' });
  } catch (err) {
    res.status(500).json({ message: 'Ошибка при удалении поставщика' });
  }
});

module.exports = router;
