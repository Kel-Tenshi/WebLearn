import React from 'react';
import { Equipment, MaintenanceLog, MaintenanceType } from '../../types';
import { FormField } from '../ui/FormField';
import { StatusBadge } from '../ui/StatusBadge';
import { StatusActions } from '../ui/StatusActions';
import { SortHeader } from '../ui/SortHeader';
import { ListToolbar } from '../ui/ListToolbar';
import { Pagination } from '../ui/Pagination';
import { useForm } from '../../hooks/useForm';
import { useTableControls } from '../../hooks/useTableControls';
import { collect, maxTextLength, nonNegativeNumber } from '../../utils/validation';
import { getStatusActions } from '../../config/statusMachine';
import { displayPerson } from '../../utils/people';
import {
  MAINTENANCE_STATUSES,
  MAINTENANCE_TYPES,
  toOptions,
} from '../../config/lists';

interface Props {
  items: MaintenanceLog[];
  equipment: Equipment[];
  canManage: boolean;
  onCreate: (data: Partial<MaintenanceLog>) => Promise<void>;
  onStatusChange: (id: number, status: string) => void;
}

interface FormState {
  equipmentId: number;
  maintenanceType: MaintenanceType;
  performer: string;
  cost: number;
  description: string;
}

const EMPTY_FORM: FormState = {
  equipmentId: 0,
  maintenanceType: 'Плановое ТО',
  performer: '',
  cost: 0,
  description: '',
};

const validateMaintenance = (values: FormState) =>
  collect({
    equipmentId: values.equipmentId ? undefined : 'Выберите оборудование',
    performer: maxTextLength(values.performer, 120, 'Исполнитель не должен превышать 120 символов'),
    cost: nonNegativeNumber(values.cost, 'Стоимость не может быть отрицательной'),
    description: maxTextLength(values.description, 300, 'Описание не должно превышать 300 символов'),
  });

export const MaintenanceSection: React.FC<Props> = ({
  items,
  equipment,
  canManage,
  onCreate,
  onStatusChange,
}) => {
  const { values, errors, submitting, setValue, reset, submit } =
    useForm<FormState>(EMPTY_FORM, validateMaintenance);

  const typeOptions = toOptions(MAINTENANCE_TYPES);
  const statusOptions = toOptions(MAINTENANCE_STATUSES);

  const controls = useTableControls(items, {
    search: (item) => [
      item.id,
      item.invNumber,
      item.equipmentName,
      item.maintenanceType,
      item.performer,
      item.performerName,
      item.status,
      item.startDate,
      item.description,
    ],
    filters: [
      {
        key: 'type',
        label: 'Вид работ',
        options: typeOptions,
        getValue: (item) => item.maintenanceType,
      },
      {
        key: 'status',
        label: 'Статус',
        options: statusOptions,
        getValue: (item) => item.status,
      },
    ],
    sorters: {
      id: (item) => item.id,
      equipment: (item) => item.invNumber || '',
      type: (item) => item.maintenanceType,
      performer: (item) => displayPerson(item.performerName, item.performer),
      cost: (item) => item.cost,
      startDate: (item) => item.startDate,
      status: (item) => item.status,
    },
  });

  const handleSubmit = submit(async (current) => {
    try {
      await onCreate({
        ...current,
        performer: current.performer.trim() || undefined,
        description: current.description.trim() || undefined,
      });
      reset();
    } catch {
      // Ошибку уже показал родительский компонент
    }
  });

  return (
    <>
      {canManage && (
        <form onSubmit={handleSubmit} className="form-card" noValidate>
          <h3>Назначить ТО / Ремонт</h3>
          <div className="form-row">
            <FormField label="Оборудование" error={errors.equipmentId}>
              <select
                value={values.equipmentId}
                onChange={(e) => setValue('equipmentId', Number(e.target.value))}
              >
                <option value={0} disabled>Выберите оборудование</option>
                {equipment.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.invNumber} ({item.name})
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="Вид работ">
              <select
                value={values.maintenanceType}
                onChange={(e) => setValue('maintenanceType', e.target.value as MaintenanceType)}
              >
                {['Плановое ТО', 'Аварийный ремонт', 'Калибровка/Поверка', 'Модернизация'].map((type) => (
                  <option key={type}>{type}</option>
                ))}
              </select>
            </FormField>

            <FormField label="Исполнитель" error={errors.performer}>
              <input
                placeholder="ФИО или организация"
                value={values.performer}
                onChange={(e) => setValue('performer', e.target.value)}
              />
            </FormField>

            <FormField label="Стоимость, ₽" error={errors.cost}>
              <input
                type="number"
                placeholder="0"
                value={values.cost}
                onChange={(e) => setValue('cost', Number(e.target.value))}
              />
            </FormField>

            <FormField label="Описание работ" error={errors.description} className="field-grow">
              <input
                placeholder="Что нужно сделать"
                value={values.description}
                onChange={(e) => setValue('description', e.target.value)}
              />
            </FormField>

            <button type="submit" className="primary" disabled={submitting}>Назначить</button>
          </div>
        </form>
      )}

      <ListToolbar
        search={controls.search}
        onSearchChange={controls.setSearch}
        placeholder="Найти работу по оборудованию, исполнителю, виду работ…"
        hasActiveFilters={controls.hasActiveFilters}
        onReset={controls.resetFilters}
        filters={[
          {
            key: 'type',
            label: 'Вид работ',
            value: controls.filterValues.type || '',
            options: typeOptions,
            onChange: (value) => controls.setFilter('type', value),
          },
          {
            key: 'status',
            label: 'Статус',
            value: controls.filterValues.status || '',
            options: statusOptions,
            onChange: (value) => controls.setFilter('status', value),
          },
        ]}
      />

      <div className="table-scroll">
        <table className="data-table">
          <thead>
            <tr>
              <SortHeader label="ID" sortKey="id" activeKey={controls.sortKey} dir={controls.sortDir} onSort={controls.toggleSort} />
              <SortHeader label="Оборудование" sortKey="equipment" activeKey={controls.sortKey} dir={controls.sortDir} onSort={controls.toggleSort} />
              <SortHeader label="Вид работ" sortKey="type" activeKey={controls.sortKey} dir={controls.sortDir} onSort={controls.toggleSort} />
              <SortHeader label="Исполнитель" sortKey="performer" activeKey={controls.sortKey} dir={controls.sortDir} onSort={controls.toggleSort} />
              <SortHeader label="Стоимость" sortKey="cost" activeKey={controls.sortKey} dir={controls.sortDir} onSort={controls.toggleSort} />
              <SortHeader label="Дата" sortKey="startDate" activeKey={controls.sortKey} dir={controls.sortDir} onSort={controls.toggleSort} />
              <SortHeader label="Статус" sortKey="status" activeKey={controls.sortKey} dir={controls.sortDir} onSort={controls.toggleSort} />
              {canManage && <th>Действия</th>}
            </tr>
          </thead>
          <tbody>
            {controls.items.length === 0 ? (
              <tr>
                <td colSpan={canManage ? 8 : 7} align="center">Записей ТО не найдено</td>
              </tr>
            ) : (
              controls.items.map((item) => (
                <tr key={item.id}>
                  <td className="cell-nowrap">{item.id}</td>
                  <td>{item.invNumber} ({item.equipmentName})</td>
                  <td>{item.maintenanceType}</td>
                  <td>{displayPerson(item.performerName, item.performer)}</td>
                  <td className="cell-nowrap">{item.cost.toLocaleString()} ₽</td>
                  <td className="cell-nowrap">{item.startDate}</td>
                  <td><StatusBadge status={item.status} /></td>
                  {canManage && (
                    <td>
                      <StatusActions
                        actions={getStatusActions('maintenance', item.status)}
                        onChange={(status) => onStatusChange(item.id, status)}
                      />
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Pagination
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
    </>
  );
};
