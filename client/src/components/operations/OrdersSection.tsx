import React from 'react';
import { PurchaseOrder, Supplier } from '../../types';
import { FormField } from '../ui/FormField';
import { StatusBadge } from '../ui/StatusBadge';
import { StatusActions } from '../ui/StatusActions';
import { useForm } from '../../hooks/useForm';
import {
  collect,
  maxTextLength,
  minTextLength,
  nonNegativeNumber,
  requiredText,
} from '../../utils/validation';
import { getStatusActions } from '../../config/statusMachine';

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
            <FormField error={errors.orderNumber}>
              <input
                placeholder="Номер заказа"
                value={values.orderNumber}
                onChange={(e) => setValue('orderNumber', e.target.value)}
              />
            </FormField>

            <select
              value={values.supplierId}
              onChange={(e) => setValue('supplierId', Number(e.target.value))}
            >
              <option value={0}>Без поставщика</option>
              {suppliers.map((supplier) => (
                <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
              ))}
            </select>

            <FormField error={errors.title}>
              <input
                placeholder="Наименование"
                value={values.title}
                onChange={(e) => setValue('title', e.target.value)}
              />
            </FormField>

            <FormField error={errors.totalAmount}>
              <input
                type="number"
                placeholder="Сумма, ₽"
                value={values.totalAmount}
                onChange={(e) => setValue('totalAmount', Number(e.target.value))}
              />
            </FormField>

            <button type="submit" className="primary" disabled={submitting}>Создать заказ</button>
          </div>
        </form>
      )}

      <table className="data-table">
        <thead>
          <tr>
            <th>Номер</th>
            <th>Дата</th>
            <th>Поставщик</th>
            <th>Наименование</th>
            <th>Сумма</th>
            <th>Статус</th>
            {canManage && <th>Действия</th>}
          </tr>
        </thead>
        <tbody>
          {items.length === 0 ? (
            <tr>
              <td colSpan={canManage ? 7 : 6} align="center">Заказов пока нет</td>
            </tr>
          ) : (
            items.map((item) => (
              <tr key={item.id}>
                <td><code>{item.orderNumber}</code></td>
                <td>{item.orderDate}</td>
                <td>{item.supplierName || '—'}</td>
                <td><b>{item.title}</b></td>
                <td>{item.totalAmount.toLocaleString()} ₽</td>
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
    </>
  );
};
