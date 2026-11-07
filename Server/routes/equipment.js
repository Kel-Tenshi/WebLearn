const express = require('express');
const {
  getAllEquipment,
  getEquipmentById,
  getEquipmentByInvNumber,
  addEquipment,
  updateEquipment,
  deleteEquipment
} = require('../db/equipment');
const authMiddleware = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');
const { EQUIPMENT_STATUSES } = require('../constants');
const {
  EQUIPMENT_INITIAL_STATUSES,
  getNextStatuses,
  canTransition
} = require('../stateMachine');

const equipmentRouter = express.Router();
equipmentRouter.use(authMiddleware);

function validateBody(body) {
  const { invNumber, serialNumber, name, categoryId, locationId, status, purchaseCost, commissioningDate } = body || {};

  if (!invNumber || !String(invNumber).trim()) {
    return { error: 'Укажите инвентарный номер' };
  }
  if (!name || !String(name).trim()) {
    return { error: 'Укажите наименование оборудования' };
  }

  const cleanStatus = status ? String(status) : 'Работает';
  if (!EQUIPMENT_STATUSES.includes(cleanStatus)) {
    return { error: `Недопустимый статус. Допустимо: ${EQUIPMENT_STATUSES.join(', ')}` };
  }

  return {
    data: {
      invNumber: String(invNumber).trim(),
      serialNumber: serialNumber ? String(serialNumber).trim() : null,
      name: String(name).trim(),
      categoryId: categoryId ? Number(categoryId) : null,
      locationId: locationId ? Number(locationId) : null,
      status: cleanStatus,
      purchaseCost: Number(purchaseCost) || 0,
      commissioningDate: commissioningDate || null
    }
  };
}

equipmentRouter.get('/', async (req, res) => {
  try {
    const items = await getAllEquipment();
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при получении оборудования' });
  }
});

equipmentRouter.get('/:id', async (req, res) => {
  try {
    const item = await getEquipmentById(Number(req.params.id));
    if (!item) return res.status(404).json({ message: 'Оборудование не найдено' });
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при получении карточки оборудования' });
  }
});

equipmentRouter.post('/', requireRole('manager', 'admin'), async (req, res) => {
  try {
    const { error, data } = validateBody(req.body);
    if (error) return res.status(400).json({ message: error });

    if (!EQUIPMENT_INITIAL_STATUSES.includes(data.status)) {
      return res.status(400).json({
        message: `Новое оборудование можно добавить только со статусом: ${EQUIPMENT_INITIAL_STATUSES.join(', ')}`
      });
    }

    const duplicate = await getEquipmentByInvNumber(data.invNumber);
    if (duplicate) {
      return res.status(409).json({ message: 'Оборудование с таким инв. номером уже существует' });
    }

    const newItem = await addEquipment(data);
    res.status(201).json(newItem);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при добавлении оборудования' });
  }
});

equipmentRouter.put('/:id', requireRole('manager', 'admin'), async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { error, data } = validateBody(req.body);
    if (error) return res.status(400).json({ message: error });

    const existing = await getEquipmentById(id);
    if (!existing) return res.status(404).json({ message: 'Оборудование не найдено' });

    if (!canTransition('equipment', existing.status, data.status)) {
      return res.status(409).json({
        message: `Недопустимый переход статуса: «${existing.status}» → «${data.status}». ` +
          `Доступно: ${getNextStatuses('equipment', existing.status).join(', ') || 'нет'}`
      });
    }

    const duplicate = await getEquipmentByInvNumber(data.invNumber);
    if (duplicate && duplicate.id !== id) {
      return res.status(409).json({ message: 'Инвентарный номер уже занят другим объектом' });
    }

    await updateEquipment(id, data);
    res.json({ id, ...data });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при обновлении оборудования' });
  }
});

equipmentRouter.delete('/:id', requireRole('manager', 'admin'), async (req, res) => {
  try {
    const id = Number(req.params.id);
    const changes = await deleteEquipment(id);
    if (!changes) return res.status(404).json({ message: 'Оборудование не найдено' });
    res.json({ message: 'Оборудование удалено' });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при удалении оборудования' });
  }
});

module.exports = equipmentRouter;