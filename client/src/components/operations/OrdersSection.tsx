import React from 'react';
import { PurchaseOrder, Supplier } from '../../types';
import { FormField } from '../ui/FormField';
import { StatusBadge } from '../ui/StatusBadge';
import { StatusActions } from '../ui/StatusActions';
import { SortHeader } from '../ui/SortHeader';
import { ListToolbar } from '../ui/ListToolbar';
import { Pagination } from '../ui/Pagination';
import { useForm } from '../../hooks/useForm';
import { useTableControls } from '../../hooks/useTableControls';
import {
  collect,
  maxTextLength,
  minTextLength,
  nonNegativeNumber,
  requiredText,
} from '../../utils/validation';
import { getStatusActions } from '../../config/statusMachine';
import { displayPerson } from '../../utils/people';
import { ORDER_STATUSES, toOptions } from '../../config/lists';

interface Props {
  items: PurchaseOrder[];
  suppliers: Supplier[];
  canManage: boolean;
  onCreate: (data: Partial<PurchaseOrder>) => Promise<void>;
  onStatusChange: (id: number, status: string) => void;
}

interface FormState {
  orderNumber: string;
  supplierId: number;
  title: string;
  totalAmount: number;
}

const EMPTY_FORM: FormState = {
  orderNumber: '',
  supplierId: 0,
  title: '',
  totalAmount: 0,
};

const validateOrder = (values: FormState) =>
  collect({
    orderNumber:
      requiredText(values.orderNumber, 'Укажите номер заказа') ||
      minTextLength(values.orderNumber, 3, 'Номер заказа должен содержать минимум 3 символа') ||
      maxTextLength(values.orderNumber, 30, 'Номер заказа не должен превышать 30 символов'),
    title:
      requiredText(values.title, 'Укажите назначение заказа') ||
      minTextLength(values.title, 3, 'Назначение должно содержать минимум 3 символа') ||
      maxTextLength(values.title, 200, 'Назначение не должно превышать 200 символов'),
    totalAmount: nonNegativeNumber(values.totalAmount, 'Сумма не может быть отрицательной'),
  });

export const OrdersSection: React.FC<Props> = ({
  items,
  suppliers,
  canManage,
  onCreate,
  onStatusChange,
}) => {
  const { values, errors, submitting, setValue, reset, submit } =
    useForm<FormState>(EMPTY_FORM, validateOrder);

  const statusOptions = toOptions(ORDER_STATUSES);

  const controls = useTableControls(items, {
    search: (item) => [
      item.orderNumber,
      item.title,
      item.supplierName,
      item.createdBy,
      item.createdByName,
      item.status,
      item.orderDate,
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
      orderNumber: (item) => item.orderNumber,
      orderDate: (item) => item.orderDate,
      supplier: (item) => item.supplierName || '',
      title: (item) => item.title,
      totalAmount: (item) => item.totalAmount,
      status: (item) => item.status,
    },
  });

  const handleSubmit = submit(async (current) => {
    try {
      await onCreate({
        ...current,
        orderNumber: current.orderNumber.trim(),
        title: current.title.trim(),
        supplierId: current.supplierId || null,
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
          <h3>Создать заказ на закупку</h3>
          <div className="form-row">
            <FormField label="Номер заказа" error={errors.orderNumber}>
              <input
                placeholder="ORD-2026-001"
                value={values.orderNumber}
                onChange={(e) => setValue('orderNumber', e.target.value)}
              />
            </FormField>

            <FormField label="Поставщик">
              <select
                value={values.supplierId}
                onChange={(e) => setValue('supplierId', Number(e.target.value))}
              >
                <option value={0}>Без поставщика</option>
                {suppliers.map((supplier) => (
                  <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
                ))}
              </select>
            </FormField>

            <FormField label="Наименование" error={errors.title} className="field-grow">
              <input
                placeholder="Что закупаем"
                value={values.title}
                onChange={(e) => setValue('title', e.target.value)}
              />
            </FormField>

            <FormField label="Сумма, ₽" error={errors.totalAmount}>
              <input
                type="number"
                placeholder="0"
                value={values.totalAmount}
                onChange={(e) => setValue('totalAmount', Number(e.target.value))}
              />
            </FormField>

            <button type="submit" className="primary" disabled={submitting}>Создать заказ</button>
          </div>
        </form>
      )}

      <ListToolbar
        search={controls.search}
        onSearchChange={controls.setSearch}
        placeholder="Найти заказ по номеру, наименованию, поставщику…"
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
              <SortHeader label="Номер" sortKey="orderNumber" activeKey={controls.sortKey} dir={controls.sortDir} onSort={controls.toggleSort} />
              <SortHeader label="Дата" sortKey="orderDate" activeKey={controls.sortKey} dir={controls.sortDir} onSort={controls.toggleSort} />
              <SortHeader label="Поставщик" sortKey="supplier" activeKey={controls.sortKey} dir={controls.sortDir} onSort={controls.toggleSort} />
              <SortHeader label="Наименование" sortKey="title" activeKey={controls.sortKey} dir={controls.sortDir} onSort={controls.toggleSort} />
              <SortHeader label="Сумма" sortKey="totalAmount" activeKey={controls.sortKey} dir={controls.sortDir} onSort={controls.toggleSort} />
              <th>Создал</th>
              <SortHeader label="Статус" sortKey="status" activeKey={controls.sortKey} dir={controls.sortDir} onSort={controls.toggleSort} />
              {canManage && <th>Действия</th>}
            </tr>
          </thead>
          <tbody>
            {controls.items.length === 0 ? (
              <tr>
                <td colSpan={canManage ? 8 : 7} align="center">Заказов не найдено</td>
              </tr>
            ) : (
              controls.items.map((item) => (
                <tr key={item.id}>
                  <td className="cell-nowrap"><code>{item.orderNumber}</code></td>
                  <td className="cell-nowrap">{item.orderDate}</td>
                  <td>{item.supplierName || '—'}</td>
                  <td><b>{item.title}</b></td>
                  <td className="cell-nowrap">{item.totalAmount.toLocaleString()} ₽</td>
                  <td>{displayPerson(item.createdByName, item.createdBy)}</td>
                  <td><StatusBadge status={item.status} /></td>
                  {canManage && (
                    <td>
                      <StatusActions
                        actions={getStatusActions('order', item.status)}
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
