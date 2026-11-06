import React, { useState, useEffect } from 'react';
import { directoryApi } from '../utils/api';
import { Department, LocationItem, Category, Supplier, InventoryAudit, User } from '../utils/types';

export const DirectoryTab: React.FC<{ user: User }> = ({ user }) => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [audits, setAudits] = useState<InventoryAudit[]>([]);

  const [depName, setDepName] = useState('');
  const [depCode, setDepCode] = useState('');
  const [catName, setCatName] = useState('');
  const [catCode, setCatCode] = useState('');
  const [supName, setSupName] = useState('');
  const [supInn, setSupInn] = useState('');
  const [auditLocId, setAuditLocId] = useState(0);

  const canManage = user.role === 'manager' || user.role === 'admin';

  const loadData = async () => {
    try {
      const [d, l, c, s, a] = await Promise.all([
        directoryApi.getDepartments(),
        directoryApi.getLocations(),
        directoryApi.getCategories(),
        directoryApi.getSuppliers(),
        directoryApi.getAudits(),
      ]);
      setDepartments(d);
      setLocations(l);
      setCategories(c);
      setSuppliers(s);
      setAudits(a);
    } catch (e: any) { alert(e.message); }
  };

  useEffect(() => { loadData(); }, []);

  const addDep = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await directoryApi.createDepartment({ name: depName, code: depCode });
      setDepName(''); setDepCode('');
      loadData();
    } catch (e: any) { alert(e.message); }
  };

  const addCat = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await directoryApi.createCategory({ name: catName, code: catCode });
      setCatName(''); setCatCode('');
      loadData();
    } catch (e: any) { alert(e.message); }
  };

  const addSup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await directoryApi.createSupplier({ name: supName, inn: supInn });
      setSupName(''); setSupInn('');
      loadData();
    } catch (e: any) { alert(e.message); }
  };

  const addAudit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auditLocId) {
      alert('Выберите локацию для инвентаризации');
      return;
    }
    try {
      await directoryApi.createAudit({ locationId: auditLocId });
      setAuditLocId(0);
      loadData();
    } catch (e: any) { alert(e.message); }
  };

  const finishAudit = async (id: number) => {
    try {
      await directoryApi.updateAuditStatus(id, 'Завершена', 'Проверено без замечаний');
      loadData();
    } catch (e: any) { alert(e.message); }
  };

  return (
    <div className="tab-container">
      <h2>Справочники и Инвентаризация (Аудит)</h2>

      {/* Аудиты */}
      <div className="card">
        <h3>Акты инвентаризации</h3>
        {canManage && (
          <form onSubmit={addAudit} className="form-row">
            <select value={auditLocId} onChange={(e) => setAuditLocId(Number(e.target.value))} required>
              <option value="">-- Выберите локацию --</option>
              {locations.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
            </select>
            <button type="submit" className="primary">Начать ревизию</button>
          </form>
        )}
        <table className="data-table">
          <thead>
            <tr><th>ID</th><th>Дата</th><th>Локация</th><th>Аудитор</th><th>Статус</th><th>Действия</th></tr>
          </thead>
          <tbody>
            {audits.map((a) => (
              <tr key={a.id}>
                <td>{a.id}</td><td>{a.auditDate}</td><td>{a.locationName}</td><td>{a.auditor}</td>
                <td><span className="badge">{a.status}</span></td>
                <td>
                  {canManage && a.status === 'В процессе' && (
                    <button onClick={() => finishAudit(a.id)}>Завершить</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid-3">
        {/* Подразделения */}
        <div className="card">
          <h4>Подразделения</h4>
          {canManage && (
            <form onSubmit={addDep} className="form-row">
              <input placeholder="Код" value={depCode} onChange={(e) => setDepCode(e.target.value)} required />
              <input placeholder="Название" value={depName} onChange={(e) => setDepName(e.target.value)} required />
              <button type="submit">+</button>
            </form>
          )}
          <ul>
            {departments.map((d) => <li key={d.id}><code>{d.code}</code> — {d.name}</li>)}
          </ul>
        </div>

        {/* Категории */}
        <div className="card">
          <h4>Категории оборудования</h4>
          {canManage && (
            <form onSubmit={addCat} className="form-row">
              <input placeholder="Код" value={catCode} onChange={(e) => setCatCode(e.target.value)} required />
              <input placeholder="Название" value={catName} onChange={(e) => setCatName(e.target.value)} required />
              <button type="submit">+</button>
            </form>
          )}
          <ul>
            {categories.map((c) => <li key={c.id}><code>{c.code}</code> — {c.name}</li>)}
          </ul>
        </div>

        {/* Поставщики */}
        <div className="card">
          <h4>Поставщики</h4>
          {canManage && (
            <form onSubmit={addSup} className="form-row">
              <input placeholder="ИНН" value={supInn} onChange={(e) => setSupInn(e.target.value)} />
              <input placeholder="Название" value={supName} onChange={(e) => setSupName(e.target.value)} required />
              <button type="submit">+</button>
            </form>
          )}
          <ul>
            {suppliers.map((s) => <li key={s.id}>{s.name} {s.inn && `(ИНН: ${s.inn})`}</li>)}
          </ul>
        </div>
      </div>
    </div>
  );
};