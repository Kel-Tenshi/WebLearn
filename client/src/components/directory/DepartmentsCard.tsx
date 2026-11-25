import React, { useState } from 'react';
import { ArrowUpDown, Check, Pencil, Plus, Trash2, X } from 'lucide-react';
import { Department } from '../../types';
import { FormField } from '../ui/FormField';
import { Pagination } from '../ui/Pagination';
import { useForm } from '../../hooks/useForm';
import { useTableControls } from '../../hooks/useTableControls';
import { collect, maxTextLength, minTextLength, requiredText } from '../../utils/validation';

interface Props {
  items: Department[];
  canManage: boolean;
  onCreate: (data: { name: string; code: string; headName?: string }) => Promise<void>;
  onUpdate: (
    id: number,
    data: { name: string; code: string; headName?: string }
  ) => Promise<void>;
  onDelete: (id: number, name: string) => Promise<void>;
}

interface FormState {
  name: string;
  code: string;
  headName: string;
}

const EMPTY_FORM: FormState = { name: '', code: '', headName: '' };

const validateDepartment = (values: FormState) =>
  collect({
    code:
      requiredText(values.code, 'Укажите код подразделения') ||
      minTextLength(values.code, 2, 'Код должен содержать минимум 2 символа'),
    name:
      requiredText(values.name, 'Укажите название подразделения') ||
      minTextLength(values.name, 2, 'Название должно содержать минимум 2 символа'),
    headName: maxTextLength(values.headName, 120, 'ФИО руководителя не должно превышать 120 символов'),
  });

export const DepartmentsCard: React.FC<Props> = ({
  items,
  canManage,
  onCreate,
  onUpdate,
  onDelete,
}) => {
  const [editingId, setEditingId] = useState<number | null>(null);
  const { values, errors, submitting, setValue, replace, reset, submit } =
    useForm<FormState>(EMPTY_FORM, validateDepartment);

  const controls = useTableControls(items, {
    search: (item) => [item.name, item.code, item.headName],
    sorters: { name: (item) => item.name },
    initialPageSize: 6,
  });

  const startEdit = (item: Department) => {
    setEditingId(item.id);
    replace({
      name: item.name,
      code: item.code,
      headName: item.headName || '',
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    reset();
  };

  const handleSubmit = submit(async (current) => {
    const payload = {
      name: current.name.trim(),
      code: current.code.trim(),
      headName: current.headName.trim() || undefined,
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
        <h4>Подразделения</h4>
        <span className="directory-card-tools">
          {editingId && <span className="directory-editing">редактирование</span>}
          <span className="directory-count">
            {controls.hasActiveFilters ? `${controls.filteredTotal}/${items.length}` : items.length}
          </span>
          <button
            type="button"
            className="icon-action"
            onClick={() => controls.toggleSort('name')}
            aria-label="Сортировать по названию"
            title={controls.sortDir === 'asc' ? 'По названию: А → Я' : 'По названию: Я → А'}
          >
            <ArrowUpDown size={14} aria-hidden="true" />
          </button>
        </span>
      </div>

      {items.length > 0 && (
        <input
          type="search"
          className="directory-search"
          placeholder="Поиск по подразделениям…"
          value={controls.search}
          onChange={(e) => controls.setSearch(e.target.value)}
          aria-label="Поиск по подразделениям"
        />
      )}

      {canManage && (
        <form onSubmit={handleSubmit} className="directory-form" noValidate>
          <FormField error={errors.code}>
            <input
              placeholder="Код"
              value={values.code}
              onChange={(e) => setValue('code', e.target.value)}
            />
          </FormField>
          <FormField error={errors.name}>
            <input
              placeholder="Название"
              value={values.name}
              onChange={(e) => setValue('name', e.target.value)}
            />
          </FormField>
          <div className="directory-form-row">
            <FormField error={errors.headName}>
              <input
                placeholder="Руководитель"
                value={values.headName}
                onChange={(e) => setValue('headName', e.target.value)}
              />
            </FormField>
            <button
              type="submit"
              className="directory-add"
              disabled={submitting}
              aria-label={editingId ? 'Сохранить подразделение' : 'Добавить подразделение'}
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

      {controls.filteredTotal === 0 ? (
        <p className="muted directory-empty">
          {items.length === 0 ? 'Подразделений пока нет' : 'Ничего не найдено'}
        </p>
      ) : (
        <ul className="directory-list">
          {controls.items.map((item) => (
            <li
              key={item.id}
              className={`directory-item${editingId === item.id ? ' is-editing' : ''}`}
            >
              <div className="directory-item-text">
                <span className="directory-item-title">{item.name}</span>
                <span className="directory-item-meta">
                  <code className="code-chip">{item.code}</code>
                  {item.headName ? ` · ${item.headName}` : ''}
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

      {controls.pageCount > 1 && (
        <Pagination
          compact
          page={controls.page}
          pageCount={controls.pageCount}
          pageSize={controls.pageSize}
          total={controls.total}
          filteredTotal={controls.filteredTotal}
          from={controls.from}
          to={controls.to}
          onPageChange={controls.setPage}
          onPageSizeChange={controls.setPageSize}
        />
      )}
    </div>
  );
};
