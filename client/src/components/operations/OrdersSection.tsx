import React, { useState } from 'react';
import { OrderStatus, PurchaseOrder, Supplier } from '../../types';
import { FormField } from '../ui/FormField';

interface Props {
  items: PurchaseOrder[];
  suppliers: Supplier[];
  canManage: boolean;
  onCreate: (data: Partial<PurchaseOrder>) => Promise<void>;
  onStatusChange: (id: number, status: OrderStatus) => void;
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

const ORDER_STATUSES: OrderStatus[] = ['Черновик', 'Согласован', 'В доставке', 'Получен', 'Отменён'];

export const OrdersSection: React.FC<Props> = ({
  items,
  suppliers,
  canManage,
  onCreate,
  onStatusChange,
}) => {
  const [form, setForm] = useState<FormState>({ ...EMPTY_FORM });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    const orderNumber = form.orderNumber.trim();
    const title = form.title.trim();

    if (!orderNumber) {
      errs.orderNumber = 'Укажите номер заказа';
    } else if (orderNumber.length < 3) {
      errs.orderNumber = 'Номер заказа должен содержать минимум 3 символа';
    } else if (orderNumber.length > 30) {
      errs.orderNumber = 'Номер заказа не должен превышать 30 символов';
    }

    if (!title) {
      errs.title = 'Укажите назначение заказа';
    } else if (title.length < 3) {
      errs.title = 'Назначение должно содержать минимум 3 символа';
    } else if (title.length > 200) {
      errs.title = 'Назначение не должно превышать 200 символов';
    }

    if (form.totalAmount < 0) {
      errs.totalAmount = 'Сумма не может быть отрицательной';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await onCreate({
        ...form,
        orderNumber: form.orderNumber.trim(),
        title: form.title.trim(),
        supplierId: form.supplierId || null,
        status: 'Согласован',
      });
      setForm({ ...EMPTY_FORM });
      setErrors({});
    } catch {
      // Ошибку уже показал родительский компонент
    }
  };

  return (
    <>
      {canManage && (
        <form onSubmit={handleSubmit} className="form-card" noValidate>
          <h3>Создать заказ на закупку</h3>
          <div className="form-row">
            <FormField error={errors.orderNumber}>
              <input
                placeholder="Номер заказа"
                value={form.orderNumber}
                onChange={(e) => {
                  setForm({ ...form, orderNumber: e.target.value });
                  if (errors.orderNumber) setErrors({ ...errors, orderNumber: '' });
                }}
              />
            </FormField>

            <select
              value={form.supplierId}
              onChange={(e) => setForm({ ...form, supplierId: Number(e.target.value) })}
            >
              <option value={0}>Без поставщика</option>
              {suppliers.map((supplier) => (
                <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
              ))}
            </select>

            <FormField error={errors.title}>
              <input
                placeholder="Наименование"
                value={form.title}
                onChange={(e) => {
                  setForm({ ...form, title: e.target.value });
                  if (errors.title) setErrors({ ...errors, title: '' });
                }}
              />
            </FormField>

            <FormField error={errors.totalAmount}>
              <input
                type="number"
                placeholder="Сумма, ₽"
                value={form.totalAmount}
                onChange={(e) => {
                  setForm({ ...form, totalAmount: Number(e.target.value) });
                  if (errors.totalAmount) setErrors({ ...errors, totalAmount: '' });
                }}
              />
            </FormField>

            <button type="submit" className="primary">Создать заказ</button>
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
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td><code>{item.orderNumber}</code></td>
              <td>{item.orderDate}</td>
              <td>{item.supplierName || '—'}</td>
              <td><b>{item.title}</b></td>
              <td>{item.totalAmount.toLocaleString()} ₽</td>
              <td>
                {canManage ? (
                  <select
                    value={item.status}
                    onChange={(e) => onStatusChange(item.id, e.target.value as OrderStatus)}
                  >
                    {ORDER_STATUSES.map((status) => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                ) : <span className="badge">{item.status}</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
};
