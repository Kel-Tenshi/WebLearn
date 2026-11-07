import React, { useState } from 'react';
import { Supplier } from '../../types';
import { FormField } from '../ui/FormField';

interface Props {
  items: Supplier[];
  canManage: boolean;
  onCreate: (data: Partial<Supplier>) => Promise<void>;
}

export const SuppliersCard: React.FC<Props> = ({ items, canManage, onCreate }) => {
  const [name, setName] = useState('');
  const [inn, setInn] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const errs: Record<string, string> = {};
    if (!name.trim()) {
      errs.name = 'Укажите название организации';
    } else if (name.trim().length < 2) {
      errs.name = 'Название должно содержать минимум 2 символа';
    }
    if (inn.trim() && !/^\d{10}$|^\d{12}$/.test(inn.trim())) {
      errs.inn = 'ИНН должен состоять из 10 или 12 цифр';
    }

    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    try {
      await onCreate({ name: name.trim(), inn: inn.trim() || undefined });
      setName('');
      setInn('');
      setErrors({});
    } catch {
      // Ошибку уже показал родительский компонент
    }
  };

  return (
    <div className="card">
      <h4>Поставщики</h4>
      {canManage && (
        <form onSubmit={handleSubmit} className="form-row" noValidate>
          <FormField error={errors.inn}>
            <input
              placeholder="ИНН"
              value={inn}
              onChange={(e) => {
                setInn(e.target.value);
                if (errors.inn) setErrors({ ...errors, inn: '' });
              }}
            />
          </FormField>
          <FormField error={errors.name}>
            <input
              placeholder="Название"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors({ ...errors, name: '' });
              }}
            />
          </FormField>
          <button type="submit">+</button>
        </form>
      )}
      <ul>
        {items.map((item) => (
          <li key={item.id}>
            {item.name} {item.inn && `(ИНН: ${item.inn})`}
          </li>
        ))}
      </ul>
    </div>
  );
};
