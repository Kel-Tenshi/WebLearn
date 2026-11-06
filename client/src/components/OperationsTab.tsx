import React, { useState, useEffect } from 'react';
import { operationsApi, equipmentApi, directoryApi } from '../utils/api';
import {
  MaintenanceLog, Transfer, PurchaseOrder, Equipment, LocationItem, Supplier, User,
  MaintenanceType, OrderStatus
} from '../utils/types';

export const OperationsTab: React.FC<{ user: User }> = ({ user }) => {
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
      alert(e.message);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleCreateMaintenance = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await operationsApi.createMaintenance({ ...mForm, status: 'В процессе' });
      setMForm({ equipmentId: 0, maintenanceType: 'Плановое ТО', cost: 0, description: '' });
      loadData();
    } catch (err: any) { alert(err.message); }
  };

  const handleFinishMaintenance = async (id: number) => {
    try {
      await operationsApi.updateMaintenanceStatus(id, 'Завершено');
      loadData();
    } catch (err: any) { alert(err.message); }
  };

  const handleCreateTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await operationsApi.createTransfer(tForm);
      setTForm({ equipmentId: 0, toLocationId: 0, reason: '' });
      loadData();
    } catch (err: any) { alert(err.message); }
  };

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await operationsApi.createOrder({ ...oForm, supplierId: oForm.supplierId || null, status: 'Согласован' });
      setOForm({ orderNumber: '', supplierId: 0, title: '', totalAmount: 0 });
      loadData();
    } catch (err: any) { alert(err.message); }
  };

  const handleOrderStatus = async (id: number, status: OrderStatus) => {
    try {
      await operationsApi.updateOrderStatus(id, status);
      loadData();
    } catch (err: any) { alert(err.message); }
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
            <form onSubmit={handleCreateMaintenance} className="form-card">
              <h3>Назначить ТО / Ремонт</h3>
              <div className="form-row">
                <select value={mForm.equipmentId} onChange={(e) => setMForm({ ...mForm, equipmentId: Number(e.target.value) })} required>
                  <option value={0}>-- Оборудование --</option>
                  {equipment.map((e) => <option key={e.id} value={e.id}>{e.invNumber} ({e.name})</option>)}
                </select>
                <select value={mForm.maintenanceType} onChange={(e) => setMForm({ ...mForm, maintenanceType: e.target.value as MaintenanceType })}>
                  {['Плановое ТО', 'Аварийный ремонт', 'Калибровка/Поверка', 'Модернизация'].map((t) => <option key={t}>{t}</option>)}
                </select>
                <input type="number" placeholder="Стоимость, ₽" value={mForm.cost} onChange={(e) => setMForm({ ...mForm, cost: Number(e.target.value) })} />
                <input placeholder="Описание работ" value={mForm.description} onChange={(e) => setMForm({ ...mForm, description: e.target.value })} />
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
            <form onSubmit={handleCreateTransfer} className="form-card">
              <h3>Оформить перемещение</h3>
              <div className="form-row">
                <select value={tForm.equipmentId} onChange={(e) => setTForm({ ...tForm, equipmentId: Number(e.target.value) })} required>
                  <option value={0}>-- Оборудование --</option>
                  {equipment.map((e) => <option key={e.id} value={e.id}>{e.invNumber} ({e.name})</option>)}
                </select>
                <select value={tForm.toLocationId} onChange={(e) => setTForm({ ...tForm, toLocationId: Number(e.target.value) })} required>
                  <option value={0}>-- Куда переместить --</option>
                  {locations.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
                </select>
                <input placeholder="Причина / Приказ" value={tForm.reason} onChange={(e) => setTForm({ ...tForm, reason: e.target.value })} />
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
            <form onSubmit={handleCreateOrder} className="form-card">
              <h3>Создать заказ на закупку</h3>
              <div className="form-row">
                <input placeholder="Номер заказа" value={oForm.orderNumber} onChange={(e) => setOForm({ ...oForm, orderNumber: e.target.value })} required />
                <select value={oForm.supplierId} onChange={(e) => setOForm({ ...oForm, supplierId: Number(e.target.value) })}>
                  <option value={0}>-- Поставщик --</option>
                  {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
                <input placeholder="Наименование" value={oForm.title} onChange={(e) => setOForm({ ...oForm, title: e.target.value })} required />
                <input type="number" placeholder="Сумма, ₽" value={oForm.totalAmount} onChange={(e) => setOForm({ ...oForm, totalAmount: Number(e.target.value) })} />
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