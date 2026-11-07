import React, { useState } from 'react';
import { Equipment, RequestItem, RequestPriority, RequestType } from '../../types';
import { FormField } from '../ui/FormField';

interface Props {
  equipment: Equipment[];
  onSubmit: (data: Partial<RequestItem>) => Promise<void>;
}

interface FormState {
  type: RequestType;
  equipmentId: number;
  priority: RequestPriority;
  title: string;
}

const EMPTY_FORM: FormState = {
  type: 'Ремонт',
  equipmentId: 0,
  priority: 'Средний',
  title: '',
};

export const RequestForm: React.FC<Props> = ({ equipment, onSubmit }) => {
  const [form, setForm] = useState<FormState>({ ...EMPTY_FORM });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (!form.title.trim()) {
      errs.title = 'Укажите тему заявки';
    } else if (form.title.trim().length < 5) {
      errs.title = 'Тема должна содержать минимум 5 символов';
    } else if (form.title.trim().length > 200) {
      errs.title = 'Тема не должна превышать 200 символов';
    }

    if ((form.type === 'Ремонт' || form.type === 'Перемещение') && !form.equipmentId) {
      errs.equipmentId = 'Выберите оборудование для этого типа заявки';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await onSubmit({
        ...form,
        title: form.title.trim(),
        equipmentId: form.equipmentId ? Number(form.equipmentId) : null,
      });
      setForm({ ...EMPTY_FORM });
      setErrors({});
    } catch {
      // Ошибку уже показал родительский компонент
    }
  };

  return (
    <form onSubmit={handleSubmit} className="form-card" noValidate>
      <h3>Новая заявка</h3>
      <div className="form-row">
        <select
          value={form.type}
          onChange={(e) => {
            setForm({ ...form, type: e.target.value as RequestType });
            if (errors.equipmentId) setErrors({ ...errors, equipmentId: '' });
          }}
        >
          {['Перемещение', 'Списание', 'Закупка', 'Ремонт'].map((type) => (
            <option key={type}>{type}</option>
          ))}
        </select>

        <FormField error={errors.equipmentId}>
          <select
            value={form.equipmentId}
            onChange={(e) => {
              setForm({ ...form, equipmentId: Number(e.target.value) });
              if (errors.equipmentId) setErrors({ ...errors, equipmentId: '' });
            }}
          >
            <option value={0}>Оборудование не выбрано</option>
            {equipment.map((item) => (
              <option key={item.id} value={item.id}>
                {item.invNumber} ({item.name})
              </option>
            ))}
          </select>
        </FormField>

        <select
          value={form.priority}
          onChange={(e) => setForm({ ...form, priority: e.target.value as RequestPriority })}
        >
          {['Низкий', 'Средний', 'Высокий', 'Критический'].map((priority) => (
            <option key={priority}>{priority}</option>
          ))}
        </select>

        <FormField error={errors.title} style={{ flex: 1 }}>
          <input
            placeholder="Тема / основание *"
            value={form.title}
            onChange={(e) => {
              setForm({ ...form, title: e.target.value });
              if (errors.title) setErrors({ ...errors, title: '' });
            }}
            style={{ width: '100%' }}
          />
        </FormField>

        <button type="submit" className="primary">Подать заявку</button>
      </div>
    </form>
  );
};
