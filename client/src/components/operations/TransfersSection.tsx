import React from 'react';
import { Equipment, LocationItem, Transfer } from '../../types';
import { FormField } from '../ui/FormField';
import { StatusBadge } from '../ui/StatusBadge';
import { StatusActions } from '../ui/StatusActions';
import { SortHeader } from '../ui/SortHeader';
import { ListToolbar } from '../ui/ListToolbar';
import { Pagination } from '../ui/Pagination';
import { useForm } from '../../hooks/useForm';
import { useTableControls } from '../../hooks/useTableControls';
import { collect, maxTextLength } from '../../utils/validation';
import { getStatusActions } from '../../config/statusMachine';
import { displayPerson } from '../../utils/people';
import { TRANSFER_STATUSES, toOptions } from '../../config/lists';

interface Props {
  items: Transfer[];
  equipment: Equipment[];
  locations: LocationItem[];
  canManage: boolean;
  onCreate: (data: { equipmentId: number; toLocationId: number; reason?: string }) => Promise<void>;
  onStatusChange: (id: number, status: string) => void;
}

interface FormState {
  equipmentId: number;
  toLocationId: number;
  reason: string;
}

const EMPTY_FORM: FormState = {
  equipmentId: 0,
  toLocationId: 0,
  reason: '',
};

const validateTransfer = (values: FormState) =>
  collect({
    equipmentId: values.equipmentId ? undefined : 'Выберите оборудование',
    toLocationId: values.toLocationId ? undefined : 'Выберите, куда переместить оборудование',
    reason: maxTextLength(values.reason, 200, 'Причина не должна превышать 200 символов'),
  });

export const TransfersSection: React.FC<Props> = ({
  items,
  equipment,
  locations,
  canManage,
  onCreate,
  onStatusChange,
}) => {
  const { values, errors, submitting, setValue, reset, submit } =
    useForm<FormState>(EMPTY_FORM, validateTransfer);

  const statusOptions = toOptions(TRANSFER_STATUSES);

  const controls = useTableControls(items, {
    search: (item) => [
      item.id,
      item.invNumber,
      item.equipmentName,
      item.fromLocationName,
      item.toLocationName,
      item.transferredBy,
      item.transferredByName,
      item.status,
      item.transferDate,
      item.reason,
    ],
    filters: [
      {
        key: 'status',
        label: 'Статус',
        options: statusOptions,
        getValue: (item) => item.status,
      },
    ],
    sorters: {
      id: (item) => item.id,
      transferDate: (item) => item.transferDate,
      equipment: (item) => item.invNumber || '',
      from: (item) => item.fromLocationName || '',
      to: (item) => item.toLocationName || '',
      status: (item) => item.status,
    },
  });

  const handleSubmit = submit(async (current) => {
    try {
      await onCreate({ ...current, reason: current.reason.trim() });
      reset();
    } catch {
      // Ошибку уже показал родительский компонент
    }
  });

  return (
    <>
      {canManage && (
        <form onSubmit={handleSubmit} className="form-card" noValidate>
          <h3>Оформить перемещение</h3>
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

            <FormField label="Куда переместить" error={errors.toLocationId}>
              <select
                value={values.toLocationId}
                onChange={(e) => setValue('toLocationId', Number(e.target.value))}
              >
                <option value={0} disabled>Выберите локацию</option>
                {locations.map((location) => (
                  <option key={location.id} value={location.id}>{location.name}</option>
                ))}
              </select>
            </FormField>

            <FormField label="Причина / Приказ" error={errors.reason} className="field-grow">
              <input
                placeholder="Основание перемещения"
                value={values.reason}
                onChange={(e) => setValue('reason', e.target.value)}
              />
            </FormField>

            <button type="submit" className="primary" disabled={submitting}>Переместить</button>
          </div>
        </form>
      )}

      <ListToolbar
        search={controls.search}
        onSearchChange={controls.setSearch}
        placeholder="Найти перемещение по оборудованию, локации, причине…"
        hasActiveFilters={controls.hasActiveFilters}
        onReset={controls.resetFilters}
        filters={[
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
              <SortHeader label="Дата" sortKey="transferDate" activeKey={controls.sortKey} dir={controls.sortDir} onSort={controls.toggleSort} />
              <SortHeader label="Оборудование" sortKey="equipment" activeKey={controls.sortKey} dir={controls.sortDir} onSort={controls.toggleSort} />
              <SortHeader label="Откуда" sortKey="from" activeKey={controls.sortKey} dir={controls.sortDir} onSort={controls.toggleSort} />
              <SortHeader label="Куда" sortKey="to" activeKey={controls.sortKey} dir={controls.sortDir} onSort={controls.toggleSort} />
              <th>Оформил</th>
              <SortHeader label="Статус" sortKey="status" activeKey={controls.sortKey} dir={controls.sortDir} onSort={controls.toggleSort} />
              {canManage && <th>Действия</th>}
            </tr>
          </thead>
          <tbody>
            {controls.items.length === 0 ? (
              <tr>
                <td colSpan={canManage ? 8 : 7} align="center">Перемещений не найдено</td>
              </tr>
            ) : (
              controls.items.map((item) => (
                <tr key={item.id}>
                  <td className="cell-nowrap">TR-{item.id}</td>
                  <td className="cell-nowrap">{item.transferDate}</td>
                  <td>{item.invNumber} ({item.equipmentName})</td>
                  <td>{item.fromLocationName || 'Склад'}</td>
                  <td><b>{item.toLocationName}</b></td>
                  <td>{displayPerson(item.transferredByName, item.transferredBy)}</td>
                  <td><StatusBadge status={item.status} /></td>
                  {canManage && (
                    <td>
                      <StatusActions
                        actions={getStatusActions('transfer', item.status)}
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
