import React, { useState, useEffect } from 'react';
import { operationsApi, equipmentApi, directoryApi } from '../api';
import {
  MaintenanceLog, Transfer, PurchaseOrder, Equipment, LocationItem, Supplier, User,
  MaintenanceType, OrderStatus
} from '../types';
import { useAlert } from '../context/AlertContext';
import { FormField } from './ui/FormField';

export const OperationsTab: React.FC<{ user: User }> = ({ user }) => {
  const { showAlert, showApiError } = useAlert();

  const [subTab, setSubTab] = useState<'maintenance' | 'transfers' | 'orders'>('maintenance');

  const [maintenance, setMaintenance] = useState<MaintenanceLog[]>([]);
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);

  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);

  const canManage = user.role === 'manager' || user.role === 'admin';

  // Формы
  const [mForm, setMForm] = useState({ equipmentId: 0, maintenanceType: 'Плановое ТО' as MaintenanceType, cost: 0, description: '' });
  const [tForm, setTForm] = useState({ equipmentId: 0, toLocationId: 0, reason: '' });
  const [oForm, setOForm] = useState({ orderNumber: '', supplierId: 0, title: '', totalAmount: 0 });

  const [mErrors, setMErrors] = useState<Record<string, string>>({});
  const [tErrors, setTErrors] = useState<Record<string, string>>({});
  const [oErrors, setOErrors] = useState<Record<string, string>>({});

  const loadData = async () => {
    try {
      const [m, t, o, eq, loc, sup] = await Promise.all([
        operationsApi.getMaintenance(),
        operationsApi.getTransfers(),
        operationsApi.getOrders(),
        equipmentApi.getAll(),
        directoryApi.getLocations(),
        directoryApi.getSuppliers(),
      ]);
      setMaintenance(m);
      setTransfers(t);
      setOrders(o);
      setEquipment(eq);
      setLocations(loc);
      setSuppliers(sup);
    } catch (e: any) {
      showApiError(e);
    }
  };

  useEffect(() => { loadData(); }, []);

  const validateMaintenance = (): boolean => {
    const errs: Record<string, string> = {};

    if (!mForm.equipmentId) {
      errs.equipmentId = 'Выберите оборудование';
    }

    if (mForm.cost < 0) {
      errs.cost = 'Стоимость не может быть отрицательной';
    }

    if (mForm.description.length > 300) {
      errs.description = 'Описание не должно превышать 300 символов';
    }

    setMErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleCreateMaintenance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateMaintenance()) return;

    try {
      await operationsApi.createMaintenance({ ...mForm, status: 'В процессе' });
      setMForm({ equipmentId: 0, maintenanceType: 'Плановое ТО', cost: 0, description: '' });
      setMErrors({});
      showAlert('Запись ТО добавлена', 'success');
      loadData();
    } catch (err: any) {
      showApiError(err);
    }
  };

  const handleFinishMaintenance = async (id: number) => {
    try {
      await operationsApi.updateMaintenanceStatus(id, 'Завершено');
      showAlert('ТО завершено', 'success');
      loadData();
    } catch (err: any) {
      showApiError(err);
    }
  };

  const validateTransfer = (): boolean => {
    const errs: Record<string, string> = {};

    if (!tForm.equipmentId) {
      errs.equipmentId = 'Выберите оборудование';
    }

    if (!tForm.toLocationId) {
      errs.toLocationId = 'Выберите, куда переместить оборудование';
    }

    if (tForm.reason.length > 200) {
      errs.reason = 'Причина не должна превышать 200 символов';
    }

    setTErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleCreateTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateTransfer()) return;

    try {
      await operationsApi.createTransfer({ ...tForm, reason: tForm.reason.trim() });
      setTForm({ equipmentId: 0, toLocationId: 0, reason: '' });
      setTErrors({});
      showAlert('Перемещение оформлено', 'success');
      loadData();
    } catch (err: any) {
      showApiError(err);
    }
  };

  const validateOrder = (): boolean => {
    const errs: Record<string, string> = {};
    const orderNumber = oForm.orderNumber.trim();
    const title = oForm.title.trim();

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

    if (oForm.totalAmount < 0) {
      errs.totalAmount = 'Сумма не может быть отрицательной';
    }

    setOErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateOrder()) return;

    try {
      await operationsApi.createOrder({
        ...oForm,
        orderNumber: oForm.orderNumber.trim(),
        title: oForm.title.trim(),
        supplierId: oForm.supplierId || null,
        status: 'Согласован',
      });
      setOForm({ orderNumber: '', supplierId: 0, title: '', totalAmount: 0 });
      setOErrors({});
      showAlert('Заказ создан', 'success');
      loadData();
    } catch (err: any) {
      showApiError(err);
    }
  };

  const handleOrderStatus = async (id: number, status: OrderStatus) => {
    try {
      await operationsApi.updateOrderStatus(id, status);
      showAlert('Статус заказа обновлён', 'success');
      loadData();
    } catch (err: any) {
      showApiError(err);
    }
  };

  return (
    <div className="tab-container">
      <div className="sub-nav">
        <button className={subTab === 'maintenance' ? 'active' : ''} onClick={() => setSubTab('maintenance')}>ТО и Ремонт</button>
        <button className={subTab === 'transfers' ? 'active' : ''} onClick={() => setSubTab('transfers')}>Перемещения</button>
        <button className={subTab === 'orders' ? 'active' : ''} onClick={() => setSubTab('orders')}>Снабжение и Заказы</button>
      </div>

      {subTab === 'maintenance' && (
        <>
          {canManage && (
            <form onSubmit={handleCreateMaintenance} className="form-card" noValidate>
              <h3>Назначить ТО / Ремонт</h3>
              <div className="form-row">
                <FormField error={mErrors.equipmentId}>
                  <select
                    value={mForm.equipmentId}
                    onChange={(e) => {
                      setMForm({ ...mForm, equipmentId: Number(e.target.value) });
                      if (mErrors.equipmentId) setMErrors({ ...mErrors, equipmentId: '' });
                    }}
                  >
                    <option value={0} disabled>Выберите оборудование</option>
                    {equipment.map((e) => <option key={e.id} value={e.id}>{e.invNumber} ({e.name})</option>)}
                  </select>
                </FormField>

                <select value={mForm.maintenanceType} onChange={(e) => setMForm({ ...mForm, maintenanceType: e.target.value as MaintenanceType })}>
                  {['Плановое ТО', 'Аварийный ремонт', 'Калибровка/Поверка', 'Модернизация'].map((t) => <option key={t}>{t}</option>)}
                </select>

                <FormField error={mErrors.cost}>
                  <input
                    type="number"
                    placeholder="Стоимость, ₽"
                    value={mForm.cost}
                    onChange={(e) => {
                      setMForm({ ...mForm, cost: Number(e.target.value) });
                      if (mErrors.cost) setMErrors({ ...mErrors, cost: '' });
                    }}
                  />
                </FormField>

                <FormField error={mErrors.description}>
                  <input
                    placeholder="Описание работ"
                    value={mForm.description}
                    onChange={(e) => {
                      setMForm({ ...mForm, description: e.target.value });
                      if (mErrors.description) setMErrors({ ...mErrors, description: '' });
                    }}
                  />
                </FormField>

                <button type="submit" className="primary">Назначить</button>
              </div>
            </form>
          )}

          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Оборудование</th>
                <th>Вид работ</th>
                <th>Исполнитель</th>
                <th>Стоимость</th>
                <th>Дата</th>
                <th>Статус</th>
                {canManage && <th>Действия</th>}
              </tr>
            </thead>
            <tbody>
              {maintenance.map((m) => (
                <tr key={m.id}>
                  <td>{m.id}</td>
                  <td>{m.invNumber} ({m.equipmentName})</td>
                  <td>{m.maintenanceType}</td>
                  <td>{m.performer}</td>
                  <td>{m.cost.toLocaleString()} ₽</td>
                  <td>{m.startDate}</td>
                  <td><span className="badge">{m.status}</span></td>
                  {canManage && (
                    <td>
                      {m.status !== 'Завершено' ? (
                        <button onClick={() => handleFinishMaintenance(m.id)}>Завершить</button>
                      ) : '—'}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {subTab === 'transfers' && (
        <>
          {canManage && (
            <form onSubmit={handleCreateTransfer} className="form-card" noValidate>
              <h3>Оформить перемещение</h3>
              <div className="form-row">
                <FormField error={tErrors.equipmentId}>
                  <select
                    value={tForm.equipmentId}
                    onChange={(e) => {
                      setTForm({ ...tForm, equipmentId: Number(e.target.value) });
                      if (tErrors.equipmentId) setTErrors({ ...tErrors, equipmentId: '' });
                    }}
                  >
                    <option value={0} disabled>Выберите оборудование</option>
                    {equipment.map((e) => <option key={e.id} value={e.id}>{e.invNumber} ({e.name})</option>)}
                  </select>
                </FormField>

                <FormField error={tErrors.toLocationId}>
                  <select
                    value={tForm.toLocationId}
                    onChange={(e) => {
                      setTForm({ ...tForm, toLocationId: Number(e.target.value) });
                      if (tErrors.toLocationId) setTErrors({ ...tErrors, toLocationId: '' });
                    }}
                  >
                    <option value={0} disabled>Выберите локацию</option>
                    {locations.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
                  </select>
                </FormField>

                <FormField error={tErrors.reason}>
                  <input
                    placeholder="Причина / Приказ"
                    value={tForm.reason}
                    onChange={(e) => {
                      setTForm({ ...tForm, reason: e.target.value });
                      if (tErrors.reason) setTErrors({ ...tErrors, reason: '' });
                    }}
                  />
                </FormField>

                <button type="submit" className="primary">Переместить</button>
              </div>
            </form>
          )}

          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Дата</th>
                <th>Оборудование</th>
                <th>Откуда</th>
                <th>Куда</th>
                <th>Оформил</th>
                <th>Статус</th>
              </tr>
            </thead>
            <tbody>
              {transfers.map((t) => (
                <tr key={t.id}>
                  <td>TR-{t.id}</td>
                  <td>{t.transferDate}</td>
                  <td>{t.invNumber} ({t.equipmentName})</td>
                  <td>{t.fromLocationName || 'Склад'}</td>
                  <td><b>{t.toLocationName}</b></td>
                  <td>{t.transferredBy}</td>
                  <td><span className="badge">{t.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {subTab === 'orders' && (
        <>
          {canManage && (
            <form onSubmit={handleCreateOrder} className="form-card" noValidate>
              <h3>Создать заказ на закупку</h3>
              <div className="form-row">
                <FormField error={oErrors.orderNumber}>
                  <input
                    placeholder="Номер заказа"
                    value={oForm.orderNumber}
                    onChange={(e) => {
                      setOForm({ ...oForm, orderNumber: e.target.value });
                      if (oErrors.orderNumber) setOErrors({ ...oErrors, orderNumber: '' });
                    }}
                  />
                </FormField>

                <select value={oForm.supplierId} onChange={(e) => setOForm({ ...oForm, supplierId: Number(e.target.value) })}>
                  <option value={0}>Без поставщика</option>
                  {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>

                <FormField error={oErrors.title}>
                  <input
                    placeholder="Наименование"
                    value={oForm.title}
                    onChange={(e) => {
                      setOForm({ ...oForm, title: e.target.value });
                      if (oErrors.title) setOErrors({ ...oErrors, title: '' });
                    }}
                  />
                </FormField>

                <FormField error={oErrors.totalAmount}>
                  <input
                    type="number"
                    placeholder="Сумма, ₽"
                    value={oForm.totalAmount}
                    onChange={(e) => {
                      setOForm({ ...oForm, totalAmount: Number(e.target.value) });
                      if (oErrors.totalAmount) setOErrors({ ...oErrors, totalAmount: '' });
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
              {orders.map((o) => (
                <tr key={o.id}>
                  <td><code>{o.orderNumber}</code></td>
                  <td>{o.orderDate}</td>
                  <td>{o.supplierName || '—'}</td>
                  <td><b>{o.title}</b></td>
                  <td>{o.totalAmount.toLocaleString()} ₽</td>
                  <td>
                    {canManage ? (
                      <select value={o.status} onChange={(e) => handleOrderStatus(o.id, e.target.value as OrderStatus)}>
                        {['Черновик', 'Согласован', 'В доставке', 'Получен', 'Отменён'].map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    ) : <span className="badge">{o.status}</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
};
