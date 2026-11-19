import React, { useState } from 'react';
import { Check, Pencil, Plus, Trash2, X } from 'lucide-react';
import { Department, LocationItem } from '../../types';
import { FormField } from '../ui/FormField';
import { useForm } from '../../hooks/useForm';
import {
  collect,
  maxTextLength,
  minTextLength,
  requiredText,
} from '../../utils/validation';

interface LocationData {
  name: string;
  building: string;
  room?: string;
  departmentId?: number | null;
}

interface Props {
  items: LocationItem[];
  departments: Department[];
  canManage: boolean;
  onCreate: (data: LocationData) => Promise<void>;
  onUpdate: (id: number, data: LocationData) => Promise<void>;
  onDelete: (id: number, name: string) => Promise<void>;
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
  onUpdate,
  onDelete,
}) => {
  const [editingId, setEditingId] = useState<number | null>(null);
  const { values, errors, submitting, setValue, replace, reset, submit } =
    useForm<FormState>(EMPTY_FORM, validateLocation);

  const startEdit = (item: LocationItem) => {
    setEditingId(item.id);
    replace({
      name: item.name,
      building: item.building,
      room: item.room || '',
      departmentId: item.departmentId || 0,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    reset();
  };

  const handleSubmit = submit(async (current) => {
    const payload: LocationData = {
      name: current.name.trim(),
      building: current.building.trim(),
      room: current.room.trim() || undefined,
      departmentId: current.departmentId || null,
    };

    try {
      if (editingId) {
        await onUpdate(editingId, payload);
      } else {
        await onCreate(payload);
      }
      setEditingId(null);
      reset();
    } catch {
      // Ошибку уже показал родительский компонент
    }
  });

  return (
    <div className="card directory-card">
      <div className="directory-card-head">
        <h4>Локации</h4>
        <span className="directory-card-tools">
          {editingId && <span className="directory-editing">редактирование</span>}
          <span className="directory-count">{items.length}</span>
        </span>
      </div>

      {canManage && (
        <form onSubmit={handleSubmit} className="directory-form" noValidate>
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
          <div className="directory-form-row">
            <FormField>
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
            </FormField>
            <button
              type="submit"
              className="directory-add"
              disabled={submitting}
              aria-label={editingId ? 'Сохранить локацию' : 'Добавить локацию'}
              title={editingId ? 'Сохранить' : 'Добавить'}
            >
              {editingId ? <Check size={16} aria-hidden="true" /> : <Plus size={16} aria-hidden="true" />}
            </button>
            {editingId && (
              <button
                type="button"
                className="directory-cancel"
                onClick={cancelEdit}
                aria-label="Отменить редактирование"
                title="Отмена"
              >
                <X size={16} aria-hidden="true" />
              </button>
            )}
          </div>
        </form>
      )}

      {items.length === 0 ? (
        <p className="muted directory-empty">Локаций пока нет</p>
      ) : (
        <ul className="directory-list">
          {items.map((item) => (
            <li
              key={item.id}
              className={`directory-item${editingId === item.id ? ' is-editing' : ''}`}
            >
              <div className="directory-item-text">
                <span className="directory-item-title">{item.name}</span>
                <span className="directory-item-meta">
                  {[item.building, item.room, item.departmentName].filter(Boolean).join(' · ')}
                </span>
              </div>
              {canManage && (
                <div className="directory-item-actions">
                  <button
                    type="button"
                    className="icon-action"
                    onClick={() => startEdit(item)}
                    aria-label={`Изменить: ${item.name}`}
                    title="Изменить"
                  >
                    <Pencil size={14} aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    className="icon-action danger"
                    onClick={() => onDelete(item.id, item.name)}
                    aria-label={`Удалить: ${item.name}`}
                    title="Удалить"
                  >
                    <Trash2 size={14} aria-hidden="true" />
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
