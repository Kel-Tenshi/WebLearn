import React, { useState } from 'react';
import { Check, Pencil, Plus, Trash2, X } from 'lucide-react';
import { Supplier } from '../../types';
import { FormField } from '../ui/FormField';
import { useForm } from '../../hooks/useForm';
import {
  collect,
  maxTextLength,
  minTextLength,
  requiredText,
} from '../../utils/validation';

interface Props {
  items: Supplier[];
  canManage: boolean;
  onCreate: (data: Partial<Supplier>) => Promise<void>;
  onUpdate: (id: number, data: Partial<Supplier>) => Promise<void>;
  onDelete: (id: number, name: string) => Promise<void>;
}

interface FormState {
  name: string;
  inn: string;
  contactPerson: string;
  phone: string;
  email: string;
}

const EMPTY_FORM: FormState = {
  name: '',
  inn: '',
  contactPerson: '',
  phone: '',
  email: '',
};

const validateSupplier = (values: FormState) =>
  collect({
    name:
      requiredText(values.name, 'Укажите название организации') ||
      minTextLength(values.name, 2, 'Название должно содержать минимум 2 символа'),
    inn:
      values.inn.trim() && !/^\d{10}$|^\d{12}$/.test(values.inn.trim())
        ? 'ИНН должен состоять из 10 или 12 цифр'
        : undefined,
    contactPerson: maxTextLength(
      values.contactPerson,
      120,
      'Контактное лицо не должно превышать 120 символов'
    ),
    phone: maxTextLength(values.phone, 30, 'Телефон не должен превышать 30 символов'),
    email:
      values.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())
        ? 'Укажите корректный email'
        : undefined,
  });

export const SuppliersCard: React.FC<Props> = ({
  items,
  canManage,
  onCreate,
  onUpdate,
  onDelete,
}) => {
  const [editingId, setEditingId] = useState<number | null>(null);
  const { values, errors, submitting, setValue, replace, reset, submit } =
    useForm<FormState>(EMPTY_FORM, validateSupplier);

  const startEdit = (item: Supplier) => {
    setEditingId(item.id);
    replace({
      name: item.name,
      inn: item.inn || '',
      contactPerson: item.contactPerson || '',
      phone: item.phone || '',
      email: item.email || '',
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    reset();
  };

  const handleSubmit = submit(async (current) => {
    const payload: Partial<Supplier> = {
      name: current.name.trim(),
      inn: current.inn.trim() || undefined,
      contactPerson: current.contactPerson.trim() || undefined,
      phone: current.phone.trim() || undefined,
      email: current.email.trim() || undefined,
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
        <h4>Поставщики</h4>
        <span className="directory-card-tools">
          {editingId && <span className="directory-editing">редактирование</span>}
          <span className="directory-count">{items.length}</span>
        </span>
      </div>

      {canManage && (
        <form onSubmit={handleSubmit} className="directory-form" noValidate>
          <FormField error={errors.name}>
            <input
              placeholder="Название организации"
              value={values.name}
              onChange={(e) => setValue('name', e.target.value)}
            />
          </FormField>
          <FormField error={errors.inn}>
            <input
              placeholder="ИНН"
              value={values.inn}
              onChange={(e) => setValue('inn', e.target.value)}
            />
          </FormField>
          <FormField error={errors.contactPerson}>
            <input
              placeholder="Контактное лицо"
              value={values.contactPerson}
              onChange={(e) => setValue('contactPerson', e.target.value)}
            />
          </FormField>
          <FormField error={errors.phone}>
            <input
              placeholder="Телефон"
              value={values.phone}
              onChange={(e) => setValue('phone', e.target.value)}
            />
          </FormField>
          <div className="directory-form-row">
            <FormField error={errors.email}>
              <input
                type="email"
                placeholder="Email"
                value={values.email}
                onChange={(e) => setValue('email', e.target.value)}
              />
            </FormField>
            <button
              type="submit"
              className="directory-add"
              disabled={submitting}
              aria-label={editingId ? 'Сохранить поставщика' : 'Добавить поставщика'}
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
        <p className="muted directory-empty">Поставщиков пока нет</p>
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
                  {[
                    item.inn ? `ИНН: ${item.inn}` : null,
                    item.contactPerson,
                    item.phone,
                    item.email,
                  ]
                    .filter(Boolean)
                    .join(' · ') || 'Реквизиты не указаны'}
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
