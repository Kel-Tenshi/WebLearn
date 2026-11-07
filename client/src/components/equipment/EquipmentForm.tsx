import React, { useEffect, useState } from 'react';
import { Category, Equipment, EquipmentStatus, LocationItem } from '../../types';
import { FormField } from '../ui/FormField';

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

export const EquipmentForm: React.FC<Props> = ({
  categories,
  locations,
  editingItem,
  onSubmit,
  onCancel,
}) => {
  const [form, setForm] = useState<FormState>({ ...EMPTY_FORM });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setErrors({});

    if (editingItem) {
      setForm({
        invNumber: editingItem.invNumber,
        serialNumber: editingItem.serialNumber || '',
        name: editingItem.name,
        categoryId: editingItem.categoryId || 0,
        locationId: editingItem.locationId || 0,
        purchaseCost: editingItem.purchaseCost || 0,
        status: editingItem.status,
      });
    } else {
      setForm({ ...EMPTY_FORM });
    }
  }, [editingItem]);

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    const invNumber = form.invNumber.trim();
    const name = form.name.trim();

    if (!invNumber) {
      errs.invNumber = 'Укажите инвентарный номер';
    } else if (invNumber.length < 3) {
      errs.invNumber = 'Минимум 3 символа';
    } else if (invNumber.length > 30) {
      errs.invNumber = 'Максимум 30 символов';
    }

    if (!name) {
      errs.name = 'Укажите наименование техники';
    } else if (name.length < 2) {
      errs.name = 'Минимум 2 символа';
    } else if (name.length > 120) {
      errs.name = 'Максимум 120 символов';
    }

    if (form.serialNumber.trim().length > 60) {
      errs.serialNumber = 'Максимум 60 символов';
    }

    if (!Number.isFinite(form.purchaseCost) || form.purchaseCost < 0) {
      errs.purchaseCost = 'Стоимость не может быть меньше 0';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const payload: Partial<Equipment> = {
      ...form,
      invNumber: form.invNumber.trim(),
      serialNumber: form.serialNumber.trim(),
      name: form.name.trim(),
      categoryId: form.categoryId ? Number(form.categoryId) : null,
      locationId: form.locationId ? Number(form.locationId) : null,
      purchaseCost: Number(form.purchaseCost),
    };

    try {
      await onSubmit(payload);
      setErrors({});
      if (!editingItem) setForm({ ...EMPTY_FORM });
    } catch {
      // Ошибку уже показал родительский компонент
    }
  };

  return (
    <form onSubmit={handleSubmit} className="form-card" noValidate>
      <h3>{editingItem ? 'Редактировать оборудование' : 'Добавить оборудование'}</h3>
      <div className="form-row">
        <FormField error={errors.invNumber}>
          <input
            placeholder="Инв. номер *"
            value={form.invNumber}
            onChange={(e) => {
              setForm({ ...form, invNumber: e.target.value });
              if (errors.invNumber) setErrors({ ...errors, invNumber: '' });
            }}
          />
        </FormField>

        <FormField error={errors.serialNumber}>
          <input
            placeholder="Серийный номер"
            value={form.serialNumber}
            onChange={(e) => {
              setForm({ ...form, serialNumber: e.target.value });
              if (errors.serialNumber) setErrors({ ...errors, serialNumber: '' });
            }}
          />
        </FormField>

        <FormField error={errors.name}>
          <input
            placeholder="Наименование *"
            value={form.name}
            onChange={(e) => {
              setForm({ ...form, name: e.target.value });
              if (errors.name) setErrors({ ...errors, name: '' });
            }}
          />
        </FormField>

        <select
          value={form.categoryId}
          onChange={(e) => setForm({ ...form, categoryId: Number(e.target.value) })}
        >
          <option value={0}>Без категории</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        <select
          value={form.locationId}
          onChange={(e) => setForm({ ...form, locationId: Number(e.target.value) })}
        >
          <option value={0}>Без локации</option>
          {locations.map((l) => (
            <option key={l.id} value={l.id}>{l.name}</option>
          ))}
        </select>

        <select
          value={form.status}
          onChange={(e) => setForm({ ...form, status: e.target.value as EquipmentStatus })}
        >
          {['Работает', 'В ремонте', 'Простой', 'Списано', 'На консервации'].map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        <FormField error={errors.purchaseCost}>
          <input
            type="number"
            placeholder="Стоимость"
            value={form.purchaseCost}
            onChange={(e) => {
              setForm({ ...form, purchaseCost: Number(e.target.value) });
              if (errors.purchaseCost) setErrors({ ...errors, purchaseCost: '' });
            }}
          />
        </FormField>

        <button type="submit" className="primary">
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
