import React, { useState, useEffect } from 'react';
import { directoryApi } from '../utils/api';
import { Department, LocationItem, Category, Supplier, InventoryAudit, User } from '../utils/types';
import { useAlert } from '../context/AlertContext';
import { FormField } from './FormField';

export const DirectoryTab: React.FC<{ user: User }> = ({ user }) => {
  const { showAlert, showApiError } = useAlert();

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

  const [depErrors, setDepErrors] = useState<Record<string, string>>({});
  const [catErrors, setCatErrors] = useState<Record<string, string>>({});
  const [supErrors, setSupErrors] = useState<Record<string, string>>({});
  const [auditErrors, setAuditErrors] = useState<Record<string, string>>({});

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
    } catch (e: any) {
      showApiError(e);
    }
  };

  useEffect(() => { loadData(); }, []);

  const addDep = async (e: React.FormEvent) => {
    e.preventDefault();

    const errs: Record<string, string> = {};
    if (!depCode.trim()) {
      errs.code = 'Укажите код подразделения';
    } else if (depCode.trim().length < 2) {
      errs.code = 'Код должен содержать минимум 2 символа';
    }
    if (!depName.trim()) {
      errs.name = 'Укажите название подразделения';
    } else if (depName.trim().length < 2) {
      errs.name = 'Название должно содержать минимум 2 символа';
    }

    setDepErrors(errs);
    if (Object.keys(errs).length > 0) return;

    try {
      await directoryApi.createDepartment({ name: depName.trim(), code: depCode.trim() });
      setDepName(''); setDepCode('');
      setDepErrors({});
      showAlert('Подразделение добавлено', 'success');
      loadData();
    } catch (e: any) {
      showApiError(e);
    }
  };

  const addCat = async (e: React.FormEvent) => {
    e.preventDefault();

    const errs: Record<string, string> = {};
    if (!catCode.trim()) {
      errs.code = 'Укажите код категории';
    } else if (catCode.trim().length < 2) {
      errs.code = 'Код должен содержать минимум 2 символа';
    }
    if (!catName.trim()) {
      errs.name = 'Укажите название категории';
    } else if (catName.trim().length < 2) {
      errs.name = 'Название должно содержать минимум 2 символа';
    }

    setCatErrors(errs);
    if (Object.keys(errs).length > 0) return;

    try {
      await directoryApi.createCategory({ name: catName.trim(), code: catCode.trim() });
      setCatName(''); setCatCode('');
      setCatErrors({});
      showAlert('Категория добавлена', 'success');
      loadData();
    } catch (e: any) {
      showApiError(e);
    }
  };

  const addSup = async (e: React.FormEvent) => {
    e.preventDefault();

    const errs: Record<string, string> = {};
    if (!supName.trim()) {
      errs.name = 'Укажите название организации';
    } else if (supName.trim().length < 2) {
      errs.name = 'Название должно содержать минимум 2 символа';
    }
    if (supInn.trim() && !/^\d{10}$|^\d{12}$/.test(supInn.trim())) {
      errs.inn = 'ИНН должен состоять из 10 или 12 цифр';
    }

    setSupErrors(errs);
    if (Object.keys(errs).length > 0) return;

    try {
      await directoryApi.createSupplier({ name: supName.trim(), inn: supInn.trim() || undefined });
      setSupName(''); setSupInn('');
      setSupErrors({});
      showAlert('Поставщик добавлен', 'success');
      loadData();
    } catch (e: any) {
      showApiError(e);
    }
  };

  const addAudit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!auditLocId) {
      setAuditErrors({ locationId: 'Выберите локацию для инвентаризации' });
      return;
    }

    try {
      await directoryApi.createAudit({ locationId: auditLocId });
      setAuditLocId(0);
      setAuditErrors({});
      showAlert('Акт инвентаризации создан', 'success');
      loadData();
    } catch (e: any) {
      showApiError(e);
    }
  };

  const finishAudit = async (id: number) => {
    try {
      await directoryApi.updateAuditStatus(id, 'Завершена', 'Проверено без замечаний');
      showAlert('Инвентаризация завершена', 'success');
      loadData();
    } catch (e: any) {
      showApiError(e);
    }
  };

  return (
    <div className="tab-container">
      <h2>Справочники и Инвентаризация (Аудит)</h2>

      {/* Аудиты */}
      <div className="card">
        <h3>Акты инвентаризации</h3>
        {canManage && (
          <form onSubmit={addAudit} className="form-row" noValidate>
            <FormField error={auditErrors.locationId}>
              <select
                value={auditLocId}
                onChange={(e) => {
                  setAuditLocId(Number(e.target.value));
                  if (auditErrors.locationId) setAuditErrors({});
                }}
              >
                <option value={0} disabled>Выберите локацию</option>
                {locations.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
              </select>
            </FormField>
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
            <form onSubmit={addDep} className="form-row" noValidate>
              <FormField error={depErrors.code}>
                <input
                  placeholder="Код"
                  value={depCode}
                  onChange={(e) => {
                    setDepCode(e.target.value);
                    if (depErrors.code) setDepErrors({ ...depErrors, code: '' });
                  }}
                />
              </FormField>
              <FormField error={depErrors.name}>
                <input
                  placeholder="Название"
                  value={depName}
                  onChange={(e) => {
                    setDepName(e.target.value);
                    if (depErrors.name) setDepErrors({ ...depErrors, name: '' });
                  }}
                />
              </FormField>
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
            <form onSubmit={addCat} className="form-row" noValidate>
              <FormField error={catErrors.code}>
                <input
                  placeholder="Код"
                  value={catCode}
                  onChange={(e) => {
                    setCatCode(e.target.value);
                    if (catErrors.code) setCatErrors({ ...catErrors, code: '' });
                  }}
                />
              </FormField>
              <FormField error={catErrors.name}>
                <input
                  placeholder="Название"
                  value={catName}
                  onChange={(e) => {
                    setCatName(e.target.value);
                    if (catErrors.name) setCatErrors({ ...catErrors, name: '' });
                  }}
                />
              </FormField>
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
            <form onSubmit={addSup} className="form-row" noValidate>
              <FormField error={supErrors.inn}>
                <input
                  placeholder="ИНН"
                  value={supInn}
                  onChange={(e) => {
                    setSupInn(e.target.value);
                    if (supErrors.inn) setSupErrors({ ...supErrors, inn: '' });
                  }}
                />
              </FormField>
              <FormField error={supErrors.name}>
                <input
                  placeholder="Название"
                  value={supName}
                  onChange={(e) => {
                    setSupName(e.target.value);
                    if (supErrors.name) setSupErrors({ ...supErrors, name: '' });
                  }}
                />
              </FormField>
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
