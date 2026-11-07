import React from 'react';
import { Equipment, RequestItem, RequestPriority, RequestType } from '../../types';
import { FormField } from '../ui/FormField';
import { useForm } from '../../hooks/useForm';
import {
  collect,
  maxTextLength,
  minTextLength,
  requiredText,
} from '../../utils/validation';

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

const validateRequest = (values: FormState) =>
  collect({
    title:
      requiredText(values.title, 'Укажите тему заявки') ||
      minTextLength(values.title, 5, 'Тема должна содержать минимум 5 символов') ||
      maxTextLength(values.title, 200, 'Тема не должна превышать 200 символов'),
    equipmentId:
      (values.type === 'Ремонт' || values.type === 'Перемещение') && !values.equipmentId
        ? 'Выберите оборудование для этого типа заявки'
        : undefined,
  });

export const RequestForm: React.FC<Props> = ({ equipment, onSubmit }) => {
  const { values, errors, submitting, setValue, reset, submit } =
    useForm<FormState>(EMPTY_FORM, validateRequest);

  const handleSubmit = submit(async (current) => {
    try {
      await onSubmit({
        ...current,
        title: current.title.trim(),
        equipmentId: current.equipmentId ? Number(current.equipmentId) : null,
      });
      reset();
    } catch {
      // Ошибку уже показал родительский компонент
    }
  });

  return (
    <form onSubmit={handleSubmit} className="form-card" noValidate>
      <h3>Новая заявка</h3>
      <div className="form-row">
        <select
          value={values.type}
          onChange={(e) => setValue('type', e.target.value as RequestType)}
        >
          {['Перемещение', 'Списание', 'Закупка', 'Ремонт'].map((type) => (
            <option key={type}>{type}</option>
          ))}
        </select>

        <FormField error={errors.equipmentId}>
          <select
            value={values.equipmentId}
            onChange={(e) => setValue('equipmentId', Number(e.target.value))}
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
          value={values.priority}
          onChange={(e) => setValue('priority', e.target.value as RequestPriority)}
        >
          {['Низкий', 'Средний', 'Высокий', 'Критический'].map((priority) => (
            <option key={priority}>{priority}</option>
          ))}
        </select>

        <FormField error={errors.title} className="field-grow">
          <input
            placeholder="Тема / основание *"
            value={values.title}
            onChange={(e) => setValue('title', e.target.value)}
          />
        </FormField>

        <button type="submit" className="primary" disabled={submitting}>Подать заявку</button>
      </div>
    </form>
  );
};
