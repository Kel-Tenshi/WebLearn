import React, { useState } from 'react';
import { Category } from '../../types';
import { FormField } from '../ui/FormField';

interface Props {
  items: Category[];
  canManage: boolean;
  onCreate: (data: { name: string; code: string }) => Promise<void>;
}

export const CategoriesCard: React.FC<Props> = ({ items, canManage, onCreate }) => {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const errs: Record<string, string> = {};
    if (!code.trim()) {
      errs.code = 'Укажите код категории';
    } else if (code.trim().length < 2) {
      errs.code = 'Код должен содержать минимум 2 символа';
    }
    if (!name.trim()) {
      errs.name = 'Укажите название категории';
    } else if (name.trim().length < 2) {
      errs.name = 'Название должно содержать минимум 2 символа';
    }

    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    try {
      await onCreate({ name: name.trim(), code: code.trim() });
      setName('');
      setCode('');
      setErrors({});
    } catch {
      // Ошибку уже показал родительский компонент
    }
  };

  return (
    <div className="card">
      <h4>Категории оборудования</h4>
      {canManage && (
        <form onSubmit={handleSubmit} className="form-row" noValidate>
          <FormField error={errors.code}>
            <input
              placeholder="Код"
              value={code}
              onChange={(e) => {
                setCode(e.target.value);
                if (errors.code) setErrors({ ...errors, code: '' });
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
          <li key={item.id}><code>{item.code}</code> — {item.name}</li>
        ))}
      </ul>
    </div>
  );
};
