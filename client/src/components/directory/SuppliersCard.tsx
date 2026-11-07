import React from 'react';
import { Supplier } from '../../types';
import { FormField } from '../ui/FormField';
import { useForm } from '../../hooks/useForm';
import { collect, minTextLength, requiredText } from '../../utils/validation';

interface Props {
  items: Supplier[];
  canManage: boolean;
  onCreate: (data: Partial<Supplier>) => Promise<void>;
}

interface FormState {
  name: string;
  inn: string;
}

const EMPTY_FORM: FormState = { name: '', inn: '' };

const validateSupplier = (values: FormState) =>
  collect({
    name:
      requiredText(values.name, 'Укажите название организации') ||
      minTextLength(values.name, 2, 'Название должно содержать минимум 2 символа'),
    inn:
      values.inn.trim() && !/^\d{10}$|^\d{12}$/.test(values.inn.trim())
        ? 'ИНН должен состоять из 10 или 12 цифр'
        : undefined,
  });

export const SuppliersCard: React.FC<Props> = ({ items, canManage, onCreate }) => {
  const { values, errors, submitting, setValue, reset, submit } =
    useForm<FormState>(EMPTY_FORM, validateSupplier);

  const handleSubmit = submit(async (current) => {
    try {
      await onCreate({
        name: current.name.trim(),
        inn: current.inn.trim() || undefined,
      });
      reset();
    } catch {
      // Ошибку уже показал родительский компонент
    }
  });

  return (
    <div className="card">
      <h4>Поставщики</h4>
      {canManage && (
        <form onSubmit={handleSubmit} className="form-row" noValidate>
          <FormField error={errors.inn}>
            <input
              placeholder="ИНН"
              value={values.inn}
              onChange={(e) => setValue('inn', e.target.value)}
            />
          </FormField>
          <FormField error={errors.name}>
            <input
              placeholder="Название"
              value={values.name}
              onChange={(e) => setValue('name', e.target.value)}
            />
          </FormField>
          <button type="submit" disabled={submitting}>+</button>
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
