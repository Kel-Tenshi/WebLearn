import React, { useEffect } from 'react';
import { Category, Equipment, EquipmentStatus, LocationItem } from '../../types';
import { FormField } from '../ui/FormField';
import { useForm } from '../../hooks/useForm';
import {
  collect,
  maxTextLength,
  minTextLength,
  nonNegativeNumber,
  requiredText,
} from '../../utils/validation';
import {
  EQUIPMENT_INITIAL_STATUSES,
  getNextStatuses,
} from '../../config/statusMachine';

interface Props {
  categories: Category[];
  locations: LocationItem[];
  editingItem: Equipment | null;
  onSubmit: (data: Partial<Equipment>) => Promise<void>;
  onCancel: () => void;
}

interface FormState {
  invNumber: string;
  serialNumber: string;
  name: string;
  categoryId: number;
  locationId: number;
  purchaseCost: number;
  status: EquipmentStatus;
}

const EMPTY_FORM: FormState = {
  invNumber: '',
  serialNumber: '',
  name: '',
  categoryId: 0,
  locationId: 0,
  purchaseCost: 0,
  status: 'Работает',
};

const validateEquipment = (values: FormState) =>
  collect({
    invNumber:
      requiredText(values.invNumber, 'Укажите инвентарный номер') ||
      minTextLength(values.invNumber, 3, 'Минимум 3 символа') ||
      maxTextLength(values.invNumber, 30, 'Максимум 30 символов'),
    name:
      requiredText(values.name, 'Укажите наименование техники') ||
      minTextLength(values.name, 2, 'Минимум 2 символа') ||
      maxTextLength(values.name, 120, 'Максимум 120 символов'),
    serialNumber: maxTextLength(values.serialNumber, 60, 'Максимум 60 символов'),
    purchaseCost: nonNegativeNumber(values.purchaseCost, 'Стоимость не может быть меньше 0'),
  });

export const EquipmentForm: React.FC<Props> = ({
  categories,
  locations,
  editingItem,
  onSubmit,
  onCancel,
}) => {
  const {
    values,
    errors,
    submitting,
    setValue,
    replace,
    reset,
    submit,
  } = useForm<FormState>(EMPTY_FORM, validateEquipment);

  useEffect(() => {
    if (editingItem) {
      replace({
        invNumber: editingItem.invNumber,
        serialNumber: editingItem.serialNumber || '',
        name: editingItem.name,
        categoryId: editingItem.categoryId || 0,
        locationId: editingItem.locationId || 0,
        purchaseCost: editingItem.purchaseCost || 0,
        status: editingItem.status,
      });
    } else {
      reset();
    }
  }, [editingItem, replace, reset]);

  const statusOptions = editingItem
    ? Array.from(new Set([editingItem.status, ...getNextStatuses('equipment', editingItem.status)]))
    : EQUIPMENT_INITIAL_STATUSES;

  const handleSubmit = submit(async (current) => {
    const payload: Partial<Equipment> = {
      ...current,
      invNumber: current.invNumber.trim(),
      serialNumber: current.serialNumber.trim(),
      name: current.name.trim(),
      categoryId: current.categoryId ? Number(current.categoryId) : null,
      locationId: current.locationId ? Number(current.locationId) : null,
      purchaseCost: Number(current.purchaseCost),
    };

    try {
      await onSubmit(payload);
      if (!editingItem) reset();
    } catch {
      // Ошибку уже показал родительский компонент
    }
  });

  return (
    <form onSubmit={handleSubmit} className="form-card" noValidate>
      <h3>{editingItem ? 'Редактировать оборудование' : 'Добавить оборудование'}</h3>
      <div className="form-row">
        <FormField error={errors.invNumber}>
          <input
            placeholder="Инв. номер *"
            value={values.invNumber}
            onChange={(e) => setValue('invNumber', e.target.value)}
          />
        </FormField>

        <FormField error={errors.serialNumber}>
          <input
            placeholder="Серийный номер"
            value={values.serialNumber}
            onChange={(e) => setValue('serialNumber', e.target.value)}
          />
        </FormField>

        <FormField error={errors.name}>
          <input
            placeholder="Наименование *"
            value={values.name}
            onChange={(e) => setValue('name', e.target.value)}
          />
        </FormField>

        <select
          value={values.categoryId}
          onChange={(e) => setValue('categoryId', Number(e.target.value))}
        >
          <option value={0}>Без категории</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        <select
          value={values.locationId}
          onChange={(e) => setValue('locationId', Number(e.target.value))}
        >
          <option value={0}>Без локации</option>
          {locations.map((l) => (
            <option key={l.id} value={l.id}>{l.name}</option>
          ))}
        </select>

        <select
          value={values.status}
          onChange={(e) => setValue('status', e.target.value as EquipmentStatus)}
        >
          {statusOptions.map((status) => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>

        <FormField error={errors.purchaseCost}>
          <input
            type="number"
            placeholder="Стоимость"
            value={values.purchaseCost}
            onChange={(e) => setValue('purchaseCost', Number(e.target.value))}
          />
        </FormField>

        <button type="submit" className="primary" disabled={submitting}>
          {editingItem ? 'Сохранить' : 'Добавить'}
        </button>
        {editingItem && (
          <button type="button" onClick={onCancel}>
            Отмена
          </button>
        )}
      </div>
    </form>
  );
};
