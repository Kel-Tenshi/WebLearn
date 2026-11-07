import React from 'react';
import { Department, LocationItem } from '../../types';
import { FormField } from '../ui/FormField';
import { useForm } from '../../hooks/useForm';
import {
  collect,
  maxTextLength,
  minTextLength,
  requiredText,
} from '../../utils/validation';

interface Props {
  items: LocationItem[];
  departments: Department[];
  canManage: boolean;
  onCreate: (data: {
    name: string;
    building: string;
    room?: string;
    departmentId?: number | null;
  }) => Promise<void>;
}

interface FormState {
  name: string;
  building: string;
  room: string;
  departmentId: number;
}

const EMPTY_FORM: FormState = {
  name: '',
  building: '',
  room: '',
  departmentId: 0,
};

const validateLocation = (values: FormState) =>
  collect({
    name:
      requiredText(values.name, 'Укажите название локации') ||
      minTextLength(values.name, 2, 'Название должно содержать минимум 2 символа'),
    building:
      requiredText(values.building, 'Укажите здание') ||
      minTextLength(values.building, 2, 'Название здания должно содержать минимум 2 символа'),
    room: maxTextLength(values.room, 30, 'Помещение не должно превышать 30 символов'),
  });

export const LocationsCard: React.FC<Props> = ({
  items,
  departments,
  canManage,
  onCreate,
}) => {
  const { values, errors, submitting, setValue, reset, submit } =
    useForm<FormState>(EMPTY_FORM, validateLocation);

  const handleSubmit = submit(async (current) => {
    try {
      await onCreate({
        name: current.name.trim(),
        building: current.building.trim(),
        room: current.room.trim() || undefined,
        departmentId: current.departmentId || null,
      });
      reset();
    } catch {
      // Ошибку уже показал родительский компонент
    }
  });

  return (
    <div className="card">
      <h4>Локации</h4>
      {canManage && (
        <form onSubmit={handleSubmit} className="form-row" noValidate>
          <FormField error={errors.name}>
            <input
              placeholder="Название"
              value={values.name}
              onChange={(e) => setValue('name', e.target.value)}
            />
          </FormField>
          <FormField error={errors.building}>
            <input
              placeholder="Здание"
              value={values.building}
              onChange={(e) => setValue('building', e.target.value)}
            />
          </FormField>
          <FormField error={errors.room}>
            <input
              placeholder="Помещение"
              value={values.room}
              onChange={(e) => setValue('room', e.target.value)}
            />
          </FormField>
          <select
            value={values.departmentId}
            onChange={(e) => setValue('departmentId', Number(e.target.value))}
          >
            <option value={0}>Без подразделения</option>
            {departments.map((department) => (
              <option key={department.id} value={department.id}>
                {department.code} — {department.name}
              </option>
            ))}
          </select>
          <button type="submit" disabled={submitting}>+</button>
        </form>
      )}
      <ul>
        {items.map((item) => (
          <li key={item.id}>
            <b>{item.name}</b> — {item.building}
            {item.room ? `, ${item.room}` : ''}
            {item.departmentName ? ` (${item.departmentName})` : ''}
          </li>
        ))}
      </ul>
    </div>
  );
};
